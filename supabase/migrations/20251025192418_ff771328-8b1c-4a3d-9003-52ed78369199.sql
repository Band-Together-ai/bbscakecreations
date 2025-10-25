-- Create profile_settings table for site-wide settings
CREATE TABLE IF NOT EXISTS public.profile_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_image_url TEXT,
  bio_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profile_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read profile settings
CREATE POLICY "Profile settings are publicly readable"
ON public.profile_settings
FOR SELECT
USING (true);

-- Policy: Only authenticated users can insert/update (we'll make it admin-only in the app)
CREATE POLICY "Authenticated users can manage profile settings"
ON public.profile_settings
FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Insert default row
INSERT INTO public.profile_settings (profile_image_url, bio_text)
VALUES (
  '/src/assets/brandia-profile.jpg',
  'Hi! I''m Brandia, the baker behind every scratch-made creation you see here. From ocean-inspired ombres to delicate herb-adorned layers, I believe every cake should tell a story—your story. Whether you need gluten-free magic or a classic from-scratch masterpiece, I''m here to bring your vision to life.'
);