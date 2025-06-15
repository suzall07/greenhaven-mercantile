
import { Button } from "@/components/ui/button";
import { AlertCircle, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface EmptyStateProps {
  totalProducts: number;
  plantType: 'indoor' | 'outdoor';
}

export const EmptyState = ({ totalProducts, plantType }: EmptyStateProps) => {
  const navigate = useNavigate();
  const isIndoor = plantType === 'indoor';

  if (totalProducts === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No products in database</h3>
        <p className="text-muted-foreground mb-4">
          It looks like there are no products in the database yet.
        </p>
        <Button onClick={() => navigate('/admin')} variant="outline">
          Add Products (Admin)
        </Button>
      </div>
    );
  }

  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center mb-4">
        <Eye className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">No {plantType} plants found</h3>
      <p className="text-muted-foreground mb-4">
        We have {totalProducts} products total, but none are categorized as {plantType} plants.
      </p>
      <div className="space-y-2">
        <Button 
          onClick={() => navigate(isIndoor ? '/outdoor-plants' : '/indoor-plants')} 
          variant="outline"
        >
          View {isIndoor ? 'Outdoor' : 'Indoor'} Plants
        </Button>
        <Button onClick={() => navigate('/admin')} variant="outline">
          Add {isIndoor ? 'Indoor' : 'Outdoor'} Plants (Admin)
        </Button>
      </div>
    </div>
  );
};
