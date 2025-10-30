-- Add Brandia's Pick fields to recipes
ALTER TABLE recipes ADD COLUMN brandia_pick BOOLEAN DEFAULT false;
ALTER TABLE recipes ADD COLUMN why_she_loves_it TEXT;

-- Add Brandia's Pick fields to baking_tools
ALTER TABLE baking_tools ADD COLUMN brandia_pick BOOLEAN DEFAULT false;
ALTER TABLE baking_tools ADD COLUMN why_she_loves_it TEXT;

-- Create wellness table
CREATE TABLE wellness (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  image_url TEXT,
  brandia_pick BOOLEAN DEFAULT false,
  why_she_loves_it TEXT,
  affiliate_link TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on wellness
ALTER TABLE wellness ENABLE ROW LEVEL SECURITY;

-- RLS policies for wellness
CREATE POLICY "Anyone can view wellness items"
ON wellness
FOR SELECT
USING (true);

CREATE POLICY "Admins and collaborators can manage wellness"
ON wellness
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'collaborator'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'collaborator'::app_role));

-- Add updated_at trigger for wellness
CREATE TRIGGER update_wellness_updated_at
BEFORE UPDATE ON wellness
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();