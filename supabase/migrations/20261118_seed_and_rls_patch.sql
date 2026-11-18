-- ==============================================================================
-- SAIYAM PLATFORM: CLEAN SQL (NO MOCK/SEEDED DATA) + BUCKET CREATION
-- ==============================================================================

-- 1. Fix the view security (Removes the red UNRESTRICTED badge in Table Editor)
ALTER VIEW public.school_impact_summary_view SET (security_invoker = true);

-- 2. Create the Public Storage Bucket purely via SQL
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'saiyam-media',
    'saiyam-media',
    true,
    52428800, -- 50 MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 3. Storage Policies: Allow reading and uploading photos/letters
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Public Access for saiyam-media'
    ) THEN
        CREATE POLICY "Public Access for saiyam-media" ON storage.objects
            FOR SELECT USING (bucket_id = 'saiyam-media');
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Upload Access for saiyam-media'
    ) THEN
        CREATE POLICY "Upload Access for saiyam-media" ON storage.objects
            FOR INSERT WITH CHECK (bucket_id = 'saiyam-media');
    END IF;
END $$;
