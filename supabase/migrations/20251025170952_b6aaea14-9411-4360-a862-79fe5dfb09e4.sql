-- Change default value for is_gluten_free in recipes table to false
ALTER TABLE public.recipes 
ALTER COLUMN is_gluten_free SET DEFAULT false;