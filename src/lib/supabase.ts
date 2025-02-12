
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://suzall07sorg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1emFsbDA3c29yZyIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzEwMTM5MjAwLCJleHAiOjIwMjU3MTUyMDB9.dAFKXBqyXEAb9fk2LD1ubhw4FpL5fsIUtJ5daKlv6OQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signUpWithEmail(email: string, password: string) {
  return supabase.auth.signUp({ email, password });
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
  const { data: existingItem } = await supabase
    .from('cart_items')
    .select()
    .eq('user_id', userId)
    .eq('product_id', productId)
    .single();

  if (existingItem) {
    const { error } = await supabase
      .from('cart_items')
      .update({ quantity: existingItem.quantity + quantity })
      .eq('id', existingItem.id);
    
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from('cart_items')
      .insert([{ user_id: userId, product_id: productId, quantity }]);
    
    if (error) throw error;
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
