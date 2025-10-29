import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ViewAsProvider } from "@/contexts/ViewAsContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdminRoute } from "@/components/AdminRoute";
import { useSessionTracking } from "@/hooks/useSessionTracking";
import { usePageTracking } from "@/hooks/usePageTracking";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Chat from "./pages/Chat";
import Admin from "./pages/Admin";
import Recipes from "./pages/Recipes";
import RecipeDetail from "./pages/RecipeDetail";
import Blog from "./pages/Blog";
import Community from "./pages/Community";
import About from "./pages/About";
import Tools from "./pages/Tools";
import Favorites from "./pages/Favorites";
import Instructions from "./pages/Instructions";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppContent = () => {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id || null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Track user sessions and page views
  useSessionTracking(userId);
  usePageTracking(userId);

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/chat" element={<Chat />} />
      <Route path="/admin" element={
        <AdminRoute>
          <Admin />
        </AdminRoute>
      } />
      <Route path="/recipes" element={<Recipes />} />
      <Route path="/recipe/:id" element={<RecipeDetail />} />
      <Route path="/blog" element={<Blog />} />
      <Route path="/tools" element={<Tools />} />
      <Route path="/favorites" element={<Favorites />} />
      <Route path="/community" element={
        <ProtectedRoute>
          <Community />
        </ProtectedRoute>
      } />
      <Route path="/about" element={<About />} />
      <Route path="/instructions" element={<Instructions />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ViewAsProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </TooltipProvider>
    </ViewAsProvider>
  </QueryClientProvider>
);

export default App;
