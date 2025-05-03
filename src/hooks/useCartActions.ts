
import { useState, useCallback, useEffect } from 'react';
import { CartItem, getCartItems, addToCart as addItemToCart, updateCartItemQuantity, removeFromCart } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

export function useCartActions(userId: string | null) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isFetching, setIsFetching] = useState(false);

  const fetchCartItems = useCallback(async () => {
    // Don't fetch if already fetching or no userId
    if (isFetching || !userId) {
      return cartItems;
    }

    setIsFetching(true);
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
      setIsFetching(false);
    }
  }, [userId, cartItems, isFetching]);

  // Fetch cart items when userId changes
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
    if (!userId) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to add items",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      await addItemToCart(userId, productId, quantity);
      await fetchCartItems();
      toast({ title: "Added to cart" });
    } catch (error: any) {
      console.error("Error adding to cart:", error);
      setError(error);
      toast({
        title: "Error",
        description: "Could not add item to cart",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [userId, fetchCartItems]);

  const updateQuantity = useCallback(async (cartItemId: number, quantity: number) => {
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
    clearCart
  };
}
