import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUserRole } from "@/hooks/useUserRole";
import { BookOpen, Search, Star, Archive, Sparkles, Scan } from "lucide-react";
import { toast } from "sonner";
import { TeaserBakeBook } from "@/components/TeaserBakeBook";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScanResultsModal } from "@/components/ScanResultsModal";

interface BakeBookEntry {
  id: string;
  folder: string;
  saved_at: string;
  attempt_number: number;
  last_made_date: string | null;
  user_rating: number | null;
  is_archived: boolean;
  recipe: {
    id: string;
    title: string;
    image_url: string | null;
    category: string | null;
  };
}

const FOLDERS = ["All", "Saved", "Favorites", "To Try", "Made It", "Holiday"];

const BakeBook = () => {
  const navigate = useNavigate();
  const { isAuthenticated, bakeBookLimit } = useUserRole();
  const [entries, setEntries] = useState<BakeBookEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFolder, setSelectedFolder] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [scanningId, setScanningId] = useState<string | null>(null);
  const [scanResults, setScanResults] = useState<any[]>([]);
  const [showScanModal, setShowScanModal] = useState(false);

  // Show teaser for unauthenticated users
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <TeaserBakeBook />
      </div>
    );
  }

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      // Get or create bakebook
      let { data: bakebook } = await supabase
        .from("user_bakebooks")
        .select("id")
        .single();

      if (!bakebook) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: newBakebook } = await supabase
          .from("user_bakebooks")
          .insert({ user_id: user.id })
          .select()
          .single();

        bakebook = newBakebook;
      }

      if (!bakebook) return;

      // Fetch entries
      const { data, error } = await supabase
        .from("bakebook_entries")
        .select(`
          id,
          folder,
          saved_at,
          attempt_number,
          last_made_date,
          user_rating,
          is_archived,
          recipe:recipes(id, title, image_url, category)
        `)
        .eq("bakebook_id", bakebook.id)
        .eq("is_archived", false)
        .order("saved_at", { ascending: false });

      if (error) throw error;
      setEntries(data as any);
    } catch (error) {
      console.error("Error fetching BakeBook entries:", error);
      toast.error("Failed to load BakeBook");
    } finally {
      setLoading(false);
    }
  };

  const handleScanEntry = async (entryId: string) => {
    setScanningId(entryId);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase.functions.invoke('scan-bakebook-entry', {
        body: { bakebookEntryId: entryId, userId: user?.id }
      });

      if (error) throw error;
      
      setScanResults(data.suggestedTools || []);
      setShowScanModal(true);
      toast.success(`Found ${data.suggestedTools?.length || 0} tool recommendations!`);
    } catch (error) {
      console.error('Scan error:', error);
      toast.error('Failed to scan recipe');
    } finally {
      setScanningId(null);
    }
  };

  const handleAddToWishlist = async (catalogItemId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let { data: wishlist } = await supabase.from("user_wishlists").select("id").single();
      
      if (!wishlist) {
        const { data: newWishlist } = await supabase
          .from("user_wishlists")
          .insert({ user_id: user.id, name: "My Wishlist" })
          .select()
          .single();
        wishlist = newWishlist;
      }

      if (!wishlist) throw new Error("Failed to create wishlist");

      await supabase.from("wishlist_items").insert({
        wishlist_id: wishlist.id,
        catalog_item_id: catalogItemId,
        priority: "medium"
      });

      toast.success("Added to wishlist!");
    } catch (error) {
      console.error('Wishlist error:', error);
      toast.error('Failed to add to wishlist');
    }
  };

  const filteredEntries = entries.filter((entry) => {
    const matchesFolder = selectedFolder === "All" || entry.folder === selectedFolder;
    const matchesSearch =
      searchQuery === "" ||
      entry.recipe.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFolder && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-muted-foreground">Loading your BakeBook...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        {/* Almost Full Alert */}
        {entries.length >= 8 && bakeBookLimit === 10 && (
          <Alert className="mb-6 border-coral/50 bg-coral/5">
            <Sparkles className="h-4 w-4 text-coral" />
            <AlertTitle>Almost Full!</AlertTitle>
            <AlertDescription>
              You've saved {entries.length}/10 recipes. Want unlimited saves + real-time scanning?{" "}
              <Button 
                variant="link" 
                className="h-auto p-0 text-coral hover:text-coral/80"
                onClick={() => navigate('/how-it-works')}
              >
                Learn about Home Bakers Club →
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-fredoka gradient-ocean bg-clip-text text-transparent mb-4 flex items-center gap-3">
            <BookOpen className="w-10 h-10 text-ocean-wave" />
            My BakeBook
          </h1>
          <p className="text-muted-foreground">
            {bakeBookLimit === Infinity
              ? `${entries.length} recipes saved`
              : `${entries.length}/${bakeBookLimit} recipes saved`}
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search recipes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedFolder} onValueChange={setSelectedFolder}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FOLDERS.map((folder) => (
                <SelectItem key={folder} value={folder}>
                  {folder}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Recipe Grid */}
        {filteredEntries.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">
                {entries.length === 0
                  ? "Your BakeBook is empty"
                  : "No recipes found"}
              </h3>
              <p className="text-muted-foreground mb-6">
                {entries.length === 0
                  ? "Start saving recipes you love to organize and track your baking journey! 🌊"
                  : "Try a different folder or search term"}
              </p>
              {entries.length === 0 && (
                <Button onClick={() => navigate("/recipes")}>
                  Browse Recipes
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEntries.map((entry) => (
              <Card
                key={entry.id}
                className="overflow-hidden hover:shadow-lg transition-shadow"
              >
                {entry.recipe.image_url && (
                  <div className="h-48 overflow-hidden">
                    <img
                      src={entry.recipe.image_url}
                      alt={entry.recipe.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                  </div>
                )}
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 
                      className="font-semibold text-lg line-clamp-2 cursor-pointer hover:text-ocean-wave"
                      onClick={() => navigate(`/recipes/${entry.recipe.id}`)}
                    >
                      {entry.recipe.title}
                    </h3>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleScanEntry(entry.id);
                      }}
                      disabled={scanningId === entry.id}
                      className="gap-1 shrink-0"
                    >
                      <Scan className="w-3 h-3" />
                      {scanningId === entry.id ? 'Scanning...' : 'Scan'}
                    </Button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge variant="outline">{entry.folder}</Badge>
                    {entry.recipe.category && (
                      <Badge variant="secondary">{entry.recipe.category}</Badge>
                    )}
                  </div>

                  {entry.user_rating && (
                    <div className="flex items-center gap-1 mb-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < entry.user_rating!
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  )}

                  <div className="text-sm text-muted-foreground">
                    {entry.attempt_number > 0 && (
                      <p>Made {entry.attempt_number}x</p>
                    )}
                    {entry.last_made_date && (
                      <p>
                        Last made:{" "}
                        {new Date(entry.last_made_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <ScanResultsModal
        isOpen={showScanModal}
        onClose={() => setShowScanModal(false)}
        tools={scanResults}
        onAddToWishlist={handleAddToWishlist}
      />
    </div>
  );
};

export default BakeBook;
