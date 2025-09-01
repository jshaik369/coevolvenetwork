import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface PerplexityRequest {
  query: string;
  insightType: 'market_analysis' | 'competitor_research' | 'trend_analysis' | 'business_intelligence' | 'lead_analysis';
  tags?: string[];
  dryRun?: boolean;
}

interface PerplexityResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
  usage?: {
    total_tokens: number;
  };
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

async function generateInsights(query: string): Promise<PerplexityResponse> {
  console.log('Calling Perplexity API with query:', query);
  
  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${perplexityApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.1-sonar-large-128k-online',
      messages: [
        {
          role: 'system',
          content: `You are a business intelligence analyst providing strategic insights. 
                   Focus on actionable intelligence, competitive advantages, and market opportunities.
                   Include specific data points, trends, and strategic recommendations.
                   Format your response in a structured manner with clear sections.`
        },
        {
          role: 'user',
          content: query
        }
      ],
      temperature: 0.2,
      max_tokens: 2000,
      return_images: false,
      return_related_questions: false,
      search_recency_filter: 'week',
      frequency_penalty: 1,
      presence_penalty: 0
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Perplexity API error:', response.status, errorText);
    throw new Error(`Perplexity API error: ${response.status} - ${errorText}`);
  }

  return await response.json();
}

async function storeInsights(
  insightType: string,
  query: string,
  responseData: any,
  tags: string[] = [],
  confidenceScore?: number,
  sourceUrls?: string[]
) {
  const { data, error } = await supabase
    .from('ai_insights')
    .insert({
      insight_type: insightType,
      query_text: query,
      response_data: responseData,
      confidence_score: confidenceScore || 0.85,
      source_urls: sourceUrls || [],
      tags,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to store insights:', error);
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
    console.log('Perplexity Insights function called');
    
    const { query, insightType, tags = [], dryRun = false }: PerplexityRequest = await req.json();

    if (!query || !insightType) {
      return new Response(
        JSON.stringify({ error: 'Query and insightType are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    await logExecution(null, executionId, 'started', `Starting ${insightType} analysis`, { query, tags, dryRun });

    if (dryRun) {
      console.log('DRY RUN MODE: Would analyze:', query);
      await logExecution(null, executionId, 'completed', 'Dry run completed successfully', { 
        query, 
        dryRun: true,
        message: 'No actual API calls made in dry run mode'
      });
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          dryRun: true,
          message: 'Dry run completed - no actual insights generated',
          query,
          insightType
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate insights using Perplexity
    const perplexityResponse = await generateInsights(query);
    const content = perplexityResponse.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No content received from Perplexity API');
    }

    // Store insights in database
    const storedInsight = await storeInsights(
      insightType,
      query,
      {
        content,
        tokens_used: perplexityResponse.usage?.total_tokens || 0,
        generated_at: new Date().toISOString(),
        source: 'perplexity_llama_3_1_sonar_large'
      },
      tags,
      0.85 // Default confidence score
    );

    const executionTime = Date.now() - startTime;
    await logExecution(
      null, 
      executionId, 
      'completed', 
      `Successfully generated ${insightType} insights`, 
      { 
        insight_id: storedInsight.id,
        tokens_used: perplexityResponse.usage?.total_tokens || 0,
        query_length: query.length,
        response_length: content.length
      },
      executionTime
    );

    console.log('Insights generated and stored successfully');

    return new Response(
      JSON.stringify({
        success: true,
        insightId: storedInsight.id,
        content,
        metadata: {
          tokens_used: perplexityResponse.usage?.total_tokens || 0,
          execution_time_ms: executionTime,
          insight_type: insightType,
          tags
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    const executionTime = Date.now() - startTime;
    console.error('Error in perplexity-insights function:', error);
    
    await logExecution(
      null,
      executionId,
      'failed',
      `Failed to generate insights: ${error.message}`,
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