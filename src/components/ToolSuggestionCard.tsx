import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Heart, Package } from "lucide-react";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface ToolSuggestionCardProps {
  tool: {
    id: string;
    title: string;
    description?: string;
    image_url?: string;
    price_estimate?: string;
    category?: string;
    primary_url: string;
    canonical_key: string;
  };
  confidence?: number;
  onAddToWishlist?: (toolId: string) => Promise<void>;
  showConfidence?: boolean;
}

export const ToolSuggestionCard = ({
  tool,
  confidence,
  onAddToWishlist,
  showConfidence = false,
}: ToolSuggestionCardProps) => {
  const [isAdding, setIsAdding] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const handleAddToWishlist = async () => {
    if (!onAddToWishlist) return;
    
    setIsAdding(true);
    try {
      await onAddToWishlist(tool.id);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex gap-4">
          <div className="w-24 h-24 flex-shrink-0 rounded-md overflow-hidden bg-muted relative">
            {imageLoading && tool.image_url && (
              <Skeleton className="w-full h-full absolute inset-0" />
            )}
            {tool.image_url && !imageError ? (
              <img
                src={tool.image_url}
                alt={tool.title}
                className="w-full h-full object-cover"
                loading="lazy"
                onLoad={() => setImageLoading(false)}
                onError={() => {
                  setImageLoading(false);
                  setImageError(true);
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                <Package className="w-10 h-10 text-muted-foreground/40" />
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h4 className="font-semibold text-sm line-clamp-2">{tool.title}</h4>
              {showConfidence && confidence && (
                <Badge variant="outline" className="text-xs shrink-0">
                  {Math.round(confidence * 100)}%
                </Badge>
              )}
            </div>

            {tool.description && (
              <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                {tool.description}
              </p>
            )}

            <div className="flex items-center gap-2 mb-3">
              {tool.category && (
                <Badge variant="secondary" className="text-xs">
                  {tool.category}
                </Badge>
              )}
              {tool.price_estimate && (
                <span className="text-xs font-medium text-ocean-deep">
                  {tool.price_estimate}
                </span>
              )}
            </div>

            <div className="flex gap-2">
              {onAddToWishlist && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleAddToWishlist}
                  disabled={isAdding}
                  className="text-xs gap-1"
                >
                  <Heart className="w-3 h-3" />
                  {isAdding ? 'Adding...' : 'Wishlist'}
                </Button>
              )}
              <Button
                size="sm"
                variant="default"
                asChild
                className="text-xs gap-1"
              >
                <a
                  href={tool.primary_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    // Track click
                    console.log('Affiliate link clicked:', tool.canonical_key);
                  }}
                >
                  <ExternalLink className="w-3 h-3" />
                  Shop
                </a>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
