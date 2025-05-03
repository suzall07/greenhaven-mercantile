
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useState, useEffect } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const CartButton = () => {
  const { cartItems, removeItem, isLoading } = useCart();
  const navigate = useNavigate();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [displayedCount, setDisplayedCount] = useState(0);

  // Update displayed count with animation
  useEffect(() => {
    if (!isLoading) {
      setDisplayedCount(cartItems.length);
    }
  }, [cartItems.length, isLoading]);

  const handleViewCart = () => {
    setIsCartOpen(false);
    navigate('/cart');
  };

  // Calculate cart total
  const cartTotal = cartItems.reduce((total, item) => {
    return total + ((item.product?.price || 0) * item.quantity);
  }, 0);

  return (
    <Drawer open={isCartOpen} onOpenChange={setIsCartOpen}>
      <DrawerTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <ShoppingCart className="h-5 w-5" />
          {!isLoading && displayedCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center">
              {displayedCount}
            </span>
          )}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle className="text-center">Your Cart</DrawerTitle>
        </DrawerHeader>
        
        <div className="p-4 max-h-[60vh] overflow-y-auto">
          {isLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-16 bg-gray-200 rounded"></div>
              <div className="h-16 bg-gray-200 rounded"></div>
              <div className="h-16 bg-gray-200 rounded"></div>
            </div>
          ) : cartItems.length === 0 ? (
            <p className="text-center text-muted-foreground py-6">Your cart is empty</p>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center gap-3 border-b pb-3">
                  {item.product?.image && (
                    <img
                      src={item.product.image}
                      alt={item.product?.name || ''}
                      className="w-12 h-12 object-cover rounded"
                    />
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.product?.name}</p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-muted-foreground">
                        {item.quantity} × Rs {item.product?.price}
                      </p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-red-500"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {cartItems.length > 0 && (
          <div className="p-4 border-t">
            <div className="flex justify-between mb-4">
              <span className="font-medium">Total:</span>
              <span className="font-medium">Rs {cartTotal.toFixed(2)}</span>
            </div>
            <Button onClick={handleViewCart} className="w-full">
              View Cart
            </Button>
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
};
