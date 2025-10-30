-- Create a function to set user role
-- This will be used by Stripe webhooks to update user roles based on subscription status

CREATE OR REPLACE FUNCTION public.set_user_role(p_user_id uuid, p_role app_role)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Delete any existing roles for this user
  DELETE FROM public.user_roles WHERE user_id = p_user_id;
  
  -- Insert the new role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (p_user_id, p_role);
END;
$$;