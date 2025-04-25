
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CartProvider } from "@/contexts/CartContext";
import { ProfileProvider } from "@/contexts/ProfileContext";
import Index from "@/pages/Index";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import Auth from "@/pages/Auth";
import Admin from "@/pages/Admin";
import NotFound from "@/pages/NotFound";
import IndoorPlants from "@/pages/IndoorPlants";
import OutdoorPlants from "@/pages/OutdoorPlants";
import CustomerLogin from "@/pages/CustomerLogin";
import Cart from "@/pages/Cart";
import { ProductDetails } from "@/components/product/ProductDetails"; // Changed from default to named import

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ProfileProvider>
        <CartProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/login" element={<CustomerLogin />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/indoor-plants" element={<IndoorPlants />} />
              <Route path="/outdoor-plants" element={<OutdoorPlants />} />
              <Route path="/product/:productId" element={<ProductDetails />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
          <Toaster />
        </CartProvider>
      </ProfileProvider>
    </QueryClientProvider>
  );
}

export default App;
