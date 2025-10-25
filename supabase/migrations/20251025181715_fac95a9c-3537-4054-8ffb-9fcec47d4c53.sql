-- Update storage policies to allow public uploads for testing
DROP POLICY IF EXISTS "Authenticated users can upload recipe photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own recipe photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own recipe photos" ON storage.objects;

-- Allow anyone to upload (for testing without auth)
CREATE POLICY "Anyone can upload recipe photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'recipe-photos');

-- Allow anyone to update (for testing)
CREATE POLICY "Anyone can update recipe photos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'recipe-photos');

-- Allow anyone to delete (for testing)
CREATE POLICY "Anyone can delete recipe photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'recipe-photos');