
import { supabase } from "@/lib/supabase";

export const uploadProductImage = async (file: File): Promise<string> => {
  // Check if file is an allowed image type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('File type not supported. Please upload a JPEG, JPG or PNG image.');
  }

  const fileExt = file.name.split('.').pop()?.toLowerCase();
  const fileName = `${Math.random()}.${fileExt}`;
  const filePath = `product-images/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('products')
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage
    .from('products')
    .getPublicUrl(filePath);

  return publicUrl;
};
