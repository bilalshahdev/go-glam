
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Brain, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface FaceLandmarks {
  face: { x: number; y: number; width: number; height: number };
  lips: { x: number; y: number; width: number; height: number };
  leftEye: { x: number; y: number; width: number; height: number };
  rightEye: { x: number; y: number; width: number; height: number };
  eyebrows: {
    left: { x: number; y: number; width: number; height: number };
    right: { x: number; y: number; width: number; height: number };
  };
  detected: boolean;
  imageWidth?: number;
  imageHeight?: number;
}

interface GeminiTryOnProps {
  imageUrl: string;
  selectedMakeup: string;
  selectedHairStyle: string;
  selectedHairColor: string;
  onProcessedImage: (processedUrl: string) => void;
  faceLandmarks?: FaceLandmarks | null;
}

export const GeminiTryOn = ({ 
  imageUrl, 
  selectedMakeup, 
  selectedHairStyle, 
  selectedHairColor,
  onProcessedImage,
  faceLandmarks
}: GeminiTryOnProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<string>("");
  const [showGeminiLandmarkWarning, setShowGeminiLandmarkWarning] = useState(false);

  const applyGeminiEffects = async () => {
    if (!imageUrl) {
      toast.error("Please capture or upload an image first");
      return;
    }

    if (!selectedMakeup && !selectedHairStyle && !selectedHairColor) {
      toast.error("Please select at least one effect to apply");
      return;
    }

    // Check for landmark quality before processing
    if (!faceLandmarks || !faceLandmarks.detected) {
      setShowGeminiLandmarkWarning(true);
      // toast.warning("Face not clearly detected. Gemini AI results may be less accurate.");
    } else {
      setShowGeminiLandmarkWarning(false); // Reset warning if landmarks are good
    }

    setIsProcessing(true);
    
    try {
      setProcessingStep("Initializing AI processing..."); // Made more generic
      console.log('🤖 Starting AI-powered makeup application (Vertex AI backend)');
      
      const { data: geminiResult, error: geminiError } = await supabase.functions.invoke('gemini-makeup-tryon', {
        body: {
          imageData: imageUrl,
          makeupStyle: selectedMakeup,
          hairStyle: selectedHairStyle,
          hairColor: selectedHairColor,
          faceLandmarks: faceLandmarks,
          intensity: 0.9
        }
      });

      if (geminiError) {
        console.error('Gemini function error:', geminiError);
        throw new Error(`Processing failed: ${geminiError.message || 'Unknown error'}`);
      }

      if (!geminiResult) {
        throw new Error('No response from Gemini processing service');
      }

      setProcessingStep("Applying AI visual effects..."); // Made more generic
      
      if (geminiResult.result?.imageUrl && geminiResult.result.success) {
        console.log('✅ AI image processing successful. Image URL:', geminiResult.result.imageUrl.substring(0, 100) + "...");
        onProcessedImage(geminiResult.result.imageUrl);
        
        const appliedEffects = [];
        if (selectedMakeup) appliedEffects.push(selectedMakeup);
        if (selectedHairStyle) appliedEffects.push(selectedHairStyle);
        if (selectedHairColor) appliedEffects.push(selectedHairColor);
        
        toast.success(`🎨 AI effects applied: ${appliedEffects.join(', ')}`);
      } else if (geminiResult.result && !geminiResult.result.success && geminiResult.result.note) {
        // Handle cases where the function returned success:false with a note
        console.error('AI processing indicated failure:', geminiResult.result.note);
        throw new Error(geminiResult.result.note);
      }
      else {
        console.error('Invalid AI response structure or missing image URL:', geminiResult);
        throw new Error('Invalid response or no image from AI processing service.');
      }
      
    } catch (error: any) {
      console.error('Error in AI effects application:', error);
      toast.error(`AI effects failed: ${error.message || 'Unknown error occurred'}`);
    } finally {
      setIsProcessing(false);
      setProcessingStep("");
    }
  };

  const hasEffectsSelected = selectedMakeup || selectedHairStyle || selectedHairColor;

  return (
    <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Brain className="w-5 h-5" />
            AI Virtual Try-On
          </h3>
          {hasEffectsSelected && (
            <p className="text-purple-100 text-sm mt-1">
              Powered by Google Cloud AI for realistic results
            </p>
          )}
        </div>
      </div>

      {hasEffectsSelected && (
        <div className="mb-4 p-3 bg-white/10 rounded-lg backdrop-blur-sm">
          <h4 className="font-medium text-sm mb-2">Selected Effects (AI):</h4>
          <div className="flex flex-wrap gap-2">
            {selectedMakeup && (
              <span className="px-2 py-1 bg-white/20 rounded-full text-xs">
                💄 {selectedMakeup}
              </span>
            )}
            {selectedHairStyle && (
              <span className="px-2 py-1 bg-white/20 rounded-full text-xs">
                ✂️ {selectedHairStyle}
              </span>
            )}
            {selectedHairColor && (
              <span className="px-2 py-1 bg-white/20 rounded-full text-xs">
                🎨 {selectedHairColor}
              </span>
            )}
          </div>
          
          {faceLandmarks?.detected && (
            <div className="mt-2 text-xs text-purple-200">
              ✅ Face detected - using precision targeting
            </div>
          )}
        </div>
      )}

      {isProcessing && processingStep && (
        <div className="mb-4 p-3 bg-white/10 rounded-lg flex items-center gap-2 backdrop-blur-sm">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">{processingStep}</span>
        </div>
      )}

      <Button
        onClick={applyGeminiEffects}
        disabled={!imageUrl || isProcessing || !hasEffectsSelected}
        className="w-full bg-white text-purple-600 hover:bg-gray-50 font-semibold py-3 text-base shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            {processingStep || "Processing with AI..."}
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5 mr-2" />
            Apply AI Try-On
          </>
        )}
      </Button>

      {!hasEffectsSelected && (
        <p className="text-center text-purple-100 text-sm mt-3">
          Select makeup, hairstyle, or hair color to enable AI try-on
        </p>
      )}

      <div className="mt-3 text-xs text-purple-100 text-center">
        🤖 Powered by Google Cloud AI • Advanced AI image processing
      </div>

      {showGeminiLandmarkWarning && (
        <p className="mt-4 text-sm text-yellow-300 bg-yellow-800/50 p-3 rounded-lg text-center">
          Warning: Face not clearly detected. AI results may be less accurate. For best results, use a clear, front-facing photo.
        </p>
      )}
    </div>
  );
};
