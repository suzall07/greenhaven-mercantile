
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export const ProductList = () => {
  const { data: products, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Product List</h2>
      {isLoading ? (
        <div className="text-center">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {products?.map((product) => (
            <div
              key={product.id}
              className="bg-card p-4 rounded-lg shadow-sm"
            >
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-48 object-cover rounded-md mb-4"
              />
              <div className="space-y-2">
                <h3 className="font-semibold">{product.name}</h3>
                <p className="text-sm text-muted-foreground">
                  Category: {product.category}
                </p>
                <p className="text-sm text-muted-foreground">
                  Price: Rs {product.price}
                </p>
                <p className="text-sm text-muted-foreground">
                  Stock: {product.stock}
                </p>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {product.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
