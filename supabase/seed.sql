-- =============================================================================
-- Reciproca dev seed — Austin wellness network (matches demo UI)
-- Run via: npm run db:reset
-- =============================================================================

-- Fixed UUIDs for stable references in tests and demo focal business
INSERT INTO public.businesses (
  id,
  legal_name,
  dba,
  slug,
  metro,
  vertical,
  website,
  description,
  status,
  reputation_score,
  ratings_count
) VALUES
  (
    '10000000-0000-4000-8000-000000000001',
    'Sunrise Yoga Studio LLC',
    'Sunrise Yoga Studio',
    'sunrise-yoga-studio',
    'Austin',
    'Wellness',
    'https://sunriseyoga.example.com',
    'Boutique yoga studio offering group and private sessions for local businesses.',
    'approved',
    4.90,
    24
  ),
  (
    '10000000-0000-4000-8000-000000000002',
    'Luminary Studio LLC',
    'Luminary Studio',
    'luminary-studio',
    'Austin',
    'Photography',
    'https://luminary.example.com',
    'Brand and product photography for small businesses and creative teams.',
    'approved',
    4.80,
    31
  ),
  (
    '10000000-0000-4000-8000-000000000003',
    'Verde Social LLC',
    'Verde Social',
    'verde-social',
    'Austin',
    'Social agency',
    'https://verdesocial.example.com',
    'Social media management and content strategy for local service brands.',
    'approved',
    4.70,
    19
  ),
  (
    '10000000-0000-4000-8000-000000000004',
    'Hill Country Massage LLC',
    'Hill Country Massage',
    'hill-country-massage',
    'Austin',
    'Wellness',
    'https://hillcountrymassage.example.com',
    'Licensed massage therapy for teams and wellness programs.',
    'approved',
    4.60,
    12
  ),
  (
    '10000000-0000-4000-8000-000000000005',
    'Lone Star Bookkeeping LLC',
    'Lone Star Bookkeeping',
    'lone-star-bookkeeping',
    'Austin',
    'Finance',
    'https://lonestarbooks.example.com',
    'Monthly bookkeeping and financial reporting for small businesses.',
    'approved',
    4.90,
    28
  ),
  (
    '10000000-0000-4000-8000-000000000006',
    'ATX Web Co LLC',
    'ATX Web Co',
    'atx-web-co',
    'Austin',
    'Web design',
    'https://atxweb.example.com',
    'Web design and development for local service businesses.',
    'approved',
    4.50,
    9
  )
ON CONFLICT (id) DO UPDATE SET
  legal_name = EXCLUDED.legal_name,
  dba = EXCLUDED.dba,
  slug = EXCLUDED.slug,
  metro = EXCLUDED.metro,
  vertical = EXCLUDED.vertical,
  website = EXCLUDED.website,
  description = EXCLUDED.description,
  status = EXCLUDED.status,
  reputation_score = EXCLUDED.reputation_score,
  ratings_count = EXCLUDED.ratings_count;

-- Offers and needs
INSERT INTO public.listings (
  id,
  business_id,
  listing_type,
  category,
  unit,
  quantity,
  fmv_estimate,
  notes,
  is_active
) VALUES
  -- Sunrise Yoga
  (
    '20000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000001',
    'offer',
    'Yoga classes',
    'sessions',
    4,
    800,
    '60-minute yoga classes, 4x/month',
    true
  ),
  (
    '20000000-0000-4000-8000-000000000002',
    '10000000-0000-4000-8000-000000000001',
    'need',
    'Brand photography',
    'project',
    1,
    1500,
    'Brand photography for studio marketing',
    true
  ),
  -- Luminary Studio
  (
    '20000000-0000-4000-8000-000000000003',
    '10000000-0000-4000-8000-000000000002',
    'offer',
    'Brand photography',
    'project',
    1,
    1800,
    'Brand and product photography',
    true
  ),
  (
    '20000000-0000-4000-8000-000000000004',
    '10000000-0000-4000-8000-000000000002',
    'need',
    'Wellness sessions',
    'sessions',
    6,
    900,
    'Weekly wellness sessions for a team of 6',
    true
  ),
  -- Verde Social
  (
    '20000000-0000-4000-8000-000000000005',
    '10000000-0000-4000-8000-000000000003',
    'offer',
    'Social media management',
    'months',
    3,
    2400,
    'Social management and audience growth',
    true
  ),
  (
    '20000000-0000-4000-8000-000000000006',
    '10000000-0000-4000-8000-000000000003',
    'need',
    'Studio video content',
    'hours',
    8,
    1200,
    'On-site video content for social campaigns',
    true
  ),
  -- Hill Country Massage
  (
    '20000000-0000-4000-8000-000000000007',
    '10000000-0000-4000-8000-000000000004',
    'offer',
    'Massage therapy',
    'hours',
    10,
    1000,
    'Massage therapy hours for wellness programs',
    true
  ),
  (
    '20000000-0000-4000-8000-000000000008',
    '10000000-0000-4000-8000-000000000004',
    'need',
    'Bookkeeping',
    'months',
    3,
    900,
    'Monthly bookkeeping support',
    true
  ),
  -- Lone Star Bookkeeping
  (
    '20000000-0000-4000-8000-000000000009',
    '10000000-0000-4000-8000-000000000005',
    'offer',
    'Bookkeeping',
    'months',
    3,
    1200,
    'Monthly bookkeeping and reporting',
    true
  ),
  (
    '20000000-0000-4000-8000-000000000010',
    '10000000-0000-4000-8000-000000000005',
    'need',
    'Marketing',
    'months',
    2,
    1600,
    'Marketing support for client acquisition',
    true
  ),
  -- ATX Web Co
  (
    '20000000-0000-4000-8000-000000000011',
    '10000000-0000-4000-8000-000000000006',
    'offer',
    'Web design',
    'project',
    1,
    3500,
    'Web design and build for service businesses',
    true
  ),
  (
    '20000000-0000-4000-8000-000000000012',
    '10000000-0000-4000-8000-000000000006',
    'need',
    'Office wellness program',
    'sessions',
    8,
    1200,
    'Recurring on-site wellness sessions for staff',
    true
  )
ON CONFLICT (id) DO UPDATE SET
  business_id = EXCLUDED.business_id,
  listing_type = EXCLUDED.listing_type,
  category = EXCLUDED.category,
  unit = EXCLUDED.unit,
  quantity = EXCLUDED.quantity,
  fmv_estimate = EXCLUDED.fmv_estimate,
  notes = EXCLUDED.notes,
  is_active = EXCLUDED.is_active;
