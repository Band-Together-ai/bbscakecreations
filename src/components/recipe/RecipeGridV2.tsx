import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Recipe {
  id: string;
  title: string;
  image_url?: string;
  prep_active_minutes?: number;
  make_ahead?: boolean;
  is_base_recipe?: boolean;
  category?: string;
}

interface RecipeGridV2Props {
  recipes: Recipe[];
}

export const RecipeGridV2 = ({ recipes }: RecipeGridV2Props) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {recipes.map((recipe) => (
        <Link key={recipe.id} to={`/recipes/${recipe.id}`}>
          <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200 h-full">
            {/* Image with aspect ratio */}
            <div className="relative w-full" style={{ paddingTop: "100%" }}>
              <img
                src={recipe.image_url || "/placeholder.svg"}
                alt={recipe.title}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover"
              />
              
              {/* Badges overlay */}
              <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                {recipe.is_base_recipe && (
                  <Badge className="ui-v2-badge text-xs">Base</Badge>
                )}
                {recipe.prep_active_minutes && recipe.prep_active_minutes <= 30 && (
                  <Badge className="ui-v2-badge text-xs">Quick</Badge>
                )}
                {recipe.make_ahead && (
                  <Badge className="ui-v2-badge text-xs">Make-Ahead</Badge>
                )}
              </div>
            </div>

            {/* Title */}
            <div className="p-3">
              <h3 className="font-semibold text-[#5B4A3A] line-clamp-2 leading-snug">
                {recipe.title}
              </h3>
              {recipe.category && (
                <span className="text-xs text-[#5E6A6E] mt-1 block">
                  {recipe.category}
                </span>
              )}
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
};
