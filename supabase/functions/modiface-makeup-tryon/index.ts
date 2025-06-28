
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
    const MODIFACE_API_KEY = Deno.env.get('MODIFACE_API_KEY');
    if (!MODIFACE_API_KEY) {
      throw new Error('ModiFace API key not configured');
    }

    const { imageData, makeupStyle, hairStyle, hairColor, faceLandmarks, intensity = 0.8 } = await req.json();
    
    console.log('🎨 ModiFace Try-On Request:', { makeupStyle, hairStyle, hairColor, intensity });

    // Convert base64 image to blob for ModiFace API
    let imageBlob;
    if (imageData.startsWith('data:image/')) {
      const base64Data = imageData.split(',')[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      imageBlob = new Blob([byteArray], { type: 'image/jpeg' });
    } else {
      throw new Error('Invalid image format');
    }

    // Prepare ModiFace API request
    const formData = new FormData();
    formData.append('image', imageBlob, 'image.jpg');
    
    // Add makeup parameters
    if (makeupStyle) {
      formData.append('makeup_style', makeupStyle.toLowerCase());
      formData.append('makeup_intensity', intensity.toString());
    }
    
    // Add hair parameters
    if (hairStyle) {
      formData.append('hair_style', hairStyle.toLowerCase());
    }
    
    if (hairColor) {
      formData.append('hair_color', hairColor.toLowerCase());
    }

    // Add face landmarks if available
    if (faceLandmarks?.detected) {
      formData.append('face_landmarks', JSON.stringify(faceLandmarks));
    }

    console.log('📡 Calling ModiFace API...');

    // Call ModiFace API
    const modiFaceResponse = await fetch('https://api.modiface.com/v1/try-on/makeup-hair', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MODIFACE_API_KEY}`,
        'X-API-Version': '2024-01'
      },
      body: formData
    });

    if (!modiFaceResponse.ok) {
      const errorText = await modiFaceResponse.text();
      console.error('ModiFace API Error:', errorText);
      throw new Error(`ModiFace API error: ${modiFaceResponse.status} - ${errorText}`);
    }

    const result = await modiFaceResponse.json();
    console.log('✅ ModiFace API Response received');

    // ModiFace typically returns the processed image URL or base64
    let processedImageUrl = result.processed_image_url;
    
    // If base64 is returned instead of URL, convert it
    if (result.processed_image_base64) {
      processedImageUrl = `data:image/jpeg;base64,${result.processed_image_base64}`;
    }

    if (!processedImageUrl) {
      throw new Error('No processed image received from ModiFace');
    }

    const response = {
      success: true,
      result: {
        imageUrl: processedImageUrl,
        confidence: result.confidence || 0.95,
        processing_time: result.processing_time || 'unknown',
        applied_effects: {
          makeup: makeupStyle || null,
          hair_style: hairStyle || null,
          hair_color: hairColor || null
        }
      }
    };

    console.log('🎨 ModiFace processing completed successfully');
    
    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('❌ ModiFace Try-On Error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'Unknown error occurred',
        details: error.stack
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
