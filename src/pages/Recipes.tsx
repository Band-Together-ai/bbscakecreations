import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, Sparkles, Edit, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Recipe {
  id: string;
  title: string;
  description: string;
  is_gluten_free: boolean;
  is_public: boolean;
  is_featured: boolean;
  featured_position: number | null;
  image_url: string | null;
  recipe_photos?: Array<{
    photo_url: string;
    is_headline: boolean;
  }>;
}

const Recipes = () => {
  const navigate = useNavigate();
  const { isAdmin, isCollaborator, isPaid } = useUserRole();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [user, setUser] = useState<any>(null);
  
  const canViewFullRecipe = isAdmin || isCollaborator || isPaid;

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    const { data } = await supabase
      .from("recipes")
      .select(`
        *,
        recipe_photos(photo_url, is_headline)
      `)
      .eq("is_public", true)
      .order("featured_position", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: false });

    setRecipes(data || []);
  };

  const updateFeaturedPosition = async (recipeId: string, position: number | null) => {
    const { error } = await supabase
      .from("recipes")
      .update({ 
        featured_position: position,
        is_featured: position !== null 
      })
      .eq("id", recipeId);

    if (error) {
      toast.error("Failed to update position: " + error.message);
    } else {
      toast.success(position ? `Set as landing page position ${position}` : "Removed from landing page");
      fetchRecipes();
    }
  };

  const getRecipeImage = (recipe: Recipe) => {
    // First try the main image_url
    if (recipe.image_url) return recipe.image_url;
    
    // Then try to find a headline photo
    const headlinePhoto = recipe.recipe_photos?.find(p => p.is_headline);
    if (headlinePhoto) return headlinePhoto.photo_url;
    
    // Finally, use the first photo if available
    if (recipe.recipe_photos && recipe.recipe_photos.length > 0) {
      return recipe.recipe_photos[0].photo_url;
    }
    
    return null;
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
            From-scratch recipes—many can be made gluten-free. Teasers are free—full recipes unlock with subscription.
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
            {recipes.map((recipe) => {
              const recipeImage = getRecipeImage(recipe);
              return (
                <Card 
                  key={recipe.id} 
                  className="shadow-wave hover:shadow-float transition-all hover:scale-105 overflow-hidden cursor-pointer"
                  onClick={() => navigate(`/recipe/${recipe.id}`)}
                >
                  {recipeImage && (
                    <div className="w-full h-48 overflow-hidden">
                      <img
                        src={recipeImage}
                        alt={recipe.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                <CardHeader>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {recipe.is_gluten_free && (
                      <div className="inline-flex items-center gap-1 px-3 py-1 bg-seaweed/10 text-seaweed rounded-full text-sm font-fredoka w-fit">
                        <Sparkles className="w-3 h-3" />
                        Gluten-Free
                      </div>
                    )}
                    {recipe.featured_position && (
                      <div className="inline-flex items-center gap-1 px-3 py-1 bg-coral/10 text-coral rounded-full text-sm font-fredoka w-fit">
                        <Star className="w-3 h-3" />
                        {recipe.featured_position === 1 ? "Featured Cake" : `Landing Page #${recipe.featured_position}`}
                      </div>
                    )}
                  </div>
                  <CardTitle className="font-fredoka text-2xl text-ocean-deep">
                    {recipe.title}
                  </CardTitle>
                  <CardDescription>{recipe.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  {isAdmin || isCollaborator ? (
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <label className="text-sm font-fredoka text-ocean-deep block mb-1">Landing Page Position</label>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="w-full justify-between">
                              {recipe.featured_position 
                                ? recipe.featured_position === 1 
                                  ? "Position 1 - Featured Cake ✨"
                                  : `Position ${recipe.featured_position}`
                                : "Not on landing page"}
                              <Star className="ml-2 h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-full">
                            <DropdownMenuItem onClick={() => updateFeaturedPosition(recipe.id, null)}>
                              Not on landing page
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateFeaturedPosition(recipe.id, 1)}>
                              Position 1 - Featured Cake ✨
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateFeaturedPosition(recipe.id, 2)}>
                              Position 2
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateFeaturedPosition(recipe.id, 3)}>
                              Position 3
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateFeaturedPosition(recipe.id, 4)}>
                              Position 4
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateFeaturedPosition(recipe.id, 5)}>
                              Position 5
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateFeaturedPosition(recipe.id, 6)}>
                              Position 6
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate("/admin");
                        }}
                        className="w-full gradient-ocean text-primary-foreground"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Recipe
                      </Button>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate("/chat");
                        }}
                        variant="outline"
                        className="w-full"
                      >
                        Chat with Sasha
                      </Button>
                    </div>
                  ) : canViewFullRecipe ? (
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate("/chat");
                      }}
                      className="w-full gradient-ocean text-primary-foreground"
                    >
                      View Full Recipe with Sasha
                    </Button>
                  ) : (
                    <div 
                      onClick={(e) => e.stopPropagation()}
                      className="p-4 bg-muted/30 rounded-lg border-2 border-dashed border-ocean-wave/20 text-center"
                    >
                      <Lock className="w-8 h-8 text-ocean-wave mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground mb-3">
                        Full recipe with ingredients, instructions, and Brandia's secret twists
                      </p>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(user ? "/chat" : "/auth");
                        }}
                        className="w-full gradient-ocean text-primary-foreground"
                      >
                        {user ? "Chat with Sasha" : "Subscribe to Unlock"}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Recipes;
