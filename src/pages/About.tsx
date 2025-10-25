import Navigation from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Flower2, Sprout } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="w-48 h-48 mx-auto mb-8 rounded-full bg-ocean-foam flex items-center justify-center">
              <span className="text-6xl">👩‍🍳</span>
            </div>
            <h1 className="text-5xl font-fredoka gradient-ocean bg-clip-text text-transparent mb-4">
              Meet Brandia
            </h1>
            <p className="text-2xl text-ocean-deep font-fredoka mb-4">
              Cake Whisperer & Ocean Dreamer
            </p>
            <p className="text-xl text-dolphin max-w-2xl mx-auto">
              Every layer's a love letter from scratch
            </p>
          </div>

          {/* Story Section */}
          <Card className="shadow-float mb-12">
            <CardContent className="p-8 md:p-12">
              <h2 className="text-3xl font-fredoka text-ocean-deep mb-6">My Story</h2>
              <div className="space-y-4 text-lg text-foreground leading-relaxed">
                <p>
                  Hi, I'm Brandia—a baker who believes cakes should tell stories, not just fill bellies. 
                  I started baking when I realized store-bought just didn't capture the magic of 
                  real ingredients and real intention.
                </p>
                <p>
                  Growing up near the ocean in Wilmington, I learned that the best things in life 
                  are crafted with patience, like waves shaping the shore. That's how I approach 
                  every cake—layer by layer, from scratch, with love baked into every crumb.
                </p>
                <p>
                  I never use box mixes or fondant. Why? Because shortcuts rob cakes of their soul. 
                  Instead, I craft gluten-free recipes that don't compromise on texture—almond flour 
                  that creates the dreamiest sponge, xanthan gum for that perfect crumb.
                </p>
                <p>
                  My signature? Live flowers and herbs. Lavender, rosemary, edible pansies—nature's 
                  beauty adorns every creation. Each cake celebrates not just an occasion, but the 
                  people and stories behind it.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Philosophy Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="shadow-wave text-center">
              <CardContent className="p-8">
                <Heart className="w-12 h-12 text-coral mx-auto mb-4" />
                <h3 className="font-fredoka text-xl text-ocean-deep mb-3">
                  From Scratch, Always
                </h3>
                <p className="text-muted-foreground">
                  Real butter, farm-fresh eggs, pure vanilla. Never a shortcut, never a box mix.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-wave text-center">
              <CardContent className="p-8">
                <Sprout className="w-12 h-12 text-seaweed mx-auto mb-4" />
                <h3 className="font-fredoka text-xl text-ocean-deep mb-3">
                  Gluten-Free by Heart
                </h3>
                <p className="text-muted-foreground">
                  Everyone deserves cake. My gluten-free recipes create the fluffiest, moistest crumb.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-wave text-center">
              <CardContent className="p-8">
                <Flower2 className="w-12 h-12 text-ocean-wave mx-auto mb-4" />
                <h3 className="font-fredoka text-xl text-ocean-deep mb-3">
                  Nature's Touch
                </h3>
                <p className="text-muted-foreground">
                  Live flowers, fresh herbs—every cake blooms with real beauty and intention.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Meet Sasha Section */}
          <Card className="shadow-float bg-gradient-to-br from-ocean-foam/20 to-coral/10">
            <CardContent className="p-8 md:p-12 text-center">
              <h2 className="text-3xl font-fredoka text-ocean-deep mb-4">Meet Sasha</h2>
              <p className="text-lg text-foreground max-w-2xl mx-auto">
                Sasha is my AI companion—trained on my voice notes, recipe uploads, and baking 
                philosophy. She captures my warm, no-nonsense approach and helps you create 
                your own masterpieces with the same from-scratch magic I pour into every layer.
              </p>
              <p className="text-coral font-fredoka text-xl mt-6">
                "Hey sugar, let's bake something alive!"
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default About;
