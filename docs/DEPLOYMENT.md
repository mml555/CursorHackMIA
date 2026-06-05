# Reciproca — deployment (Vercel + Render)

Two-service layout:

| Service | Platform | Role |
|---------|----------|------|
| **Web app** | [Vercel](https://vercel.com) | Next.js UI, Clerk auth, BFF (`/api/*`), Supabase data routes |
| **Onboarding API** | [Render](https://render.com) | `/onboarding/*`, `/discovery/*` — drafts, finalize, discovery data |

Supabase stays hosted on [supabase.com](https://supabase.com). Clerk stays on [clerk.com](https://clerk.com).

---

## Prerequisites

1. **Supabase project** — apply migrations:

   ```bash
   supabase link --project-ref <your-ref>
   npm run db:push
   ```

2. **Clerk application** — note publishable + secret keys and webhook signing secret.

3. **GitHub repo** connected to both Vercel and Render.

---

## 1. Deploy onboarding API (Render)

### Option A — Blueprint (`render.yaml`)

1. Render Dashboard → **New** → **Blueprint**
2. Connect this repo; Render reads `render.yaml` at the root.
3. Set secret env vars when prompted:

   | Variable | Value |
   |----------|-------|
   | `CLERK_SECRET_KEY` | Clerk secret key |
   | `SUPABASE_URL` | `https://<project-ref>.supabase.co` |
   | `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role (server only) |
   | `ALLOWED_ORIGINS` | `https://<your-vercel-domain>` (optional; BFF calls server-side) |

4. After deploy, copy the service URL (e.g. `https://reciproca-onboarding-api.onrender.com`).

### Option B — Manual web service

| Setting | Value |
|---------|-------|
| **Root directory** | `services/onboarding-api` |
| **Build command** | `npm install` |
| **Start command** | `npm start` |
| **Health check path** | `/health` |

### Verify Render

```bash
curl https://<render-host>/health
# → {"data":{"status":"ok","service":"reciproca-onboarding-api",...}}
```

---

## 2. Deploy web app (Vercel)

1. Vercel Dashboard → **Add New Project** → import the repo.
2. Framework preset: **Next.js** (auto-detected).
3. Root directory: **`.`** (repo root).
4. Add environment variables for **Production** and **Preview**:

### Required (Vercel)

| Variable | Notes |
|----------|-------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Client-safe |
| `CLERK_SECRET_KEY` | Server only |
| `CLERK_WEBHOOK_SIGNING_SECRET` | Clerk webhook endpoint |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | `/sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | `/sign-up` |
| `BACKEND_API_URL` | Render URL **without** trailing slash |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client-safe (RLS) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only — never `NEXT_PUBLIC_` |
| `NEXT_PUBLIC_APP_URL` | `https://<your-vercel-domain>` |

### Optional

| Variable | Notes |
|----------|-------|
| `OPENAI_API_KEY` | Semantic matching embeddings |

5. Deploy. Vercel runs `npm run build` per `vercel.json`.

### Verify Vercel

```bash
curl https://<vercel-domain>/api/health
# checks.clerk + checks.backend should be "configured"
```

---

## 3. Clerk webhook (production)

1. Clerk Dashboard → **Webhooks** → add endpoint:
   - URL: `https://<vercel-domain>/api/webhooks/clerk`
   - Events: `user.created`, `user.updated`, `user.deleted`
2. Copy signing secret → `CLERK_WEBHOOK_SIGNING_SECRET` on Vercel.
3. Redeploy Vercel if you add the secret after first deploy.

---

## 4. Clerk redirect URLs

In Clerk → **Paths** / **Domains**, allow:

- `https://<vercel-domain>/sign-in`
- `https://<vercel-domain>/sign-up`
- `https://<vercel-domain>/onboarding`

Add preview URLs if using Vercel preview deployments.

---

## Local development (mirrors production)

```bash
# Terminal 1 — onboarding API (same code as Render)
cp .env.example .env.local   # fill Clerk + Supabase
npm run mock:backend         # http://localhost:3001

# Terminal 2 — Next.js
# BACKEND_API_URL=http://localhost:3001 in .env.local
npm run dev
```

---

## Environment separation

| Environment | Vercel | Render | Supabase |
|-------------|--------|--------|----------|
| **Production** | Production env vars | Production service | Prod project |
| **Preview** | Preview env vars | Same or staging Render URL | Prefer Supabase branch / staging project |
| **Local** | `.env.local` | `npm run mock:backend` | `supabase start` |

Do not point preview builds at production Supabase without a branch DB.

---

## Troubleshooting

| Symptom | Check |
|---------|-------|
| Onboarding 503 `BACKEND_NOT_CONFIGURED` | `BACKEND_API_URL` set on Vercel |
| Onboarding 401 | Clerk session; Render `CLERK_SECRET_KEY` matches Vercel |
| Profile not found on onboarding | Clerk webhook delivered; `profiles` row exists |
| Render health check fails | `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`; migration `20260605125000_onboarding_drafts.sql` applied |
| Render `/health` missing `checks.supabase` | Old deploy — **Manual Deploy** on Render after pushing latest `main` |
| Discovery 404 on Render | Same — redeploy onboarding API; `/discovery/stats` should return JSON |
| Vercel `supabaseConnection: error` + localhost host | `NEXT_PUBLIC_SUPABASE_URL` must be `https://<ref>.supabase.co`, not `127.0.0.1` |
| `supabase status` fails parsing `.env` | Remove invalid lines from `.env` (use `.env.local` for secrets) |
| Clerk webhook 400 | `CLERK_WEBHOOK_SIGNING_SECRET` matches dashboard |

---

## Files reference

| File | Purpose |
|------|---------|
| `vercel.json` | Vercel build + security headers |
| `render.yaml` | Render Blueprint for onboarding API |
| `services/onboarding-api/` | Node onboarding service |
| `scripts/mock-backend.mjs` | Local dev entrypoint |
| `supabase/migrations/20260605125000_onboarding_drafts.sql` | Draft persistence table |
