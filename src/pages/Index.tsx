import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import WaveBackground from "@/components/WaveBackground";
import Navigation from "@/components/Navigation";
import { ArrowRight } from "lucide-react";
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
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

const Index = () => {
  const navigate = useNavigate();
  const [featuredCakes, setFeaturedCakes] = useState<any[]>([]);
  const [profileImage, setProfileImage] = useState(brandiaProfile);
  const [profileBio, setProfileBio] = useState(
    "Hi! I'm Brandia, the baker behind every scratch-made creation you see here. From ocean-inspired ombres to delicate herb-adorned layers, I believe every cake should tell a story—your story. Whether you need gluten-free magic or a classic from-scratch masterpiece, I'm here to bring your vision to life."
  );
  
  const [logoSize, setLogoSize] = useState(160);
  const [logoTop, setLogoTop] = useState(-80);
  const [logoX, setLogoX] = useState(0);
  const [showLogoControls, setShowLogoControls] = useState(true);
  const [dragging, setDragging] = useState(false);
  const startRef = useRef({ x: 0, y: 0, logoX: 0, logoTop: 0 });
  const boxRef = useRef<HTMLDivElement>(null);

  const handlePointerDown = (e: any) => {
    setDragging(true);
    startRef.current = { x: e.clientX, y: e.clientY, logoX, logoTop };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: any) => {
    if (!dragging) return;
    const dx = e.clientX - startRef.current.x;
    const dy = e.clientY - startRef.current.y;

    const container = boxRef.current;
    let newX = startRef.current.logoX + dx;
    let newTop = startRef.current.logoTop + dy;

    if (container) {
      const innerW = container.clientWidth;
      const innerH = container.clientHeight;
      const padding = 8;
      const maxTop = Math.max(padding, innerH - logoSize - padding);
      newTop = Math.min(Math.max(-logoSize, newTop), maxTop);

      const halfW = innerW / 2;
      const maxX = halfW - logoSize / 2 - padding;
      newX = Math.min(Math.max(-maxX, newX), maxX);
    }

    setLogoX(newX);
    setLogoTop(newTop);
  };

  const endDrag = () => setDragging(false);

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
      if (data.profile_image_url) setProfileImage(data.profile_image_url);
      if (data.bio_text) setProfileBio(data.bio_text);
    }
  };

  const fetchFeaturedRecipes = async () => {
    const { data } = await supabase
      .from("recipes")
      .select(`
        *,
        recipe_photos(photo_url, is_headline)
      `)
      .eq("is_featured", true)
      .eq("is_public", true)
      .order("featured_position", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: false })
      .limit(6);

    if (data && data.length > 0) {
      setFeaturedCakes(data.map(recipe => {
        // Prioritize image_url, then headline photo, then first photo
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
      }));
    }
  };

  const cakes = featuredCakes.length > 0 ? featuredCakes : defaultCakes;

  return (
    <div className="min-h-screen relative overflow-hidden">
      <Navigation />
      <WaveBackground />

      {/* Hero Section */}
      <section className="relative z-10 min-h-screen flex items-center pt-2">
        <div className="container mx-auto px-4 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text */}
            <div className="space-y-6 animate-fade-in">
              <h1 className="text-5xl md:text-7xl font-fredoka font-bold gradient-ocean bg-clip-text text-transparent leading-tight drop-shadow-sm">
                Brandia's<br />BBs Cake Creations
              </h1>
              <div className="relative max-w-xl">
                <div ref={boxRef} className="relative backdrop-blur-sm bg-background/60 rounded-2xl p-4 pt-28">
                  <img
                    src={logoSquare}
                    alt="BB's Cake Creations Logo"
                    className="absolute left-1/2 opacity-80 animate-float z-10 cursor-move select-none"
                    style={{ top: logoTop, width: logoSize, height: logoSize, transform: `translate(-50%, 0) translateX(${logoX}px)` }}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={endDrag}
                    onPointerCancel={endDrag}
                  />
                  <p className="text-xl text-ocean-deep font-quicksand">
                    Where every cake is baked from scratch with love,
                    adorned with live flowers, and crafted to tell your story. Most cakes can be made
                    gluten-free or low-gluten. No box mixes. No fondant. Just pure magic.
                  </p>
                </div>

                <div className="absolute -top-2 right-0 flex flex-col items-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => setShowLogoControls(!showLogoControls)}>
                    {showLogoControls ? "Hide" : "Adjust"} Logo
                  </Button>
                  {showLogoControls && (
                    <div className="bg-card/90 backdrop-blur-sm rounded-xl p-3 shadow-wave">
                      <div className="grid grid-cols-3 gap-2 place-items-center">
                        <span />
                        <Button variant="secondary" size="icon" onClick={() => setLogoTop(logoTop - 16)}>
                          <ChevronUp className="w-4 h-4" />
                        </Button>
                        <span />
                        <Button variant="secondary" size="icon" onClick={() => setLogoX(logoX - 16)}>
                          <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <div className="text-xs font-medium text-dolphin">Move</div>
                        <Button variant="secondary" size="icon" onClick={() => setLogoX(logoX + 16)}>
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                        <span />
                        <Button variant="secondary" size="icon" onClick={() => setLogoTop(logoTop + 16)}>
                          <ChevronDown className="w-4 h-4" />
                        </Button>
                        <span />
                      </div>
                      <div className="mt-3">
                        <label className="text-xs text-dolphin">Size</label>
                        <input
                          type="range"
                          min={96}
                          max={240}
                          step={4}
                          value={logoSize}
                          onChange={(e) => setLogoSize(parseInt((e.target as HTMLInputElement).value))}
                          className="w-40"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="pt-4 backdrop-blur-sm bg-background/60 p-4 rounded-2xl">
                <p className="text-lg font-fredoka text-dolphin mb-4">
                  Meet Sasha—my AI companion who captures my baking philosophy 
                  and helps you create your own masterpieces.
                </p>
                <Button
                  size="lg"
                  onClick={() => navigate("/chat")}
                  className="gradient-ocean text-primary-foreground shadow-wave transition-bounce hover:scale-105 text-lg px-8 py-6"
                >
                  Chat with Sasha
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>

            {/* Right: Hero Image */}
            <div className="relative animate-float">
              <div className="rounded-3xl overflow-hidden shadow-float">
                <img
                  src={heroCake}
                  alt="Brandia's signature ocean ombre wedding cake with lavender and roses"
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="relative z-10 py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-fredoka gradient-ocean bg-clip-text text-transparent mb-4">
              Signature Creations
            </h2>
            <p className="text-xl text-dolphin font-quicksand max-w-2xl mx-auto">
              Every cake is a love letter baked from scratch—can be adapted to be gluten-free or low-gluten, 
              never using box mixes or fondant. Just real ingredients and real stories.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cakes.map((cake, idx) => (
              <div
                key={idx}
                onClick={() => handleCakeClick((cake as any).id)}
                className={`group bg-card/80 backdrop-blur-sm rounded-3xl overflow-hidden shadow-wave hover:shadow-float transition-all hover:scale-105 cursor-pointer ${
                  idx === 0 ? "ring-2 ring-coral/50" : ""
                }`}
              >
                {idx === 0 && (
                  <div className="bg-gradient-to-r from-coral to-ocean-wave text-white px-4 py-2 text-center font-fredoka font-semibold">
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
                  <h3 className="text-2xl font-fredoka text-ocean-deep mb-2">
                    {cake.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {cake.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About/Philosophy Section */}
      <section className="relative z-10 py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-card/80 backdrop-blur-sm rounded-3xl p-12 shadow-float text-center">
            <h2 className="text-3xl font-fredoka gradient-ocean bg-clip-text text-transparent mb-6">
              The Philosophy
            </h2>
            <div className="space-y-4 text-lg text-ocean-deep">
              <p>
                <strong className="font-fredoka text-xl">From scratch, always.</strong> Every cake 
                starts with real ingredients—almond flour, farm-fresh eggs, pure vanilla. Never a box mix.
              </p>
              <p>
                <strong className="font-fredoka text-xl">Gluten-free adaptable.</strong> Most cakes can 
                be made gluten-free or low-gluten without compromising on texture or taste. My gluten-free 
                swaps create the dreamiest crumb when you need them.
              </p>
              <p>
                <strong className="font-fredoka text-xl">Live flowers, real stories.</strong> Lavender, 
                rosemary, edible pansies—nature adorns every creation. Each cake tells the story of 
                the moment it celebrates.
              </p>
              <p className="pt-4 text-coral font-fredoka text-xl">
                No fondant. No shortcuts. Just pure love in every layer.
              </p>
            </div>
            <Button
              size="lg"
              onClick={() => navigate("/chat")}
              className="mt-8 gradient-ocean text-primary-foreground shadow-wave transition-bounce hover:scale-105"
            >
              Start Your Cake Journey with Sasha
            </Button>
          </div>
        </div>
      </section>

      {/* Meet Brandia Section */}
      <section className="relative z-10 py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-card/90 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-float">
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Profile Image */}
              <div className="shrink-0">
                <div className="w-40 h-40 md:w-48 md:h-48 rounded-full overflow-hidden shadow-wave ring-4 ring-ocean-wave/20">
                  <img
                    src={profileImage}
                    alt="Brandia - Cake Artist and Creator"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Bio Content */}
              <div className="flex-1 text-center md:text-left space-y-4">
                <h2 className="text-3xl md:text-4xl font-fredoka gradient-ocean bg-clip-text text-transparent">
                  Meet Brandia
                </h2>
                <p className="text-lg text-ocean-deep font-quicksand leading-relaxed">
                  {profileBio}
                </p>
                <Button
                  onClick={() => navigate("/about")}
                  variant="outline"
                  className="border-ocean-wave text-ocean-deep hover:bg-ocean-wave hover:text-white transition-all"
                >
                  Read My Full Story
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
