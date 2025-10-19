import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const googleServiceAccountKey = Deno.env.get('GOOGLE_WORKSPACE_SERVICE_ACCOUNT_KEY')!;
const googleWorkspaceAdminEmail = Deno.env.get('GOOGLE_WORKSPACE_ADMIN_EMAIL')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface GmailProcessRequest {
  maxResults?: number;
  query?: string;
  dryRun?: boolean;
  processingType?: 'new_messages' | 'lead_scoring' | 'full_scan';
}

interface GmailMessage {
  id: string;
  threadId: string;
  snippet: string;
  payload: {
    headers: { name: string; value: string }[];
  };
  internalDate: string;
}

interface ProcessedMessage {
  messageId: string;
  threadId: string;
  senderEmail: string;
  senderName?: string;
  subject: string;
  snippet: string;
  timestamp: string;
  leadScore: number;
  classification: 'lead' | 'customer' | 'vendor' | 'internal' | 'spam' | 'unclassified';
  hasAttachments: boolean;
  labels: string[];
}

async function logExecution(
  jobId: string | null,
  executionId: string,
  status: 'started' | 'completed' | 'failed',
  message: string,
  metadata: any = {},
  executionTime?: number
) {
  try {
    const { error } = await supabase
      .from('automation_logs')
      .insert({
        job_id: jobId,
        execution_id: executionId,
        status,
        message,
        metadata,
        execution_time_ms: executionTime,
        log_level: status === 'failed' ? 'error' : 'info'
      });
    
    if (error) {
      console.error('Failed to log execution:', error);
    }
  } catch (err) {
    console.error('Error logging execution:', err);
  }
}

async function getGoogleAccessToken(): Promise<string> {
  try {
    const serviceAccount = JSON.parse(googleServiceAccountKey);
    const { create } = await import("https://deno.land/x/djwt@v2.9.1/mod.ts");
    
    const now = Math.floor(Date.now() / 1000);
    
    // Extract and format private key
    const privateKeyPem = serviceAccount.private_key
      .replace(/-----BEGIN PRIVATE KEY-----/, '')
      .replace(/-----END PRIVATE KEY-----/, '')
      .replace(/\s/g, '');
    
    const privateKeyDer = Uint8Array.from(atob(privateKeyPem), c => c.charCodeAt(0));
    
    const privateKey = await crypto.subtle.importKey(
      "pkcs8",
      privateKeyDer,
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false,
      ["sign"]
    );
    
    // Create signed JWT
    const jwt = await create(
      { alg: "RS256", typ: "JWT" },
      {
        iss: serviceAccount.client_email,
        sub: googleWorkspaceAdminEmail,
        scope: 'https://www.googleapis.com/auth/gmail.readonly',
        aud: 'https://oauth2.googleapis.com/token',
        iat: now,
        exp: now + 3600
      },
      privateKey
    );
    
    console.log('JWT created, exchanging for access token...');
    
    // Exchange JWT for access token
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwt
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to get access token: ${response.status} - ${errorText}`);
    }

    const tokenData = await response.json();
    console.log('Successfully obtained access token');
    return tokenData.access_token;
  } catch (error) {
    console.error('Error getting Google access token:', error);
    throw new Error(`Failed to authenticate with Google Workspace: ${error.message}`);
  }
}

async function fetchGmailMessages(accessToken: string, query: string = '', maxResults: number = 50): Promise<GmailMessage[]> {
  const gmailUrl = new URL('https://gmail.googleapis.com/gmail/v1/users/me/messages');
  gmailUrl.searchParams.set('maxResults', maxResults.toString());
  if (query) {
    gmailUrl.searchParams.set('q', query);
  }

  console.log('Fetching Gmail messages with query:', query);

  const response = await fetch(gmailUrl.toString(), {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Gmail API error:', response.status, errorText);
    throw new Error(`Gmail API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const messageIds = data.messages || [];

  // Fetch detailed message data
  const messages: GmailMessage[] = [];
  for (const messageRef of messageIds.slice(0, maxResults)) {
    const messageResponse = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageRef.id}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (messageResponse.ok) {
      const message = await messageResponse.json();
      messages.push(message);
    }
  }

  return messages;
}

function calculateLeadScore(message: GmailMessage): number {
  let score = 0;
  const headers = message.payload.headers;
  const subject = headers.find(h => h.name.toLowerCase() === 'subject')?.value || '';
  const snippet = message.snippet || '';

  // Positive indicators
  const positiveKeywords = [
    'partnership', 'collaboration', 'proposal', 'business', 'opportunity',
    'inquiry', 'interested', 'meeting', 'discussion', 'project'
  ];
  
  // Negative indicators
  const negativeKeywords = [
    'unsubscribe', 'newsletter', 'promotional', 'sale', 'offer',
    'spam', 'advertisement', 'marketing'
  ];

  const text = (subject + ' ' + snippet).toLowerCase();
  
  positiveKeywords.forEach(keyword => {
    if (text.includes(keyword)) score += 15;
  });
  
  negativeKeywords.forEach(keyword => {
    if (text.includes(keyword)) score -= 10;
  });

  // Subject line quality
  if (subject.length > 0 && subject.length < 100) score += 5;
  if (subject.includes('Re:') || subject.includes('Fwd:')) score += 10;

  // Ensure score is between 0-100
  return Math.max(0, Math.min(100, score));
}

function classifyMessage(message: GmailMessage, leadScore: number): ProcessedMessage['classification'] {
  const headers = message.payload.headers;
  const fromEmail = headers.find(h => h.name.toLowerCase() === 'from')?.value || '';
  const subject = headers.find(h => h.name.toLowerCase() === 'subject')?.value || '';

  // Internal emails
  if (fromEmail.includes('@coevolvenetwork.com')) {
    return 'internal';
  }

  // Spam indicators
  if (leadScore < 20 || subject.toLowerCase().includes('spam')) {
    return 'spam';
  }

  // High-score potential leads
  if (leadScore >= 60) {
    return 'lead';
  }

  // Known customers (this would be enhanced with database lookup)
  if (leadScore >= 40) {
    return 'customer';
  }

  // Vendors
  if (subject.toLowerCase().includes('invoice') || subject.toLowerCase().includes('payment')) {
    return 'vendor';
  }

  return 'unclassified';
}

function processMessage(message: GmailMessage): ProcessedMessage {
  const headers = message.payload.headers;
  const fromHeader = headers.find(h => h.name.toLowerCase() === 'from')?.value || '';
  const subjectHeader = headers.find(h => h.name.toLowerCase() === 'subject')?.value || '';
  
  // Extract email and name from "Name <email@domain.com>" format
  const emailMatch = fromHeader.match(/<(.+?)>/);
  const senderEmail = emailMatch ? emailMatch[1] : fromHeader;
  const senderName = emailMatch ? fromHeader.replace(emailMatch[0], '').trim() : '';

  const leadScore = calculateLeadScore(message);
  const classification = classifyMessage(message, leadScore);

  return {
    messageId: message.id,
    threadId: message.threadId,
    senderEmail,
    senderName: senderName || undefined,
    subject: subjectHeader,
    snippet: message.snippet || '',
    timestamp: new Date(parseInt(message.internalDate)).toISOString(),
    leadScore,
    classification,
    hasAttachments: false, // This would need to be computed from payload parts
    labels: [], // This would come from message.labelIds if needed
  };
}

async function storeGmailMetadata(processedMessages: ProcessedMessage[]) {
  const { data, error } = await supabase
    .from('gmail_metadata')
    .upsert(
      processedMessages.map(msg => ({
        message_id: msg.messageId,
        thread_id: msg.threadId,
        sender_email: msg.senderEmail,
        sender_name: msg.senderName,
        subject: msg.subject,
        snippet: msg.snippet,
        timestamp: msg.timestamp,
        lead_score: msg.leadScore,
        classification: msg.classification,
        has_attachments: msg.hasAttachments,
        labels: msg.labels,
        metadata: {
          processed_at: new Date().toISOString(),
          processing_version: '1.0'
        }
      })),
      { onConflict: 'message_id' }
    );

  if (error) {
    console.error('Failed to store Gmail metadata:', error);
    throw error;
  }

  return data;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const executionId = crypto.randomUUID();
  const startTime = Date.now();

  try {
    console.log('Gmail Processor function called');
    
    const { 
      maxResults = 50, 
      query = 'newer_than:1d', 
      dryRun = false,
      processingType = 'new_messages'
    }: GmailProcessRequest = await req.json();

    await logExecution(
      null, 
      executionId, 
      'started', 
      `Starting Gmail processing: ${processingType}`, 
      { maxResults, query, dryRun }
    );

    // Use reduced max for dry run
    const actualMaxResults = dryRun ? Math.min(maxResults, 5) : maxResults;

    // Authenticate with Google Workspace
    console.log('Authenticating with Google Workspace...');
    const accessToken = await getGoogleAccessToken();
    
    // Fetch Gmail messages
    console.log(`Fetching up to ${actualMaxResults} messages${dryRun ? ' (dry run)' : ''}...`);
    const messages = await fetchGmailMessages(accessToken, query, actualMaxResults);
    console.log(`Fetched ${messages.length} messages from Gmail`);
    
    // Process messages
    const processedMessages = messages.map(processMessage);
    
    // Store in database (skip in dry run)
    if (!dryRun && processedMessages.length > 0) {
      await storeGmailMetadata(processedMessages);
      console.log(`Stored ${processedMessages.length} messages in database`);
    }

    const executionTime = Date.now() - startTime;
    const leadsFound = processedMessages.filter(m => m.classification === 'lead').length;
    
    await logExecution(
      null, 
      executionId, 
      'completed', 
      `Successfully processed ${processedMessages.length} Gmail messages${dryRun ? ' (dry run)' : ''}`, 
      { 
        messages_processed: processedMessages.length,
        leads_found: leadsFound,
        processing_type: processingType,
        dry_run: dryRun,
        stored: !dryRun
      },
      executionTime
    );

    console.log('Gmail processing completed successfully');

    return new Response(
      JSON.stringify({
        success: true,
        messagesProcessed: processedMessages.length,
        leadsFound,
        dryRun,
        metadata: {
          execution_time_ms: executionTime,
          processing_type: processingType,
          query,
          stored_to_database: !dryRun
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    const executionTime = Date.now() - startTime;
    console.error('Error in gmail-processor function:', error);
    
    await logExecution(
      null,
      executionId,
      'failed',
      `Failed to process Gmail: ${error.message}`,
      { error: error.message, stack: error.stack },
      executionTime
    );

    return new Response(
      JSON.stringify({ 
        error: error.message,
        executionId,
        execution_time_ms: executionTime
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});