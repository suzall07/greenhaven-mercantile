
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Index from "@/pages/Index";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import Auth from "@/pages/Auth";
import Admin from "@/pages/Admin";
import AdminLogin from "@/pages/AdminLogin";
import NotFound from "@/pages/NotFound";
import IndoorPlants from "@/pages/IndoorPlants";
import OutdoorPlants from "@/pages/OutdoorPlants";
import { CartProvider } from "@/contexts/CartContext";
import { ProductDetails } from "@/components/product/ProductDetails";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/indoor-plants" element={<IndoorPlants />} />
            <Route path="/outdoor-plants" element={<OutdoorPlants />} />
            <Route path="/product/:productId" element={<ProductDetails />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        <Toaster />
      </CartProvider>
    </QueryClientProvider>
  );
}

export default App;
