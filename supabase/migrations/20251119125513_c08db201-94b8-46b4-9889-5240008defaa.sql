
-- Fix search_path security issue for auto_slide_featured_positions function
CREATE OR REPLACE FUNCTION auto_slide_featured_positions()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;
