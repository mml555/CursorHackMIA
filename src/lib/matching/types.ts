export type MatchListing = {
  id: string;
  businessId: string;
  listingType: "offer" | "need";
  category: string;
  unit: string;
  quantity: number;
  fmvEstimate: number | null;
  notes: string | null;
  isActive?: boolean;
};

export type MatchBusiness = {
  id: string;
  legalName: string;
  metro: string | null;
  vertical: string | null;
  description?: string | null;
  reputationScore: number | null;
  ratingsCount: number;
  status?: "pending" | "approved" | "rejected" | "suspended";
};

export type MatchConfidence = "high" | "medium" | "low";

export type OfferNeedEdge = {
  offerId: string;
  offerBusinessId: string;
  needId: string;
  needBusinessId: string;
  /** Combined listing fit (semantic + text + unit + quantity). Used for ranking. */
  matchScore: number;
  /** Semantic score (embedding cosine or category fallback) */
  categoryScore: number;
  textScore: number;
  unitScore: number;
  quantityScore: number;
  affinityScore: number;
  usedEmbeddings: boolean;
  offerFmv: number | null;
  needFmv: number | null;
};

export type CashTopupSuggestion = {
  payerBusinessId: string;
  payerBusinessName: string;
  amount: number;
  /** FMV the payer gives vs receives */
  givesFmv: number;
  receivesFmv: number;
};

export type MatchParty = {
  businessId: string;
  businessName: string;
  giveListingId: string;
  giveCategory: string;
  receiveListingId: string;
  receiveCategory: string;
  estimatedFmv: number | null;
};

export type MatchReasonBase = {
  categoryScore: number;
  textScore: number;
  unitScore: number;
  quantityScore: number;
  affinityScore: number;
  usedEmbeddings: boolean;
  fmvBalanceScore: number;
  reputationScore: number;
};

export type DirectTradeMatch = {
  tradeType: "direct";
  score: number;
  confidence: MatchConfidence;
  summary: string;
  parties: [MatchParty, MatchParty];
  cashTopup: CashTopupSuggestion | null;
  reason: MatchReasonBase & {
    forwardMatchScore: number;
    reverseMatchScore: number;
  };
};

export type MultiPartyTradeMatch = {
  tradeType: "multi_party";
  score: number;
  confidence: MatchConfidence;
  summary: string;
  cycleLength: number;
  parties: MatchParty[];
  cashTopup: CashTopupSuggestion | null;
  reason: MatchReasonBase & {
    minEdgeScore: number;
    avgEdgeScore: number;
    edgeScores: number[];
  };
};

/** One-way fit: A offers what B needs, but B has no reciprocal offer for A */
export type PartialMatch = {
  tradeType: "partial";
  score: number;
  summary: string;
  offerBusinessId: string;
  offerBusinessName: string;
  needBusinessId: string;
  needBusinessName: string;
  offerListingId: string;
  needListingId: string;
  offerCategory: string;
  needCategory: string;
  reason: {
    matchScore: number;
    categoryScore: number;
    textScore: number;
    missingReciprocal: true;
  };
};

export type MatchResult = {
  direct: DirectTradeMatch[];
  multiParty: MultiPartyTradeMatch[];
  /** High-scoring one-way fits — useful for nudging users to add listings */
  partial: PartialMatch[];
};

export type MatchOptions = {
  minCategoryScore?: number;
  /** Minimum combined listing match score per edge. Default 0.45 */
  minMatchScore?: number;
  minCombinedScore?: number;
  maxCycleLength?: number;
  sameMetroOnly?: boolean;
  sameVerticalOnly?: boolean;
  maxResults?: number;
  approvedOnly?: boolean;
  /** Business IDs to skip (e.g. already passed in deck) */
  excludeBusinessIds?: string[];
  /** Max cycles to enumerate (performance guard). Default 500 */
  maxCyclesToEvaluate?: number;
  /** Include one-way near matches. Default true */
  includePartial?: boolean;
  /** Min score for partial matches. Default 0.65 */
  minPartialScore?: number;
  /** Top semantic neighbors per offer when embeddings present. Default 12 */
  topKEmbeddingCandidates?: number;
  /** Max results per counterparty business (deck diversity). Default 3 */
  maxMatchesPerCounterparty?: number;
  /** Boost same-vertical pairings. Default true */
  preferSameVertical?: boolean;
  /** Businesses the focal user already swiped interested on — small score boost */
  interestedBoostBusinessIds?: string[];
};

/** listing_id → embedding vector (pgvector / OpenAI) */
export type MatchEmbeddingMap = Map<string, number[]>;

export type MatchInput = {
  businesses: MatchBusiness[];
  listings: MatchListing[];
  embeddings?: MatchEmbeddingMap;
  options?: MatchOptions;
};

export type ListingMatchBreakdown = {
  score: number;
  categoryScore: number;
  textScore: number;
  unitScore: number;
  quantityScore: number;
  usedEmbeddings: boolean;
};
