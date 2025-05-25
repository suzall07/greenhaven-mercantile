
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { LazyImage } from "@/components/LazyImage";
import { Trash2, Plus, Minus } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

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
        // Only fetch cart if user is authenticated
        refetchCart();
      }
    };

    checkAuth();
  }, [navigate, toast, refetchCart]);

  // Show simple loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 pt-24 flex justify-center">
          <div className="animate-pulse text-xl">Loading your cart...</div>
        </div>
      </div>
    );
  }

  // Calculate total price
  const totalPrice = cartItems.reduce(
    (sum, item) => sum + ((item.product?.price || 0) * item.quantity),
    0
  );

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 pt-24">
        <h1 className="text-3xl font-bold mb-6">Your Cart</h1>

        {cartItems.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items List */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm border">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center p-4 border-b last:border-0">
                    {/* Product Image */}
                    <div className="w-16 h-16 flex-shrink-0">
                      {item.product?.image && (
                        <LazyImage
                          src={item.product.image}
                          alt={item.product?.name || "Product"}
                          className="w-full h-full object-cover rounded"
                        />
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 px-4">
                      <h3 className="font-medium">{item.product?.name}</h3>
                      <p className="text-primary font-medium">Rs {item.product?.price || 0}</p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="mx-3 w-6 text-center">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Remove Button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 ml-2"
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div>
              <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-24">
                <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Subtotal ({cartItems.length} items)
                    </span>
                    <span>Rs {totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span>Rs {totalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                <Button 
                  className="w-full" 
                  onClick={() => navigate("/checkout")}
                  disabled={cartItems.length === 0}
                >
                  Checkout
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-xl font-medium mb-4">Your cart is empty</div>
            <p className="text-muted-foreground mb-6">
              You haven't added anything to your cart yet.
            </p>
            <Button onClick={() => navigate("/")}>Continue Shopping</Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
