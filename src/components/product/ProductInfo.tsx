import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Product } from "@/lib/supabase";
import { initiateKhaltiPayment } from "@/lib/khalti";
import { supabase, createPayment } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { LazyImage } from "@/components/LazyImage";

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
  isLoading,
}: ProductInfoProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleBuyNow = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Please sign in",
          description: "You need to be signed in to make a purchase",
          variant: "destructive",
        });
        navigate('/auth');
        return;
      }

      const orderId = `order-${Date.now()}`;
      
      // Create payment record before initiating Khalti payment
      await createPayment({
        user_id: user.id,
        amount: product.price,
        status: 'pending',
        transaction_id: orderId,
        purchase_order_id: orderId,
        purchase_order_name: `Purchase - ${product.name}`,
      });

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
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const isOutOfStock = !product.stock || product.stock <= 0;

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
          <div className="mt-4">
            <p className={`font-medium ${isOutOfStock ? 'text-destructive' : 'text-green-600'}`}>
              {isOutOfStock ? 'Out of Stock' : `${product.stock} in stock`}
            </p>
          </div>
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
            disabled={isLoading || isOutOfStock}
          >
            {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
          </Button>
          <Button 
            size="lg" 
            variant="secondary"
            onClick={handleBuyNow}
            disabled={isLoading || isOutOfStock}
          >
            {isOutOfStock ? 'Out of Stock' : 'Buy Now with Khalti'}
          </Button>
        </div>
      </div>
    </div>
  );
};
