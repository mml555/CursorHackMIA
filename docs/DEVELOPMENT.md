# Reciproca — development

Monorepo layout: Next.js app at **repo root**, Supabase in **`supabase/`**, product docs in **`docs/`**.

## Prerequisites

- Node.js 20+
- [Clerk CLI](https://clerk.com/docs/cli) (optional): `curl -fsSL https://clerk.com/install | bash`
- [Supabase CLI](https://supabase.com/docs/guides/cli): `npm install -g supabase` or use the devDependency via `npx supabase`

## Quick start

```bash
# 1. Install dependencies
npm install

# 2. Environment (copy names only; fill from dashboards)
cp .env.example .env.local

# 3. Database (local Supabase)
npm run db:start    # first time
npm run db:reset    # apply supabase/migrations/20260604120000_initial_schema.sql

# 4. Run the web app
npm run dev
```

Open http://localhost:3000 — use **Sign up** in the header to create a test user.

## Stack

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
| `npm run db:start` | Local Supabase stack |
| `npm run db:reset` | Reset DB + run migrations |
| `npm run db:push` | Push migrations to linked remote |
| `npm run db:types` | Regenerate TS types from local DB |

## Clerk CLI (optional)

```bash
export PATH="$HOME/.local/bin:$PATH"
clerk auth login
clerk link --app app_3Eh29Yn9v2NqcMHuCpQIOZ85uS4
clerk doctor
```

## Auth + data model

- **Clerk** is the identity provider (sessions in Next.js).
- **Supabase** is data-only; `profiles.clerk_user_id` syncs via webhook (`user.created` / `user.updated`).
- MVP API routes validate Clerk, then query Supabase with the **service role** (server-only).

See [PRD §8.3](./PRD.md) for the full auth strategy.

## Project structure

```
/
├── src/                    # Next.js app
├── public/
├── supabase/
│   ├── config.toml
│   └── migrations/
│       └── 20260604120000_initial_schema.sql
├── docs/
│   ├── PRD.md
│   └── DEVELOPMENT.md      # this file
├── package.json
└── .env.example
```
