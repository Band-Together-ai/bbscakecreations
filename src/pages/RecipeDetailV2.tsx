import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { RecipePhotoCarousel } from "@/components/recipe/RecipePhotoCarousel";
import { RecipeSummaryCardV2 } from "@/components/recipe/RecipeSummaryCardV2";
import { RecipeStoryIntro } from "@/components/recipe/RecipeStoryIntro";
import { JumpToRecipeButton } from "@/components/recipe/JumpToRecipeButton";
import { RecipeBadges } from "@/components/recipe/RecipeBadges";
import { RecipeAccordion } from "@/components/recipe/RecipeAccordion";
import { RecipeStagingStrip } from "@/components/recipe/RecipeStagingStrip";
import { StickySaveButton } from "@/components/bakebook/StickySaveButton";
import { FabAskSasha } from "@/components/sasha/FabAskSasha";
import { BottomNavV2 } from "@/components/nav/BottomNavV2";
import { Share2, ShoppingCart, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useUserRole } from "@/hooks/useUserRole";
import { AuthModal } from "@/components/AuthModal";
import "../styles/ui_v2.css";

export default function RecipeDetailV2() {
  const { id } = useParams();
  const [isSaved, setIsSaved] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { isAuthenticated } = useUserRole();

  // Fetch recipe
  const { data: recipe, isLoading } = useQuery({
    queryKey: ["recipe", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("recipes")
        .select(`
          *,
          recipe_photos(photo_url, is_headline)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  // Fetch base recipe if variant
  const { data: baseRecipe } = useQuery({
    queryKey: ["baseRecipe", recipe?.base_recipe_id],
    enabled: !!recipe?.base_recipe_id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("recipes")
        .select("*")
        .eq("id", recipe.base_recipe_id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  // Fetch frosting recipe if variant
  const { data: frostingRecipe } = useQuery({
    queryKey: ["frostingRecipe", recipe?.frosting_recipe_id],
    enabled: !!recipe?.frosting_recipe_id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("recipes")
        .select("*")
        .eq("id", recipe.frosting_recipe_id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  // Fetch related variants that use the same base (if this is a variant)
  const { data: relatedVariants } = useQuery({
    queryKey: ["relatedVariants", recipe?.base_recipe_id],
    enabled: !!recipe?.base_recipe_id && recipe?.recipe_type === 'variant',
    queryFn: async () => {
      const { data, error } = await supabase
        .from("recipes")
        .select("id, title")
        .eq("base_recipe_id", recipe.base_recipe_id)
        .neq("id", id)
        .limit(5);

      if (error) throw error;
      return data;
    },
  });

  // Fetch saves count
  const { data: savesData } = useQuery({
    queryKey: ["recipeSaves", id],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("bakebook_entries")
        .select("*", { count: "exact", head: true })
        .eq("recipe_id", id);

      if (error) throw error;
      return count || 0;
    },
  });

  const handleSave = async () => {
    // TODO: Implement actual save logic with tier limits
    setIsSaved(!isSaved);
    toast.success(isSaved ? "Removed from BakeBook" : "Saved to BakeBook");
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: recipe?.title,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard");
    }
  };

  if (isLoading) {
    return (
      <div className="ui-v2 min-h-screen flex items-center justify-center">
        <p>Loading recipe...</p>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="ui-v2 min-h-screen flex items-center justify-center">
        <p>Recipe not found</p>
      </div>
    );
  }

  // Parse staging if available
  const stages = Array.isArray(recipe.staging_json) ? (recipe.staging_json as any[]) : [];

  // Parse tools if available (not in schema yet - placeholder)
  const tools: any[] = [];

  // Calculate time values for summary card
  const prepMinutes = recipe.prep_active_minutes || 0;
  const bakeMinutes = recipe.prep_passive_minutes || 0;
  const totalMinutes = prepMinutes + bakeMinutes;

  // Sort photos to put headline first
  const sortedPhotos = recipe.recipe_photos 
    ? [...recipe.recipe_photos].sort((a: any, b: any) => {
        if (a.is_headline && !b.is_headline) return -1;
        if (!a.is_headline && b.is_headline) return 1;
        return 0;
      })
    : [];

  return (
    <div className="ui-v2 min-h-screen pb-20">
      <RecipePhotoCarousel
        photos={sortedPhotos}
        title={recipe.title}
      />

      <RecipeSummaryCardV2
        prep={prepMinutes ? `${prepMinutes}m` : undefined}
        bake={bakeMinutes ? `${bakeMinutes}m` : undefined}
        total={totalMinutes ? `${totalMinutes}m` : undefined}
        servings={undefined}
        difficulty="Medium"
      />

      <main className="max-w-4xl mx-auto px-4 py-6">
        <RecipeStoryIntro 
          author={undefined}
          story={undefined}
        />

        <JumpToRecipeButton />

        {/* Related Variants Note (if this is a variant) */}
        {recipe.recipe_type === 'variant' && relatedVariants && relatedVariants.length > 0 && (
          <div className="ui-v2-card mb-6 p-4 bg-ocean-wave/5 border border-ocean-wave/20">
            <p className="text-sm text-ocean-deep">
              💡 This cake uses <strong>{baseRecipe?.base_name || baseRecipe?.title}</strong> also seen in:{' '}
              {relatedVariants.map((v, i) => (
                <span key={v.id}>
                  <a 
                    href={`/recipe/${v.id}`}
                    className="text-ocean hover:underline font-medium"
                  >
                    {v.title}
                  </a>
                  {i < relatedVariants.length - 1 && ', '}
                </span>
              ))}
            </p>
          </div>
        )}

        <RecipeBadges
          isBase={recipe.is_base_recipe}
          baseName={baseRecipe?.title}
          prepActiveMinutes={recipe.prep_active_minutes}
          makeAhead={recipe.make_ahead}
          savesCount={savesData}
        />

        {stages.length > 0 && <RecipeStagingStrip stages={stages} />}

        {/* CTA Row */}
        <div className="flex gap-3 mb-6">
          <StickySaveButton
            isSaved={isSaved}
            onSave={handleSave}
            className="flex-1 sticky-0"
          />
          <Button
            variant="outline"
            onClick={handleShare}
            className="ui-v2-button min-w-[44px]"
            aria-label="Share recipe"
          >
            <Share2 className="w-5 h-5" />
          </Button>
          <Button
            variant="outline"
            className="ui-v2-button min-w-[44px]"
            aria-label="Add tools to wishlist"
          >
            <ShoppingCart className="w-5 h-5" />
          </Button>
        </div>

        {/* Instructions Lock Overlay for Non-Authenticated Users */}
        {!isAuthenticated ? (
          <div className="relative">
            {/* Show ingredients publicly */}
            <div className="mb-6">
              <h2 className="text-2xl font-fredoka text-ocean-deep mb-4">Ingredients</h2>
              <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-wrap">{String(recipe.ingredients || '')}</p>
              </div>
            </div>

            {/* Locked Instructions */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/80 to-background z-10 backdrop-blur-sm rounded-lg" />
              <div className="blur-sm pointer-events-none">
                <h2 className="text-2xl font-fredoka text-ocean-deep mb-4">Instructions</h2>
                <div className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-wrap">{String(recipe.instructions || '').substring(0, 200)}...</p>
                </div>
              </div>
              
              {/* Lock CTA */}
              <div className="absolute inset-0 z-20 flex items-center justify-center">
                <div className="text-center bg-background/95 p-8 rounded-lg shadow-float max-w-md border border-ocean-wave/30">
                  <Lock className="w-12 h-12 text-ocean-wave mx-auto mb-4" />
                  <h3 className="text-xl font-fredoka text-ocean-deep mb-2">
                    Sign up free to unlock Brandia's instructions & secret tips
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Save recipes, chat with Sasha, and join the community
                  </p>
                  <Button
                    onClick={() => setShowAuthModal(true)}
                    className="gradient-ocean text-primary-foreground"
                    size="lg"
                  >
                    Sign Up Free
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <RecipeAccordion
            recipeType={recipe.recipe_type}
            ingredients={recipe.ingredients}
            instructions={recipe.instructions}
            baseRecipe={baseRecipe}
            frostingRecipe={frostingRecipe}
            assemblyInstructions={recipe.assembly_instructions}
            variantNotes={recipe.variant_notes}
            tools={tools}
            insights={
              <div className="space-y-4">
                <p className="text-[#5E6A6E] italic">
                  I'll fetch tool tips when you're ready.
                </p>
                <p className="text-sm text-[#5E6A6E]">
                  Join the community — more tips coming soon.
                </p>
              </div>
            }
          />
        )}
      </main>

      <FabAskSasha recipeId={id} />
      <BottomNavV2 />
      
      <AuthModal
        open={showAuthModal}
        onOpenChange={setShowAuthModal}
      />
    </div>
  );
}
