import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Download, Lock, Edit, Sparkles, Star, Clock, Snowflake, Heart } from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";
import { toast } from "sonner";
import { RecipeSaveButton } from "@/components/RecipeSaveButton";

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
  display_order: number | null;
  is_base_recipe?: boolean;
  base_recipe_id?: string | null;
  variant_notes?: string | null;
  prep_active_minutes?: number | null;
  prep_passive_minutes?: number | null;
  make_ahead?: boolean;
  make_ahead_window_days?: number | null;
  recommended_freeze_days?: number | null;
  thaw_time_hours?: number | null;
  staging_json?: Array<{
    stage: string;
    active_min?: number;
    passive_min?: number;
    can_make_ahead?: boolean;
  }>;
  recipe_photos?: Array<{
    photo_url: string;
    is_headline: boolean;
  }>;
}

const RecipeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin, isCollaborator, isPaid, isAuthenticated } = useUserRole();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [baseRecipe, setBaseRecipe] = useState<{ id: string; title: string } | null>(null);

  // Support settings
  const [supportSettings, setSupportSettings] = useState<any>(null);
  const [selectedTipAmount, setSelectedTipAmount] = useState<number>(5);
  const [customTipAmount, setCustomTipAmount] = useState<string>("");

  // Ratings
  const [ratings, setRatings] = useState<any[]>([]);
  const [ratingStats, setRatingStats] = useState<any>(null);
  const [userRating, setUserRating] = useState<number>(0);
  const [userName, setUserName] = useState<string>("");
  const [reviewText, setReviewText] = useState<string>("");
  const [captchaAnswer, setCaptchaAnswer] = useState<string>("");
  const [captchaQuestion, setCaptchaQuestion] = useState<{ num1: number; num2: number }>({ num1: 0, num2: 0 });

  // Beta access: Featured recipes OR recipes with landing page position are free
  // Everyone else needs subscription for full access (ingredients, instructions, download)
  const isBetaFree = recipe?.is_featured || (recipe?.featured_position !== null && recipe?.featured_position !== undefined);
  const canViewFullRecipe = isAdmin || isCollaborator || isPaid || isBetaFree;

  useEffect(() => {
    if (id) {
      fetchRecipe();
      fetchSupportSettings();
      fetchRatings();
      fetchRatingStats();
      generateCaptcha();
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
      setRecipe(data as any);
      
      // Fetch base recipe if this is a variant
      if (data.base_recipe_id) {
        const { data: baseData } = await supabase
          .from("recipes")
          .select("id, title")
          .eq("id", data.base_recipe_id)
          .single();
        
        if (baseData) {
          setBaseRecipe(baseData);
        }
      }
      
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

  const fetchSupportSettings = async () => {
    const { data } = await supabase
      .from("support_settings")
      .select("*")
      .eq("is_enabled", true)
      .limit(1)
      .maybeSingle();

    setSupportSettings(data);
  };

  const fetchRatings = async () => {
    const { data } = await supabase
      .from("recipe_ratings")
      .select("*")
      .eq("recipe_id", id)
      .eq("is_approved", true)
      .order("created_at", { ascending: false })
      .limit(10);

    setRatings(data || []);
  };

  const fetchRatingStats = async () => {
    const { data, error } = await supabase.rpc('get_recipe_rating_stats', {
      recipe_uuid: id
    });

    if (!error && data && data.length > 0) {
      setRatingStats(data[0]);
    }
  };

  const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    setCaptchaQuestion({ num1, num2 });
  };

  const handleVenmoClick = async (amount: number) => {
    if (!supportSettings?.venmo_username) return;

    // Track the click
    await supabase.from("support_clicks").insert({
      recipe_id: id,
      user_id: isAuthenticated ? (await supabase.auth.getUser()).data.user?.id : null
    });

    // Increment thank you count
    await supabase.rpc('increment_thank_you_count');

    // Open Venmo
    const venmoUrl = `venmo://paycharge?txn=pay&recipients=${supportSettings.venmo_username}&amount=${amount}&note=Thanks for the recipe! ❤️`;
    window.location.href = venmoUrl;

    // Fallback to web
    setTimeout(() => {
      window.open(`https://venmo.com/${supportSettings.venmo_username}?txn=pay&amount=${amount}`, '_blank');
    }, 500);

    toast.success("Opening Venmo...");
    fetchSupportSettings();
  };

  const handleSubmitRating = async () => {
    // Validate
    if (!userRating || userRating < 1 || userRating > 5) {
      toast.error("Please select a rating");
      return;
    }

    if (!userName.trim()) {
      toast.error("Please enter your name");
      return;
    }

    if (reviewText.trim().length < 10) {
      toast.error("Review must be at least 10 characters");
      return;
    }

    // Verify captcha
    if (parseInt(captchaAnswer) !== captchaQuestion.num1 + captchaQuestion.num2) {
      toast.error("Incorrect captcha answer");
      generateCaptcha();
      setCaptchaAnswer("");
      return;
    }

    if (!isAuthenticated) {
      toast.error("Please log in to submit a rating");
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();

    // Insert rating
    const { error } = await supabase.from("recipe_ratings").insert({
      recipe_id: id,
      user_id: user?.id || null,
      user_name: userName.trim(),
      rating: userRating,
      review_text: reviewText.trim(),
      is_approved: userRating > 3, // Auto-approve 4-5 stars
      admin_reviewed: false
    });

    if (error) {
      toast.error("Failed to submit rating");
      console.error(error);
      return;
    }

    if (userRating <= 3) {
      toast.success("Thank you! Your rating will be reviewed by an admin.");
    } else {
      toast.success("Thank you for your rating!");
      fetchRatings();
      fetchRatingStats();
    }

    // Reset form
    setUserRating(0);
    setUserName("");
    setReviewText("");
    setCaptchaAnswer("");
    generateCaptcha();
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

        {/* Base Recipe Badge */}
        {recipe.base_recipe_id && baseRecipe && (
          <Badge 
            variant="secondary" 
            className="mb-4 cursor-pointer hover:bg-accent" 
            onClick={() => navigate(`/recipes/${recipe.base_recipe_id}`)}
          >
            <Sparkles className="w-3 h-3 mr-1" />
            Built on Brandia's {baseRecipe.title}
          </Badge>
        )}

        {/* Time & Make-Ahead Info */}
        {(recipe.prep_active_minutes || recipe.prep_passive_minutes || recipe.make_ahead) && (
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-4">
                {recipe.prep_active_minutes && (
                  <div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Active Time
                    </p>
                    <p className="text-lg font-semibold">{recipe.prep_active_minutes} min</p>
                  </div>
                )}
                {recipe.prep_passive_minutes && (
                  <div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Passive Time
                    </p>
                    <p className="text-lg font-semibold">{recipe.prep_passive_minutes} min</p>
                  </div>
                )}
                {recipe.make_ahead && (
                  <div className="col-span-2 border-t pt-4 mt-2">
                    <Badge variant="outline" className="bg-blue-50 mb-2">
                      <Snowflake className="w-3 h-3 mr-1" />
                      Make-Ahead Friendly
                    </Badge>
                    <p className="text-sm text-muted-foreground">
                      {recipe.make_ahead_window_days && `Bake up to ${recipe.make_ahead_window_days} days ahead`}
                      {recipe.recommended_freeze_days && ` • Freeze ${recipe.recommended_freeze_days} days`}
                      {recipe.thaw_time_hours && ` • Thaw ${recipe.thaw_time_hours} hours`}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Staging Display */}
        {recipe.staging_json && recipe.staging_json.length > 0 && (
          <Card className="mb-8">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Multi-Day Plan</h3>
              <div className="space-y-3">
                {recipe.staging_json.map((stage, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{stage.stage}</p>
                      <p className="text-sm text-muted-foreground">
                        {stage.active_min && stage.active_min > 0 && `${stage.active_min} min active`}
                        {stage.passive_min && stage.passive_min > 0 && ` • ${stage.passive_min} min passive`}
                        {stage.can_make_ahead && <Badge variant="outline" className="ml-2">Can prep ahead</Badge>}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-8">
          {(isAdmin || isCollaborator) && (
            <Button
              onClick={() => navigate(`/admin?editRecipe=${id}`)}
              className="bg-ocean-wave hover:bg-ocean-deep"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Recipe
            </Button>
          )}
          
          <Button
            onClick={() => navigate("/chat")}
            className="gradient-ocean text-white"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Chat with Sasha
          </Button>
          
          {isAuthenticated && (
            <RecipeSaveButton recipeId={recipe.id} canViewFullRecipe={canViewFullRecipe} showLabel />
          )}
          
          {canViewFullRecipe ? (
            <Button
              onClick={handleDownload}
              variant="outline"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Recipe
            </Button>
          ) : (
            <Button
              onClick={() => navigate("/auth")}
              variant="outline"
              className="border-purple-500 text-purple-700"
            >
              <Lock className="w-4 h-4 mr-2" />
              Subscribe for Print/Download
            </Button>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Ingredients */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-fredoka text-ocean-deep mb-4">Ingredients</h2>
              {canViewFullRecipe ? (
                <div className="space-y-4">
                  {recipe.ingredients ? (
                    typeof recipe.ingredients === 'string' ? (
                      <p className="whitespace-pre-wrap">{recipe.ingredients}</p>
                    ) : Array.isArray(recipe.ingredients) ? (
                      (() => {
                        // Group ingredients by category
                        const grouped = recipe.ingredients.reduce((acc: any, ingredient: any) => {
                          if (typeof ingredient === 'object' && ingredient.category) {
                            if (!acc[ingredient.category]) {
                              acc[ingredient.category] = [];
                            }
                            acc[ingredient.category].push(ingredient.item);
                          } else if (typeof ingredient === 'string') {
                            if (!acc['Other']) {
                              acc['Other'] = [];
                            }
                            acc['Other'].push(ingredient);
                          }
                          return acc;
                        }, {});

                        return Object.entries(grouped).map(([category, items]: [string, any]) => (
                          <div key={category}>
                            <h3 className="font-semibold text-ocean-deep mb-2">{category}</h3>
                            <ul className="list-disc list-inside space-y-1 ml-2">
                              {items.map((item: string, idx: number) => (
                                <li key={idx} className="text-muted-foreground">{item}</li>
                              ))}
                            </ul>
                          </div>
                        ));
                      })()
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

        {/* Support Brandia Section */}
        {supportSettings && supportSettings.is_enabled && (
          <Card className="mt-8 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center flex-shrink-0">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 space-y-4">
                  <h3 className="text-xl font-fredoka text-purple-900">Support Brandia</h3>
                  <p className="text-purple-800">
                    {supportSettings.support_message || "If you enjoyed this recipe and want to support my baking journey, I'd be grateful for any contribution! 💕"}
                  </p>

                  <div className="space-y-3">
                    <Label className="text-sm text-purple-900">Choose an amount:</Label>
                    <div className="flex flex-wrap gap-2">
                      {[5, 10, 20].map(amount => (
                        <Button
                          key={amount}
                          variant={selectedTipAmount === amount ? "default" : "outline"}
                          onClick={() => {
                            setSelectedTipAmount(amount);
                            setCustomTipAmount("");
                          }}
                          className="min-w-[80px]"
                        >
                          ${amount}
                        </Button>
                      ))}
                      <Input
                        type="number"
                        placeholder="Custom"
                        value={customTipAmount}
                        onChange={(e) => {
                          setCustomTipAmount(e.target.value);
                          setSelectedTipAmount(0);
                        }}
                        className="w-[100px]"
                        min="1"
                      />
                    </div>

                    <Button
                      onClick={() => handleVenmoClick(customTipAmount ? parseFloat(customTipAmount) : selectedTipAmount)}
                      disabled={!selectedTipAmount && !customTipAmount}
                      className="w-full bg-[#008CFF] hover:bg-[#0074D9] text-white"
                      size="lg"
                    >
                      💙 Tip {customTipAmount ? `$${customTipAmount}` : `$${selectedTipAmount}`} on Venmo
                    </Button>
                  </div>

                  <div className="pt-4 border-t border-purple-200">
                    <p className="text-sm text-purple-700">
                      {supportSettings.thank_you_count || 0} {supportSettings.thank_you_count === 1 ? 'person has' : 'people have'} shown their support
                    </p>
                    <p className="text-xs text-purple-600 mt-1">
                      100% of contributions go toward ingredients and supplies for community baking
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recipe Ratings Section */}
        <div className="mt-8 space-y-6">
          <h2 className="text-2xl font-fredoka text-ocean-deep">Recipe Ratings</h2>

          {/* Rating Summary */}
          {ratingStats && ratingStats.total_ratings > 0 && (
            <Card>
              <CardContent className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-5xl font-bold text-yellow-500">{ratingStats.average_rating || '0.0'}</div>
                      <div className="flex justify-center mt-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-5 h-5 ${
                              i < Math.round(ratingStats.average_rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        Based on {ratingStats.total_ratings} {ratingStats.total_ratings === 1 ? 'review' : 'reviews'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map(stars => {
                      const count = ratingStats[`${['one', 'two', 'three', 'four', 'five'][stars - 1]}_star`] || 0;
                      const percentage = ratingStats.total_ratings > 0 ? (count / ratingStats.total_ratings) * 100 : 0;
                      return (
                        <div key={stars} className="flex items-center gap-2">
                          <span className="text-sm w-8">{stars}★</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-yellow-400 h-2 rounded-full transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground w-8 text-right">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Add Your Rating */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-fredoka text-ocean-deep mb-4">Add Your Rating</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Your Name</Label>
                  <Input
                    placeholder="Enter your name"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Your Rating</Label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setUserRating(star)}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-8 h-8 ${
                            star <= userRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Your Review (required, min 10 characters)</Label>
                  <Textarea
                    placeholder="Tell us what you thought about this recipe..."
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    rows={4}
                    maxLength={1000}
                  />
                  <p className="text-xs text-muted-foreground">
                    {reviewText.length}/1000 characters
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Security Check: What is {captchaQuestion.num1} + {captchaQuestion.num2}?</Label>
                  <Input
                    type="number"
                    placeholder="Enter answer"
                    value={captchaAnswer}
                    onChange={(e) => setCaptchaAnswer(e.target.value)}
                    className="w-32"
                  />
                </div>

                <Button
                  onClick={handleSubmitRating}
                  className="gradient-ocean text-white"
                  size="lg"
                >
                  Submit Rating
                </Button>

                {userRating <= 3 && userRating > 0 && (
                  <p className="text-sm text-yellow-700 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                    ⚠️ Ratings of 3 stars or less require admin approval before being published.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Reviews */}
          {ratings.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-fredoka text-ocean-deep">Recent Reviews</h3>
              {ratings.map((rating) => (
                <Card key={rating.id}>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < rating.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="font-medium">{rating.user_name}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {new Date(rating.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm">{rating.review_text}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecipeDetail;
