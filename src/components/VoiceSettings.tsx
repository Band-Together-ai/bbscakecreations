import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface VoiceSettingsProps {
  userRole: 'admin' | 'paid' | 'free' | 'collaborator' | null;
  isLifetimePatron: boolean;
  voicePreference: string;
  continuousVoiceEnabled: boolean;
  userId: string;
  onUpdate: () => void;
}

const VOICE_OPTIONS = [
  { value: 'alloy', label: 'Alloy (Neutral)', description: 'Balanced and clear' },
  { value: 'echo', label: 'Echo (Male)', description: 'Warm and confident' },
  { value: 'fable', label: 'Fable (Expressive)', description: 'Dynamic and engaging' },
  { value: 'onyx', label: 'Onyx (Deep Male)', description: 'Rich and authoritative' },
  { value: 'nova', label: 'Nova (Friendly Female)', description: 'Bright and helpful' },
  { value: 'shimmer', label: 'Shimmer (Soft Female)', description: 'Gentle and soothing' },
];

export const VoiceSettings = ({ 
  userRole, 
  isLifetimePatron, 
  voicePreference, 
  continuousVoiceEnabled,
  userId,
  onUpdate 
}: VoiceSettingsProps) => {
  const [isUpdating, setIsUpdating] = useState(false);

  // Check if user has premium access (admin, paid, or lifetime patron)
  const hasPremiumAccess = userRole === 'admin' || userRole === 'paid' || isLifetimePatron;

  const handleVoiceChange = async (newVoice: string) => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ voice_preference: newVoice })
        .eq('id', userId);

      if (error) throw error;
      
      toast.success(`Voice updated to ${VOICE_OPTIONS.find(v => v.value === newVoice)?.label}`);
      onUpdate();
    } catch (error) {
      console.error('Error updating voice:', error);
      toast.error('Failed to update voice preference');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleContinuousVoiceToggle = async (enabled: boolean) => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ continuous_voice_enabled: enabled })
        .eq('id', userId);

      if (error) throw error;
      
      toast.success(enabled ? '🎤 Hands-free voice activated!' : 'Push-to-talk mode enabled');
      onUpdate();
    } catch (error) {
      console.error('Error updating continuous voice:', error);
      toast.error('Failed to update voice setting');
    } finally {
      setIsUpdating(false);
    }
  };

  if (!hasPremiumAccess) {
    return null;
  }

  return (
    <div className="space-y-4 p-4 bg-ocean-foam/50 rounded-lg border border-ocean-wave/20">
      <h3 className="font-fredoka text-ocean-deep text-sm font-semibold">
        🎙️ Premium Voice Settings
      </h3>
      
      {/* Voice Selection */}
      <div className="space-y-2">
        <Label htmlFor="voice-select" className="text-sm font-medium">
          Sasha's Voice
        </Label>
        <Select
          value={voicePreference}
          onValueChange={handleVoiceChange}
          disabled={isUpdating}
        >
          <SelectTrigger id="voice-select" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {VOICE_OPTIONS.map((voice) => (
              <SelectItem key={voice.value} value={voice.value}>
                <div className="flex flex-col">
                  <span className="font-medium">{voice.label}</span>
                  <span className="text-xs text-muted-foreground">{voice.description}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Continuous Voice Input (Paid users only) - HIDDEN FOR NOW */}
      {/* {(userRole === 'paid' || userRole === 'admin') && (
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="continuous-voice" className="text-sm font-medium">
              Hands-Free Voice Input
            </Label>
            <p className="text-xs text-muted-foreground">
              Always-on listening (Premium feature)
            </p>
          </div>
          <Switch
            id="continuous-voice"
            checked={continuousVoiceEnabled}
            onCheckedChange={handleContinuousVoiceToggle}
            disabled={isUpdating}
          />
        </div>
      )} */}
    </div>
  );
};
