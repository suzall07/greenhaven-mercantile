import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { signInWithEmail, signUpWithEmail, validateEmail } from "@/lib/supabase";
import { Switch } from "@/components/ui/switch";
import { Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [emailError, setEmailError] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fast admin check - no database calls needed
  const isAdminCredentials = (email: string, password: string) => {
    return email === 'sujalkhadgi13@gmail.com' && password === 'Sujal@98';
  };

  // Ultra-permissive email validation for dummy emails
  const handleEmailChange = (value: string) => {
    setEmail(value);
    setEmailError("");
    
    if (value.trim()) {
      if (!validateEmail(value.trim())) {
        setEmailError("Please include an @ symbol in your email");
      }
    }
  };

  const validateForm = () => {
    // Ultra-minimal email validation - perfect for dummy emails
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      throw new Error("Please enter your email address");
    }
    
    if (!validateEmail(cleanEmail)) {
      throw new Error("Please include an @ symbol in your email");
    }

    // Password validation
    if (!password.trim()) {
      throw new Error("Please enter your password");
    }

    if (!isLogin) {
      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters long");
      }

      if (!confirmPassword) {
        throw new Error("Please confirm your password");
      }

      if (password !== confirmPassword) {
        throw new Error("Passwords do not match");
      }
    }

    // Admin validation
    if (isAdmin && !isAdminCredentials(cleanEmail, password)) {
      throw new Error("Invalid admin credentials");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLoading) return;
    
    setIsLoading(true);
    setEmailError("");

    try {
      // Validate form inputs
      validateForm();

      console.log(`Starting ${isLogin ? 'sign in' : 'sign up'} process...`);

      if (isLogin) {
        const { data, error } = await signInWithEmail(email, password);
        
        if (error) {
          throw error;
        }

        // Success - navigate based on admin status
        if (isAdmin) {
          navigate("/admin");
          toast({
            title: "Welcome back, admin!",
            description: "You have successfully signed in to the admin panel.",
          });
        } else {
          navigate("/");
          toast({
            title: "Welcome back!",
            description: "You have successfully signed in.",
          });
        }
      } else {
        const { data, error } = await signUpWithEmail(email, password);
        
        if (error) {
          throw error;
        }
        
        // Check if email confirmation is required
        if (data.user && !data.session) {
          toast({
            title: "Account Created Successfully!",
            description: "Please check your email and click the confirmation link to complete registration.",
          });
        } else {
          toast({
            title: "Account Created Successfully!",
            description: "Welcome to Plant&deco! You can now start shopping.",
          });
          navigate("/");
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      
      let errorMessage = error.message || "An unexpected error occurred. Please try again.";
      
      // Handle specific error scenarios
      if (errorMessage.includes('Network connection failed')) {
        errorMessage = "Unable to connect to the server. Please check your internet connection and try again.";
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
    setEmailError("");
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
                  onCheckedChange={setIsAdmin} 
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
                  onChange={(e) => handleEmailChange(e.target.value)}
                  placeholder="one@two.com or test@example.com"
                  required
                  className={`h-11 ${emailError ? 'border-red-500' : ''}`}
                  disabled={isLoading}
                  autoComplete="email"
                />
                {emailError && (
                  <Alert variant="destructive" className="py-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      {emailError}
                    </AlertDescription>
                  </Alert>
                )}
                {!emailError && email && validateEmail(email.trim()) && (
                  <Alert className="py-2 border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-sm text-green-700">
                      Email format looks good!
                    </AlertDescription>
                  </Alert>
                )}
                <p className="text-xs text-muted-foreground">
                  Use any email format - one@two.com, test@example.com, user@demo.com, etc.
                </p>
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
                {!isLogin && (
                  <p className="text-xs text-muted-foreground">
                    Minimum 6 characters required
                  </p>
                )}
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
                  {confirmPassword && password !== confirmPassword && (
                    <p className="text-xs text-red-500">Passwords do not match</p>
                  )}
                </div>
              )}
              
              <Button 
                type="submit"
                className={`w-full h-11 text-base ${isAdmin ? "bg-amber-600 hover:bg-amber-700" : ""}`} 
                disabled={isLoading || (emailError !== "")}
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
