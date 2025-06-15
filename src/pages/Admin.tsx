import { useEffect, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { AddProductForm } from "@/components/admin/AddProductForm";
import { ProductList } from "@/components/admin/ProductList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageManagement } from "@/components/admin/MessageManagement";

const Admin = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
      navigate('/');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          toast({
            title: "Unauthorized",
            description: "You must be signed in to access this page",
            variant: "destructive",
          });
          navigate('/auth');
          return;
        }

        // Fast admin check without RPC calls
        if (user.email !== 'sujalkhadgi13@gmail.com') {
          toast({
            title: "Access Denied",
            description: "You don't have admin privileges to access this page",
            variant: "destructive",
          });
          navigate('/');
          return;
        }

        setIsAuthorized(true);
      } catch (error) {
        console.error('Admin access check error:', error);
        toast({
          title: "Error",
          description: "An error occurred while checking access",
          variant: "destructive",
        });
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAdminAccess();
  }, [navigate, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 pt-24">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null; // This will be handled by the redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 pt-24">
        <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>
        
        <Tabs defaultValue="products" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
          </TabsList>
          
          <TabsContent value="products" className="space-y-6">
            <AddProductForm />
            <ProductList />
          </TabsContent>
          
          <TabsContent value="messages" className="space-y-6">
            <MessageManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
