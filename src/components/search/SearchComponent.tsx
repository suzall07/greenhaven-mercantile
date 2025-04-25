
import { useState, useEffect, useRef } from "react";
import { Search, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { useQuery } from "@tanstack/react-query";
import { getProducts, addToCart, supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { Badge } from "@/components/ui/badge";
import debounce from 'lodash.debounce';

export const SearchComponent = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const [isAddingToCart, setIsAddingToCart] = useState<Record<number, boolean>>({});
  const { toast } = useToast();
  const navigate = useNavigate();
  const { refetchCart } = useCart();

  // Focus search input when sheet opens
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isSearchOpen]);

  // Set up debounced search
  useEffect(() => {
    const handler = debounce(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    handler();
    return () => {
      handler.cancel();
    };
  }, [searchQuery]);

  // Clear search when sheet closes
  const handleSheetOpenChange = (open: boolean) => {
    setIsSearchOpen(open);
    if (!open) {
      setSearchQuery("");
      setDebouncedQuery("");
    }
  };

  const { data: products, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: getProducts,
  });

  const filteredProducts = products?.filter(product => {
    if (!debouncedQuery) return false;
    
    const query = debouncedQuery.toLowerCase();
    return (
      product.name.toLowerCase().includes(query) ||
      product.description?.toLowerCase().includes(query) ||
      product.category?.toLowerCase().includes(query)
    );
  });

  const handleAddToCart = async (productId: number) => {
    try {
      setIsAddingToCart(prev => ({ ...prev, [productId]: true }));
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Please sign in",
          description: "You need to be signed in to add items to cart",
          variant: "destructive",
        });
        setIsSearchOpen(false);
        navigate('/login');
        return;
      }

      await addToCart(user.id, productId, 1);
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
    } finally {
      setIsAddingToCart(prev => ({ ...prev, [productId]: false }));
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setDebouncedQuery("");
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const handleProductClick = (productId: number) => {
    setIsSearchOpen(false);
    navigate(`/product/${productId}`);
  };

  return (
    <Sheet open={isSearchOpen} onOpenChange={handleSheetOpenChange}>
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
          <div className="relative mb-4">
            <Input
              ref={searchInputRef}
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
            {searchQuery && (
              <button 
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" 
                onClick={clearSearch}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          
          {debouncedQuery && (
            <div className="mb-2">
              <p className="text-sm text-muted-foreground">
                {isLoading
                  ? "Searching..."
                  : filteredProducts?.length === 0
                  ? "No products found"
                  : `Found ${filteredProducts?.length} product${filteredProducts?.length === 1 ? "" : "s"}`}
              </p>
            </div>
          )}
          
          {isLoading && debouncedQuery ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : debouncedQuery && filteredProducts?.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-lg font-medium mb-2">No products found</p>
              <p>Try using different keywords or browse our categories</p>
              <SheetClose asChild>
                <div className="mt-4 space-x-2">
                  <Button variant="outline" onClick={() => navigate("/indoor-plants")}>
                    Indoor Plants
                  </Button>
                  <Button variant="outline" onClick={() => navigate("/outdoor-plants")}>
                    Outdoor Plants
                  </Button>
                </div>
              </SheetClose>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto">
              {filteredProducts?.map((product) => (
                <div key={product.id} className="flex space-x-4 p-4 bg-card rounded-lg hover:bg-accent/10 transition-colors cursor-pointer">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-20 h-20 object-cover rounded"
                    onClick={() => handleProductClick(product.id)}
                  />
                  <div className="flex-1">
                    <div onClick={() => handleProductClick(product.id)}>
                      <h3 className="font-semibold">{product.name}</h3>
                      <p className="text-sm text-muted-foreground mb-1">
                        Rs {product.price}
                      </p>
                      <Badge variant="outline" className="text-xs mb-2">
                        {product.category}
                      </Badge>
                    </div>
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(product.id);
                      }}
                      disabled={isAddingToCart[product.id]}
                    >
                      {isAddingToCart[product.id] ? (
                        <>
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        "Add to Cart"
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
