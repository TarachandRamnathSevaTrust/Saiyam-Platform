-- ==============================================================================
-- MIGRATION: SUPABASE AUTH TO PROFILES AUTO-SYNC & HIERARCHICAL DATA LINEAGE
-- Architecture: Organization -> Field Trainer (Auth Profile) -> Schools -> Students
-- ==============================================================================

-- 1. Ensure public.profiles has all necessary mapping columns
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS organization_code TEXT;

-- 2. Trigger function to automatically fetch new Supabase Auth users into public.profiles
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

-- Attach trigger to auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- 3. Stored procedure for Trust Admin to assign an Auth Profile to a Field Trainer
CREATE OR REPLACE FUNCTION public.assign_auth_user_to_field_trainer(
    p_profile_id UUID,
    p_organization_id UUID,
    p_role TEXT DEFAULT 'FIELD_TRAINER'
)
RETURNS VOID AS $$
BEGIN
    -- Verify caller is a Trust Admin
    IF NOT public.is_trust_admin() THEN
        RAISE EXCEPTION 'Only Trust Admin can assign trainer profiles';
    END IF;

    UPDATE public.profiles
    SET 
        organization_id = p_organization_id,
        role = p_role,
        updated_at = NOW()
    WHERE id = p_profile_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Ensure Schools enforce both organization and trainer mapping
ALTER TABLE public.schools
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE RESTRICT,
ADD COLUMN IF NOT EXISTS assigned_trainer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- 5. Row-Level Security: Field Trainer Scoping
-- Field trainers see and manage ONLY schools allocated to them or their assigned organization
DROP POLICY IF EXISTS "Trainer scoped school access" ON public.schools;
CREATE POLICY "Trainer scoped school access"
    ON public.schools FOR ALL
    USING (
        public.is_trust_admin() OR
        assigned_trainer_id = auth.uid() OR
        organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
    );

-- Students: Inherit school access policy
DROP POLICY IF EXISTS "Trainer scoped student access" ON public.students;
CREATE POLICY "Trainer scoped student access"
    ON public.students FOR ALL
    USING (
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

-- Comments for documentation
COMMENT ON TABLE public.profiles IS 'User accounts synchronized from auth.users and mapped to partner organizations';
COMMENT ON COLUMN public.schools.assigned_trainer_id IS 'Field trainer responsible for conducting sessions in this school';
COMMENT ON COLUMN public.schools.organization_id IS 'Partner NGO or In-House TRST implementing the program';
