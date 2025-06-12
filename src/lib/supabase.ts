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

// Simplified email validation helper - very permissive
export function validateEmail(email: string): boolean {
  // Just check for basic @ symbol presence - very minimal validation
  return email.includes('@') && email.length > 3;
}

export async function signInWithEmail(email: string, password: string) {
  try {
    // Clean email but don't validate strictly
    const cleanEmail = email.trim();
    
    console.log('Attempting sign in with email:', cleanEmail);
    
    const result = await supabase.auth.signInWithPassword({ 
      email: cleanEmail, 
      password: password.trim()
    });
    
    if (result.error) {
      console.error('Sign in error details:', result.error);
      
      // Handle specific error types
      if (result.error.message.includes('Invalid login credentials')) {
        throw new Error('Invalid email or password. Please check your credentials and try again.');
      } else if (result.error.message.includes('Email not confirmed')) {
        throw new Error('Please check your email and click the confirmation link before signing in.');
      } else if (result.error.message.includes('Too many requests')) {
        throw new Error('Too many login attempts. Please wait a few minutes before trying again.');
      } else {
        throw new Error(`Sign in failed: ${result.error.message}`);
      }
    }

    console.log('Sign in successful:', result.data.user?.email);
    return result;
  } catch (error: any) {
    console.error('Network error during sign in:', error);
    
    // Handle network errors
    if (error.name === 'AuthRetryableFetchError' || error.message === 'Load failed') {
      throw new Error('Network connection failed. Please check your internet connection and try again.');
    }
    
    throw error;
  }
}

export async function signUpWithEmail(email: string, password: string) {
  try {
    // Clean email but don't validate strictly
    const cleanEmail = email.trim();
    
    console.log('Attempting sign up with email:', cleanEmail);
    
    const result = await supabase.auth.signUp({ 
      email: cleanEmail, 
      password: password.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/`
      }
    });
    
    if (result.error) {
      console.error('Sign up error details:', result.error);
      
      // Handle specific error types
      if (result.error.message.includes('User already registered')) {
        throw new Error('An account with this email already exists. Please sign in instead.');
      } else if (result.error.message.includes('Password should be')) {
        throw new Error('Password must be at least 6 characters long.');
      } else if (result.error.message.includes('signup is disabled')) {
        throw new Error('Account registration is temporarily disabled. Please contact support.');
      } else {
        throw new Error(`Sign up failed: ${result.error.message}`);
      }
    }

    console.log('Sign up result:', result.data);
    return result;
  } catch (error: any) {
    console.error('Network error during sign up:', error);
    
    // Handle network errors
    if (error.name === 'AuthRetryableFetchError' || error.message === 'Load failed') {
      throw new Error('Network connection failed. Please check your internet connection and try again.');
    }
    
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
