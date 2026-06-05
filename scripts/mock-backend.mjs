/**
 * Local dev helper — runs the same onboarding API as Render (port 3001).
 * Usage: npm run mock:backend
 * Then set BACKEND_API_URL=http://localhost:3001 in .env.local
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

function loadEnvFile(path) {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

loadEnvFile(resolve(process.cwd(), ".env.local"));
loadEnvFile(resolve(process.cwd(), ".env"));

process.env.PORT ??= "3001";
process.env.SUPABASE_URL ??= process.env.NEXT_PUBLIC_SUPABASE_URL;

await import("../services/onboarding-api/src/server.mjs");
