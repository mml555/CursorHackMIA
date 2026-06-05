import {
  combineMatchScore,
  estimatePartyFmv,
  scoreFmvBalance,
  scoreReputation,
} from "@/lib/matching/score-pair";
import { combineCycleCategoryScore } from "@/lib/matching/score-category";
import { scoreToConfidence } from "@/lib/matching/confidence";
import { suggestCashTopup } from "@/lib/matching/score-fmv";
import { summarizeMultiPartyMatch } from "@/lib/matching/explain";
import type {
  MatchBusiness,
  MatchListing,
  MatchParty,
  MultiPartyTradeMatch,
  OfferNeedEdge,
} from "@/lib/matching/types";

type Adjacency = Map<string, OfferNeedEdge[]>;

type CyclePath = {
  businessIds: string[];
  edges: OfferNeedEdge[];
};

function listingMap(listings: MatchListing[]): Map<string, MatchListing> {
  return new Map(listings.map((l) => [l.id, l]));
}

function businessMap(businesses: MatchBusiness[]): Map<string, MatchBusiness> {
  return new Map(businesses.map((b) => [b.id, b]));
}

function buildAdjacency(edges: OfferNeedEdge[]): Adjacency {
  const adj = new Map<string, OfferNeedEdge[]>();
  for (const edge of edges) {
    const list = adj.get(edge.offerBusinessId) ?? [];
    list.push(edge);
    adj.set(edge.offerBusinessId, list);
  }

  for (const [key, list] of adj) {
    list.sort((a, b) => b.matchScore - a.matchScore);
    adj.set(key, list);
  }

  return adj;
}

function buildPartyFromEdge(
  business: MatchBusiness,
  giveListing: MatchListing,
  receiveListing: MatchListing,
  edge: OfferNeedEdge,
): MatchParty {
  return {
    businessId: business.id,
    businessName: business.legalName,
    giveListingId: giveListing.id,
    giveCategory: giveListing.category,
    receiveListingId: receiveListing.id,
    receiveCategory: receiveListing.category,
    estimatedFmv: estimatePartyFmv(edge.offerFmv, edge.needFmv),
  };
}

function cyclePathToMatch(
  path: CyclePath,
  businessesById: Map<string, MatchBusiness>,
  listingsById: Map<string, MatchListing>,
): MultiPartyTradeMatch | null {
  const edgeScores = path.edges.map((e) => e.matchScore);
  const minEdgeScore = combineCycleCategoryScore(edgeScores);
  if (minEdgeScore <= 0) return null;

  const avgEdgeScore =
    edgeScores.reduce((sum, s) => sum + s, 0) / edgeScores.length;
  const avgTextScore =
    path.edges.reduce((sum, e) => sum + e.textScore, 0) / path.edges.length;
  const avgUnitScore =
    path.edges.reduce((sum, e) => sum + e.unitScore, 0) / path.edges.length;
  const avgQuantityScore =
    path.edges.reduce((sum, e) => sum + e.quantityScore, 0) /
    path.edges.length;
  const avgAffinity =
    path.edges.reduce((sum, e) => sum + e.affinityScore, 0) /
    path.edges.length;
  const usedEmbeddings = path.edges.some((e) => e.usedEmbeddings);

  const parties: MatchParty[] = [];
  const participatingBusinesses: MatchBusiness[] = [];
  const fmvValues: (number | null)[] = [];

  for (let i = 0; i < path.businessIds.length; i++) {
    const businessId = path.businessIds[i];
    const edge = path.edges[i];
    const business = businessesById.get(businessId);
    if (!business) return null;

    const giveListing = listingsById.get(edge.offerId);
    const receiveListing = listingsById.get(edge.needId);
    if (!giveListing || !receiveListing) return null;

    parties.push(
      buildPartyFromEdge(business, giveListing, receiveListing, edge),
    );
    participatingBusinesses.push(business);
    fmvValues.push(estimatePartyFmv(edge.offerFmv, edge.needFmv));
  }

  const fmvBalanceScore = scoreFmvBalance(fmvValues);
  const reputationScore = scoreReputation(participatingBusinesses);
  const score = combineMatchScore({
    matchScore: minEdgeScore,
    fmvBalanceScore,
    reputationScore,
    unitScore: avgUnitScore,
  });

  const cashTopup = suggestCashTopup(parties);

  const match: MultiPartyTradeMatch = {
    tradeType: "multi_party",
    score,
    confidence: scoreToConfidence(score),
    summary: "",
    cycleLength: path.businessIds.length,
    parties,
    cashTopup,
    reason: {
      categoryScore: minEdgeScore,
      textScore: avgTextScore,
      unitScore: avgUnitScore,
      quantityScore: avgQuantityScore,
      affinityScore: avgAffinity,
      usedEmbeddings,
      fmvBalanceScore,
      reputationScore,
      minEdgeScore,
      avgEdgeScore,
      edgeScores,
    },
  };

  match.summary = summarizeMultiPartyMatch(match);
  return match;
}

/**
 * DFS cycle finder — explores highest-scoring edges first; keeps best cycle per participant set.
 */
export function findCycles(
  edges: OfferNeedEdge[],
  businesses: MatchBusiness[],
  listings: MatchListing[],
  maxLength: number,
  maxCycles = 500,
): MultiPartyTradeMatch[] {
  if (edges.length === 0 || maxLength < 3) return [];

  const adj = buildAdjacency(edges);
  const listingsById = listingMap(listings);
  const businessesById = businessMap(businesses);
  const bestByFingerprint = new Map<string, MultiPartyTradeMatch>();

  const starts = [...new Set(edges.map((e) => e.offerBusinessId))].sort();

  for (const startId of starts) {
    if (bestByFingerprint.size >= maxCycles) break;

    const stack: {
      currentId: string;
      pathIds: string[];
      pathEdges: OfferNeedEdge[];
    }[] = [{ currentId: startId, pathIds: [startId], pathEdges: [] }];

    while (stack.length > 0 && bestByFingerprint.size < maxCycles) {
      const { currentId, pathIds, pathEdges } = stack.pop()!;
      const hops = adj.get(currentId) ?? [];

      for (const edge of hops) {
        const nextId = edge.needBusinessId;

        if (nextId === startId && pathIds.length >= 3) {
          const closed: CyclePath = {
            businessIds: pathIds,
            edges: [...pathEdges, edge],
          };
          const fingerprint = [...closed.businessIds].sort().join("|");

          const match = cyclePathToMatch(closed, businessesById, listingsById);
          if (!match) continue;

          const existing = bestByFingerprint.get(fingerprint);
          if (!existing || match.score > existing.score) {
            bestByFingerprint.set(fingerprint, match);
          }
          continue;
        }

        if (pathIds.includes(nextId)) continue;
        if (pathIds.length + 1 > maxLength) continue;

        stack.push({
          currentId: nextId,
          pathIds: [...pathIds, nextId],
          pathEdges: [...pathEdges, edge],
        });
      }
    }
  }

  return [...bestByFingerprint.values()];
}

export function findThreePartyCycles(
  edges: OfferNeedEdge[],
  businesses: MatchBusiness[],
  listings: MatchListing[],
): MultiPartyTradeMatch[] {
  return findCycles(edges, businesses, listings, 3);
}

export function findMultiPartyMatches(
  edges: OfferNeedEdge[],
  businesses: MatchBusiness[],
  listings: MatchListing[],
  maxCycleLength: number,
  maxCycles = 500,
): MultiPartyTradeMatch[] {
  if (maxCycleLength < 3) return [];
  return findCycles(
    edges,
    businesses,
    listings,
    maxCycleLength,
    maxCycles,
  );
}

export function multiPartyFingerprint(match: MultiPartyTradeMatch): string {
  const ids = match.parties
    .map((p) => p.businessId)
    .sort()
    .join("|");
  return `multi:${ids}:${match.cycleLength}`;
}
