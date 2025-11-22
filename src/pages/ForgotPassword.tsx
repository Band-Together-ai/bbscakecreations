import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import WaveBackground from "@/components/WaveBackground";
import { ArrowLeft } from "lucide-react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth`,
      });

      if (error) throw error;

      setEmailSent(true);
      toast.success("Password reset email sent! Check your inbox.");
    } catch (error: any) {
      toast.error(error.message || "Failed to send reset email. Please try again.");
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
            Reset Password
          </CardTitle>
          <CardDescription className="text-dolphin">
            {emailSent 
              ? "Check your email for reset instructions"
              : "Enter your email to receive a password reset link"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {emailSent ? (
            <div className="space-y-4">
              <div className="p-4 bg-ocean-foam/20 border border-ocean-wave/30 rounded-lg text-sm text-dolphin">
                <p className="mb-2">
                  We've sent a password reset link to <strong>{email}</strong>
                </p>
                <p>
                  Click the link in the email to reset your password. If you don't see it, check your spam folder.
                </p>
              </div>
              
              <Link to="/auth">
                <Button 
                  variant="outline" 
                  className="w-full"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Sign In
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
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

              <Button
                type="submit"
                className="w-full gradient-ocean text-primary-foreground shadow-wave transition-bounce hover:scale-105"
                disabled={loading}
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </Button>

              <Link to="/auth">
                <Button 
                  type="button"
                  variant="ghost" 
                  className="w-full text-ocean-deep hover:text-ocean-wave"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Sign In
                </Button>
              </Link>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPassword;
