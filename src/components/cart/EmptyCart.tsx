
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const EmptyCart = () => {
  const navigate = useNavigate();
  
  return (
    <div className="text-center py-16">
      <div className="text-xl font-medium mb-4">Your cart is empty</div>
      <p className="text-muted-foreground mb-6">
        You haven't added anything to your cart yet.
      </p>
      <Button onClick={() => navigate("/")}>Continue Shopping</Button>
    </div>
  );
};
