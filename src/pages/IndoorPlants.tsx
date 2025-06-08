
import { useQuery } from "@tanstack/react-query";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { getProducts } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { LazyImage } from "@/components/LazyImage";
import { useCart } from "@/contexts/CartContext";

const IndoorPlants = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const { data: products, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: getProducts,
  });

  const indoorPlants = products?.filter(product => 
    product.category.toLowerCase().includes('indoor')
  );

  const handleAddToCart = async (productId: number) => {
    await addToCart(productId, 1);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      
      <div className="container mx-auto px-4 pt-24 flex-grow">
        <h1 className="text-3xl md:text-4xl font-bold mb-6 animate-fadeIn">Indoor Plants</h1>
        
        {isLoading ? (
          <div className="text-center">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {indoorPlants?.map((product, index) => (
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
                  <p className="text-primary font-medium">Rs {product.price}</p>
                  <div className="flex gap-2">
                    <Button 
                      className="flex-1"
                      onClick={() => handleAddToCart(product.id)}
                    >
                      Add to Cart
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
        )}
      </div>

      <footer className="py-6 px-4 bg-secondary/10 mt-12">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Plant&deco. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default IndoorPlants;
