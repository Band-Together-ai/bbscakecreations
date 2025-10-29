import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import WaveBackground from "@/components/WaveBackground";
import Navigation from "@/components/Navigation";
import { ArrowRight, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Sparkles, Heart, Wheat } from "lucide-react";

import logoSquare from "@/assets/logo-square-transparent.png";
import { supabase } from "@/integrations/supabase/client";
import heroCake from "@/assets/hero-cake.jpg";
import brandiaProfile from "@/assets/brandia-profile.jpg";
import cake1 from "@/assets/cake-1.jpg";
import cake2 from "@/assets/cake-2.jpg";
import cake3 from "@/assets/cake-3.jpg";
import cake4 from "@/assets/cake-4.jpg";
import cake5 from "@/assets/cake-5.jpg";
import cake6 from "@/assets/cake-6.jpg";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const navigate = useNavigate();
  const [featuredCakes, setFeaturedCakes] = useState<any[]>([]);
  const [profileImage, setProfileImage] = useState(brandiaProfile);
  const [profileBio, setProfileBio] = useState(
    "Hi! I'm Brandia, the baker behind every scratch-made creation you see here. From ocean-inspired ombres to delicate herb-adorned layers, I believe every cake should tell a story—your story. Whether you need gluten-free magic or a classic from-scratch masterpiece, I'm here to bring your vision to life."
  );
  
  const location = useLocation();
  const isEditMode = new URLSearchParams(location.search).get("logoedit") === "1";
  const isSettingsMode = new URLSearchParams(location.search).get("settings") === "1";
  
  // Hero text box settings
  const [heroText, setHeroText] = useState(
    "Where every cake is baked from scratch with love, adorned with live flowers, and crafted to tell your story. Most cakes can be made gluten-free or low-gluten. No box mixes. No fondant. Just pure magic."
  );
  const [heroBoxPaddingTop, setHeroBoxPaddingTop] = useState<number>(80);
  const [heroBoxPadding, setHeroBoxPadding] = useState<number>(16);
  const { toast } = useToast();

  const [isMobileAtLoad, setIsMobileAtLoad] = useState(false);
  const [xMobile, setXMobile] = useState<number>(-40);
  const [xDesktop, setXDesktop] = useState<number>(60);
  const [logoSize, setLogoSize] = useState<number>(160);
  const [logoTop, setLogoTop] = useState<number>(-80);
  const [profileSettingsId, setProfileSettingsId] = useState<string | null>(null);
  const [editDevice, setEditDevice] = useState<'mobile' | 'desktop'>("mobile");

  // Profile photo positioning
  const [profilePhotoScale, setProfilePhotoScale] = useState<number>(100);
  const [profilePhotoX, setProfilePhotoX] = useState<number>(50);
  const [profilePhotoY, setProfilePhotoY] = useState<number>(50);

  const draggingRef = useRef(false);
  const startRef = useRef<{ x: number; y: number; startX: number; startTop: number } | null>(null);

  useEffect(() => {
    const mobile = window.innerWidth < 768;
    setIsMobileAtLoad(mobile);
    setEditDevice(mobile ? 'mobile' : 'desktop');
  }, []);

  const defaultCakes = [
    {
      image: cake1,
      title: "Herb Garden Dream",
      description: "Fluffy vanilla with fresh mint and edible flowers—can be made gluten-free without compromising texture",
    },
    {
      image: cake2,
      title: "Rosemary Sea Salt Fudge",
      description: "Decadent chocolate with a whisper of rosemary and sea salt crystals",
    },
    {
      image: cake3,
      title: "Lemon Blueberry Sunrise",
      description: "Bright citrus layers with bursting berries and cream cheese dreams",
    },
    {
      image: cake4,
      title: "Whimsical Birthday Swirl",
      description: "Ocean-inspired ombre with live pansies—every layer tells a story",
    },
    {
      image: cake5,
      title: "Naked Strawberry Lavender",
      description: "Almond flour layers with fresh berries and lavender blooms—rustic perfection",
    },
    {
      image: cake6,
      title: "Classic Red Velvet",
      description: "Velvety cocoa layers with tangy cream cheese—pure from-scratch love",
    },
  ];

  useEffect(() => {
    fetchFeaturedRecipes();
    fetchProfileSettings();
  }, []);

  const handleCakeClick = (recipeId?: string) => {
    if (recipeId) {
      navigate(`/recipe/${recipeId}`);
    } else {
      navigate("/recipes");
    }
  };

  const fetchProfileSettings = async () => {
    const { data } = await supabase
      .from("profile_settings")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data) {
      setProfileSettingsId(data.id);
      if (data.profile_image_url) setProfileImage(data.profile_image_url);
      if (data.bio_text) setProfileBio(data.bio_text);
      if (data.logo_size !== null && data.logo_size !== undefined) setLogoSize(data.logo_size);
      if (data.logo_top !== null && data.logo_top !== undefined) setLogoTop(data.logo_top);
      if (data.logo_x_mobile !== null && data.logo_x_mobile !== undefined) setXMobile(data.logo_x_mobile);
      if (data.logo_x_desktop !== null && data.logo_x_desktop !== undefined) setXDesktop(data.logo_x_desktop);
      if (data.hero_text) setHeroText(data.hero_text);
      if (data.hero_box_padding_top !== null && data.hero_box_padding_top !== undefined) setHeroBoxPaddingTop(data.hero_box_padding_top);
      if (data.hero_box_padding !== null && data.hero_box_padding !== undefined) setHeroBoxPadding(data.hero_box_padding);
      
      // Profile photo positioning
      if (data.profile_photo_scale !== null && data.profile_photo_scale !== undefined) setProfilePhotoScale(data.profile_photo_scale);
      if (data.profile_photo_x !== null && data.profile_photo_x !== undefined) setProfilePhotoX(data.profile_photo_x);
      if (data.profile_photo_y !== null && data.profile_photo_y !== undefined) setProfilePhotoY(data.profile_photo_y);
    }
  };

  const fetchFeaturedRecipes = async () => {
    // Step 1: Get the single Featured Cake (position 1)
    const { data: featuredData } = await supabase
      .from("recipes")
      .select(`
        *,
        recipe_photos(photo_url, is_headline)
      `)
      .eq("featured_position", 1)
      .eq("is_public", true)
      .maybeSingle();

    // Step 2: Get public recipes (excluding the featured one)
    const { data: publicData } = await supabase
      .from("recipes")
      .select(`
        *,
        recipe_photos(photo_url, is_headline)
      `)
      .eq("is_public", true)
      .order("created_at", { ascending: false })
      .limit(6);

    const mapRecipe = (recipe: any) => {
      let image = recipe.image_url;
      if (!image && recipe.recipe_photos && recipe.recipe_photos.length > 0) {
        const headlinePhoto = recipe.recipe_photos.find((p: any) => p.is_headline);
        image = headlinePhoto?.photo_url || recipe.recipe_photos[0].photo_url;
      }
      return {
        id: recipe.id,
        image: image || cake1,
        title: recipe.title,
        description: recipe.description || "",
      };
    };

    // Step 3: Build the 6-tile list: [featured, then up to 5 public]
    const cakesArray: any[] = [];
    
    if (featuredData) {
      cakesArray.push(mapRecipe(featuredData));
    }

    if (publicData) {
      // Add public recipes, excluding featured if it was found
      const publicRecipes = publicData
        .filter(r => !featuredData || r.id !== featuredData.id)
        .slice(0, featuredData ? 5 : 6)
        .map(mapRecipe);
      
      cakesArray.push(...publicRecipes);
    }

    if (cakesArray.length > 0) {
      setFeaturedCakes(cakesArray);
    }
  };

  const saveLogoSettings = async () => {
    const payload = {
      logo_top: Math.round(logoTop),
      logo_size: Math.round(logoSize),
      logo_x_mobile: Math.round(xMobile),
      logo_x_desktop: Math.round(xDesktop),
    };

    if (profileSettingsId) {
      await supabase.from("profile_settings").update(payload).eq("id", profileSettingsId);
    } else {
      const { data } = await supabase
        .from("profile_settings")
        .insert(payload)
        .select("id")
        .maybeSingle();
      if (data?.id) setProfileSettingsId(data.id);
    }

    toast({ title: "Logo position saved", description: "Your logo is now locked in place." });
    navigate(location.pathname, { replace: true });
  };

  const cancelEdit = async () => {
    await fetchProfileSettings();
    toast({ title: "Edit cancelled", description: "Reverted to last saved position." });
    navigate(location.pathname, { replace: true });
  };

  const saveHeroSettings = async () => {
    const payload = {
      hero_text: heroText,
      hero_box_padding_top: Math.round(heroBoxPaddingTop),
      hero_box_padding: Math.round(heroBoxPadding),
    };

    if (profileSettingsId) {
      await supabase.from("profile_settings").update(payload).eq("id", profileSettingsId);
    } else {
      const { data } = await supabase
        .from("profile_settings")
        .insert(payload)
        .select("id")
        .maybeSingle();
      if (data?.id) setProfileSettingsId(data.id);
    }

    toast({ title: "Hero settings saved", description: "Your hero text box is updated." });
    navigate(location.pathname, { replace: true });
  };

  const cancelHeroSettings = async () => {
    await fetchProfileSettings();
    toast({ title: "Settings cancelled", description: "Reverted to last saved settings." });
    navigate(location.pathname, { replace: true });
  };

  const cakes = featuredCakes.length > 0 ? featuredCakes : defaultCakes;

  return (
    <div className="min-h-screen relative overflow-hidden">
      <Navigation />
      <WaveBackground />

      {/* Edit Mode Controls */}
      {isEditMode && (
        <div className="fixed top-20 right-4 z-50 bg-card/95 backdrop-blur-sm border border-border rounded-lg p-4 shadow-lg space-y-3 max-w-xs">
          <h3 className="font-fredoka text-sm font-bold text-foreground">Logo Editor</h3>
          
          {/* Device Toggle */}
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={editDevice === 'mobile' ? 'default' : 'outline'}
              onClick={() => setEditDevice('mobile')}
              className="flex-1"
            >
              Mobile
            </Button>
            <Button
              size="sm"
              variant={editDevice === 'desktop' ? 'default' : 'outline'}
              onClick={() => setEditDevice('desktop')}
              className="flex-1"
            >
              Desktop
            </Button>
          </div>

          {/* Nudge Controls */}
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Nudge (16px)</p>
            <div className="grid grid-cols-3 gap-1">
              <div></div>
              <Button
                size="icon"
                variant="outline"
                onClick={() => setLogoTop(logoTop - 16)}
              >
                <ChevronUp className="w-4 h-4" />
              </Button>
              <div></div>
              <Button
                size="icon"
                variant="outline"
                onClick={() => editDevice === 'mobile' ? setXMobile(xMobile - 16) : setXDesktop(xDesktop - 16)}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div></div>
              <Button
                size="icon"
                variant="outline"
                onClick={() => editDevice === 'mobile' ? setXMobile(xMobile + 16) : setXDesktop(xDesktop + 16)}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
              <div></div>
              <Button
                size="icon"
                variant="outline"
                onClick={() => setLogoTop(logoTop + 16)}
              >
                <ChevronDown className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Size Slider */}
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Size: {logoSize}px</p>
            <Slider
              value={[logoSize]}
              onValueChange={(v) => setLogoSize(v[0])}
              min={80}
              max={240}
              step={8}
            />
          </div>

          {/* Position Info */}
          <div className="text-xs text-muted-foreground space-y-1">
            <p>Mobile X: {xMobile}px</p>
            <p>Desktop X: {xDesktop}px</p>
            <p>Top: {logoTop}px</p>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button size="sm" onClick={saveLogoSettings} className="flex-1">
              Save
            </Button>
            <Button size="sm" variant="outline" onClick={cancelEdit} className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Settings Mode Controls */}
      {isSettingsMode && (
        <div className="fixed top-20 right-4 z-50 bg-card/95 backdrop-blur-sm border border-border rounded-lg p-4 shadow-lg space-y-4 max-w-md">
          <h3 className="font-fredoka text-sm font-bold text-foreground">Hero Text Box Settings</h3>
          
          {/* Hero Text Editor */}
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Hero Text</p>
            <Textarea
              value={heroText}
              onChange={(e) => setHeroText(e.target.value)}
              rows={4}
              className="text-sm"
            />
          </div>

          {/* Padding Top Slider */}
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Top Padding: {heroBoxPaddingTop}px</p>
            <Slider
              value={[heroBoxPaddingTop]}
              onValueChange={(v) => setHeroBoxPaddingTop(v[0])}
              min={40}
              max={200}
              step={4}
            />
          </div>

          {/* General Padding Slider */}
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Side Padding: {heroBoxPadding}px</p>
            <Slider
              value={[heroBoxPadding]}
              onValueChange={(v) => setHeroBoxPadding(v[0])}
              min={8}
              max={48}
              step={4}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button size="sm" onClick={saveHeroSettings} className="flex-1">
              Save
            </Button>
            <Button size="sm" variant="outline" onClick={cancelHeroSettings} className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Hero Section - Magazine Layout */}
      <section className="relative z-10 pt-24 pb-8 px-4">
        <div className="container mx-auto">
          {/* Hero Row 1: Large Image + Profile Column */}
          <div className="grid lg:grid-cols-5 gap-6 mb-6">
            {/* Large Hero Cake Image - 60% */}
            <div className="lg:col-span-3 animate-fade-in">
              <div className="relative h-full min-h-[500px] lg:min-h-[650px] rounded-3xl overflow-hidden shadow-float">
                <img
                  src={heroCake}
                  alt="Signature ocean ombre wedding cake with lavender and roses"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <h1 className="absolute bottom-8 left-8 right-8 text-4xl md:text-5xl lg:text-6xl font-fredoka font-bold text-white leading-tight drop-shadow-lg">
                  BBs Cake Creations
                </h1>
              </div>
            </div>

            {/* Stacked Right Column - 40% */}
            <div className="lg:col-span-2 space-y-6 animate-fade-in flex flex-col min-h-[500px] lg:min-h-[650px]">
              {/* Profile Photo */}
              <div className="bg-card/90 backdrop-blur-sm rounded-3xl p-6 shadow-wave">
                <div className="mb-4 flex justify-center">
                  <div className="w-full max-w-md aspect-video rounded-2xl overflow-hidden shadow-wave ring-2 ring-ocean-wave/30">
                    <div
                      className="w-full h-full"
                      style={{
                        backgroundImage: `url(${profileImage})`,
                        backgroundSize: `${profilePhotoScale}%`,
                        backgroundPosition: `${profilePhotoX}% ${profilePhotoY}%`,
                        backgroundRepeat: 'no-repeat',
                      }}
                    />
                  </div>
                </div>
                <h2 className="text-2xl font-fredoka gradient-ocean bg-clip-text text-transparent mb-2">
                  Meet Brandia
                </h2>
                <p className="text-sm text-ocean-deep font-quicksand leading-relaxed">
                  {profileBio.substring(0, 180)}...
                </p>
                <Button
                  onClick={() => navigate("/about")}
                  variant="outline"
                  size="sm"
                  className="mt-3 w-full border-ocean-wave text-ocean-deep hover:bg-ocean-wave hover:text-white"
                >
                  Read Full Story
                  <ArrowRight className="w-3 h-3 ml-2" />
                </Button>
              </div>

              {/* Mission Statement */}
              <div className="bg-card/90 backdrop-blur-sm rounded-3xl p-6 shadow-wave">
                <p className="text-base text-ocean-deep font-quicksand leading-relaxed">
                  {heroText}
                </p>
              </div>

              {/* How to Use Box */}
              <div className="bg-card/90 backdrop-blur-sm rounded-3xl p-6 shadow-wave">
                <h3 className="text-xl font-fredoka gradient-ocean bg-clip-text text-transparent mb-3">
                  How to Use This Site
                </h3>
                <p className="text-sm text-ocean-deep font-quicksand leading-relaxed mb-4">
                  Explore signature recipes, chat with Sasha (my AI baking companion), discover favorite bakers, and find essential tools. Whether you're a beginner or seasoned baker, everything here is designed to inspire your next creation.
                </p>
                <Button
                  onClick={() => navigate("/instructions")}
                  variant="outline"
                  size="sm"
                  className="w-full border-ocean-wave text-ocean-deep hover:bg-ocean-wave hover:text-white"
                >
                  Full Instructions
                  <ArrowRight className="w-3 h-3 ml-2" />
                </Button>
              </div>
            </div>
          </div>

          {/* Hero Row 2: CTA Card + Philosophy Highlights */}
          <div className="grid lg:grid-cols-5 gap-6 mb-12">
            {/* Chat with Sasha CTA - 40% */}
            <div className="lg:col-span-2 animate-fade-in">
              <div className="h-full bg-gradient-to-br from-ocean-wave/20 to-ocean-foam/20 backdrop-blur-sm rounded-3xl p-8 shadow-wave flex flex-col justify-center">
                <h3 className="text-2xl font-fredoka gradient-ocean bg-clip-text text-transparent mb-2">
                  Meet Sasha
                </h3>
                <p className="text-sm text-ocean-wave font-quicksand mb-3">
                  BB's AI Baking Companion
                </p>
                <p className="text-base font-quicksand text-dolphin mb-6">
                  My AI companion who captures my baking philosophy and helps you create your own masterpieces.
                </p>
                <Button
                  size="lg"
                  onClick={() => navigate("/chat")}
                  className="gradient-ocean text-primary-foreground shadow-wave transition-bounce hover:scale-105"
                >
                  Chat with Sasha
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>

            {/* Philosophy Highlights - 60% */}
            <div className="lg:col-span-3 animate-fade-in">
              <div className="h-full bg-card/90 backdrop-blur-sm rounded-3xl p-8 shadow-wave">
                <h3 className="text-2xl font-fredoka gradient-ocean bg-clip-text text-transparent mb-6">
                  The Philosophy
                </h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-coral/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Heart className="w-6 h-6 text-coral" />
                    </div>
                    <h4 className="font-fredoka text-base text-ocean-deep mb-2">From Scratch</h4>
                    <p className="text-sm text-muted-foreground">Real ingredients, never box mixes</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-ocean-wave/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Wheat className="w-6 h-6 text-ocean-wave" />
                    </div>
                    <h4 className="font-fredoka text-base text-ocean-deep mb-2">Gluten-Free</h4>
                    <p className="text-sm text-muted-foreground">Most cakes can be adapted beautifully</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-ocean-foam/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Sparkles className="w-6 h-6 text-ocean-foam" />
                    </div>
                    <h4 className="font-fredoka text-base text-ocean-deep mb-2">Natural Touches</h4>
                    <p className="text-sm text-muted-foreground">Optional beauty from nature</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section - Tighter Spacing */}
      <section className="relative z-10 pb-12 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-fredoka gradient-ocean bg-clip-text text-transparent mb-3">
              Signature Creations
            </h2>
            <p className="text-lg text-dolphin font-quicksand max-w-2xl mx-auto">
              Every cake is a love letter baked from scratch—can be adapted to be gluten-free or low-gluten.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cakes.map((cake, idx) => (
              <div
                key={idx}
                onClick={() => handleCakeClick((cake as any).id)}
                className={`group bg-card/80 backdrop-blur-sm rounded-3xl overflow-hidden shadow-wave hover:shadow-float transition-all hover:scale-105 cursor-pointer ${
                  idx === 0 ? "ring-2 ring-coral/50" : ""
                }`}
              >
                {idx === 0 && (
                  <div className="bg-gradient-to-r from-coral to-ocean-wave text-white px-4 py-2 text-center font-fredoka font-semibold text-sm">
                    ✨ Featured Cake
                  </div>
                )}
                <div className="aspect-square overflow-hidden">
                  <img
                    src={cake.image}
                    alt={cake.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-fredoka text-ocean-deep mb-2">
                    {cake.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {cake.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
