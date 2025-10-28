-- Add profile photo positioning columns to profile_settings table
ALTER TABLE public.profile_settings 
ADD COLUMN IF NOT EXISTS profile_photo_scale INTEGER DEFAULT 100,
ADD COLUMN IF NOT EXISTS profile_photo_x INTEGER DEFAULT 50,
ADD COLUMN IF NOT EXISTS profile_photo_y INTEGER DEFAULT 50;