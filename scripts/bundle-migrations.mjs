/**
 * Concatenate reset + migrations into scripts/staging-full-setup.sql
 * for manual run in Supabase SQL Editor when CLI/db password unavailable.
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { resolve, join } from "node:path";

const root = resolve(process.cwd());
const parts = [resolve("scripts/staging-reset-public.sql")];

const migrationsDir = resolve("supabase/migrations");
for (const file of readdirSync(migrationsDir).filter((f) => f.endsWith(".sql")).sort()) {
  parts.push(join(migrationsDir, file));
}

parts.push(resolve("supabase/seed.sql"));

const out = parts
  .map((path) => {
    const sql = readFileSync(path, "utf8");
    return `-- >>> FILE: ${path.replace(root + "/", "")}\n${sql}`;
  })
  .join("\n\n");

const outputPath = resolve("scripts/staging-full-setup.sql");
writeFileSync(outputPath, out);
console.log(`Wrote ${outputPath} (${parts.length} files)`);
