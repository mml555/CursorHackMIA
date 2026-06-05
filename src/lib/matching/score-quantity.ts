import { UNIT_GROUPS } from "@/lib/matching/config";
import { normalizeText } from "@/lib/matching/normalize";
import type { MatchListing } from "@/lib/matching/types";

function unitFamily(unit: string): string | null {
  const norm = normalizeText(unit);
  for (const group of UNIT_GROUPS) {
    if (group.some((u) => norm.includes(u) || u.includes(norm))) {
      return group[0];
    }
  }
  return null;
}

/**
 * Score how well offer quantity aligns with need quantity (0–1).
 * Requires compatible unit families; penalizes large mismatches (10 hrs vs 1 project).
 */
export function scoreQuantityFit(offer: MatchListing, need: MatchListing): number {
  const offerFamily = unitFamily(offer.unit);
  const needFamily = unitFamily(need.unit);

  if (!offerFamily || !needFamily) return 0.75;
  if (offerFamily !== needFamily) return 0.45;

  const offerQty = Number(offer.quantity);
  const needQty = Number(need.quantity);

  if (!Number.isFinite(offerQty) || !Number.isFinite(needQty)) return 0.7;
  if (offerQty <= 0 || needQty <= 0) return 0.5;

  const ratio = Math.min(offerQty, needQty) / Math.max(offerQty, needQty);
  return Math.min(1, 0.35 + ratio * 0.65);
}

/**
 * FMV adjusted by quantity alignment when both sides have estimates.
 */
export function adjustedFmvForEdge(
  offer: MatchListing,
  need: MatchListing,
  offerFmv: number | null,
  needFmv: number | null,
): number | null {
  const qtyScore = scoreQuantityFit(offer, need);
  const base = offerFmv ?? needFmv;
  if (base == null) return null;
  return Math.round(base * qtyScore * 100) / 100;
}
