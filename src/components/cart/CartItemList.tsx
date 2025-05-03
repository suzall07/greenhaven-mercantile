
import { CartItem as CartItemType } from "@/lib/supabase";
import { CartItem } from "./CartItem";

interface CartItemListProps {
  items: CartItemType[];
  onUpdateQuantity: (id: number, quantity: number) => void;
  onRemove: (id: number) => void;
}

export const CartItemList = ({ items, onUpdateQuantity, onRemove }: CartItemListProps) => {
  if (items.length === 0) {
    return null;
  }
  
  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {items.map((item) => (
        <CartItem 
          key={item.id} 
          item={item} 
          onUpdateQuantity={onUpdateQuantity} 
          onRemove={onRemove} 
        />
      ))}
    </div>
  );
};
