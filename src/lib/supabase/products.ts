
import { supabase } from './client';

export async function getProducts() {
  console.log('🔍 Starting product fetch...');
  
  try {
    // Simple, direct query without timeout complications
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    console.log('📊 Supabase response:', { data, error });
    
    if (error) {
      console.error('❌ Supabase error:', error.message);
      return [];
    }
    
    if (!data) {
      console.warn('⚠️ No data returned');
      return [];
    }
    
    console.log('✅ Products fetched successfully:', data.length);
    return data;
  } catch (error) {
    console.error('💥 Error fetching products:', error);
    return [];
  }
}

export async function getProductById(id: number) {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching product by ID:', error);
      throw new Error(`Failed to fetch product: ${error.message}`);
    }
    
    return data;
  } catch (error) {
    console.error('Error in getProductById function:', error);
    throw error;
  }
}

export async function getProductsByCategory(category: string) {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .ilike('category', `%${category}%`)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching products by category:', error);
      throw new Error(`Failed to fetch products by category: ${error.message}`);
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getProductsByCategory function:', error);
    return [];
  }
}
