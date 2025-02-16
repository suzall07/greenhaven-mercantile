
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { Product } from "@/lib/supabase";
import { LazyImage } from "@/components/LazyImage";

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (productId: number) => void;
}

export const ProductCard = ({ product, onEdit, onDelete }: ProductCardProps) => {
  return (
    <div className="bg-card p-4 rounded-lg shadow-sm relative group">
      <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <Button
          variant="outline"
          size="icon"
          onClick={() => onEdit(product)}
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="destructive"
          size="icon"
          onClick={() => onDelete(product.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      <div className="w-full h-48 relative bg-gray-100 rounded-md overflow-hidden">
        <LazyImage
          src={product.image || '/placeholder.svg'}
          alt={product.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="space-y-2 mt-4">
        <h3 className="font-semibold">{product.name}</h3>
        <p className="text-sm text-muted-foreground">
          Category: {product.category}
        </p>
        <p className="text-sm text-muted-foreground">
          Price: Rs {product.price}
        </p>
        <p className="text-sm text-muted-foreground">
          Stock: {product.stock}
        </p>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {product.description}
        </p>
      </div>
    </div>
  );
};
