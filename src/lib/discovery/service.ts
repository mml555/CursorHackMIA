import { createAdminClient } from "@/lib/supabase/server";
import { findMatchesForBusiness } from "@/lib/matching/run";
import { ensureListingEmbeddings } from "@/lib/matching/db/embeddings-store";
import { loadMatchGraph } from "@/lib/matching/db/load-graph";
import {
  buildRecommendations,
  cardToMember,
  cardsToMembers,
} from "@/lib/discovery/mappers";
import { DEMO_FOCAL_BUSINESS_SLUG } from "@/lib/discovery/constants";
import type {
  DiscoveryCard,
  DiscoveryMember,
  DiscoveryStats,
} from "@/lib/discovery/types";

function normalizeCard(row: Record<string, unknown>): DiscoveryCard {
  return {
    business_id: String(row.business_id),
    company_name: String(row.company_name ?? ""),
    legal_name: String(row.legal_name ?? ""),
    dba: row.dba != null ? String(row.dba) : null,
    industry: String(row.industry ?? "General"),
    metro: row.metro != null ? String(row.metro) : null,
    website: row.website != null ? String(row.website) : null,
    description: row.description != null ? String(row.description) : null,
    reputation_score:
      row.reputation_score != null ? Number(row.reputation_score) : null,
    ratings_count: Number(row.ratings_count ?? 0),
    looking_for: Array.isArray(row.looking_for)
      ? (row.looking_for as DiscoveryCard["looking_for"])
      : [],
    offering: Array.isArray(row.offering)
      ? (row.offering as DiscoveryCard["offering"])
      : [],
    primary_looking_for:
      row.primary_looking_for != null ? String(row.primary_looking_for) : null,
  };
}

export async function listDiscoveryCards(options?: {
  metro?: string;
  industry?: string;
  query?: string;
}): Promise<DiscoveryCard[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("business_discovery_cards")
    .select("*")
    .order("reputation_score", { ascending: false });

  if (error) throw error;

  let cards = (data ?? []).map((row) =>
    normalizeCard(row as Record<string, unknown>),
  );

  if (options?.metro) {
    cards = cards.filter(
      (card) => card.metro?.toLowerCase() === options.metro!.toLowerCase(),
    );
  }

  if (options?.industry && options.industry !== "All") {
    cards = cards.filter((card) => card.industry === options.industry);
  }

  if (options?.query?.trim()) {
    const q = options.query.trim().toLowerCase();
    cards = cards.filter(
      (card) =>
        card.company_name.toLowerCase().includes(q) ||
        card.industry.toLowerCase().includes(q) ||
        cardToMember(card).trading.toLowerCase().includes(q) ||
        cardToMember(card).looking.toLowerCase().includes(q),
    );
  }

  return cards;
}

export async function getDiscoveryStats(metro?: string): Promise<DiscoveryStats> {
  const cards = await listDiscoveryCards(metro ? { metro } : undefined);
  const industries = [...new Set(cards.map((card) => card.industry))].sort();

  return {
    total: cards.length,
    metro: metro ?? cards[0]?.metro ?? null,
    industries,
  };
}

export async function getBusinessIdBySlug(slug: string): Promise<string | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("businesses")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  return data?.id ?? null;
}

async function getDiscoverySwipeExcludedBusinessIds(
  businessId: string,
): Promise<string[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("business_discovery_swipes")
    .select("target_business_id")
    .eq("swiper_business_id", businessId);

  if (error) throw error;
  return (data ?? []).map((row) => row.target_business_id);
}

export async function getDiscoveryRecommendations(focalBusinessId: string) {
  const graph = await loadMatchGraph({
    focalBusinessId,
    sameMetroAsFocal: true,
  });

  const swipeExcluded = await getDiscoverySwipeExcludedBusinessIds(
    focalBusinessId,
  );

  const embeddings = await ensureListingEmbeddings(
    graph.businesses,
    graph.listings,
    null,
  );

  const matches = findMatchesForBusiness(focalBusinessId, {
    businesses: graph.businesses,
    listings: graph.listings,
    embeddings,
    options: {
      minCombinedScore: 0.45,
      maxResults: 8,
      maxMatchesPerCounterparty: 1,
      excludeBusinessIds: swipeExcluded,
    },
  });

  const cards = await listDiscoveryCards();
  const focalCard =
    cards.find((card) => card.business_id === focalBusinessId) ?? null;

  return buildRecommendations(
    focalBusinessId,
    focalCard,
    matches.direct,
    matches.partial,
    cards,
  );
}

export async function getDemoRecommendations() {
  const focalBusinessId = await getBusinessIdBySlug(DEMO_FOCAL_BUSINESS_SLUG);
  if (!focalBusinessId) {
    return {
      focalBusinessId: "",
      focalBusinessName: "Demo business",
      offering: "—",
      looking: "—",
      matches: [],
    };
  }

  return getDiscoveryRecommendations(focalBusinessId);
}

export async function listMutualMatches(
  viewerBusinessId: string,
): Promise<DiscoveryMember[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc("get_business_matches", {
    p_viewer_business_id: viewerBusinessId,
  });

  if (error) throw error;

  const cards = (data ?? []).map((row) =>
    normalizeCard({
      business_id: row.partner_business_id,
      company_name: row.company_name,
      legal_name: row.legal_name,
      dba: row.dba,
      industry: row.industry,
      metro: row.metro,
      website: row.website,
      description: row.description,
      reputation_score: row.reputation_score,
      ratings_count: row.ratings_count,
      looking_for: row.looking_for,
      offering: row.offering,
      primary_looking_for: row.primary_looking_for,
    }),
  );

  return cardsToMembers(cards);
}
