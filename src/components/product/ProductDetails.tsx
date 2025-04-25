
import { useState, useEffect } from "react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ProductInfo } from "./ProductInfo";
import { ReviewForm } from "./ReviewForm";
import { ReviewList } from "./ReviewList";

interface Review {
  id: number;
  rating: number;
  comment: string;
  created_at: string;
  user_id: string;
  profiles?: {
    email?: string;
  };
}

export const ProductDetails = () => {
  const { productId } = useParams();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(0);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  // State for editing reviews
  const [isEditing, setIsEditing] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
  
  // State for delete confirmation
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<number | null>(null);

  // Get current user
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    
    getCurrentUser();
  }, []);

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
        .select(`
          *,
          profiles (
            email
          )
        `)
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

      // Check if item already exists in cart
      const { data: existingItem } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .single();

      if (existingItem) {
        // Update quantity
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity: existingItem.quantity + 1 })
          .eq('id', existingItem.id);
        
        if (error) throw error;
      } else {
        // Insert new item
        const { error } = await supabase
          .from('cart_items')
          .insert([{ 
            user_id: user.id, 
            product_id: productId, 
            quantity: 1 
          }]);
        
        if (error) throw error;
      }
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
        navigate('/login');
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
        navigate('/login');
      }
    },
  });
  
  const updateReviewMutation = useMutation({
    mutationFn: async () => {
      if (!editingReviewId) return;
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Please sign in to update your review");

      const { error } = await supabase
        .from('product_reviews')
        .update({
          rating,
          comment,
        })
        .eq('id', editingReviewId)
        .eq('user_id', user.id); // Ensure user can only update their own review
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Review updated successfully",
      });
      setComment("");
      setRating(0);
      setIsEditing(false);
      setEditingReviewId(null);
      queryClient.invalidateQueries({ queryKey: ['reviews', productId] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const deleteReviewMutation = useMutation({
    mutationFn: async (reviewId: number) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Please sign in to delete your review");

      const { error } = await supabase
        .from('product_reviews')
        .delete()
        .eq('id', reviewId)
        .eq('user_id', user.id); // Ensure user can only delete their own review
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Review deleted successfully",
      });
      setIsDeleteDialogOpen(false);
      setReviewToDelete(null);
      queryClient.invalidateQueries({ queryKey: ['reviews', productId] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      setIsDeleteDialogOpen(false);
    },
  });

  const handleEditReview = (review: Review) => {
    setComment(review.comment);
    setRating(review.rating);
    setIsEditing(true);
    setEditingReviewId(review.id);
  };
  
  const handleCancelEdit = () => {
    setComment("");
    setRating(0);
    setIsEditing(false);
    setEditingReviewId(null);
  };
  
  const handleDeleteReview = (reviewId: number) => {
    setReviewToDelete(reviewId);
    setIsDeleteDialogOpen(true);
  };
  
  const confirmDeleteReview = () => {
    if (reviewToDelete) {
      deleteReviewMutation.mutate(reviewToDelete);
    }
  };

  const handleSubmitReview = () => {
    if (isEditing) {
      updateReviewMutation.mutate();
    } else {
      addReviewMutation.mutate();
    }
  };

  const averageRating = reviews?.length 
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : "0";

  if (isLoadingProduct || isLoadingReviews) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 pt-24 flex items-center justify-center">
          <div className="animate-pulse text-xl">Loading...</div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 pt-24">
          <div className="text-center text-xl">Product not found</div>
        </div>
      </div>
    );
  }

  const handleBuyNow = () => {
    addToCartMutation.mutate();
    navigate('/cart');
  };

  const hasUserReviewed = reviews?.some(review => review.user_id === currentUserId) && !isEditing;

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
              {currentUserId && !hasUserReviewed && (
                <ReviewForm
                  rating={rating}
                  comment={comment}
                  onRatingChange={setRating}
                  onCommentChange={setComment}
                  onSubmit={handleSubmitReview}
                  isSubmitting={addReviewMutation.isPending || updateReviewMutation.isPending}
                  isEditing={isEditing}
                  onCancel={isEditing ? handleCancelEdit : undefined}
                />
              )}
              
              {hasUserReviewed && !isEditing && (
                <div className="mb-6 text-muted-foreground">
                  You have already reviewed this product. You can edit or delete your review below.
                </div>
              )}
              
              {reviews && (
                <ReviewList 
                  reviews={reviews} 
                  currentUserId={currentUserId}
                  onEditReview={handleEditReview}
                  onDeleteReview={handleDeleteReview}
                  productId={Number(productId)}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Review</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete your review? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteReview} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
