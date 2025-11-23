-- Drop the old trigger
DROP TRIGGER IF EXISTS auto_slide_featured_positions_trigger ON recipes;

-- Recreate the trigger to run AFTER update instead of BEFORE
CREATE OR REPLACE FUNCTION public.auto_slide_featured_positions()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
$function$;

-- Recreate trigger to run AFTER update
CREATE TRIGGER auto_slide_featured_positions_trigger
AFTER UPDATE ON recipes
FOR EACH ROW
WHEN (OLD.featured_position IS DISTINCT FROM NEW.featured_position)
EXECUTE FUNCTION auto_slide_featured_positions();