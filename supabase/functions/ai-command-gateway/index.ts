import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-signature, x-timestamp',
};

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

// CIA-Level Security Functions
async function verifyHMACSignature(body: string, signature: string, timestamp: string): Promise<boolean> {
  try {
    // Check timestamp freshness (prevent replay attacks)
    const requestTime = parseInt(timestamp);
    const currentTime = Date.now();
    const timeDiff = Math.abs(currentTime - requestTime);
    
    // Reject requests older than 5 minutes
    if (timeDiff > 5 * 60 * 1000) {
      console.warn('Request timestamp too old:', timeDiff);
      return false;
    }

    // Create expected signature
    const payload = timestamp + body;
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
    
    return signature === expectedHex;
  } catch (error) {
    console.error('HMAC verification error:', error);
    return false;
  }
}

async function sanitizeAndValidateCommand(command: string): Promise<{valid: boolean, sanitized: string, risk_level: string}> {
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
        command_text: request.command,
        source_ai: request.source_ai,
        session_id: request.session_id || 'anonymous',
        priority: request.priority,
        status: response.status,
        security_level: response.security_status,
        response_data: response.result || {},
        execution_metadata: {
          ...metadata,
          timestamp: new Date().toISOString(),
          hmac_verified: response.security_status === 'verified'
        }
      });
  } catch (error) {
    console.error('Failed to log AI interaction:', error);
  }
}

async function queueCommand(request: AICommandRequest, commandId: string): Promise<CommandResponse> {
  try {
    const { valid, sanitized, risk_level } = await sanitizeAndValidateCommand(request.command);
    
    if (!valid) {
      return {
        success: false,
        command_id: commandId,
        status: 'failed',
        message: 'Invalid command format or content blocked by security filters',
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

async function processQueuedCommand(commandId: string, command: string, request: AICommandRequest) {
  // Parse the natural language command and route to appropriate automation
  try {
    // Use our existing orchestrator to handle the command
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
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  const commandId = crypto.randomUUID();

  try {
    console.log('AI Command Gateway called');

    // Extract headers for security verification
    const signature = req.headers.get('x-signature');
    const timestamp = req.headers.get('x-timestamp');
    
    const rawBody = await req.text();
    let requestBody: AICommandRequest;
    
    try {
      requestBody = JSON.parse(rawBody);
    } catch {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid JSON in request body',
          security_status: 'blocked'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // CIA-Level Security: HMAC Signature Verification
    let securityStatus: 'verified' | 'warning' | 'blocked' = 'warning';
    
    if (signature && timestamp) {
      const isValidSignature = await verifyHMACSignature(rawBody, signature, timestamp);
      if (isValidSignature) {
        securityStatus = 'verified';
      } else {
        securityStatus = 'blocked';
        console.warn('Invalid HMAC signature detected');
        
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
      // Allow for development, but log warning
      console.warn('No HMAC signature provided - allowing in development mode');
      securityStatus = 'warning';
    }

    // Validate required fields
    if (!requestBody.command || !requestBody.source_ai) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required fields: command and source_ai',
          security_status: securityStatus
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
      ip_address: req.headers.get('x-forwarded-for') || 'unknown'
    });

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