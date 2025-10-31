import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import { toast } from "sonner";
import { Check, Loader2 } from "lucide-react";

const tiers = [
  {
    name: "Kitchen Guest",
    displayName: "Kitchen Guest",
    role: "free",
    price: "Free",
    priceId: null,
    features: [
      "Top 10 recipes",
      "15 messages with Sasha",
      "View baking tools",
      "Browse community",
    ],
  },
  {
    name: "Home Baker+",
    displayName: "Home Baker+",
    role: "tier1",
    price: "$3/month",
    priceId: "STRIPE_PRICE_TIER1", // Replace with actual Stripe price ID
    features: [
      "All recipes free (always!)",
      "Unlimited BakeBook saves",
      "Text recipe scanning",
      "Unlimited Sasha chat",
      "Wishlists & tool suggestions",
      "Remix recipes your way",
      "Grocery-ready lists",
    ],
    gratitude: "We appreciate you more than you know.",
  },
  {
    name: "Master Mixer",
    displayName: "Master Mixer",
    role: "tier2",
    price: "$6/month",
    priceId: "STRIPE_PRICE_TIER2", // Replace with actual Stripe price ID
    features: [
      "Everything in Home Baker+",
      "Photo recipe scanning",
      "Voice chat with Sasha",
      "Early access to new recipes",
      "Advanced remix with AI suggestions",
      "Priority support",
    ],
    gratitude: "You're the reason the magic keeps growing.",
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
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Welcome to the Kitchen!
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-4">
            Every recipe here is free — because generosity tastes better.
          </p>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            But if you'd like to keep the oven warm and unlock more creative tools,<br />
            join the <span className="font-semibold text-foreground">Home Bakers Club.</span>
          </p>
          {isAuthenticated && (role === 'tier1' || role === 'tier2' || role === 'paid') && (
            <div className="mt-6">
              <Badge variant="default" className="text-lg px-6 py-2">
                ⭐ Active Member
              </Badge>
            </div>
          )}
        </div>

        {/* Current Plan Management */}
        {isAuthenticated && (role === 'tier1' || role === 'tier2' || role === 'paid') && (
          <Card className="mb-8 border-primary">
            <CardHeader>
              <CardTitle>Manage Your Subscription</CardTitle>
              <CardDescription>
                Update payment method, view invoices, or make changes
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
            const gratitude = (tier as any).gratitude;

            return (
              <Card 
                key={tier.name}
                className={`relative ${isCurrentTier ? 'border-primary shadow-lg' : ''}`}
              >
                {isCurrentTier && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="px-4 py-1">Your Plan</Badge>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-2xl">{tier.displayName || tier.name}</CardTitle>
                  <div className="text-3xl font-bold mt-2">{tier.price}</div>
                  {gratitude && (
                    <p className="text-sm text-muted-foreground italic mt-2">
                      {gratitude}
                    </p>
                  )}
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
                        `Join ${tier.displayName || tier.name}`
                      )}
                    </Button>
                  )}
                  {isCurrentTier && (tier.role === 'tier1' || tier.role === 'tier2' || tier.role === 'paid') && (
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
          <p className="text-sm text-muted-foreground mb-8 italic">
            💌 Thank you for being part of our kitchen family. Your creativity inspires every update.
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
