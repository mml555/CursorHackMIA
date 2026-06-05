-- =============================================================================
-- Business Banter — migration 2: business profile media
-- Builds on initial schema (profiles + businesses with auth.users RLS)
-- Adds: description, company logo, custom gallery photos
-- Does NOT alter or drop existing tables, triggers, policies, or functions.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Profile copy + logo on businesses (additive columns only)
-- -----------------------------------------------------------------------------

ALTER TABLE public.businesses
  ADD COLUMN IF NOT EXISTS description text;

ALTER TABLE public.businesses
  ADD COLUMN IF NOT EXISTS logo_storage_path text;

COMMENT ON COLUMN public.businesses.description IS
  'Business bio for onboarding and discovery detail (min 10 chars when set)';

COMMENT ON COLUMN public.businesses.logo_storage_path IS
  'Supabase Storage path in business-media bucket; e.g. {business_id}/logo.png';

DO $$
BEGIN
  ALTER TABLE public.businesses
    ADD CONSTRAINT businesses_description_len CHECK (
      description IS NULL OR char_length(trim(description)) >= 10
    );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- -----------------------------------------------------------------------------
-- 2. Custom gallery photos
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.business_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses (id) ON DELETE CASCADE,
  storage_path text NOT NULL,
  file_name text NOT NULL,
  mime_type text,
  caption text,
  sort_order smallint NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT business_photos_caption_len CHECK (
    caption IS NULL OR char_length(trim(caption)) <= 500
  ),
  UNIQUE (business_id, storage_path)
);

COMMENT ON TABLE public.business_photos IS
  'Gallery images uploaded during business onboarding';

CREATE INDEX IF NOT EXISTS business_photos_business_id_idx
  ON public.business_photos (business_id, sort_order, created_at);

-- Reuse existing updated_at trigger function from migration 1
DROP TRIGGER IF EXISTS business_photos_set_updated_at ON public.business_photos;

CREATE TRIGGER business_photos_set_updated_at
  BEFORE UPDATE ON public.business_photos
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- -----------------------------------------------------------------------------
-- 3. Storage bucket (logo + gallery; public read for discovery cards)
-- -----------------------------------------------------------------------------

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'business-media',
  'business-media',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- -----------------------------------------------------------------------------
-- 4. Helpers
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.business_photos_json(p_business_id uuid)
RETURNS json
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    json_agg(
      json_build_object(
        'id', p.id,
        'storage_path', p.storage_path,
        'file_name', p.file_name,
        'mime_type', p.mime_type,
        'caption', p.caption,
        'sort_order', p.sort_order
      )
      ORDER BY p.sort_order, p.created_at
    ),
    '[]'::json
  )
  FROM public.business_photos p
  WHERE p.business_id = p_business_id;
$$;

COMMENT ON FUNCTION public.business_photos_json IS
  'Ordered gallery JSON for a business profile';

CREATE OR REPLACE VIEW public.business_public_profiles AS
SELECT
  b.id AS business_id,
  b.owner_id,
  b.business_name,
  b.industry,
  b.location,
  b.revenue_bracket,
  b.company_size,
  b.estimated_service_value,
  b.description,
  b.logo_storage_path,
  public.business_photos_json(b.id) AS photos,
  b.created_at,
  b.updated_at
FROM public.businesses b;

COMMENT ON VIEW public.business_public_profiles IS
  'Full business profile: name, industry, location, description, logo, photos';

CREATE OR REPLACE FUNCTION public.business_profile_complete(p_business_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.businesses b
    WHERE b.id = p_business_id
      AND b.description IS NOT NULL
      AND char_length(trim(b.description)) >= 10
      AND b.logo_storage_path IS NOT NULL
      AND char_length(trim(b.logo_storage_path)) >= 1
      AND EXISTS (
        SELECT 1
        FROM public.business_photos p
        WHERE p.business_id = b.id
      )
  );
$$;

COMMENT ON FUNCTION public.business_profile_complete IS
  'True when description, logo, and at least one gallery photo are present';

GRANT EXECUTE ON FUNCTION public.business_profile_complete(uuid) TO authenticated;

-- -----------------------------------------------------------------------------
-- 5. RLS for business_photos (same owner pattern as businesses)
-- -----------------------------------------------------------------------------

ALTER TABLE public.business_photos ENABLE ROW LEVEL SECURITY;

-- Owners manage their own business photos
DROP POLICY IF EXISTS "business_photos_select_own" ON public.business_photos;
CREATE POLICY "business_photos_select_own"
  ON public.business_photos FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.businesses b
      WHERE b.id = business_id
        AND b.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "business_photos_insert_own" ON public.business_photos;
CREATE POLICY "business_photos_insert_own"
  ON public.business_photos FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.businesses b
      WHERE b.id = business_id
        AND b.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "business_photos_update_own" ON public.business_photos;
CREATE POLICY "business_photos_update_own"
  ON public.business_photos FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM public.businesses b
      WHERE b.id = business_id
        AND b.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.businesses b
      WHERE b.id = business_id
        AND b.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "business_photos_delete_own" ON public.business_photos;
CREATE POLICY "business_photos_delete_own"
  ON public.business_photos FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM public.businesses b
      WHERE b.id = business_id
        AND b.owner_id = auth.uid()
    )
  );

-- Authenticated users can view photos for discovery / swipe deck
DROP POLICY IF EXISTS "business_photos_select_discovery" ON public.business_photos;
CREATE POLICY "business_photos_select_discovery"
  ON public.business_photos FOR SELECT
  TO authenticated
  USING (true);

-- -----------------------------------------------------------------------------
-- 6. Extend onboarding helper (optional; keeps user_has_business intact)
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.user_has_complete_business_profile()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.businesses b
    WHERE b.owner_id = auth.uid()
      AND public.business_profile_complete(b.id)
  );
$$;

COMMENT ON FUNCTION public.user_has_complete_business_profile IS
  'True when the signed-in user owns a business with description, logo, and photos';

GRANT EXECUTE ON FUNCTION public.user_has_complete_business_profile() TO authenticated;
