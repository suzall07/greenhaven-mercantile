
import { useState, useCallback, useEffect, useRef } from 'react';
import { CartItem, getCartItems, addToCart as addItemToCart, updateCartItemQuantity, removeFromCart } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

export function useCartActions(userId: string | null) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const isFetchingRef = useRef(false);

  const fetchCartItems = useCallback(async () => {
    if (!userId) {
      setCartItems([]);
      return [];
    }

    if (isFetchingRef.current) {
      return cartItems;
    }

    isFetchingRef.current = true;
    setIsLoading(true);
    
    try {
      console.log("Fetching cart items for user:", userId);
      const items = await getCartItems(userId);
      console.log("Cart items fetched:", items);
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
  }, [userId, cartItems]);

  // Fix: Use a ref to track initialization
  const initializedRef = useRef(false);
  
  // Fetch cart items when userId changes, with safeguards against loops
  useEffect(() => {
    if (initializedRef.current) return;
    
    if (userId) {
      fetchCartItems().then(() => {
        setIsInitialized(true);
        initializedRef.current = true;
      });
    } else {
      setCartItems([]);
      setIsInitialized(true);
      initializedRef.current = true;
    }
  }, [userId, fetchCartItems]);

  const refetchCart = useCallback(async () => {
    // Reset the initialization flag to allow refetching
    initializedRef.current = false;
    return await fetchCartItems();
  }, [fetchCartItems]);

  const addToCart = useCallback(async (productId: number, quantity: number) => {
    if (!userId) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to add items",
        variant: "destructive",
      });
      return [];
    }

    setIsLoading(true);
    
    try {
      console.log("Adding to cart:", productId, quantity);
      await addItemToCart(userId, productId, quantity);
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
  }, [userId, fetchCartItems]);

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
      toast({
        title: "Item removed",
        description: "Item removed from cart",
      });
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
    isInitialized
  };
}
