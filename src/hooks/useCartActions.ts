
import { useState, useCallback } from 'react';
import { CartItem, getCartItems, addToCart as addItemToCart, updateCartItemQuantity, removeFromCart, supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

// This hook should only be used within React functional components
export function useCartActions(userId: string | null) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchCartItems = useCallback(async (uid: string | null = userId): Promise<CartItem[]> => {
    // If no user ID is provided, clear the cart items
    if (!uid) {
      console.log("No user ID provided or user logged out, clearing cart items");
      setCartItems([]);
      return [];
    }

    setIsLoading(true);
    setError(null);

    try {
      const items = await getCartItems(uid);
      console.log("Cart items fetched:", items);
      setCartItems(items || []);
      return items || [];
    } catch (err: any) {
      console.error("Error fetching cart items:", err);
      setError(err);
      toast({
        title: "Error",
        description: "Failed to load your cart items",
        variant: "destructive",
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const refetchCart = useCallback(async (): Promise<void> => {
    await fetchCartItems();
  }, [fetchCartItems]);

  const addToCart = useCallback(async (productId: number, quantity: number): Promise<void> => {
    try {
      if (!userId) {
        toast({
          title: "Please sign in",
          description: "You need to be signed in to add items to your cart",
          variant: "destructive",
        });
        return;
      }

      setIsLoading(true);
      await addItemToCart(userId, productId, quantity);
      await fetchCartItems();
      
      toast({
        title: "Added to cart",
        description: "Item has been added to your cart",
      });
    } catch (error: any) {
      console.error("Error adding to cart:", error);
      setError(error);
      toast({
        title: "Error",
        description: error.message || "Failed to add item to cart",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [userId, fetchCartItems]);

  const updateQuantity = useCallback(async (cartItemId: number, quantity: number): Promise<void> => {
    try {
      setIsLoading(true);
      await updateCartItemQuantity(cartItemId, quantity);
      await fetchCartItems();
      
      toast({
        title: "Cart updated",
        description: "Item quantity has been updated",
      });
    } catch (error: any) {
      console.error("Error updating quantity:", error);
      setError(error);
      toast({
        title: "Error",
        description: error.message || "Failed to update quantity",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [fetchCartItems]);

  const removeItem = useCallback(async (cartItemId: number): Promise<void> => {
    try {
      setIsLoading(true);
      await removeFromCart(cartItemId);
      await fetchCartItems();
      
      toast({
        title: "Item removed",
        description: "Item has been removed from cart",
      });
    } catch (error: any) {
      console.error("Error removing item:", error);
      setError(error);
      toast({
        title: "Error",
        description: error.message || "Failed to remove item",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [fetchCartItems]);

  const clearCart = useCallback(async (): Promise<void> => {
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
      console.error("Error clearing cart:", error);
      setError(error);
      toast({
        title: "Error",
        description: error.message || "Failed to clear cart",
        variant: "destructive",
      });
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
