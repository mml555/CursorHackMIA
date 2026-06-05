import { findMatches, findMatchesForBusiness } from "@/lib/matching/run";
import type { MatchOptions, MatchResult } from "@/lib/matching/types";
import { ensureListingEmbeddings } from "@/lib/matching/db/embeddings-store";
import { loadMatchGraph } from "@/lib/matching/db/load-graph";
import { persistMatchResults } from "@/lib/matching/db/persist-proposals";
import {
  getInterestedPartnerBusinessIds,
  getSwipeExcludedBusinessIds,
  mergeExcludedBusinessIds,
} from "@/lib/matching/db/swipe-exclusions";
import type { EmbeddingProvider } from "@/lib/matching/embeddings/provider";

export type RunMatchingPipelineInput = {
  /** When set, applies pass/save exclusions for this business and can filter results */
  focalBusinessId?: string;
  createdByClerkId?: string | null;
  matchOptions?: MatchOptions;
  embeddingProvider?: EmbeddingProvider | null;
  persist?: boolean;
  publish?: boolean;
};

export type RunMatchingPipelineResult = {
  matches: MatchResult;
  embeddingsLoaded: number;
  persisted: { created: string[]; skipped: number } | null;
  excludedBusinessIds: string[];
};

export async function runMatchingPipeline(
  input: RunMatchingPipelineInput = {},
): Promise<RunMatchingPipelineResult> {
  const graph = await loadMatchGraph({
    focalBusinessId: input.focalBusinessId,
    sameMetroAsFocal: true,
  });

  const swipeExcluded = input.focalBusinessId
    ? await getSwipeExcludedBusinessIds(input.focalBusinessId)
    : [];

  const interestedBoost = input.focalBusinessId
    ? await getInterestedPartnerBusinessIds(input.focalBusinessId)
    : [];

  const excludeBusinessIds = mergeExcludedBusinessIds(
    input.matchOptions?.excludeBusinessIds,
    swipeExcluded,
  );

  const embeddings = await ensureListingEmbeddings(
    graph.businesses,
    graph.listings,
    input.embeddingProvider,
  );

  const matchInput = {
    businesses: graph.businesses,
    listings: graph.listings,
    embeddings,
    options: {
      ...input.matchOptions,
      excludeBusinessIds,
      interestedBoostBusinessIds: interestedBoost,
    },
  };

  const matches = input.focalBusinessId
    ? findMatchesForBusiness(input.focalBusinessId, matchInput)
    : findMatches(matchInput);

  let persisted: RunMatchingPipelineResult["persisted"] = null;

  if (input.persist) {
    persisted = await persistMatchResults(
      matches.direct,
      matches.multiParty,
      graph.listings,
      {
        createdByClerkId: input.createdByClerkId,
        publish: input.publish,
      },
    );
  }

  return {
    matches,
    embeddingsLoaded: embeddings.size,
    persisted,
    excludedBusinessIds: excludeBusinessIds,
  };
}
