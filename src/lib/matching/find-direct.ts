import {
  combineBidirectionalMatchScore,
  combineMatchScore,
  estimatePartyFmv,
  scoreFmvBalance,
  scoreReputation,
} from "@/lib/matching/score-pair";
import { suggestCashTopup } from "@/lib/matching/score-fmv";
import { scoreToConfidence } from "@/lib/matching/confidence";
import { summarizeDirectMatch } from "@/lib/matching/explain";
import type {
  DirectTradeMatch,
  MatchBusiness,
  MatchListing,
  MatchParty,
  OfferNeedEdge,
} from "@/lib/matching/types";

function listingMap(listings: MatchListing[]): Map<string, MatchListing> {
  return new Map(listings.map((l) => [l.id, l]));
}

function businessMap(businesses: MatchBusiness[]): Map<string, MatchBusiness> {
  return new Map(businesses.map((b) => [b.id, b]));
}

function buildParty(
  business: MatchBusiness,
  giveListing: MatchListing,
  receiveListing: MatchListing,
  giveEdge: OfferNeedEdge,
): MatchParty {
  return {
    businessId: business.id,
    businessName: business.legalName,
    giveListingId: giveListing.id,
    giveCategory: giveListing.category,
    receiveListingId: receiveListing.id,
    receiveCategory: receiveListing.category,
    estimatedFmv: estimatePartyFmv(giveEdge.offerFmv, giveEdge.needFmv),
  };
}

type DirectCandidate = {
  businessAId: string;
  businessBId: string;
  forward: OfferNeedEdge;
  reverse: OfferNeedEdge;
};

export function findDirectMatches(
  edges: OfferNeedEdge[],
  businesses: MatchBusiness[],
  listings: MatchListing[],
): DirectTradeMatch[] {
  const listingsById = listingMap(listings);
  const businessesById = businessMap(businesses);

  const forwardByPair = new Map<string, OfferNeedEdge[]>();

  for (const edge of edges) {
    const pairKey = [edge.offerBusinessId, edge.needBusinessId].sort().join("|");
    const directionKey = `${pairKey}:${edge.offerBusinessId}->${edge.needBusinessId}`;
    const list = forwardByPair.get(directionKey) ?? [];
    list.push(edge);
    forwardByPair.set(directionKey, list);
  }

  const bestByBusinessPair = new Map<string, DirectCandidate>();

  for (const edge of edges) {
    const reverseKey = `${[edge.needBusinessId, edge.offerBusinessId].sort().join("|")}:${edge.needBusinessId}->${edge.offerBusinessId}`;
    const reverseEdges = forwardByPair.get(reverseKey) ?? [];

    for (const reverse of reverseEdges) {
      const businessAId = edge.offerBusinessId;
      const businessBId = edge.needBusinessId;
      const pairId = [businessAId, businessBId].sort().join("|");

      const combined = combineBidirectionalMatchScore(
        edge.matchScore,
        reverse.matchScore,
      );
      if (combined <= 0) continue;

      const existing = bestByBusinessPair.get(pairId);
      if (existing) {
        const existingCombined = combineBidirectionalMatchScore(
          existing.forward.matchScore,
          existing.reverse.matchScore,
        );
        if (combined <= existingCombined) continue;
      }

      bestByBusinessPair.set(pairId, {
        businessAId,
        businessBId,
        forward: edge,
        reverse,
      });
    }
  }

  const matches: DirectTradeMatch[] = [];

  for (const candidate of bestByBusinessPair.values()) {
    const businessA = businessesById.get(candidate.businessAId);
    const businessB = businessesById.get(candidate.businessBId);
    if (!businessA || !businessB) continue;

    const aGives = listingsById.get(candidate.forward.offerId);
    const aReceives = listingsById.get(candidate.forward.needId);
    const bGives = listingsById.get(candidate.reverse.offerId);
    const bReceives = listingsById.get(candidate.reverse.needId);

    if (!aGives || !aReceives || !bGives || !bReceives) continue;

    const forwardMatchScore = candidate.forward.matchScore;
    const reverseMatchScore = candidate.reverse.matchScore;
    const matchScore = combineBidirectionalMatchScore(
      forwardMatchScore,
      reverseMatchScore,
    );

    const avgTextScore =
      (candidate.forward.textScore + candidate.reverse.textScore) / 2;
    const avgUnitScore =
      (candidate.forward.unitScore + candidate.reverse.unitScore) / 2;
    const avgQuantityScore =
      (candidate.forward.quantityScore + candidate.reverse.quantityScore) / 2;
    const usedEmbeddings =
      candidate.forward.usedEmbeddings || candidate.reverse.usedEmbeddings;
    const avgAffinity =
      (candidate.forward.affinityScore + candidate.reverse.affinityScore) / 2;

    const fmvA = estimatePartyFmv(
      candidate.forward.offerFmv,
      candidate.forward.needFmv,
    );
    const fmvB = estimatePartyFmv(
      candidate.reverse.offerFmv,
      candidate.reverse.needFmv,
    );
    const fmvBalanceScore = scoreFmvBalance([fmvA, fmvB]);
    const reputationScore = scoreReputation([businessA, businessB]);

    const score = combineMatchScore({
      matchScore,
      fmvBalanceScore,
      reputationScore,
      unitScore: avgUnitScore,
    });

    const parties: [MatchParty, MatchParty] = [
      buildParty(businessA, aGives, aReceives, candidate.forward),
      buildParty(businessB, bGives, bReceives, candidate.reverse),
    ];

    const cashTopup = suggestCashTopup(parties);

    const match: DirectTradeMatch = {
      tradeType: "direct",
      score,
      confidence: scoreToConfidence(score),
      summary: "",
      parties,
      cashTopup,
      reason: {
        categoryScore: matchScore,
        textScore: avgTextScore,
        unitScore: avgUnitScore,
        quantityScore: avgQuantityScore,
        affinityScore: avgAffinity,
        usedEmbeddings,
        fmvBalanceScore,
        reputationScore,
        forwardMatchScore,
        reverseMatchScore,
      },
    };

    match.summary = summarizeDirectMatch(match);
    matches.push(match);
  }

  return matches;
}

export function directMatchFingerprint(match: DirectTradeMatch): string {
  const ids = match.parties
    .flatMap((p) => [p.businessId, p.giveListingId, p.receiveListingId])
    .sort()
    .join("|");
  return `direct:${ids}`;
}
