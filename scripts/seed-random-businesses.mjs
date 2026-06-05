/**
 * Seed approved businesses with offers/needs + sample discovery swipes.
 *
 * Usage (local or remote):
 *   node scripts/seed-random-businesses.mjs
 *   SEED_BUSINESS_COUNT=200 node scripts/seed-random-businesses.mjs
 *
 * Default: 150 businesses (6 curated + 144 generated), 300 listings,
 * demo swipes from focal business + mutual interests.
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in env
 * (.env.local is loaded automatically when present).
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

const CURATED = [
  {
    id: "10000000-0000-4000-8000-000000000001",
    legal_name: "Sunrise Yoga Studio LLC",
    dba: "Sunrise Yoga Studio",
    slug: "sunrise-yoga-studio",
    vertical: "Wellness",
    website: "https://sunriseyoga.example.com",
    description:
      "Boutique yoga studio offering group and private sessions for local businesses.",
    reputation_score: 4.9,
    ratings_count: 24,
    offer: {
      category: "Yoga classes",
      unit: "sessions",
      quantity: 4,
      fmv_estimate: 800,
      notes: "60-minute yoga classes, 4x/month",
    },
    need: {
      category: "Brand photography",
      unit: "project",
      quantity: 1,
      fmv_estimate: 1500,
      notes: "Brand photography for studio marketing",
    },
  },
  {
    id: "10000000-0000-4000-8000-000000000002",
    legal_name: "Luminary Studio LLC",
    dba: "Luminary Studio",
    slug: "luminary-studio",
    vertical: "Photography",
    website: "https://luminary.example.com",
    description:
      "Brand and product photography for small businesses and creative teams.",
    reputation_score: 4.8,
    ratings_count: 31,
    offer: {
      category: "Brand photography",
      unit: "project",
      quantity: 1,
      fmv_estimate: 1800,
      notes: "Brand and product photography",
    },
    need: {
      category: "Wellness sessions",
      unit: "sessions",
      quantity: 6,
      fmv_estimate: 900,
      notes: "Weekly wellness sessions for a team of 6",
    },
  },
  {
    id: "10000000-0000-4000-8000-000000000003",
    legal_name: "Verde Social LLC",
    dba: "Verde Social",
    slug: "verde-social",
    vertical: "Social agency",
    website: "https://verdesocial.example.com",
    description:
      "Social media management and content strategy for local service brands.",
    reputation_score: 4.7,
    ratings_count: 19,
    offer: {
      category: "Social media management",
      unit: "months",
      quantity: 3,
      fmv_estimate: 2400,
      notes: "Social management and audience growth",
    },
    need: {
      category: "Wellness sessions",
      unit: "sessions",
      quantity: 4,
      fmv_estimate: 1000,
      notes: "Recurring on-site wellness classes for agency team",
    },
  },
  {
    id: "10000000-0000-4000-8000-000000000004",
    legal_name: "Hill Country Massage LLC",
    dba: "Hill Country Massage",
    slug: "hill-country-massage",
    vertical: "Wellness",
    website: "https://hillcountrymassage.example.com",
    description:
      "Licensed massage therapy for teams and wellness programs.",
    reputation_score: 4.6,
    ratings_count: 12,
    offer: {
      category: "Massage therapy",
      unit: "hours",
      quantity: 10,
      fmv_estimate: 1000,
      notes: "Massage therapy hours for wellness programs",
    },
    need: {
      category: "Bookkeeping",
      unit: "months",
      quantity: 3,
      fmv_estimate: 900,
      notes: "Monthly bookkeeping support",
    },
  },
  {
    id: "10000000-0000-4000-8000-000000000005",
    legal_name: "Lone Star Bookkeeping LLC",
    dba: "Lone Star Bookkeeping",
    slug: "lone-star-bookkeeping",
    vertical: "Finance",
    website: "https://lonestarbooks.example.com",
    description:
      "Monthly bookkeeping and financial reporting for small businesses.",
    reputation_score: 4.9,
    ratings_count: 28,
    offer: {
      category: "Bookkeeping",
      unit: "months",
      quantity: 3,
      fmv_estimate: 1200,
      notes: "Monthly bookkeeping and reporting",
    },
    need: {
      category: "Marketing",
      unit: "months",
      quantity: 2,
      fmv_estimate: 1600,
      notes: "Marketing support for client acquisition",
    },
  },
  {
    id: "10000000-0000-4000-8000-000000000006",
    legal_name: "ATX Web Co LLC",
    dba: "ATX Web Co",
    slug: "atx-web-co",
    vertical: "Web design",
    website: "https://atxweb.example.com",
    description:
      "Web design and development for local service businesses.",
    reputation_score: 4.5,
    ratings_count: 9,
    offer: {
      category: "Web design",
      unit: "project",
      quantity: 1,
      fmv_estimate: 3500,
      notes: "Web design and build for service businesses",
    },
    need: {
      category: "Office wellness program",
      unit: "sessions",
      quantity: 8,
      fmv_estimate: 1200,
      notes: "Recurring on-site wellness sessions for staff",
    },
  },
];

const PREFIXES = [
  "Bluebonnet",
  "Hill Country",
  "Lone Star",
  "Capital",
  "South Congress",
  "Eastside",
  "Zilker",
  "Barton Creek",
  "Mueller",
  "Domain",
  "Cedar Park",
  "Round Rock",
  "Pflugerville",
  "Lake Travis",
  "Brushy Creek",
];

const SUFFIXES = [
  "Collective",
  "Partners",
  "Studio",
  "Works",
  "Group",
  "Co",
  "Agency",
  "Services",
  "Labs",
  "House",
];

const VERTICALS = [
  "Wellness",
  "Photography",
  "Social agency",
  "Finance",
  "Web design",
  "Marketing",
  "Legal",
  "HVAC",
  "Catering",
  "Fitness",
  "Accounting",
  "IT services",
  "Interior design",
  "Event planning",
  "Copywriting",
];

const OFFER_CATEGORIES = [
  "Yoga classes",
  "Brand photography",
  "Social media management",
  "Bookkeeping",
  "Web design",
  "SEO audit",
  "Legal review",
  "Team lunch catering",
  "Personal training",
  "IT support",
  "Logo design",
  "Email marketing",
  "Payroll setup",
  "Video editing",
  "Office cleaning",
];

const METROS = ["Austin", "Dallas", "Houston"];

const DEMO_FOCAL_BUSINESS_ID = "10000000-0000-4000-8000-000000000001";

const SEED_BUSINESS_COUNT = Math.min(
  500,
  Math.max(7, Number.parseInt(process.env.SEED_BUSINESS_COUNT ?? "150", 10) || 150),
);

const NEED_CATEGORIES = [
  "Brand photography",
  "Wellness sessions",
  "Bookkeeping",
  "Marketing",
  "Web design",
  "Social media management",
  "Legal consultation",
  "Catering",
  "Office wellness program",
  "SEO audit",
  "Video content",
  "Accounting",
  "Interior refresh",
  "Event photography",
  "Copywriting",
];

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function padId(n) {
  return String(n).padStart(12, "0");
}

function generatedBusiness(index) {
  const prefix = PREFIXES[index % PREFIXES.length];
  const suffix = SUFFIXES[(index * 3) % SUFFIXES.length];
  const vertical = VERTICALS[(index * 5) % VERTICALS.length];
  const dba = `${prefix} ${suffix}`;
  const legal_name = `${dba} LLC`;
  const slug = `${slugify(dba)}-${index}`;
  const offerCat = OFFER_CATEGORIES[(index * 7) % OFFER_CATEGORIES.length];
  const needCat = NEED_CATEGORIES[(index * 11) % NEED_CATEGORIES.length];

  return {
    id: `10000000-0000-4000-8000-${padId(index)}`,
    legal_name,
    dba,
    slug,
    metro: METROS[index % METROS.length],
    vertical,
    website: `https://${slug}.example.com`,
    description: `${dba} provides ${vertical.toLowerCase()} services for Austin-area small businesses.`,
    status: "approved",
    reputation_score: Number((3.8 + (index % 12) * 0.1).toFixed(2)),
    ratings_count: 3 + (index % 40),
    offer: {
      category: offerCat,
      unit: index % 2 === 0 ? "months" : "project",
      quantity: 1 + (index % 6),
      fmv_estimate: 600 + (index % 20) * 100,
      notes: `${offerCat} for trade network members`,
    },
    need: {
      category: needCat,
      unit: index % 3 === 0 ? "sessions" : "months",
      quantity: 1 + (index % 4),
      fmv_estimate: 500 + (index % 15) * 80,
      notes: `Looking for ${needCat.toLowerCase()} through barter`,
    },
  };
}

function allBusinesses() {
  const generated = [];
  for (let i = 7; i <= SEED_BUSINESS_COUNT; i += 1) {
    generated.push(generatedBusiness(i));
  }
  return [...CURATED, ...generated];
}

/** Deterministic demo swipes: focal interest, mutual pairs, scattered passes. */
function buildDiscoverySwipes(businesses) {
  const ids = businesses.map((b) => b.id);
  const byId = new Set(ids);
  const swipes = new Map();

  const add = (swiperId, targetId, action) => {
    if (swiperId === targetId || !byId.has(swiperId) || !byId.has(targetId)) {
      return;
    }
    swipes.set(`${swiperId}:${targetId}`, {
      swiper_business_id: swiperId,
      target_business_id: targetId,
      action,
    });
  };

  // Demo focal (Sunrise Yoga) interested in next 35 businesses
  for (const target of ids.slice(1, 36)) {
    add(DEMO_FOCAL_BUSINESS_ID, target, "interested");
  }

  // Mutual interest back toward focal from businesses 2–12
  for (const swiper of ids.slice(1, 12)) {
    add(swiper, DEMO_FOCAL_BUSINESS_ID, "interested");
  }

  // Cross-interest chains for matches tab (even ↔ even+1)
  for (let i = 6; i < Math.min(ids.length - 1, 80); i += 2) {
    add(ids[i], ids[i + 1], "interested");
    add(ids[i + 1], ids[i], "interested");
  }

  // Pass / save variety from later businesses
  for (let i = 40; i < Math.min(ids.length, 120); i += 3) {
    const target = ids[(i * 7) % ids.length];
    add(ids[i], target, i % 6 === 0 ? "save" : "pass");
  }

  return [...swipes.values()];
}

async function main() {
  const businesses = allBusinesses();
  const businessRows = businesses.map(
    ({
      id,
      legal_name,
      dba,
      slug,
      metro,
      vertical,
      website,
      description,
      reputation_score,
      ratings_count,
    }) => ({
      id,
      legal_name,
      dba,
      slug,
      metro,
      vertical,
      website,
      description,
      status: "approved",
      reputation_score,
      ratings_count,
    }),
  );

  const { error: bizError } = await supabase
    .from("businesses")
    .upsert(businessRows, { onConflict: "id" });

  if (bizError) {
    console.error("businesses upsert failed:", bizError.message);
    process.exit(1);
  }

  const listings = [];
  let listingSeq = 1;

  for (const biz of businesses) {
    const offerId = `20000000-0000-4000-8000-${padId(listingSeq++)}`;
    const needId = `20000000-0000-4000-8000-${padId(listingSeq++)}`;

    listings.push({
      id: offerId,
      business_id: biz.id,
      listing_type: "offer",
      category: biz.offer.category,
      unit: biz.offer.unit,
      quantity: biz.offer.quantity,
      fmv_estimate: biz.offer.fmv_estimate,
      notes: biz.offer.notes,
      is_active: true,
    });

    listings.push({
      id: needId,
      business_id: biz.id,
      listing_type: "need",
      category: biz.need.category,
      unit: biz.need.unit,
      quantity: biz.need.quantity,
      fmv_estimate: biz.need.fmv_estimate,
      notes: biz.need.notes,
      is_active: true,
    });
  }

  const { error: listingError } = await supabase
    .from("listings")
    .upsert(listings, { onConflict: "id" });

  if (listingError) {
    console.error("listings upsert failed:", listingError.message);
    process.exit(1);
  }

  const swipeRows = buildDiscoverySwipes(businesses);
  const chunkSize = 100;
  for (let i = 0; i < swipeRows.length; i += chunkSize) {
    const chunk = swipeRows.slice(i, i + chunkSize);
    const { error: swipeError } = await supabase
      .from("business_discovery_swipes")
      .upsert(chunk, { onConflict: "swiper_business_id,target_business_id" });
    if (swipeError) {
      console.error("discovery swipes upsert failed:", swipeError.message);
      process.exit(1);
    }
  }

  const { count: matchCount } = await supabase
    .from("business_matches")
    .select("id", { count: "exact", head: true });

  const { count, error: countError } = await supabase
    .from("businesses")
    .select("id", { count: "exact", head: true })
    .eq("status", "approved");

  if (countError) {
    console.error("count failed:", countError.message);
    process.exit(1);
  }

  console.log(
    `Seeded ${businesses.length} businesses (${listings.length} listings, ${swipeRows.length} discovery swipes, ${matchCount ?? 0} mutual matches). Approved total: ${count ?? "?"}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
