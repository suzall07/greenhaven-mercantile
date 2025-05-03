
import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useCartActions } from '@/hooks/useCartActions';
import { CartContextType } from '@/types/cart';

const defaultCartContext: CartContextType = {
  cartItems: [],
  isLoading: false,
  error: null,
  refetchCart: async () => [],
  addToCart: async () => {},
  updateQuantity: async () => {},
  removeItem: async () => {},
  clearCart: async () => {},
};

const CartContext = createContext<CartContextType>(defaultCartContext);

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [userId, setUserId] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  
  const { 
    cartItems, 
    isLoading: cartLoading, 
    error, 
    refetchCart, 
    addToCart, 
    updateQuantity, 
    removeItem, 
    clearCart 
  } = useCartActions(userId);

  // Simplified auth check
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        setUserId(data?.user?.id || null);
      } finally {
        setAuthChecked(true);
      }
    };

    checkAuth();
    
    // Set up auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUserId(session?.user?.id || null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <CartContext.Provider value={{
      cartItems,
      isLoading: cartLoading || !authChecked,
      error,
      refetchCart,
      addToCart,
      updateQuantity,
      removeItem,
      clearCart,
    }}>
      {children}
    </CartContext.Provider>
  );
};
