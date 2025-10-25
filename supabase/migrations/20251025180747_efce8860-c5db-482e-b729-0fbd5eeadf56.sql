-- Create storage bucket for recipe photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('recipe-photos', 'recipe-photos', true);

-- Create storage policies for recipe photos
CREATE POLICY "Anyone can view recipe photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'recipe-photos');

CREATE POLICY "Authenticated users can upload recipe photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'recipe-photos' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own recipe photos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'recipe-photos' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete their own recipe photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'recipe-photos' AND auth.role() = 'authenticated');