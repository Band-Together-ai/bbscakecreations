import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Heart, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useUserRole } from "@/hooks/useUserRole";

interface WellnessItem {
  id: string;
  name: string;
  description: string;
  category: string;
  image_url: string;
  brandia_pick: boolean;
  why_she_loves_it: string;
  affiliate_link: string;
}

const Wellness = () => {
  const [items, setItems] = useState<WellnessItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [categories, setCategories] = useState<string[]>([]);
  const { userId } = useUserRole();

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    const { data, error } = await supabase
      .from("wellness")
      .select("*")
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching wellness items:", error);
      return;
    }

    if (data) {
      setItems(data);
      const uniqueCategories = Array.from(new Set(data.map(i => i.category).filter(Boolean)));
      setCategories(uniqueCategories);
    }
  };

  const handleItemClick = async (item: WellnessItem) => {
    if (item.affiliate_link) {
      window.open(item.affiliate_link, "_blank");
    } else {
      toast.error("No link available for this product");
    }
  };

  const filteredItems = selectedCategory === "all" 
    ? items 
    : items.filter(i => i.category === selectedCategory);

  const brandiaGoTos = items.filter(i => i.brandia_pick);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-fredoka font-bold gradient-ocean bg-clip-text text-transparent">
              Wellness & Self-Care
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              The vitamins, skincare, and supplements that help me stay balanced
            </p>
          </div>

          {/* Brandia's Go-Tos */}
          {brandiaGoTos.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-fredoka font-bold flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-coral" />
                Brandia's Go-Tos
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {brandiaGoTos.map(item => (
                  <Card key={item.id} className="hover:shadow-lg transition-shadow border-coral/20">
                    <CardHeader>
                      {item.image_url && (
                        <img 
                          src={item.image_url} 
                          alt={item.name}
                          className="w-full h-48 object-cover rounded-md mb-4"
                        />
                      )}
                      <CardTitle className="flex items-start justify-between gap-2">
                        <span>{item.name}</span>
                        <Badge variant="default" className="shrink-0 bg-coral">
                          <Heart className="w-3 h-3 mr-1" />
                          Go-To
                        </Badge>
                      </CardTitle>
                      {item.category && (
                        <CardDescription className="capitalize">{item.category}</CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {item.description && (
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      )}
                      {item.why_she_loves_it && (
                        <div className="bg-muted p-3 rounded-lg border-l-4 border-coral">
                          <p className="text-sm font-fredoka text-foreground">
                            💕 {item.why_she_loves_it}
                          </p>
                        </div>
                      )}
                      <Button 
                        onClick={() => handleItemClick(item)}
                        className="w-full bg-coral hover:bg-coral/90"
                      >
                        Learn More <ExternalLink className="w-4 h-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Category Filter */}
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === "all" ? "default" : "outline"}
                onClick={() => setSelectedCategory("all")}
              >
                All Items
              </Button>
              {categories.map(cat => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? "default" : "outline"}
                  onClick={() => setSelectedCategory(cat)}
                  className="capitalize"
                >
                  {cat}
                </Button>
              ))}
            </div>
          )}

          {/* All Items Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.filter(i => !i.brandia_pick).map(item => (
              <Card key={item.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  {item.image_url && (
                    <img 
                      src={item.image_url} 
                      alt={item.name}
                      className="w-full h-48 object-cover rounded-md mb-4"
                    />
                  )}
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle>{item.name}</CardTitle>
                    {item.category && (
                      <Badge variant="outline" className="capitalize">{item.category}</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {item.description && (
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  )}
                  <Button 
                    onClick={() => handleItemClick(item)}
                    variant="outline"
                    className="w-full"
                  >
                    View Product <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No wellness items found in this category yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Wellness;
