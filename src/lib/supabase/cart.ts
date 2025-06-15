
import { supabase } from './client';

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
