-- Add playback speed preference to profiles
ALTER TABLE public.profiles 
ADD COLUMN playback_speed decimal DEFAULT 1.0 CHECK (playback_speed >= 0.5 AND playback_speed <= 2.0);