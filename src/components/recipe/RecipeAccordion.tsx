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
            <ul id="ingredients-section" role="list">
              {parsedIngredients.map((ingredient: any, index: number) => (
                <li key={index} className="ing-item">
                  <input type="checkbox" aria-label={`Mark ${typeof ingredient === "string" ? ingredient : ingredient.item}`} />
                  <span className="ing-text">
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
            <ol className="steps-v2">
              {steps.map((step, index) => (
                <li key={index} className="step-card">
                  <span className="num">{index + 1}</span>
                  <p>{step}</p>
                </li>
              ))}
            </ol>
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
