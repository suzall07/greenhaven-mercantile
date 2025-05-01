
import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useCartActions } from '@/hooks/useCartActions';
import { CartContextType } from '@/types/cart';
import { CartItem } from '@/lib/supabase';

// Default values for the context
const defaultCartContext: CartContextType = {
  cartItems: [],
  isLoading: false,
  error: null,
  refetchCart: async () => {},
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
  
  // Custom cart actions hook - only using it AFTER the component has mounted
  const { 
    cartItems, 
    isLoading, 
    error, 
    fetchCartItems, 
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
        if (isMounted) setIsAuthChecked(false);
        
        const { data } = await supabase.auth.getUser();
        const currentUserId = data.user?.id || null;
        console.log("Current auth state:", currentUserId ? "User logged in" : "No user");
        
        if (isMounted) {
          setUserId(currentUserId);
          
          // Only fetch cart items if we have a user
          if (currentUserId) {
            await fetchCartItems(currentUserId);
          } else {
            // Clear cart for logged out users
            await fetchCartItems(null);
          }
        }
      } catch (error) {
        console.error("Error checking auth state:", error);
      } finally {
        if (isMounted) setIsAuthChecked(true);
      }
    };

    getCurrentUser();

    // Set up the auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state change event:", event);
      
      if (!isMounted) return;
      
      if (event === 'SIGNED_IN' && session?.user?.id) {
        console.log("User signed in with ID:", session.user.id);
        setUserId(session.user.id);
        
        // Use setTimeout to avoid potential React state update conflicts
        setTimeout(() => {
          if (isMounted) fetchCartItems(session.user.id);
        }, 0);
      } 
      else if (event === 'SIGNED_OUT') {
        console.log("User signed out, clearing user ID and cart");
        setUserId(null);
        
        // Use setTimeout to avoid potential React state update conflicts
        setTimeout(() => {
          if (isMounted) fetchCartItems(null);
        }, 0);
      }
      
      setIsAuthChecked(true);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [fetchCartItems]);

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
