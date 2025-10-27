-- Add featured_position column to recipes table
ALTER TABLE public.recipes 
ADD COLUMN featured_position integer;

-- Add constraint to ensure valid positions (1-6)
ALTER TABLE public.recipes
ADD CONSTRAINT valid_featured_position CHECK (featured_position >= 1 AND featured_position <= 6);

-- Add unique constraint so only one recipe can be in each position
CREATE UNIQUE INDEX unique_featured_position 
ON public.recipes (featured_position) 
WHERE featured_position IS NOT NULL AND is_featured = true AND is_public = true;

COMMENT ON COLUMN public.recipes.featured_position IS 'Position on landing page (1-6). Position 1 is the special Featured Cake spot.';