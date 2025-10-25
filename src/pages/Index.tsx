import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import WaveBackground from "@/components/WaveBackground";
import Navigation from "@/components/Navigation";
import { ArrowRight } from "lucide-react";
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
  }, []);

  const fetchFeaturedRecipes = async () => {
    const { data } = await supabase
      .from("recipes")
      .select("*")
      .eq("is_featured", true)
      .eq("is_public", true)
      .order("created_at", { ascending: false })
      .limit(6);

    if (data && data.length > 0) {
      setFeaturedCakes(data.map(recipe => ({
        image: recipe.image_url || cake1,
        title: recipe.title,
        description: recipe.description || "",
      })));
    }
  };

  const cakes = featuredCakes.length > 0 ? featuredCakes : defaultCakes;

  return (
    <div className="min-h-screen relative overflow-hidden">
      <Navigation />
      <WaveBackground />

      {/* Meet Brandia Section */}
      <section className="relative z-10 pt-20 pb-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-card/90 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-float">
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Profile Image */}
              <div className="shrink-0">
                <div className="w-40 h-40 md:w-48 md:h-48 rounded-full overflow-hidden shadow-wave ring-4 ring-ocean-wave/20">
                  <img
                    src={brandiaProfile}
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
                  Hi! I'm Brandia, the baker behind every scratch-made creation you see here. 
                  From ocean-inspired ombres to delicate herb-adorned layers, I believe every cake 
                  should tell a story—your story. Whether you need gluten-free magic or a classic 
                  from-scratch masterpiece, I'm here to bring your vision to life.
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

      {/* Hero Section */}
      <section className="relative z-10 py-20 flex items-center">
        <div className="container mx-auto px-4 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text */}
            <div className="space-y-6 animate-fade-in">
              <h1 className="text-5xl md:text-7xl font-fredoka font-bold gradient-ocean bg-clip-text text-transparent leading-tight">
                Brandia's<br />CakeWhisperer
              </h1>
              <p className="text-xl text-ocean-deep font-quicksand max-w-xl">
                Where every cake is baked from scratch with love, 
                adorned with live flowers, and crafted to tell your story. Most cakes can be made 
                gluten-free or low-gluten. No box mixes. No fondant. Just pure magic.
              </p>
              <div className="pt-4">
                <p className="text-lg font-fredoka text-dolphin mb-4">
                  Meet Sasha—my AI companion who captures my baking philosophy 
                  and helps you create your own masterpieces.
                </p>
                <Button
                  size="lg"
                  onClick={() => navigate("/auth")}
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
                className="group bg-card/80 backdrop-blur-sm rounded-3xl overflow-hidden shadow-wave hover:shadow-float transition-all hover:scale-105"
              >
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
              onClick={() => navigate("/auth")}
              className="mt-8 gradient-ocean text-primary-foreground shadow-wave transition-bounce hover:scale-105"
            >
              Start Your Cake Journey with Sasha
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
