-- =============================================================================
-- Reciproca MVP schema (see docs/PRD.md §9)
-- Auth: Clerk (identity) — Supabase is data-only (no auth.users / auth.uid() RLS)
--
-- profiles rows are upserted by the Clerk webhook (user.created / user.updated)
-- via service role — see src/app/api/webhooks/clerk and src/lib/clerk/admin.ts
--
-- MVP: Route Handlers validate Clerk sessions, then query with service role.
-- RLS is enabled deny-by-default; policies added in Phase 2 with Clerk JWT.
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

CREATE TYPE public.business_status AS ENUM (
  'pending',
  'approved',
  'rejected',
  'suspended'
);

CREATE TYPE public.listing_type AS ENUM ('offer', 'need');

CREATE TYPE public.proposal_status AS ENUM (
  'draft',
  'published',
  'pending_acceptance',
  'matched',
  'confirmed',
  'in_progress',
  'completed',
  'rated',
  'cancelled',
  'disputed'
);

CREATE TYPE public.swipe_action AS ENUM ('interested', 'pass', 'save');

CREATE TYPE public.member_role AS ENUM ('owner', 'member');

CREATE TYPE public.trade_type AS ENUM ('direct', 'multi_party');

-- ---------------------------------------------------------------------------
-- Shared trigger: updated_at
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ---------------------------------------------------------------------------
-- profiles — synced from Clerk webhooks (clerk_user_id = Clerk user id)
-- ---------------------------------------------------------------------------

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id text NOT NULL UNIQUE,
  email text NOT NULL,
  full_name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT profiles_email_format CHECK (
    email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  )
);

COMMENT ON TABLE public.profiles IS
  'Account holder; clerk_user_id is the Clerk user id (user_…). Synced via webhook.';
COMMENT ON COLUMN public.profiles.full_name IS
  'Derived from Clerk first_name + last_name on user.created / user.updated';

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX profiles_clerk_user_id_idx ON public.profiles (clerk_user_id);
CREATE INDEX profiles_email_idx ON public.profiles (lower(email));

-- ---------------------------------------------------------------------------
-- businesses
-- ---------------------------------------------------------------------------

CREATE TABLE public.businesses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  legal_name text NOT NULL,
  dba text,
  slug text UNIQUE,
  metro text,
  vertical text,
  website text,
  description text,
  status public.business_status NOT NULL DEFAULT 'pending',
  reputation_score numeric(4, 2),
  ratings_count integer NOT NULL DEFAULT 0,
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT businesses_legal_name_len CHECK (char_length(trim(legal_name)) >= 2),
  CONSTRAINT businesses_slug_format CHECK (
    slug IS NULL OR slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
  )
);

COMMENT ON TABLE public.businesses IS
  'Vetted business record; membership via business_members';

CREATE TRIGGER businesses_updated_at
  BEFORE UPDATE ON public.businesses
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX businesses_status_idx ON public.businesses (status);
CREATE INDEX businesses_metro_vertical_idx ON public.businesses (metro, vertical);

-- ---------------------------------------------------------------------------
-- business_members — MVP: one business per user enforced in app layer
-- ---------------------------------------------------------------------------

CREATE TABLE public.business_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  business_id uuid NOT NULL REFERENCES public.businesses (id) ON DELETE CASCADE,
  role public.member_role NOT NULL DEFAULT 'owner',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (profile_id, business_id)
);

CREATE INDEX business_members_business_id_idx ON public.business_members (business_id);
CREATE INDEX business_members_profile_id_idx ON public.business_members (profile_id);

-- ---------------------------------------------------------------------------
-- listings — offers and needs
-- ---------------------------------------------------------------------------

CREATE TABLE public.listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses (id) ON DELETE CASCADE,
  listing_type public.listing_type NOT NULL,
  category text NOT NULL,
  unit text NOT NULL,
  quantity numeric(12, 2) NOT NULL DEFAULT 1,
  fmv_estimate numeric(12, 2),
  notes text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER listings_updated_at
  BEFORE UPDATE ON public.listings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX listings_business_id_idx ON public.listings (business_id);
CREATE INDEX listings_type_active_idx ON public.listings (listing_type, is_active);

-- ---------------------------------------------------------------------------
-- trade_proposals
-- ---------------------------------------------------------------------------

CREATE TABLE public.trade_proposals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  summary text,
  trade_type public.trade_type NOT NULL DEFAULT 'direct',
  status public.proposal_status NOT NULL DEFAULT 'draft',
  version_id uuid NOT NULL DEFAULT gen_random_uuid(),
  snapshot jsonb,
  cash_topup_display numeric(12, 2),
  metro text,
  vertical text,
  created_by_clerk_id text,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER trade_proposals_updated_at
  BEFORE UPDATE ON public.trade_proposals
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX trade_proposals_status_idx ON public.trade_proposals (status);
CREATE INDEX trade_proposals_published_at_idx ON public.trade_proposals (published_at DESC);

-- ---------------------------------------------------------------------------
-- proposal_parties
-- ---------------------------------------------------------------------------

CREATE TABLE public.proposal_parties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id uuid NOT NULL REFERENCES public.trade_proposals (id) ON DELETE CASCADE,
  business_id uuid NOT NULL REFERENCES public.businesses (id) ON DELETE RESTRICT,
  give_lines jsonb NOT NULL DEFAULT '[]'::jsonb,
  receive_lines jsonb NOT NULL DEFAULT '[]'::jsonb,
  estimated_fmv numeric(12, 2),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (proposal_id, business_id)
);

CREATE INDEX proposal_parties_business_id_idx ON public.proposal_parties (business_id);

-- ---------------------------------------------------------------------------
-- proposal_swipes — deck actions
-- ---------------------------------------------------------------------------

CREATE TABLE public.proposal_swipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id uuid NOT NULL REFERENCES public.trade_proposals (id) ON DELETE CASCADE,
  business_id uuid NOT NULL REFERENCES public.businesses (id) ON DELETE CASCADE,
  action public.swipe_action NOT NULL,
  reason_tags text[] DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (proposal_id, business_id)
);

CREATE TRIGGER proposal_swipes_updated_at
  BEFORE UPDATE ON public.proposal_swipes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX proposal_swipes_business_id_idx ON public.proposal_swipes (business_id);

-- ---------------------------------------------------------------------------
-- proposal_acceptances — explicit confirm for match
-- ---------------------------------------------------------------------------

CREATE TABLE public.proposal_acceptances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id uuid NOT NULL REFERENCES public.trade_proposals (id) ON DELETE CASCADE,
  business_id uuid NOT NULL REFERENCES public.businesses (id) ON DELETE CASCADE,
  tax_acknowledged boolean NOT NULL DEFAULT false,
  accepted_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (proposal_id, business_id)
);

CREATE INDEX proposal_acceptances_proposal_id_idx ON public.proposal_acceptances (proposal_id);

-- ---------------------------------------------------------------------------
-- trade_events — audit log
-- ---------------------------------------------------------------------------

CREATE TABLE public.trade_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id uuid NOT NULL REFERENCES public.trade_proposals (id) ON DELETE CASCADE,
  from_status public.proposal_status,
  to_status public.proposal_status NOT NULL,
  actor_clerk_id text,
  actor_business_id uuid REFERENCES public.businesses (id) ON DELETE SET NULL,
  payload jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX trade_events_proposal_id_idx ON public.trade_events (proposal_id, created_at DESC);

-- ---------------------------------------------------------------------------
-- vendor_ratings
-- ---------------------------------------------------------------------------

CREATE TABLE public.vendor_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trade_id uuid NOT NULL REFERENCES public.trade_proposals (id) ON DELETE CASCADE,
  rater_business_id uuid NOT NULL REFERENCES public.businesses (id) ON DELETE CASCADE,
  rated_business_id uuid NOT NULL REFERENCES public.businesses (id) ON DELETE CASCADE,
  score smallint NOT NULL CHECK (score BETWEEN 1 AND 5),
  tags text[] DEFAULT '{}',
  comment text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (trade_id, rater_business_id, rated_business_id),
  CHECK (rater_business_id <> rated_business_id)
);

CREATE INDEX vendor_ratings_rated_business_id_idx ON public.vendor_ratings (rated_business_id);

-- ---------------------------------------------------------------------------
-- invoices
-- ---------------------------------------------------------------------------

CREATE TABLE public.invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trade_id uuid NOT NULL REFERENCES public.trade_proposals (id) ON DELETE CASCADE,
  business_id uuid NOT NULL REFERENCES public.businesses (id) ON DELETE CASCADE,
  storage_path text,
  line_items jsonb NOT NULL DEFAULT '[]'::jsonb,
  total_fmv numeric(12, 2),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX invoices_trade_id_idx ON public.invoices (trade_id);

-- ---------------------------------------------------------------------------
-- verification_documents — private bucket references
-- ---------------------------------------------------------------------------

CREATE TABLE public.verification_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses (id) ON DELETE CASCADE,
  storage_path text NOT NULL,
  file_name text NOT NULL,
  mime_type text,
  reviewed_at timestamptz,
  reviewed_by_clerk_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX verification_documents_business_id_idx ON public.verification_documents (business_id);

-- ---------------------------------------------------------------------------
-- Helper: onboarding gate (Phase 2 — requires Clerk JWT in Supabase)
-- MVP: use getBusinessWithMembership() in app code instead.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.user_has_business()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.business_members bm
    JOIN public.profiles p ON p.id = bm.profile_id
    WHERE p.clerk_user_id = auth.jwt() ->> 'sub'
  );
$$;

COMMENT ON FUNCTION public.user_has_business() IS
  'Returns true when JWT sub matches a profile with a business_members row. '
  'Requires Clerk third-party auth JWT (Phase 2). MVP uses service role + app checks.';

-- ---------------------------------------------------------------------------
-- RLS — deny-by-default; MVP uses service role + Clerk checks in app code
-- ---------------------------------------------------------------------------

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trade_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposal_parties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposal_swipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposal_acceptances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trade_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_documents ENABLE ROW LEVEL SECURITY;

-- Phase 2: add policies when Clerk JWT is wired into Supabase
-- (https://clerk.com/docs/integrations/databases/supabase)
