-- =============================================================================
-- Business profile media — logo + gallery photos (onboarding / discovery)
-- Extends business_discovery_cards with logo_storage_path + photos JSON
-- Storage bucket: business-media (public read)
-- =============================================================================

ALTER TABLE public.businesses
  ADD COLUMN IF NOT EXISTS logo_storage_path text;

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

CREATE TABLE public.business_photos (
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
  'Gallery images for business onboarding and discovery detail panel';

CREATE INDEX business_photos_business_id_idx
  ON public.business_photos (business_id, sort_order, created_at);

CREATE TRIGGER business_photos_updated_at
  BEFORE UPDATE ON public.business_photos
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

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
  'Ordered gallery photos for business profile detail / discovery';

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

DROP FUNCTION IF EXISTS public.get_business_matches(uuid);
DROP FUNCTION IF EXISTS public.get_discovery_deck(uuid);
DROP VIEW IF EXISTS public.business_match_details;
DROP VIEW IF EXISTS public.business_discovery_cards;

CREATE VIEW public.business_discovery_cards AS
SELECT
  b.id AS business_id,
  COALESCE(NULLIF(trim(b.dba), ''), b.legal_name) AS company_name,
  b.legal_name,
  b.dba,
  b.vertical AS industry,
  b.metro,
  b.website,
  b.description,
  b.logo_storage_path,
  public.business_photos_json(b.id) AS photos,
  b.reputation_score,
  b.ratings_count,
  public.business_listings_json(b.id, 'need') AS looking_for,
  public.business_listings_json(b.id, 'offer') AS offering,
  (
    SELECT l.category
    FROM public.listings l
    WHERE l.business_id = b.id
      AND l.listing_type = 'need'
      AND l.is_active = true
    ORDER BY l.created_at
    LIMIT 1
  ) AS primary_looking_for
FROM public.businesses b
WHERE b.status = 'approved';

COMMENT ON VIEW public.business_discovery_cards IS
  'Approved business profiles for swipe deck; includes logo path and photo gallery';

CREATE VIEW public.business_match_details AS
SELECT
  m.id AS match_id,
  m.matched_at,
  pairs.viewer_business_id,
  partner.business_id AS partner_business_id,
  partner.company_name,
  partner.legal_name,
  partner.dba,
  partner.industry,
  partner.metro,
  partner.website,
  partner.description,
  partner.logo_storage_path,
  partner.photos,
  partner.reputation_score,
  partner.ratings_count,
  partner.looking_for,
  partner.offering,
  partner.primary_looking_for
FROM public.business_matches m
CROSS JOIN LATERAL (
  VALUES
    (m.business_a_id, m.business_b_id),
    (m.business_b_id, m.business_a_id)
) AS pairs (viewer_business_id, partner_business_id)
JOIN public.business_discovery_cards partner
  ON partner.business_id = pairs.partner_business_id;

COMMENT ON VIEW public.business_match_details IS
  'Matched partners with profile media and listing summary';

CREATE OR REPLACE FUNCTION public.get_discovery_deck(p_swiper_business_id uuid)
RETURNS SETOF public.business_discovery_cards
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT c.*
  FROM public.business_discovery_cards c
  WHERE c.business_id <> p_swiper_business_id
    AND NOT EXISTS (
      SELECT 1
      FROM public.business_discovery_swipes s
      WHERE s.swiper_business_id = p_swiper_business_id
        AND s.target_business_id = c.business_id
    )
  ORDER BY c.reputation_score DESC NULLS LAST, c.company_name;
$$;

CREATE OR REPLACE FUNCTION public.get_business_matches(p_viewer_business_id uuid)
RETURNS SETOF public.business_match_details
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT m.*
  FROM public.business_match_details m
  WHERE m.viewer_business_id = p_viewer_business_id
  ORDER BY m.matched_at DESC;
$$;

ALTER TABLE public.business_photos ENABLE ROW LEVEL SECURITY;
