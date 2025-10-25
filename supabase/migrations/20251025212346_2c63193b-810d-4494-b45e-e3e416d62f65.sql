-- Temporarily allow public updates to profile_settings for testing
-- This makes it easier to test without authentication
-- IMPORTANT: In production, you should require authentication!

DROP POLICY IF EXISTS "Authenticated users can manage profile settings" ON profile_settings;

CREATE POLICY "Anyone can manage profile settings"
ON profile_settings
FOR ALL
USING (true)
WITH CHECK (true);