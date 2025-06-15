
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
  const { data, error } = await supabase
    .from('payments')
    .insert([payment])
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updatePaymentStatus(transactionId: string, status: Payment['status']) {
  const { data, error } = await supabase
    .from('payments')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('transaction_id', transactionId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function getPaymentHistory(userId: string) {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
}
