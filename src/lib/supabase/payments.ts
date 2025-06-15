
import { supabase } from './client';

export interface Payment {
  id: string;
  user_id: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  transaction_id: string;
  purchase_order_id: string;
  purchase_order_name: string;
  created_at: string;
  updated_at: string;
}

export async function createPayment(payment: Omit<Payment, 'id' | 'created_at' | 'updated_at'>) {
  console.log('Creating payment record:', payment);
  
  const { data, error } = await supabase
    .from('payments')
    .insert([payment])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating payment:', error);
    throw error;
  }
  
  console.log('Payment record created:', data);
  return data;
}

export async function updatePaymentStatus(transactionId: string, status: Payment['status']) {
  console.log('Updating payment status:', { transactionId, status });
  
  const { data, error } = await supabase
    .from('payments')
    .update({ 
      status, 
      updated_at: new Date().toISOString() 
    })
    .eq('transaction_id', transactionId)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating payment status:', error);
    throw error;
  }
  
  console.log('Payment status updated:', data);
  return data;
}

export async function getPaymentHistory(userId: string) {
  console.log('Fetching payment history for user:', userId);
  
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching payment history:', error);
    throw error;
  }
  
  console.log('Payment history fetched:', data);
  return data || [];
}
