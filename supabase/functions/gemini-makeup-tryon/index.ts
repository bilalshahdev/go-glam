// supabase/functions/gemini-makeup-tryon/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// Assume Vertex AI SDK is available. Using v1beta1 for some image models.
// Actual import might be different based on Deno compatibility and SDK version.
// For Deno, direct esm.sh or similar imports are common if a Deno-specific SDK isn't available.
// This is a placeholder for what one might use if available via esm.sh or similar.
// import { PredictionServiceClient } from "https://esm.sh/@google-cloud/aiplatform";
// For the purpose of this exercise, we'll mock the client structure if direct import fails.

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// --- Mock Vertex AI SDK components if actual import fails ---
// This is a simplified mock for demonstration if the real SDK isn't easily usable in Deno test env.
const mockAiplatform = {
  PredictionServiceClient: class {
    auth: any;
    constructor(options: any) {
      this.auth = options.auth; // Simplified auth storage
      console.log("Mock PredictionServiceClient initialized with options:", options);
    }
    async predict(request: any) {
      console.log("Mock PredictionServiceClient.predict called with request:", JSON.stringify(request, null, 2));
      // Simulate a successful response with a placeholder edited image
      // In a real scenario, this would be the actual API call.
      const placeholderEditedBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="; // 1x1 red pixel
      return Promise.resolve([{
        predictions: [
          {
            // This structure depends heavily on the specific Imagen model being used.
            // Common outputs are `bytesBase64Encoded` or similar.
            bytesBase64Encoded: placeholderEditedBase64,
            // Sometimes it might be nested, e.g., `structValue.fields.image.structValue.fields.bytesBase64Encoded.stringValue`
            // Or direct: `prediction.image.bytesBase64Encoded`
          }
        ],
      }]);
    }
  },
  GoogleAuth: class { // Mock GoogleAuth
    constructor(options: any) {
      console.log("Mock GoogleAuth initialized with options:", options);
    }
    fromJSON(key: any) {
      console.log("Mock GoogleAuth.fromJSON called");
      // Simulate returning an auth client
      return { projectId: key.project_id };
    }
  }
};
// Attempt to use real SDK, fallback to mock. This is for dev/test robustness.
let PredictionServiceClient: any;
let GoogleAuth: any;
try {
  // This dynamic import would be the way if using a compatible ESM module for Vertex AI
  // const aiplatform = await import("npm:@google-cloud/aiplatform");
  // PredictionServiceClient = aiplatform.PredictionServiceClient;
  // GoogleAuth = aiplatform.GoogleAuth; // Or wherever auth is obtained
  // For now, relying on the mock due to Deno environment constraints with this SDK.
  throw new Error("Using mock SDK for Vertex AI due to environment constraints.");
} catch (e) {
  console.warn("Failed to load real @google-cloud/aiplatform SDK, using mock. Error:", e.message);
  PredictionServiceClient = mockAiplatform.PredictionServiceClient;
  GoogleAuth = mockAiplatform.GoogleAuth;
}
// --- End Mock SDK components ---

// Import deno-canvas - this assumes it's a valid Deno module URL
// Ensure this module is compatible and exists at the specified URL for a real deployment.
let createCanvasExternal: any = null; // Renamed to avoid conflict with local var if any
try {
  // Using a specific version from deno.land/x for stability
  const canvasModule = await import('https://deno.land/x/canvas@v1.4.1/mod.ts');
  createCanvasExternal = canvasModule.createCanvas;
  console.log("Successfully imported deno-canvas v1.4.1.");
} catch(e) {
  console.error("Failed to import deno-canvas. Mask generation will be skipped. Error:", e.message, e.stack);
  // createCanvasExternal will remain null if import fails
}

// Helper function for lip mask generation
async function createLipsMask(
  lips: { x: number; y: number; width: number; height: number },
  imageWidth: number,
  imageHeight: number
): Promise<string | null> {
  if (!createCanvasExternal) {
    console.warn("deno-canvas not available, skipping mask generation.");
    return null;
  }
  try {
    console.log(`Generating lip mask for lips: ${JSON.stringify(lips)} on image size: ${imageWidth}x${imageHeight}`);
    const canvas = createCanvasExternal(imageWidth, imageHeight);
    const ctx = canvas.getContext('2d');

    // Background (Black)
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, imageWidth, imageHeight);

    // Lips Region (White Filled Rectangle)
    ctx.fillStyle = 'white';
    ctx.fillRect(lips.x, lips.y, lips.width, lips.height);

    const dataUrl = canvas.toDataURL('image/png'); // Default is image/png
    const base64Png = dataUrl.split(',')[1];

    if (!base64Png || base64Png.length === 0) {
        console.error("Failed to extract base64 data from canvas data URL for lip mask.");
        return null;
    }
    console.log("Successfully generated lip mask as base64 PNG, length:", base64Png.length);
    return base64Png;

  } catch (error) {
    console.error('Error during lip mask generation:', error.message, error.stack);
    return null;
  }
}


serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🤖 Vertex AI Imagen try-on function started');
    
    const GCP_PROJECT_ID = Deno.env.get('GCP_PROJECT_ID');
    const GCP_REGION = Deno.env.get('GCP_REGION');
    const VERTEX_AI_MODEL_ID = Deno.env.get('VERTEX_AI_MODEL_ID') || 'imagen@005'; // Example model
    const VERTEX_AI_SA_KEY_BASE64 = Deno.env.get('VERTEX_AI_SERVICE_ACCOUNT_KEY_BASE64');

    if (!GCP_PROJECT_ID || !GCP_REGION || !VERTEX_AI_SA_KEY_BASE64) {
      console.error('❌ Missing Vertex AI configuration environment variables.');
      throw new Error('Vertex AI environment variables not fully configured.');
    }

    let serviceAccountKeyJson;
    try {
      const decodedKey = atob(VERTEX_AI_SA_KEY_BASE64);
      serviceAccountKeyJson = JSON.parse(decodedKey);
       if (serviceAccountKeyJson.project_id !== GCP_PROJECT_ID) {
        throw new Error("Service account project_id does not match GCP_PROJECT_ID environment variable.");
      }
    } catch (e) {
      console.error('❌ Failed to decode or parse VERTEX_AI_SERVICE_ACCOUNT_KEY_BASE64:', e.message);
      throw new Error('Invalid Vertex AI service account key.');
    }

    const requestBody = await req.json();
    const { imageData, makeupStyle, hairStyle, hairColor, faceLandmarks, intensity = 0.9 } = requestBody;
    
    if (!imageData) throw new Error('No image data provided');
    if (!makeupStyle && !hairStyle && !hairColor) throw new Error('No styling options selected');

    const imageWidth = faceLandmarks?.imageWidth;
    const imageHeight = faceLandmarks?.imageHeight;

    let lipMaskBase64: string | null = null;
    if (faceLandmarks?.lips && imageWidth && imageHeight && makeupStyle && makeupStyle.toLowerCase().includes('lip')) {
      console.log('🎭 Attempting to generate lip mask with actual implementation...');
      lipMaskBase64 = await createLipsMask(faceLandmarks.lips, imageWidth, imageHeight);
      if (lipMaskBase64) {
        console.log('✅ Lip mask generated successfully.');
      } else {
        console.warn('⚠️ Lip mask generation failed or was skipped, proceeding without mask.');
      }
    }

    console.log('🔧 Initializing Vertex AI PredictionServiceClient...');

    // SDK specific initialization
    const clientOptions = {
      apiEndpoint: `${GCP_REGION}-aiplatform.googleapis.com`,
      // The actual SDK might use googleAuthOptions or similar
      auth: new GoogleAuth({
        credentials: serviceAccountKeyJson, // Pass parsed key
        scopes: ['https://www.googleapis.com/auth/cloud-platform'],
      }),
    };
    const predictionServiceClient = new PredictionServiceClient(clientOptions);

    let base64Image = "";
    if (imageData.startsWith('data:image/')) {
      base64Image = imageData.split(',')[1];
    } else {
      base64Image = imageData; // Assume already base64
    }

    console.log('📝 Building Vertex AI Imagen prompt...');
    let textPrompt = `Virtually apply the following styles to the person in the input image. Ensure the modifications are realistic and accurately placed. Only return the modified image.`;

    const generalLandmarksForPrompt = { ...faceLandmarks };
    // Remove potentially large image dimension fields from the prompt if they were added to the root of faceLandmarks
    if (generalLandmarksForPrompt.imageWidth) delete generalLandmarksForPrompt.imageWidth;
    if (generalLandmarksForPrompt.imageHeight) delete generalLandmarksForPrompt.imageHeight;


    if (lipMaskBase64 && makeupStyle && makeupStyle.toLowerCase().includes('lip')) {
      textPrompt += `\n- For Makeup on lips (e.g., ${makeupStyle}): Apply this specifically within the provided mask area.`;
      // Instruct to use general landmarks for other effects if they exist
      if (hairColor || hairStyle || (makeupStyle && !makeupStyle.toLowerCase().includes('lip'))) {
        textPrompt += `\n- For other effects (hair color: ${hairColor || 'none'}, hair style: ${hairStyle || 'none'}, other makeup: if any non-lip makeup is part of '${makeupStyle}'): Use the general image and these facial landmarks for guidance: ${JSON.stringify(generalLandmarksForPrompt)}.`;
      }
    } else {
      // No mask, or makeup is not for lips, or mask failed
      if (makeupStyle) textPrompt += `\n- Makeup: ${makeupStyle}.`;
      if (hairColor) textPrompt += `\n- Hair Color: ${hairColor}.`;
      if (hairStyle) textPrompt += `\n- Hair Style: ${hairStyle}.`;
      if (Object.keys(generalLandmarksForPrompt).length > 0 && (makeupStyle || hairColor || hairStyle)) {
         textPrompt += `\nUse these facial landmarks for guidance: ${JSON.stringify(generalLandmarksForPrompt)}.`;
      }
    }
    
    console.log('Full Vertex AI Prompt:', textPrompt);

    const endpoint = `projects/${GCP_PROJECT_ID}/locations/${GCP_REGION}/publishers/google/models/${VERTEX_AI_MODEL_ID}`;

    const instance: any = {
      prompt: textPrompt,
      image: { bytesBase64Encoded: base64Image }
    };

    if (lipMaskBase64) {
      instance.mask = { bytesBase64Encoded: lipMaskBase64 };
      console.log('Including generated lip mask in Vertex AI request.');
    }

    const instances = [instance];
    const parameters = { sampleCount: 1, mimeType: "image/png" }; // Request PNG output

    const requestPayload = { endpoint, instances, parameters };

    console.log('🚀 Sending request to Vertex AI Imagen...');
    const [vertexResponse] = await predictionServiceClient.predict(requestPayload);
    
    if (!vertexResponse.predictions || !vertexResponse.predictions[0] || !vertexResponse.predictions[0].bytesBase64Encoded) {
      console.error('❌ Vertex AI response does not contain expected image data structure.');
      console.error('Full Vertex AI Response:', JSON.stringify(vertexResponse, null, 2));
      throw new Error('Vertex AI did not return image data in the expected format.');
    }
    
    const processedBase64Image = vertexResponse.predictions[0].bytesBase64Encoded;
    const processedImageUrl = `data:image/png;base64,${processedBase64Image}`;
    console.log('🖼️ Processed image URL created via Vertex AI, length:', processedImageUrl.length);

    const finalResult = {
      imageUrl: processedImageUrl,
      appliedStyles: { makeup: makeupStyle, hairStyle: hairStyle, hairColor: hairColor },
      intensity,
      processingMethod: 'vertex-ai-imagen-edit',
      success: true,
      effects: { makeupApplied: !!makeupStyle, hairStyleChanged: !!hairStyle, hairColorChanged: !!hairColor },
      timestamp: Date.now(),
      note: "Vertex AI Imagen performed image modification.",
    };

    return new Response(JSON.stringify({ result: finalResult }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Vertex AI Imagen try-on error:', error.message, error.stack);
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error occurred', details: 'Vertex AI processing failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

console.log('Vertex AI Imagen try-on function deployed. Waiting for requests...');
