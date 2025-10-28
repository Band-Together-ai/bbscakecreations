import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Instagram } from "lucide-react";

interface FavoriteBaker {
  id: string;
  name: string;
  website_url: string;
  instagram_handle: string;
  category: string;
  description: string;
  profile_image_url: string;
  is_featured: boolean;
}

const Favorites = () => {
  const [bakers, setBakers] = useState<FavoriteBaker[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    fetchBakers();
  }, []);

  const fetchBakers = async () => {
    const { data, error } = await supabase
      .from("favorite_bakers")
      .select("*")
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching bakers:", error);
      return;
    }

    if (data) {
      setBakers(data);
      const uniqueCategories = Array.from(
        new Set(data.map(b => b.category).filter(Boolean))
      );
      setCategories(uniqueCategories);
    }
  };

  const filteredBakers = selectedCategory === "all" 
    ? bakers 
    : bakers.filter(b => b.category === selectedCategory);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-fredoka font-bold gradient-ocean bg-clip-text text-transparent">
              Bakers We Love
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Talented creators who inspire us and share our passion for from-scratch baking
            </p>
          </div>

          {/* Category Filter */}
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center">
              <Button
                variant={selectedCategory === "all" ? "default" : "outline"}
                onClick={() => setSelectedCategory("all")}
              >
                All Bakers
              </Button>
              {categories.map(cat => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? "default" : "outline"}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </Button>
              ))}
            </div>
          )}

          {/* Bakers Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBakers.map(baker => (
              <Card key={baker.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  {baker.profile_image_url && (
                    <img 
                      src={baker.profile_image_url} 
                      alt={baker.name}
                      className="w-full h-48 object-cover rounded-md mb-4"
                    />
                  )}
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle>{baker.name}</CardTitle>
                    {baker.is_featured && (
                      <Badge variant="default">Featured</Badge>
                    )}
                  </div>
                  {baker.category && (
                    <CardDescription>{baker.category}</CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{baker.description}</p>
                  <div className="flex gap-2">
                    {baker.website_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => window.open(baker.website_url, "_blank")}
                      >
                        Visit Site <ExternalLink className="w-4 h-4 ml-2" />
                      </Button>
                    )}
                    {baker.instagram_handle && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => window.open(`https://instagram.com/${baker.instagram_handle.replace('@', '')}`, "_blank")}
                      >
                        <Instagram className="w-4 h-4 mr-2" />
                        Follow
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredBakers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No bakers found in this category yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Favorites;