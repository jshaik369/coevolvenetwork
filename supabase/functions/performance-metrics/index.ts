import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    if (req.method === 'POST') {
      const performanceData = await req.json()
      
      console.log('Received performance data:', {
        sessionId: performanceData.sessionId,
        timestamp: performanceData.timestamp,
        isBeforeUnload: performanceData.isBeforeUnload
      })

      // Store performance metrics in a dedicated table
      const { data, error } = await supabaseClient
        .from('performance_metrics')
        .insert({
          session_id: performanceData.sessionId,
          timestamp: new Date(performanceData.timestamp).toISOString(),
          page_load: performanceData.pageLoad,
          navigation: performanceData.navigation,
          resources: performanceData.resources,
          errors: performanceData.errors,
          vitals: performanceData.vitals,
          is_before_unload: performanceData.isBeforeUnload || false
        })

      if (error) {
        console.error('Database error:', error)
        return new Response(
          JSON.stringify({ error: error.message }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      console.log('Performance metrics stored successfully')
      
      return new Response(
        JSON.stringify({ success: true }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})