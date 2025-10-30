interface RecipeHeaderHeroProps {
  title: string;
  imageUrl: string;
  subheader?: string;
}

export const RecipeHeaderHero = ({
  title,
  imageUrl,
  subheader,
}: RecipeHeaderHeroProps) => {
  return (
    <header className="relative w-full">
      {/* Image container with aspect ratio */}
      <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
        <img
          src={imageUrl}
          alt={title}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      </div>

      {/* Title overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
        <h1 className="text-4xl md:text-5xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
          {title}
        </h1>
        {subheader && (
          <p className="text-lg md:text-xl opacity-90 font-light">
            {subheader}
          </p>
        )}
      </div>
    </header>
  );
};
