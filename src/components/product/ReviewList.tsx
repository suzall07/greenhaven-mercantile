
import { Star, Edit, Trash2 } from "lucide-react";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

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

interface ReviewListProps {
  reviews: Review[];
  currentUserId?: string | null;
  onEditReview?: (review: Review) => void;
  onDeleteReview?: (reviewId: number) => void;
  productId: number;
}

export const ReviewList = ({ 
  reviews: initialReviews, 
  currentUserId,
  onEditReview,
  onDeleteReview,
  productId
}: ReviewListProps) => {
  const [sortOption, setSortOption] = useState<string>("newest");
  const [filterRating, setFilterRating] = useState<string>("all");
  const [reviews, setReviews] = useState<Review[]>(initialReviews);

  // Apply sorting and filtering
  const sortedAndFilteredReviews = [...reviews].filter(review => {
    if (filterRating === "all") return true;
    return review.rating === parseInt(filterRating);
  }).sort((a, b) => {
    if (sortOption === "highest") return b.rating - a.rating;
    if (sortOption === "lowest") return a.rating - b.rating;
    if (sortOption === "newest") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    if (sortOption === "oldest") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    return 0;
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
        <h3 className="text-lg font-medium">Customer Reviews ({reviews.length})</h3>
        <div className="flex flex-col sm:flex-row gap-2">
          <Select value={filterRating} onValueChange={setFilterRating}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Filter by rating" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All ratings</SelectItem>
              <SelectItem value="5">5 stars</SelectItem>
              <SelectItem value="4">4 stars</SelectItem>
              <SelectItem value="3">3 stars</SelectItem>
              <SelectItem value="2">2 stars</SelectItem>
              <SelectItem value="1">1 star</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={sortOption} onValueChange={setSortOption}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Sort reviews" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest first</SelectItem>
              <SelectItem value="oldest">Oldest first</SelectItem>
              <SelectItem value="highest">Highest rating</SelectItem>
              <SelectItem value="lowest">Lowest rating</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="space-y-4">
        {sortedAndFilteredReviews.length > 0 ? (
          sortedAndFilteredReviews.map((review) => (
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
                  <div className="flex items-center gap-2">
                    {currentUserId === review.user_id && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEditReview && onEditReview(review)}>
                            Edit Review
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => onDeleteReview && onDeleteReview(review.id)}
                            className="text-destructive focus:text-destructive"
                          >
                            Delete Review
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                    <span className="text-sm text-muted-foreground">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p>{review.comment}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {review.profiles?.email || 'Anonymous'}
                </p>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No reviews found with the selected filters.
          </div>
        )}
      </div>
    </div>
  );
};
