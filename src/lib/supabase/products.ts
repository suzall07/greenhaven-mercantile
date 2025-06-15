
import { supabase } from './client';

export async function getProducts() {
  console.log('🔍 Starting product fetch...');
  
  try {
    // Test the connection first
    const { data: testData, error: testError } = await supabase
      .from('products')
      .select('count(*)')
      .single();
    
    console.log('📊 Connection test:', { testData, testError });
    
    if (testError) {
      console.error('❌ Connection test failed:', testError.message);
      return [];
    }

    // Fetch all products with a simple query
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    console.log('📊 Supabase response:', { data, error });
    
    if (error) {
      console.error('❌ Supabase error:', error.message);
      // For debugging, let's see what specific error we're getting
      if (error.code === 'PGRST116') {
        console.log('💡 This might be a table access issue. Checking if products table exists...');
      }
      return [];
    }
    
    if (!data) {
      console.warn('⚠️ No data returned from query');
      return [];
    }
    
    console.log('✅ Products fetched successfully:', data.length, 'products');
    console.log('📋 First product sample:', data[0]);
    
    return data;
  } catch (error) {
    console.error('💥 Unexpected error fetching products:', error);
    // Return empty array to prevent app crashes
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
