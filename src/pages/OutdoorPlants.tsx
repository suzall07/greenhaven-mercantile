
import { useQuery } from "@tanstack/react-query";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Eye, Loader2, RefreshCw } from "lucide-react";
import { getProducts } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { LazyImage } from "@/components/LazyImage";
import { useCart } from "@/contexts/CartContext";
import { Skeleton } from "@/components/ui/skeleton";

const OutdoorPlants = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const { data: products = [], isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ['products'],
    queryFn: getProducts,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const outdoorPlants = products?.filter(product => 
    product.category.toLowerCase().includes('outdoor')
  );

  const handleAddToCart = async (productId: number) => {
    try {
      await addToCart(productId, 1);
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const handleRetry = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navigation />
        <div className="container mx-auto px-4 pt-24 flex-grow">
          <div className="mb-6">
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="space-y-4">
                <Skeleton className="w-full h-64 rounded-md" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-16" />
                <div className="flex gap-2">
                  <Skeleton className="h-10 flex-1" />
                  <Skeleton className="h-10 w-32" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navigation />
        <div className="container mx-auto px-4 pt-24 flex-grow">
          <div className="text-center max-w-md mx-auto">
            <div className="mb-4">
              <div className="w-16 h-16 mx-auto bg-destructive/10 rounded-full flex items-center justify-center mb-4">
                <RefreshCw className="h-8 w-8 text-destructive" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Failed to load plants</h2>
              <p className="text-muted-foreground mb-4">
                We're having trouble loading the outdoor plants. Please check your connection and try again.
              </p>
            </div>
            <Button 
              onClick={handleRetry} 
              disabled={isRefetching}
              className="mb-4"
            >
              {isRefetching ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Retrying...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </>
              )}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/')}
            >
              Go Back Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      
      <div className="container mx-auto px-4 pt-24 flex-grow">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl md:text-4xl font-bold animate-fadeIn">Outdoor Plants</h1>
          {isRefetching && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Refreshing...
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {outdoorPlants?.map((product, index) => (
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

        {outdoorPlants?.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center mb-4">
              <Eye className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No outdoor plants found</h3>
            <p className="text-muted-foreground">Check back later for new arrivals!</p>
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
