-- ==============================================================================
-- MIGRATION: MULTI-TENANCY & DYNAMIC ORGANIZATIONS FOR SAIYAM
-- Supports 100% dynamic partner organizations and field trainers managed by TRST
-- ==============================================================================

-- 1. Create Organizations Table
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    name_mr TEXT NOT NULL,
    name_en TEXT NOT NULL,
    org_type TEXT NOT NULL DEFAULT 'PARTNER_NGO',
    description TEXT,
    contact_person TEXT,
    contact_email TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Pre-seed only TRST Direct as baseline in-house entity. All partner orgs are added dynamically.
INSERT INTO public.organizations (code, name_mr, name_en, org_type, description, contact_person) VALUES
('TRST_DIRECT', 'ताराचंद रामनाथ सेवा ट्रस्ट (थेट)', 'Tarachand Ramnath Seva Trust (TRST Direct)', 'IN_HOUSE', 'TRST internal field facilitation team.', 'TRST Operations Lead')
ON CONFLICT (code) DO NOTHING;

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
