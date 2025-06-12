import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qjxhtllsaevjfhlfqnvu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqeGh0bGxzYWV2amZobGZxbnZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkxNjY3MjEsImV4cCI6MjA1NDc0MjcyMX0.90n9q2xWFNYij-TTEdvZc5KcgXXZw7LiQDvPhh6_5iw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
    // Optimize auth settings for better performance
    detectSessionInUrl: true,
    storageKey: 'supabase.auth.token',
  }
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

// Email validation helper
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

export async function signInWithEmail(email: string, password: string) {
  try {
    // Validate email format before making the request
    if (!validateEmail(email)) {
      throw new Error('Please enter a valid email address');
    }

    const result = await supabase.auth.signInWithPassword({ 
      email: email.trim().toLowerCase(), 
      password 
    });
    
    if (result.error) {
      console.error('Sign in error:', result.error);
    }
    
    return result;
  } catch (error) {
    console.error('Network error during sign in:', error);
    throw error;
  }
}

export async function signUpWithEmail(email: string, password: string) {
  try {
    // Validate email format before making the request
    if (!validateEmail(email)) {
      throw new Error('Please enter a valid email address');
    }

    const result = await supabase.auth.signUp({ 
      email: email.trim().toLowerCase(), 
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`
      }
    });
    
    if (result.error) {
      console.error('Sign up error:', result.error);
    }
    
    return result;
  } catch (error) {
    console.error('Network error during sign up:', error);
    throw error;
  }
}

export async function signOut() {
  return supabase.auth.signOut();
}

export async function getProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
}

export async function getCartItems(userId: string) {
  const { data, error } = await supabase
    .from('cart_items')
    .select(`
      *,
      product:products(*)
    `)
    .eq('user_id', userId);
  
  if (error) throw error;
  return data;
}

export async function addToCart(userId: string, productId: number, quantity: number) {
  const { data: existingItem, error: fetchError } = await supabase
    .from('cart_items')
    .select('*')
    .eq('user_id', userId)
    .eq('product_id', productId)
    .maybeSingle();

  if (fetchError) throw fetchError;

  if (existingItem) {
    const { error: updateError } = await supabase
      .from('cart_items')
      .update({ quantity: existingItem.quantity + quantity })
      .eq('id', existingItem.id);
    
    if (updateError) throw updateError;
  } else {
    const { error: insertError } = await supabase
      .from('cart_items')
      .insert([{ 
        user_id: userId, 
        product_id: productId, 
        quantity 
      }]);
    
    if (insertError) throw insertError;
  }
}

export async function updateCartItemQuantity(cartItemId: number, quantity: number) {
  const { error } = await supabase
    .from('cart_items')
    .update({ quantity })
    .eq('id', cartItemId);
  
  if (error) throw error;
}

export async function removeFromCart(cartItemId: number) {
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('id', cartItemId);
  
  if (error) throw error;
}
