import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import { Button } from "@/components/ui/button";
import { LogOut, Home, BookOpen, Users, MessageSquare, User, Settings, Menu, X } from "lucide-react";

const Navigation = () => {
  const navigate = useNavigate();
  const { isAdmin, isAuthenticated } = useUserRole();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <header className="relative z-20 border-b border-border bg-card/80 backdrop-blur-sm">
      <div className="w-full px-3 py-3 md:px-4 md:py-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/")}
            className="text-lg md:text-2xl font-fredoka text-ocean-deep hover:opacity-80 transition-opacity shrink-0"
          >
            BBs Cake Creations
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 ml-auto">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 text-ocean-deep hover:text-ocean-wave transition-colors"
            >
              <Home className="w-4 h-4" />
              Home
            </button>
            <button
              onClick={() => navigate("/recipes")}
              className="flex items-center gap-2 text-ocean-deep hover:text-ocean-wave transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              Recipes
            </button>
            <button
              onClick={() => navigate("/blog")}
              className="flex items-center gap-2 text-ocean-deep hover:text-ocean-wave transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              Blog
            </button>
            <button
              onClick={() => navigate("/community")}
              className="flex items-center gap-2 text-ocean-deep hover:text-ocean-wave transition-colors"
            >
              <Users className="w-4 h-4" />
              Community
            </button>
            <button
              onClick={() => navigate("/about")}
              className="flex items-center gap-2 text-ocean-deep hover:text-ocean-wave transition-colors"
            >
              <User className="w-4 h-4" />
              About
            </button>
          </nav>

          {/* Desktop Action Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/chat")}
              className="gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              Chat with Sasha
            </Button>
            {isAdmin && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/admin")}
                className="gap-2 border-coral text-coral hover:bg-coral hover:text-white"
              >
                <Settings className="w-4 h-4" />
                Admin
              </Button>
            )}
            {isAuthenticated && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden ml-auto shrink-0"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-3 pb-2 space-y-1.5 border-t border-border pt-3">
            <button
              onClick={() => {
                navigate("/");
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-2 text-ocean-deep hover:text-ocean-wave transition-colors py-2 px-2 rounded hover:bg-muted"
            >
              <Home className="w-4 h-4" />
              Home
            </button>
            <button
              onClick={() => {
                navigate("/recipes");
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-2 text-ocean-deep hover:text-ocean-wave transition-colors py-2 px-2 rounded hover:bg-muted"
            >
              <BookOpen className="w-4 h-4" />
              Recipes
            </button>
            <button
              onClick={() => {
                navigate("/blog");
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-2 text-ocean-deep hover:text-ocean-wave transition-colors py-2 px-2 rounded hover:bg-muted"
            >
              <MessageSquare className="w-4 h-4" />
              Blog
            </button>
            <button
              onClick={() => {
                navigate("/community");
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-2 text-ocean-deep hover:text-ocean-wave transition-colors py-2 px-2 rounded hover:bg-muted"
            >
              <Users className="w-4 h-4" />
              Community
            </button>
            <button
              onClick={() => {
                navigate("/about");
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-2 text-ocean-deep hover:text-ocean-wave transition-colors py-2 px-2 rounded hover:bg-muted"
            >
              <User className="w-4 h-4" />
              About
            </button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                navigate("/chat");
                setIsMobileMenuOpen(false);
              }}
              className="w-full gap-2 justify-start"
            >
              <MessageSquare className="w-4 h-4" />
              Chat with Sasha
            </Button>
            {isAdmin && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  navigate("/admin");
                  setIsMobileMenuOpen(false);
                }}
                className="w-full gap-2 justify-start border-coral text-coral hover:bg-coral hover:text-white"
              >
                <Settings className="w-4 h-4" />
                Admin
              </Button>
            )}
            {isAuthenticated && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  handleSignOut();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full gap-2 justify-start"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Navigation;
