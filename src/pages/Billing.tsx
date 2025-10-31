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
    price: "Free Forever",
    priceId: null,
    description: "You're welcome in the kitchen! All recipes are open — no paywalls here.",
    features: [
      "All recipes free (always!)",
      "Enjoy every recipe",
      "Light help from Sasha",
      "Save 10 favorites to your BakeBook",
      "Community access",
    ],
  },
  {
    name: "Home Baker+",
    displayName: "Home Baker+",
    role: "tier1",
    price: "$3/month",
    priceId: "price_1SO1gmJhxVTv3kKItOP0ecec", // Home Baker+ $3/month
    description: "Your own BakeBook comes alive. Save unlimited recipes, chat with Sasha to scan text recipes, and remix your favorites.",
    features: [
      "All recipes free (always!)",
      "Unlimited BakeBook saves",
      "Chat with Sasha to scan text recipes",
      "Recipe wishlists",
      "Remix your favorites",
      "Like having a digital sous-chef",
    ],
    gratitude: "Your membership helps Brandia keep creating — thank you for being part of this sweet little corner of the world.",
  },
  {
    name: "Master Mixer",
    displayName: "Master Mixer",
    role: "tier2",
    price: "$6/month",
    priceId: "price_1SO1hWJhxVTv3kKId4l0tkVj", // Master Mixer $6/month
    description: "You've earned your apron stripes! Get photo scanning, voice chat, advanced remixing, and early access to new recipes.",
    features: [
      "Everything in Home Baker+",
      "Photo recipe scanning",
      "Voice chat with Sasha",
      "AI remix suggestions",
      "Early access to new recipes",
      "You're not just baking — you're mastering your craft",
    ],
    gratitude: "Your membership helps Brandia keep creating — thank you for being part of this sweet little corner of the world.",
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
          <h1 className="text-4xl md:text-5xl font-fredoka gradient-ocean bg-clip-text text-transparent mb-6">
            Join Brandia's Kitchen
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-2">
            Every recipe is free, but your support keeps the oven warm! 🌊
          </p>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Be part of something sweet. Every tier is a thank-you for being part of this community.
          </p>
          {isAuthenticated && role === 'paid' && (
            <div className="mt-6">
              <Badge variant="default" className="text-lg px-6 py-2">
                🌊 Home Baker+ or Master Mixer
              </Badge>
            </div>
          )}
        </div>

        {/* Current Plan Management */}
        {isAuthenticated && role === 'paid' && (
          <Card className="mb-8 border-primary shadow-wave">
            <CardHeader>
              <CardTitle className="font-fredoka">Manage Your Subscription</CardTitle>
              <CardDescription>
                Update payment method, view invoices, or switch plans
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handlePortal}
                disabled={loadingPortal}
                size="lg"
                className="gradient-ocean text-white"
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
            const description = (tier as any).description;

            return (
              <Card 
                key={tier.name}
                className={`relative shadow-wave ${isCurrentTier ? 'border-primary ring-2 ring-primary/20' : ''}`}
              >
                {isCurrentTier && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="px-4 py-1 bg-gradient-ocean text-white">Your Plan</Badge>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-2xl font-fredoka text-ocean-deep">
                    {tier.displayName || tier.name}
                  </CardTitle>
                  <div className="text-3xl font-bold text-ocean-wave mt-2">{tier.price}</div>
                  {description && (
                    <p className="text-sm text-muted-foreground mt-3">
                      {description}
                    </p>
                  )}
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm">
                        <Check className="h-5 w-5 text-coral shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  {gratitude && (
                    <p className="text-xs text-muted-foreground italic mb-4 p-3 bg-ocean-foam/10 rounded-lg border border-ocean-foam/20">
                      💌 {gratitude}
                    </p>
                  )}
                  {canUpgrade && !isCurrentTier && (
                    <Button
                      onClick={() => handleCheckout(tier.priceId!)}
                      disabled={loadingCheckout === tier.priceId}
                      className="w-full gradient-ocean text-white shadow-wave"
                      size="lg"
                    >
                      {loadingCheckout === tier.priceId ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        `Join the Kitchen`
                      )}
                    </Button>
                  )}
                  {isCurrentTier && role === 'paid' && (
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
          <h2 className="text-2xl font-fredoka text-ocean-deep mb-4">Questions?</h2>
          <p className="text-muted-foreground mb-6">
            All memberships include instant access, automatic updates, and can be canceled anytime.
            Your recipes and BakeBook are always yours to keep — no matter what.
          </p>
          <p className="text-base text-muted-foreground mb-8 font-quicksand italic">
            💌 Thank you for being part of our kitchen family. Your creativity inspires every update.
          </p>
          {!isAuthenticated && (
            <Button 
              onClick={() => navigate('/auth')} 
              size="lg"
              className="gradient-ocean text-white shadow-wave"
            >
              Sign In to Get Started
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}
