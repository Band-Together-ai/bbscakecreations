import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import WaveBackground from '@/components/WaveBackground';
import { Card } from '@/components/ui/card';

// Import all cake images
import cake1 from '@/assets/cake-1.jpg';
import cake2 from '@/assets/cake-2.jpg';
import cake3 from '@/assets/cake-3.jpg';
import cake4 from '@/assets/cake-4.jpg';
import cake5 from '@/assets/cake-5.jpg';
import cake6 from '@/assets/cake-6.jpg';
import carrotCake from '@/assets/carrot-cake.jpg';
import chocolateFudgeCake from '@/assets/chocolate-fudge-cake.jpg';
import lemonBlueberryCake from '@/assets/lemon-blueberry-cake.jpg';
import redVelvetCake from '@/assets/red-velvet-cake.jpg';
import vanillaLayerCake from '@/assets/vanilla-layer-cake.jpg';

const cakeImages = [
  cake1, cake2, cake3, cake4, cake5, cake6,
  carrotCake, chocolateFudgeCake, lemonBlueberryCake,
  redVelvetCake, vanillaLayerCake
];

const Gallery = () => {
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <Navigation />
      <WaveBackground />

      <main className="flex-1 container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="font-fredoka text-4xl md:text-5xl lg:text-6xl text-ocean-deep mb-4">
              Cake Gallery
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Every cake tells a story. Hand-crafted with love, adorned with live flowers, 
              and baked from scratch—no box mixes, no fondant, just pure magic.
            </p>
          </div>

          {/* Grid Gallery */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
            {cakeImages.map((image, index) => (
              <Card
                key={index}
                className="cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-wave overflow-hidden group aspect-square"
                onClick={() => setSelectedImage(image)}
              >
                <div className="relative w-full h-full">
                  <img
                    src={image}
                    alt={`Brandia's Cake ${index + 1}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ocean-deep/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-4">
                    <p className="text-white font-fredoka text-sm">View Details</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Coming Soon Notice */}
          <div className="text-center mt-24 mb-12">
            <Card className="p-8 bg-ocean-foam/30 border-ocean-wave">
              <h3 className="font-fredoka text-2xl text-ocean-deep mb-2">
                More Magic Coming Soon
              </h3>
              <p className="text-muted-foreground">
                Each cake will soon link to its recipe, so you can recreate the magic at home!
              </p>
            </Card>
          </div>
        </div>
      </main>

      {/* Lightbox for selected image */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] animate-scale-in">
            <img
              src={selectedImage}
              alt="Selected cake"
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-wave"
            />
            <button
              className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white rounded-full p-3 backdrop-blur-sm transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImage(null);
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;
