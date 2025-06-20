import { useState, useEffect } from "react";
import { Sparkles, User, LogOut, Camera, Upload, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useTryOnSession } from "@/hooks/useTryOnSession";
import { Navigate } from "react-router-dom";
import { MakeupSelector } from "@/components/MakeupSelector";
import { HairStyleSelector } from "@/components/HairStyleSelector";
import { HairColorSelector } from "@/components/HairColorSelector";
import { CameraCapture } from "@/components/CameraCapture";
import { TryOnEngine } from "@/components/TryOnEngine";
import { ImagePreview } from "@/components/ImagePreview";

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

const Index = () => {
  const { user, loading, signOut } = useAuth();
  const { currentSession, updateSession } = useTryOnSession();
  const [activeCategory, setActiveCategory] = useState<"makeup" | "hairstyle" | "haircolor">("makeup");
  const [selectedMakeup, setSelectedMakeup] = useState<string>("");
  const [selectedHairStyle, setSelectedHairStyle] = useState<string>("");
  const [selectedHairColor, setSelectedHairColor] = useState<string>("");
  const [originalImage, setOriginalImage] = useState<string>("");
  const [processedImage, setProcessedImage] = useState<string>("");
  const [showCamera, setShowCamera] = useState(false);
  const [faceLandmarks, setFaceLandmarks] = useState<FaceLandmarks | null>(null);

  useEffect(() => {
    if (user) {
      updateSession({
        makeup_look: selectedMakeup,
        hair_style: selectedHairStyle,
        hair_color: selectedHairColor,
        original_image_url: originalImage,
        processed_image_url: processedImage,
      });
    }
  }, [selectedMakeup, selectedHairStyle, selectedHairColor, originalImage, processedImage, updateSession, user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const handleImageCaptured = (imageUrl: string) => {
    setOriginalImage(imageUrl);
    setProcessedImage("");
    setShowCamera(false);
  };

  const handleProcessedImage = (processedUrl: string) => {
    setProcessedImage(processedUrl);
  };

  const handleFaceLandmarks = (landmarks: FaceLandmarks) => {
    console.log('Received face landmarks in Index:', landmarks);
    setFaceLandmarks(landmarks);
  };

  const categories = [
    { id: "makeup", label: "Makeup", description: "Lips, Eyes, Face" },
    { id: "hairstyle", label: "Hair Style", description: "Cut & Style" },
    { id: "haircolor", label: "Hair Color", description: "Color & Highlights" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Sparkles className="w-8 h-8 text-pink-500 mr-3" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                Virtual Try-On Studio
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{user.email}</span>
              <Button onClick={signOut} variant="outline" size="sm">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Preview Area */}
          <div className="lg:col-span-2">
            <Card className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-800">Virtual Mirror</h2>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setShowCamera(!showCamera)}
                      variant="outline"
                      size="sm"
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      {showCamera ? 'Hide Camera' : 'Use Camera'}
                    </Button>
                  </div>
                </div>

                {showCamera ? (
                  <CameraCapture 
                    onImageCaptured={handleImageCaptured}
                    isProcessing={false}
                  />
                ) : (
                  <ImagePreview
                    originalImage={originalImage}
                    processedImage={processedImage}
                  />
                )}

                {originalImage && !showCamera && (
                  <div className="mt-6">
                    <TryOnEngine
                      imageUrl={originalImage}
                      selectedMakeup={selectedMakeup}
                      selectedHairStyle={selectedHairStyle}
                      selectedHairColor={selectedHairColor}
                      onProcessedImage={handleProcessedImage}
                      faceLandmarks={faceLandmarks}
                    />
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Controls Sidebar */}
          <div className="space-y-6">
            {/* Category Tabs */}
            <Card className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Try-On Categories</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id as any)}
                    className={`w-full text-left p-4 rounded-xl transition-all duration-200 ${
                      activeCategory === category.id
                        ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg'
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <div className="font-medium">{category.label}</div>
                    <div className={`text-sm ${activeCategory === category.id ? 'text-pink-100' : 'text-gray-500'}`}>
                      {category.description}
                    </div>
                  </button>
                ))}
              </div>
            </Card>

            {/* Product Selection */}
            <Card className="bg-white rounded-2xl shadow-lg p-6">
              {activeCategory === "makeup" && (
                <MakeupSelector 
                  onSelectMakeup={setSelectedMakeup} 
                  selectedMakeup={selectedMakeup}
                />
              )}
              {activeCategory === "hairstyle" && (
                <HairStyleSelector 
                  onSelectStyle={setSelectedHairStyle} 
                  selectedStyle={selectedHairStyle}
                />
              )}
              {activeCategory === "haircolor" && (
                <HairColorSelector 
                  onSelectColor={setSelectedHairColor} 
                  selectedColor={selectedHairColor}
                />
              )}
            </Card>

            {/* Quick Actions */}
            {!originalImage && (
              <Card className="bg-gradient-to-br from-pink-500 to-purple-600 text-white rounded-2xl shadow-lg p-6">
                <div className="text-center">
                  <Wand2 className="w-12 h-12 mx-auto mb-4 opacity-90" />
                  <h3 className="text-lg font-semibold mb-2">Get Started</h3>
                  <p className="text-pink-100 text-sm mb-4">
                    Take a photo or upload an image to begin your virtual makeover
                  </p>
                  <Button
                    onClick={() => setShowCamera(true)}
                    className="w-full bg-white text-purple-600 hover:bg-gray-50"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Start Try-On
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
