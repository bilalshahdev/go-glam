
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, ShoppingCart, Info } from "lucide-react";
import { ProductDetailsModal } from "./ProductDetailsModal";

interface Product {
  id: string;
  name: string;
  color: string;
  price: string;
  description: string;
  rating: number;
  shade: string;
  finish: string;
  brand: string;
  image?: string;
}

interface MakeupSelectorProps {
  onSelectMakeup: (makeup: string) => void;
  selectedMakeup: string;
}

export const MakeupSelector = ({ onSelectMakeup, selectedMakeup }: MakeupSelectorProps) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showModal, setShowModal] = useState(false);

  const makeupCategories = {
    lips: [
      { 
        id: "rouge-signature-430", 
        name: "Rouge Signature Liquid Lipstick", 
        color: "#8B1538", 
        price: "$11.99",
        description: "Ultra-lightweight liquid lipstick with up to 24HR wear",
        rating: 4.5,
        shade: "I Explore #430",
        finish: "Matte",
        brand: "L'Oréal Paris"
      },
      { 
        id: "colour-riche-spice", 
        name: "Colour Riche Lipstick", 
        color: "#B22222", 
        price: "$8.99",
        description: "Rich, creamy lipstick with intense color payoff",
        rating: 4.3,
        shade: "Spice It Up",
        finish: "Satin",
        brand: "L'Oréal Paris"
      },
      { 
        id: "les-macarons-berry", 
        name: "Les Macarons Liquid Lipstick", 
        color: "#800080", 
        price: "$9.99",
        description: "Scented liquid lipstick with bold color and comfort",
        rating: 4.2,
        shade: "Berry Cherie",
        finish: "Matte",
        brand: "L'Oréal Paris"
      },
      { 
        id: "infallible-coral", 
        name: "Infallible Pro-Matte Liquid Lipstick", 
        color: "#FF6347", 
        price: "$12.99",
        description: "16HR wear liquid lipstick that doesn't dry out lips",
        rating: 4.4,
        shade: "Coral Showdown",
        finish: "Matte",
        brand: "L'Oréal Paris"
      },
      { 
        id: "rouge-signature-pink", 
        name: "Rouge Signature Liquid Lipstick", 
        color: "#FF69B4", 
        price: "$11.99",
        description: "Ultra-lightweight liquid lipstick with up to 24HR wear",
        rating: 4.5,
        shade: "I Pink #110",
        finish: "Matte",
        brand: "L'Oréal Paris"
      },
      { 
        id: "colour-riche-red", 
        name: "Colour Riche Lipstick", 
        color: "#DC143C", 
        price: "$8.99",
        description: "Rich, creamy lipstick with intense color payoff",
        rating: 4.3,
        shade: "Classic Red",
        finish: "Satin",
        brand: "L'Oréal Paris"
      },
      { 
        id: "infallible-nude", 
        name: "Infallible Pro-Matte Liquid Lipstick", 
        color: "#D2B48C", 
        price: "$12.99",
        description: "16HR wear liquid lipstick that doesn't dry out lips",
        rating: 4.4,
        shade: "Nude Allude",
        finish: "Matte",
        brand: "L'Oréal Paris"
      },
      { 
        id: "brilliant-signature-gloss", 
        name: "Brilliant Signature Lip Gloss", 
        color: "#FFB6C1", 
        price: "$9.99",
        description: "High-shine lip gloss with lightweight feel",
        rating: 4.1,
        shade: "Pink Fizz",
        finish: "Glossy",
        brand: "L'Oréal Paris"
      }
    ],
    eyes: [
      { 
        id: "telescopic-mascara", 
        name: "Telescopic Original Mascara", 
        color: "#000000", 
        price: "$11.99",
        description: "Precision brush mascara for long, separated lashes",
        rating: 4.6,
        shade: "Blackest Black",
        finish: "Lengthening",
        brand: "L'Oréal Paris"
      },
      { 
        id: "colour-queen-bronze", 
        name: "Colour Queen Oil Eyeshadow", 
        color: "#CD853F", 
        price: "$7.99",
        description: "Ultra-pigmented oil eyeshadow with metallic finish",
        rating: 4.1,
        shade: "Bronze Divine",
        finish: "Metallic",
        brand: "L'Oréal Paris"
      },
      { 
        id: "paradise-enchanted", 
        name: "Paradise Enchanted Eyeshadow", 
        color: "#9370DB", 
        price: "$8.99",
        description: "Scented eyeshadow with bold, buildable color",
        rating: 4.0,
        shade: "Enchanted",
        finish: "Shimmer",
        brand: "L'Oréal Paris"
      },
      { 
        id: "infallible-amber", 
        name: "Infallible 24HR Eyeshadow", 
        color: "#FFC000", 
        price: "$7.99",
        description: "24-hour wear powder eyeshadow",
        rating: 4.3,
        shade: "Amber Rush",
        finish: "Shimmer",
        brand: "L'Oréal Paris"
      },
      { 
        id: "voluminous-lash", 
        name: "Voluminous Lash Paradise Mascara", 
        color: "#000000", 
        price: "$10.99",
        description: "Volumizing mascara with feathery soft full lashes",
        rating: 4.5,
        shade: "Blackest Black",
        finish: "Volumizing",
        brand: "L'Oréal Paris"
      },
      { 
        id: "infallible-eyeliner", 
        name: "Infallible Pro-Last Eyeliner", 
        color: "#000000", 
        price: "$8.99",
        description: "Waterproof eyeliner with up to 24HR wear",
        rating: 4.2,
        shade: "Black",
        finish: "Matte",
        brand: "L'Oréal Paris"
      },
      { 
        id: "colour-queen-gold", 
        name: "Colour Queen Oil Eyeshadow", 
        color: "#FFD700", 
        price: "$7.99",
        description: "Ultra-pigmented oil eyeshadow with metallic finish",
        rating: 4.1,
        shade: "Golden Hour",
        finish: "Metallic",
        brand: "L'Oréal Paris"
      },
      { 
        id: "paradise-rose", 
        name: "Paradise Enchanted Eyeshadow", 
        color: "#FF69B4", 
        price: "$8.99",
        description: "Scented eyeshadow with bold, buildable color",
        rating: 4.0,
        shade: "Rose Paradise",
        finish: "Shimmer",
        brand: "L'Oréal Paris"
      }
    ],
    face: [
      { 
        id: "true-match-foundation", 
        name: "True Match Foundation", 
        color: "#F5DEB3", 
        price: "$12.99",
        description: "Super-blendable foundation that matches skin tone and texture",
        rating: 4.4,
        shade: "W3 Golden Beige",
        finish: "Natural",
        brand: "L'Oréal Paris"
      },
      { 
        id: "infallible-concealer", 
        name: "Infallible Full Wear Concealer", 
        color: "#DEB887", 
        price: "$10.99",
        description: "Full coverage concealer with 24HR wear",
        rating: 4.5,
        shade: "325 Bisque",
        finish: "Full Coverage",
        brand: "L'Oréal Paris"
      },
      { 
        id: "paradise-blush", 
        name: "Paradise Enchanted Blush", 
        color: "#FFB6C1", 
        price: "$9.99",
        description: "Scented blush with buildable color",
        rating: 4.2,
        shade: "Pink Flamingo",
        finish: "Satin",
        brand: "L'Oréal Paris"
      },
      { 
        id: "true-match-powder", 
        name: "True Match Powder", 
        color: "#F0E68C", 
        price: "$11.99",
        description: "Micro-fine powder that matches skin perfectly",
        rating: 4.3,
        shade: "W3 Golden Beige",
        finish: "Matte",
        brand: "L'Oréal Paris"
      },
      { 
        id: "age-perfect-foundation", 
        name: "Age Perfect Radiant Serum Foundation", 
        color: "#F5DEB3", 
        price: "$14.99",
        description: "Anti-aging foundation with radiant finish",
        rating: 4.6,
        shade: "Golden Sand",
        finish: "Radiant",
        brand: "L'Oréal Paris"
      },
      { 
        id: "true-match-blush", 
        name: "True Match Blush", 
        color: "#FF69B4", 
        price: "$9.99",
        description: "Perfectly coordinated blush to match your skin tone",
        rating: 4.3,
        shade: "Rosy Outlook",
        finish: "Natural",
        brand: "L'Oréal Paris"
      },
      { 
        id: "infallible-setting-spray", 
        name: "Infallible Pro-Spray & Set", 
        color: "transparent", 
        price: "$9.99",
        description: "Makeup setting spray for up to 16HR wear",
        rating: 4.4,
        shade: "Clear",
        finish: "Setting",
        brand: "L'Oréal Paris"
      },
      { 
        id: "true-match-bronzer", 
        name: "True Match Bronzer", 
        color: "#D2691E", 
        price: "$11.99",
        description: "Natural-looking bronzer for sun-kissed glow",
        rating: 4.2,
        shade: "Medium",
        finish: "Natural",
        brand: "L'Oréal Paris"
      }
    ]
  };

  const [activeSubCategory, setActiveSubCategory] = useState<"lips" | "eyes" | "face">("lips");

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    onSelectMakeup(product.name);
  };

  const handleShowDetails = (product: Product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">L'Oréal Paris Makeup</h3>
        <Badge variant="secondary" className="bg-red-100 text-red-700">
          Virtual Try-On
        </Badge>
      </div>
      
      {/* Sub-category tabs */}
      <div className="flex gap-1 mb-4 bg-gray-100 rounded-lg p-1">
        {Object.keys(makeupCategories).map((category) => (
          <button
            key={category}
            onClick={() => setActiveSubCategory(category as any)}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
              activeSubCategory === category
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      {/* Product grid */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {makeupCategories[activeSubCategory].map((product) => (
          <Card
            key={product.id}
            className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
              selectedMakeup === product.name
                ? 'border-red-500 bg-red-50 shadow-lg'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => handleProductSelect(product)}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3">
                <div 
                  className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                  style={{ backgroundColor: product.color === 'transparent' ? '#f3f4f6' : product.color }}
                />
                <div>
                  <h4 className="font-medium text-sm text-gray-900">{product.name}</h4>
                  <p className="text-xs text-gray-600">{product.shade}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-sm text-red-600">{product.price}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs text-gray-600">{product.rating}</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500 mb-2">{product.description}</p>
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-xs">
                {product.finish}
              </Badge>
              {selectedMakeup === product.name && (
                <div className="flex gap-1">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-xs h-6 px-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShowDetails(product);
                    }}
                  >
                    <Info className="w-3 h-3 mr-1" />
                    Details
                  </Button>
                  <Button size="sm" className="text-xs h-6 px-2 bg-red-600 hover:bg-red-700">
                    <ShoppingCart className="w-3 h-3 mr-1" />
                    Buy
                  </Button>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {selectedMakeup && (
        <Button
          onClick={() => {
            onSelectMakeup("");
            setSelectedProduct(null);
          }}
          variant="outline"
          className="w-full mt-4 text-gray-600 hover:bg-red-50 hover:text-red-600 border-gray-200"
        >
          Remove Selection
        </Button>
      )}

      <ProductDetailsModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        product={selectedProduct}
      />
    </div>
  );
};
