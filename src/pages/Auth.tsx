import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import WaveBackground from "@/components/WaveBackground";

const Auth = () => {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [isInvitedUser, setIsInvitedUser] = useState(false);
  const [isPasswordReset, setIsPasswordReset] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check for invitation or recovery token in URL
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const type = hashParams.get('type');
    
    const isRecovery = type === 'recovery';
    const isInvite = type === 'invite';
    
    if (isInvite) {
      setIsInvitedUser(true);
      setIsSignUp(true);
      toast.info("Please set your password to complete registration");
    } else if (isRecovery) {
      setIsPasswordReset(true);
      toast.info("Please enter your new password");
    }

    // Check if user is already logged in (but not during password reset or invite)
    if (!isRecovery && !isInvite) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          navigate("/");
        }
      });
    }

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      // Only redirect on sign in if we're NOT in recovery or invite mode
      if (event === "SIGNED_IN" && session && !isRecovery && !isInvite) {
        toast.success("Welcome! Your account is ready.");
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isInvitedUser || isPasswordReset) {
        // For invited users or password reset, update their password
        const { error } = await supabase.auth.updateUser({
          password,
        });
        if (error) throw error;
        toast.success(isPasswordReset ? "Password updated successfully!" : "Password set successfully! You're all set.");
        // Redirect after successful password update
        setTimeout(() => {
          navigate("/");
        }, 1000);
      } else if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
          },
        });
        if (error) throw error;
        toast.success("Welcome to BBs Cake Creations! Check your email to confirm your account.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast.success("Welcome back, sugar! Let's bake something magical.");
      }
    } catch (error: any) {
      if (error.message.includes("Invalid login credentials")) {
        toast.error("Invalid email or password. Try again!");
      } else if (error.message.includes("User already registered")) {
        toast.error("This email is already registered. Try logging in instead.");
      } else {
        toast.error(error.message || "Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <WaveBackground />
      
      <Card className="w-full max-w-md mx-4 shadow-float animate-float z-10">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-fredoka gradient-ocean bg-clip-text text-transparent">
            BBs Cake Creations
          </CardTitle>
          <CardDescription className="text-dolphin">
            {isInvitedUser
              ? "Set your password to get started"
              : isPasswordReset
              ? "Enter your new password below"
              : isSignUp
              ? "Join our whimsical baking community"
              : "Welcome back, let's bake some magic"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            {!isInvitedUser && !isPasswordReset && (
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="transition-smooth"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="password">
                {isInvitedUser || isPasswordReset ? "Set Your Password" : "Password"}
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="transition-smooth"
              />
            </div>
            <Button
              type="submit"
              className="w-full gradient-ocean text-primary-foreground shadow-wave transition-bounce hover:scale-105"
              disabled={loading}
            >
              {loading 
                ? "Loading..." 
                : isInvitedUser || isPasswordReset
                ? "Set Password & Continue" 
                : isSignUp 
                ? "Create Account" 
                : "Sign In"}
            </Button>
          </form>
          
          {!isInvitedUser && !isPasswordReset && (
            <div className="mt-4 space-y-2 text-center">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-sm text-ocean-deep hover:text-ocean-wave transition-smooth underline"
              >
                {isSignUp
                  ? "Already have an account? Sign in"
                  : "Need an account? Sign up"}
              </button>
              
              {!isSignUp && (
                <div>
                  <Link 
                    to="/forgot-password"
                    className="text-sm text-dolphin hover:text-ocean-wave transition-smooth underline"
                  >
                    Forgot your password?
                  </Link>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
