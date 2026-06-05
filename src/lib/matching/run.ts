import {
  buildOfferNeedEdges,
  businessesWithInventory,
  filterEligibleBusinesses,
} from "@/lib/matching/build-edges";
import { findDirectMatches } from "@/lib/matching/find-direct";
import { findMultiPartyMatches } from "@/lib/matching/find-cycles";
import { findPartialMatches } from "@/lib/matching/find-partial";
import {
  dedupeAgainstDirect,
  dedupeDirect,
  dedupeMultiParty,
  excludePartialCoveredByTrades,
  rankDirectMatches,
  rankMultiPartyMatches,
  rankPartialMatches,
} from "@/lib/matching/rank";
import { DEFAULT_MATCH_OPTIONS } from "@/lib/matching/config";
import { applyDiversityCap } from "@/lib/matching/rank-diversity";
import type { MatchInput, MatchResult } from "@/lib/matching/types";

/**
 * Main entry point — pure function, no DB or network.
 *
 * Returns ranked trade suggestions:
 * - **direct**: 2-party reciprocal trades
 * - **multi_party**: 3–4 party cycles
 * - **partial**: one-way near-misses (missing reciprocal listing)
 */
export function findMatches(input: MatchInput): MatchResult {
  const options = { ...DEFAULT_MATCH_OPTIONS, ...input.options };

  const eligible = filterEligibleBusinesses(input.businesses, options);
  const withInventory = businessesWithInventory(eligible, input.listings);

  if (withInventory.length < 2) {
    return { direct: [], multiParty: [], partial: [] };
  }

  const activeListings = input.listings.filter(
    (l) =>
      l.isActive !== false &&
      withInventory.some((b) => b.id === l.businessId),
  );

  const edges = buildOfferNeedEdges(
    withInventory,
    activeListings,
    options,
    input.embeddings,
  );

  const rawDirect = findDirectMatches(edges, withInventory, activeListings);
  const dedupedDirect = dedupeDirect(rawDirect);
  const direct = rankDirectMatches(dedupedDirect, options);

  let multiParty: ReturnType<typeof findMultiPartyMatches> = [];

  if (options.maxCycleLength >= 3 && withInventory.length >= 3) {
    const rawMulti = findMultiPartyMatches(
      edges,
      withInventory,
      activeListings,
      options.maxCycleLength,
      options.maxCyclesToEvaluate,
    );
    const dedupedMulti = dedupeMultiParty(rawMulti);
    const withoutDirectOverlap = dedupeAgainstDirect(direct, dedupedMulti);
    multiParty = rankMultiPartyMatches(withoutDirectOverlap, options);
  }

  let partial: ReturnType<typeof findPartialMatches> = [];

  if (options.includePartial) {
    const rawPartial = findPartialMatches(
      edges,
      withInventory,
      activeListings,
      {
        minPartialScore: options.minPartialScore,
        maxResults: options.maxResults,
      },
    );
    partial = rankPartialMatches(
      excludePartialCoveredByTrades(rawPartial, direct, multiParty),
      options,
    );
  }

  return { direct, multiParty, partial };
}

export function findMatchesForBusiness(
  businessId: string,
  input: MatchInput,
): MatchResult {
  const options = { ...DEFAULT_MATCH_OPTIONS, ...input.options };
  const all = findMatches(input);
  const maxPer = options.maxMatchesPerCounterparty;

  const direct = applyDiversityCap(
    all.direct.filter((m) =>
      m.parties.some((p) => p.businessId === businessId),
    ),
    maxPer,
    businessId,
  );

  const multiParty = applyDiversityCap(
    all.multiParty.filter((m) =>
      m.parties.some((p) => p.businessId === businessId),
    ),
    maxPer,
    businessId,
  );

  return {
    direct,
    multiParty,
    partial: all.partial.filter(
      (p) =>
        p.offerBusinessId === businessId || p.needBusinessId === businessId,
    ),
  };
}
