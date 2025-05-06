
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
    isLoading, 
    error, 
    refetchCart, 
    addToCart: addCartItem, 
    updateQuantity, 
    removeItem, 
    clearCart,
  } = useCartActions(userId);

  // Check auth only once on initial mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        setUserId(data?.user?.id || null);
      } catch (error) {
        console.error("Error checking auth:", error);
      } finally {
        setAuthChecked(true);
      }
    };

    checkAuth();

    // Set up auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const newUserId = session?.user?.id || null;
      
      // Only update if userId actually changed to prevent loops
      if (newUserId !== userId) {
        console.log("Auth state change:", event, newUserId);
        setUserId(newUserId);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Simplified addToCart function that doesn't require login
  const addToCart = async (productId: number, quantity: number) => {
    try {
      await addCartItem(productId, quantity);
      return true;
    } catch (error) {
      console.error("Error adding to cart:", error);
      return false;
    }
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      isLoading,
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
