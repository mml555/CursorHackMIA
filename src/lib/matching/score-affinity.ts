import type { MatchBusiness, MatchOptions } from "@/lib/matching/types";

const MAX_BOOST = 1.12;
const MIN_BOOST = 0.92;

/**
 * Soft multiplier from business context (vertical alignment, vendor reputation).
 * Applied to listing match score before edge threshold checks.
 */
export function scoreBusinessAffinity(
  offerBusiness: MatchBusiness,
  needBusiness: MatchBusiness,
  options?: Pick<MatchOptions, "preferSameVertical">,
): number {
  let boost = 1;

  const preferVertical = options?.preferSameVertical ?? true;
  if (
    preferVertical &&
    offerBusiness.vertical &&
    needBusiness.vertical &&
    offerBusiness.vertical.toLowerCase() === needBusiness.vertical.toLowerCase()
  ) {
    boost += 0.06;
  }

  if (
    offerBusiness.reputationScore != null &&
    offerBusiness.ratingsCount >= 3 &&
    offerBusiness.reputationScore >= 4
  ) {
    boost += 0.04 * (offerBusiness.reputationScore / 5);
  }

  if (
    needBusiness.reputationScore != null &&
    needBusiness.ratingsCount >= 3 &&
    needBusiness.reputationScore < 3
  ) {
    boost -= 0.03;
  }

  return Math.max(MIN_BOOST, Math.min(MAX_BOOST, boost));
}
