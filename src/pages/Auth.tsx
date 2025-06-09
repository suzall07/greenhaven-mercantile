
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { signInWithEmail, signUpWithEmail } from "@/lib/supabase";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";

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

  // Simple admin check - faster than RPC call
  const isAdminEmail = (email: string) => {
    return email === 'sujalkhadgi13@gmail.com';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLoading) return;
    
    setIsLoading(true);

    try {
      if (isLogin) {
        if (!email || !password) {
          throw new Error("Please fill in all fields");
        }

        // Add timeout to prevent hanging requests
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error("Login timeout. Please try again.")), 15000);
        });

        const signInPromise = signInWithEmail(email, password);
        const { data, error } = await Promise.race([signInPromise, timeoutPromise]) as any;
        
        if (error) throw error;

        // Quick admin check without RPC
        if (isAdmin) {
          if (isAdminEmail(email) && password === 'Sujal@98') {
            navigate("/admin");
            toast({
              title: "Welcome back, admin!",
              description: "You have successfully signed in.",
            });
          } else {
            throw new Error("Invalid admin credentials");
          }
        } else {
          navigate("/");
          toast({
            title: "Welcome back!",
            description: "You have successfully signed in.",
          });
        }
      } else {
        // Signup validation
        if (!email || !password || !confirmPassword) {
          throw new Error("Please fill in all fields");
        }

        if (password.length < 6) {
          throw new Error("Password must be at least 6 characters long");
        }

        if (password !== confirmPassword) {
          throw new Error("Passwords do not match");
        }

        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error("Signup timeout. Please try again.")), 15000);
        });

        const signUpPromise = signUpWithEmail(email, password);
        const { error } = await Promise.race([signUpPromise, timeoutPromise]) as any;
        
        if (error) throw error;
        
        toast({
          title: "Welcome to Plant&deco!",
          description: "Your account has been created successfully.",
        });
        navigate("/");
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      
      // Provide more specific error messages
      let errorMessage = error.message || "An unexpected error occurred";
      
      if (error.message?.includes("Invalid login credentials")) {
        errorMessage = "Invalid email or password. Please check your credentials.";
      } else if (error.message?.includes("Email not confirmed")) {
        errorMessage = "Please check your email and confirm your account before signing in.";
      } else if (error.message?.includes("timeout")) {
        errorMessage = "Connection timeout. Please check your internet and try again.";
      } else if (error.message?.includes("network")) {
        errorMessage = "Network error. Please check your connection and try again.";
      }
      
      toast({
        title: "Authentication Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleModeToggle = (checked: boolean) => {
    if (isLoading) return;
    setIsAdmin(checked);
    setPassword("");
  };

  const handleToggleAuthMode = () => {
    if (isLoading) return;
    setIsLogin(!isLogin);
    setPassword("");
    setConfirmPassword("");
    if (!isLogin) setIsAdmin(false);
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
                  disabled={isLoading}
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
                    disabled={isLoading}
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
                  disabled={isLoading}
                  autoComplete="email"
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
                  disabled={isLoading}
                  autoComplete={isLogin ? "current-password" : "new-password"}
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
                    disabled={isLoading}
                    autoComplete="new-password"
                  />
                </div>
              )}
              
              <Button 
                type="submit"
                className={`w-full h-11 text-base ${isAdmin ? "bg-amber-600 hover:bg-amber-700" : ""}`} 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isLogin ? "Signing in..." : "Creating account..."}
                  </>
                ) : (
                  isLogin 
                    ? (isAdmin ? "Admin Sign In" : "Customer Sign In") 
                    : "Create Account"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={handleToggleAuthMode}
                disabled={isLoading}
                className="text-sm text-primary hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
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
