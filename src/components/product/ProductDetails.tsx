
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Navigation } from "@/components/Navigation";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useCart } from "@/contexts/CartContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { RefreshCw, Loader2 } from "lucide-react";
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
  const { addToCart } = useCart();
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(0);

  const { data: product, isLoading: isLoadingProduct, error: productError, refetch: refetchProduct } = useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      if (!productId) throw new Error("Product ID is required");
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!productId,
    retry: 3,
  });

  const { data: reviews = [], isLoading: isLoadingReviews, error: reviewsError, refetch: refetchReviews } = useQuery({
    queryKey: ['reviews', productId],
    queryFn: async () => {
      if (!productId) return [];
      
      const { data, error } = await supabase
        .from('product_reviews')
        .select(`
          *,
          profiles (
            email
          )
        `)
        .eq('product_id', productId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!productId,
    retry: 3,
  });

  const addReviewMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Please sign in to leave a review");

      if (!rating || rating < 1 || rating > 5) {
        throw new Error("Please select a rating between 1 and 5 stars");
      }

      if (!comment.trim()) {
        throw new Error("Please write a comment for your review");
      }

      const { error } = await supabase
        .from('product_reviews')
        .insert([{
          user_id: user.id,
          product_id: productId,
          rating,
          comment: comment.trim(),
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

  const handleAddToCart = async () => {
    if (!productId) return;
    await addToCart(parseInt(productId), 1);
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    toast({
      title: "Added to cart",
      description: "Item added to cart successfully",
    });
  };

  const averageRating = reviews.length 
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : "0";

  const isLoading = isLoadingProduct || isLoadingReviews;
  const hasError = productError || reviewsError;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 pt-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <Skeleton className="w-full h-96 rounded-lg" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-6 w-1/3" />
              <div className="flex gap-4">
                <Skeleton className="h-12 flex-1" />
                <Skeleton className="h-12 flex-1" />
              </div>
            </div>
          </div>
          
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-10 w-32" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 pt-24">
          <div className="text-center max-w-md mx-auto">
            <div className="w-16 h-16 mx-auto bg-destructive/10 rounded-full flex items-center justify-center mb-4">
              <RefreshCw className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Failed to load product</h2>
            <p className="text-muted-foreground mb-4">
              We're having trouble loading this product. Please try again.
            </p>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => { refetchProduct(); refetchReviews(); }}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
              <Button variant="outline" onClick={() => navigate('/')}>
                Go Back Home
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 pt-24">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Product not found</h2>
            <p className="text-muted-foreground mb-4">
              The product you're looking for doesn't exist.
            </p>
            <Button onClick={() => navigate('/')}>
              Go Back Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 pt-24">
        <ProductInfo
          product={product}
          averageRating={averageRating}
          reviewCount={reviews.length}
          onAddToCart={handleAddToCart}
          onBuyNow={handleBuyNow}
          isLoading={false}
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
              <ReviewList reviews={reviews} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
