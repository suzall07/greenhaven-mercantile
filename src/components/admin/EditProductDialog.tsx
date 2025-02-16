
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
  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Name</label>
            <Input
              value={product.name}
              onChange={(e) =>
                onProductChange({ ...product, name: e.target.value })
              }
            />
          </div>
          <div>
            <label className="text-sm font-medium">Category</label>
            <Input
              value={product.category}
              onChange={(e) =>
                onProductChange({ ...product, category: e.target.value })
              }
            />
          </div>
          <div>
            <label className="text-sm font-medium">Price</label>
            <Input
              type="number"
              value={product.price}
              onChange={(e) =>
                onProductChange({ ...product, price: Number(e.target.value) })
              }
            />
          </div>
          <div>
            <label className="text-sm font-medium">Stock</label>
            <Input
              type="number"
              value={product.stock}
              onChange={(e) =>
                onProductChange({ ...product, stock: Number(e.target.value) })
              }
            />
          </div>
          <div>
            <label className="text-sm font-medium">Image URL</label>
            <Input
              value={product.image}
              onChange={(e) =>
                onProductChange({ ...product, image: e.target.value })
              }
            />
          </div>
          <div>
            <label className="text-sm font-medium">Description</label>
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
