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
    driveFileId?: string;
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

    // Get Google Drive access token
    const accessToken = await getGoogleAccessToken(googleServiceAccount);
    
    // Create backup folder
    const folderName = `backup_${new Date().toISOString().split('T')[0]}`;
    const folderId = await createDriveFolder(accessToken, folderName);
    console.log(`Created backup folder: ${folderName} (${folderId})`);

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

      // Upload to Google Drive
      const fileName = `${tableName}_${backupData.timestamp}.json`;
      const driveFileId = await uploadToGoogleDrive(
        accessToken,
        fileName,
        tableData,
        folderId
      );

      console.log(`Uploaded ${tableName} to Drive (file ID: ${driveFileId})`);

      backupData.tables.push({
        name: tableName,
        rowCount: count || 0,
        checksum: checksumHex,
        driveFileId
      });

      backupData.totalSize += tableData.length;

      // Store in backup history
      await supabase.from('backup_history').insert({
        backup_timestamp: backupData.timestamp,
        drive_file_id: driveFileId,
        drive_folder_id: folderId,
        table_name: tableName,
        row_count: count || 0,
        file_size_bytes: tableData.length,
        checksum: checksumHex,
        status: 'completed',
        metadata: {
          folder_name: folderName
        }
      });
    }

    // Create metadata file
    const metadataJson = JSON.stringify(backupData, null, 2);
    const metadataFileId = await uploadToGoogleDrive(
      accessToken,
      `backup_metadata_${backupData.timestamp}.json`,
      metadataJson,
      folderId
    );

    // Log successful backup
    await supabase.from('automation_logs').insert({
      job_id: null,
      status: 'success',
      message: `Backup completed: ${backupData.tables.length} tables backed up to Google Drive`,
      metadata: {
        ...backupData,
        folder_id: folderId,
        metadata_file_id: metadataFileId
      },
      log_level: 'info'
    });

    console.log('Backup completed successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        backup: backupData,
        folderId,
        folderName
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

async function getGoogleAccessToken(serviceAccountJson: string): Promise<string> {
  const serviceAccount = JSON.parse(serviceAccountJson);
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
      scope: 'https://www.googleapis.com/auth/drive.file',
      aud: 'https://oauth2.googleapis.com/token',
      iat: now,
      exp: now + 3600
    },
    privateKey
  );
  
  // Exchange JWT for access token
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt
    })
  });

  if (!tokenResponse.ok) {
    const error = await tokenResponse.text();
    throw new Error(`Failed to get access token: ${error}`);
  }

  const tokenData = await tokenResponse.json();
  return tokenData.access_token;
}

async function createDriveFolder(
  accessToken: string,
  folderName: string
): Promise<string> {
  const metadata = {
    name: folderName,
    mimeType: 'application/vnd.google-apps.folder'
  };

  const response = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(metadata)
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create folder: ${error}`);
  }

  const result = await response.json();
  return result.id;
}

async function uploadToGoogleDrive(
  accessToken: string,
  fileName: string,
  fileContent: string,
  folderId?: string
): Promise<string> {
  // Create metadata
  const metadata = {
    name: fileName,
    mimeType: 'application/json',
    ...(folderId && { parents: [folderId] })
  };

  // Create multipart upload
  const boundary = '-------314159265358979323846';
  const delimiter = "\r\n--" + boundary + "\r\n";
  const close_delim = "\r\n--" + boundary + "--";

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: application/json\r\n\r\n' +
    fileContent +
    close_delim;

  const response = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary="${boundary}"`
      },
      body: multipartRequestBody
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to upload file: ${error}`);
  }

  const result = await response.json();
  return result.id;
}
