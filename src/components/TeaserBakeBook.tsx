import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Star, Lock } from "lucide-react";
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
        {/* Hero Banner */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-fredoka gradient-ocean bg-clip-text text-transparent mb-4 flex items-center justify-center gap-3">
            <BookOpen className="w-10 h-10 text-ocean-wave" />
            Your Personal BakeBook
          </h1>
          <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
            This is what your BakeBook could look like! Save recipes, track your
            attempts, rate results, and organize everything in custom folders.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => setShowAuthModal(true)}
              className="gradient-ocean text-white shadow-wave"
            >
              Sign Up Free - Get 10 Slots
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate("/instructions")}
            >
              Learn More
            </Button>
          </div>
        </div>

        {/* Sample Recipe Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teaserRecipes.map((recipe) => (
            <Card
              key={recipe.id}
              className="overflow-hidden cursor-pointer group relative"
              onClick={() => setShowAuthModal(true)}
            >
              {/* Hover Overlay - Desktop */}
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center justify-center hidden md:flex">
                <div className="text-center text-white">
                  <Lock className="w-12 h-12 mx-auto mb-2" />
                  <p className="font-semibold text-lg">Sign up to unlock</p>
                  <p className="text-sm">Start saving recipes like this</p>
                </div>
              </div>

              {/* Lock Badge - Mobile */}
              <div className="absolute top-4 right-4 z-10 md:hidden">
                <Badge className="bg-black/70 text-white border-none">
                  <Lock className="w-3 h-3 mr-1" />
                  Locked
                </Badge>
              </div>

              {recipe.image_url && (
                <div className="h-48 overflow-hidden">
                  <img
                    src={recipe.image_url}
                    alt={recipe.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-lg line-clamp-2">
                    {recipe.title}
                  </h3>
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge variant="outline">{recipe.folder}</Badge>
                  {recipe.category && (
                    <Badge variant="secondary">{recipe.category}</Badge>
                  )}
                </div>

                {recipe.user_rating > 0 && (
                  <div className="flex items-center gap-1 mb-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < recipe.user_rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                )}

                <div className="text-sm text-muted-foreground">
                  {recipe.attempt_number > 0 && (
                    <p>Made {recipe.attempt_number}x</p>
                  )}
                  {recipe.last_made && <p>Last made: {recipe.last_made}</p>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center bg-gradient-to-r from-ocean-wave/10 to-coral/10 rounded-lg p-8">
          <h2 className="text-2xl font-fredoka mb-2">Ready to build your own BakeBook?</h2>
          <p className="text-muted-foreground mb-4">
            Save up to 10 recipes, track attempts, rate & review - all for free!
          </p>
          <Button
            size="lg"
            onClick={() => setShowAuthModal(true)}
            className="gradient-ocean text-white shadow-wave"
          >
            Create Free Account
          </Button>
        </div>
      </div>

      <AuthModal
        open={showAuthModal}
        onOpenChange={setShowAuthModal}
      />
    </>
  );
};
