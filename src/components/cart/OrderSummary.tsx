
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { CartItem } from "@/lib/supabase";

interface OrderSummaryProps {
  cartItems: CartItem[];
}

export const OrderSummary = ({ cartItems }: OrderSummaryProps) => {
  const navigate = useNavigate();
  
  // Calculate total price
  const totalPrice = cartItems.reduce(
    (sum, item) => sum + ((item.product?.price || 0) * item.quantity),
    0
  );

  return (
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
  );
};
