import { DEFAULT_MATCH_OPTIONS } from "@/lib/matching/config";
import { directMatchFingerprint } from "@/lib/matching/find-direct";
import { multiPartyFingerprint } from "@/lib/matching/find-cycles";
import type {
  DirectTradeMatch,
  MatchOptions,
  MultiPartyTradeMatch,
  PartialMatch,
} from "@/lib/matching/types";

function resolveOptions(options?: MatchOptions) {
  return { ...DEFAULT_MATCH_OPTIONS, ...options };
}

export function rankDirectMatches(
  matches: DirectTradeMatch[],
  options?: MatchOptions,
): DirectTradeMatch[] {
  const opts = resolveOptions(options);
  return [...matches]
    .filter((m) => m.score >= opts.minCombinedScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, opts.maxResults);
}

export function rankMultiPartyMatches(
  matches: MultiPartyTradeMatch[],
  options?: MatchOptions,
): MultiPartyTradeMatch[] {
  const opts = resolveOptions(options);
  return [...matches]
    .filter((m) => m.score >= opts.minCombinedScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, opts.maxResults);
}

export function rankPartialMatches(
  matches: PartialMatch[],
  options?: MatchOptions,
): PartialMatch[] {
  const opts = resolveOptions(options);
  return [...matches]
    .filter((m) => m.score >= opts.minPartialScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, opts.maxResults);
}

export function dedupeAgainstDirect(
  direct: DirectTradeMatch[],
  multiParty: MultiPartyTradeMatch[],
): MultiPartyTradeMatch[] {
  if (direct.length === 0) return multiParty;

  const directPairs = new Set<string>();
  for (const match of direct) {
    const ids = match.parties.map((p) => p.businessId).sort().join("|");
    directPairs.add(ids);
  }

  return multiParty.filter((match) => {
    if (match.cycleLength === 2) {
      const ids = match.parties.map((p) => p.businessId).sort().join("|");
      if (directPairs.has(ids)) return false;
    }
    return true;
  });
}

export function dedupeDirect(matches: DirectTradeMatch[]): DirectTradeMatch[] {
  const seen = new Set<string>();
  const result: DirectTradeMatch[] = [];

  for (const match of matches) {
    const key = directMatchFingerprint(match);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(match);
  }

  return result;
}

export function dedupeMultiParty(
  matches: MultiPartyTradeMatch[],
): MultiPartyTradeMatch[] {
  const seen = new Set<string>();
  const result: MultiPartyTradeMatch[] = [];

  for (const match of matches) {
    const key = multiPartyFingerprint(match);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(match);
  }

  return result;
}

export function excludePartialCoveredByTrades(
  partial: PartialMatch[],
  direct: DirectTradeMatch[],
  multiParty: MultiPartyTradeMatch[],
): PartialMatch[] {
  const coveredPairs = new Set<string>();

  for (const match of direct) {
    const [a, b] = match.parties;
    coveredPairs.add(`${a.businessId}|${b.businessId}`);
    coveredPairs.add(`${b.businessId}|${a.businessId}`);
  }

  for (const match of multiParty) {
    for (const party of match.parties) {
      for (const other of match.parties) {
        if (party.businessId === other.businessId) continue;
        coveredPairs.add(`${party.businessId}|${other.businessId}`);
      }
    }
  }

  return partial.filter(
    (p) => !coveredPairs.has(`${p.offerBusinessId}|${p.needBusinessId}`),
  );
}
