import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface StickySaveButtonProps {
  isSaved: boolean;
  onSave: () => void;
  disabled?: boolean;
  className?: string;
}

export const StickySaveButton = ({
  isSaved,
  onSave,
  disabled,
  className,
}: StickySaveButtonProps) => {
  return (
    <Button
      onClick={onSave}
      disabled={disabled}
      className={cn(
        "sticky top-4 z-30 min-h-[44px] shadow-lg",
        isSaved
          ? "bg-[#F7A48C] hover:bg-[#F58D6E] text-white"
          : "bg-white hover:bg-gray-50 text-[#5B4A3A] border border-[#F7A48C]",
        className
      )}
      aria-label={isSaved ? "Remove from BakeBook" : "Save to BakeBook"}
    >
      <Heart className={cn("w-5 h-5 mr-2", isSaved && "fill-current")} />
      {isSaved ? "Saved to BakeBook" : "Save to BakeBook"}
    </Button>
  );
};
