
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const CartButton = () => {
  return (
    <Button variant="ghost" size="icon">
      <ShoppingCart className="h-5 w-5" />
    </Button>
  );
};
