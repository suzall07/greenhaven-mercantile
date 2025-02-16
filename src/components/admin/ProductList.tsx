
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase, Product } from "@/lib/supabase";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { ProductCard } from "./ProductCard";
import { EditProductDialog } from "./EditProductDialog";

export const ProductList = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const { data: products, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (productId: number) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const { error } = await supabase
          .from('products')
          .delete()
          .eq('id', productId);

        if (error) throw error;

        toast({
          title: "Product deleted",
          description: "The product has been deleted successfully.",
        });

        queryClient.invalidateQueries({ queryKey: ['products'] });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete the product. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleSaveEdit = async () => {
    if (!editingProduct) return;

    try {
      const { error } = await supabase
        .from('products')
        .update({
          name: editingProduct.name,
          description: editingProduct.description,
          price: editingProduct.price,
          stock: editingProduct.stock,
          category: editingProduct.category,
          image: editingProduct.image,
        })
        .eq('id', editingProduct.id);

      if (error) throw error;

      toast({
        title: "Product updated",
        description: "The product has been updated successfully.",
      });

      setIsEditDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['products'] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update the product. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Product List</h2>
      {isLoading ? (
        <div className="text-center">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {products?.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <EditProductDialog
        product={editingProduct}
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onSave={handleSaveEdit}
        onProductChange={setEditingProduct}
      />
    </div>
  );
};
