
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Legacy apply-makeup function called - redirecting to AI system');
    
    // Redirect to the new AI-powered system
    return new Response(
      JSON.stringify({ 
        error: 'This function has been upgraded to AI-powered makeup application',
        redirect: 'ai-makeup-tryon',
        message: 'Please use the new AI-enhanced virtual try-on system'
      }),
      { 
        status: 410, // Gone
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }
      }
    )
  } catch (error) {
    console.error('Legacy function error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }
      }
    )
  }
})
