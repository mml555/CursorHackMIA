/** Minimum internal match score we surface in discovery (see DEFAULT_MATCH_OPTIONS). */
export const RAW_SCORE_FLOOR = 0.45;

/** Internal score treated as a perfect listing fit. */
export const RAW_SCORE_CEILING = 1;

/** Lowest Match Fit Points shown in the product UI. */
export const POINTS_MIN = 40;

/** Highest Match Fit Points shown in the product UI. */
export const POINTS_MAX = 100;

export type MatchFitTier = "excellent" | "strong" | "good" | "fair";

export type MatchFitTierInfo = {
  id: MatchFitTier;
  label: string;
  minPoints: number;
  description: string;
};

export const MATCH_FIT_TIERS: readonly MatchFitTierInfo[] = [
  {
    id: "excellent",
    label: "Excellent",
    minPoints: 85,
    description: "Strong two-way fit across services, units, and value.",
  },
  {
    id: "strong",
    label: "Strong",
    minPoints: 70,
    description: "Clear reciprocal overlap with minor gaps to confirm.",
  },
  {
    id: "good",
    label: "Good",
    minPoints: 55,
    description: "Worth exploring — one or two terms may need alignment.",
  },
  {
    id: "fair",
    label: "Fair",
    minPoints: POINTS_MIN,
    description: "Partial overlap; propose only if you can close the gap.",
  },
] as const;

export const MATCH_SCORE_COMPONENTS = [
  {
    label: "Service fit",
    weight: "45%",
    detail: "How closely what you offer matches what they need, and vice versa.",
  },
  {
    label: "Value balance",
    weight: "25%",
    detail: "Estimated fair-market value alignment between both sides.",
  },
  {
    label: "Outcome score",
    weight: "20%",
    detail: "Post-trade ratings from completed trades on the network.",
  },
  {
    label: "Unit compatibility",
    weight: "10%",
    detail: "Whether hours, sessions, projects, and quantities line up.",
  },
] as const;

export type MatchPointsResult = {
  points: number;
  tier: MatchFitTier;
  tierLabel: string;
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Maps a 0–1 internal ranking score to the public 40–100 Match Fit Points scale. */
export function rawScoreToPoints(rawScore: number): number {
  const normalized = clamp(rawScore, RAW_SCORE_FLOOR, RAW_SCORE_CEILING);
  const span = RAW_SCORE_CEILING - RAW_SCORE_FLOOR;
  const ratio = (normalized - RAW_SCORE_FLOOR) / span;
  return Math.round(POINTS_MIN + ratio * (POINTS_MAX - POINTS_MIN));
}

export function pointsToTier(points: number): MatchFitTier {
  const clamped = clamp(points, POINTS_MIN, POINTS_MAX);
  for (const tier of MATCH_FIT_TIERS) {
    if (clamped >= tier.minPoints) return tier.id;
  }
  return "fair";
}

export function tierLabel(tier: MatchFitTier): string {
  return MATCH_FIT_TIERS.find((entry) => entry.id === tier)?.label ?? "Fair";
}

export function rawScoreToMatchPoints(rawScore: number): MatchPointsResult {
  const points = rawScoreToPoints(rawScore);
  const tier = pointsToTier(points);
  return { points, tier, tierLabel: tierLabel(tier) };
}

/** Ring arc fill uses the same 40–100 scale so the gauge matches the number. */
export function pointsToRingProgress(points: number): number {
  const clamped = clamp(points, POINTS_MIN, POINTS_MAX);
  return ((clamped - POINTS_MIN) / (POINTS_MAX - POINTS_MIN)) * 100;
}
