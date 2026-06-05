import { LISTING_SCORE_WEIGHTS } from "@/lib/matching/config";
import {
  scoreSemanticMatch,
  type ListingEmbeddingMap,
} from "@/lib/matching/score-embedding";
import { scoreQuantityFit } from "@/lib/matching/score-quantity";
import { tokenSet } from "@/lib/matching/normalize";
import type { MatchBusiness, MatchListing } from "@/lib/matching/types";

function jaccardSimilarity(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let intersection = 0;
  for (const token of a) {
    if (b.has(token)) intersection += 1;
  }
  return intersection / new Set([...a, ...b]).size;
}

export function listingSearchText(
  listing: MatchListing,
  business?: MatchBusiness,
): string {
  return [listing.category, listing.notes, business?.description]
    .filter(Boolean)
    .join(" ");
}

export function scoreTextContextMatch(
  offer: MatchListing,
  need: MatchListing,
  offerBusiness?: MatchBusiness,
  needBusiness?: MatchBusiness,
): number {
  const offerText = listingSearchText(offer, offerBusiness);
  const needText = listingSearchText(need, needBusiness);

  const needTokens = tokenSet(needText);
  const offerTokens = tokenSet(offerText);

  if (needTokens.size === 0 || offerTokens.size === 0) return 0;

  const tokenOverlap = jaccardSimilarity(offerTokens, needTokens);
  return tokenOverlap;
}

export function combineListingScore(breakdown: {
  semanticScore: number;
  textScore: number;
  unitScore: number;
  quantityScore: number;
}): number {
  const { semantic, text, unit, quantity } = LISTING_SCORE_WEIGHTS;
  return (
    breakdown.semanticScore * semantic +
    breakdown.textScore * text +
    breakdown.unitScore * unit +
    breakdown.quantityScore * quantity
  );
}

export function scoreListingPair(
  offer: MatchListing,
  need: MatchListing,
  offerBusiness?: MatchBusiness,
  needBusiness?: MatchBusiness,
  unitScore = 1,
  embeddings?: ListingEmbeddingMap,
): {
  score: number;
  categoryScore: number;
  textScore: number;
  unitScore: number;
  quantityScore: number;
  usedEmbeddings: boolean;
} {
  const semantic = scoreSemanticMatch(offer, need, embeddings);
  const textScore = scoreTextContextMatch(offer, need, offerBusiness, needBusiness);
  const quantityScore = scoreQuantityFit(offer, need);
  const score = combineListingScore({
    semanticScore: semantic.score,
    textScore,
    unitScore,
    quantityScore,
  });

  return {
    score,
    categoryScore: semantic.score,
    textScore,
    unitScore,
    quantityScore,
    usedEmbeddings: semantic.usedEmbeddings,
  };
}
