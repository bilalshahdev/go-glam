
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabaseClient.auth.getUser(token);

    if (!user) {
      throw new Error('Unauthorized');
    }

    const { action, keyName, keyValue } = await req.json();

    if (action === 'get') {
      // Get available API keys (names only, not values for security)
      const availableKeys = [
        'OPENAI_API_KEY',
        'GEMINI_API_KEY',
        'REPLICATE_API_KEY',
        'HUGGINGFACE_API_KEY'
      ];

      const keyStatuses = await Promise.all(
        availableKeys.map(async (key) => {
          const value = Deno.env.get(key);
          return {
            name: key,
            isSet: !!value,
            displayName: key.replace(/_/g, ' ').replace('API KEY', 'API Key')
          };
        })
      );

      return new Response(
        JSON.stringify({ keys: keyStatuses }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'validate') {
      // Validate API key by making a test request
      let isValid = false;
      let errorMessage = '';

      try {
        if (keyName === 'OPENAI_API_KEY') {
          const response = await fetch('https://api.openai.com/v1/models', {
            headers: { 'Authorization': `Bearer ${keyValue}` }
          });
          isValid = response.ok;
          if (!isValid) errorMessage = 'Invalid OpenAI API key';
        } else if (keyName === 'GEMINI_API_KEY') {
          const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${keyValue}`);
          isValid = response.ok;
          if (!isValid) errorMessage = 'Invalid Gemini API key';
        } else if (keyName === 'REPLICATE_API_KEY') {
          const response = await fetch('https://api.replicate.com/v1/models', {
            headers: { 'Authorization': `Token ${keyValue}` }
          });
          isValid = response.ok;
          if (!isValid) errorMessage = 'Invalid Replicate API key';
        } else if (keyName === 'HUGGINGFACE_API_KEY') {
          const response = await fetch('https://huggingface.co/api/whoami', {
            headers: { 'Authorization': `Bearer ${keyValue}` }
          });
          isValid = response.ok;
          if (!isValid) errorMessage = 'Invalid HuggingFace API key';
        }
      } catch (error) {
        errorMessage = `Validation error: ${error.message}`;
      }

      return new Response(
        JSON.stringify({ isValid, errorMessage }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('API key management error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
