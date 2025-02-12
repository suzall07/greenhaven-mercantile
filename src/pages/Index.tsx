
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";
import { getProducts, addToCart, supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const { toast } = useToast();
  const { data: products, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: getProducts,
  });

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 pt-24">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-24 pb-12 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fadeIn">
            Welcome to GreenHaven
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 animate-fadeIn" style={{ animationDelay: "0.2s" }}>
            Discover the perfect blend of nature and style
          </p>
          <Button className="animate-fadeIn" style={{ animationDelay: "0.4s" }}>
            Shop Now
          </Button>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
          <h2 className="text-2xl md:text-3xl font-semibold mb-8 text-center">
            Featured Products
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {products?.map((product, index) => (
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
        </div>
      </section>
    </div>
  );
};

export default Index;
