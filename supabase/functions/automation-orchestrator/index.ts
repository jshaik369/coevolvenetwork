import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface OrchestrationRequest {
  action: 'run_job' | 'schedule_job' | 'get_status' | 'list_jobs' | 'cancel_job';
  jobId?: string;
  jobType?: string;
  config?: any;
  dryRun?: boolean;
}

interface AutomationJob {
  id: string;
  name: string;
  job_type: string;
  schedule_cron: string | null;
  is_enabled: boolean;
  dry_run_enabled: boolean;
  config: any;
  last_run_at: string | null;
  next_run_at: string | null;
}

async function logExecution(
  jobId: string | null,
  executionId: string,
  status: 'started' | 'completed' | 'failed' | 'cancelled',
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

async function executeJob(job: AutomationJob, executionId: string): Promise<any> {
  const startTime = Date.now();
  
  try {
    await logExecution(
      job.id,
      executionId,
      'started',
      `Starting execution of ${job.job_type} job: ${job.name}`,
      { job_config: job.config, dry_run: job.dry_run_enabled }
    );

    let result: any = {};

    switch (job.job_type) {
      case 'perplexity_insights':
        result = await executePerplexityJob(job, executionId);
        break;
        
      case 'gmail_processor':
        result = await executeGmailJob(job, executionId);
        break;
        
      case 'business_intelligence':
        result = await executeBusinessIntelligenceJob(job, executionId);
        break;
        
      case 'weekly_report':
        result = await executeWeeklyReportJob(job, executionId);
        break;
        
      case 'market_analysis':
        result = await executeMarketAnalysisJob(job, executionId);
        break;
        
      case 'lead_scoring':
        result = await executeLeadScoringJob(job, executionId);
        break;
        
      case 'drive_backup':
        result = await executeDriveBackupJob(job, executionId);
        break;
        
      default:
        throw new Error(`Unknown job type: ${job.job_type}`);
    }

    const executionTime = Date.now() - startTime;
    
    // Update job's last run time
    await supabase
      .from('automation_jobs')
      .update({ 
        last_run_at: new Date().toISOString(),
        next_run_at: calculateNextRun(job.schedule_cron)
      })
      .eq('id', job.id);

    await logExecution(
      job.id,
      executionId,
      'completed',
      `Successfully completed ${job.job_type} job: ${job.name}`,
      { result, execution_time_ms: executionTime },
      executionTime
    );

    return { success: true, result, executionTime };

  } catch (error: any) {
    const executionTime = Date.now() - startTime;
    
    await logExecution(
      job.id,
      executionId,
      'failed',
      `Failed to execute ${job.job_type} job: ${error.message}`,
      { error: error.message, stack: error.stack },
      executionTime
    );

    throw error;
  }
}

async function executePerplexityJob(job: AutomationJob, executionId: string) {
  const config = job.config || {};
  const query = config.query || 'Analyze current market trends in AI and business automation';
  
  console.log(`Executing Perplexity job with query: ${query}`);
  
  const response = await fetch(`${supabaseUrl}/functions/v1/perplexity-insights`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseServiceKey}`,
    },
    body: JSON.stringify({
      query,
      insightType: config.insightType || 'business_intelligence',
      tags: config.tags || ['automated', 'orchestrated'],
      dryRun: job.dry_run_enabled
    }),
  });

  if (!response.ok) {
    throw new Error(`Perplexity job failed: ${response.status}`);
  }

  return await response.json();
}

async function executeGmailJob(job: AutomationJob, executionId: string) {
  const config = job.config || {};
  
  console.log('Executing Gmail processing job');
  
  const response = await fetch(`${supabaseUrl}/functions/v1/gmail-processor`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseServiceKey}`,
    },
    body: JSON.stringify({
      maxResults: config.maxResults || 50,
      query: config.query || 'newer_than:1d',
      processingType: config.processingType || 'new_messages',
      dryRun: job.dry_run_enabled
    }),
  });

  if (!response.ok) {
    throw new Error(`Gmail job failed: ${response.status}`);
  }

  return await response.json();
}

async function executeBusinessIntelligenceJob(job: AutomationJob, executionId: string) {
  console.log('Executing Business Intelligence job');
  
  // This would combine multiple intelligence sources
  const perplexityResult = await executePerplexityJob({
    ...job,
    config: {
      query: 'Analyze current competitive landscape and market opportunities in business automation',
      insightType: 'business_intelligence',
      tags: ['competitive-analysis', 'market-research']
    }
  }, executionId);

  const gmailResult = await executeGmailJob({
    ...job,
    config: {
      query: 'from:competitor OR from:partner OR subject:proposal',
      processingType: 'lead_scoring'
    }
  }, executionId);

  return {
    intelligence_summary: 'Business intelligence analysis completed',
    perplexity_insights: perplexityResult,
    gmail_analysis: gmailResult,
    generated_at: new Date().toISOString()
  };
}

async function executeWeeklyReportJob(job: AutomationJob, executionId: string) {
  console.log('Executing Weekly Report job');
  
  // Generate comprehensive weekly insights
  const queries = [
    'Summarize this week\'s key business trends and opportunities',
    'Analyze recent developments in AI and automation industry',
    'Review competitive landscape changes in the past week'
  ];

  const insights = await Promise.all(
    queries.map(query => executePerplexityJob({
      ...job,
      config: { query, insightType: 'market_analysis', tags: ['weekly-report'] }
    }, executionId))
  );

  return {
    report_type: 'weekly_summary',
    insights,
    generated_at: new Date().toISOString(),
    period: `Week of ${new Date().toISOString().split('T')[0]}`
  };
}

async function executeMarketAnalysisJob(job: AutomationJob, executionId: string) {
  console.log('Executing Market Analysis job');
  
  return await executePerplexityJob({
    ...job,
    config: {
      query: 'Conduct comprehensive market analysis for AI-powered business automation platforms',
      insightType: 'market_analysis',
      tags: ['market-research', 'industry-analysis']
    }
  }, executionId);
}

async function executeLeadScoringJob(job: AutomationJob, executionId: string) {
  console.log('Executing Lead Scoring job');
  
  // This would typically analyze recent Gmail data and score leads
  const gmailResult = await executeGmailJob({
    ...job,
    config: {
      query: 'newer_than:1d',
      processingType: 'lead_scoring'
    }
  }, executionId);

  return {
    scoring_summary: 'Lead scoring analysis completed',
    gmail_processing: gmailResult,
    generated_at: new Date().toISOString()
  };
}

async function executeDriveBackupJob(job: AutomationJob, executionId: string) {
  console.log(`Executing Drive backup job: ${job.name}`);
  
  try {
    const config = job.config || {};
    const backupParams = {
      data_types: config.data_types || ['all'],
      include_ai_insights: config.include_ai_insights !== false,
      retention_years: config.retention_years || 7
    };

    const response = await fetch(`${supabaseUrl}/functions/v1/drive-backup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`,
      },
      body: JSON.stringify(backupParams)
    });

    if (!response.ok) {
      throw new Error(`Drive backup failed: ${response.status}`);
    }

    const result = await response.json();

    return { 
      success: true, 
      message: `Drive backup completed successfully. File ID: ${result.drive_file_id}`,
      data: result
    };
  } catch (error) {
    console.error('Drive backup job error:', error);
    throw error;
  }
}

function calculateNextRun(cronExpression: string | null): string | null {
  if (!cronExpression) return null;
  
  // Simple next run calculation (would use proper cron parser in production)
  const now = new Date();
  const nextRun = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Default to 24 hours
  
  return nextRun.toISOString();
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const executionId = crypto.randomUUID();
  const startTime = Date.now();

  try {
    console.log('Automation Orchestrator function called');
    
    const { action, jobId, jobType, config = {}, dryRun = false }: OrchestrationRequest = await req.json();

    switch (action) {
      case 'run_job': {
        if (!jobId) {
          return new Response(
            JSON.stringify({ error: 'Job ID is required for run_job action' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { data: job, error } = await supabase
          .from('automation_jobs')
          .select('*')
          .eq('id', jobId)
          .single();

        if (error || !job) {
          return new Response(
            JSON.stringify({ error: 'Job not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const result = await executeJob(job, executionId);
        
        return new Response(
          JSON.stringify({
            success: true,
            jobId,
            executionId,
            result
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'list_jobs': {
        const { data: jobs, error } = await supabase
          .from('automation_jobs')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        return new Response(
          JSON.stringify({
            success: true,
            jobs: jobs || []
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'get_status': {
        if (!jobId) {
          return new Response(
            JSON.stringify({ error: 'Job ID is required for get_status action' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { data: logs, error } = await supabase
          .from('automation_logs')
          .select('*')
          .eq('job_id', jobId)
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) {
          throw error;
        }

        return new Response(
          JSON.stringify({
            success: true,
            jobId,
            recentLogs: logs || []
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action specified' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

  } catch (error: any) {
    const executionTime = Date.now() - startTime;
    console.error('Error in automation-orchestrator function:', error);
    
    await logExecution(
      null,
      executionId,
      'failed',
      `Orchestrator failed: ${error.message}`,
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