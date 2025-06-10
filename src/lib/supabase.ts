
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qjxhtllsaevjfhlfqnvu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqeGh0bGxzYWV2amZobGZxbnZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkxNjY3MjEsImV4cCI6MjA1NDc0MjcyMX0.90n9q2xWFNYij-TTEdvZc5KcgXXZw7LiQDvPhh6_5iw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'supabase.auth.token',
  },
  global: {
    headers: {
      'Cache-Control': 'no-cache',
    },
  },
  db: {
    schema: 'public',
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

export type Product = {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  description: string;
  stock: number;
  created_at: string;
};

export type CartItem = {
  id: number;
  product_id: number;
  user_id: string;
  quantity: number;
  product: Product;
};

export type Order = {
  id: number;
  user_id: string;
  total: number;
  status: 'pending' | 'completed' | 'cancelled';
  created_at: string;
};

export async function signInWithEmail(email: string, password: string) {
  try {
    console.log('Attempting sign in...');
    const result = await supabase.auth.signInWithPassword({ 
      email, 
      password 
    });
    
    if (result.error) {
      console.error('Sign in error:', result.error);
    } else {
      console.log('Sign in successful');
    }
    
    return result;
  } catch (error) {
    console.error('Network error during sign in:', error);
    throw new Error('Network error. Please check your connection and try again.');
  }
}

export async function signUpWithEmail(email: string, password: string) {
  try {
    console.log('Attempting sign up...');
    const result = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`
      }
    });
    
    if (result.error) {
      console.error('Sign up error:', result.error);
    } else {
      console.log('Sign up successful');
    }
    
    return result;
  } catch (error) {
    console.error('Network error during sign up:', error);
    throw new Error('Network error. Please check your connection and try again.');
  }
}

export async function signOut() {
  console.log('Signing out...');
  return supabase.auth.signOut();
}

export async function getProducts() {
  try {
    console.log('Fetching products...');
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
    
    console.log('Products fetched successfully:', data?.length || 0, 'items');
    return data || [];
  } catch (error) {
    console.error('Failed to fetch products:', error);
    throw error;
  }
}

export async function getCartItems(userId: string) {
  try {
    console.log('Fetching cart items for user:', userId);
    const { data, error } = await supabase
      .from('cart_items')
      .select(`
        *,
        product:products(*)
      `)
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error fetching cart items:', error);
      throw error;
    }
    
    console.log('Cart items fetched successfully:', data?.length || 0, 'items');
    return data || [];
  } catch (error) {
    console.error('Failed to fetch cart items:', error);
    throw error;
  }
}

export async function addToCart(userId: string, productId: number, quantity: number) {
  try {
    console.log('Adding to cart:', { userId, productId, quantity });
    
    const { data: existingItem, error: fetchError } = await supabase
      .from('cart_items')
      .select('*')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .maybeSingle();

    if (fetchError) {
      console.error('Error checking existing cart item:', fetchError);
      throw fetchError;
    }

    if (existingItem) {
      const { error: updateError } = await supabase
        .from('cart_items')
        .update({ quantity: existingItem.quantity + quantity })
        .eq('id', existingItem.id);
      
      if (updateError) {
        console.error('Error updating cart item:', updateError);
        throw updateError;
      }
      console.log('Cart item updated successfully');
    } else {
      const { error: insertError } = await supabase
        .from('cart_items')
        .insert([{ 
          user_id: userId, 
          product_id: productId, 
          quantity 
        }]);
      
      if (insertError) {
        console.error('Error inserting cart item:', insertError);
        throw insertError;
      }
      console.log('Cart item added successfully');
    }
  } catch (error) {
    console.error('Failed to add to cart:', error);
    throw error;
  }
}

export async function updateCartItemQuantity(cartItemId: number, quantity: number) {
  try {
    console.log('Updating cart item quantity:', { cartItemId, quantity });
    const { error } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('id', cartItemId);
    
    if (error) {
      console.error('Error updating cart item quantity:', error);
      throw error;
    }
    console.log('Cart item quantity updated successfully');
  } catch (error) {
    console.error('Failed to update cart item quantity:', error);
    throw error;
  }
}

export async function removeFromCart(cartItemId: number) {
  try {
    console.log('Removing from cart:', cartItemId);
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', cartItemId);
    
    if (error) {
      console.error('Error removing cart item:', error);
      throw error;
    }
    console.log('Cart item removed successfully');
  } catch (error) {
    console.error('Failed to remove cart item:', error);
    throw error;
  }
}
