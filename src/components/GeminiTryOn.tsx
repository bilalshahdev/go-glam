
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
  const [analysisResultText, setAnalysisResultText] = useState<string | null>(null);

  const applyGeminiEffects = async () => {
    if (!imageUrl) {
      toast.error("Please capture or upload an image first");
      return;
    }

    if (!selectedMakeup && !selectedHairStyle && !selectedHairColor) {
      toast.error("Please select an option to get styling advice");
      return;
    }

    setIsProcessing(true);
    setAnalysisResultText(null); // Clear previous results
    
    try {
      setProcessingStep("Initializing Gemini AI analysis...");
      console.log('🤖 Starting Gemini-powered AI analysis');
      
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
        throw new Error('No response from Gemini AI analysis service');
      }

      setProcessingStep("Processing AI Styling Advice...");
      
      if (geminiResult.result?.geminiAnalysis) {
        console.log('✅ Gemini AI analysis successful');
        setAnalysisResultText(geminiResult.result.geminiAnalysis);
        // The image itself is not modified, so we pass back the original image URL
        onProcessedImage(imageUrl);
        console.log("Gemini AI Analysis:", geminiResult.result.geminiAnalysis);
        
        toast.success("🤖 Gemini AI analysis received!");
      } else {
        console.error('Invalid Gemini response structure:', geminiResult);
        throw new Error('Invalid response from Gemini AI analysis service. Missing analysis text.');
      }
      
    } catch (error: any) {
      console.error('Error in Gemini AI analysis:', error);
      toast.error(`Gemini AI analysis failed: ${error.message || 'Unknown error occurred'}`);
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
            Gemini AI Styling Advice & Recommendations
          </h3>
          {hasEffectsSelected && (
            <p className="text-purple-100 text-sm mt-1">
              Get AI-powered styling advice based on your selections.
            </p>
          )}
        </div>
      </div>

      {hasEffectsSelected && (
        <div className="mb-4 p-3 bg-white/10 rounded-lg backdrop-blur-sm">
          <h4 className="font-medium text-sm mb-2">Your Selections for AI Advice:</h4>
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

      {analysisResultText && (
        <div className="mt-6 mb-4 p-4 bg-white/10 rounded-lg backdrop-blur-sm">
          <h4 className="text-lg font-semibold mb-2 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-400" />
            Gemini AI Styling Advice:
          </h4>
          <p className="text-sm text-purple-100 whitespace-pre-wrap">
            {analysisResultText}
          </p>
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
            {processingStep || "Getting AI Styling Advice..."}
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5 mr-2" />
            Get Gemini AI Styling Advice
          </>
        )}
      </Button>

      {!hasEffectsSelected && (
        <p className="text-center text-purple-100 text-sm mt-3">
          Select makeup, hairstyle, or hair color to get Gemini AI styling advice
        </p>
      )}

      <div className="mt-3 text-xs text-purple-100 text-center">
        🤖 Powered by Google Gemini • AI Styling Advice & Recommendations
      </div>
    </div>
  );
};
