
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";
import { getProducts } from "@/lib/supabase";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { LazyImage } from "@/components/LazyImage";

const Decoratives = () => {
  const { toast } = useToast();
  const { addToCart } = useCart();
  
  const { data: products = [], isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: getProducts,
  });

  // Filter products for decoratives category
  const decorativeProducts = products.filter(product => 
    product.category === 'decoratives'
  );

  const handleAddToCart = async (productId: number) => {
    try {
      await addToCart(productId, 1);
    } catch (error: any) {
      // Error handling is done in the cart context
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

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 pt-24">
          <div className="text-center text-red-500">
            Error loading decoratives. Please try again later.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative w-full h-[400px] overflow-hidden">
          <LazyImage
            src="https://images.unsplash.com/photo-1721322800607-8c38375eef04"
            alt="Decorative items hero"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 animate-fadeIn">
              Decorative Items
            </h1>
            <p className="text-lg md:text-xl text-center max-w-2xl animate-fadeIn" style={{ animationDelay: "0.2s" }}>
              Beautiful decorative pieces to complement your plants and enhance your space
            </p>
          </div>
        </section>

        {/* Products Section */}
        <section className="py-12 px-4">
          <div className="container mx-auto">
            {decorativeProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {decorativeProducts.map((product, index) => (
                  <div
                    key={product.id}
                    className="product-card hover:shadow-md transition-shadow bg-card rounded-lg overflow-hidden animate-fadeIn"
                    style={{ animationDelay: `${0.1 * index}s` }}
                  >
                    <Link to={`/product/${product.id}`}>
                      <div className="relative">
                        <LazyImage
                          src={product.image}
                          alt={product.name}
                          className="w-full h-64 object-cover"
                        />
                      </div>
                    </Link>
                    <div className="p-4 space-y-3">
                      <div>
                        <span className="text-sm text-muted-foreground">
                          {product.category}
                        </span>
                        <h3 className="text-lg font-semibold">{product.name}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {product.description}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-primary font-medium text-lg">
                          Rs {product.price}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          Stock: {product.stock}
                        </span>
                      </div>
                      <Button 
                        onClick={() => handleAddToCart(product.id)}
                        className="w-full"
                        disabled={product.stock === 0}
                      >
                        {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h2 className="text-2xl font-semibold mb-4">No Decoratives Available</h2>
                <p className="text-muted-foreground mb-6">
                  We're working on adding decorative items to our collection. Check back soon!
                </p>
                <Link to="/">
                  <Button variant="outline">Browse All Products</Button>
                </Link>
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="py-6 px-4 bg-secondary/10 mt-12">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Plant&deco. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Decoratives;
