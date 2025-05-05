
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
    addToCart: addCartItem, 
    updateQuantity, 
    removeItem, 
    clearCart,
    isInitialized 
  } = useCartActions(userId);

  // Fix: Use a separate effect just for auth check to prevent infinite loops
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
  }, []);
  
  // Fix: Separate listener effect to prevent loops
  useEffect(() => {
    // Set up auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUserId(session?.user?.id || null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fix: Wrap the addCartItem function to match the expected return type
  const addToCart = async (productId: number, quantity: number) => {
    await addCartItem(productId, quantity);
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      isLoading: cartLoading || !authChecked || !isInitialized,
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
