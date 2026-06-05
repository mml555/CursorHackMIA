/**
 * Seed published trade proposals for deck / trades demo.
 *
 * Usage:
 *   node scripts/seed-trade-proposals.mjs
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.
 */
import { createClient } from "@supabase/supabase-js";
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

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

if (!url || !key) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY (.env.local)",
  );
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const YOGA = "10000000-0000-4000-8000-000000000001";
const PHOTO = "10000000-0000-4000-8000-000000000002";
const SOCIAL = "10000000-0000-4000-8000-000000000003";

const PROPOSALS = [
  {
    title: "Yoga ↔ Brand Photography",
    summary:
      "Sunrise Yoga trades monthly classes for a brand photography package with Luminary Studio.",
    trade_type: "direct",
    metro: "Austin",
    vertical: "Wellness",
    parties: [
      {
        business_id: YOGA,
        give_lines: [
          {
            description: "60-minute yoga classes",
            quantity: 4,
            unit: "sessions",
            fmv: 800,
          },
        ],
        receive_lines: [
          {
            description: "Brand photography package",
            quantity: 1,
            unit: "project",
            fmv: 1500,
          },
        ],
        estimated_fmv: 800,
      },
      {
        business_id: PHOTO,
        give_lines: [
          {
            description: "Brand photography package",
            quantity: 1,
            unit: "project",
            fmv: 1500,
          },
        ],
        receive_lines: [
          {
            description: "60-minute yoga classes",
            quantity: 4,
            unit: "sessions",
            fmv: 800,
          },
        ],
        estimated_fmv: 1500,
      },
    ],
  },
  {
    title: "3-way wellness + content cycle",
    summary:
      "Yoga studio, photography, and social agency clear a circular trade without trade dollars.",
    trade_type: "multi_party",
    metro: "Austin",
    vertical: "Wellness",
    cash_topup_display: 200,
    parties: [
      {
        business_id: YOGA,
        give_lines: [
          {
            description: "Team wellness classes",
            quantity: 6,
            unit: "sessions",
            fmv: 1200,
          },
        ],
        receive_lines: [
          {
            description: "Social content package",
            quantity: 3,
            unit: "months",
            fmv: 2400,
          },
        ],
        estimated_fmv: 1200,
      },
      {
        business_id: PHOTO,
        give_lines: [
          {
            description: "Brand photography",
            quantity: 1,
            unit: "project",
            fmv: 1800,
          },
        ],
        receive_lines: [
          {
            description: "Team wellness classes",
            quantity: 6,
            unit: "sessions",
            fmv: 1200,
          },
        ],
        estimated_fmv: 1800,
      },
      {
        business_id: SOCIAL,
        give_lines: [
          {
            description: "Social content package",
            quantity: 3,
            unit: "months",
            fmv: 2400,
          },
        ],
        receive_lines: [
          {
            description: "Brand photography",
            quantity: 1,
            unit: "project",
            fmv: 1800,
          },
        ],
        estimated_fmv: 2400,
      },
    ],
  },
];

async function upsertProposal(def) {
  const { data: existing } = await supabase
    .from("trade_proposals")
    .select("id")
    .eq("title", def.title)
    .maybeSingle();

  if (existing) {
    console.log(`  skip (exists): ${def.title}`);
    return existing.id;
  }

  const snapshot = {
    title: def.title,
    summary: def.summary,
    tradeType: def.trade_type,
    cashTopupDisplay: def.cash_topup_display ?? null,
    parties: def.parties.map((party) => ({
      businessId: party.business_id,
      giveLines: party.give_lines,
      receiveLines: party.receive_lines,
      estimatedFmv: party.estimated_fmv,
    })),
    publishedAt: new Date().toISOString(),
  };

  const { data: proposal, error } = await supabase
    .from("trade_proposals")
    .insert({
      title: def.title,
      summary: def.summary,
      trade_type: def.trade_type,
      status: "published",
      metro: def.metro,
      vertical: def.vertical,
      cash_topup_display: def.cash_topup_display ?? null,
      source: "manual",
      snapshot,
      published_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error) throw error;

  const partyRows = def.parties.map((party) => ({
    proposal_id: proposal.id,
    business_id: party.business_id,
    give_lines: party.give_lines,
    receive_lines: party.receive_lines,
    estimated_fmv: party.estimated_fmv,
  }));

  const { error: partiesError } = await supabase
    .from("proposal_parties")
    .insert(partyRows);

  if (partiesError) throw partiesError;

  await supabase.from("trade_events").insert({
    proposal_id: proposal.id,
    from_status: "draft",
    to_status: "published",
    payload: { action: "seed_published" },
  });

  console.log(`  created: ${def.title}`);
  return proposal.id;
}

console.log("Seeding trade proposals…");
for (const def of PROPOSALS) {
  await upsertProposal(def);
}
console.log("Done.");
