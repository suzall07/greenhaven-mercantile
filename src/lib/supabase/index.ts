
// Re-export everything from the modular files for backward compatibility
export { supabase } from './client';
export type { Product, CartItem, Order } from './types';
export { 
  validateEmail, 
  signInWithEmail, 
  signUpWithEmail, 
  signOut 
} from './auth';
export { getProducts } from './products';
export { 
  getCartItems, 
  addToCart, 
  updateCartItemQuantity, 
  removeFromCart 
} from './cart';
export { 
  createPayment, 
  updatePaymentStatus, 
  getPaymentHistory 
} from './payments';
export type { Payment } from './payments';
