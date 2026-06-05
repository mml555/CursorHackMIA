-- =============================================================================
-- Reciproca dev seed — discovery swipes + demo interest
-- Businesses/listings: scripts/seed-random-businesses.mjs (50 Austin businesses)
-- Run via: npm run db:reset
-- =============================================================================

-- Pre-seeded discovery interest (demo focal business → top matches)
INSERT INTO public.business_discovery_swipes (
  swiper_business_id,
  target_business_id,
  action
) VALUES
  (
    '10000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000002',
    'interested'
  ),
  (
    '10000000-0000-4000-8000-000000000003',
    '10000000-0000-4000-8000-000000000001',
    'interested'
  )
ON CONFLICT (swiper_business_id, target_business_id) DO UPDATE SET
  action = EXCLUDED.action;
