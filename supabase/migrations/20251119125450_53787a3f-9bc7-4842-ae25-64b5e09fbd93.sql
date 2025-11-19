
-- Add partial unique index on featured_position (allows multiple NULLs)
CREATE UNIQUE INDEX IF NOT EXISTS unique_featured_position 
ON recipes(featured_position) 
WHERE featured_position IS NOT NULL;

-- Create function to auto-slide featured positions
CREATE OR REPLACE FUNCTION auto_slide_featured_positions()
RETURNS TRIGGER AS $$
BEGIN
  -- Only proceed if featured_position is being set to a non-null value
  IF NEW.featured_position IS NOT NULL THEN
    -- Slide down all recipes at or after the new position (excluding current recipe)
    -- Set to NULL any that would go beyond position 10
    UPDATE recipes
    SET featured_position = CASE 
      WHEN featured_position + 1 > 10 THEN NULL
      ELSE featured_position + 1
    END,
    updated_at = now()
    WHERE featured_position >= NEW.featured_position
    AND id != NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to run before insert/update
DROP TRIGGER IF EXISTS trigger_auto_slide_featured_positions ON recipes;
CREATE TRIGGER trigger_auto_slide_featured_positions
BEFORE INSERT OR UPDATE OF featured_position ON recipes
FOR EACH ROW
EXECUTE FUNCTION auto_slide_featured_positions();

-- Clean up existing duplicates by setting them to NULL (except the most recent)
WITH ranked_recipes AS (
  SELECT id, featured_position,
    ROW_NUMBER() OVER (PARTITION BY featured_position ORDER BY created_at DESC) as rn
  FROM recipes
  WHERE featured_position IS NOT NULL
)
UPDATE recipes
SET featured_position = NULL, updated_at = now()
WHERE id IN (
  SELECT id FROM ranked_recipes WHERE rn > 1
);
