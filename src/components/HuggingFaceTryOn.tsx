
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Brain, Loader2 } from "lucide-react";
import { toast } from "sonner";

// Copied from FaceDetection.tsx for compatibility
interface FaceLandmarkPoint {
  x: number;
  y: number;
  z?: number;
}

interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface FaceLandmarks {
  lips: BoundingBox;
  leftEye: BoundingBox;
  rightEye: BoundingBox;
  face: BoundingBox;
  eyebrows: {
    left: BoundingBox;
    right: BoundingBox;
  };
  detected: boolean;
  rawPoints?: FaceLandmarkPoint[]; // Denormalized points (pixel coordinates)
}

// MediaPipe standard outer lip contour indices
const LIPS_OUTER_INDICES = [
  61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291, 375, 321, 405, 314, 17, 84, 181, 91, 146
];


interface HuggingFaceTryOnProps {
  imageUrl: string;
  selectedMakeup: string;
  selectedHairStyle: string;
  selectedHairColor: string;
  onProcessedImage: (processedUrl: string) => void;
  faceLandmarks?: FaceLandmarks | null;
}

export const HuggingFaceTryOn = ({ 
  imageUrl, 
  selectedMakeup, 
  selectedHairStyle, 
  selectedHairColor,
  onProcessedImage,
  faceLandmarks
}: HuggingFaceTryOnProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<string>("");

  const applyStrongEffects = async () => {
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
      setProcessingStep("Loading image...");
      console.log('🎨 Starting bold effects application');
      console.log('Original image URL:', imageUrl);
      console.log('Face landmarks available:', !!faceLandmarks);
      // console.log('Selected effects:', { selectedMakeup, selectedHairStyle, selectedHairColor }); // Verbose
      
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
        // console.log('🎭 Applying makeup step selected.'); // Removed for cleanup
        await applyBoldMakeup(ctx, canvas, selectedMakeup, faceLandmarks);
        effectsApplied++;
        // console.log('✅ Makeup application processed.'); // Removed for cleanup
      }

      // Re-enable hair effects
      if (selectedHairColor) {
        setProcessingStep("Transforming hair color dramatically...");
        // console.log('🎨 Applying hair color:', selectedHairColor); // Removed for cleanup
        await applyDramaticHairColor(ctx, canvas, selectedHairColor, faceLandmarks);
        effectsApplied++;
        // console.log('✅ Hair color applied'); // Removed for cleanup
      }

      if (selectedHairStyle) {
        setProcessingStep("Adding hair styling effects...");
        // console.log('✂️ Applying hair style:', selectedHairStyle); // Removed for cleanup
        await applyVisibleHairStyle(ctx, canvas, selectedHairStyle, faceLandmarks);
        effectsApplied++;
        // console.log('✅ Hair style applied'); // Removed for cleanup
      }

      // Removed diagnostic pixel sampling for cleanup
      // if (landmarks?.detected && landmarks.lips && landmarks.lips.width > 0 && landmarks.lips.height > 0) { ... }
      // if (landmarks?.detected && landmarks.leftEye && landmarks.leftEye.width > 0 && landmarks.leftEye.height > 0) { ... }

      setProcessingStep("Generating final image...");
      const finalImageUrl = canvas.toDataURL('image/jpeg', 0.9);
      
      // Removed enhanced logging for Data URL for cleanup
      // if (finalImageUrl && finalImageUrl.startsWith('data:image/jpeg;base64,')) { ... } else { ... }

      // console.log('📤 Calling onProcessedImage with final URL'); // Removed for cleanup
      onProcessedImage(finalImageUrl);
      
      const appliedEffects = [];
      if (selectedMakeup) appliedEffects.push(selectedMakeup);
      if (selectedHairStyle) appliedEffects.push(selectedHairStyle);
      if (selectedHairColor) appliedEffects.push(selectedHairColor);
      
      console.log('🎉 Processing complete! Effects applied:', appliedEffects);
      toast.success(`🎨 Bold transformation complete! Applied: ${appliedEffects.join(', ')}`);
      
    } catch (error: any) {
      console.error('💥 CRITICAL ERROR in effects application pipeline:', error);
      if (error.message && error.message.includes('canvas')) {
        console.error('🎨 Specific canvas operation error detail:', error.stack);
      }
      toast.error(`Try-on failed: ${error.message || 'Unknown error occurred during canvas operations'}`);
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
    // console.log('💄 Processing makeup with landmarks:', landmarks); // Removed for cleanup

    if (makeup.toLowerCase().includes('red') || makeup.toLowerCase().includes('classic')) {
      // Apply VERY strong red lipstick
      let lipsAppliedByPolygon = false;
      if (landmarks?.detected && landmarks.rawPoints && landmarks.rawPoints.length > 0) {
        const lipPoints = LIPS_OUTER_INDICES.map(index => landmarks.rawPoints![index]).filter(pt => pt);
        
        if (lipPoints.length >= 3) {
          // Lipstick color set to final intended color: 'rgba(220, 20, 60, 1)'
          ctx.fillStyle = 'rgba(220, 20, 60, 1)'; // Original RGB, Alpha 1 (fully opaque)
          // console.log('👄 Lips polygon: fillStyle set to', ctx.fillStyle, 'with', lipPoints.length, 'points.'); // Removed for cleanup
          // console.log('👄 Lips bounding box for reference (not used for polygon fill):', landmarks.lips); // Removed for cleanup

          ctx.beginPath();
          ctx.moveTo(lipPoints[0].x, lipPoints[0].y);
          for (let i = 1; i < lipPoints.length; i++) {
            ctx.lineTo(lipPoints[i].x, lipPoints[i].y);
          }
          ctx.closePath();
          ctx.fill();
          // console.log('👄 Lips polygon drawn and filled.'); // Removed for cleanup
          lipsAppliedByPolygon = true;
        } else {
          // console.log('👄 Not enough points to draw lips polygon (need >= 3, got', lipPoints.length, '). Falling back.'); // Removed for cleanup
        }
      } else {
        // console.log('👄 No detected landmarks or rawPoints for lips polygon. Falling back.'); // Removed for cleanup
      }

      // Fallback lipstick drawing using fillRect, if polygon wasn't drawn
      // This needs to happen BEFORE getImageData for eye makeup
      if (!lipsAppliedByPolygon) {
        // console.log('👄 Applying fallback lipstick using fillRect (Opaque Red).'); // Removed for cleanup
        const lipsBox = landmarks?.lips || (landmarks?.face ? {
          x: landmarks.face.x + landmarks.face.width * 0.3,
          y: landmarks.face.y + landmarks.face.height * 0.7,
          width: landmarks.face.width * 0.4,
          height: landmarks.face.height * 0.1
        } : { // Absolute fallback if no face detected
          x: canvas.width * 0.4, y: canvas.height * 0.7, width: canvas.width * 0.2, height: canvas.height * 0.1
        });

        // Lipstick color set to final intended color: 'rgba(220, 20, 60, 1)'
        ctx.fillStyle = 'rgba(220, 20, 60, 1)'; // Original RGB, Alpha 1 (fully opaque)
        // console.log('👄 Fallback lips rect: fillStyle set to', ctx.fillStyle, 'for lipsBox:', lipsBox); // Removed for cleanup
        if (lipsBox.width > 0 && lipsBox.height > 0) {
          ctx.fillRect(lipsBox.x, lipsBox.y, lipsBox.width, lipsBox.height);
          // console.log('👄 Fallback lips rectangle drawn and filled.'); // Removed for cleanup
        } else {
          // console.log('👄 Fallback lips rectangle has zero width/height. Not drawn.', lipsBox); // Removed for cleanup
        }
      }

      // Now, get image data to apply eye makeup using pixel manipulation.
      // This ensures any lipstick (polygon or fallback rect) is part of the imageData.
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Re-enable eye makeup
      if (landmarks?.detected && landmarks.leftEye && landmarks.rightEye) {
        // console.log('👁️ Applying eye makeup using MediaPipe bounding boxes.'); // Removed for cleanup
        [landmarks.leftEye, landmarks.rightEye].forEach(eye => {
          if (eye.width > 0 && eye.height > 0) { // Ensure bounding box is valid
            const expand = 10; // Expand bounding box slightly for a bolder effect
            for (let y = Math.max(0, Math.floor(eye.y - expand)); y < Math.min(canvas.height, Math.ceil(eye.y + eye.height + expand)); y++) {
              for (let x = Math.max(0, Math.floor(eye.x - expand)); x < Math.min(canvas.width, Math.ceil(eye.x + eye.width + expand)); x++) {
                const i = (y * canvas.width + x) * 4;
                // Darken existing pixels for eye makeup
                data[i] = Math.max(0, data[i] * 0.4);
                data[i + 1] = Math.max(0, data[i + 1] * 0.4);
                data[i + 2] = Math.max(0, data[i + 2] * 0.4);
                // Alpha remains unchanged or could be set to 255 if needed
              }
            }
          }
        });
      }
      ctx.putImageData(imageData, 0, 0); // Put data back after eye makeup
    } else {
      // This 'else' corresponds to: if (!(makeup.toLowerCase().includes('red') || makeup.toLowerCase().includes('classic')))
      // If other makeup types are selected, they would be handled here.
    }
    // console.log('💄 applyBoldMakeup function complete.'); // Removed for cleanup
  };

  // Hair effect functions are now re-enabled
  const applyDramaticHairColor = async (
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    color: string,
    landmarks?: FaceLandmarks | null
  ) => {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // console.log('🎨 Processing hair color:', color); // Removed for cleanup

    const colorMap: { [key: string]: [number, number, number] } = {
      'blonde': [255, 220, 177],
      'brunette': [101, 67, 33],
      'black': [28, 28, 28],
      'red': [184, 66, 73],
      'auburn': [165, 42, 42],
      'silver': [192, 192, 192]
    };

    const targetColor = colorMap[color.toLowerCase()] || [150, 150, 150];
    // console.log('🎨 Using color:', targetColor); // Removed for cleanup
    
    // Define hair region using potentially more accurate face landmarks
    let hairTop, hairBottom;
    if (landmarks?.detected && landmarks.face) {
      // Estimate hair region based on the face bounding box
      // Hair typically starts above the face bounding box and extends to cover the top part of the face area
      hairTop = Math.max(0, landmarks.face.y - landmarks.face.height * 0.5); // Start 50% of face height above face top
      hairBottom = landmarks.face.y + landmarks.face.height * 0.4; // Cover roughly top 40% of the face height
      // console.log('🎨 Defined hair region using MediaPipe face box:', { top: hairTop, bottom: hairBottom, faceY: landmarks.face.y, faceHeight: landmarks.face.height }); // Removed for cleanup
    } else {
      // Fallback if no landmarks
      hairTop = 0;
      hairBottom = canvas.height * 0.5;
      // console.log('🎨 Defined hair region using fallback:', { hairTop, hairBottom }); // Removed for cleanup
    }

    // console.log('🎨 Final Hair region for coloring:', { hairTop, hairBottom }); // Removed for cleanup

    for (let y = Math.floor(hairTop); y < Math.floor(hairBottom); y++) {
      for (let x = 0; x < canvas.width; x++) {
        const i = (y * canvas.width + x) * 4;
        const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
        
        // Apply color to hair regions (avoiding very dark or very light areas)
        if (brightness > 30 && brightness < 200) { // These thresholds help target hair-like regions
          data[i] = targetColor[0];
          data[i + 1] = targetColor[1];
          data[i + 2] = targetColor[2];
        }
      }
    }

    ctx.putImageData(imageData, 0, 0);
    // console.log('🎨 Hair color processing complete'); // Removed for cleanup
  };

  const applyVisibleHairStyle = async (
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    style: string,
    landmarks?: FaceLandmarks | null
  ) => {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // console.log('✂️ Processing hair style:', style); // Removed for cleanup

    let hairTop, hairBottom;
    if (landmarks?.detected && landmarks.face) {
      hairTop = Math.max(0, landmarks.face.y - landmarks.face.height * 0.5);
      hairBottom = landmarks.face.y + landmarks.face.height * 0.4;
      // console.log('✂️ Defined hair region for styling using MediaPipe face box:', { top: hairTop, bottom: hairBottom, faceY: landmarks.face.y, faceHeight: landmarks.face.height }); // Removed for cleanup
    } else {
      hairTop = 0;
      hairBottom = canvas.height * 0.5;
      // console.log('✂️ Defined hair region for styling using fallback:', { hairTop, hairBottom }); // Removed for cleanup
    }
    // console.log('✂️ Final Hair region for styling:', { hairTop, hairBottom }); // Removed for cleanup


    if (style.toLowerCase().includes('curly')) {
      // Add texture and volume for curly hair
      for (let y = Math.floor(hairTop); y < Math.floor(hairBottom); y++) {
        for (let x = 0; x < canvas.width; x++) {
          const i = (y * canvas.width + x) * 4;
          
          // Add curly texture effect
          const textureEffect = Math.sin(x * 0.1) * Math.cos(y * 0.1) * 50;
          data[i] = Math.min(255, Math.max(0, data[i] + textureEffect));
          data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + textureEffect));
          data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + textureEffect));
        }
      }
    } else if (style.toLowerCase().includes('straight')) {
      // Add sleek effect for straight hair
      for (let y = Math.floor(hairTop); y < Math.floor(hairBottom); y++) {
        for (let x = 0; x < canvas.width; x++) {
          const i = (y * canvas.width + x) * 4;
          
          // Sleek and smooth effect
          const brightness = (data[i] + data[i+1] + data[i+2]) / 3;
          if (brightness < 220) { // Avoid over-brightening already light areas
             data[i] = Math.min(255, data[i] * 1.15);
             data[i + 1] = Math.min(255, data[i + 1] * 1.15);
             data[i + 2] = Math.min(255, data[i + 2] * 1.15);
          }
        }
      }
    }

    ctx.putImageData(imageData, 0, 0);
    // console.log('✂️ Hair style processing complete'); // Removed for cleanup
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
    </div>
  );
};
