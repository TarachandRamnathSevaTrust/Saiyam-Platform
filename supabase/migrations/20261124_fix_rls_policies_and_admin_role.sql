-- ==============================================================================
-- FIX RLS POLICIES & ENSURE PROPER DATA ACCESS FOR ADMIN & TRAINERS
-- 1. Updates admin user to TRUST_ADMIN in public.profiles
-- 2. Bulletproof is_trust_admin() function (checks JWT + profiles id/auth_user_id)
-- 3. Enables organization_code matching for schools and rosters
-- ==============================================================================

-- 1. SET SEARCH PATH
SET search_path = public, auth;

-- 2. ENSURE ADMIN PROFILE HAS TRUST_ADMIN ROLE
UPDATE public.profiles
SET role = 'TRUST_ADMIN',
    organization_code = 'TRST_DIRECT'
WHERE email ILIKE '%admin%' 
   OR full_name ILIKE '%admin%'
   OR role IS NULL;

-- 3. BULLETPROOF HELPER FUNCTIONS (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.is_trust_admin()
RETURNS BOOLEAN AS $$
BEGIN
    -- Check 1: User metadata inside JWT
    IF (auth.jwt() -> 'user_metadata' ->> 'role') = 'TRUST_ADMIN' THEN
        RETURN TRUE;
    END IF;

    -- Check 2: Profiles table using either id or auth_user_id
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE (id = auth.uid() OR auth_user_id = auth.uid())
          AND UPPER(TRIM(COALESCE(role, ''))) = 'TRUST_ADMIN'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION public.current_user_org_id()
RETURNS UUID AS $$
BEGIN
    RETURN (
        SELECT organization_id FROM public.profiles 
        WHERE (id = auth.uid() OR auth_user_id = auth.uid()) 
        LIMIT 1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION public.current_user_org_code()
RETURNS TEXT AS $$
BEGIN
    RETURN (
        SELECT organization_code FROM public.profiles 
        WHERE (id = auth.uid() OR auth_user_id = auth.uid()) 
        LIMIT 1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

-- 4. UPDATE POLICIES FOR SENSITIVE TABLES

-- PROFILES
DROP POLICY IF EXISTS "Profiles self view" ON public.profiles;
DROP POLICY IF EXISTS "Profiles view policy" ON public.profiles;
CREATE POLICY "Profiles view policy" ON public.profiles
    FOR SELECT TO authenticated 
    USING (
        public.is_trust_admin()
        OR auth.uid() = id 
        OR auth.uid() = auth_user_id
        OR (
            organization_code IS NOT NULL 
            AND organization_code = public.current_user_org_code()
        )
    );

DROP POLICY IF EXISTS "Profiles self update basic" ON public.profiles;
CREATE POLICY "Profiles self update basic" ON public.profiles
    FOR UPDATE TO authenticated 
    USING (
        public.is_trust_admin() 
        OR auth.uid() = id 
        OR auth.uid() = auth_user_id
    );

DROP POLICY IF EXISTS "Profiles admin manage" ON public.profiles;
CREATE POLICY "Profiles admin manage" ON public.profiles
    FOR ALL TO authenticated 
    USING (public.is_trust_admin());

-- SCHOOLS
DROP POLICY IF EXISTS "Schools access policy" ON public.schools;
CREATE POLICY "Schools access policy" ON public.schools
    FOR ALL TO authenticated 
    USING (
        public.is_trust_admin()
        OR assigned_trainer_id = auth.uid()
        OR assigned_trainer_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid())
        OR (organization_code IS NOT NULL AND organization_code = public.current_user_org_code())
        OR (organization_id IS NOT NULL AND organization_id = public.current_user_org_id())
    )
    WITH CHECK (
        public.is_trust_admin()
        OR assigned_trainer_id = auth.uid()
        OR assigned_trainer_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid())
        OR (organization_code IS NOT NULL AND organization_code = public.current_user_org_code())
        OR (organization_id IS NOT NULL AND organization_id = public.current_user_org_id())
    );

-- STUDENTS (CHILDREN PII - ACCESSIBLE BY TRUST ADMIN OR ASSIGNED SCOPE)
DROP POLICY IF EXISTS "Students access policy" ON public.students;
CREATE POLICY "Students access policy" ON public.students
    FOR ALL TO authenticated 
    USING (
        public.is_trust_admin()
        OR EXISTS (
            SELECT 1 FROM public.schools s
            WHERE s.id = students.school_id
            AND (
                s.assigned_trainer_id = auth.uid()
                OR s.assigned_trainer_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid())
                OR (s.organization_code IS NOT NULL AND s.organization_code = public.current_user_org_code())
                OR (s.organization_id IS NOT NULL AND s.organization_id = public.current_user_org_id())
            )
        )
    )
    WITH CHECK (
        public.is_trust_admin()
        OR EXISTS (
            SELECT 1 FROM public.schools s
            WHERE s.id = students.school_id
            AND (
                s.assigned_trainer_id = auth.uid()
                OR s.assigned_trainer_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid())
                OR (s.organization_code IS NOT NULL AND s.organization_code = public.current_user_org_code())
                OR (s.organization_id IS NOT NULL AND s.organization_id = public.current_user_org_id())
            )
        )
    );

-- ASSESSMENTS & RESPONSES
DROP POLICY IF EXISTS "Assessments access policy" ON public.assessments;
CREATE POLICY "Assessments access policy" ON public.assessments
    FOR ALL TO authenticated 
    USING (
        public.is_trust_admin()
        OR EXISTS (
            SELECT 1 FROM public.students st
            JOIN public.schools sc ON sc.id = st.school_id
            WHERE st.id = assessments.student_id
            AND (
                sc.assigned_trainer_id = auth.uid()
                OR sc.assigned_trainer_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid())
                OR (sc.organization_code IS NOT NULL AND sc.organization_code = public.current_user_org_code())
                OR (sc.organization_id IS NOT NULL AND sc.organization_id = public.current_user_org_id())
            )
        )
    );

DROP POLICY IF EXISTS "Assessment responses access policy" ON public.assessment_responses;
CREATE POLICY "Assessment responses access policy" ON public.assessment_responses
    FOR ALL TO authenticated 
    USING (
        public.is_trust_admin()
        OR EXISTS (
            SELECT 1 FROM public.assessments a
            JOIN public.students st ON st.id = a.student_id
            JOIN public.schools sc ON sc.id = st.school_id
            WHERE a.id = assessment_responses.assessment_id
            AND (
                sc.assigned_trainer_id = auth.uid()
                OR sc.assigned_trainer_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid())
                OR (sc.organization_code IS NOT NULL AND sc.organization_code = public.current_user_org_code())
                OR (sc.organization_id IS NOT NULL AND sc.organization_id = public.current_user_org_id())
            )
        )
    );

-- SESSION LOGS
DROP POLICY IF EXISTS "Session logs access policy" ON public.session_logs;
CREATE POLICY "Session logs access policy" ON public.session_logs
    FOR ALL TO authenticated 
    USING (
        public.is_trust_admin()
        OR conducted_by = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.schools s
            WHERE s.id = session_logs.school_id
            AND (
                s.assigned_trainer_id = auth.uid()
                OR s.assigned_trainer_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid())
                OR (s.organization_code IS NOT NULL AND s.organization_code = public.current_user_org_code())
                OR (s.organization_id IS NOT NULL AND s.organization_id = public.current_user_org_id())
            )
        )
    );

DROP POLICY IF EXISTS "Session media access policy" ON public.session_media;
CREATE POLICY "Session media access policy" ON public.session_media
    FOR ALL TO authenticated 
    USING (
        public.is_trust_admin()
        OR EXISTS (
            SELECT 1 FROM public.session_logs sl
            WHERE sl.id = session_media.session_log_id
            AND (
                sl.conducted_by = auth.uid()
                OR public.is_trust_admin()
            )
        )
    );

DROP POLICY IF EXISTS "School documents access policy" ON public.school_documents;
CREATE POLICY "School documents access policy" ON public.school_documents
    FOR ALL TO authenticated 
    USING (
        public.is_trust_admin()
        OR uploaded_by = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.schools s
            WHERE s.id = school_documents.school_id
            AND (
                s.assigned_trainer_id = auth.uid()
                OR (s.organization_code IS NOT NULL AND s.organization_code = public.current_user_org_code())
            )
        )
    );

-- 5. VERIFY PROFILES ROW
SELECT id, email, full_name, role, organization_code FROM public.profiles;
