import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Check, Edit, Shuffle } from "lucide-react";

interface ParsedRecipe {
  hasSeparation: boolean;
  confidence: number;
  cakePart: {
    ingredients: Array<{ ingredient: string; amount: string; unit: string; notes: string }>;
    instructions: string[];
  };
  frostingPart: {
    ingredients: Array<{ ingredient: string; amount: string; unit: string; notes: string }>;
    instructions: string[];
  };
  assemblyInstructions: string;
}

interface RecipeSeparationApprovalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parsedRecipe: ParsedRecipe;
  onApprove: (data: {
    createSeparate: boolean;
    cakePart: ParsedRecipe['cakePart'];
    frostingPart: ParsedRecipe['frostingPart'];
    assemblyInstructions: string;
  }) => void;
  onKeepTogether: () => void;
}

export function RecipeSeparationApproval({
  open,
  onOpenChange,
  parsedRecipe,
  onApprove,
  onKeepTogether,
}: RecipeSeparationApprovalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [cakeIngredients, setCakeIngredients] = useState(
    JSON.stringify(parsedRecipe.cakePart.ingredients, null, 2)
  );
  const [cakeInstructions, setCakeInstructions] = useState(
    parsedRecipe.cakePart.instructions.join('\n')
  );
  const [frostingIngredients, setFrostingIngredients] = useState(
    JSON.stringify(parsedRecipe.frostingPart.ingredients, null, 2)
  );
  const [frostingInstructions, setFrostingInstructions] = useState(
    parsedRecipe.frostingPart.instructions.join('\n')
  );
  const [assemblyInstructions, setAssemblyInstructions] = useState(
    parsedRecipe.assemblyInstructions
  );

  const handleApproveSplit = () => {
    try {
      const cakePart = {
        ingredients: JSON.parse(cakeIngredients),
        instructions: cakeInstructions.split('\n').filter(s => s.trim()),
      };
      const frostingPart = {
        ingredients: JSON.parse(frostingIngredients),
        instructions: frostingInstructions.split('\n').filter(s => s.trim()),
      };
      
      onApprove({
        createSeparate: true,
        cakePart,
        frostingPart,
        assemblyInstructions,
      });
    } catch (error) {
      console.error('Error parsing edited content:', error);
    }
  };

  const confidenceColor = parsedRecipe.confidence > 0.7 ? "bg-green-500" : 
                          parsedRecipe.confidence > 0.4 ? "bg-yellow-500" : "bg-red-500";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shuffle className="h-5 w-5" />
            Recipe Separation Detected
            <Badge className={confidenceColor}>
              {Math.round(parsedRecipe.confidence * 100)}% Confidence
            </Badge>
          </DialogTitle>
        </DialogHeader>

        {parsedRecipe.confidence < 0.5 && (
          <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <p className="text-sm text-yellow-800">
              Low confidence in auto-separation. Please review carefully before approving.
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          {/* Cake Part */}
          <div className="border rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              🎂 Cake / Base Component
            </h3>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Ingredients</label>
              {isEditing ? (
                <Textarea
                  value={cakeIngredients}
                  onChange={(e) => setCakeIngredients(e.target.value)}
                  className="font-mono text-sm"
                  rows={8}
                />
              ) : (
                <div className="text-sm space-y-1 bg-muted p-3 rounded">
                  {parsedRecipe.cakePart.ingredients.map((ing, i) => (
                    <div key={i}>
                      {ing.amount} {ing.unit} {ing.ingredient} {ing.notes && `(${ing.notes})`}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Instructions</label>
              {isEditing ? (
                <Textarea
                  value={cakeInstructions}
                  onChange={(e) => setCakeInstructions(e.target.value)}
                  className="text-sm"
                  rows={10}
                />
              ) : (
                <ol className="text-sm space-y-2 list-decimal list-inside bg-muted p-3 rounded">
                  {parsedRecipe.cakePart.instructions.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
              )}
            </div>
          </div>

          {/* Frosting Part */}
          <div className="border rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              🧁 Frosting / Topping Component
            </h3>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Ingredients</label>
              {isEditing ? (
                <Textarea
                  value={frostingIngredients}
                  onChange={(e) => setFrostingIngredients(e.target.value)}
                  className="font-mono text-sm"
                  rows={8}
                />
              ) : (
                <div className="text-sm space-y-1 bg-muted p-3 rounded">
                  {parsedRecipe.frostingPart.ingredients.map((ing, i) => (
                    <div key={i}>
                      {ing.amount} {ing.unit} {ing.ingredient} {ing.notes && `(${ing.notes})`}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Instructions</label>
              {isEditing ? (
                <Textarea
                  value={frostingInstructions}
                  onChange={(e) => setFrostingInstructions(e.target.value)}
                  className="text-sm"
                  rows={10}
                />
              ) : (
                <ol className="text-sm space-y-2 list-decimal list-inside bg-muted p-3 rounded">
                  {parsedRecipe.frostingPart.instructions.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
              )}
            </div>
          </div>
        </div>

        {/* Assembly Instructions */}
        <div className="border rounded-lg p-4 space-y-2">
          <label className="text-sm font-medium block">🔧 Assembly Instructions</label>
          <Textarea
            value={assemblyInstructions}
            onChange={(e) => setAssemblyInstructions(e.target.value)}
            placeholder="How to put it all together..."
            rows={3}
          />
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => setIsEditing(!isEditing)}
          >
            <Edit className="h-4 w-4 mr-2" />
            {isEditing ? 'Preview' : 'Edit Sections'}
          </Button>
          
          <Button
            variant="outline"
            onClick={onKeepTogether}
          >
            Keep Together
          </Button>
          
          <Button onClick={handleApproveSplit}>
            <Check className="h-4 w-4 mr-2" />
            Approve Split - Create Base + Frosting
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
