
import { useQuery } from "@tanstack/react-query";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { getProducts, addToCart, supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

const IndoorPlants = () => {
  const { toast } = useToast();
  const { data: products, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: getProducts,
  });

  const indoorPlants = products?.filter(product => 
    product.category.toLowerCase().includes('indoor')
  );

  const handleAddToCart = async (productId: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Please sign in",
          description: "You need to be signed in to add items to cart",
          variant: "destructive",
        });
        return;
      }

      await addToCart(user.id, productId, 1);
      toast({
        title: "Added to cart",
        description: "Item has been added to your cart",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 pt-24">
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
                <img
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
                  <p className="text-primary font-medium">${product.price}</p>
                  <Button 
                    className="w-full"
                    onClick={() => handleAddToCart(product.id)}
                  >
                    Add to Cart
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default IndoorPlants;
