interface RecipeHeaderHeroV2Props {
  imageUrl: string;
  title: string;
  className?: string;
}

export const RecipeHeaderHeroV2 = ({ 
  imageUrl, 
  title, 
  className 
}: RecipeHeaderHeroV2Props) => {
  return (
    <div className={`hero-v2 ${className ?? ""}`}>
      <img src={imageUrl} alt={title} className="hero-img" />
      <div className="hero-gradient" />
      <h1 className="hero-title">{title}</h1>
    </div>
  );
};
