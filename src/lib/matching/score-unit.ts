import { UNIT_GROUPS } from "@/lib/matching/config";
import { normalizeText } from "@/lib/matching/normalize";
import type { MatchListing } from "@/lib/matching/types";

function unitGroup(unit: string): Set<string> | null {
  const norm = normalizeText(unit);
  for (const group of UNIT_GROUPS) {
    if (group.some((u) => norm.includes(u) || u.includes(norm))) {
      return new Set(group);
    }
  }
  return null;
}

/**
 * Score unit compatibility between offer and need (0–1).
 * Soft penalty for mismatched units; neutral when unknown.
 */
export function scoreUnitCompatibility(
  offer: MatchListing,
  need: MatchListing,
): number {
  const offerGroup = unitGroup(offer.unit);
  const needGroup = unitGroup(need.unit);

  if (!offerGroup || !needGroup) return 0.85;

  for (const token of offerGroup) {
    if (needGroup.has(token)) return 1;
  }

  return 0.65;
}

export function normalizeUnitLabel(unit: string): string {
  const norm = normalizeText(unit);
  for (const group of UNIT_GROUPS) {
    if (group.some((u) => norm.includes(u))) return group[0];
  }
  return norm;
}
