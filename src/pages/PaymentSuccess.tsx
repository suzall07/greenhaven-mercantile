
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Show success message when component mounts
    toast({
      title: "Payment Successful!",
      description: "Your payment has been processed successfully.",
    });
  }, [toast]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      
      <div className="container mx-auto px-4 pt-24 flex-grow flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md">
          <div className="flex justify-center">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          
          <h1 className="text-3xl font-bold text-green-600">Payment Successful!</h1>
          
          <p className="text-muted-foreground">
            Thank you for your purchase. Your payment has been processed successfully.
          </p>
          
          <div className="space-y-3">
            <Button 
              onClick={() => navigate("/")}
              className="w-full"
            >
              Go Back to Store
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => navigate("/payment-history")}
              className="w-full"
            >
              View Payment History
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
