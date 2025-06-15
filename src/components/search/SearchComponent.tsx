
import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useQuery } from "@tanstack/react-query";
import { getProducts } from "@/lib/supabase/products";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { LazyImage } from "@/components/LazyImage";

export const SearchComponent = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { addToCart, refetchCart } = useCart();

  const { data: products } = useQuery({
    queryKey: ['products'],
    queryFn: getProducts,
  });

  const filteredProducts = products?.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchQuery.toLowerCase())
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
        navigate('/auth');
        return;
      }

      await addToCart(productId, 1);
      await refetchCart();
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
    <Sheet open={isSearchOpen} onOpenChange={setIsSearchOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <Search className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="top" className="w-full">
        <SheetHeader>
          <SheetTitle>Search Products</SheetTitle>
        </SheetHeader>
        <div className="py-4">
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mb-4"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto">
            {filteredProducts?.map((product) => {
              const isOutOfStock = !product.stock || product.stock <= 0;
              return (
                <div key={product.id} className="flex space-x-4 p-4 bg-card rounded-lg">
                  <LazyImage
                    src={product.image}
                    alt={product.name}
                    className="w-20 h-20 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold">{product.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Rs {product.price}
                    </p>
                    <p className={`text-xs mb-2 ${isOutOfStock ? 'text-destructive' : 'text-muted-foreground'}`}>
                      {isOutOfStock ? 'Out of Stock' : `Stock: ${product.stock}`}
                    </p>
                    <Button
                      size="sm"
                      onClick={() => handleAddToCart(product.id)}
                      disabled={isOutOfStock}
                    >
                      {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                    </Button>
                  </div>
                </div>
              );
            })}
            {searchQuery && filteredProducts?.length === 0 && (
              <div className="col-span-full text-center py-8">
                <p className="text-muted-foreground">No products found matching "{searchQuery}"</p>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
