
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { CartButton } from "@/components/cart/CartButton";
import { SearchComponent } from "@/components/search/SearchComponent";
import { User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Navigation = () => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    // Get initial user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) {
        // Fast admin check without database calls
        setIsAdmin(user.email === 'sujalkhadgi13@gmail.com');
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        // Fast admin check without database calls
        setIsAdmin(session.user.email === 'sujalkhadgi13@gmail.com');
      } else {
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      await supabase.auth.signOut();
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account",
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

  const handleNavigation = (path: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(path);
  };

  const handleAdminNavigation = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isAdmin) {
      navigate('/admin');
    } else {
      toast({
        title: "Access Denied",
        description: "You don't have admin privileges",
        variant: "destructive",
      });
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <button 
              onClick={handleNavigation('/')}
              className="text-2xl font-bold text-primary hover:text-primary/80 transition-colors"
            >
              Plant&deco
            </button>
            
            <div className="hidden md:flex space-x-6">
              <button
                onClick={handleNavigation('/')}
                className={`transition-colors ${
                  isActive('/') ? 'text-primary font-medium' : 'text-gray-600 hover:text-primary'
                }`}
              >
                Home
              </button>
              <button
                onClick={handleNavigation('/indoor-plants')}
                className={`transition-colors ${
                  isActive('/indoor-plants') ? 'text-primary font-medium' : 'text-gray-600 hover:text-primary'
                }`}
              >
                Indoor Plants
              </button>
              <button
                onClick={handleNavigation('/outdoor-plants')}
                className={`transition-colors ${
                  isActive('/outdoor-plants') ? 'text-primary font-medium' : 'text-gray-600 hover:text-primary'
                }`}
              >
                Outdoor Plants
              </button>
              <button
                onClick={handleNavigation('/decoratives')}
                className={`transition-colors ${
                  isActive('/decoratives') ? 'text-primary font-medium' : 'text-gray-600 hover:text-primary'
                }`}
              >
                Decoratives
              </button>
              <button
                onClick={handleNavigation('/about')}
                className={`transition-colors ${
                  isActive('/about') ? 'text-primary font-medium' : 'text-gray-600 hover:text-primary'
                }`}
              >
                About
              </button>
              <button
                onClick={handleNavigation('/contact')}
                className={`transition-colors ${
                  isActive('/contact') ? 'text-primary font-medium' : 'text-gray-600 hover:text-primary'
                }`}
              >
                Contact
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {user && <SearchComponent />}
            {user && <CartButton />}
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {isAdmin && (
                    <DropdownMenuItem onClick={handleAdminNavigation}>
                      Admin Panel
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={handleSignOut}>
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={handleNavigation('/auth')} variant="outline">
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
