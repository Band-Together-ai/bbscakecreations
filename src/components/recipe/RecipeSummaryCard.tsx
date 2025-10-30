import { Clock, Users, ChefHat, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";

interface RecipeSummaryCardProps {
  prepActiveMinutes?: number;
  prepPassiveMinutes?: number;
  servings?: number;
  difficulty?: string;
  savesCount?: number;
}

export const RecipeSummaryCard = ({
  prepActiveMinutes,
  prepPassiveMinutes,
  servings,
  difficulty = "Medium",
  savesCount = 0,
}: RecipeSummaryCardProps) => {
  const totalMinutes = (prepActiveMinutes || 0) + (prepPassiveMinutes || 0);

  const stats = [
    {
      icon: Clock,
      label: "Prep",
      value: prepActiveMinutes ? `${prepActiveMinutes}m` : "—",
    },
    {
      icon: Clock,
      label: "Total",
      value: totalMinutes ? `${totalMinutes}m` : "—",
    },
    {
      icon: Users,
      label: "Servings",
      value: servings || "—",
    },
    {
      icon: ChefHat,
      label: "Difficulty",
      value: difficulty,
    },
  ];

  return (
    <Card className="ui-v2-card p-4 mb-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="flex flex-col items-center text-center">
              <Icon className="w-5 h-5 text-[#F7A48C] mb-1" aria-hidden="true" />
              <span className="text-sm text-[#5E6A6E] mb-1">{stat.label}</span>
              <span className="font-semibold text-[#5B4A3A]">{stat.value}</span>
            </div>
          );
        })}
      </div>

      {savesCount > 0 && (
        <div className="flex items-center justify-center gap-2 pt-4 border-t border-gray-100">
          <TrendingUp className="w-4 h-4 text-[#F7A48C]" aria-hidden="true" />
          <span className="text-sm text-[#5E6A6E]">
            {savesCount} home baker{savesCount !== 1 ? "s" : ""} saved this
          </span>
        </div>
      )}
    </Card>
  );
};
