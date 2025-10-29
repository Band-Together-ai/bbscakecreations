-- Add display_name column to promo_users table
ALTER TABLE public.promo_users 
ADD COLUMN display_name text;