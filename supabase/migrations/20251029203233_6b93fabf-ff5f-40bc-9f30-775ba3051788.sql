-- Create table for custom gallery photo names
CREATE TABLE public.gallery_photo_names (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  photo_url text NOT NULL UNIQUE,
  custom_name text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.gallery_photo_names ENABLE ROW LEVEL SECURITY;

-- Admins and collaborators can manage photo names
CREATE POLICY "Admins and collaborators can manage photo names"
ON public.gallery_photo_names
FOR ALL
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'collaborator'::app_role)
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'collaborator'::app_role)
);

-- Anyone can view photo names
CREATE POLICY "Anyone can view photo names"
ON public.gallery_photo_names
FOR SELECT
TO public
USING (true);

-- Add updated_at trigger
CREATE TRIGGER update_gallery_photo_names_updated_at
  BEFORE UPDATE ON public.gallery_photo_names
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();