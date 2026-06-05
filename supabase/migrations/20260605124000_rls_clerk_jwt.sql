-- =============================================================================
-- RLS helpers + member policies for Clerk JWT (Phase 2 client access)
--
-- MVP API routes use SUPABASE_SERVICE_ROLE_KEY and bypass RLS — unchanged.
-- Enable Clerk third-party auth in Supabase + pass Clerk session token to the
-- Supabase client when using browser/server user-scoped clients.
--
-- https://clerk.com/docs/integrations/databases/supabase
-- =============================================================================

-- ---------------------------------------------------------------------------
-- JWT helpers (Clerk sub = profiles.clerk_user_id)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.requesting_clerk_user_id()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT NULLIF(trim(auth.jwt() ->> 'sub'), '');
$$;

COMMENT ON FUNCTION public.requesting_clerk_user_id IS
  'Clerk user id from JWT sub claim; NULL when unauthenticated or service role';

CREATE OR REPLACE FUNCTION public.current_profile_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id
  FROM public.profiles p
  WHERE p.clerk_user_id = public.requesting_clerk_user_id()
  LIMIT 1;
$$;

COMMENT ON FUNCTION public.current_profile_id IS
  'profiles.id for the authenticated Clerk user; NULL if no profile row';

CREATE OR REPLACE FUNCTION public.is_member_of_business(p_business_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.business_members bm
    WHERE bm.business_id = p_business_id
      AND bm.profile_id = public.current_profile_id()
  );
$$;

CREATE OR REPLACE FUNCTION public.is_app_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (auth.jwt() -> 'public_metadata' ->> 'role') = 'admin',
    false
  );
$$;

COMMENT ON FUNCTION public.is_app_admin IS
  'True when Clerk publicMetadata.role is admin; server routes also check Clerk API';

-- Replace onboarding helper to use shared clerk_user_id() pattern
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
    WHERE bm.profile_id = public.current_profile_id()
  );
$$;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------

CREATE POLICY profiles_select_own
  ON public.profiles FOR SELECT
  TO authenticated
  USING (clerk_user_id = public.requesting_clerk_user_id());

CREATE POLICY profiles_update_own
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (clerk_user_id = public.requesting_clerk_user_id())
  WITH CHECK (clerk_user_id = public.requesting_clerk_user_id());

-- ---------------------------------------------------------------------------
-- business_members
-- ---------------------------------------------------------------------------

CREATE POLICY business_members_select_own
  ON public.business_members FOR SELECT
  TO authenticated
  USING (profile_id = public.current_profile_id());

CREATE POLICY business_members_insert_own
  ON public.business_members FOR INSERT
  TO authenticated
  WITH CHECK (profile_id = public.current_profile_id());

-- ---------------------------------------------------------------------------
-- businesses — members see own; approved profiles visible for discovery
-- ---------------------------------------------------------------------------

CREATE POLICY businesses_select_member_or_approved
  ON public.businesses FOR SELECT
  TO authenticated
  USING (
    public.is_member_of_business(id)
    OR status = 'approved'
    OR public.is_app_admin()
  );

CREATE POLICY businesses_insert_pending_own
  ON public.businesses FOR INSERT
  TO authenticated
  WITH CHECK (
    status = 'pending'
    AND public.current_profile_id() IS NOT NULL
  );

CREATE POLICY businesses_update_own_pending
  ON public.businesses FOR UPDATE
  TO authenticated
  USING (public.is_member_of_business(id) AND status = 'pending')
  WITH CHECK (public.is_member_of_business(id) AND status = 'pending');

CREATE POLICY businesses_admin_all
  ON public.businesses FOR ALL
  TO authenticated
  USING (public.is_app_admin())
  WITH CHECK (public.is_app_admin());

-- ---------------------------------------------------------------------------
-- listings — CRUD for own business
-- ---------------------------------------------------------------------------

CREATE POLICY listings_select_member_or_approved
  ON public.listings FOR SELECT
  TO authenticated
  USING (
    public.is_member_of_business(business_id)
    OR EXISTS (
      SELECT 1 FROM public.businesses b
      WHERE b.id = listings.business_id AND b.status = 'approved'
    )
  );

CREATE POLICY listings_insert_member
  ON public.listings FOR INSERT
  TO authenticated
  WITH CHECK (public.is_member_of_business(business_id));

CREATE POLICY listings_update_member
  ON public.listings FOR UPDATE
  TO authenticated
  USING (public.is_member_of_business(business_id))
  WITH CHECK (public.is_member_of_business(business_id));

CREATE POLICY listings_delete_member
  ON public.listings FOR DELETE
  TO authenticated
  USING (public.is_member_of_business(business_id));

-- ---------------------------------------------------------------------------
-- business_photos
-- ---------------------------------------------------------------------------

CREATE POLICY business_photos_select_discovery
  ON public.business_photos FOR SELECT
  TO authenticated
  USING (
    public.is_member_of_business(business_id)
    OR EXISTS (
      SELECT 1 FROM public.businesses b
      WHERE b.id = business_photos.business_id AND b.status = 'approved'
    )
  );

CREATE POLICY business_photos_insert_member
  ON public.business_photos FOR INSERT
  TO authenticated
  WITH CHECK (public.is_member_of_business(business_id));

CREATE POLICY business_photos_update_member
  ON public.business_photos FOR UPDATE
  TO authenticated
  USING (public.is_member_of_business(business_id))
  WITH CHECK (public.is_member_of_business(business_id));

CREATE POLICY business_photos_delete_member
  ON public.business_photos FOR DELETE
  TO authenticated
  USING (public.is_member_of_business(business_id));

-- ---------------------------------------------------------------------------
-- business discovery
-- ---------------------------------------------------------------------------

CREATE POLICY business_discovery_swipes_member
  ON public.business_discovery_swipes FOR ALL
  TO authenticated
  USING (public.is_member_of_business(swiper_business_id))
  WITH CHECK (public.is_member_of_business(swiper_business_id));

CREATE POLICY business_matches_select_participant
  ON public.business_matches FOR SELECT
  TO authenticated
  USING (
    public.is_member_of_business(business_a_id)
    OR public.is_member_of_business(business_b_id)
  );

-- ---------------------------------------------------------------------------
-- trade proposals — party members + admin
-- ---------------------------------------------------------------------------

CREATE POLICY trade_proposals_select_party
  ON public.trade_proposals FOR SELECT
  TO authenticated
  USING (
    public.is_app_admin()
    OR EXISTS (
      SELECT 1 FROM public.proposal_parties pp
      WHERE pp.proposal_id = trade_proposals.id
        AND public.is_member_of_business(pp.business_id)
    )
  );

CREATE POLICY proposal_parties_select_party
  ON public.proposal_parties FOR SELECT
  TO authenticated
  USING (
    public.is_app_admin()
    OR public.is_member_of_business(business_id)
    OR EXISTS (
      SELECT 1 FROM public.proposal_parties pp2
      WHERE pp2.proposal_id = proposal_parties.proposal_id
        AND public.is_member_of_business(pp2.business_id)
    )
  );

CREATE POLICY proposal_swipes_member
  ON public.proposal_swipes FOR ALL
  TO authenticated
  USING (public.is_member_of_business(business_id))
  WITH CHECK (public.is_member_of_business(business_id));

CREATE POLICY proposal_acceptances_member
  ON public.proposal_acceptances FOR ALL
  TO authenticated
  USING (public.is_member_of_business(business_id))
  WITH CHECK (public.is_member_of_business(business_id));

CREATE POLICY trade_events_select_party
  ON public.trade_events FOR SELECT
  TO authenticated
  USING (
    public.is_app_admin()
    OR EXISTS (
      SELECT 1 FROM public.proposal_parties pp
      WHERE pp.proposal_id = trade_events.proposal_id
        AND public.is_member_of_business(pp.business_id)
    )
  );

CREATE POLICY vendor_ratings_select_party
  ON public.vendor_ratings FOR SELECT
  TO authenticated
  USING (
    public.is_member_of_business(rater_business_id)
    OR public.is_member_of_business(rated_business_id)
    OR public.is_app_admin()
  );

CREATE POLICY vendor_ratings_insert_rater
  ON public.vendor_ratings FOR INSERT
  TO authenticated
  WITH CHECK (public.is_member_of_business(rater_business_id));

CREATE POLICY invoices_select_own
  ON public.invoices FOR SELECT
  TO authenticated
  USING (
    public.is_member_of_business(business_id)
    OR public.is_app_admin()
  );

CREATE POLICY verification_documents_member
  ON public.verification_documents FOR ALL
  TO authenticated
  USING (public.is_member_of_business(business_id))
  WITH CHECK (public.is_member_of_business(business_id));

-- listing_embeddings: server-only (no authenticated policies)

-- ---------------------------------------------------------------------------
-- Storage: business-media bucket
-- ---------------------------------------------------------------------------

CREATE POLICY business_media_public_read
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'business-media');

CREATE POLICY business_media_pending_upload
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'business-media'
    AND (storage.foldername(name))[1] = 'pending'
    AND (storage.foldername(name))[2] = public.current_profile_id()::text
  );

CREATE POLICY business_media_pending_update
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'business-media'
    AND (storage.foldername(name))[1] = 'pending'
    AND (storage.foldername(name))[2] = public.current_profile_id()::text
  );

CREATE POLICY business_media_pending_delete
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'business-media'
    AND (storage.foldername(name))[1] = 'pending'
    AND (storage.foldername(name))[2] = public.current_profile_id()::text
  );
