import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navigation } from "@/components/Navigation";
import { toast } from "sonner";
import { Check, Loader2 } from "lucide-react";

const tiers = [
  {
    name: "Weekend Baker",
    role: "free",
    price: "Free",
    priceId: null,
    features: [
      "Browse all recipes",
      "Limited BakeBook (10 recipes)",
      "Basic chat with Sasha",
      "View baking tools",
    ],
  },
  {
    name: "Everyday Baker",
    role: "paid",
    price: "$5/month",
    priceId: "STRIPE_PRICE_EVERYDAY", // Replace with actual price ID
    features: [
      "Everything in Weekend Baker",
      "Unlimited BakeBook saves",
      "Instant grocery lists",
      "Full chat access with Sasha",
      "Tool suggestions & links",
      "Recipe ratings & reviews",
    ],
  },
  {
    name: "Pro-at-Home",
    role: "paid",
    price: "$9/month",
    priceId: "STRIPE_PRICE_PRO", // Replace with actual price ID
    features: [
      "Everything in Everyday Baker",
      "Early access to new recipes",
      "Advanced baking analytics",
      "Recipe modifications tracking",
      "Priority chat support",
      "Collaborator tools access",
    ],
  },
];

export default function Billing() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { role, userId, isAuthenticated, loading: roleLoading } = useUserRole();
  const [email, setEmail] = useState<string>("");
  const [loadingCheckout, setLoadingCheckout] = useState<string | null>(null);
  const [loadingPortal, setLoadingPortal] = useState(false);

  useEffect(() => {
    // Get user email
    const fetchEmail = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        setEmail(user.email);
      }
    };
    fetchEmail();

    // Handle success/cancel params
    if (searchParams.get('success')) {
      toast.success("Subscription activated! Welcome to the club! 🎉");
      // Clear params
      navigate('/billing', { replace: true });
    }
    if (searchParams.get('canceled')) {
      toast.info("Checkout canceled. No worries! 💕");
      navigate('/billing', { replace: true });
    }
  }, [searchParams, navigate]);

  const handleCheckout = async (priceId: string) => {
    if (!isAuthenticated) {
      toast.error("Please sign in first");
      navigate('/auth');
      return;
    }

    setLoadingCheckout(priceId);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId, email, userId }
      });

      if (error) throw error;
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error("Failed to start checkout. Please try again.");
    } finally {
      setLoadingCheckout(null);
    }
  };

  const handlePortal = async () => {
    if (!isAuthenticated) {
      toast.error("Please sign in first");
      navigate('/auth');
      return;
    }

    setLoadingPortal(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-portal', {
        body: { email }
      });

      if (error) throw error;
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Portal error:', error);
      toast.error("Failed to open billing portal. Please try again.");
    } finally {
      setLoadingPortal(false);
    }
  };

  if (roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Home Bakers Club
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose your perfect baking companion tier. Cancel anytime. 💕
          </p>
          {isAuthenticated && role === 'paid' && (
            <div className="mt-6">
              <Badge variant="default" className="text-lg px-6 py-2">
                ⭐ Active Member
              </Badge>
            </div>
          )}
        </div>

        {/* Current Plan Management */}
        {isAuthenticated && role === 'paid' && (
          <Card className="mb-8 border-primary">
            <CardHeader>
              <CardTitle>Manage Your Subscription</CardTitle>
              <CardDescription>
                Update payment method, view invoices, or cancel your subscription
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handlePortal}
                disabled={loadingPortal}
                size="lg"
              >
                {loadingPortal ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Opening...
                  </>
                ) : (
                  "Manage Subscription"
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Pricing Tiers */}
        <div className="grid md:grid-cols-3 gap-8">
          {tiers.map((tier) => {
            const isCurrentTier = tier.role === role;
            const canUpgrade = tier.priceId && tier.role !== 'free';

            return (
              <Card 
                key={tier.name}
                className={`relative ${isCurrentTier ? 'border-primary shadow-lg' : ''}`}
              >
                {isCurrentTier && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="px-4 py-1">Current Plan</Badge>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-2xl">{tier.name}</CardTitle>
                  <div className="text-3xl font-bold mt-2">{tier.price}</div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  {canUpgrade && !isCurrentTier && (
                    <Button
                      onClick={() => handleCheckout(tier.priceId!)}
                      disabled={loadingCheckout === tier.priceId}
                      className="w-full"
                      size="lg"
                    >
                      {loadingCheckout === tier.priceId ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        `Start ${tier.name}`
                      )}
                    </Button>
                  )}
                  {isCurrentTier && tier.role === 'paid' && (
                    <Button
                      onClick={handlePortal}
                      disabled={loadingPortal}
                      variant="outline"
                      className="w-full"
                      size="lg"
                    >
                      Manage Plan
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Info Section */}
        <div className="mt-16 text-center max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">Questions?</h2>
          <p className="text-muted-foreground mb-6">
            All subscriptions include instant access, automatic updates, and can be canceled anytime.
            Your recipes and BakeBook are always yours to keep.
          </p>
          {!isAuthenticated && (
            <Button onClick={() => navigate('/auth')} size="lg">
              Sign In to Get Started
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}
