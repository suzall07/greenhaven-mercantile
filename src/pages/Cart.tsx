
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/contexts/CartContext";
import { CartItemList } from "@/components/cart/CartItemList";
import { OrderSummary } from "@/components/cart/OrderSummary";
import { EmptyCart } from "@/components/cart/EmptyCart";
import { AlertCircle, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";

const Cart = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { cartItems, updateQuantity, removeItem, isLoading, error, refetchCart } = useCart();
  
  // Fetch cart data when the component mounts
  useEffect(() => {
    refetchCart().catch(error => {
      console.error("Error fetching cart:", error);
      toast({
        title: "Error",
        description: "Could not load your cart. Please try again.",
        variant: "destructive"
      });
    });
  }, [refetchCart, toast]);

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 pt-24 flex justify-center">
          <div className="w-full max-w-3xl">
            <div className="bg-destructive/10 p-4 rounded-md flex items-center gap-3 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <div>
                <h3 className="font-medium">Error loading cart</h3>
                <p className="text-sm">{error?.message || "Please try again"}</p>
              </div>
            </div>
            <button 
              onClick={() => refetchCart()} 
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 pt-24 flex justify-center">
          <div className="w-full max-w-3xl">
            <h1 className="text-3xl font-bold mb-6">Your Cart</h1>
            <div className="animate-pulse space-y-4">
              <div className="h-20 bg-gray-200 rounded"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
              <div className="h-40 bg-gray-200 rounded mt-8"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 pt-24">
        <h1 className="text-3xl font-bold mb-6">Your Cart</h1>

        {cartItems.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items List */}
            <div className="lg:col-span-2">
              <CartItemList 
                items={cartItems}
                onUpdateQuantity={updateQuantity}
                onRemove={removeItem}
              />
            </div>

            {/* Order Summary */}
            <div>
              <OrderSummary cartItems={cartItems} />
            </div>
          </div>
        ) : (
          <EmptyCart />
        )}
      </div>
    </div>
  );
};

export default Cart;
