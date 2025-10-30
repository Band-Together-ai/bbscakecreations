import { Clock } from "lucide-react";
import { Card } from "@/components/ui/card";

interface Stage {
  name: string;
  active_minutes?: number;
  passive_minutes?: number;
}

interface RecipeStagingStripProps {
  stages: Stage[];
}

export const RecipeStagingStrip = ({ stages }: RecipeStagingStripProps) => {
  if (!stages || stages.length === 0) return null;

  return (
    <Card className="ui-v2-card p-4 mb-6 overflow-x-auto">
      <h3 className="text-sm font-semibold text-[#5B4A3A] mb-3">Staging Timeline</h3>
      <div className="flex gap-3 min-w-max">
        {stages.map((stage, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className="flex flex-col items-center min-w-[100px]">
              <div className="bg-[#CFE6DE] px-3 py-2 rounded-lg text-center mb-1">
                <span className="font-semibold text-[#5B4A3A] text-sm">
                  {stage.name}
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs text-[#5E6A6E]">
                <Clock className="w-3 h-3" aria-hidden="true" />
                {stage.active_minutes && (
                  <span>{stage.active_minutes}m active</span>
                )}
                {stage.passive_minutes && (
                  <span className="ml-1">+ {stage.passive_minutes}m</span>
                )}
              </div>
            </div>
            {index < stages.length - 1 && (
              <div className="flex items-center">
                <div className="w-6 h-0.5 bg-[#CFE6DE]" aria-hidden="true" />
                <div className="w-0 h-0 border-l-4 border-l-[#CFE6DE] border-y-4 border-y-transparent" aria-hidden="true" />
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
};
