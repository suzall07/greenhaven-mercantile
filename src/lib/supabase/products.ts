
import { supabase } from './client';

export async function getProducts() {
  console.log('Fetching products from database...');
  
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
  
  console.log('Products fetched successfully:', data);
  return data || [];
}

export async function getProductById(id: number) {
  console.log('Fetching product by ID:', id);
  
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching product by ID:', error);
    throw error;
  }
  
  console.log('Product fetched by ID:', data);
  return data;
}

export async function getProductsByCategory(category: string) {
  console.log('Fetching products by category:', category);
  
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('category', category)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching products by category:', error);
    throw error;
  }
  
  console.log('Products fetched by category:', data);
  return data || [];
}
