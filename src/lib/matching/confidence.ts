import type { MatchConfidence } from "@/lib/matching/types";

export const CONFIDENCE_THRESHOLDS = {
  high: 0.72,
  medium: 0.58,
} as const;

export function scoreToConfidence(score: number): MatchConfidence {
  if (score >= CONFIDENCE_THRESHOLDS.high) return "high";
  if (score >= CONFIDENCE_THRESHOLDS.medium) return "medium";
  return "low";
}
