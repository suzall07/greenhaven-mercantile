
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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

interface ReviewSectionProps {
  reviews: Review[];
  productId: string;
  currentUserId: string | null;
  onOpenDeleteDialog: (reviewId: number) => void;
}

export const ReviewSection = ({
  reviews,
  productId,
  currentUserId,
  onOpenDeleteDialog,
}: ReviewSectionProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);

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

  const handleSubmitReview = () => {
    if (isEditing) {
      updateReviewMutation.mutate();
    } else {
      addReviewMutation.mutate();
    }
  };

  const hasUserReviewed = reviews?.some(review => review.user_id === currentUserId) && !isEditing;

  return (
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
              onDeleteReview={onOpenDeleteDialog}
              productId={Number(productId)}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};
