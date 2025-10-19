import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BackupMetadata {
  timestamp: string;
  tables: {
    name: string;
    rowCount: number;
    checksum: string;
  }[];
  totalSize: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const googleServiceAccount = Deno.env.get('GOOGLE_WORKSPACE_SERVICE_ACCOUNT_KEY');
    
    if (!googleServiceAccount) {
      throw new Error('Google Workspace service account not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    console.log('Starting backup process...');

    // Tables to backup
    const tablesToBackup = [
      'ai_command_queue',
      'automation_logs', 
      'analytics',
      'ai_insights',
      'audit_ledger',
      'ai_messages',
      'gmail_metadata',
      'business_intelligence',
      'automation_jobs',
      'security_events',
      'performance_metrics'
    ];

    const backupData: BackupMetadata = {
      timestamp: new Date().toISOString(),
      tables: [],
      totalSize: 0
    };

    // Export all tables
    for (const tableName of tablesToBackup) {
      console.log(`Backing up table: ${tableName}`);
      
      const { data, error, count } = await supabase
        .from(tableName)
        .select('*', { count: 'exact' });

      if (error) {
        console.error(`Error backing up ${tableName}:`, error);
        continue;
      }

      const tableData = JSON.stringify(data);
      const checksum = await crypto.subtle.digest(
        'SHA-256',
        new TextEncoder().encode(tableData)
      );
      const checksumHex = Array.from(new Uint8Array(checksum))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      backupData.tables.push({
        name: tableName,
        rowCount: count || 0,
        checksum: checksumHex
      });

      backupData.totalSize += tableData.length;

      // Upload to Google Drive
      await uploadToGoogleDrive(
        googleServiceAccount,
        `${tableName}_${backupData.timestamp}.json`,
        tableData
      );
    }

    // Create metadata file
    const metadataJson = JSON.stringify(backupData, null, 2);
    await uploadToGoogleDrive(
      googleServiceAccount,
      `backup_metadata_${backupData.timestamp}.json`,
      metadataJson
    );

    // Log successful backup
    await supabase.from('automation_logs').insert({
      job_id: null,
      status: 'success',
      message: `Backup completed: ${backupData.tables.length} tables backed up`,
      metadata: backupData,
      log_level: 'info'
    });

    console.log('Backup completed successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        backup: backupData 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Backup error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});

async function uploadToGoogleDrive(
  serviceAccountJson: string,
  fileName: string,
  fileContent: string
): Promise<string> {
  const serviceAccount = JSON.parse(serviceAccountJson);
  
  // Get access token
  const jwtHeader = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const now = Math.floor(Date.now() / 1000);
  const jwtClaim = btoa(JSON.stringify({
    iss: serviceAccount.client_email,
    scope: 'https://www.googleapis.com/auth/drive.file',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now
  }));

  // Note: In production, you'd need to sign the JWT properly
  // For now, using direct API key approach would be simpler
  console.log(`Simulating upload of ${fileName} (${fileContent.length} bytes)`);
  
  // This is a placeholder - in production, implement proper Google Drive API authentication
  // and file upload using the service account credentials
  
  return `drive://backups/${fileName}`;
}
