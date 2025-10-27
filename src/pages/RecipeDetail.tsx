import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Download, Lock, Edit, Sparkles, Star } from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";
import { toast } from "sonner";

interface Recipe {
  id: string;
  title: string;
  description: string;
  ingredients: any;
  instructions: string;
  is_gluten_free: boolean;
  is_featured: boolean;
  featured_position: number | null;
  category: string;
  tags: string[];
  image_url: string | null;
  recipe_photos?: Array<{
    photo_url: string;
    is_headline: boolean;
  }>;
}

const RecipeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin, isCollaborator, isPaid } = useUserRole();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const canViewFullRecipe = isAdmin || isCollaborator || isPaid;

  useEffect(() => {
    if (id) {
      fetchRecipe();
    }
  }, [id]);

  const fetchRecipe = async () => {
    const { data, error } = await supabase
      .from("recipes")
      .select(`
        *,
        recipe_photos(photo_url, is_headline)
      `)
      .eq("id", id)
      .single();

    if (error) {
      toast.error("Recipe not found");
      navigate("/recipes");
    } else {
      setRecipe(data);
      // Set the first photo as selected
      const mainImage = data.image_url || 
        data.recipe_photos?.find((p: any) => p.is_headline)?.photo_url || 
        data.recipe_photos?.[0]?.photo_url;
      setSelectedPhoto(mainImage);
    }
    setLoading(false);
  };

  const handleDownload = () => {
    if (!recipe) return;
    
    const content = `
${recipe.title}
${'='.repeat(recipe.title.length)}

${recipe.description}

${recipe.is_gluten_free ? '✓ Gluten-Free' : ''}
${recipe.category ? `Category: ${recipe.category}` : ''}

INGREDIENTS:
${recipe.ingredients ? JSON.stringify(recipe.ingredients, null, 2) : 'See recipe for details'}

INSTRUCTIONS:
${recipe.instructions || 'Full instructions available with subscription'}
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${recipe.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Recipe downloaded!");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-muted-foreground">Loading recipe...</p>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return null;
  }

  const allPhotos = [
    recipe.image_url,
    ...(recipe.recipe_photos?.map(p => p.photo_url) || [])
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate("/recipes")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Recipes
        </Button>

        {/* Recipe Header */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 mb-4">
            {recipe.is_gluten_free && (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Gluten-Free
              </Badge>
            )}
            {recipe.is_featured && (
              <Badge variant="secondary" className="bg-coral/20 text-coral">
                <Star className="w-3 h-3 mr-1" />
                Featured
              </Badge>
            )}
            {recipe.featured_position && (
              <Badge variant="outline" className="border-purple-500 text-purple-700">
                Landing Page Position {recipe.featured_position}
              </Badge>
            )}
            {recipe.category && (
              <Badge variant="outline">{recipe.category}</Badge>
            )}
          </div>

          <h1 className="text-4xl md:text-5xl font-fredoka gradient-ocean bg-clip-text text-transparent mb-4">
            {recipe.title}
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-3xl">
            {recipe.description}
          </p>
        </div>

        {/* Photo Gallery */}
        {allPhotos.length > 0 && (
          <div className="mb-8">
            <div className="mb-4 rounded-3xl overflow-hidden shadow-float">
              <img
                src={selectedPhoto || allPhotos[0]}
                alt={recipe.title}
                className="w-full h-[400px] md:h-[600px] object-cover"
              />
            </div>
            
            {allPhotos.length > 1 && (
              <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
                {allPhotos.map((photo, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedPhoto(photo)}
                    className={`rounded-xl overflow-hidden border-2 transition-all hover:scale-105 ${
                      selectedPhoto === photo 
                        ? 'border-ocean-wave ring-2 ring-ocean-wave/30' 
                        : 'border-transparent'
                    }`}
                  >
                    <img
                      src={photo}
                      alt={`${recipe.title} photo ${idx + 1}`}
                      className="w-full h-20 object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-8">
          {(isAdmin || isCollaborator) && (
            <Button
              onClick={() => navigate("/admin")}
              className="bg-ocean-wave hover:bg-ocean-deep"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Recipe
            </Button>
          )}
          
          {canViewFullRecipe ? (
            <>
              <Button
                onClick={() => navigate("/chat")}
                className="gradient-ocean text-white"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Chat with Sasha
              </Button>
              <Button
                onClick={handleDownload}
                variant="outline"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Recipe
              </Button>
            </>
          ) : (
            <Button
              onClick={() => navigate("/auth")}
              className="gradient-ocean text-white"
            >
              <Lock className="w-4 h-4 mr-2" />
              Subscribe to Unlock Full Recipe
            </Button>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Ingredients */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-fredoka text-ocean-deep mb-4">Ingredients</h2>
              {canViewFullRecipe ? (
                <div className="space-y-2">
                  {recipe.ingredients ? (
                    typeof recipe.ingredients === 'string' ? (
                      <p className="whitespace-pre-wrap">{recipe.ingredients}</p>
                    ) : Array.isArray(recipe.ingredients) ? (
                      <ul className="list-disc list-inside space-y-1">
                        {recipe.ingredients.map((ingredient: any, idx: number) => (
                          <li key={idx}>{typeof ingredient === 'string' ? ingredient : JSON.stringify(ingredient)}</li>
                        ))}
                      </ul>
                    ) : (
                      <pre className="text-sm whitespace-pre-wrap">{JSON.stringify(recipe.ingredients, null, 2)}</pre>
                    )
                  ) : (
                    <p className="text-muted-foreground italic">No ingredients listed yet</p>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center py-12 text-muted-foreground">
                  <Lock className="w-6 h-6 mr-2" />
                  <p>Subscribe to view ingredients</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-fredoka text-ocean-deep mb-4">Instructions</h2>
              {canViewFullRecipe ? (
                <div className="prose prose-sm max-w-none">
                  {recipe.instructions ? (
                    <p className="whitespace-pre-wrap">{recipe.instructions}</p>
                  ) : (
                    <p className="text-muted-foreground italic">No instructions added yet</p>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center py-12 text-muted-foreground">
                  <Lock className="w-6 h-6 mr-2" />
                  <p>Subscribe to view instructions</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Tags */}
        {recipe.tags && recipe.tags.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-fredoka text-ocean-deep mb-3">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {recipe.tags.map((tag, idx) => (
                <Badge key={idx} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecipeDetail;
