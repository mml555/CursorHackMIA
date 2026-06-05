# Reciproca — development (middleware / BFF)

Next.js at **repo root** acts as the **middleware layer** between the frontend and your backend API. No local database is required for onboarding.

## Prerequisites

- Node.js 20+
- Clerk app (for auth)
- A backend service exposing `/onboarding/*` routes (see below)

## Quick start

```bash
npm install
cp .env.example .env.local   # fill Clerk keys + BACKEND_API_URL
npm run dev
```

Open http://localhost:3000 — **Sign up** redirects to `/onboarding`.

**Important:** Put env vars in `.env.local` at the **repo root**. Next.js does not load `.env/.env`.

## Architecture

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

## Backend contract

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

## Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Next.js dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |

## Health check

`GET /api/health` reports whether `CLERK_SECRET_KEY` and `BACKEND_API_URL` are set.

## Legacy note

Older routes under `/api/businesses`, `/api/listings`, etc. still reference Supabase from an earlier scaffold. **Onboarding does not use them.** You can ignore Supabase entirely while working on the middleware + backend flow.
