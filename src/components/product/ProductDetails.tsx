import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Star } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const ProductDetails = () => {
  const { productId } = useParams();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(0);

  const { data: product, isLoading: isLoadingProduct } = useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  const { data: reviews, isLoading: isLoadingReviews } = useQuery({
    queryKey: ['reviews', productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_reviews')
        .select('*, profiles:user_id(email)')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const addToCartMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Please sign in to add items to cart");

      const { error } = await supabase
        .from('cart_items')
        .insert([{ 
          user_id: user.id, 
          product_id: productId, 
          quantity: 1 
        }]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Item added to cart",
      });
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      if (error.message.includes("sign in")) {
        navigate('/auth');
      }
    },
  });

  const addReviewMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Please sign in to leave a review");

      const { error } = await supabase
        .from('product_reviews')
        .insert([{
          user_id: user.id,
          product_id: productId,
          rating,
          comment,
        }]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Review added successfully",
      });
      setComment("");
      setRating(0);
      queryClient.invalidateQueries({ queryKey: ['reviews', productId] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      if (error.message.includes("sign in")) {
        navigate('/auth');
      }
    },
  });

  const averageRating = reviews?.length 
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : 0;

  if (isLoadingProduct || isLoadingReviews) {
    return <div>Loading...</div>;
  }

  if (!product) {
    return <div>Product not found</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 pt-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <img
              src={product.image}
              alt={product.name}
              className="w-full rounded-lg object-cover aspect-square"
            />
          </div>
          
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold">{product.name}</h1>
              <p className="text-xl font-semibold mt-2">Rs {product.price}</p>
              <p className="text-muted-foreground mt-4">{product.description}</p>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-lg">Rating: {averageRating}</span>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${
                      star <= Number(averageRating)
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-muted-foreground">
                ({reviews?.length || 0} reviews)
              </span>
            </div>

            <div className="space-x-4">
              <Button 
                size="lg" 
                onClick={() => addToCartMutation.mutate()}
                disabled={addToCartMutation.isPending}
              >
                Add to Cart
              </Button>
              <Button 
                size="lg" 
                variant="secondary"
                onClick={() => {
                  addToCartMutation.mutate();
                  navigate('/cart');
                }}
                disabled={addToCartMutation.isPending}
              >
                Buy Now
              </Button>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-12">
          <Card>
            <CardHeader>
              <CardTitle>Reviews</CardTitle>
              <CardDescription>Share your thoughts about this product</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="flex items-center space-x-2 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-6 h-6 cursor-pointer ${
                        star <= rating
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-300"
                      }`}
                      onClick={() => setRating(star)}
                    />
                  ))}
                </div>
                <Textarea
                  placeholder="Write your review..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="mb-2"
                />
                <Button 
                  onClick={() => addReviewMutation.mutate()}
                  disabled={!rating || !comment || addReviewMutation.isPending}
                >
                  Submit Review
                </Button>
              </div>

              <div className="space-y-4">
                {reviews?.map((review) => (
                  <Card key={review.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= review.rating
                                  ? "text-yellow-400 fill-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p>{review.comment}</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        {review.profiles?.email}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
