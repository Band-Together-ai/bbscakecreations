-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Anyone can manage profile settings" ON public.profile_settings;

-- Keep public read access for displaying website
CREATE POLICY "Anyone can view profile settings"
  ON public.profile_settings FOR SELECT
  USING (true);

-- Restrict write access to admins and collaborators only
CREATE POLICY "Admins and collaborators can manage profile settings"
  ON public.profile_settings FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'collaborator'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'collaborator'::app_role));