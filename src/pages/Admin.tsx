import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Upload, Link as LinkIcon, Mic, Video, UserPlus, MessageSquare, Square, Trash2, Star, Loader2 } from "lucide-react";
import { UsersTab } from "@/components/admin/UsersTab";
import { ToolsTab } from "@/components/admin/ToolsTab";
import { PhotoManagementTab } from "@/components/admin/PhotoManagementTab";
import { WellnessTab } from "@/components/admin/WellnessTab";
import { FavoriteBakersTab } from "@/components/admin/FavoriteBakersTab";
import { EarlyBirdTab } from "@/components/admin/EarlyBirdTab";
import { SashaTrainingTab } from "@/components/admin/SashaTrainingTab";
import { InspirationTab } from "@/components/admin/InspirationTab";
import { ProfilePhotoEditor } from "@/components/admin/ProfilePhotoEditor";
import { ViewAsTab } from "@/components/admin/ViewAsTab";
import { CoffeeClicksTab } from "@/components/admin/CoffeeClicksTab";
import { RecipeTypeSelector } from "@/components/admin/RecipeTypeSelector";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Admin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin, userId, loading: roleLoading } = useUserRole();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("recipes");

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  // Photo upload state
  const [uploadedPhotos, setUploadedPhotos] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Recipe workflow with multi-photo support
  const [selectedPhotos, setSelectedPhotos] = useState<any[]>([]);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [recipePhotos, setRecipePhotos] = useState<any[]>([]);
  const [editingRecipe, setEditingRecipe] = useState<any | null>(null);
  
  // Current recipe form
  const [recipeTitle, setRecipeTitle] = useState("");
  const [recipeDescription, setRecipeDescription] = useState("");
  const [recipeLink, setRecipeLink] = useState("");
  const [isParsingRecipe, setIsParsingRecipe] = useState(false);
  const [recipeInstructions, setRecipeInstructions] = useState("");
  const [recipeCategory, setRecipeCategory] = useState("");
  const [recipeTags, setRecipeTags] = useState("");
  const [isGlutenFree, setIsGlutenFree] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [featuredPosition, setFeaturedPosition] = useState<number | null>(null);
  const [brandiaPick, setBrandiaPick] = useState(false);
  const [whySheLovesIt, setWhySheLovesIt] = useState("");
  const [recipeIngredients, setRecipeIngredients] = useState<any[]>([]);
  
  // Recipe type and base/frosting system state
  const [recipeType, setRecipeType] = useState<'complete' | 'base_cake' | 'frosting' | 'variant'>('complete');
  const [isFeaturedBase, setIsFeaturedBase] = useState(false);
  const [baseName, setBaseName] = useState("");
  const [baseRecipeId, setBaseRecipeId] = useState("");
  const [frostingRecipeId, setFrostingRecipeId] = useState("");
  const [variantNotes, setVariantNotes] = useState("");
  const [assemblyInstructions, setAssemblyInstructions] = useState("");
  const [showSeparationModal, setShowSeparationModal] = useState(false);
  const [parsedRecipeData, setParsedRecipeData] = useState<any>(null);

  // Profile settings state
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [bioText, setBioText] = useState("");
  const [storyText, setStoryText] = useState("");
  const [profileSettingsId, setProfileSettingsId] = useState<string | null>(null);
  const profileFileInputRef = useRef<HTMLInputElement>(null);

  // Support settings state
  const [venmoUsername, setVenmoUsername] = useState("");
  const [venmoDisplayName, setVenmoDisplayName] = useState("");
  const [supportMessage, setSupportMessage] = useState("");
  const [supportEnabled, setSupportEnabled] = useState(false);
  const [thankYouCount, setThankYouCount] = useState(0);
  const [supportSettingsId, setSupportSettingsId] = useState<string | null>(null);

  // Ratings state
  const [ratings, setRatings] = useState<any[]>([]);
  const [ratingsFilter, setRatingsFilter] = useState<'all' | 'pending' | 'approved'>('all');

  // About Me Photos state
  const [aboutPhotos, setAboutPhotos] = useState<any[]>([]);
  const [aboutPhotoCaption, setAboutPhotoCaption] = useState("");
  const [aboutPhotoPreview, setAboutPhotoPreview] = useState<string | null>(null);
  const [aboutPhotoFile, setAboutPhotoFile] = useState<File | null>(null);
  const aboutPhotoFileInputRef = useRef<HTMLInputElement>(null);

  // Dev bypass - set VITE_DEV_BYPASS_AUTH="true" in .env to skip auth during development
  const isDev = import.meta.env.DEV && import.meta.env.VITE_DEV_BYPASS_AUTH === 'true';

  // Auth check with redirect
  useEffect(() => {
    if (!roleLoading) {
      if (!isDev && !isAdmin) {
        toast.error("Access denied. Admin privileges required.");
        navigate('/auth');
        return;
      }
      
      setLoading(false);
      fetchUploadedPhotos();
      fetchProfileSettings();
      fetchRecipes();
      fetchRecipePhotos();
      fetchSupportSettings();
      fetchRatings();
      fetchAboutPhotos();
    }
  }, [isAdmin, roleLoading, navigate, isDev]);

  // Auto-load recipe for editing if editRecipe query param is present
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const editRecipeId = searchParams.get('editRecipe');
    
    if (editRecipeId && recipes.length > 0) {
      const recipeToEdit = recipes.find(r => r.id === editRecipeId);
      if (recipeToEdit) {
        setActiveTab("recipes"); // Switch to recipes tab
        handleEditRecipe(recipeToEdit);
        // Clear the query param after loading
        navigate('/admin', { replace: true });
      }
    }
  }, [location.search, recipes]);

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
      setStoryText(data.story_text || "");
    }
  };

  const fetchRecipes = async () => {
    const { data, error } = await supabase
      .from("recipes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching recipes:", error);
      return;
    }

    setRecipes(data || []);
  };

  const fetchRecipePhotos = async () => {
    const { data, error } = await supabase
      .from("recipe_photos")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching recipe photos:", error);
      return;
    }

    setRecipePhotos(data || []);
  };

  const getRecipePhotos = (recipeId: string) => {
    return recipePhotos.filter(p => p.recipe_id === recipeId);
  };

  const getHeadlinePhoto = (recipeId: string) => {
    return recipePhotos.find(p => p.recipe_id === recipeId && p.is_headline);
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

  const handleParseRecipe = async () => {
    if (!recipeLink.trim()) {
      toast.error("Please enter a recipe URL");
      return;
    }

    setIsParsingRecipe(true);
    try {
      const { data, error } = await supabase.functions.invoke('parse-recipe', {
        body: { url: recipeLink }
      });

      if (error) throw error;

      if (data.error) {
        toast.error(data.error);
        return;
      }

      // Check if separation was detected
      if (data.hasSeparation && data.confidence > 0.3) {
        setParsedRecipeData(data);
        setShowSeparationModal(true);
        return;
      }

      // No separation or low confidence - treat as complete recipe
      setRecipeIngredients(data.cakePart?.ingredients || data.ingredients || []);
      const ingredientsText = (data.cakePart?.ingredients || data.ingredients || [])
        .map((ing: any) => {
          const parts = [];
          if (ing.amount) parts.push(ing.amount);
          if (ing.unit) parts.push(ing.unit);
          parts.push(ing.ingredient);
          if (ing.notes) parts.push(`(${ing.notes})`);
          return parts.join(' ');
        })
        .join('\n');

      const instructionsText = (data.cakePart?.instructions || data.instructions || [])
        .map((step: string, index: number) => `${index + 1}. ${step}`)
        .join('\n\n');

      setRecipeInstructions(instructionsText);
      const currentDesc = recipeDescription.trim();
      const newDesc = `INGREDIENTS:\n${ingredientsText}${currentDesc ? '\n\n' + currentDesc : ''}`;
      setRecipeDescription(newDesc);

      toast.success("Recipe parsed! Review and modify as needed.");
    } catch (error) {
      console.error('Parse recipe error:', error);
      toast.error("Failed to parse recipe");
    } finally {
      setIsParsingRecipe(false);
    }
  };

  const handleSaveRecipe = async () => {
    if (!recipeTitle.trim()) {
      toast.error("Please add a recipe title");
      return;
    }

    if (selectedPhotos.length === 0 && !editingRecipe) {
      toast.error("Please select at least one photo for this recipe");
      return;
    }

    const recipeData = {
      user_id: userId || null,
      title: recipeTitle,
      description: recipeDescription,
      instructions: recipeInstructions + (recipeLink ? `\n\nBase recipe link: ${recipeLink}` : ''),
      ingredients: recipeIngredients.length > 0 ? recipeIngredients : null,
      category: recipeCategory || null,
      tags: recipeTags ? recipeTags.split(',').map(t => t.trim()) : null,
      is_gluten_free: isGlutenFree,
      is_public: isPublic,
      is_featured: isFeatured,
      featured_position: featuredPosition,
      brandia_pick: brandiaPick,
      why_she_loves_it: whySheLovesIt || null,
    };

    console.log('Saving recipe with ingredients:', recipeIngredients);
    console.log('Recipe data:', recipeData);

    let recipeId = editingRecipe?.id;

    if (editingRecipe) {
      const { error } = await supabase.from("recipes").update(recipeData).eq("id", editingRecipe.id);
      if (error) {
        toast.error("Failed to update recipe");
        console.error(error);
        return;
      }
    } else {
      const { data, error } = await supabase.from("recipes").insert(recipeData).select().single();
      if (error) {
        toast.error("Failed to save recipe");
        console.error(error);
        return;
      }
      recipeId = data.id;
    }

    // Add new photos to recipe_photos table
    if (selectedPhotos.length > 0 && recipeId) {
      const existingPhotos = recipePhotos.filter(p => p.recipe_id === recipeId);
      const isFirstPhoto = existingPhotos.length === 0;

      const photosData = selectedPhotos.map((photo, index) => ({
        recipe_id: recipeId,
        photo_url: photo.url,
        is_headline: isFirstPhoto && index === 0, // First photo is headline by default
      }));

      const { error: photosError } = await supabase.from("recipe_photos").insert(photosData);
      if (photosError) {
        toast.error("Recipe saved but failed to add photos");
        console.error(photosError);
      }
    }

    toast.success(editingRecipe ? "Recipe updated!" : "Recipe saved successfully!");
    clearRecipeForm();
    fetchRecipes();
    fetchRecipePhotos();
  };

  const clearRecipeForm = () => {
    setRecipeTitle("");
    setRecipeDescription("");
    setRecipeInstructions("");
    setRecipeIngredients([]);
    setRecipeCategory("");
    setRecipeTags("");
    setRecipeLink("");
    setIsGlutenFree(false);
    setIsPublic(false);
    setIsFeatured(false);
    setFeaturedPosition(null);
    setBrandiaPick(false);
    setWhySheLovesIt("");
    setSelectedPhotos([]);
    setEditingRecipe(null);
  };

  const handleEditRecipe = (recipe: any) => {
    setEditingRecipe(recipe);
    setRecipeTitle(recipe.title);
    setRecipeDescription(recipe.description || "");
    setRecipeCategory(recipe.category || "");
    setRecipeTags(recipe.tags?.join(', ') || "");
    setIsGlutenFree(recipe.is_gluten_free || false);
    setIsPublic(recipe.is_public || false);
    setIsFeatured(recipe.is_featured || false);
    setFeaturedPosition(recipe.featured_position || null);
    setBrandiaPick(recipe.brandia_pick || false);
    setWhySheLovesIt(recipe.why_she_loves_it || "");
    setRecipeIngredients(recipe.ingredients || []);
    
    // Extract link from instructions if present
    const linkMatch = recipe.instructions?.match(/Base recipe link: (.+)/);
    if (linkMatch) {
      setRecipeLink(linkMatch[1]);
      setRecipeInstructions(recipe.instructions.replace(/\n\nBase recipe link: .+/, ''));
    } else {
      setRecipeInstructions(recipe.instructions || "");
      setRecipeLink("");
    }
    
    setSelectedPhotos([]); // Clear selected photos when editing
    
    // Scroll to top to show the form
    window.scrollTo({ top: 0, behavior: 'smooth' });
    toast.info("Recipe loaded for editing - see form on left");
  };

  const handleDeleteRecipe = async (recipeId: string) => {
    if (!confirm("Are you sure you want to delete this recipe and all its photos?")) return;

    // Delete recipe_photos first (will cascade delete due to foreign key)
    const { error } = await supabase.from("recipes").delete().eq("id", recipeId);

    if (error) {
      toast.error("Failed to delete recipe");
      console.error(error);
      return;
    }

    toast.success("Recipe deleted!");
    fetchRecipes();
    fetchRecipePhotos();
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

  const handleDeletePhoto = async (fileName: string) => {
    if (!confirm("Delete this photo from storage?")) return;

    const { error } = await supabase.storage
      .from('recipe-photos')
      .remove([fileName]);

    if (error) {
      toast.error("Failed to delete photo");
      console.error(error);
      return;
    }

    toast.success("Photo deleted!");
    fetchUploadedPhotos();
  };

  const handleDeleteRecipePhoto = async (photoId: string) => {
    if (!confirm("Remove this photo from the recipe?")) return;

    const { error } = await supabase
      .from("recipe_photos")
      .delete()
      .eq("id", photoId);

    if (error) {
      toast.error("Failed to delete photo");
      console.error(error);
      return;
    }

    toast.success("Photo removed from recipe!");
    fetchRecipePhotos();
  };

  const handleSetHeadlinePhoto = async (photoId: string, recipeId: string) => {
    // First, unset all headline photos for this recipe
    await supabase
      .from("recipe_photos")
      .update({ is_headline: false })
      .eq("recipe_id", recipeId);

    // Then set this photo as headline
    const { error } = await supabase
      .from("recipe_photos")
      .update({ is_headline: true })
      .eq("id", photoId);

    if (error) {
      toast.error("Failed to set headline photo");
      console.error(error);
      return;
    }

    toast.success("Headline photo updated!");
    fetchRecipePhotos();
  };

  const togglePhotoSelection = (photo: any) => {
    const isSelected = selectedPhotos.some(p => p.name === photo.name);
    if (isSelected) {
      setSelectedPhotos(selectedPhotos.filter(p => p.name !== photo.name));
    } else {
      setSelectedPhotos([...selectedPhotos, photo]);
    }
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
      story_text: storyText || null,
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
      story_text: storyText || null,
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

  const fetchSupportSettings = async () => {
    const { data, error } = await supabase
      .from("support_settings")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("Error fetching support settings:", error);
      return;
    }

    if (data) {
      setSupportSettingsId(data.id);
      setVenmoUsername(data.venmo_username || "");
      setVenmoDisplayName(data.venmo_display_name || "");
      setSupportMessage(data.support_message || "");
      setSupportEnabled(data.is_enabled || false);
      setThankYouCount(data.thank_you_count || 0);
    }
  };

  const handleSaveSupportSettings = async () => {
    const supportData = {
      venmo_username: venmoUsername || null,
      venmo_display_name: venmoDisplayName || null,
      support_message: supportMessage || null,
      is_enabled: supportEnabled,
      updated_at: new Date().toISOString(),
    };

    let error;
    if (supportSettingsId) {
      const result = await supabase
        .from("support_settings")
        .update(supportData)
        .eq("id", supportSettingsId);
      error = result.error;
    } else {
      const result = await supabase
        .from("support_settings")
        .insert(supportData)
        .select()
        .single();
      error = result.error;
      if (!error && result.data) {
        setSupportSettingsId(result.data.id);
      }
    }

    if (error) {
      toast.error("Failed to save support settings");
      console.error(error);
      return;
    }

    toast.success("Support settings saved!");
    fetchSupportSettings();
  };

  const fetchRatings = async () => {
    const { data, error } = await supabase
      .from("recipe_ratings")
      .select(`
        *,
        recipes(title)
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching ratings:", error);
      return;
    }

    setRatings(data || []);
  };

  const handleApproveRating = async (ratingId: string) => {
    const { error } = await supabase
      .from("recipe_ratings")
      .update({ is_approved: true, admin_reviewed: true })
      .eq("id", ratingId);

    if (error) {
      toast.error("Failed to approve rating");
      console.error(error);
      return;
    }

    toast.success("Rating approved!");
    fetchRatings();
  };

  const handleDeleteRating = async (ratingId: string) => {
    if (!confirm("Delete this rating?")) return;

    const { error } = await supabase
      .from("recipe_ratings")
      .delete()
      .eq("id", ratingId);

    if (error) {
      toast.error("Failed to delete rating");
      console.error(error);
      return;
    }

    toast.success("Rating deleted!");
    fetchRatings();
  };

  const fetchAboutPhotos = async () => {
    const { data, error } = await supabase
      .from("about_photos")
      .select("*")
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching about photos:", error);
      return;
    }

    setAboutPhotos(data || []);
  };

  const handleAboutPhotoSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setAboutPhotoFile(file);
    
    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setAboutPhotoPreview(previewUrl);
    
    toast.success("Photo selected! Add a caption and click Save.");
  };

  const handleSaveAboutPhoto = async () => {
    if (!aboutPhotoFile) {
      toast.error("No photo selected");
      return;
    }

    if (!aboutPhotoCaption.trim()) {
      toast.error("Please enter a caption");
      return;
    }

    const fileExt = aboutPhotoFile.name.split('.').pop();
    const fileName = `about-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('profile-photos')
      .upload(fileName, aboutPhotoFile);

    if (uploadError) {
      toast.error("Upload failed");
      console.error(uploadError);
      return;
    }

    const publicUrl = supabase.storage.from('profile-photos').getPublicUrl(fileName).data.publicUrl;

    const { error: dbError } = await supabase
      .from("about_photos")
      .insert({
        photo_url: publicUrl,
        caption: aboutPhotoCaption,
        display_order: aboutPhotos.length
      });

    if (dbError) {
      toast.error("Failed to save photo");
      console.error(dbError);
      return;
    }

    toast.success("About Me photo added!");
    
    // Clean up preview
    if (aboutPhotoPreview) {
      URL.revokeObjectURL(aboutPhotoPreview);
    }
    setAboutPhotoCaption("");
    setAboutPhotoPreview(null);
    setAboutPhotoFile(null);
    fetchAboutPhotos();
  };

  const handleCancelAboutPhoto = () => {
    if (aboutPhotoPreview) {
      URL.revokeObjectURL(aboutPhotoPreview);
    }
    setAboutPhotoCaption("");
    setAboutPhotoPreview(null);
    setAboutPhotoFile(null);
  };

  const handleDeleteAboutPhoto = async (photoId: string) => {
    if (!confirm("Delete this photo?")) return;

    const { error } = await supabase
      .from("about_photos")
      .delete()
      .eq("id", photoId);

    if (error) {
      toast.error("Failed to delete photo");
      console.error(error);
      return;
    }

    toast.success("Photo deleted!");
    fetchAboutPhotos();
  };

  const handleUpdateAboutPhotoOrder = async (photoId: string, newOrder: number) => {
    const { error } = await supabase
      .from("about_photos")
      .update({ display_order: newOrder })
      .eq("id", photoId);

    if (error) {
      toast.error("Failed to update order");
      console.error(error);
      return;
    }

    fetchAboutPhotos();
  };

  const filteredRatings = ratings.filter(rating => {
    if (ratingsFilter === 'pending') return !rating.is_approved;
    if (ratingsFilter === 'approved') return rating.is_approved;
    return true;
  });

  if (roleLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ocean-wave mx-auto mb-4"></div>
          <p className="text-ocean-deep">Checking permissions...</p>
        </div>
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

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="w-full overflow-x-auto pb-2">
            <TabsList className="inline-flex flex-wrap w-full min-w-fit gap-1 h-auto p-2">
            <TabsTrigger value="recipes">Recipes</TabsTrigger>
            <TabsTrigger value="photos">Photos</TabsTrigger>
            <TabsTrigger value="photo-manage">Manage Photos</TabsTrigger>
            <TabsTrigger value="about">About Me</TabsTrigger>
            <TabsTrigger value="support">Support</TabsTrigger>
            <TabsTrigger value="ratings">Ratings</TabsTrigger>
            <TabsTrigger value="coffee">☕ Coffee Clicks</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="earlybird">Early Bird</TabsTrigger>
            <TabsTrigger value="sasha">Sasha Training</TabsTrigger>
            <TabsTrigger value="inspiration">Content I Love</TabsTrigger>
            <TabsTrigger value="tools">Tools</TabsTrigger>
            <TabsTrigger value="wellness">Wellness</TabsTrigger>
            <TabsTrigger value="bakers">Bakers</TabsTrigger>
            <TabsTrigger value="blog">Blog</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
            <TabsTrigger value="viewas">View As</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
          </div>

          {/* RECIPES TAB */}
          <TabsContent value="recipes">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Left: Recipe Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-fredoka">
                    {editingRecipe ? "Edit Recipe" : "Add Recipe"}
                  </CardTitle>
                  <CardDescription>
                    {editingRecipe 
                      ? "Update recipe details or add more photos" 
                      : selectedPhotos.length > 0
                        ? `${selectedPhotos.length} photo(s) selected - add details below`
                        : "Select photos from your gallery first"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Photo Selection - Optional */}
                  {uploadedPhotos.length > 0 ? (
                    <div className="space-y-2">
                      <Label>1. Select Photos for This Recipe (Optional)</Label>
                      <p className="text-xs text-muted-foreground">Click to select multiple photos. You can add photos later too.</p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[600px] overflow-y-auto p-2 border rounded-lg">
                        {uploadedPhotos.map((photo) => (
                          <div
                            key={photo.name}
                            onClick={() => togglePhotoSelection(photo)}
                            className={`group relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all w-full ${
                              selectedPhotos.some(p => p.name === photo.name)
                                ? 'border-ocean-wave ring-2 ring-ocean-wave'
                                : 'border-transparent hover:border-ocean-wave/50'
                            }`}
                          >
                            {/* Square ratio that's iOS-safe */}
                            <div className="pt-[100%]" />
                            <img
                              src={photo.url}
                              alt={photo.name}
                              className="absolute inset-0 w-full h-full object-cover block"
                            />
                            {selectedPhotos.some(p => p.name === photo.name) && (
                              <div className="absolute top-2 right-2 bg-ocean-wave text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                                ✓
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      {selectedPhotos.length > 0 && (
                        <p className="text-xs text-muted-foreground">
                          Selected: {selectedPhotos.length} photo(s)
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="p-4 border border-dashed rounded-lg bg-muted/30">
                      <p className="text-sm text-muted-foreground">
                        📸 No photos uploaded yet. <button onClick={() => setActiveTab('photos')} className="text-ocean-wave hover:underline font-medium">Upload photos</button> or add them later.
                      </p>
                    </div>
                  )}

                  {/* Recipe Form - Always visible */}
                  <div className="space-y-2">
                    <Label htmlFor="recipe-title">Recipe Title</Label>
                    <Input
                      id="recipe-title"
                      placeholder="e.g., Carrot Cake with Cream Cheese Frosting"
                      value={recipeTitle}
                      onChange={(e) => setRecipeTitle(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="recipe-desc">Description (The Vibe)</Label>
                    <Textarea
                      id="recipe-desc"
                      placeholder="Velvety vanilla waves with a hidden mint surprise and real herb crown..."
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
                          Dictate
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="recipe-link">Base Recipe Link (Optional)</Label>
                    <div className="flex gap-2">
                      <Input
                        id="recipe-link"
                        placeholder="https://allrecipes.com/..."
                        value={recipeLink}
                        onChange={(e) => setRecipeLink(e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={handleParseRecipe}
                        disabled={!recipeLink.trim() || isParsingRecipe}
                      >
                        {isParsingRecipe ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            Parsing...
                          </>
                        ) : (
                          "Parse"
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Paste a recipe URL and click Parse to auto-fill ingredients & instructions
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
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="recipe-category">Category</Label>
                      <Input
                        id="recipe-category"
                        placeholder="e.g., Wedding, Birthday"
                        value={recipeCategory}
                        onChange={(e) => setRecipeCategory(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="recipe-tags">Tags</Label>
                      <Input
                        id="recipe-tags"
                        placeholder="e.g., chocolate, birthday"
                        value={recipeTags}
                        onChange={(e) => setRecipeTags(e.target.value)}
                      />
                    </div>
                  </div>

                  <RecipeTypeSelector
                    recipeType={recipeType}
                    onRecipeTypeChange={(value) => setRecipeType(value as 'complete' | 'base_cake' | 'frosting' | 'variant')}
                    isFeaturedBase={isFeaturedBase}
                    onFeaturedBaseChange={setIsFeaturedBase}
                    baseName={baseName}
                    onBaseNameChange={setBaseName}
                    baseRecipeId={baseRecipeId}
                    onBaseRecipeIdChange={setBaseRecipeId}
                    frostingRecipeId={frostingRecipeId}
                    onFrostingRecipeIdChange={setFrostingRecipeId}
                    variantNotes={variantNotes}
                    onVariantNotesChange={setVariantNotes}
                    assemblyInstructions={assemblyInstructions}
                    onAssemblyInstructionsChange={setAssemblyInstructions}
                  />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="gluten-free">Gluten-Free Recipe</Label>
                      <Switch
                        id="gluten-free"
                        checked={isGlutenFree}
                        onCheckedChange={setIsGlutenFree}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="recipe-public">Make Recipe Public</Label>
                      <Switch
                        id="recipe-public"
                        checked={isPublic}
                        onCheckedChange={setIsPublic}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="recipe-featured">Mark as Featured</Label>
                      <Switch
                        id="recipe-featured"
                        checked={isFeatured}
                        onCheckedChange={setIsFeatured}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="brandia-pick">Brandia's Pick</Label>
                      <Switch
                        id="brandia-pick"
                        checked={brandiaPick}
                        onCheckedChange={setBrandiaPick}
                      />
                    </div>
                  </div>

                  {brandiaPick && (
                    <div className="space-y-2">
                      <Label htmlFor="why-she-loves-it">Why She Loves It</Label>
                      <Textarea
                        id="why-she-loves-it"
                        value={whySheLovesIt}
                        onChange={(e) => setWhySheLovesIt(e.target.value)}
                        placeholder="e.g., This is my go-to base for every celebration!"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Landing Page Position</Label>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full justify-between">
                          {featuredPosition 
                            ? featuredPosition === 1 
                              ? "Position 1 - Featured Cake ✨"
                              : `Position ${featuredPosition}`
                            : "Not on landing page"}
                          <Star className="ml-2 h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-full">
                        <DropdownMenuItem onClick={() => setFeaturedPosition(null)}>
                          Not on landing page
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setFeaturedPosition(1)}>
                          Position 1 - Featured Cake ✨
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setFeaturedPosition(2)}>
                          Position 2
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setFeaturedPosition(3)}>
                          Position 3
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setFeaturedPosition(4)}>
                          Position 4
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setFeaturedPosition(5)}>
                          Position 5
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setFeaturedPosition(6)}>
                          Position 6
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <p className="text-xs text-muted-foreground">
                      Position 1 is the special "Featured Cake" spot on the homepage
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={handleSaveRecipe}
                      className="flex-1 gradient-ocean text-primary-foreground"
                      size="lg"
                      disabled={!recipeTitle.trim()}
                    >
                      {editingRecipe ? "Update Recipe" : "Save Recipe"}
                    </Button>
                    {editingRecipe && (
                      <Button
                        onClick={clearRecipeForm}
                        variant="outline"
                        size="lg"
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Right: Saved Recipes */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-fredoka">Saved Recipes ({recipes.length})</CardTitle>
                  <CardDescription>
                    Edit or delete your recipes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {recipes.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No recipes yet. Add your first one!
                    </p>
                  ) : (
                    <ScrollArea className="h-[800px]">
                      <div className="space-y-4 pr-4">
                        {recipes.map((recipe) => {
                          const recipePhotosData = getRecipePhotos(recipe.id);
                          const headlinePhoto = getHeadlinePhoto(recipe.id);
                          
                          return (
                            <Card key={recipe.id} className="overflow-hidden">
                              <div className="p-4 space-y-4">
                                {/* Recipe Header */}
                                <div className="flex gap-4">
                                  {headlinePhoto && (
                                    <img
                                      src={headlinePhoto.photo_url}
                                      alt={recipe.title}
                                      className="w-24 h-24 object-cover rounded-lg"
                                    />
                                  )}
                                  <div className="flex-1 space-y-2">
                                    <h3 className="font-fredoka text-lg">{recipe.title}</h3>
                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                      {recipe.description}
                                    </p>
                                     <div className="flex gap-2 flex-wrap">
                                      {recipe.is_public && (
                                        <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                                          Public
                                        </span>
                                      )}
                                      {recipe.is_gluten_free && (
                                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                                          GF
                                        </span>
                                      )}
                                      {recipe.is_featured && (
                                        <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded">
                                          Featured
                                        </span>
                                      )}
                                      {recipe.featured_position && (
                                        <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded flex items-center gap-1">
                                          <Star className="w-3 h-3" />
                                          {recipe.featured_position === 1 ? "Featured Cake" : `Landing #${recipe.featured_position}`}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* Photo Gallery */}
                                {recipePhotosData.length > 0 && (
                                  <div className="space-y-2">
                                    <Label className="text-xs">Photo Gallery ({recipePhotosData.length})</Label>
                                    <div className="grid grid-cols-4 gap-2">
                                      {recipePhotosData.map((photo) => (
                                        <div key={photo.id} className="relative group">
                                          <img
                                            src={photo.photo_url}
                                            alt="Recipe photo"
                                            className="w-full aspect-square object-cover rounded border-2"
                                            style={{
                                              borderColor: photo.is_headline ? 'rgb(59, 130, 246)' : 'transparent'
                                            }}
                                          />
                                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded flex flex-col items-center justify-center gap-1">
                                            {!photo.is_headline && (
                                              <Button
                                                size="sm"
                                                variant="secondary"
                                                className="text-xs h-6 px-2"
                                                onClick={() => handleSetHeadlinePhoto(photo.id, recipe.id)}
                                              >
                                                Set Headline
                                              </Button>
                                            )}
                                            {photo.is_headline && (
                                              <span className="text-xs text-white bg-blue-500 px-2 py-1 rounded">
                                                Headline
                                              </span>
                                            )}
                                            <Button
                                              size="sm"
                                              variant="destructive"
                                              className="text-xs h-6 px-2"
                                              onClick={() => handleDeleteRecipePhoto(photo.id)}
                                            >
                                              Remove
                                            </Button>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleEditRecipe(recipe)}
                                  >
                                    Edit Details
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setEditingRecipe(recipe);
                                      setSelectedPhotos([]);
                                    }}
                                  >
                                    + Add Photos
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleDeleteRecipe(recipe.id)}
                                  >
                                    Delete Recipe
                                  </Button>
                                </div>
                              </div>
                            </Card>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* PHOTOS TAB */}
          <TabsContent value="photos">
            <Card>
              <CardHeader>
                <CardTitle className="font-fredoka">Photo Gallery Manager</CardTitle>
                <CardDescription>
                  Upload your cake photos - then go to Recipes tab to add details
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
                  <Button variant="outline" type="button">Browse Files</Button>
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
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeletePhoto(photo.name)}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* PHOTO MANAGEMENT TAB */}
          <TabsContent value="photo-manage">
            <Card>
              <CardHeader>
                <CardTitle className="font-fredoka">Photo Management</CardTitle>
                <CardDescription>
                  Move photos between buckets (Recipe Photos, Profile Photos, Product Photos) or delete them
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PhotoManagementTab />
              </CardContent>
            </Card>
          </TabsContent>

          {/* ABOUT ME PHOTOS TAB */}
          <TabsContent value="about">
            <Card>
              <CardHeader>
                <CardTitle className="font-fredoka">About Me Photos & Captions</CardTitle>
                <CardDescription>
                  Manage the photo carousel that appears on your About page
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="font-fredoka text-sm mb-3">Add New Photo</h3>
                  
                  {!aboutPhotoPreview ? (
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground mb-2">
                        Step 1: Upload a photo, then you'll add a caption
                      </p>
                      <input
                        ref={aboutPhotoFileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAboutPhotoSelect}
                        className="hidden"
                      />
                      <Button
                        onClick={() => aboutPhotoFileInputRef.current?.click()}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Photo
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Photo Preview</Label>
                        <img
                          src={aboutPhotoPreview}
                          alt="Preview"
                          className="w-full max-w-md rounded-lg border-2 border-border"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="about-caption" className="text-sm font-medium">
                          Caption <span className="text-coral">*</span>
                        </Label>
                        <Textarea
                          id="about-caption"
                          placeholder="Behind every cake is a story and a dream..."
                          value={aboutPhotoCaption}
                          onChange={(e) => setAboutPhotoCaption(e.target.value)}
                          rows={2}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={handleSaveAboutPhoto}
                          disabled={!aboutPhotoCaption.trim()}
                        >
                          Save Photo
                        </Button>
                        <Button
                          variant="outline"
                          onClick={handleCancelAboutPhoto}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {aboutPhotos.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="font-fredoka text-lg">Current Photos ({aboutPhotos.length})</h3>
                    <div className="space-y-4">
                      {aboutPhotos.map((photo, index) => (
                        <Card key={photo.id}>
                          <CardContent className="p-4">
                            <div className="flex gap-4">
                              <img
                                src={photo.photo_url}
                                alt={photo.caption}
                                className="w-32 h-32 object-cover rounded-lg"
                              />
                              <div className="flex-1 space-y-2">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <p className="font-fredoka text-sm text-muted-foreground">
                                      Position: {index + 1}
                                    </p>
                                    <p className="text-sm mt-1">{photo.caption}</p>
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleDeleteAboutPhoto(photo.id)}
                                  >
                                    Delete
                                  </Button>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    disabled={index === 0}
                                    onClick={() => handleUpdateAboutPhotoOrder(photo.id, photo.display_order - 1)}
                                  >
                                    ↑ Move Up
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    disabled={index === aboutPhotos.length - 1}
                                    onClick={() => handleUpdateAboutPhotoOrder(photo.id, photo.display_order + 1)}
                                  >
                                    ↓ Move Down
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* SUPPORT SETTINGS TAB */}
          <TabsContent value="support">
            <Card>
              <CardHeader>
                <CardTitle className="font-fredoka">Support Settings</CardTitle>
                <CardDescription>
                  Configure your "Buy Me a Coffee" style Venmo support section
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                  <Switch
                    checked={supportEnabled}
                    onCheckedChange={setSupportEnabled}
                    id="support-enabled"
                  />
                  <div>
                    <Label htmlFor="support-enabled" className="cursor-pointer font-medium">
                      Enable Support Section
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Show the support section on recipe detail pages
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="venmo-username">Venmo Username</Label>
                  <Input
                    id="venmo-username"
                    placeholder="e.g., Brandia-Smith"
                    value={venmoUsername}
                    onChange={(e) => setVenmoUsername(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Your Venmo handle (without the @)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="venmo-display">Display Name</Label>
                  <Input
                    id="venmo-display"
                    placeholder="e.g., Brandia Smith"
                    value={venmoDisplayName}
                    onChange={(e) => setVenmoDisplayName(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    How your name appears on the button
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="support-message">Support Message</Label>
                  <Textarea
                    id="support-message"
                    placeholder="If you enjoyed this recipe and want to support my baking journey..."
                    value={supportMessage}
                    onChange={(e) => setSupportMessage(e.target.value)}
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground">
                    Personal message shown in the support section
                  </p>
                </div>

                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-green-900">Thank You Count</p>
                      <p className="text-sm text-green-700">Total support button clicks</p>
                    </div>
                    <div className="text-3xl font-bold text-green-600">
                      {thankYouCount}
                    </div>
                  </div>
                </div>

                {supportEnabled && venmoUsername && (
                  <div className="p-4 border-2 border-dashed rounded-lg">
                    <p className="text-sm font-medium mb-3">Preview:</p>
                    <div className="space-y-3 p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
                      <p className="text-sm">
                        {supportMessage || "If you enjoyed this recipe and want to support my baking journey, I'd be grateful for any contribution! 💕"}
                      </p>
                      <div className="flex gap-2">
                        <Button className="bg-[#008CFF] hover:bg-[#0074D9]" disabled>
                          💙 Tip ${5} on Venmo
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {thankYouCount} people have shown their support
                      </p>
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleSaveSupportSettings}
                  className="w-full gradient-ocean text-primary-foreground"
                  size="lg"
                >
                  Save Support Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* RECIPE RATINGS TAB */}
          <TabsContent value="ratings">
            <Card>
              <CardHeader>
                <CardTitle className="font-fredoka">Recipe Ratings</CardTitle>
                <CardDescription>
                  Review and moderate recipe ratings (3 stars or less require approval)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex gap-2">
                  <Button
                    variant={ratingsFilter === 'all' ? 'default' : 'outline'}
                    onClick={() => setRatingsFilter('all')}
                  >
                    All ({ratings.length})
                  </Button>
                  <Button
                    variant={ratingsFilter === 'pending' ? 'default' : 'outline'}
                    onClick={() => setRatingsFilter('pending')}
                  >
                    Pending ({ratings.filter(r => !r.is_approved).length})
                  </Button>
                  <Button
                    variant={ratingsFilter === 'approved' ? 'default' : 'outline'}
                    onClick={() => setRatingsFilter('approved')}
                  >
                    Approved ({ratings.filter(r => r.is_approved).length})
                  </Button>
                </div>

                <ScrollArea className="h-[600px]">
                  {filteredRatings.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No ratings yet
                    </p>
                  ) : (
                    <div className="space-y-4 pr-4">
                      {filteredRatings.map((rating) => (
                        <Card key={rating.id} className={!rating.is_approved ? 'border-yellow-300 bg-yellow-50' : ''}>
                          <CardContent className="p-4">
                            <div className="space-y-3">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <div className="flex">
                                      {[...Array(5)].map((_, i) => (
                                        <Star
                                          key={i}
                                          className={`w-4 h-4 ${
                                            i < rating.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                                          }`}
                                        />
                                      ))}
                                    </div>
                                    <span className="font-medium">{rating.user_name}</span>
                                    {!rating.is_approved && (
                                      <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                                        Pending Review
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-muted-foreground mb-2">
                                    {rating.recipes?.title || 'Unknown Recipe'}
                                  </p>
                                  <p className="text-sm">{rating.review_text}</p>
                                  <p className="text-xs text-muted-foreground mt-2">
                                    {new Date(rating.created_at).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                {!rating.is_approved && (
                                  <Button
                                    size="sm"
                                    onClick={() => handleApproveRating(rating.id)}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    Approve
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleDeleteRating(rating.id)}
                                >
                                  Delete
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </ScrollArea>
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

          {/* COFFEE CLICKS TAB */}
          <TabsContent value="coffee">
            <CoffeeClicksTab />
          </TabsContent>

          {/* USERS TAB */}
          <TabsContent value="users">
            <UsersTab />
          </TabsContent>

          {/* EARLY BIRD TAB */}
          <TabsContent value="earlybird">
            <EarlyBirdTab />
          </TabsContent>

          {/* SASHA TRAINING TAB */}
          <TabsContent value="sasha">
            <SashaTrainingTab />
          </TabsContent>

          {/* CONTENT I LOVE TAB */}
          <TabsContent value="inspiration">
            <InspirationTab />
          </TabsContent>

          {/* TOOLS TAB */}
          <TabsContent value="tools">
            <ToolsTab />
          </TabsContent>

          {/* WELLNESS TAB */}
          <TabsContent value="wellness">
            <WellnessTab />
          </TabsContent>

          {/* BAKERS TAB */}
          <TabsContent value="bakers">
            <FavoriteBakersTab />
          </TabsContent>

          {/* VIEW AS TAB */}
          <TabsContent value="viewas">
            <ViewAsTab />
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
                    <Label htmlFor="bio-text">About Me (Homepage)</Label>
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

                  <div className="space-y-2">
                    <Label htmlFor="story-text">My Story (About Page)</Label>
                    <Textarea
                      id="story-text"
                      placeholder="Hi, I'm Brandia—a baker who believes cakes should tell stories..."
                      value={storyText}
                      onChange={(e) => setStoryText(e.target.value)}
                      rows={10}
                    />
                    <p className="text-xs text-muted-foreground">
                      This will appear in the "My Story" section on the About page. Use line breaks to separate paragraphs.
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

              {/* Profile Photo Position Editor */}
              <ProfilePhotoEditor />

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
