
import { supabase } from "./supabase";
import { toast } from "@/components/ui/use-toast";

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
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("You must be logged in to make a payment");
    }
    
    // Use Supabase Functions.invoke instead of fetch
    const { data, error } = await supabase.functions.invoke('khalti-payment', {
      body: input
    });

    if (error) {
      throw error;
    }
    
    console.log("Payment initiated:", data);
    
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
            
            console.log("Payment verification:", verificationData);
            
            if (verificationData.status === 'Completed') {
              toast({
                title: "Payment Successful",
                description: "Your payment has been processed successfully.",
              });
              
              // Save the order to the database
              const { error: orderError } = await supabase
                .from('orders')
                .insert({
                  user_id: user.id,
                  total: input.amount,
                  status: 'completed',
                  khalti_transaction_id: verificationData.transaction_id
                });
                
              if (orderError) {
                console.error("Error saving order:", orderError);
              }
              
              // Redirect to home page after successful payment
              setTimeout(() => {
                window.location.href = '/';
              }, 2000);
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
          clearInterval(checkPayment);
        }
      }, 2000);
    }

    return data;
  } catch (error: any) {
    console.error('Error initiating Khalti payment:', error);
    toast({
      title: "Payment Error",
      description: error.message || "Failed to initiate payment. Please try again.",
      variant: "destructive",
    });
    throw error;
  }
}
