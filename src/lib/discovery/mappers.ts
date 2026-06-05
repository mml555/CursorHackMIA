import type {
  DirectTradeMatch,
  MatchParty,
  PartialMatch,
} from "@/lib/matching/types";
import { getBusinessMediaPublicUrl } from "@/lib/storage/business-media";
import { rawScoreToMatchPoints } from "@/lib/discovery/match-points";
import type {
  BusinessProfile,
  DiscoveryCard,
  DiscoveryListing,
  DiscoveryMatch,
  DiscoveryMember,
  DiscoveryPhoto,
} from "@/lib/discovery/types";

export function parsePhotos(value: unknown): DiscoveryPhoto[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter(
      (item): item is DiscoveryPhoto =>
        typeof item === "object" &&
        item !== null &&
        typeof (item as DiscoveryPhoto).storage_path === "string",
    )
    .sort((a, b) => a.sort_order - b.sort_order);
}

function parseListings(value: unknown): DiscoveryListing[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (item): item is DiscoveryListing =>
      typeof item === "object" &&
      item !== null &&
      typeof (item as DiscoveryListing).category === "string",
  );
}

function formatListingLine(listings: DiscoveryListing[]): string {
  if (listings.length === 0) return "—";
  const first = listings[0];
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

export function cardToProfile(card: DiscoveryCard): BusinessProfile {
  const member = cardToMember(card);

  return {
    id: card.business_id,
    name: card.company_name,
    legalName: card.legal_name,
    dba: card.dba,
    industry: card.industry,
    metro: card.metro,
    website: card.website,
    description: card.description,
    logoUrl: card.logo_storage_path
      ? getBusinessMediaPublicUrl(card.logo_storage_path)
      : null,
    photos: parsePhotos(card.photos).map((photo) => ({
      ...photo,
      public_url: getBusinessMediaPublicUrl(photo.storage_path),
    })),
    offering: parseListings(card.offering),
    lookingFor: parseListings(card.looking_for),
    trading: member.trading,
    looking: member.looking,
    score: member.score,
    trades: member.trades,
  };
}

export function cardToMember(card: DiscoveryCard): DiscoveryMember {
  const offering = parseListings(card.offering);
  const looking = parseListings(card.looking_for);

  return {
    id: card.business_id,
    name: card.company_name,
    industry: card.industry ?? "General",
    trading: formatListingLine(offering),
    looking: formatListingLine(looking),
    score: card.reputation_score ?? 0,
    trades: card.ratings_count ?? 0,
  };
}

export function cardsToMembers(cards: DiscoveryCard[]): DiscoveryMember[] {
  return cards.map(cardToMember);
}

function partnerParty(
  parties: MatchParty[],
  focalBusinessId: string,
): MatchParty | null {
  return parties.find((party) => party.businessId !== focalBusinessId) ?? null;
}

export function directMatchToDiscoveryMatch(
  match: DirectTradeMatch,
  focalBusinessId: string,
  cardsById: Map<string, DiscoveryCard>,
  index: number,
): DiscoveryMatch | null {
  const partner = partnerParty(match.parties, focalBusinessId);
  if (!partner) return null;

  const card = cardsById.get(partner.businessId);
  const member: DiscoveryMember = card
    ? cardToMember(card)
    : {
        id: partner.businessId,
        name: partner.businessName,
        industry: "General",
        trading: partner.giveCategory,
        looking: partner.receiveCategory,
        score: 0,
        trades: 0,
      };

  const fit = rawScoreToMatchPoints(match.score);

  return {
    member,
    points: fit.points,
    tier: fit.tier,
    tierLabel: fit.tierLabel,
    rank: index + 1,
    top: index === 0,
    reason: match.summary,
  };
}

export function partialMatchToDiscoveryMatch(
  match: PartialMatch,
  focalBusinessId: string,
  cardsById: Map<string, DiscoveryCard>,
  index: number,
): DiscoveryMatch | null {
  const partnerId =
    match.offerBusinessId === focalBusinessId
      ? match.needBusinessId
      : match.offerBusinessId;
  const card = cardsById.get(partnerId);
  const member: DiscoveryMember = card
    ? cardToMember(card)
    : {
        id: partnerId,
        name:
          match.offerBusinessId === focalBusinessId
            ? match.needBusinessName
            : match.offerBusinessName,
        industry: "General",
        trading:
          match.offerBusinessId === partnerId
            ? match.offerCategory
            : match.needCategory,
        looking:
          match.offerBusinessId === partnerId
            ? match.needCategory
            : match.offerCategory,
        score: 0,
        trades: 0,
      };

  const fit = rawScoreToMatchPoints(match.score);

  return {
    member,
    points: fit.points,
    tier: fit.tier,
    tierLabel: fit.tierLabel,
    rank: index + 1,
    top: index === 0,
    reason: match.summary,
  };
}

export function buildRecommendations(
  focalBusinessId: string,
  focalCard: DiscoveryCard | null,
  directMatches: DirectTradeMatch[],
  partialMatches: PartialMatch[],
  cards: DiscoveryCard[],
): {
  focalBusinessId: string;
  focalBusinessName: string;
  offering: string;
  looking: string;
  matches: DiscoveryMatch[];
} {
  const cardsById = new Map(cards.map((card) => [card.business_id, card]));
  const offering = focalCard
    ? formatListingLine(parseListings(focalCard.offering))
    : "—";
  const looking = focalCard
    ? formatListingLine(parseListings(focalCard.looking_for))
    : "—";

  const direct = directMatches
    .map((match, index) =>
      directMatchToDiscoveryMatch(match, focalBusinessId, cardsById, index),
    )
    .filter((match): match is DiscoveryMatch => match !== null);

  const partial = partialMatches
    .map((match, index) =>
      partialMatchToDiscoveryMatch(
        match,
        focalBusinessId,
        cardsById,
        direct.length + index,
      ),
    )
    .filter((match): match is DiscoveryMatch => match !== null);

  const seen = new Set<string>();
  const matches = [...direct, ...partial].filter((match) => {
    if (seen.has(match.member.id)) return false;
    seen.add(match.member.id);
    return true;
  });

  matches.forEach((match, index) => {
    match.rank = index + 1;
    match.top = index === 0;
  });

  return {
    focalBusinessId,
    focalBusinessName: focalCard?.company_name ?? "Your business",
    offering,
    looking,
    matches,
  };
}
