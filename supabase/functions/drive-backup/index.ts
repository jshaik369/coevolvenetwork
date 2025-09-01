import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface BackupRequest {
  data_types?: string[]
  include_ai_insights?: boolean
  retention_years?: number
}

interface DriveFileMetadata {
  name: string
  parents: string[]
  description: string
  properties: {
    backup_type: string
    timestamp: string
    checksum: string
    retention_policy: string
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get Google Workspace credentials from secrets
    const serviceAccountKey = Deno.env.get('GOOGLE_WORKSPACE_SERVICE_ACCOUNT_KEY')!
    const adminEmail = Deno.env.get('GOOGLE_WORKSPACE_ADMIN_EMAIL')!
    
    if (!serviceAccountKey || !adminEmail) {
      throw new Error('Google Workspace credentials not configured')
    }

    const { data_types = ['all'], include_ai_insights = true, retention_years = 7 } = await req.json() as BackupRequest

    console.log(`Starting backup for data types: ${data_types.join(', ')}`)

    // Get OAuth token for Google Drive API
    const credentials = JSON.parse(serviceAccountKey)
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: await createJWT(credentials, [
          'https://www.googleapis.com/auth/drive.file',
          'https://www.googleapis.com/auth/drive.metadata'
        ])
      })
    })

    const { access_token } = await tokenResponse.json()

    // Create backup folder structure in Drive
    const backupFolderName = `CoEvolve_Backup_${new Date().toISOString().split('T')[0]}`
    const backupFolder = await createDriveFolder(access_token, backupFolderName, [])

    // Collect and backup data
    const backupData: any = {}
    const timestamp = new Date().toISOString()

    // Backup analytics data (pseudonymized)
    if (data_types.includes('all') || data_types.includes('analytics')) {
      const { data: analytics } = await supabase
        .from('analytics')
        .select('id, timestamp, viewport, location, interactions, cultural_data, session_id')
        .order('timestamp', { ascending: false })
        .limit(10000)

      backupData.analytics = analytics?.map(record => ({
        ...record,
        session_id: hashData(record.session_id), // Pseudonymize
        user_id: null // Remove PII
      }))
    }

    // Backup automation logs
    if (data_types.includes('all') || data_types.includes('automation')) {
      const { data: logs } = await supabase
        .from('automation_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5000)

      backupData.automation_logs = logs
    }

    // Backup AI insights (if permitted)
    if (include_ai_insights && (data_types.includes('all') || data_types.includes('ai_insights'))) {
      const { data: insights } = await supabase
        .from('ai_insights')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1000)

      backupData.ai_insights = insights
    }

    // Backup business intelligence
    if (data_types.includes('all') || data_types.includes('business_intelligence')) {
      const { data: bi } = await supabase
        .from('business_intelligence')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1000)

      backupData.business_intelligence = bi
    }

    // Create backup file with checksum
    const backupContent = JSON.stringify(backupData, null, 2)
    const checksum = await generateChecksum(backupContent)

    const fileMetadata: DriveFileMetadata = {
      name: `backup_${timestamp.replace(/[:.]/g, '-')}.json`,
      parents: [backupFolder.id],
      description: `CoEvolve Network automated backup - ${timestamp}`,
      properties: {
        backup_type: data_types.join(','),
        timestamp,
        checksum,
        retention_policy: `${retention_years}_years`
      }
    }

    // Upload to Google Drive
    const uploadResponse = await uploadToDrive(access_token, fileMetadata, backupContent)

    // Log backup completion
    await supabase
      .from('automation_logs')
      .insert({
        job_id: null,
        status: 'completed',
        message: `Drive backup completed successfully`,
        metadata: {
          drive_file_id: uploadResponse.id,
          data_types,
          checksum,
          file_size: backupContent.length,
          retention_years
        }
      })

    console.log(`Backup completed: ${uploadResponse.id}`)

    return new Response(JSON.stringify({
      success: true,
      drive_file_id: uploadResponse.id,
      backup_size: backupContent.length,
      checksum,
      timestamp
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Backup error:', error)
    
    return new Response(JSON.stringify({
      error: error.message,
      success: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

async function createJWT(credentials: any, scopes: string[]): Promise<string> {
  const header = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
  const now = Math.floor(Date.now() / 1000)
  
  const payload = btoa(JSON.stringify({
    iss: credentials.client_email,
    scope: scopes.join(' '),
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now
  }))

  const data = `${header}.${payload}`
  const signature = await signData(data, credentials.private_key)
  
  return `${data}.${signature}`
}

async function signData(data: string, privateKey: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'pkcs8',
    new TextEncoder().encode(privateKey.replace(/\\n/g, '\n')),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  )
  
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    key,
    new TextEncoder().encode(data)
  )
  
  return btoa(String.fromCharCode(...new Uint8Array(signature)))
}

async function createDriveFolder(accessToken: string, name: string, parents: string[]): Promise<any> {
  const metadata = {
    name,
    mimeType: 'application/vnd.google-apps.folder',
    parents: parents.length > 0 ? parents : undefined
  }

  const response = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(metadata)
  })

  return await response.json()
}

async function uploadToDrive(accessToken: string, metadata: DriveFileMetadata, content: string): Promise<any> {
  const boundary = '-------314159265358979323846'
  const delimiter = `\r\n--${boundary}\r\n`
  const closeDelimiter = `\r\n--${boundary}--`

  const body = delimiter +
    'Content-Type: application/json\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: application/json\r\n\r\n' +
    content +
    closeDelimiter

  const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': `multipart/related; boundary="${boundary}"`
    },
    body
  })

  return await response.json()
}

async function generateChecksum(data: string): Promise<string> {
  const encoder = new TextEncoder()
  const dataBuffer = encoder.encode(data)
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

function hashData(data: string): string {
  // Simple hash for pseudonymization
  let hash = 0
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return hash.toString(16)
}