import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RecipePhotoCarouselProps {
  photos: Array<{ photo_url: string; is_headline: boolean }>;
  title: string;
}

export const RecipePhotoCarousel = ({ photos, title }: RecipePhotoCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!photos || photos.length === 0) {
    return (
      <div className="hero-v2">
        <img src="/placeholder.svg" alt={title} className="hero-img" />
        <div className="hero-gradient" />
        <h1 className="hero-title">{title}</h1>
      </div>
    );
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="hero-v2 relative">
      <img 
        src={photos[currentIndex].photo_url} 
        alt={`${title} - Photo ${currentIndex + 1}`} 
        className="hero-img" 
      />
      <div className="hero-gradient" />
      <h1 className="hero-title">{title}</h1>
      
      {photos.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full"
            aria-label="Previous photo"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full"
            aria-label="Next photo"
          >
            <ChevronRight className="w-6 h-6" />
          </Button>
          
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {photos.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex ? "bg-white w-6" : "bg-white/50"
                }`}
                aria-label={`Go to photo ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
