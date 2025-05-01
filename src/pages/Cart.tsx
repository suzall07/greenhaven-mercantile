
import { useEffect, useState } from "react";
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
  const { cartItems, updateQuantity, removeItem, isLoading: cartLoading, refetchCart } = useCart();
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is logged in
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.log("No user found, redirecting to login");
          toast({
            title: "Not logged in",
            description: "Please sign in to view your cart",
            variant: "destructive",
          });
          navigate("/login");
          return;
        }
        
        console.log("User authenticated, ready to show cart");
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Error checking user:", error);
        toast({
          title: "Error",
          description: "Something went wrong while checking authentication",
          variant: "destructive",
        });
      } finally {
        setIsPageLoading(false);
      }
    };

    checkUser();
  }, [navigate, toast]);

  // Calculate total price safely with null checks
  const totalPrice = cartItems?.reduce(
    (sum, item) => sum + ((item.product?.price || 0) * item.quantity),
    0
  ) || 0;

  const handleQuantityUpdate = async (cartItemId: number, quantity: number) => {
    if (quantity < 1) return;
    await updateQuantity(cartItemId, quantity);
  };

  const handleRemoveItem = async (cartItemId: number) => {
    await removeItem(cartItemId);
  };

  // Show loading state if auth check or cart data is loading
  if (isPageLoading || cartLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 pt-24 flex items-center justify-center">
          <div className="animate-pulse text-xl">Loading your cart...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 pt-24 flex items-center justify-center">
          <div className="text-center">
            <p className="text-xl mb-4">Please sign in to view your cart</p>
            <Button onClick={() => navigate("/login")}>Go to Login</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 pt-24">
        <h1 className="text-3xl md:text-4xl font-bold mb-6">Your Cart</h1>

        {cartItems?.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm border">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center p-4 border-b last:border-0"
                  >
                    <div className="flex-shrink-0 w-full sm:w-24 h-24 mb-4 sm:mb-0">
                      {item.product?.image && (
                        <LazyImage
                          src={item.product.image}
                          alt={item.product?.name || "Product"}
                          className="w-full h-full object-cover rounded"
                        />
                      )}
                    </div>

                    <div className="flex-1 px-4">
                      <h3 className="font-medium">{item.product?.name || "Product"}</h3>
                      <p className="text-muted-foreground text-sm">
                        {item.product?.category || "Category"}
                      </p>
                      <p className="text-primary font-medium mt-1">
                        Rs {item.product?.price || 0}
                      </p>
                    </div>

                    <div className="flex items-center mt-4 sm:mt-0">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleQuantityUpdate(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="mx-3 w-8 text-center">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleQuantityUpdate(item.id, item.quantity + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="mt-4 sm:mt-0 ml-0 sm:ml-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => handleRemoveItem(item.id)}
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

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
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>Free</span>
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
                  Proceed to Checkout
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-xl font-medium mb-4">Your cart is empty</div>
            <p className="text-muted-foreground mb-6">
              Looks like you haven't added anything to your cart yet.
            </p>
            <Button onClick={() => navigate("/")}>Continue Shopping</Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
