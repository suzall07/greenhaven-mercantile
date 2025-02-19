
import { supabase } from "@/lib/supabase";

export const uploadProductImage = async (file: File): Promise<string> => {
  // Check if file is an allowed image type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('File type not supported. Please upload a JPEG, JPG or PNG image.');
  }

  try {
    // Create a unique filename
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

    // Upload the file to Supabase storage
    const { error: uploadError } = await supabase.storage
      .from('products')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw uploadError;
    }

    // Get the public URL using the new path
    const { data: { publicUrl } } = supabase.storage
      .from('products')
      .getPublicUrl(fileName);

    if (!publicUrl) {
      throw new Error('Failed to get public URL for uploaded image');
    }

    console.log('Successfully uploaded image:', fileName);
    console.log('Public URL:', publicUrl);
    
    return publicUrl;
  } catch (error: any) {
    console.error('Upload error:', error);
    throw new Error(`Failed to upload image: ${error.message}`);
  }
};
