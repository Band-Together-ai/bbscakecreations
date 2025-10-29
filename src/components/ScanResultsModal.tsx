import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ToolSuggestionCard } from "./ToolSuggestionCard";
import { Sparkles } from "lucide-react";

interface ScanResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tools: any[];
  onAddToWishlist?: (toolId: string) => Promise<void>;
}

export const ScanResultsModal = ({
  isOpen,
  onClose,
  tools,
  onAddToWishlist,
}: ScanResultsModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-ocean-wave" />
            Tool Recommendations
          </DialogTitle>
          <DialogDescription>
            {tools.length > 0
              ? `We found ${tools.length} tool${tools.length > 1 ? 's' : ''} that might help with this recipe!`
              : "No specific tools were detected in this recipe."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-4">
          {tools.length > 0 ? (
            tools.map((tool) => (
              <ToolSuggestionCard
                key={tool.id}
                tool={tool}
                onAddToWishlist={onAddToWishlist}
                showConfidence={false}
              />
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>Try adding more detailed notes about your baking process</p>
              <p className="text-sm mt-2">
                Mention specific tools you used or would like to use!
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
