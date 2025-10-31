import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface RecipeTypeSelectorProps {
  recipeType: string;
  onRecipeTypeChange: (value: string) => void;
  isFeaturedBase: boolean;
  onFeaturedBaseChange: (checked: boolean) => void;
  baseName: string;
  onBaseNameChange: (value: string) => void;
  baseRecipeId: string;
  onBaseRecipeIdChange: (value: string) => void;
  frostingRecipeId: string;
  onFrostingRecipeIdChange: (value: string) => void;
  variantNotes: string;
  onVariantNotesChange: (value: string) => void;
  assemblyInstructions: string;
  onAssemblyInstructionsChange: (value: string) => void;
}

export function RecipeTypeSelector({
  recipeType,
  onRecipeTypeChange,
  isFeaturedBase,
  onFeaturedBaseChange,
  baseName,
  onBaseNameChange,
  baseRecipeId,
  onBaseRecipeIdChange,
  frostingRecipeId,
  onFrostingRecipeIdChange,
  variantNotes,
  onVariantNotesChange,
  assemblyInstructions,
  onAssemblyInstructionsChange,
}: RecipeTypeSelectorProps) {
  // Fetch base cakes
  const { data: baseCakes } = useQuery({
    queryKey: ['base-cakes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('recipes')
        .select('id, title, base_name')
        .eq('recipe_type', 'base_cake')
        .order('title');
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch frostings
  const { data: frostings } = useQuery({
    queryKey: ['frostings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('recipes')
        .select('id, title')
        .eq('recipe_type', 'frosting')
        .order('title');
      
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-4 border rounded-lg p-4">
      <div>
        <Label className="text-base font-semibold mb-3 block">Recipe Type</Label>
        <RadioGroup value={recipeType} onValueChange={onRecipeTypeChange}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="complete" id="complete" />
            <Label htmlFor="complete">Complete Recipe (traditional single recipe)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="base_cake" id="base_cake" />
            <Label htmlFor="base_cake">Base Cake Only (one of Brandia's core bases)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="frosting" id="frosting" />
            <Label htmlFor="frosting">Frosting Only (can be mixed with any base)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="variant" id="variant" />
            <Label htmlFor="variant">Variant (combines a base + frosting)</Label>
          </div>
        </RadioGroup>
      </div>

      {recipeType === 'base_cake' && (
        <div className="space-y-3 border-t pt-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="featured-base"
              checked={isFeaturedBase}
              onCheckedChange={onFeaturedBaseChange}
            />
            <Label htmlFor="featured-base">✨ Featured Base (one of the 5-6 core bases)</Label>
          </div>
          
          <div>
            <Label htmlFor="base-name">Base Name</Label>
            <Input
              id="base-name"
              value={baseName}
              onChange={(e) => onBaseNameChange(e.target.value)}
              placeholder="e.g., Brandia's Classic Chocolate"
            />
            <p className="text-sm text-muted-foreground mt-1">
              This name will be used when referencing this base in variants
            </p>
          </div>
        </div>
      )}

      {recipeType === 'variant' && (
        <div className="space-y-3 border-t pt-4">
          <div>
            <Label htmlFor="base-recipe">Base Cake</Label>
            <Select value={baseRecipeId} onValueChange={onBaseRecipeIdChange}>
              <SelectTrigger id="base-recipe">
                <SelectValue placeholder="Select a base cake..." />
              </SelectTrigger>
              <SelectContent>
                {baseCakes?.map((base) => (
                  <SelectItem key={base.id} value={base.id}>
                    {base.base_name || base.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="frosting-recipe">Frosting</Label>
            <Select value={frostingRecipeId} onValueChange={onFrostingRecipeIdChange}>
              <SelectTrigger id="frosting-recipe">
                <SelectValue placeholder="Select a frosting..." />
              </SelectTrigger>
              <SelectContent>
                {frostings?.map((frosting) => (
                  <SelectItem key={frosting.id} value={frosting.id}>
                    {frosting.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="variant-notes">Variant Notes</Label>
            <Textarea
              id="variant-notes"
              value={variantNotes}
              onChange={(e) => onVariantNotesChange(e.target.value)}
              placeholder="Any customizations or special notes for this variant..."
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="assembly-instructions">Assembly Instructions</Label>
            <Textarea
              id="assembly-instructions"
              value={assemblyInstructions}
              onChange={(e) => onAssemblyInstructionsChange(e.target.value)}
              placeholder="How to put the base and frosting together..."
              rows={4}
            />
          </div>
        </div>
      )}
    </div>
  );
}
