
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Brain, Loader2 } from "lucide-react";
import { toast } from "sonner";

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

interface BoldCanvasTryOnProps {
  imageUrl: string;
  selectedMakeup: string;
  selectedHairStyle: string;
  selectedHairColor: string;
  onProcessedImage: (processedUrl: string) => void;
  faceLandmarks?: FaceLandmarks | null;
}

export const BoldCanvasTryOn = ({
  imageUrl, 
  selectedMakeup, 
  selectedHairStyle, 
  selectedHairColor,
  onProcessedImage,
  faceLandmarks
}: BoldCanvasTryOnProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<string>("");
  const [showLandmarkWarning, setShowLandmarkWarning] = useState(false);

  const applyStrongEffects = async () => {
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
      setShowLandmarkWarning(true);
      // Optionally, you could toast here as well or instead
      // toast.warning("Face not clearly detected. Effects may be less accurate.");
    } else {
      setShowLandmarkWarning(false); // Reset warning if landmarks are good
    }

    setIsProcessing(true);
    
    try {
      setProcessingStep("Loading image...");
      console.log('🎨 Starting bold effects application');
      console.log('Original image URL:', imageUrl);
      console.log('Face landmarks available:', !!faceLandmarks);
      console.log('Selected effects:', { selectedMakeup, selectedHairStyle, selectedHairColor });
      
      // Create image element from URL
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        img.onload = () => {
          console.log('✅ Image loaded successfully:', img.width, 'x', img.height);
          resolve(null);
        };
        img.onerror = (e) => {
          console.error('❌ Image load error:', e);
          reject(new Error('Failed to load image'));
        };
        img.src = imageUrl;
      });

      // Create canvas for processing
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      console.log('✅ Canvas created and image drawn');

      let effectsApplied = 0;

      // Apply makeup effects with much stronger intensity
      if (selectedMakeup) {
        setProcessingStep("Applying bold makeup...");
        console.log('🎭 Applying makeup:', selectedMakeup);
        await applyBoldMakeup(ctx, canvas, selectedMakeup, faceLandmarks);
        effectsApplied++;
        console.log('✅ Makeup applied');
      }

      // Apply hair color with dramatic changes
      if (selectedHairColor) {
        setProcessingStep("Transforming hair color dramatically...");
        console.log('🎨 Applying hair color:', selectedHairColor);
        await applyDramaticHairColor(ctx, canvas, selectedHairColor, faceLandmarks);
        effectsApplied++;
        console.log('✅ Hair color applied');
      }

      // Apply hair style effects
      if (selectedHairStyle) {
        setProcessingStep("Adding hair styling effects...");
        console.log('✂️ Applying hair style:', selectedHairStyle);
        await applyVisibleHairStyle(ctx, canvas, selectedHairStyle, faceLandmarks);
        effectsApplied++;
        console.log('✅ Hair style applied');
      }

      setProcessingStep("Generating final image...");
      const finalImageUrl = canvas.toDataURL('image/jpeg', 0.9);
      console.log('🖼️ Final image generated, length:', finalImageUrl.length);
      console.log('🖼️ Image URL preview:', finalImageUrl.substring(0, 100) + '...');
      
      console.log('[BoldCanvasTryOn] Before onProcessedImage call. Data:', finalImageUrl.substring(0,100) + "...");
      onProcessedImage(finalImageUrl);
      console.log('[BoldCanvasTryOn] After onProcessedImage call.');
      
      const appliedEffects = [];
      if (selectedMakeup) appliedEffects.push(selectedMakeup);
      if (selectedHairStyle) appliedEffects.push(selectedHairStyle);
      if (selectedHairColor) appliedEffects.push(selectedHairColor);
      
      console.log('🎉 Processing complete! Effects applied:', appliedEffects);
      toast.success(`🎨 Bold transformation complete! Applied: ${appliedEffects.join(', ')}`);
      
    } catch (error: any) {
      console.error('💥 Error in effects application:', error);
      toast.error(`Try-on failed: ${error.message || 'Unknown error occurred'}`);
    } finally {
      setIsProcessing(false);
      setProcessingStep("");
    }
  };

  const applyBoldMakeup = async (
    ctx: CanvasRenderingContext2D, 
    canvas: HTMLCanvasElement, 
    makeup: string, 
    landmarks?: FaceLandmarks | null
  ) => {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    console.log('💄 Processing makeup with landmarks:', !!landmarks);

    if (makeup.toLowerCase().includes('red') || makeup.toLowerCase().includes('classic')) {
      // Apply VERY strong red lipstick
      if (landmarks?.lips) {
        const lips = landmarks.lips;
        console.log('👄 Targeting lips area:', lips);
        
        // Apply bold red color to lips region
        const padding = 5; // Reduced padding for tighter application
        for (let y = Math.max(0, lips.y - padding); y < Math.min(canvas.height, lips.y + lips.height + padding); y++) {
          for (let x = Math.max(0, lips.x - padding); x < Math.min(canvas.width, lips.x + lips.width + padding); x++) {
            const i = (y * canvas.width + x) * 4;
            
            // Strong red lipstick effect
            data[i] = 220;         // Red
            data[i + 1] = 20;      // Green
            data[i + 2] = 60;      // Blue
          }
        }
      } else {
        // Fallback: apply to bottom third of face
        const faceRegion = landmarks?.face || { x: 0, y: canvas.height * 0.4, width: canvas.width, height: canvas.height * 0.6 };
        const lipsY = faceRegion.y + faceRegion.height * 0.7;
        
        for (let y = lipsY; y < Math.min(canvas.height, lipsY + 100); y++) {
          for (let x = faceRegion.x + faceRegion.width * 0.3; x < faceRegion.x + faceRegion.width * 0.7; x++) {
            const i = (y * canvas.width + x) * 4;
            data[i] = 220;
            data[i + 1] = 20;
            data[i + 2] = 60;
          }
        }
      }
      
      // Apply eye makeup
      if (landmarks?.leftEye && landmarks?.rightEye) {
        [landmarks.leftEye, landmarks.rightEye].forEach(eye => {
          for (let y = Math.max(0, eye.y - 15); y < Math.min(canvas.height, eye.y + eye.height + 15); y++) {
            for (let x = Math.max(0, eye.x - 15); x < Math.min(canvas.width, eye.x + eye.width + 15); x++) {
              const i = (y * canvas.width + x) * 4;
              
              // Dark eye makeup
              data[i] = Math.max(0, data[i] * 0.5);
              data[i + 1] = Math.max(0, data[i + 1] * 0.5);
              data[i + 2] = Math.max(0, data[i + 2] * 0.5);
            }
          }
        });
      }
    }

    ctx.putImageData(imageData, 0, 0);
    console.log('💄 Makeup processing complete');
  };

  const applyDramaticHairColor = async (
    ctx: CanvasRenderingContext2D, 
    canvas: HTMLCanvasElement, 
    color: string, 
    landmarks?: FaceLandmarks | null
  ) => {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    console.log('🎨 Processing hair color:', color);

    const colorMap: { [key: string]: [number, number, number] } = {
      'blonde': [255, 220, 177],
      'brunette': [101, 67, 33],
      'black': [28, 28, 28],
      'red': [184, 66, 73],
      'auburn': [165, 42, 42],
      'silver': [192, 192, 192]
    };

    const targetColor = colorMap[color.toLowerCase()] || [150, 150, 150];
    console.log('🎨 Using color:', targetColor);
    
    // Define hair region
    const hairTop = landmarks?.face ? Math.max(0, landmarks.face.y - 100) : 0;
    const hairBottom = landmarks?.face ? landmarks.face.y + (landmarks.face.height * 0.3) : canvas.height * 0.5;

    console.log('🎨 Original Hair region defined by landmarks/fallback:', { hairTop, hairBottom });

    for (let y = hairTop; y < hairBottom; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const i = (y * canvas.width + x) * 4;
        const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
        // Apply color to hair regions (avoiding very dark or very light areas)
        if (brightness > 30 && brightness < 200) {
          data[i] = targetColor[0];
          data[i + 1] = targetColor[1];
          data[i + 2] = targetColor[2];
        }
      }
    }

    ctx.putImageData(imageData, 0, 0);
    console.log('🎨 Hair color processing complete');
  };

  const applyVisibleHairStyle = async (
    ctx: CanvasRenderingContext2D, 
    canvas: HTMLCanvasElement, 
    style: string, 
    landmarks?: FaceLandmarks | null
  ) => {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    console.log('✂️ Processing hair style:', style);

    const hairTop = landmarks?.face ? Math.max(0, landmarks.face.y - 100) : 0;
    const hairBottom = landmarks?.face ? landmarks.face.y + (landmarks.face.height * 0.3) : canvas.height * 0.5;

    if (style.toLowerCase().includes('curly')) {
      // Add texture and volume for curly hair
      for (let y = hairTop; y < hairBottom; y++) {
        for (let x = 0; x < canvas.width; x++) {
          const i = (y * canvas.width + x) * 4;
          
          // Add curly texture effect
          const textureEffect = Math.sin(x * 0.08) * Math.cos(y * 0.08) * 30;
          data[i] = Math.min(255, Math.max(0, data[i] + textureEffect));
          data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + textureEffect));
          data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + textureEffect));
        }
      }
    } else if (style.toLowerCase().includes('straight')) {
      // Add sleek effect for straight hair
      for (let y = hairTop; y < hairBottom; y++) {
        for (let x = 0; x < canvas.width; x++) {
          const i = (y * canvas.width + x) * 4;
          
          // Sleek and smooth effect
          data[i] = Math.min(255, data[i] * 1.2);
          data[i + 1] = Math.min(255, data[i + 1] * 1.2);
          data[i + 2] = Math.min(255, data[i + 2] * 1.2);
        }
      }
    }

    ctx.putImageData(imageData, 0, 0);
    console.log('✂️ Hair style processing complete');
  };

  const hasEffectsSelected = selectedMakeup || selectedHairStyle || selectedHairColor;

  return (
    <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-xl p-6 text-white">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Bold AI Virtual Try-On
          </h3>
          {hasEffectsSelected && (
            <p className="text-green-100 text-sm mt-1">
              {faceLandmarks?.detected ? 'Strong precision targeting with face detection' : 'Bold canvas processing'} - Completely Free!
            </p>
          )}
        </div>
      </div>

      {hasEffectsSelected && (
        <div className="mb-4 p-3 bg-white/10 rounded-lg backdrop-blur-sm">
          <h4 className="font-medium text-sm mb-2">Selected Effects (Bold Application):</h4>
          <div className="flex flex-wrap gap-2">
            {selectedMakeup && (
              <span className="px-2 py-1 bg-white/20 rounded-full text-xs">
                💄 {selectedMakeup} (BOLD)
              </span>
            )}
            {selectedHairStyle && (
              <span className="px-2 py-1 bg-white/20 rounded-full text-xs">
                ✂️ {selectedHairStyle} (DRAMATIC)
              </span>
            )}
            {selectedHairColor && (
              <span className="px-2 py-1 bg-white/20 rounded-full text-xs">
                🎨 {selectedHairColor} (VIBRANT)
              </span>
            )}
          </div>
          
          {faceLandmarks?.detected && (
            <div className="mt-2 text-xs text-green-200">
              ✅ Face detected - using bold precision targeting
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
        onClick={applyStrongEffects}
        disabled={!imageUrl || isProcessing || !hasEffectsSelected}
        className="w-full bg-white text-blue-600 hover:bg-gray-50 font-semibold py-3 text-base shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            {processingStep || "Applying Bold Effects..."}
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5 mr-2" />
            Apply Bold AI Virtual Try-On
          </>
        )}
      </Button>

      {!hasEffectsSelected && (
        <p className="text-center text-green-100 text-sm mt-3">
          Select makeup, hairstyle, or hair color to enable bold AI try-on
        </p>
      )}

      <div className="mt-3 text-xs text-green-100 text-center">
        🎉 No API costs • {faceLandmarks?.detected ? 'Bold precision targeting' : 'Dramatic processing'} • Maximum intensity effects!
      </div>

      {showLandmarkWarning && (
        <p className="mt-4 text-sm text-yellow-300 bg-yellow-800/50 p-3 rounded-lg text-center">
          Warning: Face not clearly detected. Effects are applied generally and may be less accurate. For best results, use a clear, front-facing photo.
        </p>
      )}
    </div>
  );
};
