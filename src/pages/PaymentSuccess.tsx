
import { useEffect, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, ArrowLeft, History, Loader2 } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [paymentData, setPaymentData] = useState<any>(null);

  useEffect(() => {
    // Simulate loading payment verification
    const timer = setTimeout(() => {
      setIsLoading(false);
      // Mock payment data - in real app, this would come from URL params or API
      setPaymentData({
        transactionId: searchParams.get('pidx') || 'TXN' + Date.now(),
        amount: searchParams.get('amount') || '0',
        status: 'Completed'
      });
    }, 1500);

    return () => clearTimeout(timer);
  }, [searchParams]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 pt-24">
          <div className="max-w-md mx-auto text-center">
            <Card>
              <CardContent className="pt-8 pb-8">
                <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
                <h2 className="text-xl font-semibold mb-2">Verifying Payment</h2>
                <p className="text-muted-foreground">Please wait while we confirm your payment...</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-md mx-auto">
          <Card className="text-center">
            <CardHeader className="pb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <CardTitle className="text-2xl text-green-600">Payment Successful!</CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-muted-foreground mb-4">
                  Your payment has been processed successfully. Thank you for your purchase!
                </p>
                
                {paymentData && (
                  <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Transaction ID:</span>
                      <span className="font-mono">{paymentData.transactionId}</span>
                    </div>
                    {paymentData.amount && paymentData.amount !== '0' && (
                      <div className="flex justify-between">
                        <span>Amount:</span>
                        <span className="font-semibold">Rs {paymentData.amount}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <span className="text-green-600 font-semibold">{paymentData.status}</span>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="space-y-3">
                <Button 
                  onClick={() => navigate('/')} 
                  className="w-full"
                  size="lg"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Continue Shopping
                </Button>
                
                <Button 
                  onClick={() => navigate('/payment-history')} 
                  variant="outline" 
                  className="w-full"
                  size="lg"
                >
                  <History className="mr-2 h-4 w-4" />
                  View Payment History
                </Button>
              </div>
              
              <div className="text-xs text-muted-foreground pt-4 border-t">
                <p>A confirmation email has been sent to your registered email address.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
