
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { CartItem } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface CartContextType {
  cartItems: CartItem[];
  isLoading: boolean;
  refetchCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType>({
  cartItems: [],
  isLoading: true,
  refetchCart: async () => {},
});

export const useCart = () => useContext(CartContext);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchCartItems = async (userId: string) => {
    try {
      const items = await getCartItems(userId);
      setCartItems(items);
    } catch (error) {
      console.error('Error fetching cart items:', error);
      toast({
        title: "Error",
        description: "Failed to fetch cart items",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        fetchCartItems(session.user.id);
      } else {
        setCartItems([]);
        setIsLoading(false);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const refetchCart = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setIsLoading(true);
      await fetchCartItems(user.id);
    }
  };

  return (
    <CartContext.Provider value={{ cartItems, isLoading, refetchCart }}>
      {children}
    </CartContext.Provider>
  );
}
