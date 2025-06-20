
import { useRef, useEffect } from 'react';

interface FaceDetectionProps {
  imageUrl: string;
  onFaceLandmarks: (landmarks: FaceLandmarks) => void;
}

interface FaceLandmarks {
  lips: { x: number; y: number; width: number; height: number };
  leftEye: { x: number; y: number; width: number; height: number };
  rightEye: { x: number; y: number; width: number; height: number };
  face: { x: number; y: number; width: number; height: number };
  eyebrows: { left: { x: number; y: number; width: number; height: number }, right: { x: number; y: number; width: number; height: number } };
  detected: boolean;
  imageWidth?: number;
  imageHeight?: number;
}

export const FaceDetection = ({ imageUrl, onFaceLandmarks }: FaceDetectionProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!imageUrl) return;

    const detectFace = async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        // Get image data for color analysis to find face
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        const faceArea = findFaceByColorAnalysis(imageData, img.width, img.height);

        if (faceArea) {
          const landmarks = calculateFacialLandmarks(faceArea, img.width, img.height);
          console.log('Face detected with landmarks:', landmarks);
          onFaceLandmarks({ ...landmarks, imageWidth: img.width, imageHeight: img.height });
        } else {
          // Fallback to center positioning if no face detected
          const fallbackLandmarks = createFallbackLandmarks(img.width, img.height);
          console.log('Using fallback face landmarks:', fallbackLandmarks);
          onFaceLandmarks({ ...fallbackLandmarks, imageWidth: img.width, imageHeight: img.height });
        }
      };

      img.onerror = () => {
        console.error('Failed to load image for face detection');
        // Pass undefined for dimensions on error, or some default if required by consuming logic
        const fallbackLandmarks = createFallbackLandmarks(400, 300);
        onFaceLandmarks({ ...fallbackLandmarks, imageWidth: 400, imageHeight: 300 });
      };

      img.src = imageUrl;
    };

    detectFace();
  }, [imageUrl, onFaceLandmarks]);

  // Simple color-based face detection
  const findFaceByColorAnalysis = (imageData: ImageData, width: number, height: number) => {
    const data = imageData.data;
    let minX = width, minY = height, maxX = 0, maxY = 0;
    let facePixelCount = 0;

    // Scan for skin-tone pixels
    for (let y = 0; y < height; y += 2) { // Sample every 2nd pixel for performance
      for (let x = 0; x < width; x += 2) {
        const i = (y * width + x) * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Check if pixel looks like skin tone
        if (isSkinTone(r, g, b)) {
          facePixelCount++;
          minX = Math.min(minX, x);
          minY = Math.min(minY, y);
          maxX = Math.max(maxX, x);
          maxY = Math.max(maxY, y);
        }
      }
    }

    // If we found enough skin-tone pixels, return the bounding box
    if (facePixelCount > 100) {
      const padding = 20;
      return {
        x: Math.max(0, minX - padding),
        y: Math.max(0, minY - padding),
        width: Math.min(width, maxX - minX + padding * 2),
        height: Math.min(height, maxY - minY + padding * 2)
      };
    }

    return null;
  };

  // Simple skin tone detection
  const isSkinTone = (r: number, g: number, b: number): boolean => {
    // Basic skin tone detection ranges
    return (
      r > 95 && g > 40 && b > 20 &&
      r > g && r > b &&
      Math.abs(r - g) > 15 &&
      r - b > 15
    ) || (
      r > 220 && g > 210 && b > 170 && // Light skin
      Math.abs(r - g) < 15 && Math.abs(r - b) < 15
    ) || (
      r > 120 && r < 180 && // Medium skin
      g > 80 && g < 140 &&
      b > 50 && b < 100
    );
  };

  const calculateFacialLandmarks = (faceArea: any, imgWidth: number, imgHeight: number): FaceLandmarks => {
    const { x, y, width, height } = faceArea;
    
    return {
      face: { x, y, width, height },
      lips: {
        x: x + width * 0.3,
        y: y + height * 0.7,
        width: width * 0.4,
        height: height * 0.1
      },
      leftEye: {
        x: x + width * 0.2,
        y: y + height * 0.35,
        width: width * 0.2,
        height: height * 0.08
      },
      rightEye: {
        x: x + width * 0.6,
        y: y + height * 0.35,
        width: width * 0.2,
        height: height * 0.08
      },
      eyebrows: {
        left: {
          x: x + width * 0.18,
          y: y + height * 0.28,
          width: width * 0.22,
          height: height * 0.05
        },
        right: {
          x: x + width * 0.6,
          y: y + height * 0.28,
          width: width * 0.22,
          height: height * 0.05
        }
      },
      detected: true
    };
  };

  const createFallbackLandmarks = (imgWidth: number, imgHeight: number): FaceLandmarks => {
    // Center-based fallback when no face is detected
    const centerX = imgWidth / 2;
    const centerY = imgHeight / 2;
    const faceWidth = Math.min(imgWidth * 0.4, imgHeight * 0.5);
    const faceHeight = Math.min(imgHeight * 0.6, imgWidth * 0.8);
    const faceX = centerX - faceWidth / 2;
    const faceY = centerY - faceHeight / 2;

    return {
      face: { x: faceX, y: faceY, width: faceWidth, height: faceHeight },
      lips: {
        x: faceX + faceWidth * 0.3,
        y: faceY + faceHeight * 0.7,
        width: faceWidth * 0.4,
        height: faceHeight * 0.1
      },
      leftEye: {
        x: faceX + faceWidth * 0.2,
        y: faceY + faceHeight * 0.35,
        width: faceWidth * 0.2,
        height: faceHeight * 0.08
      },
      rightEye: {
        x: faceX + faceWidth * 0.6,
        y: faceY + faceHeight * 0.35,
        width: faceWidth * 0.2,
        height: faceHeight * 0.08
      },
      eyebrows: {
        left: {
          x: faceX + faceWidth * 0.18,
          y: faceY + faceHeight * 0.28,
          width: faceWidth * 0.22,
          height: faceHeight * 0.05
        },
        right: {
          x: faceX + faceWidth * 0.6,
          y: faceY + faceHeight * 0.28,
          width: faceWidth * 0.22,
          height: faceHeight * 0.05
        }
      },
      detected: false
    };
  };

  return <canvas ref={canvasRef} className="hidden" />;
};

export type { FaceLandmarks };
