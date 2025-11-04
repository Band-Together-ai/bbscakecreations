-- Add welcome wizard completed flag to user profiles
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS welcome_wizard_completed BOOLEAN DEFAULT FALSE;