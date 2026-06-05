import { DEFAULT_MATCH_OPTIONS } from "@/lib/matching/config";
import {
  buildEmbeddingCandidatePairs,
  shouldEvaluatePair,
} from "@/lib/matching/prefilter";
import { scoreBusinessAffinity } from "@/lib/matching/score-affinity";
import { scoreListingPair } from "@/lib/matching/score-listing";
import { scoreUnitCompatibility } from "@/lib/matching/score-unit";
import { adjustedFmvForEdge } from "@/lib/matching/score-quantity";
import type {
  MatchBusiness,
  MatchEmbeddingMap,
  MatchListing,
  MatchOptions,
  OfferNeedEdge,
} from "@/lib/matching/types";

const INTERESTED_EDGE_BOOST = 1.05;

function resolveOptions(
  options?: MatchOptions,
): Required<Omit<MatchOptions, "excludeBusinessIds" | "interestedBoostBusinessIds">> & {
  excludeBusinessIds: string[];
  interestedBoostBusinessIds: string[];
} {
  return { ...DEFAULT_MATCH_OPTIONS, ...options };
}

function isExcluded(businessId: string, excluded: Set<string>): boolean {
  return excluded.has(businessId);
}

function isEligiblePair(
  a: MatchBusiness,
  b: MatchBusiness,
  options: ReturnType<typeof resolveOptions>,
  excluded: Set<string>,
): boolean {
  if (a.id === b.id) return false;
  if (isExcluded(a.id, excluded) || isExcluded(b.id, excluded)) return false;

  if (
    options.sameMetroOnly &&
    a.metro &&
    b.metro &&
    a.metro.toLowerCase() !== b.metro.toLowerCase()
  ) {
    return false;
  }

  if (
    options.sameVerticalOnly &&
    a.vertical &&
    b.vertical &&
    a.vertical.toLowerCase() !== b.vertical.toLowerCase()
  ) {
    return false;
  }

  return true;
}

function activeListings(listings: MatchListing[]): MatchListing[] {
  return listings.filter((l) => l.isActive !== false);
}

function interestedBoost(
  offerBusinessId: string,
  needBusinessId: string,
  interested: Set<string>,
): number {
  if (interested.size === 0) return 1;
  if (interested.has(needBusinessId) || interested.has(offerBusinessId)) {
    return INTERESTED_EDGE_BOOST;
  }
  return 1;
}

export function buildOfferNeedEdges(
  businesses: MatchBusiness[],
  listings: MatchListing[],
  options?: MatchOptions,
  embeddings?: MatchEmbeddingMap,
): OfferNeedEdge[] {
  const opts = resolveOptions(options);
  const excluded = new Set(opts.excludeBusinessIds);
  const interested = new Set(opts.interestedBoostBusinessIds);
  const businessMap = new Map(businesses.map((b) => [b.id, b]));
  const active = activeListings(listings);

  const offers = active.filter((l) => l.listingType === "offer");
  const needs = active.filter((l) => l.listingType === "need");

  const embeddingCandidates =
    embeddings && embeddings.size > 0
      ? buildEmbeddingCandidatePairs(
          offers,
          needs,
          embeddings,
          opts.topKEmbeddingCandidates,
        )
      : null;

  const edges: OfferNeedEdge[] = [];

  for (const offer of offers) {
    const offerBusiness = businessMap.get(offer.businessId);
    if (!offerBusiness || isExcluded(offer.businessId, excluded)) continue;

    for (const need of needs) {
      if (offer.businessId === need.businessId) continue;
      if (!shouldEvaluatePair(offer.id, need.id, embeddingCandidates)) continue;

      const needBusiness = businessMap.get(need.businessId);
      if (!needBusiness) continue;
      if (!isEligiblePair(offerBusiness, needBusiness, opts, excluded)) continue;

      const unitScore = scoreUnitCompatibility(offer, need);
      const breakdown = scoreListingPair(
        offer,
        need,
        offerBusiness,
        needBusiness,
        unitScore,
        embeddings,
      );

      const affinity = scoreBusinessAffinity(offerBusiness, needBusiness, opts);
      const interest = interestedBoost(
        offer.businessId,
        need.businessId,
        interested,
      );

      const rawScore = breakdown.score * affinity * interest;
      const categoryScore = breakdown.categoryScore;

      if (categoryScore < opts.minCategoryScore) continue;
      if (rawScore < opts.minMatchScore) continue;

      const adjustedFmv = adjustedFmvForEdge(
        offer,
        need,
        offer.fmvEstimate,
        need.fmvEstimate,
      );

      edges.push({
        offerId: offer.id,
        offerBusinessId: offer.businessId,
        needId: need.id,
        needBusinessId: need.businessId,
        matchScore: rawScore,
        categoryScore,
        textScore: breakdown.textScore,
        unitScore: breakdown.unitScore,
        quantityScore: breakdown.quantityScore,
        affinityScore: affinity * interest,
        usedEmbeddings: breakdown.usedEmbeddings,
        offerFmv: adjustedFmv ?? offer.fmvEstimate,
        needFmv: need.fmvEstimate,
      });
    }
  }

  return edges;
}

export function indexEdgesByOfferBusiness(
  edges: OfferNeedEdge[],
): Map<string, OfferNeedEdge[]> {
  const map = new Map<string, OfferNeedEdge[]>();
  for (const edge of edges) {
    const list = map.get(edge.offerBusinessId) ?? [];
    list.push(edge);
    map.set(edge.offerBusinessId, list);
  }
  return map;
}

export function hasReciprocalEdge(
  edges: OfferNeedEdge[],
  fromBusinessId: string,
  toBusinessId: string,
): boolean {
  return edges.some(
    (e) =>
      e.offerBusinessId === toBusinessId && e.needBusinessId === fromBusinessId,
  );
}

export function filterEligibleBusinesses(
  businesses: MatchBusiness[],
  options?: MatchOptions,
): MatchBusiness[] {
  const opts = resolveOptions(options);
  const excluded = new Set(opts.excludeBusinessIds);

  return businesses.filter((b) => {
    if (excluded.has(b.id)) return false;
    if (opts.approvedOnly && b.status && b.status !== "approved") return false;
    return true;
  });
}

export function businessesWithInventory(
  businesses: MatchBusiness[],
  listings: MatchListing[],
): MatchBusiness[] {
  const active = activeListings(listings);
  const hasOffer = new Set<string>();
  const hasNeed = new Set<string>();

  for (const listing of active) {
    if (listing.listingType === "offer") hasOffer.add(listing.businessId);
    if (listing.listingType === "need") hasNeed.add(listing.businessId);
  }

  return businesses.filter((b) => hasOffer.has(b.id) && hasNeed.has(b.id));
}
