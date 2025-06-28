
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Star, Loader2 } from "lucide-react";
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

interface ModiFaceTryOnProps {
  imageUrl: string;
  selectedMakeup: string;
  selectedHairStyle: string;
  selectedHairColor: string;
  onProcessedImage: (processedUrl: string) => void;
  faceLandmarks?: FaceLandmarks | null;
}

export const ModiFaceTryOn = ({ 
  imageUrl, 
  selectedMakeup, 
  selectedHairStyle, 
  selectedHairColor,
  onProcessedImage,
  faceLandmarks
}: ModiFaceTryOnProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<string>("");

  const applyModiFaceEffects = async () => {
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
      setProcessingStep("Initializing ModiFace AI processing...");
      console.log('🎨 Starting ModiFace-powered makeup application');
      
      const { data: modiFaceResult, error: modiFaceError } = await supabase.functions.invoke('modiface-makeup-tryon', {
        body: {
          imageData: imageUrl,
          makeupStyle: selectedMakeup,
          hairStyle: selectedHairStyle,
          hairColor: selectedHairColor,
          faceLandmarks: faceLandmarks,
          intensity: 0.85
        }
      });

      if (modiFaceError) {
        console.error('ModiFace function error:', modiFaceError);
        throw new Error(`Processing failed: ${modiFaceError.message || 'Unknown error'}`);
      }

      if (!modiFaceResult) {
        throw new Error('No response from ModiFace processing service');
      }

      setProcessingStep("Applying professional-grade effects...");
      
      if (modiFaceResult.result?.imageUrl) {
        console.log('✅ ModiFace processing successful');
        onProcessedImage(modiFaceResult.result.imageUrl);
        
        const appliedEffects = [];
        if (selectedMakeup) appliedEffects.push(selectedMakeup);
        if (selectedHairStyle) appliedEffects.push(selectedHairStyle);
        if (selectedHairColor) appliedEffects.push(selectedHairColor);
        
        toast.success(`🎨 ModiFace AI try-on complete! Applied: ${appliedEffects.join(', ')}`);
      } else {
        console.error('Invalid ModiFace response structure:', modiFaceResult);
        throw new Error('Invalid response from ModiFace processing service');
      }
      
    } catch (error: any) {
      console.error('Error in ModiFace makeup application:', error);
      toast.error(`ModiFace try-on failed: ${error.message || 'Unknown error occurred'}`);
    } finally {
      setIsProcessing(false);
      setProcessingStep("");
    }
  };

  const hasEffectsSelected = selectedMakeup || selectedHairStyle || selectedHairColor;

  return (
    <div className="bg-gradient-to-r from-pink-600 to-rose-600 rounded-xl p-6 text-white">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Star className="w-5 h-5" />
            ModiFace Professional Try-On
          </h3>
          {hasEffectsSelected && (
            <p className="text-pink-100 text-sm mt-1">
              Industry-leading virtual makeup and hair technology
            </p>
          )}
        </div>
      </div>

      {hasEffectsSelected && (
        <div className="mb-4 p-3 bg-white/10 rounded-lg backdrop-blur-sm">
          <h4 className="font-medium text-sm mb-2">Selected Effects (ModiFace Pro):</h4>
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
            <div className="mt-2 text-xs text-pink-200">
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
        onClick={applyModiFaceEffects}
        disabled={!imageUrl || isProcessing || !hasEffectsSelected}
        className="w-full bg-white text-pink-600 hover:bg-gray-50 font-semibold py-3 text-base shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            {processingStep || "Processing with ModiFace..."}
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5 mr-2" />
            Apply ModiFace Professional Try-On
          </>
        )}
      </Button>

      {!hasEffectsSelected && (
        <p className="text-center text-pink-100 text-sm mt-3">
          Select makeup, hairstyle, or hair color to enable ModiFace try-on
        </p>
      )}

      <div className="mt-3 text-xs text-pink-100 text-center">
        🎨 Powered by ModiFace • Professional beauty technology
      </div>
    </div>
  );
};
