/**
 * Smoke test: onboarding API health + discovery endpoints.
 *
 * Usage:
 *   BACKEND_API_URL=http://localhost:3001 node scripts/test-onboarding-flow.mjs
 *   node scripts/test-onboarding-flow.mjs   # uses BACKEND_API_URL from .env.local
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

const base =
  process.env.BACKEND_API_URL?.replace(/\/$/, "") ?? "http://localhost:3001";

async function check(path, label) {
  const res = await fetch(`${base}${path}`);
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    console.error(`FAIL ${label}: HTTP ${res.status}`, body);
    process.exit(1);
  }
  console.log(`PASS ${label}`);
  return body;
}

console.log(`Testing backend at ${base}`);
await check("/health", "health");
await check("/discovery/stats?metro=Austin", "discovery stats");
await check("/discovery/network?metro=Austin", "discovery network");
await check("/discovery/recommendations", "discovery recommendations");
console.log("All onboarding/discovery smoke checks passed.");
