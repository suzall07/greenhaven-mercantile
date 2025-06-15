
import { supabase } from './client';

export async function getProducts() {
  console.log('Starting getProducts query...');
  
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    console.log('Supabase query response:', { data, error });
    
    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    
    console.log('Products fetched successfully:', data?.length || 0, 'items');
    return data || [];
  } catch (error) {
    console.error('Error in getProducts:', error);
    throw error;
  }
}
