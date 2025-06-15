
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";
import { getProducts } from "@/lib/supabase";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { LazyImage } from "@/components/LazyImage";
import { useEffect, useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const heroSlides = [
  {
    image: "https://images.unsplash.com/photo-1518495973542-4542c06a5843",
    quote: "Bring nature indoors, transform your space.",
    author: "Plant&deco"
  },
  {
    image: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9",
    quote: "Every plant has a story to tell.",
    author: "Plant&deco"
  },
  {
    image: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07",
    quote: "Where nature meets design.",
    author: "Plant&deco"
  }
];

const Index = () => {
  const { toast } = useToast();
  const { addToCart } = useCart();
  const [carouselApi, setCarouselApi] = useState<any>(null);
  
  console.log('Index component rendering...');
  
  const { data: products = [], isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: getProducts,
  });

  console.log('Products data:', products);
  console.log('Loading state:', isLoading);
  console.log('Error state:', error);

  // Set up auto-sliding for carousel
  useEffect(() => {
    if (carouselApi) {
      // Auto advance slide every 5 seconds
      const autoplayInterval = setInterval(() => {
        carouselApi.scrollNext();
      }, 5000);

      // Clear interval on component unmount
      return () => {
        clearInterval(autoplayInterval);
      };
    }
  }, [carouselApi]);

  const handleAddToCart = async (productId: number) => {
    try {
      await addToCart(productId, 1);
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      // Error handling is done in the cart context
    }
  };

  if (isLoading) {
    console.log('Showing loading state...');
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 pt-24">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 w-32 bg-gray-300 rounded mx-auto mb-4"></div>
              <div className="h-4 w-48 bg-gray-300 rounded mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    console.error('Error loading products:', error);
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 pt-24">
          <div className="text-center text-red-500">
            <h2 className="text-xl font-semibold mb-2">Error loading products</h2>
            <p>Please try refreshing the page</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="mt-4"
              variant="outline"
            >
              Refresh Page
            </Button>
          </div>
        </div>
      </div>
    );
  }

  console.log('Rendering main content with products:', products.length);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      
      <main className="flex-grow">
        {/* Hero Section with Carousel */}
        <section className="relative w-full h-[600px] overflow-hidden">
          <Carousel className="w-full h-full" opts={{ loop: true }} setApi={setCarouselApi}>
            <CarouselContent>
              {heroSlides.map((slide, index) => (
                <CarouselItem key={index}>
                  <div className="relative w-full h-[600px]">
                    <LazyImage
                      src={slide.image}
                      alt={`Hero slide ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center text-white">
                      <blockquote className="max-w-2xl text-center">
                        <p className="text-3xl md:text-4xl font-semibold mb-4 animate-fadeIn">
                          "{slide.quote}"
                        </p>
                        <footer className="text-lg md:text-xl animate-fadeIn" style={{ animationDelay: "0.2s" }}>
                          — {slide.author}
                        </footer>
                      </blockquote>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-4" />
            <CarouselNext className="right-4" />
          </Carousel>
        </section>

        {/* Featured Products Section */}
        <section className="py-12 px-4">
          <div className="container mx-auto">
            <h2 className="text-2xl md:text-3xl font-semibold mb-8 text-center">
              Featured Products
            </h2>
            {products.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {products.slice(0, 3).map((product, index) => (
                    <Link
                      key={product.id}
                      to={`/product/${product.id}`}
                      className="product-card hover:shadow-md transition-shadow"
                      style={{ animationDelay: `${0.2 * index}s` }}
                    >
                      <div className="mb-4">
                        <LazyImage
                          src={product.image}
                          alt={product.name}
                          className="w-full h-64 object-cover rounded-md"
                        />
                      </div>
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
              </>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold mb-4">No Products Available</h3>
                <p className="text-muted-foreground">
                  We're working on adding products to our collection. Check back soon!
                </p>
              </div>
            )}
          </div>
        </section>

        {/* About Section */}
        <section className="py-12 px-4 bg-secondary/10">
          <div className="container mx-auto">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl md:text-3xl font-semibold mb-4">About Plant&deco</h2>
              <p className="text-muted-foreground mb-6">
                At Plant&deco, we believe in bringing the beauty and tranquility of nature into your living spaces. Our carefully curated collection of plants helps you create your perfect indoor or outdoor sanctuary.
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
      </main>

      <footer className="py-6 px-4 bg-secondary/10 mt-12">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Plant&deco. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
