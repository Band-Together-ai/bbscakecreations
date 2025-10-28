-- Add logo positioning columns to profile_settings table
ALTER TABLE public.profile_settings 
ADD COLUMN IF NOT EXISTS logo_top integer,
ADD COLUMN IF NOT EXISTS logo_size integer,
ADD COLUMN IF NOT EXISTS logo_x_mobile integer,
ADD COLUMN IF NOT EXISTS logo_x_desktop integer;