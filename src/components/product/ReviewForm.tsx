
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useProfile } from "@/contexts/ProfileContext";

interface ReviewFormProps {
  rating: number;
  comment: string;
  onRatingChange: (rating: number) => void;
  onCommentChange: (comment: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  isEditing?: boolean;
  onCancel?: () => void;
}

export const ReviewForm = ({
  rating,
  comment,
  onRatingChange,
  onCommentChange,
  onSubmit,
  isSubmitting,
  isEditing = false,
  onCancel,
}: ReviewFormProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { profile } = useProfile();

  const handleSubmitClick = () => {
    if (!profile) {
      toast({
        title: "Login Required",
        description: "You need to be logged in to leave a review.",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }
    
    onSubmit();
  };

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
      <div className="flex gap-2">
        <Button 
          onClick={handleSubmitClick}
          disabled={!rating || !comment || isSubmitting}
        >
          {isEditing ? "Update Review" : "Submit Review"}
        </Button>
        
        {isEditing && onCancel && (
          <Button 
            variant="outline" 
            onClick={onCancel}
          >
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
};
