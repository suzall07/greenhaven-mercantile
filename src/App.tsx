
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CartProvider } from "@/contexts/CartContext";
import { ProfileProvider } from "@/contexts/ProfileContext";
import Index from "@/pages/Index";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import Admin from "@/pages/Admin";
import NotFound from "@/pages/NotFound";
import IndoorPlants from "@/pages/IndoorPlants";
import OutdoorPlants from "@/pages/OutdoorPlants";
import Auth from "@/pages/Auth";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import { ProductDetails } from "@/components/product/ProductDetails";
import { StrictMode } from "react";

// Create a new QueryClient instance with better retry and cache settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 60000, // 1 minute
      gcTime: 300000, // 5 minutes (previously called cacheTime)
    },
  },
});

function App() {
  return (
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <ProfileProvider>
          <CartProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/login" element={<Auth />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/indoor-plants" element={<IndoorPlants />} />
                <Route path="/outdoor-plants" element={<OutdoorPlants />} />
                <Route path="/product/:productId" element={<ProductDetails />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
            <Toaster />
          </CartProvider>
        </ProfileProvider>
      </QueryClientProvider>
    </StrictMode>
  );
}

export default App;
