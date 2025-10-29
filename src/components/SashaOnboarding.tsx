import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface OnboardingProps {
  onComplete: () => void;
}

const PERSONA_OPTIONS = [
  {
    value: "learner",
    emoji: "🧁",
    label: "I'm just learning to bake!",
    followUp: "Perfect! Everyone starts somewhere — what's your favorite thing to eat right now?"
  },
  {
    value: "hobbyist",
    emoji: "🍪",
    label: "I bake for fun when I can!",
    followUp: "Love that! Baking for joy — what kind of treats make you smile most?"
  },
  {
    value: "busy_pro",
    emoji: "☕",
    label: "I'm busy but love to bake when I have time.",
    followUp: "Got it. You've got limited time — I'll keep things simple and help plan smart bakes."
  },
  {
    value: "home_biz",
    emoji: "🎂",
    label: "I'm thinking about selling my cakes!",
    followUp: "That's exciting! I'll help you track your recipes, costs, and maybe even profit."
  },
  {
    value: "explorer",
    emoji: "✨",
    label: "Just exploring!",
    followUp: "No problem! I'll show you around and we'll find your rhythm together."
  }
];

const EXPERIENCE_OPTIONS = [
  { value: "beginner", emoji: "👶", label: "Beginner" },
  { value: "confident", emoji: "👩‍🍳", label: "Confident Home Baker" },
  { value: "experienced", emoji: "🧁", label: "Experienced / Semi-Pro" }
];

const GOAL_OPTIONS = [
  { value: "learning", emoji: "💡", label: "Learning new skills" },
  { value: "fun", emoji: "🎉", label: "Making pretty cakes for fun" },
  { value: "time", emoji: "⏰", label: "Saving time" },
  { value: "business", emoji: "💰", label: "Selling or monetizing my bakes" }
];

const STYLE_OPTIONS = [
  { value: "calm", emoji: "🌊", label: "Calm & therapeutic" },
  { value: "creative", emoji: "🎨", label: "Creative & expressive" },
  { value: "efficient", emoji: "⚡", label: "Fast & efficient" },
  { value: "business", emoji: "💼", label: "Business & precision" }
];

export const SashaOnboarding = ({ onComplete }: OnboardingProps) => {
  const [step, setStep] = useState(0);
  const [persona, setPersona] = useState("");
  const [experience, setExperience] = useState("");
  const [goal, setGoal] = useState("");
  const [style, setStyle] = useState("");
  const [loading, setLoading] = useState(false);

  const handleComplete = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("user_profiles")
        .upsert({
          id: user.id,
          persona,
          experience_level: experience,
          goal_focus: goal,
          style_vibe: style,
          onboarding_completed: true
        });

      if (error) throw error;

      toast.success("Welcome aboard! Let's bake together 🌊");
      onComplete();
    } catch (error) {
      console.error("Onboarding error:", error);
      toast.error("Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  if (step === 0) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-fredoka text-center">
            Hey there, sweet soul! 🌊
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-center text-muted-foreground">
            I'm Sasha — your baking sidekick, sprinkle cheerleader, and secret ingredient to stress-free cakes.
            Before we roll up our sleeves, tell me a little about you so I can tailor your BakeBook and tips just right.
          </p>
          <div className="grid grid-cols-1 gap-3">
            {PERSONA_OPTIONS.map((option) => (
              <Button
                key={option.value}
                variant={persona === option.value ? "default" : "outline"}
                className="h-auto py-4 justify-start text-left"
                onClick={() => {
                  setPersona(option.value);
                  setStep(1);
                }}
              >
                <span className="text-2xl mr-3">{option.emoji}</span>
                <span>{option.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (step === 1) {
    const selectedPersona = PERSONA_OPTIONS.find(p => p.value === persona);
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-xl font-fredoka text-center">
            {selectedPersona?.followUp}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-muted-foreground text-center mb-4">
            How comfy do you feel in the kitchen?
          </p>
          <div className="grid grid-cols-1 gap-3">
            {EXPERIENCE_OPTIONS.map((option) => (
              <Button
                key={option.value}
                variant={experience === option.value ? "default" : "outline"}
                className="h-auto py-4 justify-start"
                onClick={() => {
                  setExperience(option.value);
                  setStep(2);
                }}
              >
                <span className="text-2xl mr-3">{option.emoji}</span>
                <span>{option.label}</span>
              </Button>
            ))}
          </div>
          <Button variant="ghost" onClick={() => setStep(0)} className="w-full">
            ← Back
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (step === 2) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-xl font-fredoka text-center">
            What's most important to you right now?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-3">
            {GOAL_OPTIONS.map((option) => (
              <Button
                key={option.value}
                variant={goal === option.value ? "default" : "outline"}
                className="h-auto py-4 justify-start"
                onClick={() => {
                  setGoal(option.value);
                  setStep(3);
                }}
              >
                <span className="text-2xl mr-3">{option.emoji}</span>
                <span>{option.label}</span>
              </Button>
            ))}
          </div>
          <Button variant="ghost" onClick={() => setStep(1)} className="w-full">
            ← Back
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (step === 3) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-xl font-fredoka text-center">
            What's your baking vibe?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-3">
            {STYLE_OPTIONS.map((option) => (
              <Button
                key={option.value}
                variant={style === option.value ? "default" : "outline"}
                className="h-auto py-4 justify-start"
                onClick={() => setStyle(option.value)}
              >
                <span className="text-2xl mr-3">{option.emoji}</span>
                <span>{option.label}</span>
              </Button>
            ))}
          </div>
          <Button
            onClick={handleComplete}
            disabled={!style || loading}
            className="w-full gradient-ocean text-white"
          >
            {loading ? "Setting up your BakeBook..." : "Let's Bake! 🌊"}
          </Button>
          <Button variant="ghost" onClick={() => setStep(2)} className="w-full">
            ← Back
          </Button>
        </CardContent>
      </Card>
    );
  }

  return null;
};
