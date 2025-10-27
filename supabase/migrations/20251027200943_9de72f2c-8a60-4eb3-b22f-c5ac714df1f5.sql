-- Create about_photos table for About page carousel
CREATE TABLE public.about_photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  photo_url TEXT NOT NULL,
  caption TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.about_photos ENABLE ROW LEVEL SECURITY;

-- Anyone can view about photos
CREATE POLICY "Anyone can view about photos"
ON public.about_photos
FOR SELECT
USING (true);

-- Admins and collaborators can manage about photos
CREATE POLICY "Admins and collaborators can manage about photos"
ON public.about_photos
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'collaborator'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'collaborator'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_about_photos_updated_at
BEFORE UPDATE ON public.about_photos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();