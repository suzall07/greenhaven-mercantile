
export type Product = {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  description: string;
  stock: number;
  created_at: string;
};

export type CartItem = {
  id: number;
  product_id: number;
  user_id: string;
  quantity: number;
  product: Product;
};

export type Order = {
  id: number;
  user_id: string;
  total: number;
  status: 'pending' | 'completed' | 'cancelled';
  created_at: string;
};
