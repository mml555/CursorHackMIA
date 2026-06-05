export { findMatches, findMatchesForBusiness } from "@/lib/matching/run";
export { buildOfferNeedEdges, businessesWithInventory } from "@/lib/matching/build-edges";
export { scoreCategoryMatch } from "@/lib/matching/score-category";
export { scoreListingPair } from "@/lib/matching/score-listing";
export { scoreSemanticMatch } from "@/lib/matching/score-embedding";
export { scoreQuantityFit } from "@/lib/matching/score-quantity";
export { scoreUnitCompatibility } from "@/lib/matching/score-unit";
export { cosineSimilarity } from "@/lib/matching/embeddings/cosine";
export { runMatchingPipeline } from "@/lib/matching/db/run-pipeline";
export {
  getSwipeExcludedBusinessIds,
  getInterestedPartnerBusinessIds,
  mergeExcludedBusinessIds,
} from "@/lib/matching/db/swipe-exclusions";
export { scoreToConfidence } from "@/lib/matching/confidence";
export { applyDiversityCap } from "@/lib/matching/rank-diversity";
export { scoreBusinessAffinity } from "@/lib/matching/score-affinity";
export type {
  MatchInput,
  MatchResult,
  MatchOptions,
  MatchBusiness,
  MatchListing,
  MatchEmbeddingMap,
  MatchConfidence,
  DirectTradeMatch,
  MultiPartyTradeMatch,
  PartialMatch,
  MatchParty,
  OfferNeedEdge,
  CashTopupSuggestion,
  ListingMatchBreakdown,
} from "@/lib/matching/types";
export type { RunMatchingPipelineResult } from "@/lib/matching/db/run-pipeline";
