import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BookOpen, MessageSquare, User, ChevronRight, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface WelcomeWizardProps {
  open: boolean;
  onComplete: () => void;
}

export const WelcomeWizard = ({ open, onComplete }: WelcomeWizardProps) => {
  const [step, setStep] = useState(1);

  const steps = [
    {
      icon: BookOpen,
      title: "Welcome to Your BakeBook! 📖",
      description: "Save unlimited recipes, scan your own recipes, and organize everything in one beautiful place. Think of it as your digital baking journal.",
      highlight: "BakeBook is found in the navigation menu"
    },
    {
      icon: MessageSquare,
      title: "Meet Sasha, Your AI Sous Chef 👋",
      description: "Got questions? Sasha's here 24/7 for tips, substitutions, troubleshooting, and encouragement. Just click the chat bubble anytime!",
      highlight: "Look for the floating chat icon on any page"
    },
    {
      icon: User,
      title: "Your Settings & Profile ⚙️",
      description: "Customize your experience, manage your account, and track your baking journey. Everything you need is in your profile.",
      highlight: "Access via the menu in the top right"
    }
  ];

  const currentStep = steps[step - 1];
  const StepIcon = currentStep.icon;

  const handleNext = () => {
    if (step < steps.length) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = async () => {
    await handleComplete();
  };

  const handleComplete = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('user_profiles')
          .update({ welcome_wizard_completed: true })
          .eq('id', user.id);
      }
      onComplete();
      toast.success("You're all set! Happy baking! 🎂");
    } catch (error) {
      console.error("Error completing wizard:", error);
      onComplete();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleComplete}>
      <DialogContent className="sm:max-w-md">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4"
          onClick={handleSkip}
        >
          <X className="h-4 w-4" />
        </Button>
        
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-ocean-wave/10">
            <StepIcon className="h-8 w-8 text-ocean-wave" />
          </div>
          <DialogTitle className="text-center font-fredoka text-2xl">
            {currentStep.title}
          </DialogTitle>
          <DialogDescription className="text-center text-base pt-2">
            {currentStep.description}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 p-4 rounded-lg bg-ocean-foam/50 border border-ocean-wave/20">
          <p className="text-sm text-ocean-deep font-medium">
            💡 {currentStep.highlight}
          </p>
        </div>

        <div className="flex items-center justify-between mt-6">
          <div className="flex gap-2">
            {steps.map((_, idx) => (
              <div
                key={idx}
                className={`h-2 w-2 rounded-full transition-all ${
                  idx + 1 === step
                    ? "bg-ocean-wave w-6"
                    : "bg-ocean-wave/30"
                }`}
              />
            ))}
          </div>

          <div className="flex gap-2">
            {step < steps.length && (
              <Button variant="ghost" onClick={handleSkip}>
                Skip Tour
              </Button>
            )}
            <Button onClick={handleNext} className="gradient-ocean text-primary-foreground">
              {step < steps.length ? (
                <>
                  Next
                  <ChevronRight className="ml-1 h-4 w-4" />
                </>
              ) : (
                "Let's Bake!"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
