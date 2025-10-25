import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Recipe {
  id: string;
  title: string;
  description: string;
  is_gluten_free: boolean;
  is_public: boolean;
  image_url: string | null;
}

const Recipes = () => {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    const { data } = await supabase
      .from("recipes")
      .select("*")
      .eq("is_public", true)
      .order("created_at", { ascending: false });

    setRecipes(data || []);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-fredoka gradient-ocean bg-clip-text text-transparent mb-4">
            Brandia's Recipe Collection
          </h1>
          <p className="text-xl text-dolphin max-w-2xl mx-auto">
            From-scratch recipes with gluten-free magic. Teasers are free—full recipes unlock with subscription.
          </p>
        </div>

        {recipes.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">
              No public recipes yet. Check back soon for Brandia's latest creations!
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recipes.map((recipe) => (
              <Card key={recipe.id} className="shadow-wave hover:shadow-float transition-all hover:scale-105">
                <CardHeader>
                  {recipe.is_gluten_free && (
                    <div className="inline-flex items-center gap-1 px-3 py-1 bg-seaweed/10 text-seaweed rounded-full text-sm font-fredoka mb-2 w-fit">
                      <Sparkles className="w-3 h-3" />
                      Gluten-Free
                    </div>
                  )}
                  <CardTitle className="font-fredoka text-2xl text-ocean-deep">
                    {recipe.title}
                  </CardTitle>
                  <CardDescription>{recipe.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-muted/30 rounded-lg border-2 border-dashed border-ocean-wave/20 text-center">
                    <Lock className="w-8 h-8 text-ocean-wave mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground mb-3">
                      Full recipe with ingredients, instructions, and Brandia's secret twists
                    </p>
                    <Button
                      onClick={() => navigate(user ? "/chat" : "/auth")}
                      className="w-full gradient-ocean text-primary-foreground"
                    >
                      {user ? "Chat with Sasha" : "Subscribe to Unlock"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Recipes;
