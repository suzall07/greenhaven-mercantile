
import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { getCartItems, CartItem, supabase, addToCart } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

type CartContextType = {
  cartItems: CartItem[];
  isLoading: boolean;
  error: Error | null;
  refetchCart: () => Promise<void>;
  addToCart: (productId: number, quantity?: number) => Promise<void>;
  totalItems: number;
};

const CartContext = createContext<CartContextType>({
  cartItems: [],
  isLoading: false,
  error: null,
  refetchCart: async () => {},
  addToCart: async () => {},
  totalItems: 0,
});

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const { toast } = useToast();

  // Check for authenticated user and set up auth listener
  useEffect(() => {
    let mounted = true;
    
    const checkUser = async () => {
      if (!mounted) return;
      
      setIsLoading(true);
      try {
        const { data } = await supabase.auth.getUser();
        const newUserId = data.user?.id || null;
        
        if (!mounted) return;
        
        setUserId(newUserId);
        
        if (newUserId) {
          await fetchCartItemsForUser(newUserId);
        } else {
          setCartItems([]);
          setIsLoading(false);
        }
      } catch (err) {
        if (!mounted) return;
        console.error('Error checking user:', err);
        setError(err as Error);
        setIsLoading(false);
      }
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      const newUserId = session?.user.id || null;
      setUserId(newUserId);
      
      if (event === 'SIGNED_OUT' || !session) {
        setCartItems([]);
        setIsLoading(false);
        setError(null);
      } else if (newUserId && event === 'SIGNED_IN') {
        await fetchCartItemsForUser(newUserId);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const fetchCartItemsForUser = async (userIdToFetch: string) => {
    if (!userIdToFetch) {
      setCartItems([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const items = await getCartItems(userIdToFetch);
      console.log('Fetched cart items:', items);
      setCartItems(items || []);
    } catch (err: any) {
      console.error('Error fetching cart items:', err);
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
    if (userId) {
      await fetchCartItemsForUser(userId);
    }
  };

  const handleAddToCart = async (productId: number, quantity: number = 1) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Please sign in",
          description: "You need to be signed in to add items to cart",
          variant: "destructive",
        });
        return;
      }

      console.log('Adding to cart:', { productId, quantity, userId: user.id });
      await addToCart(user.id, productId, quantity);
      
      // Immediately fetch updated cart items
      await fetchCartItemsForUser(user.id);
      
      toast({
        title: "Added to cart",
        description: "Item has been added to your cart",
      });
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add item to cart",
        variant: "destructive",
      });
    }
  };

  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        isLoading,
        error,
        refetchCart,
        addToCart: handleAddToCart,
        totalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
