import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import { useViewAs } from "@/contexts/ViewAsContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { LogOut, Home, BookOpen, Users, MessageSquare, User, Settings, Menu, X, Coffee, HelpCircle, MoreHorizontal, Eye, EyeOff } from "lucide-react";
import logoHorizontal from "@/assets/logo-horizontal-transparent.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navigation = () => {
  const navigate = useNavigate();
  const { isAdmin, isAuthenticated, role } = useUserRole();
  const { viewAsRole, isViewingAs, clearViewAs } = useViewAs();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <>
      {/* View As Banner */}
      {isViewingAs && (
        <div className="bg-yellow-500 text-black px-4 py-2 text-center text-sm font-medium">
          <div className="flex items-center justify-center gap-2">
            <Eye className="h-4 w-4" />
            <span>
              Viewing as: <strong>{viewAsRole === 'unauthenticated' ? 'Not Logged In' : viewAsRole?.toUpperCase()}</strong>
            </span>
            <Button
              size="sm"
              variant="ghost"
              onClick={clearViewAs}
              className="h-6 ml-2 gap-1 text-black hover:text-black hover:bg-yellow-600"
            >
              <EyeOff className="h-3 w-3" />
              Exit
            </Button>
          </div>
        </div>
      )}
      <header className="relative z-20 border-b border-border bg-card/80 backdrop-blur-sm">
      <div className="w-full px-3 py-3 md:px-4 md:py-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/")}
            className="hover:opacity-80 transition-opacity shrink-0"
          >
            <img 
              src={logoHorizontal} 
              alt="BB's Cake Creations" 
              className="h-10 md:h-12 w-auto"
            />
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
              onClick={() => navigate("/instructions")}
              className="flex items-center gap-2 text-ocean-deep hover:text-ocean-wave transition-colors"
            >
              <HelpCircle className="w-4 h-4" />
              How to Use
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 text-ocean-deep hover:text-ocean-wave transition-colors">
                  <MoreHorizontal className="w-4 h-4" />
                  More
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-card border-border">
                <DropdownMenuItem onClick={() => navigate("/gallery")} className="cursor-pointer">
                  Gallery
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/tools")} className="cursor-pointer">
                  Kitchen Tools
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/favorites")} className="cursor-pointer">
                  Bakers We Love
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/blog")} className="cursor-pointer flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Blog
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/community")} className="cursor-pointer flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Community
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/about")} className="cursor-pointer flex items-center gap-2">
                  <User className="w-4 h-4" />
                  About
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          {/* Desktop Action Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.info("Tip jar coming soon! 💕")}
              className="gap-2 text-amber-600 border-amber-400 hover:bg-amber-50"
            >
              <Coffee className="w-4 h-4" />
              Buy me a Coffee
            </Button>
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                toast.info("Tip jar coming soon! 💕");
                setIsMobileMenuOpen(false);
              }}
              className="w-full gap-2 justify-start text-amber-600 border-amber-400 hover:bg-amber-50"
            >
              <Coffee className="w-4 h-4" />
              Buy me a Coffee
            </Button>
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
                navigate("/gallery");
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-2 text-ocean-deep hover:text-ocean-wave transition-colors py-2 px-2 rounded hover:bg-muted"
            >
              <BookOpen className="w-4 h-4" />
              Gallery
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
            <button
              onClick={() => {
                navigate("/instructions");
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-2 text-ocean-deep hover:text-ocean-wave transition-colors py-2 px-2 rounded hover:bg-muted"
            >
              <HelpCircle className="w-4 h-4" />
              How to Use
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
    </>
  );
};

export default Navigation;
