
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
    const checkUser = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        setUserId(data.user?.id || null);
        console.log("Auth state on initial load:", data.user ? "User logged in" : "User not logged in");
      } catch (error) {
        console.error("Error checking auth state:", error);
      }
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state change:", event, session?.user?.id);
      setUserId(session?.user?.id || null);
      
      // Clear cart items when user logs out
      if (!session) {
        // We don't have access to setCartItems here, so we'll handle this in the useCartActions hook
        // Instead, we'll trigger a refetch which will set cartItems to empty array when userId is null
        fetchCartItems(null);
      } else {
        // Fetch cart items when user logs in
        fetchCartItems(session.user.id);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fetch cart items when userId changes
  useEffect(() => {
    if (userId) {
      console.log("Fetching cart items for user:", userId);
      fetchCartItems(userId);
    }
  }, [userId]);

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
