
import { LazyImage } from "@/components/LazyImage";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  stock: number;
}

interface ProductGridProps {
  products: Product[];
}

export const ProductGrid = ({ products }: ProductGridProps) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const handleAddToCart = async (productId: number) => {
    try {
      await addToCart(productId, 1);
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {products.map((product, index) => (
        <div
          key={product.id}
          className="product-card"
          style={{ animationDelay: `${0.2 * index}s` }}
        >
          <LazyImage
            src={product.image}
            alt={product.name}
            className="w-full h-64 object-cover rounded-md mb-4"
          />
          <div className="space-y-2">
            <span className="text-sm text-muted-foreground">
              {product.category}
            </span>
            <h3 className="text-lg font-semibold">{product.name}</h3>
            <p className="text-muted-foreground">{product.description}</p>
            <div className="flex justify-between items-center">
              <p className="text-primary font-medium">Rs {product.price}</p>
              <p className="text-sm text-muted-foreground">
                Stock: {product.stock || 0}
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                className="flex-1"
                onClick={() => handleAddToCart(product.id)}
                disabled={!product.stock || product.stock <= 0}
              >
                {!product.stock || product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate(`/product/${product.id}`)}
              >
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
