
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ReviewFormProps {
  rating: number;
  comment: string;
  onRatingChange: (rating: number) => void;
  onCommentChange: (comment: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export const ReviewForm = ({
  rating,
  comment,
  onRatingChange,
  onCommentChange,
  onSubmit,
  isSubmitting,
}: ReviewFormProps) => {
  return (
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
            onClick={() => onRatingChange(star)}
          />
        ))}
      </div>
      <Textarea
        placeholder="Write your review..."
        value={comment}
        onChange={(e) => onCommentChange(e.target.value)}
        className="mb-2"
      />
      <Button 
        onClick={onSubmit}
        disabled={!rating || !comment || isSubmitting}
      >
        Submit Review
      </Button>
    </div>
  );
};
