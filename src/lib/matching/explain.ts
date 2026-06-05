import type {
  DirectTradeMatch,
  MultiPartyTradeMatch,
  PartialMatch,
} from "@/lib/matching/types";

export function summarizeDirectMatch(match: DirectTradeMatch): string {
  const [a, b] = match.parties;
  let summary = `${a.businessName} trades ${a.giveCategory} for ${b.businessName}'s ${b.giveCategory}`;
  if (match.cashTopup) {
    summary += ` (${match.cashTopup.payerBusinessName} +$${match.cashTopup.amount} cash top-up)`;
  }
  return summary;
}

export function summarizeMultiPartyMatch(match: MultiPartyTradeMatch): string {
  const chain = match.parties
    .map((p) => `${p.businessName} gives ${p.giveCategory}`)
    .join(" → ");
  const suffix = match.cashTopup
    ? ` (+$${match.cashTopup.amount} cash top-up suggested)`
    : "";
  return `${match.cycleLength}-way trade: ${chain}${suffix}`;
}

export function summarizePartialMatch(match: PartialMatch): string {
  return `${match.offerBusinessName} could offer ${match.offerCategory} to ${match.needBusinessName} (needs ${match.needCategory}) — add a reciprocal listing to complete the trade`;
}

export function attachSummaries<T extends DirectTradeMatch | MultiPartyTradeMatch>(
  matches: T[],
): T[] {
  return matches.map((m) => ({
    ...m,
    summary:
      m.tradeType === "direct"
        ? summarizeDirectMatch(m as DirectTradeMatch)
        : summarizeMultiPartyMatch(m as MultiPartyTradeMatch),
  }));
}
