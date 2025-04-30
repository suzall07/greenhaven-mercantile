
import { useState } from 'react';
import { CartItem, getCartItems, addToCart as addItemToCart, updateCartItemQuantity, removeFromCart, supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

export function useCartActions(userId: string | null) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

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

  return {
    cartItems,
    setCartItems,
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
