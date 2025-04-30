
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

export const useProductDetails = () => {
  const { productId } = useParams();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
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
  
  const handleDeleteDialogOpen = (reviewId: number) => {
    setReviewToDelete(reviewId);
    setIsDeleteDialogOpen(true);
  };
  
  const confirmDeleteReview = () => {
    if (reviewToDelete) {
      deleteReviewMutation.mutate(reviewToDelete);
    }
  };

  const handleBuyNow = () => {
    addToCartMutation.mutate();
    navigate('/cart');
  };

  const averageRating = reviews?.length 
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : "0";

  return {
    productId,
    product,
    reviews,
    isLoadingProduct,
    isLoadingReviews,
    currentUserId,
    addToCartMutation,
    handleBuyNow,
    averageRating,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    handleDeleteDialogOpen,
    confirmDeleteReview,
  };
};
