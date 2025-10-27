import { useEffect, useState } from "react";
import Navigation from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Flower2, Sprout } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { supabase } from "@/integrations/supabase/client";
import brandiaProfile from "@/assets/brandia-profile.jpg";
import cake1 from "@/assets/cake-1.jpg";
import cake2 from "@/assets/cake-2.jpg";
import cake3 from "@/assets/cake-3.jpg";
import cake4 from "@/assets/cake-4.jpg";
import Autoplay from "embla-carousel-autoplay";

const About = () => {
  const [profileImageUrl, setProfileImageUrl] = useState(brandiaProfile);

  useEffect(() => {
    fetchProfilePhoto();
  }, []);

  const fetchProfilePhoto = async () => {
    const { data, error } = await supabase
      .from("profile_settings")
      .select("profile_image_url")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!error && data?.profile_image_url) {
      setProfileImageUrl(data.profile_image_url);
    }
  };

  const galleryImages = [
    { src: profileImageUrl, caption: "Behind every cake is a story and a dream" },
    { src: cake1, caption: "Herb garden dreams with fresh mint and edible flowers" },
    { src: cake2, caption: "Rosemary sea salt fudge—decadent and earthy" },
    { src: cake3, caption: "Lemon blueberry sunrise—bright and beautiful" },
    { src: cake4, caption: "Ocean-inspired ombre with live pansies" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="w-48 h-48 mx-auto mb-8 rounded-full overflow-hidden shadow-wave ring-4 ring-ocean-wave/20">
              <img
                src={profileImageUrl}
                alt="Brandia - Baker, Ocean Lover, Dolphin Dreamer"
                className="w-full h-full object-cover"
              />
            </div>
            <h1 className="text-5xl font-fredoka gradient-ocean bg-clip-text text-transparent mb-4">
              Meet Brandia
            </h1>
            <p className="text-2xl text-ocean-deep font-fredoka mb-4">
              Baker, Beach Lover & Ocean Dreamer 🐬
            </p>
            <p className="text-xl text-dolphin max-w-2xl mx-auto">
              Every layer's a love letter from scratch
            </p>
          </div>

          {/* Photo Gallery Carousel */}
          <Card className="shadow-float mb-12">
            <CardContent className="p-8">
              <h2 className="text-3xl font-fredoka text-ocean-deep mb-6 text-center">
                My Journey in Pictures
              </h2>
              <Carousel 
                className="w-full max-w-xl mx-auto"
                plugins={[
                  Autoplay({
                    delay: 4000,
                    stopOnInteraction: true,
                  }),
                ]}
              >
                <CarouselContent>
                  {galleryImages.map((image, index) => (
                    <CarouselItem key={index}>
                      <div className="space-y-3">
                        <div className="aspect-[4/3] overflow-hidden rounded-lg shadow-wave max-h-[300px]">
                          <img
                            src={image.src}
                            alt={image.caption}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <p className="text-center text-sm text-muted-foreground font-quicksand italic">
                          {image.caption}
                        </p>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            </CardContent>
          </Card>

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
                  Instead, I craft recipes that can be adapted to be gluten-free without compromising texture—almond flour 
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
                  Gluten-Free Adaptable
                </h3>
                <p className="text-muted-foreground">
                  Everyone deserves cake. Most recipes can be made gluten-free or low-gluten for the fluffiest, moistest crumb.
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
