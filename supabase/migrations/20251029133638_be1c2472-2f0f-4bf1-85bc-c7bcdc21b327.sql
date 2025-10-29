-- Create coffee clicks tracking table
CREATE TABLE public.coffee_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  clicked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  page_path TEXT,
  user_agent TEXT
);

-- Enable RLS
ALTER TABLE public.coffee_clicks ENABLE ROW LEVEL SECURITY;

-- Admins can view all coffee clicks
CREATE POLICY "Admins can view coffee clicks"
ON public.coffee_clicks
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Anyone can insert coffee clicks (even anonymous users)
CREATE POLICY "Anyone can insert coffee clicks"
ON public.coffee_clicks
FOR INSERT
WITH CHECK (true);

-- Create index for better performance
CREATE INDEX idx_coffee_clicks_user_id ON public.coffee_clicks(user_id);
CREATE INDEX idx_coffee_clicks_clicked_at ON public.coffee_clicks(clicked_at DESC);

COMMENT ON TABLE public.coffee_clicks IS 'Tracks when users click the Buy me a Coffee button';