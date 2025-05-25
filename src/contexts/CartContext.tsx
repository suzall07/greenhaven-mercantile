
import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCartItems, CartItem, supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

type CartContextType = {
  cartItems: CartItem[];
  isLoading: boolean;
  error: Error | null;
  refetchCart: () => Promise<void>;
};

const CartContext = createContext<CartContextType>({
  cartItems: [],
  isLoading: false,
  error: null,
  refetchCart: async () => {},
});

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const { toast } = useToast();

  // Check for authenticated user
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUserId(data.user?.id || null);
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user.id || null);
      
      // Clear cart items when user logs out
      if (!session) {
        setCartItems([]);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fetch cart items when userId changes
  useEffect(() => {
    if (userId) {
      fetchCartItems();
    }
  }, [userId]);

  const fetchCartItems = async () => {
    if (!userId) {
      setCartItems([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const items = await getCartItems(userId);
      setCartItems(items);
    } catch (err: any) {
      setError(err);
      toast({
        title: "Error",
        description: "Failed to load your cart items",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const refetchCart = async () => {
    await fetchCartItems();
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        isLoading,
        error,
        refetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
