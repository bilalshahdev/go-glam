
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
    const { imageData } = await req.json()
    
    console.log('Processing face detection for image...')
    
    // Simulate face detection processing
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Mock face detection result
    const faceData = {
      faceDetected: true,
      confidence: 0.95,
      landmarks: {
        leftEye: { x: 180, y: 150 },
        rightEye: { x: 220, y: 150 },
        nose: { x: 200, y: 180 },
        mouth: { x: 200, y: 220 }
      },
      boundingBox: {
        x: 160,
        y: 120,
        width: 80,
        height: 120
      }
    }

    console.log('Face detection completed:', faceData)

    return new Response(
      JSON.stringify({ faceData }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  } catch (error) {
    console.error('Face detection error:', error)
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
