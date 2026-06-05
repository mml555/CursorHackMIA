/**
 * Diagnose Supabase connectivity and schema for discovery routes.
 * Usage:
 *   NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/diagnose-supabase.mjs
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

console.log("URL:", url);
console.log("Key prefix:", key.slice(0, 20) + "...");
console.log("Key role (JWT payload):", decodeJwtRole(key));
console.log("---");

const supabase = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function check(label, fn) {
  try {
    const result = await fn();
    console.log(`OK  ${label}`);
    if (result != null) console.log("    ", JSON.stringify(result).slice(0, 200));
    return true;
  } catch (error) {
    console.log(`FAIL ${label}`);
    console.log("    ", error?.message ?? error);
    return false;
  }
}

function decodeJwtRole(jwt) {
  try {
    const payload = JSON.parse(
      Buffer.from(jwt.split(".")[1], "base64url").toString("utf8"),
    );
    return { iss: payload.iss, role: payload.role, ref: payload.ref };
  } catch {
    return "unable to decode";
  }
}

// businesses table
const businesses = await supabase.from("businesses").select("id").limit(1);
if (businesses.error) {
  console.log("FAIL businesses table");
  console.log("    ", businesses.error.message, businesses.error.code, businesses.error.details);
} else {
  console.log("OK  businesses table", `(rows sample: ${businesses.data?.length ?? 0})`);
}

// discovery view
const cards = await supabase.from("business_discovery_cards").select("business_id").limit(1);
if (cards.error) {
  console.log("FAIL business_discovery_cards view");
  console.log("    ", cards.error.message, cards.error.code, cards.error.details);
} else {
  console.log("OK  business_discovery_cards view", `(rows sample: ${cards.data?.length ?? 0})`);
}

// onboarding drafts (Render)
const drafts = await supabase.from("onboarding_drafts").select("id").limit(1);
if (drafts.error) {
  console.log("FAIL onboarding_drafts table");
  console.log("    ", drafts.error.message, drafts.error.code);
} else {
  console.log("OK  onboarding_drafts table");
}
