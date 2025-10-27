-- Create recipe_photos table for multiple photos per recipe
CREATE TABLE public.recipe_photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  is_headline BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.recipe_photos ENABLE ROW LEVEL SECURITY;

-- Create policies for recipe_photos
CREATE POLICY "Anyone can view recipe photos"
ON public.recipe_photos
FOR SELECT
USING (true);

CREATE POLICY "Anyone can create recipe photos (testing)"
ON public.recipe_photos
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update recipe photos (testing)"
ON public.recipe_photos
FOR UPDATE
USING (true);

CREATE POLICY "Anyone can delete recipe photos (testing)"
ON public.recipe_photos
FOR DELETE
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_recipe_photos_updated_at
BEFORE UPDATE ON public.recipe_photos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better query performance
CREATE INDEX idx_recipe_photos_recipe_id ON public.recipe_photos(recipe_id);

-- Migrate existing recipe image_url data to recipe_photos table
INSERT INTO public.recipe_photos (recipe_id, photo_url, is_headline)
SELECT id, image_url, true
FROM public.recipes
WHERE image_url IS NOT NULL;