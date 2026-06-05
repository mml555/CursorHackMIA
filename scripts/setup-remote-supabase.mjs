/**
 * Reset public schema (legacy staging), apply Reciproca migrations, seed businesses.
 *
 * Usage:
 *   DATABASE_URL="postgresql://postgres.[ref]:[password]@...:5432/postgres" \
 *     node scripts/setup-remote-supabase.mjs
 *
 * Or:
 *   NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co \
 *   SUPABASE_DB_PASSWORD=<db-password> \
 *   node scripts/setup-remote-supabase.mjs
 *
 * Optional after setup:
 *   SEED_BUSINESSES=1 (default) runs seed-random-businesses.mjs
 */
import pg from "pg";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { resolve, join } from "node:path";
import { spawnSync } from "node:child_process";

const { Client } = pg;

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

function projectRefFromUrl(url) {
  try {
    const host = new URL(url).hostname;
    const match = host.match(/^([a-z0-9]+)\.supabase\.co$/i);
    return match?.[1] ?? null;
  } catch {
    return null;
  }
}

function buildConnectionString() {
  if (process.env.DATABASE_URL?.trim()) {
    return process.env.DATABASE_URL.trim();
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const password = process.env.SUPABASE_DB_PASSWORD?.trim();
  if (!supabaseUrl || !password) {
    return null;
  }

  const ref = projectRefFromUrl(supabaseUrl);
  if (!ref) return null;

  const region = process.env.SUPABASE_REGION?.trim() || "us-east-1";
  const host =
    process.env.SUPABASE_DB_HOST?.trim() ||
    `db.${ref}.supabase.co`;
  const port = process.env.SUPABASE_DB_PORT?.trim() || "5432";
  const user = process.env.SUPABASE_DB_USER?.trim() || "postgres";
  const database = process.env.SUPABASE_DB_NAME?.trim() || "postgres";

  const encodedPassword = encodeURIComponent(password);

  if (host.includes("pooler")) {
    return `postgresql://${user}.${ref}:${encodedPassword}@${host}:${port}/${database}`;
  }

  return `postgresql://${user}:${encodedPassword}@${host}:${port}/${database}?sslmode=require`;
}

async function runSqlFile(client, filePath) {
  const sql = readFileSync(filePath, "utf8");
  console.log(`Applying ${filePath}...`);
  await client.query(sql);
}

async function main() {
  const connectionString = buildConnectionString();
  if (!connectionString) {
    console.error(
      "Missing DATABASE_URL or NEXT_PUBLIC_SUPABASE_URL + SUPABASE_DB_PASSWORD.",
    );
    console.error(
      "Get the DB password from Supabase Dashboard → Project Settings → Database.",
    );
    process.exit(1);
  }

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  console.log("Connected to remote Postgres.");

  try {
    const resetPath = resolve("scripts/staging-reset-public.sql");
    await runSqlFile(client, resetPath);

    const migrationsDir = resolve("supabase/migrations");
    const files = readdirSync(migrationsDir)
      .filter((f) => f.endsWith(".sql"))
      .sort();

    for (const file of files) {
      await runSqlFile(client, join(migrationsDir, file));
    }

    const seedSqlPath = resolve("supabase/seed.sql");
    if (existsSync(seedSqlPath)) {
      await runSqlFile(client, seedSqlPath);
    }

    console.log("Schema migrations applied.");
  } finally {
    await client.end();
  }

  if (process.env.SEED_BUSINESSES !== "0") {
    const seed = spawnSync("node", ["scripts/seed-random-businesses.mjs"], {
      stdio: "inherit",
      env: process.env,
    });
    if (seed.status !== 0) {
      process.exit(seed.status ?? 1);
    }
  }
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
