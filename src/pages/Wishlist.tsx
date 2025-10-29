import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useUserRole } from "@/hooks/useUserRole";
import { Heart, ExternalLink, Trash2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface WishlistItem {
  id: string;
  notes: string | null;
  priority: string | null;
  added_at: string;
  catalog_item: {
    id: string;
    title: string;
    description: string | null;
    image_url: string | null;
    price_estimate: string | null;
    category: string | null;
    primary_url: string;
  };
}

const Wishlist = () => {
  const navigate = useNavigate();
  const { canUseWishlists, isAuthenticated } = useUserRole();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [wishlistId, setWishlistId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }

    if (!canUseWishlists) {
      toast.error("Wishlists are available for Home Bakers Club members");
      navigate("/how-it-works");
      return;
    }

    fetchWishlist();
  }, [isAuthenticated, canUseWishlists]);

  const fetchWishlist = async () => {
    try {
      // Get or create wishlist
      let { data: wishlist } = await supabase
        .from("user_wishlists")
        .select("id")
        .single();

      if (!wishlist) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: newWishlist } = await supabase
          .from("user_wishlists")
          .insert({ user_id: user.id, name: "My Wishlist" })
          .select()
          .single();

        wishlist = newWishlist;
      }

      if (!wishlist) return;
      setWishlistId(wishlist.id);

      // Fetch wishlist items
      const { data, error } = await supabase
        .from("wishlist_items")
        .select(`
          id,
          notes,
          priority,
          added_at,
          catalog_item:affiliate_catalog(
            id,
            title,
            description,
            image_url,
            price_estimate,
            category,
            primary_url
          )
        `)
        .eq("wishlist_id", wishlist.id)
        .order("added_at", { ascending: false });

      if (error) throw error;
      setItems(data as any);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      toast.error("Failed to load wishlist");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from("wishlist_items")
        .delete()
        .eq("id", itemId);

      if (error) throw error;

      setItems(items.filter(item => item.id !== itemId));
      toast.success("Removed from wishlist");
    } catch (error) {
      console.error("Error removing item:", error);
      toast.error("Failed to remove item");
    }
  };

  const handleUpdateNotes = async (itemId: string, notes: string) => {
    try {
      const { error } = await supabase
        .from("wishlist_items")
        .update({ notes })
        .eq("id", itemId);

      if (error) throw error;

      setItems(items.map(item => 
        item.id === itemId ? { ...item, notes } : item
      ));
    } catch (error) {
      console.error("Error updating notes:", error);
      toast.error("Failed to update notes");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-muted-foreground">Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-fredoka gradient-ocean bg-clip-text text-transparent mb-4 flex items-center gap-3">
            <Heart className="w-10 h-10 text-coral fill-coral/20" />
            My Wishlist
          </h1>
          <p className="text-muted-foreground">
            {items.length} tool{items.length !== 1 ? 's' : ''} saved
          </p>
        </div>

        {/* Items Grid */}
        {items.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Heart className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">
                Your wishlist is empty
              </h3>
              <p className="text-muted-foreground mb-6">
                Save tools as you discover them in recipe recommendations!
              </p>
              <Button onClick={() => navigate("/bakebook")}>
                Go to BakeBook
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex gap-6">
                    {item.catalog_item.image_url && (
                      <div className="w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                        <img
                          src={item.catalog_item.image_url}
                          alt={item.catalog_item.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <h3 className="font-semibold text-lg mb-1">
                            {item.catalog_item.title}
                          </h3>
                          {item.catalog_item.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {item.catalog_item.description}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <Button
                            size="sm"
                            variant="outline"
                            asChild
                          >
                            <a
                              href={item.catalog_item.primary_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="gap-2"
                            >
                              <ExternalLink className="w-4 h-4" />
                              Shop
                            </a>
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemove(item.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 mb-3">
                        {item.catalog_item.category && (
                          <Badge variant="secondary">
                            {item.catalog_item.category}
                          </Badge>
                        )}
                        {item.catalog_item.price_estimate && (
                          <span className="text-sm font-medium text-ocean-deep">
                            {item.catalog_item.price_estimate}
                          </span>
                        )}
                        {item.priority && (
                          <Badge variant="outline">
                            {item.priority} priority
                          </Badge>
                        )}
                      </div>

                      <div className="mt-3">
                        <label className="text-xs font-medium text-muted-foreground block mb-1">
                          Notes
                        </label>
                        <Textarea
                          value={item.notes || ""}
                          onChange={(e) => handleUpdateNotes(item.id, e.target.value)}
                          placeholder="Add notes about why you want this tool..."
                          className="min-h-[60px] text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
