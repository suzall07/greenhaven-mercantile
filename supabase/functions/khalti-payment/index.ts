
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const KHALTI_API_URL = "https://a.khalti.com/api/v2/epayment/initiate/";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders,
      status: 200
    });
  }

  try {
    const { amount, purchaseOrderId, purchaseOrderName, customerInfo } = await req.json();
    const khaltiSecretKey = Deno.env.get('KHALTI_SECRET_KEY');

    if (!khaltiSecretKey) {
      throw new Error('Khalti secret key not configured');
    }

    console.log('Initiating Khalti payment:', { amount, purchaseOrderId, purchaseOrderName });

    const payload = {
      return_url: `${req.headers.get('origin')}/payment-success`,
      website_url: req.headers.get('origin'),
      amount: amount * 100, // Convert to paisa
      purchase_order_id: purchaseOrderId,
      purchase_order_name: purchaseOrderName,
      customer_info: customerInfo,
    };

    console.log('Khalti request payload:', payload);

    // Initiate payment with Khalti
    const response = await fetch(KHALTI_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${khaltiSecretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    console.log('Khalti API response:', data);

    if (!response.ok) {
      console.error('Khalti error details:', data);
      throw new Error(data.detail || data.message || 'Failed to initiate payment');
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });
  } catch (error) {
    console.error('Error in Khalti payment:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
