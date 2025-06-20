
import { useState, useRef, useEffect } from "react";
import { Camera, Video, VideoOff, Upload, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { useTryOnSession } from "@/hooks/useTryOnSession";

interface CameraCaptureProps {
  onImageCaptured: (imageUrl: string) => void;
  isProcessing: boolean;
}

export const CameraCapture = ({ onImageCaptured, isProcessing }: CameraCaptureProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraLoading, setIsCameraLoading] = useState(false);
  const { uploadImage } = useTryOnSession();

  const startCamera = async () => {
    try {
      setIsCameraLoading(true);
      console.log('Starting camera...');
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: false 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        
        // Wait for video to be ready before setting streaming state
        videoRef.current.onloadedmetadata = () => {
          console.log('Video metadata loaded, starting playback');
          if (videoRef.current) {
            videoRef.current.play()
              .then(() => {
                setIsStreaming(true);
                setIsCameraLoading(false);
                toast.success("Camera started! Ready for virtual try-on ✨");
              })
              .catch((error) => {
                console.error('Error playing video:', error);
                setIsCameraLoading(false);
                toast.error("Failed to start video playback");
              });
          }
        };
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      setIsCameraLoading(false);
      toast.error("Unable to access camera. Please check permissions and try again.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop();
        console.log('Stopped track:', track.kind);
      });
      setStream(null);
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsStreaming(false);
    toast.success("Camera stopped");
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current || !isStreaming) {
      toast.error("Camera not ready. Please start camera first.");
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      toast.error("Could not get canvas context");
      return;
    }

    // Check if video has loaded
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      toast.error("Video not ready. Please wait for camera to load.");
      return;
    }

    try {
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      console.log('Capturing photo with dimensions:', canvas.width, 'x', canvas.height);
      
      // Draw the current video frame
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert to blob
      canvas.toBlob(async (blob) => {
        if (!blob) {
          toast.error("Failed to capture image");
          return;
        }

        console.log('Created blob with size:', blob.size);

        // Upload image
        const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
        const imageUrl = await uploadImage(file, 'original');
        
        if (imageUrl) {
          onImageCaptured(imageUrl);
          toast.success("Photo captured! 📸");
        } else {
          toast.error("Failed to upload captured image");
        }
      }, 'image/jpeg', 0.8);
    } catch (error) {
      console.error('Error capturing photo:', error);
      toast.error("Failed to capture photo. Please try again.");
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log('File selected:', file.name, 'Size:', file.size, 'Type:', file.type);

    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast.error("File size too large. Please select an image under 10MB.");
      return;
    }

    try {
      toast.info("Uploading image...");
      const imageUrl = await uploadImage(file, 'original');
      if (imageUrl) {
        onImageCaptured(imageUrl);
        toast.success("Image uploaded! 📸");
      } else {
        toast.error("Failed to upload image");
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error("Failed to upload image. Please try again.");
    }

    // Clear the input
    event.target.value = '';
  };

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  return (
    <Card className="makeup-card p-6 rounded-2xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Camera className="w-6 h-6 text-pink-500" />
          Camera & Upload
        </h2>
        <div className="flex gap-2">
          <Button
            onClick={isStreaming ? stopCamera : startCamera}
            variant={isStreaming ? "destructive" : "default"}
            disabled={isProcessing || isCameraLoading}
          >
            {isCameraLoading ? (
              <>
                <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-transparent border-t-current" />
                Starting...
              </>
            ) : isStreaming ? (
              <>
                <VideoOff className="w-4 h-4 mr-2" />
                Stop Camera
              </>
            ) : (
              <>
                <Video className="w-4 h-4 mr-2" />
                Start Camera
              </>
            )}
          </Button>
          <Button
            onClick={capturePhoto}
            disabled={!isStreaming || isProcessing || isCameraLoading}
            className="bg-pink-500 hover:bg-pink-600 text-white"
          >
            <Camera className="w-4 h-4 mr-2" />
            Capture
          </Button>
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
            disabled={isProcessing}
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload
          </Button>
        </div>
      </div>

      <div className="relative aspect-video bg-gray-100 rounded-xl overflow-hidden">
        {isStreaming || isCameraLoading ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
              style={{ display: isStreaming ? 'block' : 'none' }}
            />
            {isCameraLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                <div className="text-center">
                  <div className="w-12 h-12 animate-spin rounded-full border-4 border-pink-500 border-t-transparent mx-auto mb-4"></div>
                  <p className="text-gray-600">Starting camera...</p>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <div className="text-center">
              <div className="flex justify-center gap-4 mb-4">
                <Camera className="w-16 h-16 text-gray-400" />
                <Image className="w-16 h-16 text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg mb-2">Start your virtual makeover</p>
              <p className="text-gray-400 text-sm">Click "Start Camera" or "Upload" an image</p>
            </div>
          </div>
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />
    </Card>
  );
};
