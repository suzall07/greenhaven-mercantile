
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
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("You must be logged in to make a payment");
    }
    
    // Show loading toast
    toast({
      title: "Processing",
      description: "Initiating payment...",
    });
    
    // Use Supabase Functions.invoke for payment initiation
    const { data, error } = await supabase.functions.invoke('khalti-payment', {
      body: input
    });

    if (error) {
      console.error("Khalti payment error:", error);
      throw error;
    }
    
    console.log("Payment initiated:", data);
    
    // Show success toast
    toast({
      title: "Payment Initiated",
      description: "Redirecting to Khalti payment page...",
    });
    
    // Open Khalti payment widget in a new window
    const khaltiWindow = window.open(data.payment_url, 'Khalti Payment', 'width=500,height=600');
    
    if (!khaltiWindow) {
      toast({
        title: "Popup Blocked",
        description: "Please allow popups to continue with payment",
        variant: "destructive"
      });
      return null;
    }
    
    // Poll for payment completion
    const checkPayment = setInterval(async () => {
      try {
        if (khaltiWindow.closed) {
          clearInterval(checkPayment);
          // Verify payment status
          try {
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
              
              // Clear cart after successful payment
              const { data: cartItems } = await supabase
                .from('cart_items')
                .select('id')
                .eq('user_id', user.id);
                
              if (cartItems) {
                for (const item of cartItems) {
                  await supabase.from('cart_items').delete().eq('id', item.id);
                }
              }
              
              // Redirect to homepage after successful payment
              window.location.href = '/';
            } else {
              toast({
                title: "Payment Incomplete",
                description: "Your payment was not completed. Please try again.",
                variant: "destructive",
              });
            }
          } catch (verifyError: any) {
            console.error('Error verifying payment:', verifyError);
            toast({
              title: "Verification Error",
              description: verifyError.message || "There was an error verifying your payment.",
              variant: "destructive",
            });
          }
          
          clearInterval(checkPayment);
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
        clearInterval(checkPayment);
      }
    }, 2000);

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
