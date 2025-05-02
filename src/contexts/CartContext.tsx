
import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useCartActions } from '@/hooks/useCartActions';
import { CartContextType } from '@/types/cart';

// Default values for the context
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
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  
  // Initialize useCartActions with userId
  const { 
    cartItems, 
    isLoading, 
    error, 
    refetchCart, 
    addToCart, 
    updateQuantity, 
    removeItem, 
    clearCart 
  } = useCartActions(userId);

  // Check for authenticated user
  useEffect(() => {
    let isMounted = true;
    
    // First check the current session
    const getCurrentUser = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        const currentUserId = data?.user?.id || null;
        
        if (isMounted) {
          console.log("Current auth state:", currentUserId ? "User logged in" : "No user");
          setUserId(currentUserId);
          setIsAuthChecked(true);
        }
      } catch (error) {
        console.error("Error checking auth state:", error);
        if (isMounted) setIsAuthChecked(true);
      }
    };

    getCurrentUser();

    // Set up the auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;
      
      if (event === 'SIGNED_IN' && session?.user?.id) {
        console.log("User signed in with ID:", session.user.id);
        setUserId(session.user.id);
      } 
      else if (event === 'SIGNED_OUT') {
        console.log("User signed out, clearing user ID and cart");
        setUserId(null);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Create the context value
  const cartContextValue: CartContextType = {
    cartItems,
    isLoading: isLoading || !isAuthChecked,
    error,
    refetchCart,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
  };

  return (
    <CartContext.Provider value={cartContextValue}>
      {children}
    </CartContext.Provider>
  );
};
