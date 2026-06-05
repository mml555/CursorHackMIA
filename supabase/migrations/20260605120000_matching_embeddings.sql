-- Matching: pgvector embeddings on listings + auto-proposal metadata
-- See src/lib/matching/db/

CREATE EXTENSION IF NOT EXISTS vector;

-- ---------------------------------------------------------------------------
-- listing_embeddings — semantic vectors for offer↔need matching
-- ---------------------------------------------------------------------------

CREATE TABLE public.listing_embeddings (
  listing_id uuid PRIMARY KEY REFERENCES public.listings (id) ON DELETE CASCADE,
  embedding vector(1536) NOT NULL,
  model text NOT NULL DEFAULT 'text-embedding-3-small',
  content_hash text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.listing_embeddings IS
  'OpenAI-scale embeddings of listing category + notes + business context; content_hash skips re-embed on unchanged text.';

CREATE INDEX listing_embeddings_updated_at_idx
  ON public.listing_embeddings (updated_at DESC);

-- ---------------------------------------------------------------------------
-- trade_proposals — auto-matcher provenance
-- ---------------------------------------------------------------------------

ALTER TABLE public.trade_proposals
  ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS match_score numeric(6, 4),
  ADD COLUMN IF NOT EXISTS match_reason jsonb;

ALTER TABLE public.trade_proposals
  DROP CONSTRAINT IF EXISTS trade_proposals_source_check;

ALTER TABLE public.trade_proposals
  ADD CONSTRAINT trade_proposals_source_check
  CHECK (source IN ('manual', 'auto'));

COMMENT ON COLUMN public.trade_proposals.source IS 'manual = admin builder; auto = matching engine';
COMMENT ON COLUMN public.trade_proposals.match_score IS 'Rank score from findMatches() when source=auto';
COMMENT ON COLUMN public.trade_proposals.match_reason IS 'Scoring breakdown JSON from matcher';

-- ---------------------------------------------------------------------------
-- RLS (deny-by-default; MVP uses service role + app checks)
-- ---------------------------------------------------------------------------

ALTER TABLE public.listing_embeddings ENABLE ROW LEVEL SECURITY;
