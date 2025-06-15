
import { supabase } from './client';

export async function getProducts() {
  console.log('Fetching products from database...');
  
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Supabase error fetching products:', error);
      throw new Error(`Failed to fetch products: ${error.message}`);
    }
    
    console.log('Raw data from Supabase:', data);
    console.log('Number of products fetched:', data?.length || 0);
    
    if (!data || data.length === 0) {
      console.warn('No products found in database');
      return [];
    }
    
    // Log each product's category for debugging
    data.forEach((product, index) => {
      console.log(`Product ${index + 1}:`, {
        id: product.id,
        name: product.name,
        category: product.category,
        price: product.price,
        stock: product.stock
      });
    });
    
    // Validate product data
    const validProducts = data.filter(product => {
      if (!product.id || !product.name || !product.price) {
        console.warn('Invalid product found:', product);
        return false;
      }
      return true;
    });
    
    console.log('Valid products after filtering:', validProducts.length);
    return validProducts;
  } catch (error) {
    console.error('Error in getProducts function:', error);
    throw error;
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
