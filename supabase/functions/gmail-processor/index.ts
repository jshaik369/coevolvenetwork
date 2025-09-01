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
    
    // Create JWT token
    const now = Math.floor(Date.now() / 1000);
    const header = {
      alg: 'RS256',
      typ: 'JWT'
    };
    
    const payload = {
      iss: serviceAccount.client_email,
      sub: googleWorkspaceAdminEmail,
      scope: 'https://www.googleapis.com/auth/gmail.readonly',
      aud: 'https://oauth2.googleapis.com/token',
      iat: now,
      exp: now + 3600
    };

    // Note: In a real implementation, you would need to sign the JWT with the private key
    // For now, this is a placeholder that shows the structure
    console.log('Would create JWT with payload:', payload);
    
    // This is a simplified version - in production you need proper JWT signing
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: 'JWT_TOKEN_PLACEHOLDER' // This would be the signed JWT
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to get access token: ${response.status}`);
    }

    const tokenData = await response.json();
    return tokenData.access_token;
  } catch (error) {
    console.error('Error getting Google access token:', error);
    throw new Error('Failed to authenticate with Google Workspace');
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

    if (dryRun) {
      console.log('DRY RUN MODE: Would process Gmail with query:', query);
      await logExecution(null, executionId, 'completed', 'Dry run completed successfully', { 
        query, 
        maxResults,
        dryRun: true,
        message: 'No actual Gmail processing in dry run mode'
      });
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          dryRun: true,
          message: 'Dry run completed - no actual Gmail processing',
          query,
          maxResults
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // For now, we'll simulate processing since proper JWT signing is needed
    console.log('SIMULATION MODE: Gmail processing would authenticate and fetch messages');
    
    // Simulated response for demonstration
    const simulatedMessages: ProcessedMessage[] = [
      {
        messageId: 'simulated_001',
        threadId: 'thread_001',
        senderEmail: 'potential.lead@example.com',
        senderName: 'Potential Lead',
        subject: 'Business Partnership Opportunity',
        snippet: 'Hi, I am interested in discussing a potential business partnership...',
        timestamp: new Date().toISOString(),
        leadScore: 85,
        classification: 'lead',
        hasAttachments: false,
        labels: ['INBOX']
      }
    ];

    // In production, you would:
    // 1. Get access token: const accessToken = await getGoogleAccessToken();
    // 2. Fetch messages: const messages = await fetchGmailMessages(accessToken, query, maxResults);
    // 3. Process messages: const processedMessages = messages.map(processMessage);
    // 4. Store in database: await storeGmailMetadata(processedMessages);

    const executionTime = Date.now() - startTime;
    await logExecution(
      null, 
      executionId, 
      'completed', 
      `Successfully processed ${simulatedMessages.length} Gmail messages`, 
      { 
        messages_processed: simulatedMessages.length,
        leads_found: simulatedMessages.filter(m => m.classification === 'lead').length,
        processing_type: processingType
      },
      executionTime
    );

    console.log('Gmail processing completed successfully');

    return new Response(
      JSON.stringify({
        success: true,
        messagesProcessed: simulatedMessages.length,
        leadsFound: simulatedMessages.filter(m => m.classification === 'lead').length,
        simulation: true,
        metadata: {
          execution_time_ms: executionTime,
          processing_type: processingType,
          query
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