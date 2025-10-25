import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Upload, Link as LinkIcon, Mic, Video, UserPlus, MessageSquare } from "lucide-react";

const Admin = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Recipe form state
  const [recipeTitle, setRecipeTitle] = useState("");
  const [recipeDescription, setRecipeDescription] = useState("");
  const [recipeLink, setRecipeLink] = useState("");
  const [recipeInstructions, setRecipeInstructions] = useState("");
  const [isGlutenFree, setIsGlutenFree] = useState(false);
  const [isPublic, setIsPublic] = useState(false);

  // TEMPORARILY DISABLED FOR TESTING
  useEffect(() => {
    // Skip auth check for testing
    setLoading(false);
    setIsAdmin(true);
  }, []);

  // const checkAuth = async () => {
  //   const { data: { session } } = await supabase.auth.getSession();
  //   
  //   if (!session) {
  //     navigate("/auth");
  //     return;
  //   }

  //   setUser(session.user);

  //   // Check if user is admin
  //   const { data: profile } = await supabase
  //     .from("profiles")
  //     .select("is_admin")
  //     .eq("id", session.user.id)
  //     .single();

  //   if (!profile?.is_admin) {
  //     toast.error("Access denied. Admin privileges required.");
  //     navigate("/");
  //     return;
  //   }

  //   setIsAdmin(true);
  //   setLoading(false);
  // };

  const handleSaveRecipe = async () => {
    if (!recipeTitle.trim()) {
      toast.error("Please add a recipe title");
      return;
    }

    const { error } = await supabase.from("recipes").insert({
      user_id: user.id,
      title: recipeTitle,
      description: recipeDescription,
      instructions: recipeInstructions,
      is_gluten_free: isGlutenFree,
      is_public: isPublic,
    });

    if (error) {
      toast.error("Failed to save recipe");
      console.error(error);
      return;
    }

    toast.success("Recipe saved successfully!");
    setRecipeTitle("");
    setRecipeDescription("");
    setRecipeInstructions("");
    setRecipeLink("");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-fredoka gradient-ocean bg-clip-text text-transparent mb-2">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">
            Hey Brandia! Manage your recipes, blog posts, and community—stupid simple, just like you asked. 🧁
          </p>
        </div>

        <Tabs defaultValue="recipes" className="space-y-6">
          <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full">
            <TabsTrigger value="recipes">Recipes</TabsTrigger>
            <TabsTrigger value="photos">Photos</TabsTrigger>
            <TabsTrigger value="blog">Blog</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* RECIPES TAB */}
          <TabsContent value="recipes">
            <Card>
              <CardHeader>
                <CardTitle className="font-fredoka">Add/Edit Recipe</CardTitle>
                <CardDescription>
                  Drag photos, paste links, or dictate—Sasha will help capture your magic
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="recipe-title">Recipe Title</Label>
                  <Input
                    id="recipe-title"
                    placeholder="e.g., Ocean Ombre Lavender Dream"
                    value={recipeTitle}
                    onChange={(e) => setRecipeTitle(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recipe-desc">Description (The Vibe)</Label>
                  <Textarea
                    id="recipe-desc"
                    placeholder="Velvety vanilla waves with a hidden mint surprise and real herb crown—can be made gluten-free!"
                    value={recipeDescription}
                    onChange={(e) => setRecipeDescription(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recipe-link">Paste Base Recipe Link (Optional)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="recipe-link"
                      placeholder="https://allrecipes.com/..."
                      value={recipeLink}
                      onChange={(e) => setRecipeLink(e.target.value)}
                    />
                    <Button variant="outline" size="icon">
                      <LinkIcon className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Sasha will import it and ask for your twists
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recipe-instructions">Instructions / My Twist</Label>
                  <Textarea
                    id="recipe-instructions"
                    placeholder="Swap oil for browned butter, double the cocoa, add a whisper of sea salt..."
                    value={recipeInstructions}
                    onChange={(e) => setRecipeInstructions(e.target.value)}
                    rows={6}
                  />
                  <div className="flex gap-2 mt-2">
                    <Button variant="outline" size="sm" className="gap-2">
                      <Mic className="w-4 h-4" />
                      Voice Input
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Upload className="w-4 h-4" />
                      Upload Photo
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-8 p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={isGlutenFree}
                      onCheckedChange={setIsGlutenFree}
                      id="gluten-free"
                    />
                    <Label htmlFor="gluten-free" className="cursor-pointer">
                      Gluten-Free (or Low-Gluten)
                    </Label>
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={isPublic}
                      onCheckedChange={setIsPublic}
                      id="public-recipe"
                    />
                    <Label htmlFor="public-recipe" className="cursor-pointer">
                      Make Public (Show teaser only until subscribed)
                    </Label>
                  </div>
                </div>

                <Button
                  onClick={handleSaveRecipe}
                  className="w-full gradient-ocean text-primary-foreground"
                  size="lg"
                >
                  Save Recipe
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* PHOTOS TAB */}
          <TabsContent value="photos">
            <Card>
              <CardHeader>
                <CardTitle className="font-fredoka">Photo Gallery Manager</CardTitle>
                <CardDescription>
                  Drag and drop your cake photos—auto-tags date, size, floral details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-ocean-wave/30 rounded-3xl p-12 text-center hover:border-ocean-wave transition-colors cursor-pointer">
                  <Upload className="w-12 h-12 text-ocean-wave mx-auto mb-4" />
                  <h3 className="font-fredoka text-xl text-ocean-deep mb-2">
                    Drop your gorgeous cake photos here
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    or click to browse (JPG, PNG, HEIC)
                  </p>
                  <Button variant="outline">Browse Files</Button>
                </div>
                <p className="text-sm text-muted-foreground mt-4 text-center">
                  Coming soon: Sasha will analyze each photo for texture, flavors, and decorations
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* BLOG TAB */}
          <TabsContent value="blog">
            <Card>
              <CardHeader>
                <CardTitle className="font-fredoka">Write a Blog Post</CardTitle>
                <CardDescription>
                  Share your baking journey, stories, and inspiration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="blog-title">Post Title</Label>
                  <Input
                    id="blog-title"
                    placeholder="That Time My Lemon Cake Healed a Breakup"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="blog-content">Your Story</Label>
                  <Textarea
                    id="blog-content"
                    placeholder="Start typing your story..."
                    rows={12}
                  />
                  <p className="text-xs text-muted-foreground">
                    Full WYSIWYG editor coming soon—for now, write your heart out!
                  </p>
                </div>
                <Button className="gradient-ocean text-primary-foreground" size="lg">
                  Publish Post
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* MEDIA TAB */}
          <TabsContent value="media">
            <Card>
              <CardHeader>
                <CardTitle className="font-fredoka">Video & Live Streaming</CardTitle>
                <CardDescription>
                  Embed YouTube/Vimeo videos or go live
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="video-url">YouTube or Vimeo Link</Label>
                  <div className="flex gap-2">
                    <Input
                      id="video-url"
                      placeholder="https://youtube.com/watch?v=..."
                    />
                    <Button variant="outline">
                      <Video className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="p-8 border-2 border-dashed border-coral/30 rounded-3xl text-center">
                  <Video className="w-16 h-16 text-coral mx-auto mb-4" />
                  <h3 className="font-fredoka text-xl text-ocean-deep mb-2">
                    Go Live!
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Stream your baking sessions—notify subscribers in real-time
                  </p>
                  <Button className="bg-coral text-white hover:bg-coral/90" size="lg">
                    🔴 START LIVE STREAM
                  </Button>
                  <p className="text-xs text-muted-foreground mt-4">
                    Live streaming integration coming soon
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SETTINGS TAB */}
          <TabsContent value="settings">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="font-fredoka">Collaborators</CardTitle>
                  <CardDescription>
                    Invite guest bakers to contribute recipes (you approve everything)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input placeholder="collaborator@email.com" />
                    <Button className="gap-2">
                      <UserPlus className="w-4 h-4" />
                      Invite
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    They'll get a mini-panel to upload their scratch specialties—you stay main admin
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="font-fredoka">Community Moderation</CardTitle>
                  <CardDescription>
                    Manage forum posts and comments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="gap-2">
                    <MessageSquare className="w-4 h-4" />
                    View Pending Posts
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
