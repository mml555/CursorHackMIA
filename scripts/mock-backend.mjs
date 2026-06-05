/**
 * Local dev helper — runs the same onboarding API as Render (port 3001).
 * Usage: npm run mock:backend
 * Then set BACKEND_API_URL=http://localhost:3001 in .env.local
 */
process.env.PORT ??= "3001";
process.env.SUPABASE_URL ??= process.env.NEXT_PUBLIC_SUPABASE_URL;

await import("../services/onboarding-api/src/server.mjs");
