
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
  // First, get the product stock
  const { data: product, error: productError } = await supabase
    .from('products')
    .select('stock')
    .eq('id', productId)
    .single();

  if (productError) throw productError;

  if (!product || product.stock === null || product.stock <= 0) {
    throw new Error('Product is out of stock');
  }

  const { data: existingItem, error: fetchError } = await supabase
    .from('cart_items')
    .select('*')
    .eq('user_id', userId)
    .eq('product_id', productId)
    .maybeSingle();

  if (fetchError) throw fetchError;

  const currentQuantityInCart = existingItem ? existingItem.quantity : 0;
  const newTotalQuantity = currentQuantityInCart + quantity;

  if (newTotalQuantity > product.stock) {
    const availableToAdd = product.stock - currentQuantityInCart;
    if (availableToAdd <= 0) {
      throw new Error('Cannot add more items. Stock limit reached.');
    }
    throw new Error(`Only ${availableToAdd} more items can be added. Stock limit: ${product.stock}`);
  }

  if (existingItem) {
    const { error: updateError } = await supabase
      .from('cart_items')
      .update({ quantity: newTotalQuantity })
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
  // Get the cart item with product stock info
  const { data: cartItem, error: fetchError } = await supabase
    .from('cart_items')
    .select(`
      *,
      product:products(stock)
    `)
    .eq('id', cartItemId)
    .single();

  if (fetchError) throw fetchError;

  if (!cartItem.product || cartItem.product.stock === null) {
    throw new Error('Product stock information not available');
  }

  if (quantity > cartItem.product.stock) {
    throw new Error(`Cannot set quantity to ${quantity}. Only ${cartItem.product.stock} items in stock.`);
  }

  if (quantity <= 0) {
    throw new Error('Quantity must be at least 1');
  }

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
