-- Create inspiration_sources table for admin-curated content
CREATE TABLE public.inspiration_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text,
  url text,
  content_type text CHECK (content_type IN ('blog','book','video','podcast','other')) DEFAULT 'blog',
  added_by uuid REFERENCES auth.users(id),
  takeaways jsonb DEFAULT jsonb_build_object(
    'top', jsonb_build_array(), 
    'supporting', jsonb_build_array(), 
    'deep', jsonb_build_array()
  ),
  admin_notes text,
  approved boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create inspiration_bullets for individual takeaway management
CREATE TABLE public.inspiration_bullets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id uuid REFERENCES public.inspiration_sources(id) ON DELETE CASCADE,
  tier text CHECK (tier IN ('top','supporting','deep')) NOT NULL,
  text text NOT NULL,
  tags text[] DEFAULT '{}',
  is_approved boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.inspiration_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspiration_bullets ENABLE ROW LEVEL SECURITY;

-- RLS: Only admins and collaborators can manage inspiration content
CREATE POLICY "inspo_admins_manage" ON public.inspiration_sources
FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'collaborator'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'collaborator'::app_role));

CREATE POLICY "inspo_bullets_admins_manage" ON public.inspiration_bullets
FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'collaborator'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'collaborator'::app_role));

-- Add update triggers for updated_at
CREATE TRIGGER trg_sources_updated_at
BEFORE UPDATE ON public.inspiration_sources
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_bullets_updated_at
BEFORE UPDATE ON public.inspiration_bullets
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();