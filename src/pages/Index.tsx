import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import WaveBackground from "@/components/WaveBackground";
import DolphinSwim from "@/components/DolphinSwim";
import { Sparkles, Heart, Users } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <WaveBackground />
      <DolphinSwim />

      {/* Hero Section */}
      <section className="relative z-10 flex-1 flex items-center justify-center px-4 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8 animate-float">
          <h1 className="text-6xl md:text-8xl font-fredoka font-bold gradient-ocean bg-clip-text text-transparent leading-tight">
            CakeWhisperer
          </h1>
          <p className="text-xl md:text-2xl text-ocean-deep font-quicksand max-w-2xl mx-auto">
            Meet Sasha, your AI baking companion. From-scratch recipes, gluten-free magic,
            and ocean-inspired whimsy—no box mixes, no fondant, pure love in every layer.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              onClick={() => navigate("/auth")}
              className="gradient-ocean text-primary-foreground shadow-wave transition-bounce hover:scale-105 text-lg px-8 py-6"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Start Baking Magic
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate("/auth")}
              className="border-ocean-wave text-ocean-deep hover:bg-ocean-foam transition-smooth text-lg px-8 py-6"
            >
              Sign In
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card/80 backdrop-blur-sm rounded-3xl p-8 shadow-wave hover:shadow-float transition-smooth">
              <div className="w-14 h-14 rounded-full gradient-ocean flex items-center justify-center mb-4">
                <Sparkles className="w-7 h-7 text-primary-foreground" />
              </div>
              <h3 className="text-2xl font-fredoka text-ocean-deep mb-3">
                AI-Powered Recipes
              </h3>
              <p className="text-muted-foreground">
                Sasha analyzes photos, imports recipes, and suggests magical remixes—all
                gluten-free friendly and crafted from scratch.
              </p>
            </div>

            <div className="bg-card/80 backdrop-blur-sm rounded-3xl p-8 shadow-wave hover:shadow-float transition-smooth">
              <div className="w-14 h-14 rounded-full gradient-ocean flex items-center justify-center mb-4">
                <Heart className="w-7 h-7 text-primary-foreground" />
              </div>
              <h3 className="text-2xl font-fredoka text-ocean-deep mb-3">
                From-Scratch Philosophy
              </h3>
              <p className="text-muted-foreground">
                No box mixes, no fondant—just pure ingredients, live flowers, and stories
                baked into every layer with love.
              </p>
            </div>

            <div className="bg-card/80 backdrop-blur-sm rounded-3xl p-8 shadow-wave hover:shadow-float transition-smooth">
              <div className="w-14 h-14 rounded-full gradient-ocean flex items-center justify-center mb-4">
                <Users className="w-7 h-7 text-primary-foreground" />
              </div>
              <h3 className="text-2xl font-fredoka text-ocean-deep mb-3">
                Community-First
              </h3>
              <p className="text-muted-foreground">
                Share recipes, swap tips, and build your own baking vault—join a whimsical
                community of cake lovers.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
