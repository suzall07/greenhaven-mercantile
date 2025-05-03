
import { Button } from "@/components/ui/button";
import { LazyImage } from "@/components/LazyImage";
import { Trash2, Plus, Minus } from "lucide-react";
import { CartItem as CartItemType } from "@/lib/supabase";

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (id: number, quantity: number) => void;
  onRemove: (id: number) => void;
}

export const CartItem = ({ item, onUpdateQuantity, onRemove }: CartItemProps) => {
  return (
    <div className="flex items-center p-4 border-b last:border-0">
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
          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
          disabled={item.quantity <= 1}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <span className="mx-3 w-6 text-center">{item.quantity}</span>
        <Button
          variant="outline"
          size="icon" 
          className="h-8 w-8"
          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Remove Button */}
      <Button
        variant="ghost"
        size="icon"
        className="text-red-500 ml-2"
        onClick={() => onRemove(item.id)}
      >
        <Trash2 className="h-5 w-5" />
      </Button>
    </div>
  );
};
