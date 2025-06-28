
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, ShoppingCart, Heart, Share2, Sparkles } from "lucide-react";

interface ProductDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    name: string;
    price: string;
    description: string;
    rating: number;
    shade?: string;
    finish?: string;
    type?: string;
    hold?: string;
    brand: string;
    color?: string;
  } | null;
}

export const ProductDetailsModal = ({ isOpen, onClose, product }: ProductDetailsModalProps) => {
  if (!product) return null;

  const handleTryOn = () => {
    // This will trigger the virtual try-on with this specific product
    console.log(`Starting virtual try-on with ${product.name}`);
    onClose();
    // The actual try-on logic will be handled by the parent components
  };

  const handleAddToCart = () => {
    // This would integrate with an e-commerce platform
    console.log(`Adding ${product.name} to cart`);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `Check out this ${product.brand} product: ${product.name}`,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${product.name} - ${product.price}`);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-900">
            {product.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Product Color/Visual */}
          {product.color && (
            <div className="flex items-center gap-3">
              <div 
                className="w-12 h-12 rounded-full border-4 border-white shadow-lg"
                style={{ backgroundColor: product.color === 'transparent' ? '#f3f4f6' : product.color }}
              />
              <div>
                <p className="font-medium text-gray-900">{product.shade || product.type}</p>
                <p className="text-sm text-gray-600">{product.finish || product.hold}</p>
              </div>
            </div>
          )}

          {/* Brand & Price */}
          <div className="flex items-center justify-between">
            <Badge className="bg-red-600 text-white">{product.brand}</Badge>
            <div className="text-right">
              <p className="text-2xl font-bold text-red-600">{product.price}</p>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm text-gray-600">{product.rating} / 5</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Product Details</h4>
            <p className="text-gray-600 text-sm leading-relaxed">{product.description}</p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 gap-2">
            {product.finish && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Finish</p>
                <p className="font-medium text-gray-900">{product.finish}</p>
              </div>
            )}
            {product.hold && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Hold</p>
                <p className="font-medium text-gray-900">{product.hold}</p>
              </div>
            )}
            {product.type && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Type</p>
                <p className="font-medium text-gray-900">{product.type}</p>
              </div>
            )}
          </div>

          {/* Virtual Try-On Section */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <h4 className="font-medium text-purple-900">Virtual Try-On Available</h4>
            </div>
            <p className="text-sm text-purple-700 mb-3">
              See how this product looks on you with our AI-powered virtual try-on technology.
            </p>
            <Button 
              onClick={handleTryOn}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Try On Virtually
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button 
              onClick={handleAddToCart}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Add to Cart
            </Button>
            <Button variant="outline" size="icon">
              <Heart className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleShare}>
              <Share2 className="w-4 h-4" />
            </Button>
          </div>

          {/* Store Info */}
          <div className="bg-red-50 p-3 rounded-lg text-center">
            <p className="text-sm text-red-700">
              Available at L'Oréal Paris stores and lorealparisusa.com
            </p>
            <p className="text-xs text-red-600 mt-1">
              Free shipping on orders over $35
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
