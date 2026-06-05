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

  const matches = candidateCards.map((card, index) => ({
    member: cardToMember(card),
    pct: Math.max(45, Math.round((card.reputation_score ?? 0.5) * 100)),
    top: index === 0,
    reason: "Strong fit in your metro based on reputation and listings",
  }));

  return {
    focalBusinessId: focalCard?.business_id ?? "",
    focalBusinessName: focalCard?.company_name ?? "Your business",
    offering,
    looking,
    matches,
  };
}
