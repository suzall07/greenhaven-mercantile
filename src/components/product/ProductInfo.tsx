
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Product } from "@/lib/supabase";

interface ProductInfoProps {
  product: Product;
  averageRating: string;
  reviewCount: number;
  onAddToCart: () => void;
  onBuyNow: () => void;
  isLoading: boolean;
}

export const ProductInfo = ({
  product,
  averageRating,
  reviewCount,
  onAddToCart,
  onBuyNow,
  isLoading,
}: ProductInfoProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <img
          src={product.image}
          alt={product.name}
          className="w-full rounded-lg object-cover aspect-square"
        />
      </div>
      
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <p className="text-xl font-semibold mt-2">Rs {product.price}</p>
          <p className="text-muted-foreground mt-4">{product.description}</p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-lg">Rating: {averageRating}</span>
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-5 h-5 ${
                  star <= Number(averageRating)
                    ? "text-yellow-400 fill-yellow-400"
                    : "text-gray-300"
                }`}
              />
            ))}
          </div>
          <span className="text-muted-foreground">
            ({reviewCount} reviews)
          </span>
        </div>

        <div className="space-x-4">
          <Button 
            size="lg" 
            onClick={onAddToCart}
            disabled={isLoading}
          >
            Add to Cart
          </Button>
          <Button 
            size="lg" 
            variant="secondary"
            onClick={onBuyNow}
            disabled={isLoading}
          >
            Buy Now
          </Button>
        </div>
      </div>
    </div>
  );
};
