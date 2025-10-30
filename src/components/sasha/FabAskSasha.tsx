import { MessageCircle } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface FabAskSashaProps {
  recipeId?: string;
  stage?: string;
}

export const FabAskSasha = ({ recipeId, stage }: FabAskSashaProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleClick = () => {
    const params = new URLSearchParams();
    if (recipeId) params.set("recipe", recipeId);
    if (stage) params.set("stage", stage);
    params.set("from", location.pathname);
    
    navigate(`/chat?${params.toString()}`);
  };

  return (
    <Button
      onClick={handleClick}
      className="fixed bottom-20 right-4 z-40 w-14 h-14 rounded-full shadow-lg bg-[#F7A48C] hover:bg-[#F58D6E] text-white"
      style={{ minHeight: "44px", minWidth: "44px" }}
      aria-label="Ask Sasha for help"
    >
      <MessageCircle className="w-6 h-6" />
    </Button>
  );
};
