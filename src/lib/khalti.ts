
import { supabase } from "./supabase";
import { toast } from "@/hooks/use-toast";

interface KhaltiPaymentInput {
  amount: number;
  purchaseOrderId: string;
  purchaseOrderName: string;
  customerInfo: {
    name: string;
    email: string;
  };
}

export async function initiateKhaltiPayment(input: KhaltiPaymentInput) {
  try {
    // Use Supabase Functions.invoke instead of fetch
    const { data, error } = await supabase.functions.invoke('khalti-payment', {
      body: input
    });

    if (error) {
      throw error;
    }
    
    // Open Khalti payment widget in a new window
    const khaltiWindow = window.open(data.payment_url, 'Khalti Payment', 'width=500,height=600');
    
    if (khaltiWindow) {
      // Poll for payment completion
      const checkPayment = setInterval(async () => {
        try {
          if (khaltiWindow.closed) {
            clearInterval(checkPayment);
            // Verify payment status using Supabase Functions.invoke
            const { data: verificationData, error: verifyError } = await supabase.functions.invoke(
              'verify-khalti-payment',
              {
                body: { pidx: data.pidx }
              }
            );
            
            if (verifyError) {
              throw verifyError;
            }
            
            if (verificationData.status === 'Completed') {
              toast({
                title: "Payment Successful",
                description: "Your payment has been processed successfully.",
              });
              // Redirect to home page after successful payment
              window.location.href = '/';
              return verificationData;
            }
          }
        } catch (error) {
          console.error('Error checking payment status:', error);
          toast({
            title: "Payment Error",
            description: "There was an error processing your payment.",
            variant: "destructive",
          });
        }
      }, 2000);
    }

    return data;
  } catch (error) {
    console.error('Error initiating Khalti payment:', error);
    toast({
      title: "Payment Error",
      description: "Failed to initiate payment. Please try again.",
      variant: "destructive",
    });
    throw error;
  }
}
