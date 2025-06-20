
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Replicate from "https://esm.sh/replicate@0.25.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const REPLICATE_API_KEY = Deno.env.get('REPLICATE_API_KEY');
    if (!REPLICATE_API_KEY) {
      throw new Error('REPLICATE_API_KEY is not set');
    }

    const replicate = new Replicate({
      auth: REPLICATE_API_KEY,
    });

    const { imageData, makeupStyle, hairStyle, hairColor, intensity = 0.8 } = await req.json();
    
    console.log('Replicate Makeup Try-On request:', { makeupStyle, hairStyle, hairColor, intensity });

    // Convert base64 image to data URL if needed
    let imageUrl = imageData;
    if (!imageData.startsWith('http') && !imageData.startsWith('data:')) {
      imageUrl = `data:image/jpeg;base64,${imageData}`;
    }

    let finalImageUrl = imageUrl;
    
    // Apply makeup effects if selected
    if (makeupStyle) {
      console.log('Applying makeup with Replicate...');
      
      let makeupPrompt = "";
      if (makeupStyle.toLowerCase().includes('red') || makeupStyle.toLowerCase().includes('classic')) {
        makeupPrompt = "Apply professional red lipstick directly to the lips and classic eye makeup including winged eyeliner on the eyelids";
      } else if (makeupStyle.toLowerCase().includes('pink') || makeupStyle.toLowerCase().includes('soft')) {
        makeupPrompt = "Apply soft pink lipstick directly to the lips and natural eye makeup with subtle enhancement on the eyelids";
      } else if (makeupStyle.toLowerCase().includes('smoky')) {
        makeupPrompt = "Apply dramatic smoky eye makeup with dark eyeshadow on the eyelids and defined eyes";
      } else if (makeupStyle.toLowerCase().includes('golden')) {
        makeupPrompt = "Apply golden eyeshadow makeup with warm tones on the eyelids and peachy lipstick on the lips";
      } else {
        makeupPrompt = `Apply ${makeupStyle} makeup professionally`;
      }

      const makeupResult = await replicate.run(
        "tencentarc/photomaker:ddfc2b08d209f9fa8c1eca692712918bd449f695dabb4a958da31802a9570fe4",
        {
          input: {
            input_image: finalImageUrl,
            prompt: makeupPrompt + ", high quality, photorealistic, professional makeup application",
            negative_prompt: "blurry, low quality, distorted, unrealistic, cartoon",
            num_steps: 20,
            style_strength_ratio: intensity,
            num_outputs: 1
          }
        }
      );

      if (makeupResult && makeupResult[0]) {
        finalImageUrl = makeupResult[0];
        console.log('Makeup applied successfully');
      }
    }

    // Apply hair color if selected
    if (hairColor && hairColor !== finalImageUrl) {
      console.log('Applying hair color with Replicate...');
      
      const hairColorResult = await replicate.run(
        "prompthero/openjourney:9936c2001faa2194a261c01381f90e65261879985476014a0a37a334593a05eb",
        {
          input: {
            prompt: `Portrait with ${hairColor} hair color, professional hair coloring, natural lighting, high quality`,
            init_image: finalImageUrl,
            strength: 0.6,
            guidance_scale: 7.5,
            num_inference_steps: 20
          }
        }
      );

      if (hairColorResult && hairColorResult[0]) {
        finalImageUrl = hairColorResult[0];
        console.log('Hair color applied successfully');
      }
    }

    // Apply hair style if selected
    if (hairStyle && hairStyle !== finalImageUrl) {
      console.log('Applying hair style with Replicate...');
      
      const hairStyleResult = await replicate.run(
        "prompthero/openjourney:9936c2001faa2194a261c01381f90e65261879985476014a0a37a334593a05eb",
        {
          input: {
            prompt: `Portrait with ${hairStyle} hairstyle, professional hair styling, natural lighting, high quality`,
            init_image: finalImageUrl,
            strength: 0.7,
            guidance_scale: 7.5,
            num_inference_steps: 20
          }
        }
      );

      if (hairStyleResult && hairStyleResult[0]) {
        finalImageUrl = hairStyleResult[0];
        console.log('Hair style applied successfully');
      }
    }

    const result = {
      imageUrl: finalImageUrl,
      appliedStyles: {
        makeup: makeupStyle,
        hairStyle: hairStyle,
        hairColor: hairColor
      },
      intensity: intensity,
      processingMethod: 'replicate-ai-enhanced',
      success: true,
      effects: {
        makeupApplied: !!makeupStyle,
        hairStyleChanged: !!hairStyle,
        hairColorChanged: !!hairColor
      },
      timestamp: Date.now()
    };

    console.log('Replicate processing completed successfully');

    return new Response(
      JSON.stringify({ result }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Replicate makeup try-on error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Processing failed',
        details: 'Replicate AI processing encountered an error' 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }
      }
    );
  }
});
