
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Product } from "@/lib/supabase";
import { initiateKhaltiPayment } from "@/lib/khalti";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { LazyImage } from "@/components/LazyImage";
import { useCart } from "@/contexts/CartContext";
import { useState } from "react";

interface ProductInfoProps {
  product: Product;
  averageRating: string;
  reviewCount: number;
  onAddToCart?: () => void;
  onBuyNow?: () => void;
  isLoading: boolean;
}

export const ProductInfo = ({
  product,
  averageRating,
  reviewCount,
  isLoading,
  onAddToCart,
  onBuyNow,
}: ProductInfoProps) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [isBuying, setIsBuying] = useState(false);

  const handleAddToCart = async () => {
    if (onAddToCart) {
      // If onAddToCart prop is provided, use that
      onAddToCart();
      return;
    }
    
    setIsAdding(true);
    try {
      await addToCart(product.id, 1);
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast({
        title: "Error",
        description: "An error occurred while adding to cart",
        variant: "destructive",
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleBuyNow = async () => {
    if (onBuyNow) {
      // If onBuyNow prop is provided, use that
      onBuyNow();
      return;
    }
    
    setIsBuying(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Please sign in",
          description: "You need to be signed in to make a purchase",
          variant: "destructive",
        });
        navigate('/login');
        return;
      }

      const orderId = `order-${Date.now()}`;
      await initiateKhaltiPayment({
        amount: product.price,
        purchaseOrderId: orderId,
        purchaseOrderName: `Purchase - ${product.name}`,
        customerInfo: {
          name: user.email?.split('@')[0] || 'Customer',
          email: user.email || '',
        },
      });
    } catch (error: any) {
      toast({
        title: "Payment Error",
        description: error.message || "Failed to initiate payment",
        variant: "destructive",
      });
    } finally {
      setIsBuying(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <LazyImage
          src={product.image}
          alt={product.name}
          className="w-full max-w-lg"
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
            onClick={handleAddToCart}
            disabled={isLoading || isAdding}
          >
            {isAdding ? "Adding..." : "Add to Cart"}
          </Button>
          <Button 
            size="lg" 
            variant="secondary"
            onClick={handleBuyNow}
            disabled={isLoading || isBuying}
          >
            {isBuying ? "Processing..." : "Buy Now with Khalti"}
          </Button>
        </div>
      </div>
    </div>
  );
};
