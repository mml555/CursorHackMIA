import { cosineSimilarity } from "@/lib/matching/embeddings/cosine";
import type { MatchEmbeddingMap, MatchListing } from "@/lib/matching/types";

export type ListingPairKey = `${string}:${string}`;

export function listingPairKey(offerId: string, needId: string): ListingPairKey {
  return `${offerId}:${needId}`;
}

/**
 * When embeddings exist, only evaluate top-K need candidates per offer (by cosine).
 * Reduces noise and focuses on semantically plausible barter pairs.
 */
export function buildEmbeddingCandidatePairs(
  offers: MatchListing[],
  needs: MatchListing[],
  embeddings: MatchEmbeddingMap,
  topKPerOffer: number,
): Set<ListingPairKey> | null {
  const offerVectors = offers.filter((o) => embeddings.has(o.id));
  if (offerVectors.length === 0) return null;

  const candidates = new Set<ListingPairKey>();
  const k = Math.max(3, topKPerOffer);

  for (const offer of offers) {
    const offerVec = embeddings.get(offer.id);
    if (!offerVec) continue;

    const scored: { needId: string; score: number }[] = [];

    for (const need of needs) {
      if (need.businessId === offer.businessId) continue;
      const needVec = embeddings.get(need.id);
      if (!needVec) continue;
      scored.push({
        needId: need.id,
        score: cosineSimilarity(offerVec, needVec),
      });
    }

    scored.sort((a, b) => b.score - a.score);

    for (const row of scored.slice(0, k)) {
      candidates.add(listingPairKey(offer.id, row.needId));
    }
  }

  return candidates;
}

export function shouldEvaluatePair(
  offerId: string,
  needId: string,
  candidates: Set<ListingPairKey> | null,
): boolean {
  if (!candidates) return true;
  return candidates.has(listingPairKey(offerId, needId));
}
