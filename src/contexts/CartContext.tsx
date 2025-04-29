
import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { getCartItems, CartItem, supabase, addToCart as addItemToCart, updateCartItemQuantity, removeFromCart } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

type CartContextType = {
  cartItems: CartItem[];
  isLoading: boolean;
  error: Error | null;
  refetchCart: () => Promise<void>;
  addToCart: (productId: number, quantity: number) => Promise<void>;
  updateQuantity: (cartItemId: number, quantity: number) => Promise<void>;
  removeItem: (cartItemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
};

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
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

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
        setCartItems([]);
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

  const fetchCartItems = async (uid: string | null = userId) => {
    if (!uid) {
      setCartItems([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const items = await getCartItems(uid);
      console.log("Cart items fetched:", items);
      setCartItems(items);
    } catch (err: any) {
      console.error("Error fetching cart items:", err);
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

  const addToCart = async (productId: number, quantity: number) => {
    try {
      if (!userId) {
        toast({
          title: "Please sign in",
          description: "You need to be signed in to add items to your cart",
          variant: "destructive",
        });
        return;
      }

      await addItemToCart(userId, productId, quantity);
      await refetchCart();
      toast({
        title: "Added to cart",
        description: "Item has been added to your cart",
      });
    } catch (error: any) {
      console.error("Error adding to cart:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add item to cart",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateQuantity = async (cartItemId: number, quantity: number) => {
    try {
      await updateCartItemQuantity(cartItemId, quantity);
      await refetchCart();
      toast({
        title: "Cart updated",
        description: "Item quantity has been updated",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update quantity",
        variant: "destructive",
      });
      throw error;
    }
  };

  const removeItem = async (cartItemId: number) => {
    try {
      await removeFromCart(cartItemId);
      await refetchCart();
      toast({
        title: "Item removed",
        description: "Item has been removed from cart",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to remove item",
        variant: "destructive",
      });
      throw error;
    }
  };

  const clearCart = async () => {
    if (!userId || cartItems.length === 0) return;

    setIsLoading(true);
    try {
      for (const item of cartItems) {
        await removeFromCart(item.id);
      }
      setCartItems([]);
      toast({
        title: "Cart cleared",
        description: "All items have been removed from your cart",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to clear cart",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
