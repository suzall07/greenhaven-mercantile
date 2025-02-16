
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const KHALTI_VERIFY_URL = "https://a.khalti.com/api/v2/epayment/lookup/";

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
    const { pidx } = await req.json();
    const khaltiSecretKey = Deno.env.get('KHALTI_SECRET_KEY');

    if (!khaltiSecretKey) {
      throw new Error('Khalti secret key not configured');
    }

    console.log('Verifying Khalti payment:', { pidx });

    // Verify payment with Khalti
    const response = await fetch(KHALTI_VERIFY_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${khaltiSecretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ pidx }),
    });

    const data = await response.json();
    console.log('Khalti verification response:', data);

    if (!response.ok) {
      console.error('Khalti verification error details:', data);
      throw new Error(data.detail || data.message || 'Failed to verify payment');
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });
  } catch (error) {
    console.error('Error in Khalti verification:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
