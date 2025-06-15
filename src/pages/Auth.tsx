
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { signInWithEmail, signUpWithEmail, validateEmail } from "@/lib/supabase";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const isAdminCredentials = (email: string, password: string) => {
    return email === 'sujalkhadgi13@gmail.com' && password === 'Sujal@98';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLoading) return;
    
    setIsLoading(true);

    try {
      // Basic validation
      if (!email.trim() || !validateEmail(email.trim())) {
        throw new Error("Please enter a valid email address");
      }

      if (!password.trim()) {
        throw new Error("Please enter your password");
      }

      if (!isLogin) {
        if (password.length < 6) {
          throw new Error("Password must be at least 6 characters long");
        }
        if (password !== confirmPassword) {
          throw new Error("Passwords do not match");
        }
      }

      if (isAdmin && !isAdminCredentials(email.trim(), password)) {
        throw new Error("Invalid admin credentials");
      }

      if (isLogin) {
        const { data, error } = await signInWithEmail(email, password);
        
        if (error) {
          throw error;
        }

        if (isAdmin) {
          navigate("/admin");
          toast({
            title: "Welcome back, admin!",
            description: "Successfully signed in to admin panel.",
          });
        } else {
          navigate("/");
          toast({
            title: "Welcome back!",
            description: "Successfully signed in.",
          });
        }
      } else {
        const { data, error } = await signUpWithEmail(email, password);
        
        if (error) {
          throw error;
        }
        
        toast({
          title: "Account Created!",
          description: "Welcome to Plant&deco!",
        });
        navigate("/");
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      
      toast({
        title: "Authentication Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 pt-16 pb-12">
        <div className="max-w-md mx-auto">
          <div className="flex flex-col items-center mb-6 text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-2 text-primary">
              {isLogin ? (isAdmin ? "Admin Access" : "Welcome Back") : "Join Plant&deco"}
            </h1>
            <p className="text-muted-foreground">
              {isLogin 
                ? (isAdmin ? "Sign in to administrator account" : "Sign in to your account") 
                : "Create your customer account"}
            </p>
          </div>
          
          <div className="bg-white shadow-md rounded-xl p-6 md:p-8 border border-secondary/20">
            {isLogin && (
              <div className="flex items-center justify-center gap-2 mb-6">
                <span className={`text-sm ${!isAdmin ? "font-semibold" : ""}`}>Customer</span>
                <Switch 
                  checked={isAdmin} 
                  onCheckedChange={setIsAdmin} 
                  disabled={isLoading}
                />
                <span className={`text-sm ${isAdmin ? "font-semibold" : ""}`}>Admin</span>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  disabled={isLoading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                />
              </div>

              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    disabled={isLoading}
                  />
                </div>
              )}
              
              <Button 
                type="submit"
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isLogin ? "Signing in..." : "Creating account..."}
                  </>
                ) : (
                  isLogin 
                    ? (isAdmin ? "Admin Sign In" : "Sign In") 
                    : "Create Account"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setPassword("");
                  setConfirmPassword("");
                  if (!isLogin) setIsAdmin(false);
                }}
                disabled={isLoading}
                className="text-sm text-primary hover:underline disabled:opacity-50"
              >
                {isLogin
                  ? "New to Plant&deco? Create an account"
                  : "Already have an account? Sign in"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
