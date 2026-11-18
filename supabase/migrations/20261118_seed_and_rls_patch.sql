-- ==============================================================================
-- SAIYAM PLATFORM: CLEAN SQL (NO MOCK DATA) + BUCKET + FULL RLS POLICIES
-- ==============================================================================

-- 1. Fix the view security (Removes the red UNRESTRICTED badge in Supabase Table Editor)
ALTER VIEW public.school_impact_summary_view SET (security_invoker = true);

-- 2. Add coordinator fields to organizations table (if not already existing)
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS coordinator_user_id TEXT;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS coordinator_name TEXT;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS coordinator_email TEXT;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS coordinator_phone TEXT;

-- 3. Create the Public Storage Bucket purely via SQL (Zero mock files)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'saiyam-media',
    'saiyam-media',
    true,
    52428800, -- 50 MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 4. Storage Policies: Allow reading and uploading photos & school letters
DO $$
BEGIN
    DROP POLICY IF EXISTS "Public Access for saiyam-media" ON storage.objects;
    CREATE POLICY "Public Access for saiyam-media" ON storage.objects
        FOR SELECT USING (bucket_id = 'saiyam-media');

    DROP POLICY IF EXISTS "Upload Access for saiyam-media" ON storage.objects;
    CREATE POLICY "Upload Access for saiyam-media" ON storage.objects
        FOR INSERT WITH CHECK (bucket_id = 'saiyam-media');

    DROP POLICY IF EXISTS "Update Access for saiyam-media" ON storage.objects;
    CREATE POLICY "Update Access for saiyam-media" ON storage.objects
        FOR UPDATE USING (bucket_id = 'saiyam-media');
END $$;

-- 5. ROW LEVEL SECURITY (RLS) POLICIES FOR ALL SAIYAM TABLES
-- Enables seamless SELECT, INSERT, UPDATE, DELETE for frontend web client & field trainers

-- Organizations
DROP POLICY IF EXISTS "Organizations viewable by all authenticated" ON public.organizations;
DROP POLICY IF EXISTS "Organizations managed by Trust Admin" ON public.organizations;
DROP POLICY IF EXISTS "Allow all for organizations" ON public.organizations;
CREATE POLICY "Allow all for organizations" ON public.organizations FOR ALL USING (true) WITH CHECK (true);

-- Schools
DROP POLICY IF EXISTS "Schools access policy" ON public.schools;
DROP POLICY IF EXISTS "Allow all for schools" ON public.schools;
CREATE POLICY "Allow all for schools" ON public.schools FOR ALL USING (true) WITH CHECK (true);

-- Students
DROP POLICY IF EXISTS "Students access policy" ON public.students;
DROP POLICY IF EXISTS "Allow all for students" ON public.students;
CREATE POLICY "Allow all for students" ON public.students FOR ALL USING (true) WITH CHECK (true);

-- Assessments
DROP POLICY IF EXISTS "Assessments access policy" ON public.assessments;
DROP POLICY IF EXISTS "Allow all for assessments" ON public.assessments;
CREATE POLICY "Allow all for assessments" ON public.assessments FOR ALL USING (true) WITH CHECK (true);

-- Assessment Responses
DROP POLICY IF EXISTS "Responses access policy" ON public.assessment_responses;
DROP POLICY IF EXISTS "Allow all for assessment_responses" ON public.assessment_responses;
CREATE POLICY "Allow all for assessment_responses" ON public.assessment_responses FOR ALL USING (true) WITH CHECK (true);

-- Session Logs
DROP POLICY IF EXISTS "Session logs access policy" ON public.session_logs;
DROP POLICY IF EXISTS "Allow all for session_logs" ON public.session_logs;
CREATE POLICY "Allow all for session_logs" ON public.session_logs FOR ALL USING (true) WITH CHECK (true);

-- Session Media
DROP POLICY IF EXISTS "Session media access policy" ON public.session_media;
DROP POLICY IF EXISTS "Allow all for session_media" ON public.session_media;
CREATE POLICY "Allow all for session_media" ON public.session_media FOR ALL USING (true) WITH CHECK (true);

-- School Documents
DROP POLICY IF EXISTS "School documents access policy" ON public.school_documents;
DROP POLICY IF EXISTS "Allow all for school_documents" ON public.school_documents;
CREATE POLICY "Allow all for school_documents" ON public.school_documents FOR ALL USING (true) WITH CHECK (true);

-- Questions (Dynamic ~90 questions)
DROP POLICY IF EXISTS "Questions readable by authenticated" ON public.questions;
DROP POLICY IF EXISTS "Allow all for questions" ON public.questions;
CREATE POLICY "Allow all for questions" ON public.questions FOR ALL USING (true) WITH CHECK (true);

-- Curriculum Sessions
DROP POLICY IF EXISTS "Curriculum readable by authenticated" ON public.curriculum_sessions;
DROP POLICY IF EXISTS "Allow all for curriculum_sessions" ON public.curriculum_sessions;
CREATE POLICY "Allow all for curriculum_sessions" ON public.curriculum_sessions FOR ALL USING (true) WITH CHECK (true);

-- Profiles (Users)
DROP POLICY IF EXISTS "Profiles self view" ON public.profiles;
DROP POLICY IF EXISTS "Profiles admin manage" ON public.profiles;
DROP POLICY IF EXISTS "Allow all for profiles" ON public.profiles;
CREATE POLICY "Allow all for profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);


-- 6. AUTOMATED TRIGGER: When any user is created in Supabase Auth, insert into public.profiles
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (
        id,
        auth_user_id,
        email,
        full_name,
        role,
        is_active,
        created_at,
        updated_at
    )
    VALUES (
        new.id,
        new.id,
        new.email,
        COALESCE(NULLIF(new.raw_user_meta_data->>'full_name', ''), split_part(new.email, '@', 1)),
        COALESCE(NULLIF(new.raw_user_meta_data->>'role', ''), 'FIELD_TRAINER'),
        TRUE,
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = COALESCE(public.profiles.full_name, EXCLUDED.full_name),
        updated_at = NOW();

    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();
