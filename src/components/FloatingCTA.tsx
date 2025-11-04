import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, Book, MessageCircle, ChefHat } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AuthModal } from "./AuthModal";

interface FloatingCTAProps {
  page?: "recipes" | "chat" | "bakebook" | "tools" | "community" | "default";
}

export const FloatingCTA = ({ page = "default" }: FloatingCTAProps) => {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Don't show if already dismissed in this session
    if (sessionStorage.getItem("cta-dismissed")) {
      setDismissed(true);
      return;
    }

    // Show after scrolling down 300px
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setVisible(true);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleDismiss = () => {
    setVisible(false);
    setDismissed(true);
    sessionStorage.setItem("cta-dismissed", "true");
  };

  const handleSignUp = () => {
    // Store entry point before showing auth modal
    sessionStorage.setItem("signup_entry_point", page);
    setShowAuth(true);
  };

  if (dismissed || !visible) return null;

  const messages = {
    recipes: {
      icon: <ChefHat className="w-5 h-5" />,
      text: "Love these recipes? Save them to your BakeBook!",
      cta: "Start Free BakeBook",
    },
    chat: {
      icon: <MessageCircle className="w-5 h-5" />,
      text: "Chatting with Sasha? Sign up to save your conversations!",
      cta: "Create Free Account",
    },
    bakebook: {
      icon: <Book className="w-5 h-5" />,
      text: "Ready to organize your baking journey?",
      cta: "Start Your BakeBook",
    },
    tools: {
      icon: <ChefHat className="w-5 h-5" />,
      text: "Unlock all baking tools with a free account!",
      cta: "Sign Up Free",
    },
    community: {
      icon: <MessageCircle className="w-5 h-5" />,
      text: "Join the conversation with fellow bakers!",
      cta: "Sign Up to Join",
    },
    default: {
      icon: <Book className="w-5 h-5" />,
      text: "Join BBs Cake Creations - Free forever!",
      cta: "Get Started",
    },
  };

  const content = messages[page];

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50 animate-fade-in">
        <div className="bg-white shadow-wave rounded-lg p-4 max-w-sm border-2 border-ocean-mist flex items-start gap-3">
          <div className="text-ocean-deep mt-1">{content.icon}</div>
          <div className="flex-1">
            <p className="text-sm text-ocean-deep font-medium mb-2">
              {content.text}
            </p>
            <Button
              onClick={handleSignUp}
              className="w-full gradient-ocean text-white shadow-wave hover:scale-105 transition-bounce"
              size="sm"
            >
              {content.cta}
            </Button>
          </div>
          <button
            onClick={handleDismiss}
            className="text-muted-foreground hover:text-ocean-deep transition-smooth"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <AuthModal
        open={showAuth}
        onOpenChange={setShowAuth}
        onSuccess={() => navigate("/chat")}
      />
    </>
  );
};
