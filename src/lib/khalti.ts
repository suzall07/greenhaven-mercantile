
import { supabase } from "./supabase";

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
    console.log('Initiating Khalti payment with input:', input);
    
    // Use Supabase Functions.invoke instead of fetch
    const { data, error } = await supabase.functions.invoke('khalti-payment', {
      body: input
    });

    if (error) {
      console.error('Supabase function error:', error);
      throw new Error(error.message || 'Failed to initiate payment');
    }
    
    if (!data || !data.payment_url) {
      console.error('Invalid response from payment function:', data);
      throw new Error('Invalid payment response');
    }
    
    console.log('Khalti payment initiated successfully:', data);
    
    // Open Khalti payment widget in a new window
    const khaltiWindow = window.open(data.payment_url, 'Khalti Payment', 'width=500,height=600');
    
    if (!khaltiWindow) {
      throw new Error('Failed to open payment window. Please enable popups for this site.');
    }
    
    // Poll for payment completion
    const checkPayment = setInterval(async () => {
      try {
        if (khaltiWindow.closed) {
          clearInterval(checkPayment);
          
          console.log('Payment window closed, verifying payment...');
          
          // Verify payment status using Supabase Functions.invoke
          const { data: verificationData, error: verifyError } = await supabase.functions.invoke(
            'verify-khalti-payment',
            {
              body: { pidx: data.pidx }
            }
          );
          
          if (verifyError) {
            console.error('Payment verification error:', verifyError);
            throw verifyError;
          }
          
          console.log('Payment verification result:', verificationData);
          
          if (verificationData && verificationData.status === 'Completed') {
            // Redirect to payment success page
            window.location.href = `/payment-success?pidx=${data.pidx}&amount=${input.amount}`;
            return verificationData;
          } else {
            console.warn('Payment not completed:', verificationData);
          }
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
        clearInterval(checkPayment);
        throw error;
      }
    }, 2000);
    
    // Clear interval after 5 minutes to prevent memory leaks
    setTimeout(() => {
      clearInterval(checkPayment);
      if (!khaltiWindow.closed) {
        console.log('Payment timeout, closing window');
      }
    }, 300000);

    return data;
  } catch (error) {
    console.error('Error initiating Khalti payment:', error);
    throw error;
  }
}
