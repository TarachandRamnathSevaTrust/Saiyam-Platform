-- ==============================================================================
-- Migration: Pure Manual / Explicit Role Assignment
-- 1. Drops NOT NULL and DEFAULT 'FIELD_TRAINER'
-- 2. New users start with completely EMPTY (NULL) role
-- 3. NO auto-assignment of any role (Admin, Trainer, or Coordinator)
-- 4. You manually type or assign the role whenever you want
-- ==============================================================================

-- 1. Remove NOT NULL and DEFAULT on profiles.role
ALTER TABLE public.profiles ALTER COLUMN role DROP NOT NULL;
ALTER TABLE public.profiles ALTER COLUMN role DROP DEFAULT;

-- 2. Update check constraint to allow NULL (empty) or valid roles
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check 
    CHECK (role IS NULL OR role IN ('TRUST_ADMIN', 'FIELD_TRAINER', 'HEAD_TRAINER', 'ORG_COORDINATOR'));

-- 3. Trigger: never auto-assign ANY role. Leaves role as NULL unless explicitly passed in metadata
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
        organization_code,
        is_active,
        created_at,
        updated_at
    )
    VALUES (
        new.id,
        new.id,
        new.email,
        COALESCE(NULLIF(new.raw_user_meta_data->>'full_name', ''), split_part(new.email, '@', 1)),
        NULLIF(new.raw_user_meta_data->>'role', ''), -- Completely empty (NULL) by default
        NULL,
        NULLIF(new.raw_user_meta_data->>'organization_code', ''),
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

-- 4. Re-bind the trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- 5. Clear the auto-assigned 'FIELD_TRAINER' role on your 'admin' user so it is completely empty
-- (You can then manually type 'TRUST_ADMIN' or any role you want directly in Supabase)
UPDATE public.profiles 
SET role = NULL, organization_code = NULL, organization_id = NULL
WHERE (full_name = 'admin' OR email LIKE 'admin%') AND organization_code IS NULL;
