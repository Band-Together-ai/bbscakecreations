-- Add entry_point column to user_profiles to track where users signed up from
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS entry_point TEXT;

-- Add index for analytics queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_entry_point ON public.user_profiles(entry_point);

-- Add onboarding_completed column to track if user has completed onboarding
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;