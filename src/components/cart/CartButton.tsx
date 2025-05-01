
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useCart } from "@/contexts/CartContext";
import { initiateKhaltiPayment } from "@/lib/khalti";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export const CartButton = () => {
  const { cartItems, updateQuantity, removeItem } = useCart();
  const navigate = useNavigate();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleCheckout = async () => {
    try {
      setIsCheckingOut(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Please sign in",
          description: "You need to be signed in to checkout",
          variant: "destructive",
        });
        navigate('/login');
        return;
      }

      const cartTotal = cartItems.reduce((total, item) => {
        return total + (item.product.price * item.quantity);
      }, 0);

      const orderId = `order-${Date.now()}`;
      await initiateKhaltiPayment({
        amount: cartTotal,
        purchaseOrderId: orderId,
        purchaseOrderName: `Cart Checkout - ${orderId}`,
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
      setIsCheckingOut(false);
    }
  };

  const cartTotal = cartItems.reduce((total, item) => {
    return total + (item.product.price * item.quantity);
  }, 0);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <ShoppingCart className="h-5 w-5" />
          {cartItems.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center">
              {cartItems.length}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Shopping Cart</SheetTitle>
        </SheetHeader>
        <div className="mt-8 space-y-4">
          {cartItems.length === 0 ? (
            <p className="text-center text-muted-foreground">Your cart is empty</p>
          ) : (
            <>
              {cartItems.map((item) => (
                <div key={item.id} className="flex space-x-4 items-center">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium">{item.product.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Rs {item.product.price}
                    </p>
                    <div className="flex items-center space-x-2 mt-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                      >
                        -
                      </Button>
                      <span>{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        +
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              <div className="pt-4 border-t">
                <div className="flex justify-between font-medium">
                  <span>Total:</span>
                  <span>Rs {cartTotal.toFixed(2)}</span>
                </div>
                <Button 
                  className="w-full mt-4"
                  onClick={handleCheckout}
                  disabled={isCheckingOut}
                >
                  {isCheckingOut ? "Processing..." : "Checkout with Khalti"}
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
