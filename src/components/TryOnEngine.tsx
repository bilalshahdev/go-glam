
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Sparkles, Brain, Loader2, DollarSign } from "lucide-react";
import { HuggingFaceTryOn } from "./HuggingFaceTryOn";
import { GeminiTryOn } from "./GeminiTryOn";

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

interface TryOnEngineProps {
  imageUrl: string;
  selectedMakeup: string;
  selectedHairStyle: string;
  selectedHairColor: string;
  onProcessedImage: (processedUrl: string) => void;
  faceLandmarks?: FaceLandmarks | null;
}

export const TryOnEngine = ({ 
  imageUrl, 
  selectedMakeup, 
  selectedHairStyle, 
  selectedHairColor,
  onProcessedImage,
  faceLandmarks
}: TryOnEngineProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<string>("");
  const [showReplicateOption, setShowReplicateOption] = useState(false);

  const applyReplicateMakeup = async () => {
    if (!imageUrl) {
      toast.error("Please capture or upload an image first");
      return;
    }

    if (!selectedMakeup && !selectedHairStyle && !selectedHairColor) {
      toast.error("Please select at least one effect to apply");
      return;
    }

    setIsProcessing(true);
    
    try {
      setProcessingStep("Initializing Replicate AI processing...");
      console.log('Starting Replicate-powered makeup application...');
      
      const { data: replicateResult, error: replicateError } = await supabase.functions.invoke('replicate-makeup-tryon', {
        body: {
          imageData: imageUrl,
          makeupStyle: selectedMakeup,
          hairStyle: selectedHairStyle,
          hairColor: selectedHairColor,
          intensity: 0.8
        }
      });

      if (replicateError) {
        console.error('Replicate function error:', replicateError);
        throw new Error(`Processing failed: ${replicateError.message || 'Unknown error'}`);
      }

      if (!replicateResult) {
        throw new Error('No response from Replicate processing service');
      }

      setProcessingStep("Applying AI-powered effects...");
      
      if (replicateResult.result?.imageUrl) {
        console.log('Replicate processing successful, applying effects...');
        onProcessedImage(replicateResult.result.imageUrl);
        
        const appliedEffects = [];
        if (selectedMakeup) appliedEffects.push(selectedMakeup);
        if (selectedHairStyle) appliedEffects.push(selectedHairStyle);
        if (selectedHairColor) appliedEffects.push(selectedHairColor);
        
        toast.success(`🎨 Realistic virtual try-on complete! Applied: ${appliedEffects.join(', ')}`);
        console.log('Replicate makeup application completed successfully');
      } else {
        console.error('Invalid response structure:', replicateResult);
        throw new Error('Invalid response from Replicate processing service');
      }
      
    } catch (error: any) {
      console.error('Error in Replicate makeup application:', error);
      toast.error(`Try-on failed: ${error.message || 'Unknown error occurred'}`);
    } finally {
      setIsProcessing(false);
      setProcessingStep("");
    }
  };

  const hasEffectsSelected = selectedMakeup || selectedHairStyle || selectedHairColor;

  return (
    <div className="space-y-4">
      {/* Free Hugging Face Option */}
      <HuggingFaceTryOn
        imageUrl={imageUrl}
        selectedMakeup={selectedMakeup}
        selectedHairStyle={selectedHairStyle}
        selectedHairColor={selectedHairColor}
        onProcessedImage={onProcessedImage}
        faceLandmarks={faceLandmarks}
      />

      {/* New Gemini AI Option */}
      <GeminiTryOn
        imageUrl={imageUrl}
        selectedMakeup={selectedMakeup}
        selectedHairStyle={selectedHairStyle}
        selectedHairColor={selectedHairColor}
        onProcessedImage={onProcessedImage}
        faceLandmarks={faceLandmarks}
      />

      {/* Premium Replicate Option (Toggle) */}
      <div className="text-center">
        <Button
          onClick={() => setShowReplicateOption(!showReplicateOption)}
          variant="outline"
          size="sm"
          className="text-purple-600 border-purple-300 hover:bg-purple-50"
        >
          {showReplicateOption ? 'Hide Premium Option' : 'Show Premium AI Option'}
          <DollarSign className="w-4 h-4 ml-2" />
        </Button>
      </div>

      {showReplicateOption && (
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Premium Replicate AI Try-On
              </h3>
              {hasEffectsSelected && (
                <p className="text-purple-100 text-sm mt-1">
                  Professional-grade AI processing for ultra-realistic results
                </p>
              )}
            </div>
          </div>

          {hasEffectsSelected && (
            <div className="mb-4 p-3 bg-white/10 rounded-lg backdrop-blur-sm">
              <h4 className="font-medium text-sm mb-2">Selected Effects:</h4>
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
            </div>
          )}

          {isProcessing && processingStep && (
            <div className="mb-4 p-3 bg-white/10 rounded-lg flex items-center gap-2 backdrop-blur-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">{processingStep}</span>
            </div>
          )}

          <Button
            onClick={applyReplicateMakeup}
            disabled={!imageUrl || isProcessing || !hasEffectsSelected}
            className="w-full bg-white text-purple-600 hover:bg-gray-50 font-semibold py-3 text-base shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                {processingStep || "Processing with Replicate AI..."}
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Apply Premium AI Try-On (~$0.05)
              </>
            )}
          </Button>

          {!hasEffectsSelected && (
            <p className="text-center text-purple-100 text-sm mt-3">
              Select makeup, hairstyle, or hair color to enable premium try-on
            </p>
          )}

          <div className="mt-3 text-xs text-purple-100 text-center">
            💳 Pay-per-use pricing • Professional quality results
          </div>
        </div>
      )}
    </div>
  );
};
