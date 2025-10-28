-- Add hero text box settings columns to profile_settings
ALTER TABLE public.profile_settings 
ADD COLUMN IF NOT EXISTS hero_text TEXT DEFAULT 'Where every cake is baked from scratch with love, adorned with live flowers, and crafted to tell your story. Most cakes can be made gluten-free or low-gluten. No box mixes. No fondant. Just pure magic.',
ADD COLUMN IF NOT EXISTS hero_box_padding_top INTEGER DEFAULT 80,
ADD COLUMN IF NOT EXISTS hero_box_padding INTEGER DEFAULT 16;