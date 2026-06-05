import { rawScoreToMatchPoints } from "./match-points.mjs";

function parseListings(value) {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (item) =>
      typeof item === "object" &&
      item !== null &&
      typeof item.category === "string",
  );
}

function parsePhotos(value) {
  if (!Array.isArray(value)) return [];
  return value
    .filter(
      (item) =>
        typeof item === "object" &&
        item !== null &&
        typeof item.storage_path === "string",
    )
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
}

function getBusinessMediaPublicUrl(supabaseUrl, storagePath) {
  const encodedPath = storagePath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  return `${supabaseUrl}/storage/v1/object/public/business-media/${encodedPath}`;
}

function scoreCategoryFit(offerCategory, needCategory) {
  const offer = String(offerCategory ?? "").toLowerCase().trim();
  const need = String(needCategory ?? "").toLowerCase().trim();
  if (!offer || !need) return 0;

  if (offer === need) return 1;
  if (offer.includes(need) || need.includes(offer)) return 0.85;

  const tokenize = (value) =>
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

function bestListingFit(offers, needs) {
  let best = 0;
  for (const offer of offers) {
    for (const need of needs) {
      best = Math.max(best, scoreCategoryFit(offer.category, need.category));
    }
  }
  return best;
}

function scoreBusinessPair(focalCard, candidateCard) {
  const focalOffers = focalCard?.offering ?? [];
  const focalNeeds = focalCard?.looking_for ?? [];
  const candidateOffers = candidateCard.offering ?? [];
  const candidateNeeds = candidateCard.looking_for ?? [];

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

function summarizeMatch(focalCard, candidateCard, rawScore) {
  const forward = bestListingFit(
    focalCard?.offering ?? [],
    candidateCard.looking_for ?? [],
  );
  const reverse = bestListingFit(
    candidateCard.offering ?? [],
    focalCard?.looking_for ?? [],
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

function formatListingLine(listings) {
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

export function normalizeCard(row) {
  return {
    business_id: String(row.business_id),
    company_name: String(row.company_name ?? ""),
    legal_name: String(row.legal_name ?? ""),
    dba: row.dba != null ? String(row.dba) : null,
    industry: String(row.industry ?? "General"),
    metro: row.metro != null ? String(row.metro) : null,
    website: row.website != null ? String(row.website) : null,
    description: row.description != null ? String(row.description) : null,
    logo_storage_path:
      row.logo_storage_path != null ? String(row.logo_storage_path) : null,
    photos: parsePhotos(row.photos),
    reputation_score:
      row.reputation_score != null ? Number(row.reputation_score) : null,
    ratings_count: Number(row.ratings_count ?? 0),
    looking_for: parseListings(row.looking_for),
    offering: parseListings(row.offering),
    primary_looking_for:
      row.primary_looking_for != null ? String(row.primary_looking_for) : null,
  };
}

export function cardToMember(card) {
  return {
    id: card.business_id,
    name: card.company_name,
    industry: card.industry ?? "General",
    trading: formatListingLine(card.offering),
    looking: formatListingLine(card.looking_for),
    score: card.reputation_score ?? 0,
    trades: card.ratings_count ?? 0,
  };
}

export function cardsToMembers(cards) {
  return cards.map(cardToMember);
}

export function cardToProfile(card, supabaseUrl) {
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
      ? getBusinessMediaPublicUrl(supabaseUrl, card.logo_storage_path)
      : null,
    photos: parsePhotos(card.photos).map((photo) => ({
      ...photo,
      public_url: getBusinessMediaPublicUrl(supabaseUrl, photo.storage_path),
    })),
    offering: card.offering,
    lookingFor: card.looking_for,
    trading: member.trading,
    looking: member.looking,
    score: member.score,
    trades: member.trades,
  };
}

export function buildSimpleRecommendations(focalCard, candidateCards) {
  const offering = focalCard
    ? formatListingLine(focalCard.offering)
    : "—";
  const looking = focalCard
    ? formatListingLine(focalCard.looking_for)
    : "—";

  const ranked = candidateCards
    .map((card) => ({
      card,
      rawScore: scoreBusinessPair(focalCard, card),
    }))
    .sort((a, b) => b.rawScore - a.rawScore);

  const matches = ranked.map(({ card, rawScore }, index) => {
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
