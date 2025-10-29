-- Add voice preference and lifetime patron flag to profiles
ALTER TABLE public.profiles 
ADD COLUMN voice_preference TEXT DEFAULT 'nova' CHECK (voice_preference IN ('alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer')),
ADD COLUMN is_lifetime_patron BOOLEAN DEFAULT false,
ADD COLUMN continuous_voice_enabled BOOLEAN DEFAULT false;

-- Create index for better performance
CREATE INDEX idx_profiles_lifetime_patron ON public.profiles(is_lifetime_patron) WHERE is_lifetime_patron = true;

COMMENT ON COLUMN public.profiles.voice_preference IS 'OpenAI TTS voice selection: alloy, echo, fable, onyx, nova, shimmer';
COMMENT ON COLUMN public.profiles.is_lifetime_patron IS 'Invited FREE FOR LIFE patrons who get premium features';
COMMENT ON COLUMN public.profiles.continuous_voice_enabled IS 'Enable hands-free voice input (paid/admin feature)';