
import { useState, useCallback, useEffect, useRef } from 'react';
import { CartItem, getCartItems, addToCart as addItemToCart, updateCartItemQuantity, removeFromCart } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

export function useCartActions(userId: string | null) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const isFetchingRef = useRef(false);
  const initialFetchCompletedRef = useRef(false);

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
    setError(null);
    
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
  }, [userId, cartItems]);

  // Initial fetch when userId changes
  useEffect(() => {
    // If we already did an initial fetch and userId is the same, don't fetch again
    if (initialFetchCompletedRef.current && !userId) {
      setCartItems([]);
      setIsInitialized(true);
      return;
    }

    // If no userId, just set empty cart
    if (!userId) {
      setCartItems([]);
      setIsInitialized(true);
      initialFetchCompletedRef.current = true;
      return;
    }

    // Fetch cart items
    let isMounted = true;
    const doFetch = async () => {
      try {
        await fetchCartItems();
      } finally {
        if (isMounted) {
          setIsInitialized(true);
          initialFetchCompletedRef.current = true;
        }
      }
    };

    doFetch();

    return () => {
      isMounted = false;
    };
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
      return [];
    }

    setIsLoading(true);
    setError(null);
    
    try {
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
    setError(null);
    
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
    setError(null);
    
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
    setError(null);
    
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
