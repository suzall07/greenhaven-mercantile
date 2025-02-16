
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { ProductFormFields } from "./ProductFormFields";
import { ProductImageUpload } from "./ProductImageUpload";
import { uploadProductImage } from "@/services/productImage";

export const AddProductForm = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Unauthorized",
          description: "You must be logged in as an admin to perform this action",
          variant: "destructive",
        });
        return;
      }

      if (!selectedImage) {
        toast({
          title: "Error",
          description: "Please select an image",
          variant: "destructive",
        });
        return;
      }

      // Upload image first
      const imageUrl = await uploadProductImage(selectedImage);

      const newProduct = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        image: imageUrl,
      };

      const { error } = await supabase
        .from('products')
        .insert([newProduct]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Product has been added successfully",
      });

      // Reset form
      setFormData({
        name: "",
        description: "",
        price: "",
        category: "",
        stock: "",
      });
      setSelectedImage(null);

      queryClient.invalidateQueries({ queryKey: ['products'] });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mb-12 bg-card p-6 rounded-lg shadow-sm">
      <h2 className="text-2xl font-semibold mb-4">Add New Product</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <ProductFormFields
          formData={formData}
          onChange={setFormData}
        />
        
        <ProductImageUpload
          onImageChange={setSelectedImage}
          required
        />

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Adding Product..." : "Add Product"}
        </Button>
      </form>
    </div>
  );
};
