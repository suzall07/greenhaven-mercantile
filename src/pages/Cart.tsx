
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { CartItem } from "@/lib/supabase";
import { LazyImage } from "@/components/LazyImage";
import { Trash2, Plus, Minus } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

const Cart = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { cartItems, refetchCart } = useCart();
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // Check if user is logged in
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Not logged in",
          description: "Please sign in to view your cart",
          variant: "destructive",
        });
        navigate("/login");
        return;
      }
      setUserId(user.id);
      setIsLoading(false);
    };

    checkUser();
  }, [navigate, toast]);

  // Calculate total price
  const totalPrice = cartItems?.reduce(
    (sum, item) => sum + (item.product?.price || 0) * item.quantity,
    0
  ) || 0;

  // Handle quantity change
  const updateQuantity = async (cartItemId: number, quantity: number) => {
    if (quantity < 1) return;

    try {
      const { error } = await supabase
        .from("cart_items")
        .update({ quantity })
        .eq("id", cartItemId);

      if (error) throw error;

      refetchCart();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Handle item removal
  const removeItem = async (cartItemId: number) => {
    try {
      const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("id", cartItemId);

      if (error) throw error;

      toast({
        title: "Item removed",
        description: "Item has been removed from your cart",
      });

      refetchCart();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 pt-24 flex items-center justify-center">
          <div className="animate-pulse text-xl">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 pt-24">
        <h1 className="text-3xl md:text-4xl font-bold mb-6">Your Cart</h1>

        {cartItems?.length ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm border">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center p-4 border-b last:border-0"
                  >
                    <div className="flex-shrink-0 w-full sm:w-24 h-24 mb-4 sm:mb-0">
                      <LazyImage
                        src={item.product?.image || ""}
                        alt={item.product?.name || ""}
                        className="w-full h-full object-cover rounded"
                      />
                    </div>

                    <div className="flex-1 px-4">
                      <h3 className="font-medium">{item.product?.name}</h3>
                      <p className="text-muted-foreground text-sm">
                        {item.product?.category}
                      </p>
                      <p className="text-primary font-medium mt-1">
                        Rs {item.product?.price}
                      </p>
                    </div>

                    <div className="flex items-center mt-4 sm:mt-0">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
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
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="mt-4 sm:mt-0 ml-0 sm:ml-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => removeItem(item.id)}
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
                <Button className="w-full">Proceed to Checkout</Button>
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
