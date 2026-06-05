import type { MatchOptions } from "@/lib/matching/types";

/** Default scoring weights for final trade rank — must sum to 1.0 */
export const SCORE_WEIGHTS = {
  category: 0.45,
  fmvBalance: 0.25,
  reputation: 0.2,
  unit: 0.1,
} as const;

/** Weights inside a single offer↔need listing score */
export const LISTING_SCORE_WEIGHTS = {
  /** Cosine embedding when available, else category rules */
  semantic: 0.55,
  text: 0.15,
  unit: 0.1,
  quantity: 0.2,
} as const;

export const DEFAULT_MATCH_OPTIONS: Required<
  Omit<MatchOptions, "excludeBusinessIds">
> & { excludeBusinessIds: string[] } = {
  minCategoryScore: 0.4,
  minMatchScore: 0.45,
  minCombinedScore: 0.55,
  maxCycleLength: 4,
  sameMetroOnly: true,
  sameVerticalOnly: false,
  maxResults: 50,
  approvedOnly: true,
  excludeBusinessIds: [],
  maxCyclesToEvaluate: 500,
  includePartial: true,
  minPartialScore: 0.65,
  topKEmbeddingCandidates: 12,
  maxMatchesPerCounterparty: 3,
  preferSameVertical: true,
  interestedBoostBusinessIds: [],
};

export const SYNONYM_GROUPS: readonly string[][] = [
  ["cleaning", "janitorial", "custodial", "sanitize", "sanitation", "maid"],
  ["design", "graphic", "logo", "branding", "creative", "visual", "identity"],
  ["print", "printing", "flyer", "brochure", "cards", "collateral", "signage"],
  ["marketing", "social", "media", "content", "seo", "advertising", "promotion"],
  ["legal", "law", "attorney", "counsel", "compliance", "contract"],
  ["accounting", "bookkeeping", "payroll", "tax", "cpa", "finance"],
  ["web", "website", "development", "software", "app", "digital"],
  ["photography", "photo", "video", "videography", "filming"],
  ["wellness", "yoga", "fitness", "massage", "therapy", "session", "sessions"],
  ["catering", "food", "event", "events", "hospitality", "venue"],
  ["consulting", "advisory", "strategy", "coaching", "training"],
  ["hvac", "plumbing", "electrical", "maintenance", "repair", "facilities"],
  ["staffing", "recruiting", "hiring", "talent", "hr"],
];

/** Related domains that partially match (not as strong as synonyms) */
export const RELATED_GROUP_PAIRS: readonly [string, string, number][] = [
  ["design", "marketing", 0.55],
  ["design", "print", 0.5],
  ["marketing", "print", 0.5],
  ["web", "marketing", 0.5],
  ["web", "design", 0.55],
  ["photography", "marketing", 0.45],
  ["consulting", "marketing", 0.4],
  ["accounting", "legal", 0.45],
];

export const UNIT_GROUPS: readonly string[][] = [
  ["hour", "hours", "hr", "hrs", "session", "sessions"],
  ["unit", "units", "piece", "pieces", "item", "items"],
  ["project", "flat", "engagement", "retainer"],
  ["card", "cards", "flyer", "flyers", "print"],
  ["month", "monthly", "week", "weekly"],
];

export const STOP_WORDS = new Set([
  "a",
  "an",
  "the",
  "and",
  "or",
  "for",
  "of",
  "to",
  "in",
  "on",
  "per",
  "month",
  "monthly",
  "hour",
  "hours",
  "service",
  "services",
  "business",
  "local",
  "professional",
]);

/** FMV imbalance above this ratio triggers cash top-up suggestion */
export const CASH_TOPUP_IMBALANCE_THRESHOLD = 0.2;
