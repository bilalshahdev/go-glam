
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, ShoppingCart, Info } from "lucide-react";
import { ProductDetailsModal } from "./ProductDetailsModal";

interface HairStyleProduct {
  id: string;
  name: string;
  price: string;
  description: string;
  rating: number;
  styleType: string;
  hold: string;
  brand: string;
}

interface HairStyleSelectorProps {
  onSelectStyle: (style: string) => void;
  selectedStyle: string;
}

export const HairStyleSelector = ({ onSelectStyle, selectedStyle }: HairStyleSelectorProps) => {
  const [selectedProduct, setSelectedProduct] = useState<HairStyleProduct | null>(null);
  const [showModal, setShowModal] = useState(false);

  const hairStyles: HairStyleProduct[] = [
    { 
      id: "elnett-strong", 
      name: "Elnett Satin Hairspray", 
      price: "$14.99",
      description: "Strong hold hairspray with satin finish - Classic Updo",
      rating: 4.6,
      styleType: "Classic Updo",
      hold: "Strong Hold",
      brand: "L'Oréal Paris"
    },
    { 
      id: "studio-line-gel", 
      name: "Studio Line Invisi'Hold Gel", 
      price: "$4.99",
      description: "Clear styling gel for defined curls and waves",
      rating: 4.2,
      styleType: "Beach Waves",
      hold: "Medium Hold",
      brand: "L'Oréal Paris"
    },
    { 
      id: "advanced-volume", 
      name: "Advanced Hairstyle BOOST IT", 
      price: "$4.99",
      description: "Volume injection mousse for big, bold styles",
      rating: 4.3,
      styleType: "Voluminous Layers",
      hold: "Light Hold",
      brand: "L'Oréal Paris"
    },
    { 
      id: "sleek-it-cream", 
      name: "Advanced Hairstyle SLEEK IT", 
      price: "$4.99",
      description: "Frizz vanisher cream for sleek, straight styles",
      rating: 4.4,
      styleType: "Sleek Bob",
      hold: "Light Hold",
      brand: "L'Oréal Paris"
    },
    { 
      id: "curve-it-mousse", 
      name: "Advanced Hairstyle CURVE IT", 
      price: "$4.99",
      description: "Elastic curl mousse for bouncy, defined curls",
      rating: 4.1,
      styleType: "Bouncy Curls",
      hold: "Medium Hold",
      brand: "L'Oréal Paris"
    },
    { 
      id: "lock-it-spray", 
      name: "Advanced Hairstyle LOCK IT", 
      price: "$4.99",
      description: "Bold control hairspray for extreme styles",
      rating: 4.0,
      styleType: "Edgy Pixie",
      hold: "Extra Strong",
      brand: "L'Oréal Paris"
    },
    { 
      id: "blow-dry-cream", 
      name: "Advanced Hairstyle BLOW DRY IT", 
      price: "$4.99",
      description: "Quick dry primer spray for faster styling",
      rating: 4.2,
      styleType: "Straight Blowout",
      hold: "Light Hold",
      brand: "L'Oréal Paris"
    },
    { 
      id: "texture-tease", 
      name: "Advanced Hairstyle TXT IT", 
      price: "$4.99",
      description: "Rough texture spray for messy, textured looks",
      rating: 3.9,
      styleType: "Messy Waves",
      hold: "Medium Hold",
      brand: "L'Oréal Paris"
    },
    { 
      id: "elnett-extra-strong", 
      name: "Elnett Extra Strong Hold", 
      price: "$14.99",
      description: "Extra strong hold hairspray for all-day control",
      rating: 4.5,
      styleType: "Formal Updo",
      hold: "Extra Strong",
      brand: "L'Oréal Paris"
    },
    { 
      id: "studio-line-wax", 
      name: "Studio Line Overworked Hair Putty", 
      price: "$5.99",
      description: "Reworkable putty for messy, textured styles",
      rating: 4.0,
      styleType: "Textured Crop",
      hold: "Medium Hold",
      brand: "L'Oréal Paris"
    },
    { 
      id: "advanced-air-dry", 
      name: "Advanced Hairstyle AIR DRY IT", 
      price: "$4.99",
      description: "Wave swept cream for natural air-dried waves",
      rating: 4.1,
      styleType: "Natural Waves",
      hold: "Light Hold",
      brand: "L'Oréal Paris"
    },
    { 
      id: "studio-line-mousse", 
      name: "Studio Line Spiral Curl Mousse", 
      price: "$5.99",
      description: "Curl defining mousse for springy, bouncy curls",
      rating: 4.2,
      styleType: "Spiral Curls",
      hold: "Medium Hold",
      brand: "L'Oréal Paris"
    }
  ];

  const handleProductSelect = (product: HairStyleProduct) => {
    setSelectedProduct(product);
    onSelectStyle(product.styleType);
  };

  const handleShowDetails = (product: HairStyleProduct) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">L'Oréal Paris Hair Styling</h3>
        <Badge variant="secondary" className="bg-red-100 text-red-700">
          Professional Styling
        </Badge>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {hairStyles.map((product) => (
          <Card
            key={product.id}
            className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
              selectedStyle === product.styleType
                ? 'border-red-500 bg-red-50 shadow-lg'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => handleProductSelect(product)}
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="font-medium text-sm text-gray-900">{product.name}</h4>
                <p className="text-xs text-gray-600">{product.styleType}</p>
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
                {product.hold}
              </Badge>
              {selectedStyle === product.styleType && (
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

      {selectedStyle && (
        <Button
          onClick={() => {
            onSelectStyle("");
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
          color: '#f3f4f6',
          shade: selectedProduct.styleType,
          finish: selectedProduct.hold
        } : null}
      />
    </div>
  );
};
