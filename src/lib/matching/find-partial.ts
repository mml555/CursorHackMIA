import { hasReciprocalEdge } from "@/lib/matching/build-edges";
import { summarizePartialMatch } from "@/lib/matching/explain";
import type {
  MatchBusiness,
  MatchListing,
  OfferNeedEdge,
  PartialMatch,
} from "@/lib/matching/types";

/**
 * One-way fits: strong offer→need edge with no reverse offer→need edge.
 * Surfaces "near misses" to prompt users to add reciprocal listings.
 */
export function findPartialMatches(
  edges: OfferNeedEdge[],
  businesses: MatchBusiness[],
  listings: MatchListing[],
  options: {
    minPartialScore: number;
    maxResults: number;
  },
): PartialMatch[] {
  const businessMap = new Map(businesses.map((b) => [b.id, b]));
  const listingMap = new Map(listings.map((l) => [l.id, l]));
  const bestByDirection = new Map<string, OfferNeedEdge>();

  for (const edge of edges) {
    const key = `${edge.offerBusinessId}->${edge.needBusinessId}`;
    const existing = bestByDirection.get(key);
    if (!existing || edge.matchScore > existing.matchScore) {
      bestByDirection.set(key, edge);
    }
  }

  const partial: PartialMatch[] = [];

  for (const edge of bestByDirection.values()) {
    if (edge.matchScore < options.minPartialScore) continue;

    if (
      hasReciprocalEdge(edges, edge.offerBusinessId, edge.needBusinessId)
    ) {
      continue;
    }

    const offerBusiness = businessMap.get(edge.offerBusinessId);
    const needBusiness = businessMap.get(edge.needBusinessId);
    const offerListing = listingMap.get(edge.offerId);
    const needListing = listingMap.get(edge.needId);

    if (!offerBusiness || !needBusiness || !offerListing || !needListing) {
      continue;
    }

    const match: PartialMatch = {
      tradeType: "partial",
      score: edge.matchScore,
      summary: "",
      offerBusinessId: edge.offerBusinessId,
      offerBusinessName: offerBusiness.legalName,
      needBusinessId: edge.needBusinessId,
      needBusinessName: needBusiness.legalName,
      offerListingId: edge.offerId,
      needListingId: edge.needId,
      offerCategory: offerListing.category,
      needCategory: needListing.category,
      reason: {
        matchScore: edge.matchScore,
        categoryScore: edge.categoryScore,
        textScore: edge.textScore,
        missingReciprocal: true,
      },
    };

    match.summary = summarizePartialMatch(match);
    partial.push(match);
  }

  return partial.sort((a, b) => b.score - a.score).slice(0, options.maxResults);
}
