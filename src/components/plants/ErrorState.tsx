
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ErrorStateProps {
  error: Error | null;
  onRetry: () => void;
  isRefetching: boolean;
}

export const ErrorState = ({ error, onRetry, isRefetching }: ErrorStateProps) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      <div className="container mx-auto px-4 pt-24 flex-grow">
        <div className="text-center max-w-md mx-auto">
          <div className="mb-4">
            <div className="w-16 h-16 mx-auto bg-destructive/10 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Failed to load plants</h2>
            <p className="text-muted-foreground mb-4">
              We're having trouble loading the indoor plants. Please check your connection and try again.
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Error: {error instanceof Error ? error.message : 'Unknown error'}
            </p>
          </div>
          <Button 
            onClick={onRetry} 
            disabled={isRefetching}
            className="mb-4"
          >
            {isRefetching ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Retrying...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </>
            )}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => navigate('/')}
          >
            Go Back Home
          </Button>
        </div>
      </div>
    </div>
  );
};
