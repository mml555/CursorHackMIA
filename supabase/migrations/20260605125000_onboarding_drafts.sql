-- =============================================================================
-- Onboarding drafts — persisted by the Render onboarding API (services/onboarding-api)
-- Finalized to businesses + listings on POST /onboarding/complete
-- =============================================================================

CREATE TABLE public.onboarding_drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL UNIQUE REFERENCES public.profiles (id) ON DELETE CASCADE,
  step text NOT NULL DEFAULT 'company',
  is_complete boolean NOT NULL DEFAULT false,
  company jsonb NOT NULL DEFAULT '{}'::jsonb,
  offers jsonb NOT NULL DEFAULT '[]'::jsonb,
  needs jsonb NOT NULL DEFAULT '[]'::jsonb,
  social_links jsonb NOT NULL DEFAULT '{}'::jsonb,
  scrape_consent boolean NOT NULL DEFAULT false,
  consent_version text,
  social_step_done boolean NOT NULL DEFAULT false,
  missing_fields text[] NOT NULL DEFAULT ARRAY[]::text[],
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT onboarding_drafts_step_check CHECK (
    step IN ('company', 'services', 'social', 'consent', 'complete')
  )
);

COMMENT ON TABLE public.onboarding_drafts IS
  'Multi-step onboarding state keyed by profile; written by onboarding-api on Render';

CREATE TRIGGER onboarding_drafts_updated_at
  BEFORE UPDATE ON public.onboarding_drafts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX onboarding_drafts_profile_id_idx ON public.onboarding_drafts (profile_id);

ALTER TABLE public.onboarding_drafts ENABLE ROW LEVEL SECURITY;
