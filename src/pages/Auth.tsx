
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { signInWithEmail, signUpWithEmail, supabase } from "@/lib/supabase";
import { Switch } from "@/components/ui/switch";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        const { data, error } = await signInWithEmail(email, password);
        if (error) throw error;

        // Redirect based on login mode
        if (isAdmin) {
          // Check if user is admin
          if (email === 'sujalkhadgi13@gmail.com' && password === 'Sujal@98') {
            navigate("/admin");
            toast({
              title: "Welcome back, admin!",
              description: "You have successfully signed in.",
            });
          } else {
            throw new Error("You don't have admin privileges");
          }
        } else {
          navigate("/");
          toast({
            title: "Welcome back!",
            description: "You have successfully signed in.",
          });
        }
      } else {
        // Check if passwords match for signup
        if (password !== confirmPassword) {
          toast({
            title: "Error",
            description: "Passwords do not match",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        const { error } = await signUpWithEmail(email, password);
        if (error) throw error;
        toast({
          title: "Welcome to Plant&deco!",
          description: "Your account has been created successfully.",
        });
        navigate("/");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle between admin and customer login mode when in login state
  const handleModeToggle = (checked: boolean) => {
    setIsAdmin(checked);
    // Clear the form when switching modes
    setPassword("");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 pt-16 pb-12">
        <div className="max-w-md mx-auto">
          <div className="flex flex-col items-center mb-6 text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-2 text-primary animate-fadeIn">
              {isLogin ? (isAdmin ? "Admin Access" : "Welcome Back") : "Join Plant&deco"}
            </h1>
            <p className="text-muted-foreground animate-fadeIn" style={{ animationDelay: "0.1s" }}>
              {isLogin 
                ? (isAdmin ? "Sign in to administrator account" : "Sign in to your account") 
                : "Create your customer account"}
            </p>
          </div>
          
          <div className="bg-white shadow-md rounded-xl p-6 md:p-8 border border-secondary/20 animate-fadeIn" style={{ animationDelay: "0.2s" }}>
            {isLogin && (
              <div className="flex items-center justify-center gap-2 mb-6">
                <span className={`text-sm ${!isAdmin ? "font-semibold" : ""}`}>Customer</span>
                <Switch 
                  checked={isAdmin} 
                  onCheckedChange={handleModeToggle} 
                  className="data-[state=checked]:bg-amber-600"
                />
                <span className={`text-sm ${isAdmin ? "font-semibold" : ""}`}>Admin</span>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">
                    Your Name
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="h-11"
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="h-11"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="h-11"
                />
              </div>

              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium">
                    Confirm Password
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="h-11"
                  />
                </div>
              )}
              
              <Button 
                className={`w-full h-11 text-base ${isAdmin ? "bg-amber-600 hover:bg-amber-700" : ""}`} 
                disabled={isLoading}
                type="submit"
              >
                {isLoading 
                  ? "Processing..." 
                  : isLogin 
                    ? (isAdmin ? "Admin Sign In" : "Sign In") 
                    : "Create Account"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setPassword("");
                  setConfirmPassword("");
                  if (!isLogin) setIsAdmin(false); // Reset to customer mode when switching to login
                }}
                className="text-sm text-primary hover:underline"
              >
                {isLogin
                  ? "New to Plant&deco? Create an account"
                  : "Already have an account? Sign in"}
              </button>
            </div>
          </div>
          
          <div className="mt-8 text-center text-sm text-muted-foreground animate-fadeIn" style={{ animationDelay: "0.3s" }}>
            <p>By signing in or creating an account, you agree to our</p>
            <p className="mt-1">
              <a href="#" className="text-primary hover:underline">Terms of Service</a>
              {" and "}
              <a href="#" className="text-primary hover:underline">Privacy Policy</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
