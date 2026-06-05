type PartyLike = { businessId: string };

type MatchWithParties = {
  score: number;
  parties: PartyLike[];
};

/**
 * Greedy diversity: cap how many results share the same counterparty
 * (relative to focalBusinessId when provided).
 */
export function applyDiversityCap<T extends MatchWithParties>(
  matches: T[],
  maxPerCounterparty: number,
  focalBusinessId?: string,
): T[] {
  if (maxPerCounterparty <= 0) return matches;

  const counterpartyCounts = new Map<string, number>();
  const result: T[] = [];

  const sorted = [...matches].sort((a, b) => b.score - a.score);

  for (const match of sorted) {
    const others = focalBusinessId
      ? match.parties.filter((p) => p.businessId !== focalBusinessId)
      : match.parties;

    const blocked = others.some((party) => {
      const count = counterpartyCounts.get(party.businessId) ?? 0;
      return count >= maxPerCounterparty;
    });

    if (blocked) continue;

    for (const party of others) {
      counterpartyCounts.set(
        party.businessId,
        (counterpartyCounts.get(party.businessId) ?? 0) + 1,
      );
    }

    result.push(match);
  }

  return result;
}
