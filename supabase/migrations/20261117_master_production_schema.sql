-- ==============================================================================
-- SAIYAM PLATFORM: MASTER PRODUCTION DATABASE SCHEMA
-- Initiative by: Tarachand Ramnath Seva Trust (TRST), Pune
-- Multi-Tenant, Dynamic Organizations, Financial-Year (FY) Scoped, DPDP Act (2023) Compliant
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. ORGANIZATIONS (अंमलबजावणी संस्था व भागीदार - TRST Direct, Partner NGOs)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    name_mr TEXT NOT NULL,
    name_en TEXT NOT NULL,
    org_type TEXT NOT NULL DEFAULT 'PARTNER_NGO' CHECK (org_type IN ('IN_HOUSE', 'PARTNER_NGO', 'ACADEMIC_INSTITUTE', 'GOVERNMENT', 'OTHER')),
    description TEXT,
    contact_person TEXT,
    contact_phone TEXT,
    contact_email TEXT,
    mou_signed_date DATE,
    mou_document_url TEXT,
    target_schools_count INT DEFAULT 0,
    target_students_count INT DEFAULT 0,
    cost_per_student_inr NUMERIC(10,2) DEFAULT 0.00,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Pre-seed in-house TRST baseline entity (all other NGOs added dynamically)
INSERT INTO public.organizations (code, name_mr, name_en, org_type, description, contact_person)
VALUES ('TRST_DIRECT', 'ताराचंद रामनाथ सेवा ट्रस्ट (थेट)', 'Tarachand Ramnath Seva Trust (TRST Direct)', 'IN_HOUSE', 'TRST internal field facilitation team.', 'Operations Lead')
ON CONFLICT (code) DO NOTHING;

-- ==============================================================================
-- 3. USER PROFILES & SUPABASE AUTH MAPPING (प्रशिक्षक व प्रशासक प्रोफाइल)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'FIELD_TRAINER' CHECK (role IN ('TRUST_ADMIN', 'FIELD_TRAINER', 'HEAD_TRAINER', 'ORG_COORDINATOR')),
    phone TEXT,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
    organization_code TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Automated trigger on auth.users: Populates public.profiles on signup/invite
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (
        id,
        auth_user_id,
        email,
        full_name,
        role,
        organization_id,
        is_active,
        created_at,
        updated_at
    )
    VALUES (
        new.id,
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
        COALESCE(new.raw_user_meta_data->>'role', 'FIELD_TRAINER'),
        (new.raw_user_meta_data->>'organization_id')::uuid,
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

-- Helper function to check if caller is Trust Admin
CREATE OR REPLACE FUNCTION public.is_trust_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'TRUST_ADMIN'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- 4. SCHOOLS (शाळा नोंदणी - FINANCIAL YEAR SCOPED)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.schools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    financial_year VARCHAR(10) NOT NULL DEFAULT '2025-26', -- Tracks year-over-year cohort e.g. 2025-26, 2026-27
    organization_id UUID REFERENCES public.organizations(id) ON DELETE RESTRICT,
    organization_code TEXT,
    name TEXT NOT NULL,
    village TEXT NOT NULL,
    taluka TEXT NOT NULL,
    district TEXT NOT NULL,
    pin_code VARCHAR(10) NOT NULL,
    program_start_date DATE NOT NULL,
    representative_name TEXT NOT NULL, -- e.g. Patil Madam (Headmaster/Nodal Teacher)
    representative_contact VARCHAR(20),
    headmaster_consent_obtained BOOLEAN NOT NULL DEFAULT TRUE,
    consent_document_url TEXT,
    assigned_trainer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_by UUID REFERENCES public.profiles(id),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_school_name_location_fy UNIQUE (name, taluka, financial_year)
);

-- ==============================================================================
-- 5. SCHOOL DOCUMENTS (शाळा कागदपत्रे - मुख्याध्यापक पत्र, शिक्का)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.school_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    financial_year VARCHAR(10) NOT NULL DEFAULT '2025-26',
    document_type TEXT NOT NULL CHECK (document_type IN ('REQUEST_LETTER', 'STAMPED_COMPLETION_SHEET', 'OTHER')),
    title TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_size_bytes BIGINT,
    uploaded_by UUID REFERENCES public.profiles(id),
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 6. STUDENT ROSTERS (विद्यार्थी नोंदणी - PHYSICAL BUNDLE PRESERVATION)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    financial_year VARCHAR(10) NOT NULL DEFAULT '2025-26',
    bundle_sequence_no INT NOT NULL, -- Strictly preserves physical paper bundle number (S-1, S-2...)
    full_name TEXT NOT NULL,
    gender TEXT NOT NULL CHECK (gender IN ('MALE', 'FEMALE', 'OTHER')),
    standard VARCHAR(10) NOT NULL, -- e.g. '8', '9'
    division VARCHAR(10) NOT NULL, -- e.g. 'A', 'B'
    created_by UUID REFERENCES public.profiles(id),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_student_bundle_per_class_fy UNIQUE (school_id, financial_year, standard, division, bundle_sequence_no)
);

-- ==============================================================================
-- 7. STANDARDIZED QUESTIONS (चाचणी प्रश्नावली - MKMH, MMAT, ERT)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paper_type TEXT NOT NULL CHECK (paper_type IN ('MKMH', 'MMAT', 'ERT')),
    question_number INT NOT NULL,
    text_mr TEXT NOT NULL,
    text_en TEXT NOT NULL,
    options JSONB NOT NULL DEFAULT '["CORRECT", "WRONG", "DONT_KNOW"]'::jsonb,
    correct_option TEXT,
    category TEXT,
    marks NUMERIC(4,2) NOT NULL DEFAULT 1.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_paper_question UNIQUE (paper_type, question_number)
);

-- ==============================================================================
-- 8. ASSESSMENTS SUMMARY (पूर्व आणि उत्तर चाचण्या - PRORATED SCORING)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    paper_type TEXT NOT NULL CHECK (paper_type IN ('MKMH', 'MMAT', 'ERT')),
    phase TEXT NOT NULL CHECK (phase IN ('PRE', 'POST')),
    total_questions INT NOT NULL DEFAULT 0,
    answered_count INT NOT NULL DEFAULT 0,
    correct_count INT NOT NULL DEFAULT 0,
    score_percentage NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    completed_at TIMESTAMPTZ,
    recorded_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_student_paper_phase UNIQUE (student_id, paper_type, phase)
);

-- ==============================================================================
-- 9. ASSESSMENT RESPONSES (तपशीलवार उत्तरे - UNSELECT & BLANK SUPPORT)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.assessment_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    selected_option TEXT,
    is_correct BOOLEAN,
    points_awarded NUMERIC(4,2) DEFAULT 0.00,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_assessment_question UNIQUE (assessment_id, question_id)
);

-- ==============================================================================
-- 10. CURRICULUM SESSIONS (२५ सत्रे - मास्टर आराखडा संच)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.curriculum_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_number INT UNIQUE NOT NULL CHECK (session_number BETWEEN 1 AND 25),
    phase_number INT NOT NULL CHECK (phase_number BETWEEN 1 AND 3),
    title_mr TEXT NOT NULL,
    title_en TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 11. SESSION LOGS (सत्र संचलन नोंदी - FINANCIAL YEAR SCOPED)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.session_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    financial_year VARCHAR(10) NOT NULL DEFAULT '2025-26',
    session_number INT NOT NULL,
    conducted_date DATE NOT NULL,
    duration_minutes INT NOT NULL DEFAULT 45,
    total_attendance INT NOT NULL DEFAULT 0,
    girls_present INT NOT NULL DEFAULT 0,
    boys_present INT NOT NULL DEFAULT 0,
    tools_used TEXT,
    special_notes TEXT,
    conducted_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_school_session_fy UNIQUE (school_id, financial_year, session_number)
);

-- ==============================================================================
-- 12. SESSION MEDIA PROOFS (मिडिया अपलोड - फोटो, ऑडिओ, व्हिडिओ)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.session_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_log_id UUID NOT NULL REFERENCES public.session_logs(id) ON DELETE CASCADE,
    media_type TEXT NOT NULL CHECK (media_type IN ('PHOTO', 'AUDIO', 'VIDEO')),
    file_url TEXT NOT NULL,
    file_name TEXT,
    file_size_bytes BIGINT,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 13. HIGH-SPEED REPORTING VIEW (EXECUTIVE IMPACT DELTA BY FY)
-- ==============================================================================
CREATE OR REPLACE VIEW public.school_impact_summary_view AS
SELECT 
    sc.id AS school_id,
    sc.name AS school_name,
    sc.financial_year,
    sc.organization_code,
    sc.assigned_trainer_id,
    COUNT(DISTINCT st.id) AS total_enrolled,
    ROUND(AVG(CASE WHEN a.paper_type = 'MKMH' AND a.phase = 'PRE' THEN a.score_percentage END), 1) AS mkmh_pre_avg,
    ROUND(AVG(CASE WHEN a.paper_type = 'MKMH' AND a.phase = 'POST' THEN a.score_percentage END), 1) AS mkmh_post_avg,
    ROUND(AVG(CASE WHEN a.paper_type = 'MMAT' AND a.phase = 'PRE' THEN a.score_percentage END), 1) AS mmat_pre_avg,
    ROUND(AVG(CASE WHEN a.paper_type = 'MMAT' AND a.phase = 'POST' THEN a.score_percentage END), 1) AS mmat_post_avg,
    ROUND(AVG(CASE WHEN a.paper_type = 'ERT' AND a.phase = 'PRE' THEN a.score_percentage END), 1) AS ert_pre_avg,
    ROUND(AVG(CASE WHEN a.paper_type = 'ERT' AND a.phase = 'POST' THEN a.score_percentage END), 1) AS ert_post_avg
FROM public.schools sc
LEFT JOIN public.students st ON st.school_id = sc.id AND st.is_active = TRUE
LEFT JOIN public.assessments a ON a.student_id = st.id
WHERE sc.is_active = TRUE
GROUP BY sc.id, sc.name, sc.financial_year, sc.organization_code, sc.assigned_trainer_id;

-- ==============================================================================
-- 14. ROW-LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curriculum_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_media ENABLE ROW LEVEL SECURITY;

-- Organizations: Read-only for authenticated trainers, full manage for Trust Admin
CREATE POLICY "Organizations viewable by all authenticated" ON public.organizations
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Organizations managed by Trust Admin" ON public.organizations
    FOR ALL USING (public.is_trust_admin());

-- Profiles: Own profile readable, Trust Admin can manage all
CREATE POLICY "Profiles self view" ON public.profiles
    FOR SELECT TO authenticated USING (auth.uid() = id OR public.is_trust_admin());

CREATE POLICY "Profiles admin manage" ON public.profiles
    FOR ALL USING (public.is_trust_admin());

-- Schools: Trainer accesses assigned schools or org schools, Trust Admin accesses all
CREATE POLICY "Schools access policy" ON public.schools
    FOR ALL USING (
        public.is_trust_admin() OR
        assigned_trainer_id = auth.uid() OR
        created_by = auth.uid() OR
        organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
    );

-- Students: Inherit school access policy
CREATE POLICY "Students access policy" ON public.students
    FOR ALL USING (
        public.is_trust_admin() OR
        EXISTS (
            SELECT 1 FROM public.schools s
            WHERE s.id = students.school_id
            AND (
                s.assigned_trainer_id = auth.uid() OR
                s.organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
            )
        )
    );

-- Assessments & Responses: Inherit school access policy
CREATE POLICY "Assessments access policy" ON public.assessments
    FOR ALL USING (
        public.is_trust_admin() OR
        EXISTS (
            SELECT 1 FROM public.students st
            JOIN public.schools sc ON sc.id = st.school_id
            WHERE st.id = assessments.student_id
            AND (
                sc.assigned_trainer_id = auth.uid() OR
                sc.organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
            )
        )
    );

CREATE POLICY "Responses access policy" ON public.assessment_responses
    FOR ALL USING (
        public.is_trust_admin() OR
        EXISTS (
            SELECT 1 FROM public.assessments a
            JOIN public.students st ON st.id = a.student_id
            JOIN public.schools sc ON sc.id = st.school_id
            WHERE a.id = assessment_responses.assessment_id
            AND (
                sc.assigned_trainer_id = auth.uid() OR
                sc.organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
            )
        )
    );

-- Curriculum Sessions & Questions: Viewable by all authenticated users
CREATE POLICY "Questions readable by authenticated" ON public.questions
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Curriculum readable by authenticated" ON public.curriculum_sessions
    FOR SELECT TO authenticated USING (true);

-- Session logs: Inherit school access policy
CREATE POLICY "Session logs access policy" ON public.session_logs
    FOR ALL USING (
        public.is_trust_admin() OR
        EXISTS (
            SELECT 1 FROM public.schools s
            WHERE s.id = session_logs.school_id
            AND (
                s.assigned_trainer_id = auth.uid() OR
                s.organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
            )
        )
    );

CREATE POLICY "Session media access policy" ON public.session_media
    FOR ALL USING (
        public.is_trust_admin() OR
        EXISTS (
            SELECT 1 FROM public.session_logs sl
            JOIN public.schools s ON s.id = sl.school_id
            WHERE sl.id = session_media.session_log_id
            AND (
                s.assigned_trainer_id = auth.uid() OR
                s.organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
            )
        )
    );

-- ==============================================================================
-- 15. PERFORMANCE INDEXES (OPTIMIZED FOR FY FILTERING & REPORTING)
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_schools_fy ON public.schools(financial_year, organization_code);
CREATE INDEX IF NOT EXISTS idx_schools_trainer ON public.schools(assigned_trainer_id);
CREATE INDEX IF NOT EXISTS idx_students_school_fy ON public.students(school_id, financial_year, standard, division);
CREATE INDEX IF NOT EXISTS idx_assessments_student ON public.assessments(student_id, paper_type, phase);
CREATE INDEX IF NOT EXISTS idx_session_logs_school_fy ON public.session_logs(school_id, financial_year);
