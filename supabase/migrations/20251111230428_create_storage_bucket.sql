-- Create storage bucket for collection media (images, files, videos)
-- Using a single bucket to avoid requiring users to run migrations per collection

-- Create the bucket (no file size limit, all MIME types allowed)
INSERT INTO storage.buckets (id, name, public)
VALUES (
  'collection-media',
  'collection-media',
  true -- public bucket for easy access
);

-- Authenticated users have full CRUD access
CREATE POLICY "Authenticated users can upload files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'collection-media');

CREATE POLICY "Authenticated users can read files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'collection-media');

CREATE POLICY "Authenticated users can update files"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'collection-media')
WITH CHECK (bucket_id = 'collection-media');

CREATE POLICY "Authenticated users can delete files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'collection-media');

-- Public read access
CREATE POLICY "Public can read files"
ON storage.objects FOR SELECT
TO anon
USING (bucket_id = 'collection-media');
