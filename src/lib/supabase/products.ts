
import { supabase } from './client';

export async function getProducts() {
  console.log('🔍 Starting product fetch...');
  console.log('🔗 Supabase client initialized:', !!supabase);
  
  try {
    // Test basic connection first
    console.log('📡 Testing Supabase connection...');
    
    // Add timeout to prevent hanging
    const queryPromise = supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Query timeout after 10 seconds')), 10000);
    });
    
    const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any;
    
    console.log('📊 Raw Supabase response:', { data, error });
    
    if (error) {
      console.error('❌ Supabase error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw new Error(`Failed to fetch products: ${error.message}`);
    }
    
    console.log('✅ Query executed successfully');
    console.log('📦 Data received:', data);
    console.log('🔢 Number of products:', data?.length || 0);
    
    if (!data) {
      console.warn('⚠️ No data returned from query (null/undefined)');
      return [];
    }
    
    if (data.length === 0) {
      console.warn('⚠️ Products table appears to be empty');
      return [];
    }
    
    // Log each product for debugging
    data.forEach((product, index) => {
      console.log(`🌱 Product ${index + 1}:`, {
        id: product.id,
        name: product.name,
        category: product.category,
        price: product.price,
        stock: product.stock,
        image: product.image
      });
    });
    
    // Validate product data
    const validProducts = data.filter(product => {
      const isValid = !!(product.id && product.name && product.price);
      if (!isValid) {
        console.warn('⚠️ Invalid product found:', product);
      }
      return isValid;
    });
    
    console.log('✅ Valid products after filtering:', validProducts.length);
    return validProducts;
  } catch (error) {
    console.error('💥 Error in getProducts function:', error);
    console.error('🔍 Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    
    // Return empty array instead of throwing to prevent app crashes
    console.log('🔄 Returning empty array due to error');
    return [];
  }
}

export async function getProductById(id: number) {
  console.log('Fetching product by ID:', id);
  
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
    
    console.log('Product fetched by ID:', data);
    return data;
  } catch (error) {
    console.error('Error in getProductById function:', error);
    throw error;
  }
}

export async function getProductsByCategory(category: string) {
  console.log('Fetching products by category:', category);
  
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
    
    console.log('Products fetched by category:', data);
    return data || [];
  } catch (error) {
    console.error('Error in getProductsByCategory function:', error);
    throw error;
  }
}
