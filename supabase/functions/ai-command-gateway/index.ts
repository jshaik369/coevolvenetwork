
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

function getCorsHeaders() {
  const allowedOrigins = Deno.env.get('AI_GATEWAY_CORS_ORIGINS') || '*';
  return {
    'Access-Control-Allow-Origin': allowedOrigins,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-signature, x-timestamp, x-nonce',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Content-Security-Policy': "default-src 'none'; script-src 'none'; object-src 'none';",
  };
}

function extractClientIP(req: Request): string | null {
  // Check various headers for client IP
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    // Take the first IP in the chain (original client)
    const firstIP = forwardedFor.split(',')[0].trim();
    // Validate IP format to prevent inet parsing errors
    if (isValidIP(firstIP)) {
      return firstIP;
    }
  }
  
  const realIP = req.headers.get('x-real-ip');
  if (realIP && isValidIP(realIP.trim())) {
    return realIP.trim();
  }
  
  const clientIP = req.headers.get('x-client-ip');
  if (clientIP && isValidIP(clientIP.trim())) {
    return clientIP.trim();
  }
  
  return null;
}

function isValidIP(ip: string): boolean {
  // Basic IP validation for IPv4 and IPv6
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
}

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const hmacSecret = Deno.env.get('AI_GATEWAY_HMAC_SECRET') || 'development-secret-change-in-production';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface AICommandRequest {
  command: string;
  source_ai: 'perplexity' | 'gemini' | 'gpt' | 'claude' | 'other';
  session_id?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  metadata?: Record<string, any>;
  dry_run?: boolean;
}

interface CommandResponse {
  success: boolean;
  command_id: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  message: string;
  result?: any;
  security_status: 'verified' | 'warning' | 'blocked';
}

interface CircuitBreaker {
  failureCount: number;
  lastFailureTime: number;
  state: 'closed' | 'open' | 'half-open';
}

const circuitBreaker: CircuitBreaker = {
  failureCount: 0,
  lastFailureTime: 0,
  state: 'closed'
};

const CIRCUIT_BREAKER_THRESHOLD = 50;
const CIRCUIT_BREAKER_TIMEOUT = 60000; // 1 minute
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100;
const TIMESTAMP_MAX_AGE = 30000; // 30 seconds

async function logSecurityEvent(eventType: string, severity: 'info' | 'warning' | 'error' | 'critical', message: string, context: any = {}, ip?: string | null, userAgent?: string) {
  try {
    await supabase
      .from('security_events')
      .insert({
        event_type: eventType,
        severity,
        message,
        context,
        ip: ip || null,
        user_agent: userAgent
      });
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
}

async function checkCircuitBreaker(): Promise<boolean> {
  const now = Date.now();
  
  if (circuitBreaker.state === 'open') {
    if (now - circuitBreaker.lastFailureTime > CIRCUIT_BREAKER_TIMEOUT) {
      circuitBreaker.state = 'half-open';
      circuitBreaker.failureCount = 0;
    } else {
      return false; // Circuit is open, reject request
    }
  }
  
  return true;
}

function recordCircuitBreakerSuccess() {
  circuitBreaker.failureCount = 0;
  circuitBreaker.state = 'closed';
}

function recordCircuitBreakerFailure() {
  circuitBreaker.failureCount++;
  circuitBreaker.lastFailureTime = Date.now();
  
  if (circuitBreaker.failureCount >= CIRCUIT_BREAKER_THRESHOLD) {
    circuitBreaker.state = 'open';
  }
}

async function checkRateLimit(ip: string | null): Promise<{ allowed: boolean; requestCount: number }> {
  if (!ip) {
    // Allow requests without IP but log it
    console.warn('Rate limit check skipped - no IP available');
    return { allowed: true, requestCount: 0 };
  }

  const now = new Date();
  const windowStart = new Date(Math.floor(now.getTime() / RATE_LIMIT_WINDOW) * RATE_LIMIT_WINDOW);
  
  try {
    // Get or create rate limit record for this IP and window
    const { data: existing, error: selectError } = await supabase
      .from('api_rate_limits')
      .select('*')
      .eq('ip', ip)
      .eq('window_start', windowStart.toISOString())
      .single();
    
    if (selectError && selectError.code !== 'PGRST116') {
      throw selectError;
    }
    
    if (existing) {
      // Update existing record
      const newCount = existing.request_count + 1;
      
      await supabase
        .from('api_rate_limits')
        .update({
          request_count: newCount,
          last_request_at: now.toISOString()
        })
        .eq('id', existing.id);
      
      return {
        allowed: newCount <= RATE_LIMIT_MAX_REQUESTS,
        requestCount: newCount
      };
    } else {
      // Create new record
      await supabase
        .from('api_rate_limits')
        .insert({
          ip,
          window_start: windowStart.toISOString(),
          request_count: 1,
          last_request_at: now.toISOString()
        });
      
      return { allowed: true, requestCount: 1 };
    }
  } catch (error) {
    console.error('Rate limiting error:', error);
    // Fail open for availability, but log the issue
    return { allowed: true, requestCount: 0 };
  }
}

async function checkAndStoreNonce(nonce: string, signature: string, timestamp: string, ip: string | null, userAgent: string): Promise<boolean> {
  try {
    // Check if nonce already exists
    const { data: existing } = await supabase
      .from('ai_request_nonces')
      .select('nonce')
      .eq('nonce', nonce)
      .single();
    
    if (existing) {
      await logSecurityEvent('replay_attack_detected', 'critical', 'Duplicate nonce detected - potential replay attack', { nonce, ip }, ip, userAgent);
      return false; // Nonce already used
    }
    
    // Store the nonce (handle null IP safely)
    const { error } = await supabase
      .from('ai_request_nonces')
      .insert({
        nonce,
        signature,
        request_timestamp: parseInt(timestamp),
        ip: ip || null,
        user_agent: userAgent,
        used_at: new Date().toISOString()
      });
    
    if (error) {
      console.error('Failed to store nonce:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Nonce checking error:', error);
    return false;
  }
}

async function verifyHMACSignature(body: string, signature: string, timestamp: string, nonce?: string): Promise<boolean> {
  try {
    // Check timestamp freshness (prevent replay attacks)
    const requestTime = parseInt(timestamp);
    const currentTime = Date.now();
    const timeDiff = Math.abs(currentTime - requestTime);
    
    // Reject requests older than 30 seconds
    if (timeDiff > TIMESTAMP_MAX_AGE) {
      console.warn('Request timestamp too old:', timeDiff);
      return false;
    }

    // Create expected signature with nonce if provided
    const payload = nonce ? `${timestamp}${nonce}${body}` : `${timestamp}${body}`;
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(hmacSecret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const expectedSignature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
    const expectedHex = Array.from(new Uint8Array(expectedSignature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    // Use constant-time comparison to prevent timing attacks
    if (signature.length !== expectedHex.length) {
      return false;
    }
    
    let result = 0;
    for (let i = 0; i < signature.length; i++) {
      result |= signature.charCodeAt(i) ^ expectedHex.charCodeAt(i);
    }
    
    return result === 0;
  } catch (error) {
    console.error('HMAC verification error:', error);
    return false;
  }
}

function detectPromptInjection(text: string): { isInjection: boolean; confidence: number; patterns: string[] } {
  const injectionPatterns = [
    // Direct instruction overrides
    /(?:ignore|forget|disregard).*(?:previous|above|prior).*(?:instruction|prompt|command)/i,
    /(?:system|admin|root).*(?:override|bypass|disable)/i,
    /(?:execute|run|eval|call).*(?:code|script|function|command)/i,
    
    // Common injection markers
    /(?:\/\*|\*\/|<!--|\-\->|#|\/\/)/,
    /(?:\$\{|\{\{|\}\}|\$\(|\))/,
    
    // Dangerous commands
    /(?:rm\s+\-rf|del\s+\/|format\s+c:|shutdown|reboot)/i,
    /(?:drop\s+table|delete\s+from|truncate|alter\s+table)/i,
    
    // Encoding attempts
    /(?:%[0-9a-f]{2}|\\x[0-9a-f]{2}|\\u[0-9a-f]{4}){3,}/i,
    
    // Role manipulation
    /(?:you\s+are\s+now|from\s+now\s+on|new\s+role|act\s+as)/i,
  ];
  
  const foundPatterns: string[] = [];
  let confidence = 0;
  
  for (const pattern of injectionPatterns) {
    if (pattern.test(text)) {
      foundPatterns.push(pattern.source);
      confidence += 0.3;
    }
  }
  
  // Additional heuristics
  if (text.length > 1000) confidence += 0.1;
  if (/[<>\"'`]/g.test(text)) confidence += 0.1;
  if (/\b(?:eval|exec|system|shell)\b/i.test(text)) confidence += 0.4;
  
  return {
    isInjection: confidence > 0.5,
    confidence: Math.min(confidence, 1.0),
    patterns: foundPatterns
  };
}

async function sanitizeAndValidateCommand(command: string): Promise<{valid: boolean, sanitized: string, risk_level: string, injection_detected?: boolean}> {
  // Detect prompt injection first
  const injectionResult = detectPromptInjection(command);
  
  if (injectionResult.isInjection) {
    return {
      valid: false,
      sanitized: '',
      risk_level: 'critical',
      injection_detected: true
    };
  }
  
  // Remove potentially dangerous characters
  const sanitized = command
    .replace(/[<>\"'`;]/g, '') // Remove XSS-prone characters
    .replace(/\b(drop|delete|truncate|alter)\b/gi, '') // Remove dangerous SQL keywords
    .trim()
    .substring(0, 500); // Limit length

  // Calculate risk level based on content
  let risk_level = 'low';
  
  const sensitivePatterns = [
    /password|secret|key|token/i,
    /admin|sudo|root/i,
    /delete|remove|destroy/i,
    /system|database|server/i
  ];

  const highRiskPatterns = [
    /urgent|immediate|emergency/i,
    /financial|payment|transaction/i,
    /private|confidential|classified/i
  ];

  if (sensitivePatterns.some(pattern => pattern.test(command))) {
    risk_level = 'medium';
  }
  
  if (highRiskPatterns.some(pattern => pattern.test(command))) {
    risk_level = 'high';
  }

  const valid = sanitized.length > 0 && sanitized.length <= 500;
  
  return { valid, sanitized, risk_level };
}

async function logAIInteraction(request: AICommandRequest, response: CommandResponse, metadata: any = {}) {
  try {
    await supabase
      .from('ai_messages')
      .insert({
        message: request.command,
        source: request.source_ai,
        session_id: request.session_id || 'anonymous',
        role: 'gateway',
        metadata: {
          priority: request.priority,
          status: response.status,
          security_level: response.security_status,
          response_data: response.result || {},
          execution_metadata: {
            ...metadata,
            timestamp: new Date().toISOString(),
            hmac_verified: response.security_status === 'verified'
          }
        },
        security_status: response.security_status,
        status: response.status
      });
  } catch (error) {
    console.error('Failed to log AI interaction:', error);
  }
}

async function queueCommand(request: AICommandRequest, commandId: string): Promise<CommandResponse> {
  try {
    const { valid, sanitized, risk_level, injection_detected } = await sanitizeAndValidateCommand(request.command);
    
    if (!valid || injection_detected) {
      return {
        success: false,
        command_id: commandId,
        status: 'failed',
        message: injection_detected ? 'Command blocked: Prompt injection detected' : 'Invalid command format or content blocked by security filters',
        security_status: 'blocked'
      };
    }

    // Queue the command for processing
    const { error: queueError } = await supabase
      .from('ai_command_queue')
      .insert({
        id: commandId,
        command_text: sanitized,
        source_ai: request.source_ai,
        session_id: request.session_id || 'anonymous',
        priority: request.priority,
        risk_level,
        metadata: request.metadata || {},
        dry_run: request.dry_run || false,
        status: 'queued'
      });

    if (queueError) {
      throw queueError;
    }

    // For high-priority commands, attempt immediate processing
    if (request.priority === 'urgent' || request.priority === 'high') {
      try {
        const processResult = await processQueuedCommand(commandId, sanitized, request);
        return {
          success: true,
          command_id: commandId,
          status: 'completed',
          message: 'Command processed immediately due to high priority',
          result: processResult,
          security_status: 'verified'
        };
      } catch (processError) {
        console.warn('Immediate processing failed, will retry later:', processError);
      }
    }

    return {
      success: true,
      command_id: commandId,
      status: 'queued',
      message: `Command queued for processing (risk level: ${risk_level})`,
      security_status: 'verified'
    };

  } catch (error: any) {
    console.error('Error queueing command:', error);
    return {
      success: false,
      command_id: commandId,
      status: 'failed',
      message: `Failed to queue command: ${error.message}`,
      security_status: 'warning'
    };
  }
}

function normalizeRequestFormat(body: any): AICommandRequest {
  // Handle different input formats
  if (body.action && !body.command) {
    body.command = body.action;
    delete body.action;
  }
  
  if (body.source && !body.source_ai) {
    body.source_ai = body.source;
    delete body.source;
  }
  
  // Set defaults
  body.priority = body.priority || 'normal';
  body.dry_run = body.dry_run || false;
  
  return body as AICommandRequest;
}

async function processQueuedCommand(commandId: string, command: string, request: AICommandRequest) {
  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/automation-orchestrator`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`,
      },
      body: JSON.stringify({
        action: 'ai_command',
        command,
        source_ai: request.source_ai,
        metadata: request.metadata,
        dry_run: request.dry_run
      })
    });

    if (!response.ok) {
      throw new Error(`Orchestrator responded with status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Command processing error:', error);
    throw error;
  }
}

serve(async (req) => {
  const url = new URL(req.url);
  const ip = extractClientIP(req);
  const userAgent = req.headers.get('user-agent') || 'unknown';
  const corsHeaders = getCorsHeaders();

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Health check endpoint
  if (req.method === 'GET' && url.pathname === '/health') {
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      circuit_breaker: {
        state: circuitBreaker.state,
        failure_count: circuitBreaker.failureCount,
        last_failure: circuitBreaker.lastFailureTime
      },
      rate_limits: {
        window_ms: RATE_LIMIT_WINDOW,
        max_requests: RATE_LIMIT_MAX_REQUESTS
      },
      security: {
        hmac_enabled: !!hmacSecret,
        timestamp_max_age: TIMESTAMP_MAX_AGE,
        prompt_injection_enabled: true
      }
    };

    return new Response(JSON.stringify(healthStatus, null, 2), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  const startTime = Date.now();
  const commandId = crypto.randomUUID();

  try {
    console.log('AI Command Gateway called', { ip, userAgent, commandId });

    // Circuit breaker check
    if (!await checkCircuitBreaker()) {
      await logSecurityEvent('circuit_breaker_open', 'warning', 'Request rejected - circuit breaker is open', {}, ip, userAgent);
      return new Response(
        JSON.stringify({ 
          error: 'Service temporarily unavailable - circuit breaker is open',
          security_status: 'blocked',
          command_id: commandId
        }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Rate limiting check
    const rateLimitResult = await checkRateLimit(ip);
    if (!rateLimitResult.allowed) {
      await logSecurityEvent('rate_limit_exceeded', 'warning', `Rate limit exceeded for IP ${ip}`, { requestCount: rateLimitResult.requestCount }, ip, userAgent);
      return new Response(
        JSON.stringify({ 
          error: `Rate limit exceeded. Maximum ${RATE_LIMIT_MAX_REQUESTS} requests per minute.`,
          security_status: 'blocked',
          command_id: commandId
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract headers for security verification
    const signature = req.headers.get('x-signature');
    const timestamp = req.headers.get('x-timestamp');
    const nonce = req.headers.get('x-nonce');
    
    const rawBody = await req.text();
    let requestBody: AICommandRequest;
    
    try {
      requestBody = JSON.parse(rawBody);
      requestBody = normalizeRequestFormat(requestBody);
    } catch {
      await logSecurityEvent('invalid_json', 'warning', 'Invalid JSON in request body', {}, ip, userAgent);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid JSON in request body. Expected format: {"command": "your command", "source_ai": "your_ai"}',
          security_status: 'blocked',
          example: {
            command: "backup all data to drive",
            source_ai: "perplexity",
            priority: "normal"
          }
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // HMAC Signature Verification with timing-safe comparison
    let securityStatus: 'verified' | 'warning' | 'blocked' = 'warning';
    
    if (signature && timestamp) {
      // Check and store nonce if provided
      if (nonce) {
        const nonceValid = await checkAndStoreNonce(nonce, signature, timestamp, ip, userAgent);
        if (!nonceValid) {
          return new Response(
            JSON.stringify({ 
              error: 'Invalid nonce - request blocked by security policy',
              security_status: 'blocked',
              command_id: commandId
            }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
      
      const isValidSignature = await verifyHMACSignature(rawBody, signature, timestamp, nonce);
      if (isValidSignature) {
        securityStatus = 'verified';
      } else {
        securityStatus = 'blocked';
        await logSecurityEvent('invalid_hmac', 'critical', 'Invalid HMAC signature detected', { signature: signature.substring(0, 8) + '...' }, ip, userAgent);
        
        return new Response(
          JSON.stringify({ 
            error: 'Invalid signature - request blocked by security policy',
            security_status: 'blocked',
            command_id: commandId
          }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else {
      console.warn('No HMAC signature provided - allowing in development mode');
      await logSecurityEvent('no_hmac_signature', 'warning', 'Request without HMAC signature processed', {}, ip, userAgent);
      securityStatus = 'warning';
    }

    // Validate required fields
    if (!requestBody.command || !requestBody.source_ai) {
      await logSecurityEvent('missing_required_fields', 'warning', 'Request missing required fields', { receivedFields: Object.keys(requestBody) }, ip, userAgent);
      return new Response(
        JSON.stringify({ 
          error: 'Missing required fields',
          security_status: securityStatus,
          required_fields: ['command', 'source_ai'],
          received_fields: Object.keys(requestBody),
          example: {
            command: "backup all data to drive",
            source_ai: "perplexity",
            priority: "normal"
          },
          help: "See /operator-guide for integration examples"
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Queue and process the command
    const response = await queueCommand(requestBody, commandId);
    response.security_status = securityStatus;

    // Log the interaction for audit trail
    await logAIInteraction(requestBody, response, {
      processing_time_ms: Date.now() - startTime,
      hmac_provided: !!signature,
      ip_address: ip,
      rate_limit_count: rateLimitResult.requestCount
    });

    // Record circuit breaker success
    recordCircuitBreakerSuccess();

    return new Response(
      JSON.stringify(response),
      { 
        status: response.success ? 200 : 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error: any) {
    const executionTime = Date.now() - startTime;
    console.error('Error in AI Command Gateway:', error);
    
    // Record circuit breaker failure
    recordCircuitBreakerFailure();
    
    // Log the error for security monitoring
    try {
      await supabase
        .from('automation_logs')
        .insert({
          execution_id: commandId,
          status: 'failed',
          message: `AI Gateway error: ${error.message}`,
          metadata: { 
            error: error.message, 
            stack: error.stack,
            execution_time_ms: executionTime
          },
          log_level: 'error'
        });

      await logSecurityEvent('gateway_error', 'error', 'Unhandled error in gateway', { error: error.message }, ip, userAgent);
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }

    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        command_id: commandId,
        security_status: 'warning'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
