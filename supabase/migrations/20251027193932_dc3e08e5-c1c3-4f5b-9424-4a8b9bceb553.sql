-- Create support_settings table
CREATE TABLE public.support_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  venmo_username TEXT,
  venmo_display_name TEXT,
  support_message TEXT DEFAULT 'If you enjoyed this recipe and want to support my baking journey, I''d be grateful for any contribution! 💕',
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  thank_you_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on support_settings
ALTER TABLE public.support_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies for support_settings
CREATE POLICY "Anyone can view support settings"
  ON public.support_settings
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage support settings"
  ON public.support_settings
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create recipe_ratings table
CREATE TABLE public.recipe_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT NOT NULL CHECK (char_length(review_text) >= 10 AND char_length(review_text) <= 1000),
  is_approved BOOLEAN NOT NULL DEFAULT true,
  admin_reviewed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on recipe_ratings
ALTER TABLE public.recipe_ratings ENABLE ROW LEVEL SECURITY;

-- RLS policies for recipe_ratings
CREATE POLICY "Anyone can view approved ratings"
  ON public.recipe_ratings
  FOR SELECT
  USING (is_approved = true OR auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated users can insert ratings"
  ON public.recipe_ratings
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update their own ratings"
  ON public.recipe_ratings
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ratings"
  ON public.recipe_ratings
  FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all ratings"
  ON public.recipe_ratings
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create support_clicks table for tracking
CREATE TABLE public.support_clicks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clicked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  recipe_id UUID REFERENCES public.recipes(id) ON DELETE SET NULL
);

-- Enable RLS on support_clicks
ALTER TABLE public.support_clicks ENABLE ROW LEVEL SECURITY;

-- RLS policies for support_clicks
CREATE POLICY "Anyone can insert support clicks"
  ON public.support_clicks
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view support clicks"
  ON public.support_clicks
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Function to increment thank you count
CREATE OR REPLACE FUNCTION public.increment_thank_you_count()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.support_settings
  SET thank_you_count = thank_you_count + 1,
      updated_at = now()
  WHERE id = (SELECT id FROM public.support_settings LIMIT 1);
$$;

-- Function to get recipe rating stats
CREATE OR REPLACE FUNCTION public.get_recipe_rating_stats(recipe_uuid UUID)
RETURNS TABLE(
  average_rating NUMERIC,
  total_ratings BIGINT,
  five_star BIGINT,
  four_star BIGINT,
  three_star BIGINT,
  two_star BIGINT,
  one_star BIGINT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    ROUND(AVG(rating)::numeric, 1) as average_rating,
    COUNT(*) as total_ratings,
    COUNT(*) FILTER (WHERE rating = 5) as five_star,
    COUNT(*) FILTER (WHERE rating = 4) as four_star,
    COUNT(*) FILTER (WHERE rating = 3) as three_star,
    COUNT(*) FILTER (WHERE rating = 2) as two_star,
    COUNT(*) FILTER (WHERE rating = 1) as one_star
  FROM public.recipe_ratings
  WHERE recipe_id = recipe_uuid
    AND is_approved = true;
$$;

-- Trigger for updated_at on support_settings
CREATE TRIGGER update_support_settings_updated_at
  BEFORE UPDATE ON public.support_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for updated_at on recipe_ratings
CREATE TRIGGER update_recipe_ratings_updated_at
  BEFORE UPDATE ON public.recipe_ratings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default support settings row
INSERT INTO public.support_settings (is_enabled) VALUES (false);