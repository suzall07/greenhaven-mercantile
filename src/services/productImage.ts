
import { supabase } from "@/lib/supabase";

export const uploadProductImage = async (file: File): Promise<string> => {
  // Check if file is an allowed image type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('File type not supported. Please upload a JPEG, JPG or PNG image.');
  }

  // Create a clean filename with timestamp to avoid duplicates
  const timestamp = new Date().getTime();
  const cleanFileName = file.name.replace(/[^a-zA-Z0-9.]/g, '');
  const fileExt = cleanFileName.split('.').pop()?.toLowerCase();
  const fileName = `${timestamp}-${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `${fileName}`;

  try {
    // Upload the file to Supabase storage
    const { error: uploadError, data } = await supabase.storage
      .from('products')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type
      });

    if (uploadError) throw uploadError;

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('products')
      .getPublicUrl(filePath);

    if (!publicUrl) {
      throw new Error('Failed to get public URL for uploaded image');
    }

    console.log('Upload successful, public URL:', publicUrl);
    return publicUrl;
  } catch (error: any) {
    console.error('Upload error:', error);
    throw new Error(`Failed to upload image: ${error.message}`);
  }
};
