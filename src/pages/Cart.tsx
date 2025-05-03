
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useCart } from "@/contexts/CartContext";
import { CartItemList } from "@/components/cart/CartItemList";
import { OrderSummary } from "@/components/cart/OrderSummary";
import { EmptyCart } from "@/components/cart/EmptyCart";

const Cart = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { cartItems, updateQuantity, removeItem, isLoading, refetchCart } = useCart();

  // Check authentication once
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Not logged in",
          description: "Please sign in to view your cart",
          variant: "destructive",
        });
        navigate("/login");
      } else {
        // Fetch cart items if user is authenticated
        await refetchCart();
      }
    };

    checkAuth();
  }, [navigate, toast, refetchCart]);

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
