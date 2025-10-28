-- Add display_order to recipes for tracking "first 3 free"
ALTER TABLE public.recipes
ADD COLUMN display_order integer;

-- Add display_order to blog_posts for tracking "first 3 free"
ALTER TABLE public.blog_posts
ADD COLUMN display_order integer;

-- Create baking_tools table for affiliate storefront
CREATE TABLE public.baking_tools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  category text NOT NULL,
  affiliate_link text,
  image_url text,
  price_range text,
  brandia_take text,
  is_featured boolean DEFAULT false,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.baking_tools ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view baking tools"
ON public.baking_tools
FOR SELECT
USING (true);

CREATE POLICY "Admins and collaborators can manage baking tools"
ON public.baking_tools
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'collaborator'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'collaborator'::app_role));

-- Create recipe_tools junction table
CREATE TABLE public.recipe_tools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id uuid REFERENCES public.recipes(id) ON DELETE CASCADE NOT NULL,
  tool_id uuid REFERENCES public.baking_tools(id) ON DELETE CASCADE NOT NULL,
  is_essential boolean DEFAULT false,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(recipe_id, tool_id)
);

ALTER TABLE public.recipe_tools ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view recipe tools"
ON public.recipe_tools
FOR SELECT
USING (true);

CREATE POLICY "Admins and collaborators can manage recipe tools"
ON public.recipe_tools
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'collaborator'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'collaborator'::app_role));

-- Create tool_clicks table for analytics
CREATE TABLE public.tool_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id uuid REFERENCES public.baking_tools(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  clicked_at timestamp with time zone DEFAULT now(),
  referrer_page text
);

ALTER TABLE public.tool_clicks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert tool clicks"
ON public.tool_clicks
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can view tool clicks"
ON public.tool_clicks
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create favorite_bakers table
CREATE TABLE public.favorite_bakers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  website_url text,
  instagram_handle text,
  category text,
  description text,
  profile_image_url text,
  display_order integer DEFAULT 0,
  is_featured boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.favorite_bakers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view favorite bakers"
ON public.favorite_bakers
FOR SELECT
USING (true);

CREATE POLICY "Admins and collaborators can manage favorite bakers"
ON public.favorite_bakers
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'collaborator'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'collaborator'::app_role));

-- Create temporary_access table for tip jar 30-day access
CREATE TABLE public.temporary_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  access_type text NOT NULL DEFAULT 'tip_jar_30_day',
  expires_at timestamp with time zone NOT NULL,
  payment_id text,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.temporary_access ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own temporary access"
ON public.temporary_access
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all temporary access"
ON public.temporary_access
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can insert temporary access"
ON public.temporary_access
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can manage temporary access"
ON public.temporary_access
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Add author_id to recipes for collaborator tracking
ALTER TABLE public.recipes
ADD COLUMN author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create updated_at trigger for baking_tools
CREATE TRIGGER update_baking_tools_updated_at
BEFORE UPDATE ON public.baking_tools
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create updated_at trigger for favorite_bakers
CREATE TRIGGER update_favorite_bakers_updated_at
BEFORE UPDATE ON public.favorite_bakers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();