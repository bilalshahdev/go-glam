
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
      
      console.log('📤 Calling onProcessedImage with final URL');
      onProcessedImage(finalImageUrl);
      
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
    console.log('💄 Processing makeup with landmarks:', landmarks);

    if (makeup.toLowerCase().includes('red') || makeup.toLowerCase().includes('classic')) {
      // Apply VERY strong red lipstick
      let lipsAppliedByPolygon = false;
      if (landmarks?.detected && landmarks.rawPoints && landmarks.rawPoints.length > 0) {
        const lipPoints = LIPS_OUTER_INDICES.map(index => landmarks.rawPoints![index]).filter(pt => pt);
        
        if (lipPoints.length >= 3) { // Need at least 3 points for a polygon
          console.log('👄 Drawing lips polygon using MediaPipe points.');
          ctx.fillStyle = 'rgba(220, 20, 60, 0.7)'; // Strong red with some alpha
          ctx.beginPath();
          ctx.moveTo(lipPoints[0].x, lipPoints[0].y);
          for (let i = 1; i < lipPoints.length; i++) {
            ctx.lineTo(lipPoints[i].x, lipPoints[i].y);
          }
          ctx.closePath();
          ctx.fill();
          lipsAppliedByPolygon = true;
        }
      }

      // Get image data after potential polygon fill for further pixel manipulation if needed
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      if (!lipsAppliedByPolygon) {
        console.log('👄 Falling back to lips bounding box for lipstick.');
        const lipsBox = landmarks?.lips || (landmarks?.face ? {
          x: landmarks.face.x + landmarks.face.width * 0.3,
          y: landmarks.face.y + landmarks.face.height * 0.7,
          width: landmarks.face.width * 0.4,
          height: landmarks.face.height * 0.1
        } : { // Absolute fallback if no face detected
          x: canvas.width * 0.4, y: canvas.height * 0.7, width: canvas.width * 0.2, height: canvas.height * 0.1
        });

        const expand = 5; // Expand lips bounding box slightly
        for (let y = Math.max(0, Math.floor(lipsBox.y - expand)); y < Math.min(canvas.height, Math.ceil(lipsBox.y + lipsBox.height + expand)); y++) {
          for (let x = Math.max(0, Math.floor(lipsBox.x - expand)); x < Math.min(canvas.width, Math.ceil(lipsBox.x + lipsBox.width + expand)); x++) {
            const i = (y * canvas.width + x) * 4;
            data[i] = 220; data[i + 1] = 20; data[i + 2] = 60; // Red
            data[i + 3] = Math.min(255, data[i+3] + 150); // Increase alpha to make it more opaque
          }
        }
      }
      
      // Apply eye makeup using (now more accurate) bounding boxes
      if (landmarks?.detected && landmarks.leftEye && landmarks.rightEye) {
        console.log('👁️ Applying eye makeup using MediaPipe bounding boxes.');
        [landmarks.leftEye, landmarks.rightEye].forEach(eye => {
          if (eye.width > 0 && eye.height > 0) { // Ensure bounding box is valid
            const expand = 10; // Expand bounding box slightly for a bolder effect
            for (let y = Math.max(0, Math.floor(eye.y - expand)); y < Math.min(canvas.height, Math.ceil(eye.y + eye.height + expand)); y++) {
              for (let x = Math.max(0, Math.floor(eye.x - expand)); x < Math.min(canvas.width, Math.ceil(eye.x + eye.width + expand)); x++) {
                const i = (y * canvas.width + x) * 4;
                data[i] = Math.max(0, data[i] * 0.4);
                data[i + 1] = Math.max(0, data[i + 1] * 0.4);
                data[i + 2] = Math.max(0, data[i + 2] * 0.4);
              }
            }
          }
        });
      }
      ctx.putImageData(imageData, 0, 0); // Put data back after all makeup effects
    } else {
      // If not red/classic makeup, just ensure image data is put back if it was retrieved
      // This case might need more specific handling if other makeup types are implemented
      // For now, if lips polygon was drawn, this is already on canvas.
      // If only eye makeup was to be applied (not currently the case for this component)
      // we would need to ensure imageData is fetched and put back.
    }
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
    
    // Define hair region using potentially more accurate face landmarks
    let hairTop, hairBottom;
    if (landmarks?.detected && landmarks.face) {
      // Estimate hair region based on the face bounding box
      // Hair typically starts above the face bounding box and extends to cover the top part of the face area
      hairTop = Math.max(0, landmarks.face.y - landmarks.face.height * 0.5); // Start 50% of face height above face top
      hairBottom = landmarks.face.y + landmarks.face.height * 0.4; // Cover roughly top 40% of the face height
      console.log('🎨 Defined hair region using MediaPipe face box:', { top: hairTop, bottom: hairBottom, faceY: landmarks.face.y, faceHeight: landmarks.face.height });
    } else {
      // Fallback if no landmarks
      hairTop = 0;
      hairBottom = canvas.height * 0.5;
      console.log('🎨 Defined hair region using fallback:', { hairTop, hairBottom });
    }

    console.log('🎨 Final Hair region for coloring:', { hairTop, hairBottom });

    for (let y = Math.floor(hairTop); y < Math.floor(hairBottom); y++) {
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

    let hairTop, hairBottom;
    if (landmarks?.detected && landmarks.face) {
      hairTop = Math.max(0, landmarks.face.y - landmarks.face.height * 0.5);
      hairBottom = landmarks.face.y + landmarks.face.height * 0.4;
      console.log('✂️ Defined hair region for styling using MediaPipe face box:', { top: hairTop, bottom: hairBottom, faceY: landmarks.face.y, faceHeight: landmarks.face.height });
    } else {
      hairTop = 0;
      hairBottom = canvas.height * 0.5;
      console.log('✂️ Defined hair region for styling using fallback:', { hairTop, hairBottom });
    }
    console.log('✂️ Final Hair region for styling:', { hairTop, hairBottom });


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
    </div>
  );
};
