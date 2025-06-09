
import { useQuery } from "@tanstack/react-query";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

const PaymentHistory = () => {
  const navigate = useNavigate();

  const { data: payments, isLoading, error } = useQuery({
    queryKey: ['payment-history'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      // For now, we'll return mock data since the payment history isn't stored in database yet
      // In a real implementation, you'd query your orders/payments table
      return [
        {
          id: 1,
          date: new Date().toLocaleDateString(),
          amount: 1500,
          status: 'Completed',
          orderId: 'order-' + Date.now(),
        }
      ];
    },
    retry: 1,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navigation />
        <div className="container mx-auto px-4 pt-24 flex-grow">
          <div className="text-center py-8">
            <p>Loading payment history...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navigation />
        <div className="container mx-auto px-4 pt-24 flex-grow">
          <div className="text-center py-8">
            <p className="text-red-500">Failed to load payment history</p>
            <Button className="mt-4" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      
      <div className="container mx-auto px-4 pt-24 flex-grow">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Payment History</h1>
        </div>

        {payments && payments.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">{payment.orderId}</TableCell>
                    <TableCell>{payment.date}</TableCell>
                    <TableCell>Rs {payment.amount}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {payment.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No payment history found.</p>
            <Button 
              className="mt-4"
              onClick={() => navigate("/")}
            >
              Start Shopping
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentHistory;
