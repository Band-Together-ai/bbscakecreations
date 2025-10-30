import { Badge } from "@/components/ui/badge";

interface RecipeBadgesProps {
  isBase?: boolean;
  baseName?: string;
  prepActiveMinutes?: number;
  makeAhead?: boolean;
  savesCount?: number;
  favoriteThreshold?: number;
}

export const RecipeBadges = ({
  isBase,
  baseName,
  prepActiveMinutes,
  makeAhead,
  savesCount = 0,
  favoriteThreshold = 10,
}: RecipeBadgesProps) => {
  const badges = [];

  if (isBase) {
    badges.push({ key: "base", label: "Base", variant: "default" as const });
  }

  if (baseName) {
    badges.push({
      key: "variant",
      label: `Variant of ${baseName}`,
      variant: "secondary" as const,
    });
  }

  if (prepActiveMinutes && prepActiveMinutes <= 30) {
    badges.push({ key: "quick", label: "Quick", variant: "default" as const });
  }

  if (makeAhead) {
    badges.push({
      key: "makeahead",
      label: "Make-Ahead",
      variant: "default" as const,
    });
  }

  if (savesCount >= favoriteThreshold) {
    badges.push({
      key: "favorite",
      label: "Fan Favorite",
      variant: "default" as const,
    });
  }

  if (badges.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 my-3" role="list" aria-label="Recipe attributes">
      {badges.map((badge) => (
        <Badge
          key={badge.key}
          variant={badge.variant}
          className="ui-v2-badge"
          role="listitem"
        >
          {badge.label}
        </Badge>
      ))}
    </div>
  );
};
