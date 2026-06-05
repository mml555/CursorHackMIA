# Supabase RLS and Clerk JWT

Reciproca uses **Clerk** for identity and **Supabase Postgres** for data. Row Level Security is enabled on all user-facing tables.

## Two access paths

| Path | When | RLS |
|------|------|-----|
| **Service role** (MVP) | Next.js API routes after `auth()` | Bypassed — enforce `business_id` in app code |
| **Authenticated JWT** (Phase 2) | Browser/server Supabase client with Clerk token | Policies in `20260605124000_rls_clerk_jwt.sql` |

Never expose `SUPABASE_SERVICE_ROLE_KEY` to the client.

## Migration order

Apply in timestamp order under `supabase/migrations/`:

1. `20260604120000_initial_schema.sql` — core tables, RLS enabled (deny-by-default)
2. `20260605121000_matching_embeddings.sql` — pgvector + auto-proposal columns
3. `20260605122000_business_discovery.sql` — discovery swipe deck + matches
4. `20260605123000_business_profile_media.sql` — logo, photos, storage bucket
5. `20260605124000_rls_clerk_jwt.sql` — Clerk JWT helpers + member policies
6. `20260605125000_onboarding_drafts.sql` — onboarding draft state (Render API)

```bash
npm run db:reset   # local
npm run db:push    # linked remote (after review)
```

## Enable Clerk JWT in Supabase (Phase 2 client)

1. Clerk Dashboard → **Integrations** → **Supabase** → enable compatibility.
2. Supabase Dashboard → **Authentication** → **Third-party auth** → add Clerk.
3. In the app, create a Supabase client that passes the Clerk session token (see [Clerk Supabase integration](https://clerk.com/docs/integrations/databases/supabase)).
4. JWT `sub` must match `profiles.clerk_user_id` (synced via webhook).

Helper functions:

- `requesting_clerk_user_id()` — `auth.jwt() ->> 'sub'`
- `current_profile_id()` — profile row for current Clerk user
- `is_member_of_business(uuid)` — via `business_members`
- `is_app_admin()` — `public_metadata.role = 'admin'`

## What policies cover

- **Own data:** profiles, business_members, listings, photos, verification docs, pending business edits
- **Discovery:** approved businesses + their listings/photos (read)
- **Trades:** proposal parties, swipes, acceptances, events, ratings, invoices (participant scope)
- **Admin:** full `businesses` access when `is_app_admin()`
- **Server-only:** `listing_embeddings` (no authenticated policies)

## Storage (`business-media`)

- **Public read** on all objects (bucket is public for discovery cards)
- **Authenticated write** only under `pending/{profile_id}/…` for the current profile

Finalized paths (`{business_id}/…`) are written by the API using the service role after onboarding.

## Remote push notes

If an old remote already applied duplicate `20260605120000_*` migrations:

1. Compare remote migration history with the new filenames.
2. Do not delete history on production without a repair plan.
3. For a fresh project, `db:push` after this rename is safe.

Removed migration: `20260605120000_business_banter_profile_media.sql` (wrong schema — referenced `auth.users` / `owner_id`, not Reciproca’s Clerk model).
