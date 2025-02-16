
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
    const response = await fetch('/api/khalti-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add Supabase auth header to validate the user
        'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
      },
      body: JSON.stringify(input)
    });

    if (!response.ok) {
      throw new Error('Failed to initiate payment');
    }

    const data = await response.json();
    
    // Open Khalti payment widget in a new window
    const khaltiWindow = window.open(data.payment_url, 'Khalti Payment', 'width=500,height=600');
    
    if (khaltiWindow) {
      // Poll for payment completion
      const checkPayment = setInterval(async () => {
        try {
          if (khaltiWindow.closed) {
            clearInterval(checkPayment);
            // Verify payment status
            const verifyResponse = await fetch(`/api/verify-khalti-payment/${data.pidx}`, {
              headers: {
                'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
              }
            });
            
            if (verifyResponse.ok) {
              const verificationData = await verifyResponse.json();
              if (verificationData.status === 'Completed') {
                return verificationData;
              }
            }
          }
        } catch (error) {
          console.error('Error checking payment status:', error);
        }
      }, 2000);
    }

    return data;
  } catch (error) {
    console.error('Error initiating Khalti payment:', error);
    throw error;
  }
}
