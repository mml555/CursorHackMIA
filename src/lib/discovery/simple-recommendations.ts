import { rawScoreToMatchPoints } from "@/lib/discovery/match-points";
import { cardToMember } from "@/lib/discovery/mappers";
import type { DiscoveryCard, DiscoveryMatch } from "@/lib/discovery/types";

function parseListings(
  listings:
    | DiscoveryCard["offering"]
    | DiscoveryCard["looking_for"]
    | undefined,
): DiscoveryCard["offering"] {
  return Array.isArray(listings) ? listings : [];
}

function formatListingLine(
  listings: DiscoveryCard["offering"] | DiscoveryCard["looking_for"],
): string {
  const parsed = parseListings(listings);
  if (parsed.length === 0) return "—";
  const first = parsed[0];
  if (first.notes?.trim()) return first.notes.trim();
  if (first.unit === "sessions" && first.quantity > 0) {
    return `${first.category}, ${first.quantity}x/month`;
  }
  if (first.unit === "months" && first.quantity > 0) {
    return `${first.category}, ${first.quantity} months`;
  }
  if (first.unit === "hours" && first.quantity > 0) {
    return `${first.category}, ${first.quantity} hours`;
  }
  return first.category;
}

function scoreCategoryFit(offerCategory: string, needCategory: string): number {
  const offer = String(offerCategory ?? "").toLowerCase().trim();
  const need = String(needCategory ?? "").toLowerCase().trim();
  if (!offer || !need) return 0;

  if (offer === need) return 1;
  if (offer.includes(need) || need.includes(offer)) return 0.85;

  const tokenize = (value: string) =>
    new Set(
      value
        .split(/[^a-z0-9]+/)
        .filter((token) => token.length > 2),
    );

  const offerTokens = tokenize(offer);
  const needTokens = tokenize(need);
  if (offerTokens.size === 0 || needTokens.size === 0) return 0.35;

  let overlap = 0;
  for (const token of offerTokens) {
    if (needTokens.has(token)) overlap += 1;
  }

  const union = new Set([...offerTokens, ...needTokens]).size;
  return Math.min(0.75, 0.35 + (overlap / union) * 0.4);
}

function bestListingFit(
  offers: DiscoveryCard["offering"],
  needs: DiscoveryCard["looking_for"],
): number {
  let best = 0;
  for (const offer of offers) {
    for (const need of needs) {
      best = Math.max(best, scoreCategoryFit(offer.category, need.category));
    }
  }
  return best;
}

function scoreBusinessPair(
  focalCard: DiscoveryCard | null,
  candidateCard: DiscoveryCard,
): number {
  const focalOffers = parseListings(focalCard?.offering);
  const focalNeeds = parseListings(focalCard?.looking_for);
  const candidateOffers = parseListings(candidateCard.offering);
  const candidateNeeds = parseListings(candidateCard.looking_for);

  const forward = bestListingFit(focalOffers, candidateNeeds);
  const reverse = bestListingFit(candidateOffers, focalNeeds);

  if (forward <= 0 && reverse <= 0) return 0.45;
  if (forward <= 0 || reverse <= 0) {
    return Math.max(forward, reverse) * 0.65;
  }

  const reputation =
    candidateCard.reputation_score != null
      ? Math.min(1, candidateCard.reputation_score / 5)
      : 0.5;

  const listingScore = Math.sqrt(forward * reverse);
  return Math.min(1, listingScore * 0.85 + reputation * 0.15);
}

function summarizeMatch(
  focalCard: DiscoveryCard | null,
  candidateCard: DiscoveryCard,
  rawScore: number,
): string {
  const forward = bestListingFit(
    parseListings(focalCard?.offering),
    parseListings(candidateCard.looking_for),
  );
  const reverse = bestListingFit(
    parseListings(candidateCard.offering),
    parseListings(focalCard?.looking_for),
  );

  if (forward > 0 && reverse > 0) {
    return "Two-way service fit across your offers and their needs.";
  }
  if (forward > reverse) {
    return "Your offering aligns with what they need; confirm reciprocal value.";
  }
  if (reverse > 0) {
    return "They offer what you need; add or refine your reciprocal listing.";
  }
  if (rawScore >= 0.7) {
    return "Strong overlap in your metro based on listings and reputation.";
  }
  return "Partial overlap worth exploring with a concrete proposal.";
}

export function buildSimpleRecommendations(
  focalCard: DiscoveryCard | null,
  candidateCards: DiscoveryCard[],
): {
  focalBusinessId: string;
  focalBusinessName: string;
  offering: string;
  looking: string;
  matches: DiscoveryMatch[];
} {
  const offering = focalCard ? formatListingLine(focalCard.offering) : "—";
  const looking = focalCard ? formatListingLine(focalCard.looking_for) : "—";

  const ranked = candidateCards
    .map((card) => ({
      card,
      rawScore: scoreBusinessPair(focalCard, card),
    }))
    .sort((a, b) => b.rawScore - a.rawScore);

  const matches: DiscoveryMatch[] = ranked.map(({ card, rawScore }, index) => {
    const fit = rawScoreToMatchPoints(rawScore);
    return {
      member: cardToMember(card),
      points: fit.points,
      tier: fit.tier,
      tierLabel: fit.tierLabel,
      rank: index + 1,
      top: index === 0,
      reason: summarizeMatch(focalCard, card, rawScore),
    };
  });

  return {
    focalBusinessId: focalCard?.business_id ?? "",
    focalBusinessName: focalCard?.company_name ?? "Your business",
    offering,
    looking,
    matches,
  };
}
