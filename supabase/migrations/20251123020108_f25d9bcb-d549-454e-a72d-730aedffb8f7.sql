-- Create a database function to handle position sliding
-- This runs BEFORE the recipe update, avoiding the trigger conflict
CREATE OR REPLACE FUNCTION public.slide_featured_positions(
  new_position INTEGER,
  exclude_recipe_id UUID
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Slide down all recipes at or after the new position
  -- Set to NULL any that would go beyond position 10
  UPDATE recipes
  SET 
    featured_position = CASE 
      WHEN featured_position + 1 > 10 THEN NULL
      ELSE featured_position + 1
    END,
    updated_at = now()
  WHERE featured_position >= new_position
    AND id != exclude_recipe_id;
END;
$$;