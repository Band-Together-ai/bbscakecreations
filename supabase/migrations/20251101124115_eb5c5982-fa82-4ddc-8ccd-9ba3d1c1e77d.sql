-- Create product-photos storage bucket for tool and product images
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-photos', 'product-photos', true);

-- Allow admins to upload product photos
CREATE POLICY "Admins can upload product photos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'product-photos' 
  AND (
    has_role(auth.uid(), 'admin'::app_role) 
    OR has_role(auth.uid(), 'collaborator'::app_role)
  )
);

-- Allow admins to update product photos
CREATE POLICY "Admins can update product photos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'product-photos' 
  AND (
    has_role(auth.uid(), 'admin'::app_role) 
    OR has_role(auth.uid(), 'collaborator'::app_role)
  )
);

-- Allow admins to delete product photos
CREATE POLICY "Admins can delete product photos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'product-photos' 
  AND (
    has_role(auth.uid(), 'admin'::app_role) 
    OR has_role(auth.uid(), 'collaborator'::app_role)
  )
);

-- Allow public read access to product photos
CREATE POLICY "Product photos are publicly accessible"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'product-photos');