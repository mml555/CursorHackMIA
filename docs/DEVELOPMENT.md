# Reciproca — development

Next.js at **repo root** is the web app and **middleware/BFF** for onboarding. Supabase Postgres lives in **`supabase/`** for listings, matching, and business data.

**Deploy:** [docs/DEPLOYMENT.md](./DEPLOYMENT.md) — Vercel (web) + Render (onboarding API).

## Prerequisites

- Node.js 20+
- Clerk app (for auth)
- Backend service exposing `/onboarding/*` routes (or use `npm run mock:backend` locally)
- [Supabase CLI](https://supabase.com/docs/guides/cli) for local DB: `npm install -g supabase` or `npx supabase`
- [Clerk CLI](https://clerk.com/docs/cli) (optional): `curl -fsSL https://clerk.com/install | bash`

## Quick start

```bash
# 1. Install dependencies
npm install

# 2. Environment (copy names only; fill from dashboards)
cp .env.example .env.local   # Clerk keys + BACKEND_API_URL + Supabase (see .env.example)

# 3. Database (local Supabase — for listings, matching, etc.)
npm run db:start    # first time
npm run db:reset    # apply all supabase/migrations/*.sql in order

# 4. Run the web app
npm run dev
```

Open http://localhost:3000 — **Sign up** redirects to `/onboarding`.

**Important:** Put env vars in `.env.local` at the **repo root**. Next.js does not load `.env/.env`.

## Architecture

### Onboarding (BFF)

```
Browser  →  /api/onboarding/*  (Next.js middleware)
                ↓ Clerk session + Zod validation
           BACKEND_API_URL/onboarding/*
```

| Layer | Location |
|-------|----------|
| Onboarding UI | `src/app/onboarding/` |
| Middleware API | `src/app/api/onboarding/` |
| Backend client | `src/lib/backend/` |
| Onboarding schemas | `src/lib/onboarding/schemas.ts` |

### Backend contract

The middleware forwards these routes (with `Authorization: Bearer <clerk_token>`):

| Middleware route | Forwards to |
|------------------|-------------|
| `GET /api/onboarding/status` | `GET {BACKEND_API_URL}/onboarding/status` |
| `PATCH /api/onboarding/company` | `PATCH {BACKEND_API_URL}/onboarding/company` |
| `PUT /api/onboarding/services` | `PUT {BACKEND_API_URL}/onboarding/services` |
| `PATCH /api/onboarding/social` | `PATCH {BACKEND_API_URL}/onboarding/social` |
| `POST /api/onboarding/consent` | `POST {BACKEND_API_URL}/onboarding/consent` |
| `POST /api/onboarding/complete` | `POST {BACKEND_API_URL}/onboarding/complete` |

Responses should use `{ "data": ... }` or `{ "error": { "code", "message" } }`.

For local dev without a real backend: `npm run mock:backend` then set `BACKEND_API_URL=http://localhost:3001`.

### Data (Supabase)

| Layer | Location |
|-------|----------|
| Next.js (App Router) | `src/app/` |
| Clerk auth | `src/proxy.ts`, `src/app/sign-in`, `src/app/sign-up` |
| Clerk webhook → profiles | `src/app/api/webhooks/clerk/` |
| Supabase (Postgres) | `supabase/migrations/` |
| API routes | `src/app/api/` |

**Clerk app ID:** `app_3Eh29Yn9v2NqcMHuCpQIOZ85uS4`

## Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Next.js dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run mock:backend` | Local mock onboarding backend |
| `npm run test:onboarding` | Smoke test onboarding flow |
| `npm run db:start` | Local Supabase stack |
| `npm run db:reset` | Reset DB + run migrations |
| `npm run db:push` | Push migrations to linked remote |
| `npm run db:types` | Regenerate TS types from local DB |

## Health check

`GET /api/health` reports whether `CLERK_SECRET_KEY` and `BACKEND_API_URL` are set.

## Auth + data model

- **Clerk** is the identity provider (sessions in Next.js).
- **Supabase** is data-only; `profiles.clerk_user_id` syncs via webhook (`user.created` / `user.updated`).
- MVP API routes validate Clerk, then query Supabase with the **service role** (server-only).
- RLS policies for Clerk JWT clients: [SUPABASE_RLS.md](./SUPABASE_RLS.md) and migration `20260605124000_rls_clerk_jwt.sql`.

See [PRD §8.3](./PRD.md) for the full auth strategy.

**Note:** Onboarding uses the BFF → `BACKEND_API_URL` path above. Older routes under `/api/businesses`, `/api/listings`, etc. talk to Supabase directly.

## Clerk CLI (optional)

```bash
export PATH="$HOME/.local/bin:$PATH"
clerk auth login
clerk link --app app_3Eh29Yn9v2NqcMHuCpQIOZ85uS4
clerk doctor
```

## Project structure

```
/
├── src/                    # Next.js app
├── public/
├── supabase/
│   ├── config.toml
│   └── migrations/           # see docs/SUPABASE_RLS.md for order
├── docs/
│   ├── PRD.md
│   ├── SUPABASE_RLS.md
│   └── DEVELOPMENT.md      # this file
├── package.json
└── .env.example
```
