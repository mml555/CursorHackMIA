import { SCORE_WEIGHTS } from "@/lib/matching/config";
import type { MatchBusiness } from "@/lib/matching/types";

export function scoreFmvBalance(fmvValues: (number | null)[]): number {
  const values = fmvValues.filter((v): v is number => v != null && v > 0);
  if (values.length === 0) return 0.7;
  if (values.length === 1) return 0.75;

  const max = Math.max(...values);
  const min = Math.min(...values);
  if (max === 0) return 0.7;

  const ratio = min / max;
  return Math.min(1, 0.4 + ratio * 0.6);
}

export function scoreReputation(businesses: MatchBusiness[]): number {
  if (businesses.length === 0) return 0.5;

  const scored = businesses
    .filter((b) => b.ratingsCount >= 3 && b.reputationScore != null)
    .map((b) => b.reputationScore! / 5);

  if (scored.length === 0) return 0.5;
  return scored.reduce((sum, s) => sum + s, 0) / scored.length;
}

export function averageUnitScore(scores: number[]): number {
  if (scores.length === 0) return 0.85;
  return scores.reduce((sum, s) => sum + s, 0) / scores.length;
}

export function combineMatchScore(components: {
  matchScore: number;
  fmvBalanceScore: number;
  reputationScore: number;
  unitScore: number;
}): number {
  const { category, fmvBalance, reputation, unit } = SCORE_WEIGHTS;
  return (
    components.matchScore * category +
    components.fmvBalanceScore * fmvBalance +
    components.reputationScore * reputation +
    components.unitScore * unit
  );
}

export function estimatePartyFmv(
  offerFmv: number | null,
  needFmv: number | null,
): number | null {
  if (offerFmv != null) return offerFmv;
  if (needFmv != null) return needFmv;
  return null;
}

export function combineBidirectionalMatchScore(
  forward: number,
  reverse: number,
): number {
  if (forward <= 0 || reverse <= 0) return 0;
  return Math.sqrt(forward * reverse);
}
