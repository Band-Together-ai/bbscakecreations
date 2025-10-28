import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Heart } from "lucide-react";
import { toast } from "sonner";
import { useUserRole } from "@/hooks/useUserRole";

interface BakingTool {
  id: string;
  name: string;
  description: string;
  category: string;
  affiliate_link: string;
  image_url: string;
  price_range: string;
  brandia_take: string;
  is_featured: boolean;
}

const Tools = () => {
  const [tools, setTools] = useState<BakingTool[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [categories, setCategories] = useState<string[]>([]);
  const { userId } = useUserRole();

  useEffect(() => {
    fetchTools();
  }, []);

  const fetchTools = async () => {
    const { data, error } = await supabase
      .from("baking_tools")
      .select("*")
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching tools:", error);
      return;
    }

    if (data) {
      setTools(data);
      const uniqueCategories = Array.from(new Set(data.map(t => t.category)));
      setCategories(uniqueCategories);
    }
  };

  const handleToolClick = async (tool: BakingTool) => {
    // Track click
    const { error } = await supabase
      .from("tool_clicks")
      .insert({
        tool_id: tool.id,
        user_id: userId,
        referrer_page: "/tools",
      });

    if (error) {
      console.error("Error tracking click:", error);
    }

    // Open affiliate link
    if (tool.affiliate_link) {
      window.open(tool.affiliate_link, "_blank");
    } else {
      toast.error("No link available for this product");
    }
  };

  const filteredTools = selectedCategory === "all" 
    ? tools 
    : tools.filter(t => t.category === selectedCategory);

  const featuredTools = tools.filter(t => t.is_featured);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-fredoka font-bold gradient-ocean bg-clip-text text-transparent">
              Brandia's Kitchen Essentials
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              The tools and ingredients I trust for every from-scratch creation
            </p>
          </div>

          {/* Featured Tools */}
          {featuredTools.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-fredoka font-bold flex items-center gap-2">
                <Heart className="w-6 h-6 text-coral fill-coral" />
                BB's Top Picks
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredTools.map(tool => (
                  <Card key={tool.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      {tool.image_url && (
                        <img 
                          src={tool.image_url} 
                          alt={tool.name}
                          className="w-full h-48 object-cover rounded-md mb-4"
                        />
                      )}
                      <CardTitle className="flex items-start justify-between gap-2">
                        <span>{tool.name}</span>
                        <Badge variant="default" className="shrink-0">Featured</Badge>
                      </CardTitle>
                      {tool.price_range && (
                        <CardDescription>{tool.price_range}</CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">{tool.description}</p>
                      {tool.brandia_take && (
                        <div className="bg-muted p-3 rounded-lg">
                          <p className="text-sm font-fredoka text-coral">
                            "BB says: {tool.brandia_take}"
                          </p>
                        </div>
                      )}
                      <Button 
                        onClick={() => handleToolClick(tool)}
                        className="w-full"
                      >
                        Shop Now <ExternalLink className="w-4 h-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              onClick={() => setSelectedCategory("all")}
            >
              All Tools
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

          {/* All Tools Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTools.map(tool => (
              <Card key={tool.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  {tool.image_url && (
                    <img 
                      src={tool.image_url} 
                      alt={tool.name}
                      className="w-full h-48 object-cover rounded-md mb-4"
                    />
                  )}
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle>{tool.name}</CardTitle>
                    <Badge variant="outline">{tool.category}</Badge>
                  </div>
                  {tool.price_range && (
                    <CardDescription>{tool.price_range}</CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{tool.description}</p>
                  {tool.brandia_take && (
                    <div className="bg-muted p-3 rounded-lg">
                      <p className="text-sm font-fredoka text-coral">
                        "BB says: {tool.brandia_take}"
                      </p>
                    </div>
                  )}
                  <Button 
                    onClick={() => handleToolClick(tool)}
                    variant="outline"
                    className="w-full"
                  >
                    View Product <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredTools.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No tools found in this category yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Tools;