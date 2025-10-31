-- Add recipe type enum and frosting reference to recipes table
DO $$ BEGIN
  CREATE TYPE recipe_type AS ENUM ('complete', 'base_cake', 'frosting', 'variant');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

ALTER TABLE recipes 
ADD COLUMN IF NOT EXISTS recipe_type recipe_type DEFAULT 'complete',
ADD COLUMN IF NOT EXISTS frosting_recipe_id UUID REFERENCES recipes(id),
ADD COLUMN IF NOT EXISTS is_featured_base BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS base_name TEXT,
ADD COLUMN IF NOT EXISTS assembly_instructions TEXT;

-- Create recipe versions table for history tracking
CREATE TABLE IF NOT EXISTS recipe_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID,
  ingredients JSONB,
  instructions TEXT,
  staging_json JSONB,
  notes TEXT,
  is_current BOOLEAN DEFAULT false
);

-- Enable RLS on recipe_versions
ALTER TABLE recipe_versions ENABLE ROW LEVEL SECURITY;

-- Only admins and collaborators can view/manage recipe versions
CREATE POLICY "Admins and collabs can manage recipe versions"
ON recipe_versions
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'collaborator'::app_role));

-- Function to archive recipe version before update
CREATE OR REPLACE FUNCTION archive_recipe_version()
RETURNS TRIGGER AS $$
BEGIN
  -- Only archive if this is a base recipe being modified
  IF NEW.recipe_type = 'base_cake' AND 
     (OLD.ingredients IS DISTINCT FROM NEW.ingredients OR 
      OLD.instructions IS DISTINCT FROM NEW.instructions OR
      OLD.staging_json IS DISTINCT FROM NEW.staging_json) THEN
    
    -- Archive current version
    INSERT INTO recipe_versions (
      recipe_id, 
      version_number, 
      ingredients, 
      instructions, 
      staging_json,
      created_by, 
      is_current
    )
    VALUES (
      OLD.id, 
      (SELECT COALESCE(MAX(version_number), 0) + 1 FROM recipe_versions WHERE recipe_id = OLD.id),
      OLD.ingredients, 
      OLD.instructions,
      OLD.staging_json,
      auth.uid(), 
      false
    );
    
    -- Keep only last 3 versions (original + 2 mods)
    DELETE FROM recipe_versions 
    WHERE recipe_id = OLD.id 
    AND version_number < (
      SELECT MAX(version_number) - 2 FROM recipe_versions WHERE recipe_id = OLD.id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for version archiving
DROP TRIGGER IF EXISTS archive_recipe_version_trigger ON recipes;
CREATE TRIGGER archive_recipe_version_trigger
BEFORE UPDATE ON recipes
FOR EACH ROW
EXECUTE FUNCTION archive_recipe_version();