export const RAW_SCORE_FLOOR = 0.45;
export const RAW_SCORE_CEILING = 1;
export const POINTS_MIN = 40;
export const POINTS_MAX = 100;

export const MATCH_FIT_TIERS = [
  { id: "excellent", label: "Excellent", minPoints: 85 },
  { id: "strong", label: "Strong", minPoints: 70 },
  { id: "good", label: "Good", minPoints: 55 },
  { id: "fair", label: "Fair", minPoints: POINTS_MIN },
];

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function rawScoreToPoints(rawScore) {
  const normalized = clamp(rawScore, RAW_SCORE_FLOOR, RAW_SCORE_CEILING);
  const span = RAW_SCORE_CEILING - RAW_SCORE_FLOOR;
  const ratio = (normalized - RAW_SCORE_FLOOR) / span;
  return Math.round(POINTS_MIN + ratio * (POINTS_MAX - POINTS_MIN));
}

export function pointsToTier(points) {
  const clamped = clamp(points, POINTS_MIN, POINTS_MAX);
  for (const tier of MATCH_FIT_TIERS) {
    if (clamped >= tier.minPoints) return tier.id;
  }
  return "fair";
}

export function tierLabel(tier) {
  return MATCH_FIT_TIERS.find((entry) => entry.id === tier)?.label ?? "Fair";
}

export function rawScoreToMatchPoints(rawScore) {
  const points = rawScoreToPoints(rawScore);
  const tier = pointsToTier(points);
  return { points, tier, tierLabel: tierLabel(tier) };
}
