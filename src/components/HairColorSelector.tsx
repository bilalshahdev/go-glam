
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, ShoppingCart, Info } from "lucide-react";
import { ProductDetailsModal } from "./ProductDetailsModal";

interface HairColorProduct {
  id: string;
  name: string;
  color: string;
  price: string;
  description: string;
  rating: number;
  shade: string;
  type: string;
  brand: string;
}

interface HairColorSelectorProps {
  onSelectColor: (color: string) => void;
  selectedColor: string;
}

export const HairColorSelector = ({ onSelectColor, selectedColor }: HairColorSelectorProps) => {
  const [selectedProduct, setSelectedProduct] = useState<HairColorProduct | null>(null);
  const [showModal, setShowModal] = useState(false);

  const hairColors: HairColorProduct[] = [
    { 
      id: "preference-6.3", 
      name: "Préférence Hair Color", 
      color: "#8B4513", 
      price: "$9.99",
      description: "Fade-defying permanent hair color with lasting luminous shine",
      rating: 4.3,
      shade: "6.3 Light Golden Brown",
      type: "Permanent",
      brand: "L'Oréal Paris"
    },
    { 
      id: "excellence-10", 
      name: "Excellence Crème Hair Color", 
      color: "#FAF0BE", 
      price: "$8.99",
      description: "Triple protection permanent hair color with pro-keratin",
      rating: 4.4,
      shade: "10 Extra Light Blonde",
      type: "Permanent",
      brand: "L'Oréal Paris"
    },
    { 
      id: "feria-r68", 
      name: "Feria Multi-Faceted Shimmering Color", 
      color: "#A52A2A", 
      price: "$8.99",
      description: "3x highlights for brilliant shimmer and bold color",
      rating: 4.2,
      shade: "R68 Ruby Rush",
      type: "Permanent",
      brand: "L'Oréal Paris"
    },
    { 
      id: "colorista-washout-pink", 
      name: "Colorista Washout", 
      color: "#FF69B4", 
      price: "$7.99",
      description: "Temporary hair color that washes out in 1-2 shampoos",
      rating: 4.0,
      shade: "Hot Pink Hair",
      type: "Temporary",
      brand: "L'Oréal Paris"
    },
    { 
      id: "colorista-bleach", 
      name: "Colorista Bleach", 
      color: "#F5F5DC", 
      price: "$9.99",
      description: "Hair bleach kit for creating vibrant fashion colors",
      rating: 4.1,
      shade: "Bleach Kit",
      type: "Bleach",
      brand: "L'Oréal Paris"
    },
    { 
      id: "preference-4", 
      name: "Préférence Dark Brown", 
      color: "#2F1B14", 
      price: "$9.99",
      description: "Fade-defying color with luminous shine",
      rating: 4.3,
      shade: "4 Dark Brown",
      type: "Permanent",
      brand: "L'Oréal Paris"
    },
    { 
      id: "feria-b61", 
      name: "Feria Downtown Teal", 
      color: "#008080", 
      price: "$8.99",
      description: "Bold fashion color with 3x highlights",
      rating: 3.9,
      shade: "B61 Downtown Teal",
      type: "Permanent",
      brand: "L'Oréal Paris"
    },
    { 
      id: "colorista-purple", 
      name: "Colorista Semi-Permanent", 
      color: "#8A2BE2", 
      price: "$7.99",
      description: "Semi-permanent hair color that lasts 4-10 washes",
      rating: 4.0,
      shade: "Purple Hair",
      type: "Semi-Permanent",
      brand: "L'Oréal Paris"
    },
    { 
      id: "magic-root-rescue", 
      name: "Magic Root Rescue", 
      color: "#654321", 
      price: "$11.99",
      description: "10-minute root concealer spray",
      rating: 4.2,
      shade: "Medium Brown",
      type: "Root Touch-Up",
      brand: "L'Oréal Paris"
    },
    { 
      id: "colorista-blue", 
      name: "Colorista Hair Makeup", 
      color: "#4169E1", 
      price: "$6.99",
      description: "1-day temporary hair color spray",
      rating: 3.8,
      shade: "Blue Hair",
      type: "1-Day Color",
      brand: "L'Oréal Paris"
    },
    { 
      id: "preference-blonde", 
      name: "Préférence Platinum Blonde", 
      color: "#FFFACD", 
      price: "$10.99",
      description: "Fade-defying platinum blonde with luminous shine",
      rating: 4.1,
      shade: "11.11 Platinum",
      type: "Permanent",
      brand: "L'Oréal Paris"
    },
    { 
      id: "excellence-red", 
      name: "Excellence Crème Hair Color", 
      color: "#B22222", 
      price: "$8.99",
      description: "Triple protection permanent hair color with pro-keratin",
      rating: 4.4,
      shade: "6R Red Penny",
      type: "Permanent",
      brand: "L'Oréal Paris"
    },
    { 
      id: "colorista-green", 
      name: "Colorista Semi-Permanent", 
      color: "#00FF00", 
      price: "$7.99",
      description: "Semi-permanent hair color that lasts 4-10 washes",
      rating: 3.9,
      shade: "Mint Green",
      type: "Semi-Permanent",
      brand: "L'Oréal Paris"
    },
    { 
      id: "feria-copper", 
      name: "Feria Multi-Faceted Color", 
      color: "#B87333", 
      price: "$8.99",
      description: "3x highlights for brilliant shimmer and bold color",
      rating: 4.2,
      shade: "74 Copper Shimmer",
      type: "Permanent",
      brand: "L'Oréal Paris"
    },
    { 
      id: "colorista-silver", 
      name: "Colorista Hair Makeup", 
      color: "#C0C0C0", 
      price: "$6.99",
      description: "1-day temporary hair color spray",
      rating: 3.8,
      shade: "Silver",
      type: "1-Day Color",
      brand: "L'Oréal Paris"
    }
  ];

  const handleProductSelect = (product: HairColorProduct) => {
    setSelectedProduct(product);
    onSelectColor(product.name);
  };

  const handleShowDetails = (product: HairColorProduct) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">L'Oréal Paris Hair Color</h3>
        <Badge variant="secondary" className="bg-red-100 text-red-700">
          Professional Quality
        </Badge>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {hairColors.map((product) => (
          <Card
            key={product.id}
            className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
              selectedColor === product.name
                ? 'border-red-500 bg-red-50 shadow-lg'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => handleProductSelect(product)}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3">
                <div 
                  className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                  style={{ backgroundColor: product.color }}
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
                {product.type}
              </Badge>
              {selectedColor === product.name && (
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

      {selectedColor && (
        <Button
          onClick={() => {
            onSelectColor("");
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
        product={selectedProduct ? {
          ...selectedProduct,
          color: selectedProduct.color,
          finish: selectedProduct.type
        } : null}
      />
    </div>
  );
};
