import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { RecipeHeaderHero } from "@/components/recipe/RecipeHeaderHero";
import { RecipeSummaryCard } from "@/components/recipe/RecipeSummaryCard";
import { RecipeBadges } from "@/components/recipe/RecipeBadges";
import { RecipeAccordion } from "@/components/recipe/RecipeAccordion";
import { RecipeStagingStrip } from "@/components/recipe/RecipeStagingStrip";
import { StickySaveButton } from "@/components/bakebook/StickySaveButton";
import { FabAskSasha } from "@/components/sasha/FabAskSasha";
import { BottomNavV2 } from "@/components/nav/BottomNavV2";
import { Share2, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import "../styles/ui_v2.css";

export default function RecipeDetailV2() {
  const { id } = useParams();
  const [isSaved, setIsSaved] = useState(false);

  // Fetch recipe
  const { data: recipe, isLoading } = useQuery({
    queryKey: ["recipe", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("recipes")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  // Fetch base recipe name if variant
  const { data: baseRecipe } = useQuery({
    queryKey: ["baseRecipe", recipe?.base_recipe_id],
    enabled: !!recipe?.base_recipe_id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("recipes")
        .select("title")
        .eq("id", recipe.base_recipe_id)
        .single();

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

  return (
    <div className="ui-v2 min-h-screen pb-20">
      <RecipeHeaderHero
        title={recipe.title}
        imageUrl={recipe.image_url || "/placeholder.svg"}
        subheader={recipe.description}
      />

      <main className="max-w-4xl mx-auto px-4 py-6">
        <RecipeBadges
          isBase={recipe.is_base_recipe}
          baseName={baseRecipe?.title}
          prepActiveMinutes={recipe.prep_active_minutes}
          makeAhead={recipe.make_ahead}
          savesCount={savesData}
        />

        <RecipeSummaryCard
          prepActiveMinutes={recipe.prep_active_minutes}
          prepPassiveMinutes={recipe.prep_passive_minutes}
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

        <RecipeAccordion
          ingredients={recipe.ingredients}
          instructions={recipe.instructions}
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
      </main>

      <FabAskSasha recipeId={id} />
      <BottomNavV2 />
    </div>
  );
}
