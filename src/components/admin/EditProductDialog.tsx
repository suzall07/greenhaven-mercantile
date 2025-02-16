
import { Product } from "@/lib/supabase";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

interface EditProductDialogProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  onProductChange: (updatedProduct: Product) => void;
}

export const EditProductDialog = ({
  product,
  isOpen,
  onClose,
  onSave,
  onProductChange,
}: EditProductDialogProps) => {
  const [newImage, setNewImage] = useState<File | null>(null);

  if (!product) return null;

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewImage(file);

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `product-images/${fileName}`;

      try {
        const { error: uploadError } = await supabase.storage
          .from('products')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('products')
          .getPublicUrl(filePath);

        onProductChange({ ...product, image: publicUrl });
      } catch (error) {
        console.error('Error uploading image:', error);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Name</Label>
            <Input
              value={product.name}
              onChange={(e) =>
                onProductChange({ ...product, name: e.target.value })
              }
            />
          </div>
          <div>
            <Label>Category</Label>
            <Input
              value={product.category}
              onChange={(e) =>
                onProductChange({ ...product, category: e.target.value })
              }
            />
          </div>
          <div>
            <Label>Price</Label>
            <Input
              type="number"
              value={product.price}
              onChange={(e) =>
                onProductChange({ ...product, price: Number(e.target.value) })
              }
            />
          </div>
          <div>
            <Label>Stock</Label>
            <Input
              type="number"
              value={product.stock}
              onChange={(e) =>
                onProductChange({ ...product, stock: Number(e.target.value) })
              }
            />
          </div>
          <div>
            <Label>Product Image</Label>
            <div className="space-y-2">
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              <div className="w-32 h-32 relative bg-gray-100 rounded-md overflow-hidden">
                <img
                  src={product.image || '/placeholder.svg'}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder.svg';
                  }}
                />
              </div>
            </div>
          </div>
          <div>
            <Label>Description</Label>
            <Textarea
              value={product.description}
              onChange={(e) =>
                onProductChange({ ...product, description: e.target.value })
              }
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
