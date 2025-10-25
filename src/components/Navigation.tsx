import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LogOut, Home, BookOpen, Users, MessageSquare, User, Settings } from "lucide-react";

const Navigation = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkAdminStatus(session.user.id);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkAdminStatus(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAdminStatus = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", userId)
      .single();
    
    setIsAdmin(data?.is_admin || false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <header className="relative z-20 border-b border-border bg-card/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="text-2xl font-fredoka gradient-ocean bg-clip-text text-transparent hover:opacity-80 transition-opacity"
          >
            CakeWhisperer
          </button>

          <nav className="hidden md:flex items-center gap-6">
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

          <div className="flex items-center gap-4">
            {user ? (
              <>
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
                <Button variant="outline" size="sm" onClick={handleSignOut} className="gap-2">
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </Button>
              </>
            ) : (
              <Button
                onClick={() => navigate("/auth")}
                className="gradient-ocean text-primary-foreground"
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navigation;
