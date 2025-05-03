
import { useQuery } from "@tanstack/react-query";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { getProducts } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { LazyImage } from "@/components/LazyImage";
import { useCart } from "@/contexts/CartContext";
import { useState } from "react";

const OutdoorPlants = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { addToCart, isLoading: cartLoading } = useCart();
  const [addingToCart, setAddingToCart] = useState<number | null>(null);
  
  const { data: products, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: getProducts,
  });

  const outdoorPlants = products?.filter(product => 
    product.category.toLowerCase().includes('outdoor')
  );

  const handleAddToCart = async (productId: number) => {
    try {
      setAddingToCart(productId);
      await addToCart(productId, 1);
    } catch (error: any) {
      console.error("Error adding to cart:", error);
      toast({
        title: "Error",
        description: error.message || "Could not add to cart",
        variant: "destructive",
      });
    } finally {
      setTimeout(() => setAddingToCart(null), 500);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      
      <div className="container mx-auto px-4 pt-24 flex-grow">
        <h1 className="text-3xl md:text-4xl font-bold mb-6 animate-fadeIn">Outdoor Plants</h1>
        
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-pulse flex space-x-4 justify-center">
              <div className="rounded-full bg-slate-200 h-10 w-10"></div>
              <div className="flex-1 space-y-6 py-1 max-w-md">
                <div className="h-2 bg-slate-200 rounded"></div>
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="h-2 bg-slate-200 rounded col-span-2"></div>
                    <div className="h-2 bg-slate-200 rounded col-span-1"></div>
                  </div>
                  <div className="h-2 bg-slate-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {outdoorPlants?.map((product, index) => (
              <div
                key={product.id}
                className="product-card bg-white rounded-lg shadow-md p-4 transition-transform duration-200 hover:scale-[1.02]"
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
                  <p className="text-muted-foreground line-clamp-2">{product.description}</p>
                  <p className="text-primary font-medium">Rs {product.price}</p>
                  <div className="flex gap-2">
                    <Button 
                      className="flex-1"
                      onClick={() => handleAddToCart(product.id)}
                      disabled={addingToCart === product.id || cartLoading}
                    >
                      {addingToCart === product.id ? "Adding..." : "Add to Cart"}
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

export default OutdoorPlants;
