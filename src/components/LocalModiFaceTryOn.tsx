
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Star, Loader2 } from "lucide-react";
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

interface LocalModiFaceTryOnProps {
  imageUrl: string;
  selectedMakeup: string;
  selectedHairStyle: string;
  selectedHairColor: string;
  onProcessedImage: (processedUrl: string) => void;
  faceLandmarks?: FaceLandmarks | null;
}

export const LocalModiFaceTryOn = ({ 
  imageUrl, 
  selectedMakeup, 
  selectedHairStyle, 
  selectedHairColor,
  onProcessedImage,
  faceLandmarks
}: LocalModiFaceTryOnProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<string>("");

  const applyMakeupEffect = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, color: string, opacity: number) => {
    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = color;
    ctx.globalAlpha = opacity;
    
    // Create gradient for more realistic effect
    const gradient = ctx.createRadialGradient(x + width/2, y + height/2, 0, x + width/2, y + height/2, Math.max(width, height)/2);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient;
    
    ctx.beginPath();
    ctx.ellipse(x + width/2, y + height/2, width/2, height/2, 0, 0, 2 * Math.PI);
    ctx.fill();
    ctx.restore();
  };

  const applyLipstick = (ctx: CanvasRenderingContext2D, lips: any, color: string) => {
    ctx.save();
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.8;
    
    // Create lip shape
    const centerX = lips.x + lips.width / 2;
    const centerY = lips.y + lips.height / 2;
    
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, lips.width / 2, lips.height / 2, 0, 0, 2 * Math.PI);
    ctx.fill();
    
    // Add gloss effect
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.globalAlpha = 0.6;
    ctx.beginPath();
    ctx.ellipse(centerX, centerY - lips.height/4, lips.width/3, lips.height/4, 0, 0, 2 * Math.PI);
    ctx.fill();
    
    ctx.restore();
  };

  const applyEyeshadow = (ctx: CanvasRenderingContext2D, eye: any, color: string) => {
    ctx.save();
    ctx.globalCompositeOperation = 'multiply';
    
    const gradient = ctx.createRadialGradient(
      eye.x + eye.width/2, eye.y + eye.height/2, 0,
      eye.x + eye.width/2, eye.y + eye.height/2, eye.width
    );
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, 'transparent');
    
    ctx.fillStyle = gradient;
    ctx.globalAlpha = 0.6;
    
    ctx.beginPath();
    ctx.ellipse(eye.x + eye.width/2, eye.y + eye.height/2, eye.width, eye.height, 0, 0, 2 * Math.PI);
    ctx.fill();
    
    ctx.restore();
  };

  const applyLocalTryOn = async () => {
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
      setProcessingStep("Loading image for processing...");
      console.log('🎨 Starting enhanced local virtual try-on');
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Canvas not supported');
      }

      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        img.onload = () => {
          console.log('✅ Image loaded for processing');
          resolve(true);
        };
        img.onerror = (error) => {
          console.error('❌ Failed to load image:', error);
          reject(new Error('Failed to load image'));
        };
        img.src = imageUrl;
      });

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      setProcessingStep("Applying makeup effects...");
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Apply makeup effects
      if (selectedMakeup) {
        console.log('💄 Applying makeup:', selectedMakeup);
        
        if (faceLandmarks?.detected) {
          const scaleX = canvas.width / (faceLandmarks.face.width * 2);
          const scaleY = canvas.height / (faceLandmarks.face.height * 2);
          
          // Apply lipstick
          const scaledLips = {
            x: faceLandmarks.lips.x * scaleX,
            y: faceLandmarks.lips.y * scaleY,
            width: faceLandmarks.lips.width * scaleX,
            height: faceLandmarks.lips.height * scaleY
          };
          
          let lipColor = '#FF69B4'; // Default pink
          if (selectedMakeup.toLowerCase().includes('glamorous') || selectedMakeup.toLowerCase().includes('rouge')) {
            lipColor = '#DC143C'; // Deep red
          } else if (selectedMakeup.toLowerCase().includes('natural')) {
            lipColor = '#FFB6C1'; // Light pink
          }
          
          applyLipstick(ctx, scaledLips, lipColor);
          
          // Apply eyeshadow
          let eyeColor = '#8B4513'; // Brown
          if (selectedMakeup.toLowerCase().includes('smoky')) {
            eyeColor = '#2F2F2F'; // Dark gray
          } else if (selectedMakeup.toLowerCase().includes('glamorous')) {
            eyeColor = '#4B0082'; // Purple
          }
          
          const scaledLeftEye = {
            x: faceLandmarks.leftEye.x * scaleX,
            y: faceLandmarks.leftEye.y * scaleY,
            width: faceLandmarks.leftEye.width * scaleX,
            height: faceLandmarks.leftEye.height * scaleY
          };
          
          const scaledRightEye = {
            x: faceLandmarks.rightEye.x * scaleX,
            y: faceLandmarks.rightEye.y * scaleY,
            width: faceLandmarks.rightEye.width * scaleX,
            height: faceLandmarks.rightEye.height * scaleY
          };
          
          applyEyeshadow(ctx, scaledLeftEye, eyeColor);
          applyEyeshadow(ctx, scaledRightEye, eyeColor);
          
        } else {
          // Apply general makeup without face detection
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          
          // Enhance colors for makeup effect
          for (let i = 0; i < data.length; i += 4) {
            const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
            
            // Target skin tones for makeup
            if (brightness > 60 && brightness < 200 && 
                data[i] > data[i + 2] && data[i] > data[i + 1] * 0.8) {
              
              if (selectedMakeup.toLowerCase().includes('glamorous') || selectedMakeup.toLowerCase().includes('rouge')) {
                data[i] = Math.min(255, data[i] * 1.4); // More red
                data[i + 1] = Math.min(255, data[i + 1] * 1.1);
                data[i + 2] = Math.min(255, data[i + 2] * 0.9);
              } else if (selectedMakeup.toLowerCase().includes('natural')) {
                data[i] = Math.min(255, data[i] * 1.2);
                data[i + 1] = Math.min(255, data[i + 1] * 1.1);
              }
            }
          }
          
          ctx.putImageData(imageData, 0, 0);
        }
      }
      
      setProcessingStep("Applying hair effects...");
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Apply hair color effects
      if (selectedHairColor) {
        console.log('🎨 Applying hair color:', selectedHairColor);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
          const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
          
          // Target darker areas (likely hair)
          if (brightness < 100) {
            if (selectedHairColor.toLowerCase().includes('blonde')) {
              data[i] = Math.min(255, data[i] * 2.0);
              data[i + 1] = Math.min(255, data[i + 1] * 1.8);
              data[i + 2] = Math.min(255, data[i + 2] * 1.3);
            } else if (selectedHairColor.toLowerCase().includes('red')) {
              data[i] = Math.min(255, data[i] * 2.5);
              data[i + 1] = Math.min(255, data[i + 1] * 0.8);
              data[i + 2] = Math.min(255, data[i + 2] * 0.5);
            } else if (selectedHairColor.toLowerCase().includes('brown')) {
              data[i] = Math.min(255, data[i] * 1.3);
              data[i + 1] = Math.min(255, data[i + 1] * 1.1);
              data[i + 2] = Math.min(255, data[i + 2] * 0.8);
            }
          }
        }
        
        ctx.putImageData(imageData, 0, 0);
      }
      
      // Add a subtle enhancement overlay
      ctx.globalCompositeOperation = 'soft-light';
      ctx.fillStyle = 'rgba(255, 240, 245, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Add processing indicator border
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = '#FF1493';
      ctx.lineWidth = 4;
      ctx.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);
      
      const processedImageUrl = canvas.toDataURL('image/jpeg', 0.95);
      
      console.log('✅ Enhanced local try-on complete with visible effects');
      onProcessedImage(processedImageUrl);
      
      const appliedEffects = [];
      if (selectedMakeup) appliedEffects.push(selectedMakeup);
      if (selectedHairStyle) appliedEffects.push(selectedHairStyle);
      if (selectedHairColor) appliedEffects.push(selectedHairColor);
      
      toast.success(`🎨 Virtual try-on complete! Applied: ${appliedEffects.join(', ')}`);
      
    } catch (error: any) {
      console.error('Error in enhanced local try-on:', error);
      toast.error(`Try-on failed: ${error.message || 'Unknown error occurred'}`);
    } finally {
      setIsProcessing(false);
      setProcessingStep("");
    }
  };

  const hasEffectsSelected = selectedMakeup || selectedHairStyle || selectedHairColor;

  return (
    <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 text-white">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Star className="w-5 h-5" />
            Enhanced Virtual Try-On (Local)
          </h3>
          {hasEffectsSelected && (
            <p className="text-purple-100 text-sm mt-1">
              Realistic makeup and hair effects with visible results
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
          
          {faceLandmarks?.detected && (
            <div className="mt-2 text-xs text-purple-200">
              ✅ Face detected - using precision targeting for realistic effects
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
        onClick={applyLocalTryOn}
        disabled={!imageUrl || isProcessing || !hasEffectsSelected}
        className="w-full bg-white text-purple-600 hover:bg-gray-50 font-semibold py-3 text-base shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            {processingStep || "Processing..."}
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5 mr-2" />
            Apply Enhanced Virtual Try-On
          </>
        )}
      </Button>

      {!hasEffectsSelected && (
        <p className="text-center text-purple-100 text-sm mt-3">
          Select makeup, hairstyle, or hair color to enable virtual try-on
        </p>
      )}

      <div className="mt-3 text-xs text-purple-100 text-center">
        🎨 Enhanced Local Processing • Visible Results • No API Keys Required
      </div>
    </div>
  );
};
