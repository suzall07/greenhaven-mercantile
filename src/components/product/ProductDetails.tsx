
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Navigation } from "@/components/Navigation";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ProductInfo } from "./ProductInfo";
import { ReviewForm } from "./ReviewForm";
import { ReviewList } from "./ReviewList";

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
    : "0";

  if (isLoadingProduct || isLoadingReviews) {
    return <div>Loading...</div>;
  }

  if (!product) {
    return <div>Product not found</div>;
  }

  const handleBuyNow = () => {
    addToCartMutation.mutate();
    navigate('/cart');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 pt-24">
        <ProductInfo
          product={product}
          averageRating={averageRating}
          reviewCount={reviews?.length || 0}
          onAddToCart={() => addToCartMutation.mutate()}
          onBuyNow={handleBuyNow}
          isLoading={addToCartMutation.isPending}
        />

        <div className="mt-12">
          <Card>
            <CardHeader>
              <CardTitle>Reviews</CardTitle>
              <CardDescription>Share your thoughts about this product</CardDescription>
            </CardHeader>
            <CardContent>
              <ReviewForm
                rating={rating}
                comment={comment}
                onRatingChange={setRating}
                onCommentChange={setComment}
                onSubmit={() => addReviewMutation.mutate()}
                isSubmitting={addReviewMutation.isPending}
              />
              <ReviewList reviews={reviews || []} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
