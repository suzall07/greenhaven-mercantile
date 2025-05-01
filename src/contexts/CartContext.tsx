
import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useCartActions } from '@/hooks/useCartActions';
import { CartContextType } from '@/types/cart';

const CartContext = createContext<CartContextType>({
  cartItems: [],
  isLoading: false,
  error: null,
  refetchCart: async () => {},
  addToCart: async () => {},
  updateQuantity: async () => {},
  removeItem: async () => {},
  clearCart: async () => {},
});

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [userId, setUserId] = useState<string | null>(null);
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
    // First check the current session
    const getCurrentUser = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        const currentUserId = data.user?.id || null;
        console.log("Current auth state:", currentUserId ? "User logged in" : "No user");
        
        // Only update userId if it has changed
        if (currentUserId !== userId) {
          setUserId(currentUserId);
          
          // Only fetch cart items if we have a user
          if (currentUserId) {
            await fetchCartItems(currentUserId);
          }
        }
      } catch (error) {
        console.error("Error checking auth state:", error);
      }
    };

    getCurrentUser();

    // Then set up the auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state change event:", event);
      
      if (event === 'SIGNED_IN' && session?.user?.id) {
        console.log("User signed in with ID:", session.user.id);
        setUserId(session.user.id);
        // Use setTimeout to avoid potential deadlocks
        setTimeout(() => {
          fetchCartItems(session.user.id);
        }, 0);
      } 
      else if (event === 'SIGNED_OUT') {
        console.log("User signed out, clearing user ID and cart");
        setUserId(null);
        // Use setTimeout to avoid potential deadlocks
        setTimeout(() => {
          fetchCartItems(null);
        }, 0);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        isLoading,
        error,
        refetchCart,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
