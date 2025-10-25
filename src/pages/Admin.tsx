import { useEffect, useState, useRef } from "react";
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
import { Upload, Link as LinkIcon, Mic, Video, UserPlus, MessageSquare, Square } from "lucide-react";

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
  const [recipeCategory, setRecipeCategory] = useState("");
  const [recipeTags, setRecipeTags] = useState("");
  const [isGlutenFree, setIsGlutenFree] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  
  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  // Photo upload state
  const [uploadedPhotos, setUploadedPhotos] = useState<any[]>([]);
  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile settings state
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [bioText, setBioText] = useState("");
  const [profileSettingsId, setProfileSettingsId] = useState<string | null>(null);
  const profileFileInputRef = useRef<HTMLInputElement>(null);

  // TEMPORARILY DISABLED FOR TESTING
  useEffect(() => {
    // Skip auth check for testing
    setLoading(false);
    setIsAdmin(true);
    fetchUploadedPhotos();
    fetchProfileSettings();
  }, []);

  const fetchUploadedPhotos = async () => {
    const { data, error } = await supabase.storage
      .from('recipe-photos')
      .list('', { sortBy: { column: 'created_at', order: 'desc' } });

    if (error) {
      console.error("Error fetching photos:", error);
      return;
    }

    if (data) {
      const photosWithUrls = data.map(file => ({
        name: file.name,
        url: supabase.storage.from('recipe-photos').getPublicUrl(file.name).data.publicUrl
      }));
      setUploadedPhotos(photosWithUrls);
    }
  };

  const fetchProfileSettings = async () => {
    const { data, error } = await supabase
      .from("profile_settings")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("Error fetching profile settings:", error);
      return;
    }

    if (data) {
      setProfileSettingsId(data.id);
      setProfileImageUrl(data.profile_image_url || "");
      setBioText(data.bio_text || "");
    }
  };

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
      user_id: user?.id || null,
      title: recipeTitle,
      description: recipeDescription,
      instructions: recipeInstructions,
      category: recipeCategory || null,
      tags: recipeTags ? recipeTags.split(',').map(t => t.trim()) : null,
      image_url: selectedPhotoUrl || null,
      is_gluten_free: isGlutenFree,
      is_public: isPublic,
      is_featured: isFeatured,
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
    setRecipeCategory("");
    setRecipeTags("");
    setRecipeLink("");
    setSelectedPhotoUrl("");
    setIsGlutenFree(false);
    setIsPublic(false);
    setIsFeatured(false);
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    toast.info("Uploading photos...");

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('recipe-photos')
        .upload(fileName, file);

      if (uploadError) {
        console.error("Upload error:", uploadError);
        toast.error(`Failed to upload ${file.name}`);
      }
    }

    toast.success("Photos uploaded successfully!");
    fetchUploadedPhotos();
  };

  const handleVoiceRecording = async () => {
    if (!isRecording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          await transcribeAudio(audioBlob);
          stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorder.start();
        setIsRecording(true);
        toast.success("Recording started...");
      } catch (error) {
        console.error("Error starting recording:", error);
        toast.error("Could not access microphone");
      }
    } else {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
      }
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    try {
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      
      reader.onloadend = async () => {
        const base64Audio = (reader.result as string).split(',')[1];
        
        const { data, error } = await supabase.functions.invoke('transcribe-audio', {
          body: { audio: base64Audio }
        });

        if (error) {
          console.error("Transcription error:", error);
          toast.error("Failed to transcribe audio");
          return;
        }

        if (data?.text) {
          setRecipeDescription(prev => prev ? `${prev}\n${data.text}` : data.text);
          toast.success("Transcription added!");
        }
      };
    } catch (error) {
      console.error("Error transcribing audio:", error);
      toast.error("Failed to process audio");
    }
  };

  const handleProfilePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `profile_${Date.now()}.${fileExt}`;

    toast.info("Uploading profile photo...");

    const { error: uploadError, data } = await supabase.storage
      .from('profile-photos')
      .upload(fileName, file);

    if (uploadError) {
      console.error("Upload error:", uploadError);
      toast.error("Failed to upload photo");
      return;
    }

    const publicUrl = supabase.storage.from('profile-photos').getPublicUrl(fileName).data.publicUrl;
    setProfileImageUrl(publicUrl);

    // Auto-save to database
    const profileData = {
      profile_image_url: publicUrl,
      bio_text: bioText || null,
      updated_at: new Date().toISOString(),
    };

    let error;
    if (profileSettingsId) {
      const result = await supabase
        .from("profile_settings")
        .update(profileData)
        .eq("id", profileSettingsId);
      error = result.error;
    } else {
      const result = await supabase
        .from("profile_settings")
        .insert(profileData)
        .select()
        .single();
      error = result.error;
      if (!error && result.data) {
        setProfileSettingsId(result.data.id);
      }
    }

    if (error) {
      console.error("Save error:", error);
      toast.error("Photo uploaded but failed to save");
      return;
    }

    toast.success("Profile photo updated!");
  };

  const handleSaveProfileSettings = async () => {
    const profileData = {
      profile_image_url: profileImageUrl,
      bio_text: bioText || null,
      updated_at: new Date().toISOString(),
    };

    let error;
    if (profileSettingsId) {
      // Update existing
      const result = await supabase
        .from("profile_settings")
        .update(profileData)
        .eq("id", profileSettingsId);
      error = result.error;
    } else {
      // Insert new
      const result = await supabase
        .from("profile_settings")
        .insert(profileData)
        .select()
        .single();
      error = result.error;
      if (!error && result.data) {
        setProfileSettingsId(result.data.id);
      }
    }

    if (error) {
      toast.error("Failed to save profile settings");
      console.error(error);
      return;
    }

    toast.success("Profile settings saved successfully!");
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

                {uploadedPhotos.length > 0 && (
                  <div className="space-y-2">
                    <Label>Select a Photo for this Recipe</Label>
                    <div className="grid grid-cols-4 gap-3 max-h-48 overflow-y-auto p-2 border rounded-lg">
                      {uploadedPhotos.map((photo) => (
                        <div
                          key={photo.name}
                          onClick={() => setSelectedPhotoUrl(photo.url)}
                          className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                            selectedPhotoUrl === photo.url
                              ? 'border-ocean-wave ring-2 ring-ocean-wave'
                              : 'border-transparent hover:border-ocean-wave/50'
                          }`}
                        >
                          <img
                            src={photo.url}
                            alt={photo.name}
                            className="w-full h-20 object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="recipe-desc">Description (The Vibe)</Label>
                  <Textarea
                    id="recipe-desc"
                    placeholder="Velvety vanilla waves with a hidden mint surprise and real herb crown—can be made gluten-free!"
                    value={recipeDescription}
                    onChange={(e) => setRecipeDescription(e.target.value)}
                    rows={3}
                  />
                  <Button 
                    type="button"
                    variant={isRecording ? "destructive" : "outline"} 
                    size="sm" 
                    className="gap-2"
                    onClick={handleVoiceRecording}
                  >
                    {isRecording ? (
                      <>
                        <Square className="w-4 h-4" />
                        Stop Recording
                      </>
                    ) : (
                      <>
                        <Mic className="w-4 h-4" />
                        Dictate Description
                      </>
                    )}
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="recipe-category">Category</Label>
                    <Input
                      id="recipe-category"
                      placeholder="e.g., Base Recipe, Variation, Wedding Cake"
                      value={recipeCategory}
                      onChange={(e) => setRecipeCategory(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="recipe-tags">Tags (comma-separated)</Label>
                    <Input
                      id="recipe-tags"
                      placeholder="chocolate, vanilla, birthday"
                      value={recipeTags}
                      onChange={(e) => setRecipeTags(e.target.value)}
                    />
                  </div>
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
                      Make Public
                    </Label>
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={isFeatured}
                      onCheckedChange={setIsFeatured}
                      id="featured-recipe"
                    />
                    <Label htmlFor="featured-recipe" className="cursor-pointer">
                      Feature on Home Page
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
                  Upload your cake photos and link them to recipes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-ocean-wave/30 rounded-3xl p-12 text-center hover:border-ocean-wave transition-colors cursor-pointer"
                >
                  <Upload className="w-12 h-12 text-ocean-wave mx-auto mb-4" />
                  <h3 className="font-fredoka text-xl text-ocean-deep mb-2">
                    Drop your gorgeous cake photos here
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    or click to browse (JPG, PNG, HEIC)
                  </p>
                  <Button variant="outline">Browse Files</Button>
                </div>

                {uploadedPhotos.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="font-fredoka text-lg">Uploaded Photos ({uploadedPhotos.length})</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {uploadedPhotos.map((photo) => (
                        <div key={photo.name} className="relative group">
                          <img
                            src={photo.url}
                            alt={photo.name}
                            className="w-full aspect-square object-cover rounded-lg"
                          />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                            <p className="text-white text-xs p-2 text-center break-all">
                              {photo.name}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
                  <CardTitle className="font-fredoka">Profile Settings</CardTitle>
                  <CardDescription>
                    Edit your profile photo and about me section that appears on the homepage
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="profile-photo">Profile Photo</Label>
                    <input
                      ref={profileFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePhotoUpload}
                      className="hidden"
                    />
                    <div className="flex items-center gap-6">
                      {profileImageUrl && (
                        <div className="w-32 h-32 rounded-full overflow-hidden shadow-wave ring-4 ring-ocean-wave/20">
                          <img
                            src={profileImageUrl}
                            alt="Profile preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <Button 
                        variant="outline"
                        onClick={() => profileFileInputRef.current?.click()}
                        className="gap-2"
                      >
                        <Upload className="w-4 h-4" />
                        {profileImageUrl ? "Change Photo" : "Upload Photo"}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio-text">About Me</Label>
                    <Textarea
                      id="bio-text"
                      placeholder="Hi! I'm Brandia, the baker behind every scratch-made creation..."
                      value={bioText}
                      onChange={(e) => setBioText(e.target.value)}
                      rows={4}
                    />
                    <p className="text-xs text-muted-foreground">
                      This will appear in the "Meet Brandia" section at the bottom of the homepage
                    </p>
                  </div>

                  <Button
                    onClick={handleSaveProfileSettings}
                    className="w-full gradient-ocean text-primary-foreground"
                    size="lg"
                  >
                    Save Profile Settings
                  </Button>
                </CardContent>
              </Card>

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
