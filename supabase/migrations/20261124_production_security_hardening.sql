-- ==============================================================================
-- PRODUCTION SECURITY HARDENING MIGRATION (PRE-LAUNCH)
-- Saiyam Adolescent Anti-Addiction Platform - Tarachand Ramnath Seva Trust
-- Compliant with Digital Personal Data Protection (DPDP) Act 2023
-- ==============================================================================

-- 1. DROP ALL INSECURE DEVELOPMENT "ALLOW ALL" BYPASS POLICIES
DROP POLICY IF EXISTS "Allow all for organizations" ON public.organizations;
DROP POLICY IF EXISTS "Allow all for schools" ON public.schools;
DROP POLICY IF EXISTS "Allow all for students" ON public.students;
DROP POLICY IF EXISTS "Allow all for assessments" ON public.assessments;
DROP POLICY IF EXISTS "Allow all for assessment_responses" ON public.assessment_responses;
DROP POLICY IF EXISTS "Allow all for session_logs" ON public.session_logs;
DROP POLICY IF EXISTS "Allow all for session_media" ON public.session_media;
DROP POLICY IF EXISTS "Allow all for school_documents" ON public.school_documents;
DROP POLICY IF EXISTS "Allow all for profiles" ON public.profiles;

-- 2. ENSURE RLS IS ENABLED ON ALL SENSITIVE TABLES
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curriculum_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curriculum_sessions ENABLE ROW LEVEL SECURITY;

-- 3. HELPER FUNCTIONS FOR ROLE CHECKS (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.is_trust_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'TRUST_ADMIN'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.current_user_org_id()
RETURNS UUID AS $$
BEGIN
    RETURN (SELECT organization_id FROM public.profiles WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ==============================================================================
-- 4. STRICT ROW LEVEL SECURITY POLICIES
-- ==============================================================================

-- PROFILES:
-- Users can view their own profile; Trust Admins can view/manage all profiles
DROP POLICY IF EXISTS "Profiles self view" ON public.profiles;
CREATE POLICY "Profiles self view" ON public.profiles
    FOR SELECT TO authenticated 
    USING (auth.uid() = id OR public.is_trust_admin());

DROP POLICY IF EXISTS "Profiles self update basic" ON public.profiles;
CREATE POLICY "Profiles self update basic" ON public.profiles
    FOR UPDATE TO authenticated 
    USING (auth.uid() = id OR public.is_trust_admin())
    WITH CHECK (
        -- Ordinary users CANNOT change their own role or organization!
        public.is_trust_admin() OR (
            auth.uid() = id 
            AND role IS NOT DISTINCT FROM (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid())
            AND organization_id IS NOT DISTINCT FROM (SELECT p.organization_id FROM public.profiles p WHERE p.id = auth.uid())
        )
    );

DROP POLICY IF EXISTS "Profiles admin manage" ON public.profiles;
CREATE POLICY "Profiles admin manage" ON public.profiles
    FOR ALL TO authenticated 
    USING (public.is_trust_admin());

-- ORGANIZATIONS:
-- All authenticated users can view organizations; only Trust Admin can add/edit/delete
DROP POLICY IF EXISTS "Organizations viewable by all authenticated" ON public.organizations;
CREATE POLICY "Organizations viewable by all authenticated" ON public.organizations
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Organizations managed by Trust Admin" ON public.organizations;
CREATE POLICY "Organizations managed by Trust Admin" ON public.organizations
    FOR ALL TO authenticated USING (public.is_trust_admin());

-- SCHOOLS:
-- Trust Admin has full access.
-- Trainers and Coordinators can only view & manage schools belonging to their assigned scope or organization.
DROP POLICY IF EXISTS "Schools access policy" ON public.schools;
CREATE POLICY "Schools access policy" ON public.schools
    FOR ALL TO authenticated 
    USING (
        public.is_trust_admin() OR
        assigned_trainer_id = auth.uid() OR
        organization_id = public.current_user_org_id()
    )
    WITH CHECK (
        public.is_trust_admin() OR
        assigned_trainer_id = auth.uid() OR
        organization_id = public.current_user_org_id()
    );

-- STUDENTS (CHILDREN PII - DPDP ACT PROTECTED):
-- Only accessible if the user has access to that specific school!
DROP POLICY IF EXISTS "Students access policy" ON public.students;
CREATE POLICY "Students access policy" ON public.students
    FOR ALL TO authenticated 
    USING (
        public.is_trust_admin() OR
        EXISTS (
            SELECT 1 FROM public.schools s
            WHERE s.id = students.school_id
            AND (
                s.assigned_trainer_id = auth.uid() OR
                s.organization_id = public.current_user_org_id()
            )
        )
    )
    WITH CHECK (
        public.is_trust_admin() OR
        EXISTS (
            SELECT 1 FROM public.schools s
            WHERE s.id = students.school_id
            AND (
                s.assigned_trainer_id = auth.uid() OR
                s.organization_id = public.current_user_org_id()
            )
        )
    );

-- ASSESSMENTS & RESPONSES:
DROP POLICY IF EXISTS "Assessments access policy" ON public.assessments;
CREATE POLICY "Assessments access policy" ON public.assessments
    FOR ALL TO authenticated 
    USING (
        public.is_trust_admin() OR
        EXISTS (
            SELECT 1 FROM public.students st
            JOIN public.schools sc ON sc.id = st.school_id
            WHERE st.id = assessments.student_id
            AND (
                sc.assigned_trainer_id = auth.uid() OR
                sc.organization_id = public.current_user_org_id()
            )
        )
    );

DROP POLICY IF EXISTS "Responses access policy" ON public.assessment_responses;
CREATE POLICY "Responses access policy" ON public.assessment_responses
    FOR ALL TO authenticated 
    USING (
        public.is_trust_admin() OR
        EXISTS (
            SELECT 1 FROM public.assessments a
            JOIN public.students st ON st.id = a.student_id
            JOIN public.schools sc ON sc.id = st.school_id
            WHERE a.id = assessment_responses.assessment_id
            AND (
                sc.assigned_trainer_id = auth.uid() OR
                sc.organization_id = public.current_user_org_id()
            )
        )
    );

-- SESSION LOGS & EVIDENCE PHOTOS:
DROP POLICY IF EXISTS "Session logs access policy" ON public.session_logs;
CREATE POLICY "Session logs access policy" ON public.session_logs
    FOR ALL TO authenticated 
    USING (
        public.is_trust_admin() OR
        EXISTS (
            SELECT 1 FROM public.schools s
            WHERE s.id = session_logs.school_id
            AND (
                s.assigned_trainer_id = auth.uid() OR
                s.organization_id = public.current_user_org_id()
            )
        )
    );

DROP POLICY IF EXISTS "Session media access policy" ON public.session_media;
CREATE POLICY "Session media access policy" ON public.session_media
    FOR ALL TO authenticated 
    USING (
        public.is_trust_admin() OR
        EXISTS (
            SELECT 1 FROM public.session_logs sl
            JOIN public.schools s ON s.id = sl.school_id
            WHERE sl.id = session_media.session_log_id
            AND (
                s.assigned_trainer_id = auth.uid() OR
                s.organization_id = public.current_user_org_id()
            )
        )
    );

-- SCHOOL DOCUMENTS (HM PERMISSION LETTERS & LOGBOOKS):
DROP POLICY IF EXISTS "School documents access policy" ON public.school_documents;
CREATE POLICY "School documents access policy" ON public.school_documents
    FOR ALL TO authenticated 
    USING (
        public.is_trust_admin() OR
        EXISTS (
            SELECT 1 FROM public.schools s
            WHERE s.id = school_documents.school_id
            AND (
                s.assigned_trainer_id = auth.uid() OR
                s.organization_id = public.current_user_org_id()
            )
        )
    );

-- CURRICULUM & QUESTIONS:
-- Read-only for all authenticated users; only Trust Admin can alter
DROP POLICY IF EXISTS "Questions readable by authenticated" ON public.questions;
CREATE POLICY "Questions readable by authenticated" ON public.questions
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Curriculum modules readable" ON public.curriculum_modules;
CREATE POLICY "Curriculum modules readable" ON public.curriculum_modules
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Curriculum sessions readable" ON public.curriculum_sessions;
CREATE POLICY "Curriculum sessions readable" ON public.curriculum_sessions
    FOR SELECT TO authenticated USING (true);
