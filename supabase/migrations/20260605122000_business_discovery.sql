-- =============================================================================
-- Business discovery matching — swipe deck + mutual matches
--
-- UX flow:
--   1. Deck: approved businesses the viewer has not swiped on yet
--   2. Card shows company name, industry (vertical), primary "looking for" needs
--   3. Expand/dropdown reveals full profile + all active offer/need listings
--   4. Swipe interested / pass (save optional) → business_discovery_swipes
--   5. Mutual interested → business_matches
--
-- Distinct from proposal_swipes (admin-authored trade proposals).
-- Profile media columns/views extended in 20260605123000_business_profile_media.sql
-- =============================================================================

CREATE TABLE public.business_discovery_swipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  swiper_business_id uuid NOT NULL REFERENCES public.businesses (id) ON DELETE CASCADE,
  target_business_id uuid NOT NULL REFERENCES public.businesses (id) ON DELETE CASCADE,
  action public.swipe_action NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT business_discovery_swipes_no_self CHECK (swiper_business_id <> target_business_id),
  UNIQUE (swiper_business_id, target_business_id)
);

COMMENT ON TABLE public.business_discovery_swipes IS
  'Member swipes on other approved businesses before a trade proposal exists';

CREATE TRIGGER business_discovery_swipes_updated_at
  BEFORE UPDATE ON public.business_discovery_swipes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX business_discovery_swipes_swiper_idx
  ON public.business_discovery_swipes (swiper_business_id);

CREATE INDEX business_discovery_swipes_target_idx
  ON public.business_discovery_swipes (target_business_id);

CREATE INDEX business_discovery_swipes_swiper_action_idx
  ON public.business_discovery_swipes (swiper_business_id, action);

CREATE TABLE public.business_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_a_id uuid NOT NULL REFERENCES public.businesses (id) ON DELETE CASCADE,
  business_b_id uuid NOT NULL REFERENCES public.businesses (id) ON DELETE CASCADE,
  matched_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT business_matches_canonical_pair CHECK (business_a_id < business_b_id),
  CONSTRAINT business_matches_no_self CHECK (business_a_id <> business_b_id),
  UNIQUE (business_a_id, business_b_id)
);

COMMENT ON TABLE public.business_matches IS
  'Mutual interested swipes between two businesses; one row per unordered pair';

CREATE INDEX business_matches_business_a_idx ON public.business_matches (business_a_id);
CREATE INDEX business_matches_business_b_idx ON public.business_matches (business_b_id);
CREATE INDEX business_matches_matched_at_idx ON public.business_matches (matched_at DESC);

CREATE OR REPLACE FUNCTION public.create_business_match_if_mutual()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  a_id uuid;
  b_id uuid;
BEGIN
  IF NEW.action <> 'interested' THEN
    RETURN NEW;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.business_discovery_swipes s
    WHERE s.swiper_business_id = NEW.target_business_id
      AND s.target_business_id = NEW.swiper_business_id
      AND s.action = 'interested'
  ) THEN
    RETURN NEW;
  END IF;

  IF NEW.swiper_business_id < NEW.target_business_id THEN
    a_id := NEW.swiper_business_id;
    b_id := NEW.target_business_id;
  ELSE
    a_id := NEW.target_business_id;
    b_id := NEW.swiper_business_id;
  END IF;

  INSERT INTO public.business_matches (business_a_id, business_b_id)
  VALUES (a_id, b_id)
  ON CONFLICT (business_a_id, business_b_id) DO NOTHING;

  RETURN NEW;
END;
$$;

CREATE TRIGGER business_discovery_swipes_create_match
  AFTER INSERT OR UPDATE OF action ON public.business_discovery_swipes
  FOR EACH ROW
  EXECUTE FUNCTION public.create_business_match_if_mutual();

CREATE OR REPLACE FUNCTION public.business_listings_json(
  p_business_id uuid,
  p_listing_type public.listing_type
)
RETURNS json
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    json_agg(
      json_build_object(
        'id', l.id,
        'category', l.category,
        'unit', l.unit,
        'quantity', l.quantity,
        'fmv_estimate', l.fmv_estimate,
        'notes', l.notes
      )
      ORDER BY l.created_at
    ),
    '[]'::json
  )
  FROM public.listings l
  WHERE l.business_id = p_business_id
    AND l.listing_type = p_listing_type
    AND l.is_active = true;
$$;

COMMENT ON FUNCTION public.business_listings_json IS
  'Active offer or need listings for discovery card detail panels';

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
  'Approved business profiles for swipe deck; industry = vertical';

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
  'One row per match per participant; join on viewer_business_id for my matches';

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

ALTER TABLE public.business_discovery_swipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_matches ENABLE ROW LEVEL SECURITY;
