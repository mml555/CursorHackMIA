/**
 * Reset public schema (legacy staging), apply Reciproca migrations, seed businesses.
 *
 * Auth (pick one):
 *   SUPABASE_ACCESS_TOKEN — https://supabase.com/dashboard/account/tokens
 *   DATABASE_URL — Postgres URL (often IPv6: db.<ref>.supabase.co)
 *   SUPABASE_DB_PASSWORD + NEXT_PUBLIC_SUPABASE_URL
 *
 *   NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co \
 *   SUPABASE_SERVICE_ROLE_KEY=<service-role> \
 *   SUPABASE_ACCESS_TOKEN=sbp_... \
 *   node scripts/setup-remote-supabase.mjs
 *
 * Optional: SEED_BUSINESSES=0 skips business seed.
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

  const host = process.env.SUPABASE_DB_HOST?.trim() || `db.${ref}.supabase.co`;
  const port = process.env.SUPABASE_DB_PORT?.trim() || "5432";
  const user = process.env.SUPABASE_DB_USER?.trim() || "postgres";
  const database = process.env.SUPABASE_DB_NAME?.trim() || "postgres";

  const encodedPassword = encodeURIComponent(password);

  const sslQuery = "uselibpqcompat=true&sslmode=require";

  if (host.includes("pooler")) {
    const poolerUser = encodeURIComponent(`${user}.${ref}`);
    return `postgresql://${poolerUser}:${encodedPassword}@${host}:${port}/${database}?${sslQuery}`;
  }

  return `postgresql://${user}:${encodedPassword}@${host}:${port}/${database}?${sslQuery}`;
}

function migrationFiles() {
  const resetPath = resolve("scripts/staging-reset-public.sql");
  const migrationsDir = resolve("supabase/migrations");
  const files = readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort()
    .map((f) => join(migrationsDir, f));
  return [resetPath, ...files];
}

function seedSwipeSqlPath() {
  return resolve("supabase/seed.sql");
}

async function runSqlFilePg(client, filePath) {
  const sql = readFileSync(filePath, "utf8");
  console.log(`Applying ${filePath}...`);
  await client.query(sql);
}

async function runSqlFileManagementApi(projectRef, accessToken, filePath) {
  const sql = readFileSync(filePath, "utf8");
  console.log(`Applying ${filePath} (Management API)...`);
  const response = await fetch(
    `https://api.supabase.com/v1/projects/${projectRef}/database/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: sql }),
    },
  );
  const body = await response.text();
  if (!response.ok) {
    throw new Error(
      `Management API ${response.status} for ${filePath}: ${body.slice(0, 500)}`,
    );
  }
}

async function applyMigrationsPg(connectionString) {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  console.log("Connected to remote Postgres.");
  try {
    for (const filePath of migrationFiles()) {
      await runSqlFilePg(client, filePath);
    }
  } finally {
    await client.end();
  }
}

async function applyMigrationsManagementApi(projectRef, accessToken) {
  for (const filePath of migrationFiles()) {
    await runSqlFileManagementApi(projectRef, accessToken, filePath);
  }
}

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const projectRef = supabaseUrl ? projectRefFromUrl(supabaseUrl) : null;
  const accessToken = process.env.SUPABASE_ACCESS_TOKEN?.trim();
  const connectionString = buildConnectionString();

  if (accessToken && projectRef) {
    await applyMigrationsManagementApi(projectRef, accessToken);
    console.log("Schema migrations applied via Management API.");
  } else if (connectionString) {
    await applyMigrationsPg(connectionString);
    console.log("Schema migrations applied via Postgres.");
  } else {
    console.error(
      "Missing credentials. Provide one of:\n" +
        "  SUPABASE_ACCESS_TOKEN + NEXT_PUBLIC_SUPABASE_URL\n" +
        "  DATABASE_URL\n" +
        "  SUPABASE_DB_PASSWORD + NEXT_PUBLIC_SUPABASE_URL\n\n" +
        "Access token: https://supabase.com/dashboard/account/tokens\n" +
        "DB password: Project Settings → Database",
    );
    process.exit(1);
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

  const swipeSql = seedSwipeSqlPath();
  if (existsSync(swipeSql) && (connectionString || (accessToken && projectRef))) {
    if (accessToken && projectRef) {
      await runSqlFileManagementApi(projectRef, accessToken, swipeSql);
    } else if (connectionString) {
      const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false },
      });
      await client.connect();
      try {
        await runSqlFilePg(client, swipeSql);
      } finally {
        await client.end();
      }
    }
    console.log("Demo discovery swipes applied.");
  }
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
