
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";
import { getProducts } from "@/lib/supabase/products";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { LazyImage } from "@/components/LazyImage";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
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

const LoadingSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
    {[1, 2, 3].map((i) => (
      <div key={i} className="space-y-4">
        <Skeleton className="w-full h-64 rounded-md" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-4 w-24" />
      </div>
    ))}
  </div>
);

const Index = () => {
  const { toast } = useToast();
  const { addToCart } = useCart();
  const [carouselApi, setCarouselApi] = useState<any>(null);
  
  const { data: products = [], isLoading, error, refetch } = useQuery({
    queryKey: ['products'],
    queryFn: getProducts,
    retry: 3,
    retryDelay: 1000,
  });

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
      // Error handling is done in the cart context
    }
  };

  const handleRetry = () => {
    refetch();
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 pt-24">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-semibold text-red-600">
              Error loading products
            </h2>
            <p className="text-muted-foreground">
              {error instanceof Error ? error.message : 'Something went wrong. Please try again.'}
            </p>
            <Button onClick={handleRetry} variant="outline">
              Retry Loading
            </Button>
          </div>
        </div>
      </div>
    );
  }

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
            {isLoading ? (
              <LoadingSkeleton />
            ) : products.length > 0 ? (
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
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">No products available at the moment.</p>
                <Button onClick={handleRetry} variant="outline" className="mt-4">
                  Refresh Products
                </Button>
              </div>
            )}
            {products.length > 0 && (
              <div className="text-center mt-8">
                <Link to="/indoor-plants">
                  <Button variant="outline">View All Products</Button>
                </Link>
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
