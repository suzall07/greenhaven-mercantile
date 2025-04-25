
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Menu, X, LogOut } from "lucide-react"; // Add LogOut import here
import { Button } from "./ui/button";
import { SearchComponent } from "./search/SearchComponent";
import { CartButton } from "./cart/CartButton";
import { useToast } from "@/hooks/use-toast";
import { useProfile } from "@/contexts/ProfileContext";

export const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated, profile, logout } = useProfile();

  const handleLogout = async () => {
    try {
      await logout();
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

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-panel">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-xl font-semibold">
            Plant&deco
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="nav-link">
              Home
            </Link>
            <Link to="/indoor-plants" className="nav-link">
              Indoor Plants
            </Link>
            <Link to="/outdoor-plants" className="nav-link">
              Outdoor Plants
            </Link>
            <Link to="/about" className="nav-link">
              About
            </Link>
            <Link to="/contact" className="nav-link">
              Contact
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <SearchComponent />
            <Link to="/cart">
              <CartButton />
            </Link>
            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <span className="text-sm">{profile?.email?.split('@')[0]}</span>
                <Button variant="ghost" size="icon" onClick={handleLogout}>
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            ) : (
              <Button variant="ghost" size="icon">
                <Link to="/login">
                  <User className="h-5 w-5" />
                </Link>
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden glass-panel absolute top-16 left-0 right-0 p-4 animate-fadeIn">
            <div className="flex flex-col space-y-4">
              <Link
                to="/"
                className="nav-link"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/indoor-plants"
                className="nav-link"
                onClick={() => setIsMenuOpen(false)}
              >
                Indoor Plants
              </Link>
              <Link
                to="/outdoor-plants"
                className="nav-link"
                onClick={() => setIsMenuOpen(false)}
              >
                Outdoor Plants
              </Link>
              <Link
                to="/about"
                className="nav-link"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <Link
                to="/contact"
                className="nav-link"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
              <div className="flex space-x-4 items-center">
                <SearchComponent />
                <Link to="/cart" onClick={() => setIsMenuOpen(false)}>
                  <CartButton />
                </Link>
                {isAuthenticated ? (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">{profile?.email?.split('@')[0]}</span>
                    <Button variant="ghost" size="icon" onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}>
                      <LogOut className="h-5 w-5" />
                    </Button>
                  </div>
                ) : (
                  <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(false)}>
                    <Link to="/login">
                      <User className="h-5 w-5" />
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
