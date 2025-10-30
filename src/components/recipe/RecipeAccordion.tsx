import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Check, ExternalLink } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface Ingredient {
  item: string;
  amount?: string;
  unit?: string;
  group?: string;
}

interface Tool {
  name: string;
  affiliateLink?: string;
  isEssential?: boolean;
}

interface RecipeAccordionProps {
  ingredients?: Ingredient[] | any;
  instructions?: string;
  tools?: Tool[];
  story?: string;
  insights?: React.ReactNode;
}

export const RecipeAccordion = ({
  ingredients,
  instructions,
  tools,
  story,
  insights,
}: RecipeAccordionProps) => {
  const [checkedSteps, setCheckedSteps] = useState<Set<number>>(new Set());

  const toggleStep = (index: number) => {
    setCheckedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  // Parse instructions into steps
  const steps = instructions
    ? instructions.split("\n").filter((line) => line.trim())
    : [];

  // Parse ingredients if it's a string
  const parsedIngredients = typeof ingredients === "string"
    ? ingredients.split("\n").filter((line) => line.trim())
    : Array.isArray(ingredients)
    ? ingredients
    : [];

  return (
    <Accordion type="multiple" className="w-full space-y-4">
      {/* Ingredients */}
      {parsedIngredients.length > 0 && (
        <AccordionItem value="ingredients" className="ui-v2-card border-0">
          <AccordionTrigger className="text-xl font-semibold hover:no-underline">
            Ingredients
          </AccordionTrigger>
          <AccordionContent>
            <ul className="space-y-2" role="list">
              {parsedIngredients.map((ingredient: any, index: number) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-[#F7A48C] mt-1">•</span>
                  <span className="text-[#5B4A3A]">
                    {typeof ingredient === "string"
                      ? ingredient
                      : `${ingredient.amount || ""} ${ingredient.unit || ""} ${ingredient.item}`.trim()}
                  </span>
                </li>
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>
      )}

      {/* Steps */}
      {steps.length > 0 && (
        <AccordionItem value="steps" className="ui-v2-card border-0">
          <AccordionTrigger className="text-xl font-semibold hover:no-underline">
            Steps
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4" role="list">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex gap-4 p-4 rounded-lg border-2 transition-colors cursor-pointer",
                    checkedSteps.has(index)
                      ? "border-[#CFE6DE] bg-[#CFE6DE]/20"
                      : "border-gray-200"
                  )}
                  onClick={() => toggleStep(index)}
                  role="listitem"
                >
                  <button
                    className={cn(
                      "flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                      checkedSteps.has(index)
                        ? "bg-[#F7A48C] border-[#F7A48C]"
                        : "border-gray-300"
                    )}
                    aria-label={`Mark step ${index + 1} as complete`}
                    aria-pressed={checkedSteps.has(index)}
                  >
                    {checkedSteps.has(index) && (
                      <Check className="w-4 h-4 text-white" />
                    )}
                  </button>
                  <div className="flex-1">
                    <span className="font-semibold text-[#5B4A3A] mr-2">
                      {index + 1}.
                    </span>
                    <span
                      className={cn(
                        "text-[#5B4A3A]",
                        checkedSteps.has(index) && "line-through opacity-60"
                      )}
                    >
                      {step}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      )}

      {/* Tools */}
      {tools && tools.length > 0 && (
        <AccordionItem value="tools" className="ui-v2-card border-0">
          <AccordionTrigger className="text-xl font-semibold hover:no-underline">
            Tools You'll Need
          </AccordionTrigger>
          <AccordionContent>
            <ul className="space-y-3" role="list">
              {tools.map((tool, index) => (
                <li
                  key={index}
                  className="flex items-center justify-between gap-4"
                >
                  <span className="text-[#5B4A3A]">
                    {tool.name}
                    {tool.isEssential && (
                      <span className="ml-2 text-xs text-[#F7A48C]">
                        (Essential)
                      </span>
                    )}
                  </span>
                  {tool.affiliateLink && (
                    <a
                      href={tool.affiliateLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#F7A48C] hover:text-[#F58D6E] flex items-center gap-1 text-sm"
                      aria-label={`View ${tool.name} on retailer site`}
                    >
                      View <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>
      )}

      {/* Story */}
      {story && (
        <AccordionItem value="story" className="ui-v2-card border-0">
          <AccordionTrigger className="text-xl font-semibold hover:no-underline">
            Read the Story
          </AccordionTrigger>
          <AccordionContent>
            <p className="text-[#5B4A3A] leading-relaxed whitespace-pre-line">
              {story}
            </p>
          </AccordionContent>
        </AccordionItem>
      )}

      {/* Insights */}
      {insights && (
        <AccordionItem value="insights" className="ui-v2-card border-0">
          <AccordionTrigger className="text-xl font-semibold hover:no-underline">
            Insights
          </AccordionTrigger>
          <AccordionContent>{insights}</AccordionContent>
        </AccordionItem>
      )}
    </Accordion>
  );
};
