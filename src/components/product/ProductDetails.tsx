
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { ProductInfo } from "./ProductInfo";
import { ReviewSection } from "./ReviewSection";
import { DeleteReviewDialog } from "./DeleteReviewDialog";
import { useProductDetails } from "@/hooks/useProductDetails";

export const ProductDetails = () => {
  const navigate = useNavigate();
  const {
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
  } = useProductDetails();

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

        {reviews && (
          <ReviewSection
            reviews={reviews}
            productId={product.id.toString()}
            currentUserId={currentUserId}
            onOpenDeleteDialog={handleDeleteDialogOpen}
          />
        )}
      </div>
      
      <DeleteReviewDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirmDelete={confirmDeleteReview}
      />
    </div>
  );
};
