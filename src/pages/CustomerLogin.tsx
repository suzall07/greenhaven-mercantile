
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Key, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { signInWithEmail, supabase } from "@/lib/supabase";
import { Navigation } from "@/components/Navigation";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";

const CustomerLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [validationErrors, setValidationErrors] = useState({
    email: "",
    password: "",
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if user is already logged in
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        navigate("/");
      }
    };

    checkUser();
  }, [navigate]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      return "Email is required";
    } else if (!emailRegex.test(email)) {
      return "Please enter a valid email address";
    }
    return "";
  };

  const validatePassword = (password: string) => {
    if (!password) {
      return "Password is required";
    } else if (password.length < 6) {
      return "Password must be at least 6 characters";
    }
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    
    setValidationErrors({
      email: emailError,
      password: passwordError,
    });

    if (emailError || passwordError) {
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await signInWithEmail(email, password);
      
      if (error) throw error;

      if (rememberMe) {
        // Using localStorage for "remember me" functionality
        localStorage.setItem("rememberedEmail", email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }

      // Check if admin login and redirect accordingly
      if (isAdmin) {
        // For admin access, check if email matches admin email
        if (email === 'sujalkhadgi13@gmail.com') {
          toast({
            title: "Welcome back, Admin!",
            description: "You have successfully signed in as an admin.",
          });
          navigate("/admin");
        } else {
          throw new Error("You don't have admin privileges");
        }
      } else {
        toast({
          title: "Welcome back!",
          description: "You have successfully signed in.",
        });
        navigate("/");
      }
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Please check your credentials and try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load remembered email on component mount
  useEffect(() => {
    const rememberedEmail = localStorage.getItem("rememberedEmail");
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 pt-20 pb-12">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2 text-primary">
              {isAdmin ? "Admin Login" : "Welcome Back"}
            </h1>
            <p className="text-muted-foreground">
              {isAdmin ? "Sign in to your admin account" : "Sign in to your Plant&deco account"}
            </p>
          </div>
          
          <div className="bg-white shadow-lg rounded-xl p-6 md:p-8 border border-secondary/20">
            {/* Toggle between customer and admin login */}
            <div className="flex items-center justify-center gap-2 mb-6">
              <span className={`text-sm ${!isAdmin ? "font-semibold" : ""}`}>Customer</span>
              <Switch 
                checked={isAdmin} 
                onCheckedChange={(checked) => setIsAdmin(checked)}
                className="data-[state=checked]:bg-amber-600"
              />
              <span className={`text-sm ${isAdmin ? "font-semibold" : ""}`}>Admin</span>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2 text-sm font-medium">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (validationErrors.email) {
                      setValidationErrors({...validationErrors, email: ""});
                    }
                  }}
                  placeholder="your@email.com"
                  className={cn(
                    "h-11",
                    validationErrors.email && "border-destructive focus-visible:ring-destructive"
                  )}
                  aria-invalid={!!validationErrors.email}
                  aria-describedby={validationErrors.email ? "email-error" : undefined}
                />
                {validationErrors.email && (
                  <p id="email-error" className="text-sm text-destructive mt-1">
                    {validationErrors.email}
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2 text-sm font-medium">
                  <Key className="h-4 w-4 text-muted-foreground" />
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (validationErrors.password) {
                        setValidationErrors({...validationErrors, password: ""});
                      }
                    }}
                    placeholder="••••••••"
                    className={cn(
                      "h-11 pr-10",
                      validationErrors.password && "border-destructive focus-visible:ring-destructive"
                    )}
                    aria-invalid={!!validationErrors.password}
                    aria-describedby={validationErrors.password ? "password-error" : undefined}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {validationErrors.password && (
                  <p id="password-error" className="text-sm text-destructive mt-1">
                    {validationErrors.password}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="remember" 
                    checked={rememberMe} 
                    onCheckedChange={(checked) => setRememberMe(checked === true)}
                  />
                  <Label htmlFor="remember" className="text-sm font-medium cursor-pointer">
                    Remember me
                  </Label>
                </div>
                <a href="#" className="text-sm text-primary hover:underline">
                  Forgot password?
                </a>
              </div>
              
              <Button 
                className={`w-full h-11 text-base ${isAdmin ? "bg-amber-600 hover:bg-amber-700" : ""}`} 
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : isAdmin ? "Admin Sign In" : "Sign In"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <a onClick={() => navigate("/auth")} className="text-primary hover:underline cursor-pointer">
                  Create an account
                </a>
              </p>
            </div>
          </div>
          
          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>By signing in, you agree to our</p>
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

export default CustomerLogin;
