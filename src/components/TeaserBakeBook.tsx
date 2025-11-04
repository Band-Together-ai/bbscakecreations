import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Star, Lock, Book, MessageCircle } from "lucide-react";
import { AuthModal } from "./AuthModal";

interface FeaturedRecipe {
  id: string;
  title: string;
  image_url: string | null;
  category: string | null;
}

interface TeaserRecipe extends FeaturedRecipe {
  folder: string;
  attempt_number: number;
  user_rating: number;
  last_made: string;
}

export const TeaserBakeBook = () => {
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [teaserRecipes, setTeaserRecipes] = useState<TeaserRecipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedRecipes();
  }, []);

  const fetchFeaturedRecipes = async () => {
    try {
      const { data, error } = await supabase
        .from("recipes")
        .select("id, title, image_url, category")
        .eq("is_public", true)
        .eq("is_featured", true)
        .limit(5);

      if (error) throw error;

      // Add fake metadata to featured recipes
      const enhanced: TeaserRecipe[] = (data || []).map((recipe, idx) => ({
        ...recipe,
        folder: idx === 0 ? "Favorites" : idx === 1 ? "To Try" : "Saved",
        attempt_number: idx === 0 ? 2 : idx === 2 ? 1 : 0,
        user_rating: idx === 0 ? 5 : idx === 2 ? 4 : 0,
        last_made: idx === 0 ? "2 weeks ago" : idx === 2 ? "1 month ago" : "",
      }));

      setTeaserRecipes(enhanced);
    } catch (error) {
      console.error("Error fetching featured recipes:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-muted-foreground">Loading BakeBook preview...</p>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-fredoka gradient-ocean bg-clip-text text-transparent mb-6 animate-fade-in">
            Your Personal BakeBook
          </h1>
          <p className="text-xl text-dolphin mb-8 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: "0.1s" }}>
            Organize, save, and perfect your favorite recipes in your digital baking companion
          </p>
          <div className="flex gap-4 justify-center mb-12 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <Button 
              onClick={() => setShowAuthModal(true)}
              className="gradient-ocean text-white shadow-wave hover:scale-105 transition-bounce"
              size="lg"
            >
              Start Free BakeBook
            </Button>
            <Button 
              variant="outline"
              size="lg"
              className="border-ocean-mist text-ocean-deep hover:bg-ocean-mist/20"
              onClick={() => navigate("/instructions")}
            >
              Learn More
            </Button>
          </div>
          
          {/* Trust Indicators */}
          <div className="flex flex-wrap gap-6 justify-center text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="text-ocean-wave">✓</span>
              <span>Free During Beta</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-ocean-wave">✓</span>
              <span>No Credit Card Required</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-ocean-wave">✓</span>
              <span>Save Up to 10 Recipes Free</span>
            </div>
          </div>
        </section>

        {/* What's Included Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-fredoka text-ocean-deep text-center mb-12">
            What's Included in Your Free BakeBook
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Card className="text-center hover:shadow-wave transition-smooth">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-ocean-mist/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Book className="w-6 h-6 text-ocean-deep" />
                </div>
                <h3 className="font-semibold text-ocean-deep mb-2">Save 10 Recipes</h3>
                <p className="text-sm text-muted-foreground">
                  Organize your favorite recipes in custom folders
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center hover:shadow-wave transition-smooth">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-ocean-mist/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-6 h-6 text-ocean-deep" />
                </div>
                <h3 className="font-semibold text-ocean-deep mb-2">Rate & Review</h3>
                <p className="text-sm text-muted-foreground">
                  Track your attempts and rate each recipe
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center hover:shadow-wave transition-smooth">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-ocean-mist/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-6 h-6 text-ocean-deep" />
                </div>
                <h3 className="font-semibold text-ocean-deep mb-2">Ask Sasha</h3>
                <p className="text-sm text-muted-foreground">
                  Get AI-powered baking tips and substitutions
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Feature Comparison */}
        <section className="mb-16 bg-ocean-mist/10 rounded-3xl p-8">
          <h2 className="text-3xl font-fredoka text-ocean-deep text-center mb-12">
            Free vs Premium
          </h2>
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-float p-6 space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-ocean-mist">
                <span className="font-semibold">Feature</span>
                <div className="flex gap-8">
                  <span className="font-semibold text-ocean-deep">Free</span>
                  <span className="font-semibold text-ocean-wave">Premium</span>
                </div>
              </div>
              
              {[
                { feature: "Saved Recipes", free: "10", premium: "Unlimited" },
                { feature: "Recipe Folders", free: "3", premium: "Unlimited" },
                { feature: "Chat with Sasha", free: "✓", premium: "✓" },
                { feature: "Recipe Scanner", free: "5/month", premium: "Unlimited" },
                { feature: "Wishlist Items", free: "✓", premium: "✓" },
                { feature: "Private Recipes", free: "—", premium: "✓" },
              ].map((row, idx) => (
                <div key={idx} className="flex justify-between items-center py-2">
                  <span className="text-ocean-deep">{row.feature}</span>
                  <div className="flex gap-8">
                    <span className="text-center w-16">{row.free}</span>
                    <span className="text-center w-16 text-ocean-wave font-semibold">{row.premium}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Recipe Preview Grid */}
        <section className="mb-16">
          <h2 className="text-3xl font-fredoka text-ocean-deep text-center mb-12">
            Preview: What Your BakeBook Could Look Like
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teaserRecipes.map((recipe) => (
              <Card 
                key={recipe.id} 
                className="overflow-hidden hover:shadow-wave transition-smooth cursor-pointer relative group"
                onClick={() => setShowAuthModal(true)}
              >
                {/* Lock Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-ocean-deep/40 to-ocean-deep/80 z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-smooth">
                  <div className="text-center text-white p-6">
                    <Lock className="w-12 h-12 mx-auto mb-2" />
                    <p className="font-semibold mb-2">Sign up to unlock</p>
                    <Button 
                      variant="secondary"
                      size="sm"
                      className="bg-white text-ocean-deep hover:bg-ocean-mist"
                    >
                      Create Free Account
                    </Button>
                  </div>
                </div>

                {recipe.image_url && (
                  <div className="aspect-[4/3] overflow-hidden">
                    <img 
                      src={recipe.image_url} 
                      alt={recipe.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-smooth"
                    />
                  </div>
                )}
                <CardContent className="p-4">
                  <Badge variant="secondary" className="mb-2">
                    {recipe.folder}
                  </Badge>
                  <h3 className="font-semibold text-ocean-deep mb-2 line-clamp-1">
                    {recipe.title}
                  </h3>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span>{recipe.user_rating}/5</span>
                    </div>
                    {recipe.attempt_number > 0 && (
                      <span>Attempt #{recipe.attempt_number}</span>
                    )}
                  </div>
                  {recipe.last_made && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Last made: {recipe.last_made}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-fredoka text-ocean-deep text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="max-w-2xl mx-auto space-y-4">
            {[
              {
                q: "Is BakeBook really free?",
                a: "Yes! The free tier includes 10 saved recipes, custom folders, and access to Sasha. It's perfect for home bakers who want to organize their favorites."
              },
              {
                q: "Can I upload my own recipes?",
                a: "Absolutely! You can scan recipes from photos, import from URLs, or type them manually. Sasha helps organize everything automatically."
              },
              {
                q: "What happens if I want to save more than 10 recipes?",
                a: "You can upgrade to Premium anytime for unlimited recipes, private storage, and enhanced features. But 10 recipes is plenty to get started!"
              },
              {
                q: "Can I access my BakeBook on mobile?",
                a: "Yes! Your BakeBook works on any device with a web browser - desktop, tablet, or phone."
              },
            ].map((faq, idx) => (
              <Card key={idx} className="hover:shadow-wave transition-smooth">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-ocean-deep mb-2">{faq.q}</h3>
                  <p className="text-sm text-muted-foreground">{faq.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="text-center">
          <h2 className="text-4xl font-fredoka gradient-ocean bg-clip-text text-transparent mb-6">
            Ready to Start Your Baking Journey?
          </h2>
          <p className="text-xl text-dolphin mb-8 max-w-xl mx-auto">
            Create your free account and organize your first 10 recipes today
          </p>
          <Button 
            onClick={() => setShowAuthModal(true)}
            size="lg"
            className="gradient-ocean text-white shadow-wave hover:scale-105 transition-bounce"
          >
            Create Free BakeBook Account
          </Button>
        </section>
      </div>

      <AuthModal 
        open={showAuthModal} 
        onOpenChange={setShowAuthModal}
        onSuccess={() => navigate("/my-bakebook")}
      />
    </>
  );
};
