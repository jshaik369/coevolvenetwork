import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    if (req.method === 'POST') {
      const analyticsData = await req.json();
      
      console.log('Received analytics data:', {
        sessionId: analyticsData.sessionId,
        timestamp: analyticsData.timestamp,
        isBeforeUnload: analyticsData.isBeforeUnload
      });

      // Insert analytics data into the database
      const { data, error } = await supabaseClient
        .from('analytics')
        .insert({
          session_id: analyticsData.sessionId,
          user_id: analyticsData.userId || null,
          timestamp: new Date(analyticsData.timestamp).toISOString(),
          user_agent: analyticsData.userAgent,
          viewport: analyticsData.viewport,
          location: analyticsData.location,
          interactions: analyticsData.interactions,
          collaboration: analyticsData.collaboration,
          cultural_data: analyticsData.culturalData,
          is_before_unload: analyticsData.isBeforeUnload || false
        });

      if (error) {
        console.error('Database error:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to store analytics data' }), 
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      console.log('Analytics data stored successfully');
      return new Response(
        JSON.stringify({ success: true, id: data?.[0]?.id }), 
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }), 
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});