-- ==============================================================================
-- MIGRATION: MULTI-TENANCY & IMPLEMENTING ORGANIZATIONS FOR SAIYAM
-- Supports: TRST Direct (In-house), JPIP (Jnana Prabodhini), VOPA (Partner)
-- ==============================================================================

-- 1. Create Organizations Table
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE CHECK (code IN ('TRST_DIRECT', 'JPIP', 'VOPA', 'OTHER')),
    name_mr TEXT NOT NULL,
    name_en TEXT NOT NULL,
    org_type TEXT NOT NULL CHECK (org_type IN ('IN_HOUSE', 'PARTNER_NGO', 'ACADEMIC_INSTITUTE')),
    description TEXT,
    contact_person TEXT,
    contact_email TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Pre-seed the 3 official implementing partners discussed in the Trust strategy
INSERT INTO public.organizations (code, name_mr, name_en, org_type, description, contact_person) VALUES
('TRST_DIRECT', 'ताराचंद रामनाथ सेवा ट्रस्ट (थेट)', 'TRST Direct (In-House)', 'IN_HOUSE', 'TRST internal field facilitation team conducting direct school sessions and test bundles.', 'Anagha Kadolkar'),
('JPIP', 'ज्ञान प्रबोधिनी संशोधन संस्था (JPIP)', 'Jnana Prabodhini (JPIP)', 'PARTNER_NGO', 'Academic & research partner managing 14-25 field trainers across designated school clusters.', 'Sandhya Tai / JPIP Coord'),
('VOPA', 'व्होपा (Vowels of People Association)', 'VOPA (Vowels of People Association)', 'PARTNER_NGO', 'Digital education partner implementing Saiyam through dedicated school batches.', 'VOPA Program Lead')
ON CONFLICT (code) DO UPDATE SET
    name_mr = EXCLUDED.name_mr,
    name_en = EXCLUDED.name_en;

-- 2. Link Schools to Organizations
ALTER TABLE public.schools
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE RESTRICT;

-- By default, assign existing schools to TRST_DIRECT if null
UPDATE public.schools
SET organization_id = (SELECT id FROM public.organizations WHERE code = 'TRST_DIRECT')
WHERE organization_id IS NULL;

-- 3. Link User Profiles to Organizations
-- NULL organization_id means global TRUST_ADMIN who monitors all organizations
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL;

-- 4. Enable Row-Level Security Scoping for Organizations
-- Field Trainers only see schools in their assigned organization
DROP POLICY IF EXISTS "Trainers manage own org schools" ON public.schools;
CREATE POLICY "Trainers manage own org schools" ON public.schools
    FOR ALL
    USING (
        -- Trust admin can see all schools
        auth.jwt() ->> 'role' = 'TRUST_ADMIN'
        OR
        -- Field trainer sees only schools belonging to their assigned organization
        organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
    );

COMMENT ON TABLE public.organizations IS 'Implementing organizations under Saiyam: TRST Direct, JPIP, VOPA';
