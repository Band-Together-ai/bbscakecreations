import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import { useNavigate } from "react-router-dom";

interface RecipeSaveButtonProps {
  recipeId: string;
  canViewFullRecipe: boolean;
}

const FOLDERS = ["Saved", "Favorites", "To Try", "Made It", "Holiday"];

export const RecipeSaveButton = ({ recipeId, canViewFullRecipe }: RecipeSaveButtonProps) => {
  const [isSaved, setIsSaved] = useState(false);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { isAuthenticated, hasFullAccess } = useUserRole();
  const navigate = useNavigate();

  useEffect(() => {
    checkIfSaved();
  }, [recipeId, isAuthenticated]);

  const checkIfSaved = async () => {
    if (!isAuthenticated) return;

    try {
      const { data: bakebook } = await supabase
        .from("user_bakebooks")
        .select("id")
        .single();

      if (!bakebook) return;

      const { data: entry } = await supabase
        .from("bakebook_entries")
        .select("folder")
        .eq("bakebook_id", bakebook.id)
        .eq("recipe_id", recipeId)
        .single();

      if (entry) {
        setIsSaved(true);
        setCurrentFolder(entry.folder);
      }
    } catch (error) {
      console.error("Error checking saved status:", error);
    }
  };

  const handleSave = async (folder: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Sign in required",
        description: "Sign in to use BakeBook (it's free). 🌊",
      });
      navigate("/auth");
      return;
    }

    setLoading(true);

    try {
      // Get or create bakebook
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not found");

      let { data: bakebook } = await supabase
        .from("user_bakebooks")
        .select("id")
        .single();

      if (!bakebook) {
        const { data: newBakebook, error: createError } = await supabase
          .from("user_bakebooks")
          .insert({ user_id: user.id })
          .select()
          .single();

        if (createError) throw createError;
        bakebook = newBakebook;
      }

      if (isSaved) {
        // Update folder
        const { error: updateError } = await supabase
          .from("bakebook_entries")
          .update({ folder })
          .eq("bakebook_id", bakebook.id)
          .eq("recipe_id", recipeId);

        if (updateError) throw updateError;

        setCurrentFolder(folder);
        toast({
          title: "Moved to " + folder,
          description: "Recipe updated in your BakeBook ✅",
        });
      } else {
        // Insert new entry
        const { error: insertError } = await supabase
          .from("bakebook_entries")
          .insert({
            bakebook_id: bakebook.id,
            recipe_id: recipeId,
            folder,
          });

        if (insertError) {
          // Check if it's the tier limit error
          if (insertError.message.includes("BakeBook limit")) {
            toast({
              title: "BakeBook limit reached",
              description: insertError.message,
              variant: "destructive",
            });
            return;
          }
          throw insertError;
        }

        setIsSaved(true);
        setCurrentFolder(folder);
        toast({
          title: "Saved to BakeBook",
          description: `Added to ${folder} ✅`,
        });
      }
    } catch (error) {
      console.error("Error saving recipe:", error);
      toast({
        title: "Error",
        description: "Failed to save recipe. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    setLoading(true);

    try {
      const { data: bakebook } = await supabase
        .from("user_bakebooks")
        .select("id")
        .single();

      if (!bakebook) return;

      const { error } = await supabase
        .from("bakebook_entries")
        .delete()
        .eq("bakebook_id", bakebook.id)
        .eq("recipe_id", recipeId);

      if (error) throw error;

      setIsSaved(false);
      setCurrentFolder(null);
      toast({
        title: "Removed from BakeBook",
        description: "Recipe removed successfully",
      });
    } catch (error) {
      console.error("Error removing recipe:", error);
      toast({
        title: "Error",
        description: "Failed to remove recipe. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!canViewFullRecipe) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={isSaved ? "default" : "outline"}
          size="icon"
          disabled={loading}
        >
          <Heart
            className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {FOLDERS.map((folder) => (
          <DropdownMenuItem
            key={folder}
            onClick={() => handleSave(folder)}
            className={currentFolder === folder ? "bg-accent" : ""}
          >
            {currentFolder === folder ? "✓ " : ""}
            {folder}
          </DropdownMenuItem>
        ))}
        {isSaved && (
          <>
            <DropdownMenuItem className="border-t" disabled>
              ──────
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleRemove} className="text-destructive">
              Remove from BakeBook
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
