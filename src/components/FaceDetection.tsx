import { useEffect, useRef } from 'react';
import { FaceMesh, Results as FaceMeshResults } from '@mediapipe/face_mesh';

interface FaceDetectionProps {
  imageUrl: string;
  onFaceLandmarks: (landmarks: FaceLandmarks) => void;
}

interface FaceLandmarkPoint {
  x: number;
  y: number;
  z?: number; // z is provided by MediaPipe but might not be used for 2D bounding boxes
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
  rawPoints?: FaceLandmarkPoint[]; // Optional: to pass all raw points if needed later
}

// Helper function to calculate bounding box from a list of points
const getBoundingBox = (points: FaceLandmarkPoint[], imageWidth: number, imageHeight: number): BoundingBox => {
  if (!points || points.length === 0) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }

  let minX = imageWidth;
  let minY = imageHeight;
  let maxX = 0;
  let maxY = 0;

  points.forEach(point => {
    const x = point.x * imageWidth;
    const y = point.y * imageHeight;
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  });

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
};

// Indices for MediaPipe Face Mesh landmarks
// Refer to: https://github.com/google/mediapipe/blob/master/mediapipe/modules/face_geometry/data/canonical_face_model_uv_visualization.png
// And: https://solutions.mediapipe.dev/face_mesh#pose-transformations
const FACE_OVAL_INDICES = [
  10,  338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400,
  377, 376, 375, 390, 249, 263, 362, 382, 381, 380, 374, 373, 398, 384, 385, 386, 387,
  388, 466, 264, 447, 359, 358, 285, 293, 295, 296, 334, 336, 109, 107, 105, 66, 65,
  63, 70, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21,  54, 103,
  67, 107, 10
]; // Simplified list for overall face bounding box

const LIPS_OUTER_INDICES = [
  61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291, 375, 321, 405, 314, 17, 84, 181, 91, 146
]; // Outer lip contour

const LEFT_EYE_INDICES = [
  33, 7, 163, 144, 145, 153, 154, 155, 133, 246, 161, 160, 159, 158, 157, 173
]; // Left eye contour

const RIGHT_EYE_INDICES = [
  263, 249, 390, 373, 374, 380, 381, 382, 362, 466, 388, 387, 386, 385, 384, 398
]; // Right eye contour

const LEFT_EYEBROW_INDICES = [
  70, 63, 105, 66, 107, 55, 65, 52, 53, 46
]; // Left eyebrow

const RIGHT_EYEBROW_INDICES = [
  300, 293, 334, 296, 336, 285, 295, 282, 283, 276
]; // Right eyebrow


const createFallbackLandmarks = (imgWidth: number, imgHeight: number): FaceLandmarks => {
  const fallbackBox = { x: 0, y: 0, width: imgWidth, height: imgHeight }; // Default to full image if no face
  return {
    face: fallbackBox,
    lips: { x: imgWidth * 0.4, y: imgHeight * 0.7, width: imgWidth * 0.2, height: imgHeight * 0.1 },
    leftEye: { x: imgWidth * 0.25, y: imgHeight * 0.35, width: imgWidth * 0.2, height: imgHeight * 0.1 },
    rightEye: { x: imgWidth * 0.55, y: imgHeight * 0.35, width: imgWidth * 0.2, height: imgHeight * 0.1 },
    eyebrows: {
      left: { x: imgWidth * 0.25, y: imgHeight * 0.25, width: imgWidth * 0.2, height: imgHeight * 0.05 },
      right: { x: imgWidth * 0.55, y: imgHeight * 0.25, width: imgWidth * 0.2, height: imgHeight * 0.05 },
    },
    detected: false,
    rawPoints: [],
  };
};

export const FaceDetection = ({ imageUrl, onFaceLandmarks }: FaceDetectionProps) => {
  const faceMeshRef = useRef<FaceMesh | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    // Initialize FaceMesh
    const faceMesh = new FaceMesh({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
    });

    faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true, // Important for detailed landmarks like lips, eyes
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5, // Not strictly needed for static images but good default
    });

    faceMesh.onResults((results: FaceMeshResults) => {
      const img = imageRef.current;
      if (!img) {
        console.error("Image element not available for landmark processing.");
        onFaceLandmarks(createFallbackLandmarks(100,100)); // Placeholder dimensions
        return;
      }
      const { width: imageWidth, height: imageHeight } = img;

      if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
        const landmarks = results.multiFaceLandmarks[0]; // Use the first detected face

        const denormalizedLandmarks = landmarks.map(point => ({
          x: point.x, // Keep normalized for getBoundingBox which expects normalized
          y: point.y,
          z: point.z,
        }));

        const getPoints = (indices: number[]) => indices.map(index => denormalizedLandmarks[index]).filter(pt => pt);

        const faceBox = getBoundingBox(getPoints(FACE_OVAL_INDICES), imageWidth, imageHeight);
        const lipsBox = getBoundingBox(getPoints(LIPS_OUTER_INDICES), imageWidth, imageHeight);
        const leftEyeBox = getBoundingBox(getPoints(LEFT_EYE_INDICES), imageWidth, imageHeight);
        const rightEyeBox = getBoundingBox(getPoints(RIGHT_EYE_INDICES), imageWidth, imageHeight);
        const leftEyebrowBox = getBoundingBox(getPoints(LEFT_EYEBROW_INDICES), imageWidth, imageHeight);
        const rightEyebrowBox = getBoundingBox(getPoints(RIGHT_EYEBROW_INDICES), imageWidth, imageHeight);

        console.log('MediaPipe Landmarks processed:', { faceBox, lipsBox, leftEyeBox, rightEyeBox });
        onFaceLandmarks({
          face: faceBox,
          lips: lipsBox,
          leftEye: leftEyeBox,
          rightEye: rightEyeBox,
          eyebrows: {
            left: leftEyebrowBox,
            right: rightEyebrowBox,
          },
          detected: true,
          rawPoints: denormalizedLandmarks.map(p => ({ x: p.x * imageWidth, y: p.y * imageHeight, z: p.z})),
        });
      } else {
        console.warn('No face detected by MediaPipe.');
        onFaceLandmarks(createFallbackLandmarks(imageWidth, imageHeight));
      }
    });

    faceMeshRef.current = faceMesh;

    // Cleanup
    return () => {
      faceMesh.close().catch(err => console.error("Error closing FaceMesh:", err));
      faceMeshRef.current = null;
    };
  }, [onFaceLandmarks]); // onFaceLandmarks dependency to re-setup if the callback changes (though unlikely)

  useEffect(() => {
    if (!imageUrl || !faceMeshRef.current) {
      // If imageUrl is cleared, potentially send a "not detected" event
      if (!imageUrl) {
          onFaceLandmarks(createFallbackLandmarks(imageRef.current?.width || 100, imageRef.current?.height || 100));
      }
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    imageRef.current = img;

    img.onload = async () => {
      console.log('Image loaded for MediaPipe, sending to FaceMesh:', img.width, img.height);
      if (faceMeshRef.current) {
        try {
          await faceMeshRef.current.send({ image: img });
          console.log('Image sent to FaceMesh.');
        } catch (error) {
          console.error('Error sending image to FaceMesh:', error);
          onFaceLandmarks(createFallbackLandmarks(img.width, img.height));
        }
      } else {
         console.warn("FaceMesh not ready when image loaded.");
         onFaceLandmarks(createFallbackLandmarks(img.width, img.height));
      }
    };

    img.onerror = () => {
      console.error('Failed to load image for MediaPipe face detection:', imageUrl);
      onFaceLandmarks(createFallbackLandmarks(400, 300)); // Default dimensions on error
    };

    img.src = imageUrl;

  }, [imageUrl, onFaceLandmarks]); // Rerun when imageUrl changes

  // No canvas needed for rendering, MediaPipe works with HTMLImageElement directly
  return null;
};

export type { FaceLandmarks, BoundingBox, FaceLandmarkPoint };
