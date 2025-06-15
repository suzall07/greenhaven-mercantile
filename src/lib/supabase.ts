
// Re-export everything from the modular files for backward compatibility
export { supabase } from './supabase/client';
export type { Product, CartItem, Order } from './supabase/types';
export { 
  validateEmail, 
  signInWithEmail, 
  signUpWithEmail, 
  signOut 
} from './supabase/auth';
export { getProducts } from './supabase/products';
export { 
  getCartItems, 
  addToCart, 
  updateCartItemQuantity, 
  removeFromCart 
} from './supabase/cart';
export { 
  createPayment, 
  updatePaymentStatus, 
  getPaymentHistory 
} from './supabase/payments';
export type { Payment } from './supabase/payments';
