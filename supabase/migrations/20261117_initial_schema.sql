-- ==============================================================================
-- SAIYAM PLATFORM: DATABASE INITIALIZATION & DPDP ACT COMPLIANT SCHEMA
-- Initiative by: Tarachand Ramnath Seva Trust (TRST) & Jnana Prabodhini (JPIP)
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. User Profiles & Role-Based Access Control (RBAC)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('TRUST_ADMIN', 'FIELD_TRAINER', 'HEAD_TRAINER')),
    phone TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Schools / Organizations (शाळा / संस्था)
CREATE TABLE IF NOT EXISTS public.schools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    village TEXT NOT NULL,
    taluka TEXT NOT NULL,
    district TEXT NOT NULL,
    pin_code VARCHAR(10) NOT NULL,
    program_start_date DATE NOT NULL,
    representative_name TEXT NOT NULL,
    representative_contact VARCHAR(20),
    assigned_trainer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Official School Documents (कागदपत्रे अपलोड - मुख्याध्यापक पत्र, शिक्का)
CREATE TABLE IF NOT EXISTS public.school_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL CHECK (document_type IN ('REQUEST_LETTER', 'STAMPED_COMPLETION_SHEET', 'OTHER')),
    title TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_size_bytes BIGINT,
    uploaded_by UUID REFERENCES public.profiles(id),
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Student Rosters (विद्यार्थी नोंदणी)
-- Strictly preserves physical paper bundle sequence number (S-1, S-2...)
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    bundle_sequence_no INT NOT NULL,
    full_name TEXT NOT NULL,
    gender TEXT NOT NULL CHECK (gender IN ('MALE', 'FEMALE', 'OTHER')),
    standard VARCHAR(10) NOT NULL, -- e.g. 7, 8, 9, 10
    division VARCHAR(10) NOT NULL, -- e.g. A, B, C
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_school_class_bundle UNIQUE (school_id, standard, division, bundle_sequence_no)
);

-- 6. Standardized Assessment Questions (MKMH, MMAT, ERT)
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paper_type TEXT NOT NULL CHECK (paper_type IN ('MKMH', 'MMAT', 'ERT')),
    question_number INT NOT NULL,
    text_mr TEXT NOT NULL, -- Marathi text as printed in test bundle
    text_en TEXT NOT NULL, -- English translation
    options JSONB NOT NULL DEFAULT '["CORRECT", "WRONG", "DONT_KNOW"]'::jsonb,
    correct_option TEXT CHECK (correct_option IN ('CORRECT', 'WRONG', 'DONT_KNOW')),
    category TEXT, -- e.g. 'Assertiveness', 'Myth', 'Substance', 'Physiology'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_paper_question UNIQUE (paper_type, question_number)
);

-- 7. Assessment Instances (पूर्व आणि उत्तर चाचण्या)
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

-- 8. Assessment Responses (Individual Answers with Unselect & Blank Support)
CREATE TABLE IF NOT EXISTS public.assessment_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    selected_option TEXT CHECK (selected_option IN ('CORRECT', 'WRONG', 'DONT_KNOW', 'BLANK')),
    is_correct BOOLEAN,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_assessment_question UNIQUE (assessment_id, question_id)
);

-- 9. Curriculum Sessions Master (२५ सत्रे - आराखडा संच)
CREATE TABLE IF NOT EXISTS public.curriculum_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_number INT UNIQUE NOT NULL CHECK (session_number BETWEEN 1 AND 25),
    title_mr TEXT NOT NULL,
    title_en TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Session Logs (सत्र नोंदी - नोंद वही माहिती)
CREATE TABLE IF NOT EXISTS public.session_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    session_number INT NOT NULL REFERENCES public.curriculum_sessions(session_number),
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
    CONSTRAINT unique_school_session UNIQUE (school_id, session_number)
);

-- 11. Session Media Proofs (मिडिया अपलोड - फोटो, ऑडिओ, व्हिडिओ)
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
-- ROW-LEVEL SECURITY (RLS) POLICIES - DPDP ACT (2023) COMPLIANCE
-- ==============================================================================

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

-- Helper functions to check roles
CREATE OR REPLACE FUNCTION public.is_trust_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'TRUST_ADMIN'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles: Users can read their own profile, Trust Admin can read/manage all
CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id OR public.is_trust_admin());

CREATE POLICY "Trust Admins can manage all profiles"
    ON public.profiles FOR ALL
    USING (public.is_trust_admin());

-- Schools: Trust Admins have full access, Trainers access only their assigned schools
CREATE POLICY "Schools access policy"
    ON public.schools FOR ALL
    USING (
        public.is_trust_admin() OR
        assigned_trainer_id = auth.uid() OR
        created_by = auth.uid()
    );

-- School Documents: Tied to school access
CREATE POLICY "School documents policy"
    ON public.school_documents FOR ALL
    USING (
        public.is_trust_admin() OR
        EXISTS (
            SELECT 1 FROM public.schools s
            WHERE s.id = school_documents.school_id
            AND (s.assigned_trainer_id = auth.uid() OR s.created_by = auth.uid())
        )
    );

-- Students: Accessible by school's assigned trainer or Trust Admin
CREATE POLICY "Students access policy"
    ON public.students FOR ALL
    USING (
        public.is_trust_admin() OR
        EXISTS (
            SELECT 1 FROM public.schools s
            WHERE s.id = students.school_id
            AND (s.assigned_trainer_id = auth.uid() OR s.created_by = auth.uid())
        )
    );

-- Questions: Read-only for all authenticated users, editable only by Trust Admin
CREATE POLICY "Questions read access"
    ON public.questions FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Questions admin write access"
    ON public.questions FOR ALL
    USING (public.is_trust_admin());

-- Assessments & Responses: Accessible by school trainer or Trust Admin
CREATE POLICY "Assessments access policy"
    ON public.assessments FOR ALL
    USING (
        public.is_trust_admin() OR
        EXISTS (
            SELECT 1 FROM public.students st
            JOIN public.schools sc ON sc.id = st.school_id
            WHERE st.id = assessments.student_id
            AND (sc.assigned_trainer_id = auth.uid() OR sc.created_by = auth.uid())
        )
    );

CREATE POLICY "Assessment responses policy"
    ON public.assessment_responses FOR ALL
    USING (
        public.is_trust_admin() OR
        EXISTS (
            SELECT 1 FROM public.assessments a
            JOIN public.students st ON st.id = a.student_id
            JOIN public.schools sc ON sc.id = st.school_id
            WHERE a.id = assessment_responses.assessment_id
            AND (sc.assigned_trainer_id = auth.uid() OR sc.created_by = auth.uid())
        )
    );

-- Curriculum Sessions: Read-only master table for all authenticated users
CREATE POLICY "Curriculum sessions viewable by authenticated users"
    ON public.curriculum_sessions FOR SELECT
    TO authenticated
    USING (true);

-- Session Logs & Media: Accessible by school trainer or Trust Admin
CREATE POLICY "Session logs access policy"
    ON public.session_logs FOR ALL
    USING (
        public.is_trust_admin() OR
        EXISTS (
            SELECT 1 FROM public.schools s
            WHERE s.id = session_logs.school_id
            AND (s.assigned_trainer_id = auth.uid() OR s.created_by = auth.uid())
        )
    );

CREATE POLICY "Session media access policy"
    ON public.session_media FOR ALL
    USING (
        public.is_trust_admin() OR
        EXISTS (
            SELECT 1 FROM public.session_logs sl
            JOIN public.schools s ON s.id = sl.school_id
            WHERE sl.id = session_media.session_log_id
            AND (s.assigned_trainer_id = auth.uid() OR s.created_by = auth.uid())
        )
    );

-- ==============================================================================
-- INDEXES FOR MAXIMUM QUERY SPEED & PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_schools_trainer ON public.schools(assigned_trainer_id);
CREATE INDEX IF NOT EXISTS idx_students_school ON public.students(school_id, standard, division);
CREATE INDEX IF NOT EXISTS idx_assessments_student ON public.assessments(student_id, paper_type, phase);
CREATE INDEX IF NOT EXISTS idx_responses_assessment ON public.assessment_responses(assessment_id);
CREATE INDEX IF NOT EXISTS idx_session_logs_school ON public.session_logs(school_id);
