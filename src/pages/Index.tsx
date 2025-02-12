
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";

const Index = () => {
  const featuredProducts = [
    {
      id: 1,
      name: "Monstera Deliciosa",
      price: 39.99,
      image: "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&q=80&w=400",
      category: "Plants",
    },
    {
      id: 2,
      name: "Ceramic Plant Pot",
      price: 24.99,
      image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&q=80&w=400",
      category: "Decor",
    },
    {
      id: 3,
      name: "Snake Plant",
      price: 29.99,
      image: "https://images.unsplash.com/photo-1593691509543-c55fb32e7caa?auto=format&fit=crop&q=80&w=400",
      category: "Plants",
    },
  ];

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
            {featuredProducts.map((product, index) => (
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
                  <Button className="w-full">Add to Cart</Button>
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
