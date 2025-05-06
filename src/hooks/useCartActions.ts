
import { useState, useCallback, useEffect, useRef } from 'react';
import { CartItem, getCartItems, addToCart as addItemToCart, updateCartItemQuantity, removeFromCart, supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

export function useCartActions(userId: string | null) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const isFetchingRef = useRef(false);

  const fetchCartItems = useCallback(async () => {
    if (!userId) {
      setCartItems([]);
      return [];
    }

    // Prevent concurrent fetches
    if (isFetchingRef.current) {
      return cartItems;
    }

    isFetchingRef.current = true;
    setIsLoading(true);
    
    try {
      const items = await getCartItems(userId);
      setCartItems(items || []);
      return items || [];
    } catch (err: any) {
      console.error("Error fetching cart:", err);
      setError(err);
      return [];
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, [userId]);

  // Fetch cart when userId changes, but skip the initial render if userId is null
  useEffect(() => {
    if (userId) {
      fetchCartItems();
    } else {
      setCartItems([]);
    }
  }, [userId, fetchCartItems]);

  const refetchCart = useCallback(async () => {
    return await fetchCartItems();
  }, [fetchCartItems]);

  const addToCart = useCallback(async (productId: number, quantity: number) => {
    setIsLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const currentUserId = user?.id;
      
      if (!currentUserId) {
        toast({
          title: "Guest Mode",
          description: "Shopping as guest. Sign in to save your cart.",
        });
        // In a real app, you would implement a local storage solution here
        return [];
      }

      await addItemToCart(currentUserId, productId, quantity);
      const updatedItems = await fetchCartItems();
      toast({ title: "Added to cart" });
      return updatedItems;
    } catch (error: any) {
      console.error("Error adding to cart:", error);
      setError(error);
      toast({
        title: "Error",
        description: "Could not add item to cart",
        variant: "destructive",
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [fetchCartItems]);

  const updateQuantity = useCallback(async (cartItemId: number, quantity: number) => {
    if (quantity < 1) return;
    
    setIsLoading(true);
    
    try {
      await updateCartItemQuantity(cartItemId, quantity);
      await fetchCartItems();
    } catch (error: any) {
      console.error("Error updating quantity:", error);
      setError(error);
      toast({
        title: "Error",
        description: "Could not update quantity",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [fetchCartItems]);

  const removeItem = useCallback(async (cartItemId: number) => {
    setIsLoading(true);
    
    try {
      await removeFromCart(cartItemId);
      await fetchCartItems();
    } catch (error: any) {
      console.error("Error removing item:", error);
      setError(error);
      toast({
        title: "Error",
        description: "Could not remove item",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [fetchCartItems]);

  const clearCart = useCallback(async () => {
    if (!userId || cartItems.length === 0) return;
    
    setIsLoading(true);
    
    try {
      for (const item of cartItems) {
        await removeFromCart(item.id);
      }
      setCartItems([]);
    } catch (error: any) {
      console.error("Error clearing cart:", error);
      setError(error);
    } finally {
      setIsLoading(false);
    }
  }, [userId, cartItems]);

  return {
    cartItems,
    isLoading,
    error,
    fetchCartItems,
    refetchCart,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
  };
}
