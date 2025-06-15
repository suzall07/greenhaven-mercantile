
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
import { updateCartItemQuantity, removeFromCart, supabase, createPayment } from "@/lib/supabase";
import { initiateKhaltiPayment } from "@/lib/khalti";
import { useToast } from "@/hooks/use-toast";
import { Trash2 } from "lucide-react";
import { useState } from "react";

export const CartButton = () => {
  const { cartItems, refetchCart, totalItems } = useCart();
  const { toast } = useToast();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleUpdateQuantity = async (itemId: number, newQuantity: number) => {
    try {
      await updateCartItemQuantity(itemId, newQuantity);
      await refetchCart();
      toast({
        title: "Cart updated",
        description: "Item quantity has been updated",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update quantity",
        variant: "destructive",
      });
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    try {
      await removeFromCart(itemId);
      await refetchCart();
      toast({
        title: "Item removed",
        description: "Item has been removed from cart",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to remove item",
        variant: "destructive",
      });
    }
  };

  const handleCheckout = async () => {
    if (isCheckingOut) return;
    
    setIsCheckingOut(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Please sign in",
          description: "You need to be signed in to checkout",
          variant: "destructive",
        });
        return;
      }

      const cartTotal = cartItems.reduce((total, item) => {
        return total + (item.product.price * item.quantity);
      }, 0);

      if (cartTotal === 0) {
        toast({
          title: "Empty cart",
          description: "Your cart is empty",
          variant: "destructive",
        });
        return;
      }

      const orderId = `order-${Date.now()}`;
      
      // Create payment record before initiating Khalti payment
      await createPayment({
        user_id: user.id,
        amount: cartTotal,
        status: 'pending',
        transaction_id: orderId,
        purchase_order_id: orderId,
        purchase_order_name: `Cart Checkout - ${orderId}`,
      });

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
      console.error('Payment error:', error);
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
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center">
              {totalItems}
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
              {cartItems.map((item) => {
                const isOutOfStock = !item.product.stock || item.product.stock <= 0;
                return (
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
                      <p className={`text-xs ${isOutOfStock ? 'text-destructive' : 'text-muted-foreground'}`}>
                        {isOutOfStock ? 'Out of Stock' : `Stock: ${item.product.stock}`}
                      </p>
                      <div className="flex items-center space-x-2 mt-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                          disabled={item.quantity <= 1}
                        >
                          -
                        </Button>
                        <span>{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= (item.product.stock || 0) || isOutOfStock}
                        >
                          +
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => handleRemoveItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
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
