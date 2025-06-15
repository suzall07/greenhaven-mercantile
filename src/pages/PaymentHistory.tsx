import { useQuery } from "@tanstack/react-query";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, CreditCard, RefreshCw, Loader2 } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase, getPaymentHistory } from "@/lib/supabase";

interface PaymentRecord {
  id: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  transaction_id: string;
  created_at: string;
  description?: string;
  purchase_order_name?: string;
}

const PaymentHistory = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const refreshParam = searchParams.get('refresh');

  const { data: payments = [], isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ['payment-history', refreshParam],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      return await getPaymentHistory(user.id);
    },
    retry: 3,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleBackToStore = () => {
    navigate('/outdoor-plants');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 pt-24 pb-12">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
            
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-4 w-40" />
                      </div>
                      <div className="text-right space-y-2">
                        <Skeleton className="h-6 w-20" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 pt-24 pb-12">
          <div className="max-w-md mx-auto text-center">
            <div className="w-16 h-16 mx-auto bg-destructive/10 rounded-full flex items-center justify-center mb-4">
              <RefreshCw className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Failed to load payment history</h2>
            <p className="text-muted-foreground mb-4">
              We're having trouble loading your payment history. Please try again.
            </p>
            <Button 
              onClick={() => refetch()} 
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
            <Button variant="outline" onClick={handleBackToStore}>
              Go Back to Store
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Payment History</h1>
              <p className="text-muted-foreground">View all your past transactions</p>
            </div>
            {isRefetching && (
              <div className="flex items-center text-sm text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Refreshing...
              </div>
            )}
          </div>

          <div className="mb-6">
            <Button 
              onClick={handleBackToStore} 
              variant="outline"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Store
            </Button>
          </div>

          {payments.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <CreditCard className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No payment history</h3>
                <p className="text-muted-foreground mb-4">
                  You haven't made any payments yet. Start shopping to see your transactions here.
                </p>
                <Button onClick={handleBackToStore}>
                  Start Shopping
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {payments.map((payment) => (
                <Card key={payment.id} className="transition-shadow hover:shadow-md">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">
                            {payment.purchase_order_name || 'Plant Purchase'}
                          </h3>
                          <Badge className={getStatusColor(payment.status)}>
                            {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Transaction ID: {payment.transaction_id}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(payment.created_at)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold">Rs {payment.amount.toLocaleString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentHistory;
