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

const initialJobs = [
  {
    name: 'Weekly AI Insights Report',
    description: 'Generate comprehensive weekly business intelligence report using Perplexity AI',
    job_type: 'weekly_report',
    schedule_cron: '0 9 * * 1', // Every Monday at 9 AM
    is_enabled: false,
    dry_run_enabled: true,
    config: {
      report_sections: ['market_trends', 'competitive_analysis', 'opportunities'],
      output_format: 'comprehensive',
      tags: ['weekly', 'intelligence', 'automated']
    }
  },
  {
    name: 'Daily Gmail Lead Processing',
    description: 'Process new Gmail messages for lead identification and scoring',
    job_type: 'gmail_processor',
    schedule_cron: '0 8,17 * * *', // 8 AM and 5 PM daily
    is_enabled: false,
    dry_run_enabled: true,
    config: {
      query: 'newer_than:1d',
      maxResults: 100,
      processingType: 'lead_scoring',
      autoClassify: true
    }
  },
  {
    name: 'Market Intelligence Monitoring',
    description: 'Continuous market analysis and trend identification using AI',
    job_type: 'perplexity_insights',
    schedule_cron: '0 */6 * * *', // Every 6 hours
    is_enabled: false,
    dry_run_enabled: true,
    config: {
      query: 'Analyze current business automation and AI industry trends, opportunities, and competitive landscape',
      insightType: 'market_analysis',
      tags: ['market-intelligence', 'trends', 'automated'],
      searchRecency: 'day'
    }
  },
  {
    name: 'Competitive Intelligence Scan',
    description: 'Monitor and analyze competitor activities and market positioning',
    job_type: 'business_intelligence',
    schedule_cron: '0 10 * * 2,5', // Tuesday and Friday at 10 AM
    is_enabled: false,
    dry_run_enabled: true,
    config: {
      analysisType: 'competitor_analysis',
      targets: ['automation platforms', 'AI business tools', 'workflow solutions'],
      depth: 'comprehensive',
      includeStrategic: true
    }
  },
  {
    name: 'High-Value Lead Scoring',
    description: 'Advanced lead scoring and qualification using AI analysis',
    job_type: 'lead_scoring',
    schedule_cron: '0 12 * * *', // Daily at noon
    is_enabled: false,
    dry_run_enabled: true,
    config: {
      scoreThreshold: 70,
      analysisDepth: 'detailed',
      includeIntent: true,
      autoNotify: false
    }
  },
  {
    name: 'Strategic Business Intelligence',
    description: 'Deep strategic analysis combining multiple intelligence sources',
    job_type: 'business_intelligence',
    schedule_cron: '0 7 * * 1', // Monday at 7 AM
    is_enabled: false,
    dry_run_enabled: true,
    config: {
      analysisType: 'strategic_overview',
      includeMarketData: true,
      includeCompetitorData: true,
      includeCustomerData: true,
      timeframe: 'weekly'
    }
  }
];

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Setting up initial automation jobs...');

    // Check if jobs already exist
    const { data: existingJobs, error: checkError } = await supabase
      .from('automation_jobs')
      .select('name')
      .limit(1);

    if (checkError) {
      throw checkError;
    }

    if (existingJobs && existingJobs.length > 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Initial jobs already exist',
          existingJobCount: existingJobs.length
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Insert initial jobs
    const { data: createdJobs, error: insertError } = await supabase
      .from('automation_jobs')
      .insert(initialJobs)
      .select();

    if (insertError) {
      throw insertError;
    }

    console.log(`Successfully created ${createdJobs.length} initial automation jobs`);

    // Log the setup completion
    const setupLogEntry = {
      execution_id: crypto.randomUUID(),
      status: 'completed',
      message: `Initial automation jobs setup completed - ${createdJobs.length} jobs created`,
      metadata: {
        jobs_created: createdJobs.length,
        job_types: createdJobs.map(job => job.job_type),
        setup_timestamp: new Date().toISOString()
      },
      log_level: 'info'
    };

    await supabase
      .from('automation_logs')
      .insert(setupLogEntry);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Initial automation jobs created successfully',
        jobsCreated: createdJobs.length,
        jobs: createdJobs.map(job => ({
          id: job.id,
          name: job.name,
          type: job.job_type,
          enabled: job.is_enabled,
          dryRun: job.dry_run_enabled
        }))
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error setting up initial jobs:', error);

    // Log the error
    try {
      await supabase
        .from('automation_logs')
        .insert({
          execution_id: crypto.randomUUID(),
          status: 'failed',
          message: `Failed to setup initial jobs: ${error.message}`,
          metadata: { error: error.message, stack: error.stack },
          log_level: 'error'
        });
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }

    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});