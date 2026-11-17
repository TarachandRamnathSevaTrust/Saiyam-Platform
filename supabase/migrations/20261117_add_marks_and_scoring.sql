-- Migration: Add custom marks weightage and flexible option scoring for ~90 questions per paper
-- Aligns with TRST Saiyam assessment requirements

ALTER TABLE public.questions 
ADD COLUMN IF NOT EXISTS marks NUMERIC(5,2) NOT NULL DEFAULT 1.00,
ADD COLUMN IF NOT EXISTS scoring_rubric JSONB DEFAULT NULL;

-- Remove rigid CHECK constraint on correct_option if present to accommodate ERT 4-point Likert scales
ALTER TABLE public.questions DROP CONSTRAINT IF EXISTS questions_correct_option_check;

-- Ensure assessment_responses can record exact points awarded per question
ALTER TABLE public.assessment_responses
ADD COLUMN IF NOT EXISTS points_awarded NUMERIC(5,2) DEFAULT 0.00;

-- Comments explaining DPDP compliance and scoring
COMMENT ON COLUMN public.questions.marks IS 'Weightage marks for this question (supports decimal marks up to 999.99)';
COMMENT ON COLUMN public.questions.scoring_rubric IS 'Optional weighted scoring mapping for Likert scales (e.g. {"ALWAYS": 3, "OFTEN": 2, "SOMETIMES": 1, "NEVER": 0})';
COMMENT ON COLUMN public.assessment_responses.points_awarded IS 'Points scored by student on this specific question based on question marks and rubric';
