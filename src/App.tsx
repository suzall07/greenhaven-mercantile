
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Index from "@/pages/Index";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import Auth from "@/pages/Auth";
import Admin from "@/pages/Admin";
import NotFound from "@/pages/NotFound";
import IndoorPlants from "@/pages/IndoorPlants";
import OutdoorPlants from "@/pages/OutdoorPlants";
import PaymentSuccess from "@/pages/PaymentSuccess";
import PaymentHistory from "@/pages/PaymentHistory";
import { CartProvider } from "@/contexts/CartContext";
import { ProductDetails } from "@/components/product/ProductDetails";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
      gcTime: 10 * 60 * 1000, // 10 minutes
      staleTime: 5 * 60 * 1000, // 5 minutes
      networkMode: 'always',
    },
    mutations: {
      retry: 1,
      networkMode: 'always',
    },
  },
});

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
            <Route path="/indoor-plants" element={<IndoorPlants />} />
            <Route path="/outdoor-plants" element={<OutdoorPlants />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/payment-history" element={<PaymentHistory />} />
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
