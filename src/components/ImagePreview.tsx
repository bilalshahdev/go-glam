
import { Card } from "@/components/ui/card";
import { Image as ImageIcon, Download, Camera, Upload, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import { FaceDetection, type FaceLandmarks } from "./FaceDetection";

interface ImagePreviewProps {
  originalImage?: string;
  processedImage?: string;
  onFaceLandmarks?: (landmarks: FaceLandmarks) => void;
}

export const ImagePreview = ({ originalImage, processedImage, onFaceLandmarks }: ImagePreviewProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [processedImageUrl, setProcessedImageUrl] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isReplicateEnhanced, setIsReplicateEnhanced] = useState(false);
  const [showBeforeAfter, setShowBeforeAfter] = useState(false);
  const [faceLandmarks, setFaceLandmarks] = useState<FaceLandmarks | null>(null);

  const downloadImage = (imageUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFaceLandmarks = (landmarks: FaceLandmarks) => {
    console.log('Received face landmarks in ImagePreview:', landmarks);
    setFaceLandmarks(landmarks);
    if (onFaceLandmarks) {
      onFaceLandmarks(landmarks);
    }
  };

  useEffect(() => {
    console.log('📸 ImagePreview: processedImage changed:', !!processedImage);
    console.log('📸 ImagePreview: processedImage URL preview:', processedImage?.substring(0, 100));
    
    if (processedImage) {
      console.log('🔄 Processing image from processing system');
      setIsProcessing(true);
      
      // Check if this is a Replicate-processed image (URL from Replicate)
      if (processedImage.startsWith('http') && !processedImage.includes('ai_processed=true')) {
        console.log('🤖 Replicate-enhanced image detected');
        setIsReplicateEnhanced(true);
        setProcessedImageUrl(processedImage);
        setIsProcessing(false);
      } else if (processedImage.includes('ai_processed=true')) {
        // Legacy local processing
        console.log('💻 Local AI-enhanced image detected');
        setIsReplicateEnhanced(false);
        setProcessedImageUrl(processedImage);
        setIsProcessing(false);
      } else {
        // Direct image URL or data URL
        console.log('🖼️ Direct image URL/data detected');
        setProcessedImageUrl(processedImage);
        setIsReplicateEnhanced(false);
        setIsProcessing(false);
      }
      
      console.log('✅ ImagePreview: processedImageUrl set to:', processedImageUrl?.substring(0, 100));
    } else {
      console.log('🚫 ImagePreview: No processed image, clearing state');
      setProcessedImageUrl("");
      setIsReplicateEnhanced(false);
      setIsProcessing(false);
    }
  }, [processedImage]);

  const displayImage = showBeforeAfter ? originalImage : (processedImageUrl || originalImage);
  
  console.log('🖼️ ImagePreview render:', {
    hasOriginal: !!originalImage,
    hasProcessed: !!processedImageUrl,
    showBeforeAfter,
    displayImage: displayImage?.substring(0, 50)
  });

  return (
    <div className="space-y-6">
      {/* Face Detection Component - Only for original image analysis */}
      {originalImage && (
        <FaceDetection 
          imageUrl={originalImage} 
          onFaceLandmarks={handleFaceLandmarks}
        />
      )}

      {/* Image Display Area */}
      <div className="relative">
        {originalImage ? (
          <div className="relative">
            <div className="aspect-[4/3] bg-gray-100 rounded-xl overflow-hidden">
              <img 
                src={displayImage} 
                alt="Virtual Try-On Preview" 
                className="w-full h-full object-cover transition-all duration-300"
                onMouseEnter={() => processedImageUrl && setShowBeforeAfter(true)}
                onMouseLeave={() => setShowBeforeAfter(false)}
              />
              
              {/* Enhancement Indicator */}
              <div className="absolute top-4 left-4">
                <div className="bg-black/70 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
                  {isReplicateEnhanced ? (
                    <>
                      <Brain className="w-4 h-4" />
                      Replicate AI Enhanced
                    </>
                  ) : processedImageUrl ? (
                    '✨ Enhanced'
                  ) : (
                    <>
                      📸 Original
                      {faceLandmarks && (
                        <span className="text-xs">
                          ({faceLandmarks.detected ? 'Face Detected' : 'Fallback Mode'})
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>
              
              {processedImageUrl && (
                <div className="absolute top-4 right-4">
                  <Button
                    onClick={() => downloadImage(processedImageUrl, isReplicateEnhanced ? 'replicate-makeover.jpg' : 'virtual-makeover.jpg')}
                    size="sm"
                    className="bg-white/90 text-gray-900 hover:bg-white"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                </div>
              )}
            </div>

            {/* Before/After Toggle */}
            {processedImageUrl && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium flex items-center gap-2">
                  {isReplicateEnhanced && <Brain className="w-4 h-4 text-purple-600" />}
                  {showBeforeAfter ? 'Original Image' : (isReplicateEnhanced ? 'Replicate AI Enhanced' : 'Enhanced Image')}
                  <span className="text-xs text-gray-500">(Hover to compare)</span>
                </div>
              </div>
            )}

            {/* Debug Info */}
            {processedImageUrl && (
              <div className="absolute bottom-16 left-4">
                <div className="bg-green-500/80 text-white px-2 py-1 rounded text-xs">
                  ✅ Enhanced Image Ready
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="aspect-[4/3] bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center">
            <div className="text-center">
              <div className="flex justify-center gap-4 mb-4">
                <Camera className="w-12 h-12 text-gray-400" />
                <Upload className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Ready for realistic AI makeover?</h3>
              <p className="text-gray-500">Take a photo or upload an image to get started with AI</p>
            </div>
          </div>
        )}
      </div>

      {/* Processing indicator */}
      {isProcessing && (
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-full">
            <div className="w-4 h-4 animate-spin rounded-full border-2 border-purple-600 border-t-transparent"></div>
            <Brain className="w-4 h-4" />
            Processing makeup effects...
          </div>
        </div>
      )}
      
      {/* Hidden canvas for any future local processing */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};
