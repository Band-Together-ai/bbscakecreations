-- Drop the old constraint that limits to positions 1-6
ALTER TABLE recipes DROP CONSTRAINT IF EXISTS valid_featured_position;

-- Add new constraint that allows positions 1-10
ALTER TABLE recipes ADD CONSTRAINT valid_featured_position 
  CHECK (featured_position IS NULL OR (featured_position >= 1 AND featured_position <= 10));