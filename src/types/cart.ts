
import { CartItem } from '@/lib/supabase';

export interface CartContextType {
  cartItems: CartItem[];
  isLoading: boolean;
  error: Error | null;
  refetchCart: () => Promise<CartItem[]>;
  addToCart: (productId: number, quantity: number) => Promise<void>;
  updateQuantity: (cartItemId: number, quantity: number) => Promise<void>;
  removeItem: (cartItemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
}
