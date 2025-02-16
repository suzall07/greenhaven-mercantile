import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";
import { getProducts, addToCart, supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

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
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
          <h2 className="text-2xl md:text-3xl font-semibold mb-8 text-center">
            Featured Products
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {products?.slice(0, 3).map((product, index) => (
              <Link
                key={product.id}
                to={`/product/${product.id}`}
                className="product-card hover:shadow-md transition-shadow"
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
                  <p className="text-primary font-medium">Rs {product.price}</p>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/indoor-plants">
              <Button variant="outline">View All Products</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-12 px-4 bg-secondary/10">
        <div className="container mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-semibold mb-4">About GreenHaven</h2>
            <p className="text-muted-foreground mb-6">
              At GreenHaven, we believe in bringing the beauty and tranquility of nature into your living spaces. Our carefully curated collection of plants helps you create your perfect indoor or outdoor sanctuary.
            </p>
            <Link to="/about">
              <Button variant="link">Learn More About Us</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-12 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-semibold mb-4">Need Help?</h2>
          <p className="text-muted-foreground mb-6">
            Our plant experts are here to help you choose the perfect plants for your space.
          </p>
          <Link to="/contact">
            <Button>Contact Us</Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Index;
