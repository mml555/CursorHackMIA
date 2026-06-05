import { cosineSimilarity } from "@/lib/matching/embeddings/cosine";
import { scoreCategoryMatch } from "@/lib/matching/score-category";
import type { MatchListing } from "@/lib/matching/types";

export type ListingEmbeddingMap = Map<string, number[]>;

/**
 * Semantic fit: pgvector-backed cosine when both listings have embeddings,
 * otherwise falls back to rule-based category match.
 */
export function scoreSemanticMatch(
  offer: MatchListing,
  need: MatchListing,
  embeddings?: ListingEmbeddingMap,
): { score: number; usedEmbeddings: boolean } {
  const offerVec = embeddings?.get(offer.id);
  const needVec = embeddings?.get(need.id);

  if (offerVec && needVec && offerVec.length === needVec.length) {
    return {
      score: cosineSimilarity(offerVec, needVec),
      usedEmbeddings: true,
    };
  }

  return {
    score: scoreCategoryMatch(offer.category, need.category),
    usedEmbeddings: false,
  };
}
