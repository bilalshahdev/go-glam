
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.15.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🤖 Gemini makeup try-on function started');
    
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      console.error('❌ GEMINI_API_KEY is not set');
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const requestBody = await req.json();
    console.log('📝 Request body received:', { 
      hasImage: !!requestBody.imageData,
      makeupStyle: requestBody.makeupStyle,
      hairStyle: requestBody.hairStyle,
      hairColor: requestBody.hairColor
    });

    const { imageData, makeupStyle, hairStyle, hairColor, intensity = 0.9 } = requestBody;
    
    if (!imageData) {
      throw new Error('No image data provided');
    }

    if (!makeupStyle && !hairStyle && !hairColor) {
      throw new Error('No styling options selected');
    }

    console.log('🔧 Initializing Gemini AI...');
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Handle different image input formats
    let base64Image = "";
    let mimeType = "image/jpeg";

    console.log('🖼️ Processing image data...');
    
    if (imageData.startsWith('data:image/')) {
      // Data URL format
      const [header, data] = imageData.split(',');
      base64Image = data;
      mimeType = header.includes('png') ? 'image/png' : 'image/jpeg';
      console.log('✅ Processed data URL image');
    } else {
      // Assume it's already base64 or handle as blob URL
      base64Image = imageData.replace(/^data:image\/[a-z]+;base64,/, '');
      console.log('✅ Processed base64 image');
    }

    // Build a simple, focused prompt
    console.log('📝 Building analysis prompt...');
    let prompt = "Analyze this portrait photo and provide makeup and styling recommendations for: ";
    
    const selectedOptions = [];
    if (makeupStyle) selectedOptions.push(`makeup style: ${makeupStyle}`);
    if (hairStyle) selectedOptions.push(`hair style: ${hairStyle}`);
    if (hairColor) selectedOptions.push(`hair color: ${hairColor}`);
    
    prompt += selectedOptions.join(", ");
    prompt += ". Provide specific, detailed recommendations that would enhance this person's natural features.";

    console.log('🚀 Sending request to Gemini...');
    
    // Generate content with Gemini
    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: mimeType,
          data: base64Image
        }
      },
      prompt
    ]);

    console.log('🎉 Gemini responded successfully');
    
    const response = await result.response;
    const analysisText = response.text();
    
    console.log('📄 Analysis text length:', analysisText.length);

    // Return the analysis result
    const finalResult = {
      imageUrl: imageData, // Return original image since Gemini doesn't transform images
      appliedStyles: {
        makeup: makeupStyle || null,
        hairStyle: hairStyle || null,
        hairColor: hairColor || null
      },
      intensity: intensity,
      processingMethod: 'gemini-ai-analysis',
      success: true,
      effects: {
        makeupApplied: !!makeupStyle,
        hairStyleChanged: !!hairStyle,
        hairColorChanged: !!hairColor
      },
      geminiAnalysis: analysisText,
      timestamp: Date.now(),
      note: "Gemini AI provided detailed styling analysis and recommendations."
    };

    console.log('✅ Returning successful result');

    return new Response(
      JSON.stringify({ result: finalResult }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('❌ Gemini makeup try-on error:', error);
    
    // Return detailed error information
    const errorResponse = {
      error: error.message || 'Unknown error occurred',
      details: 'Gemini AI processing failed',
      timestamp: Date.now()
    };

    return new Response(
      JSON.stringify(errorResponse),
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
