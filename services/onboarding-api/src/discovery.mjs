import { createClient } from "@supabase/supabase-js";
import {
  buildSimpleRecommendations,
  cardToMember,
  cardsToMembers,
  normalizeCard,
} from "./discovery-mappers.mjs";

const DEMO_FOCAL_BUSINESS_SLUG = "sunrise-yoga-studio";

function createSupabase(url, serviceRoleKey) {
  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function listDiscoveryCards(supabase, options = {}) {
  const { data, error } = await supabase
    .from("business_discovery_cards")
    .select("*")
    .order("reputation_score", { ascending: false });

  if (error) throw error;

  let cards = (data ?? []).map((row) => normalizeCard(row));

  if (options.metro) {
    cards = cards.filter(
      (card) => card.metro?.toLowerCase() === options.metro.toLowerCase(),
    );
  }

  if (options.industry && options.industry !== "All") {
    cards = cards.filter((card) => card.industry === options.industry);
  }

  if (options.query?.trim()) {
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

async function getBusinessIdBySlug(supabase, slug) {
  const { data, error } = await supabase
    .from("businesses")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  return data?.id ?? null;
}

async function getSwipeExcludedBusinessIds(supabase, businessId) {
  const { data, error } = await supabase
    .from("business_discovery_swipes")
    .select("target_business_id")
    .eq("swiper_business_id", businessId);

  if (error) throw error;
  return (data ?? []).map((row) => row.target_business_id);
}

async function getApprovedBusinessForClerkUser(supabase, clerkUserId) {
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id")
    .eq("clerk_user_id", clerkUserId)
    .maybeSingle();

  if (profileError) throw profileError;
  if (!profile) return null;

  const { data: membership, error: memberError } = await supabase
    .from("business_members")
    .select("business_id")
    .eq("profile_id", profile.id)
    .maybeSingle();

  if (memberError) throw memberError;
  if (!membership) return null;

  const { data: business, error: businessError } = await supabase
    .from("businesses")
    .select("id, status")
    .eq("id", membership.business_id)
    .maybeSingle();

  if (businessError) throw businessError;
  if (!business || business.status !== "approved") return null;

  return business.id;
}

async function getRecommendationsForBusiness(supabase, focalBusinessId) {
  const cards = await listDiscoveryCards(supabase);
  const focalCard =
    cards.find((card) => card.business_id === focalBusinessId) ?? null;
  const swipeExcluded = await getSwipeExcludedBusinessIds(
    supabase,
    focalBusinessId,
  );

  const candidates = cards
    .filter((card) => card.business_id !== focalBusinessId)
    .filter((card) => !swipeExcluded.includes(card.business_id))
    .filter(
      (card) =>
        !focalCard?.metro ||
        card.metro?.toLowerCase() === focalCard.metro?.toLowerCase(),
    )
    .sort(
      (a, b) => (b.reputation_score ?? 0) - (a.reputation_score ?? 0),
    )
    .slice(0, 8);

  return buildSimpleRecommendations(focalCard, candidates);
}

async function getDemoRecommendations(supabase) {
  const focalBusinessId = await getBusinessIdBySlug(
    supabase,
    DEMO_FOCAL_BUSINESS_SLUG,
  );

  if (!focalBusinessId) {
    return {
      focalBusinessId: "",
      focalBusinessName: "Demo business",
      offering: "—",
      looking: "—",
      matches: [],
    };
  }

  return getRecommendationsForBusiness(supabase, focalBusinessId);
}

export function createDiscoveryService({ supabaseUrl, supabaseServiceRoleKey }) {
  const supabase = createSupabase(supabaseUrl, supabaseServiceRoleKey);

  function getSupabase() {
    return supabase;
  }

  return {
    async getNetwork({ metro, industry, query }) {
      const supabase = await getSupabase();
      const cards = await listDiscoveryCards(supabase, { metro, industry, query });
      return { members: cardsToMembers(cards) };
    },

    async getStats(metro) {
      const supabase = await getSupabase();
      const cards = await listDiscoveryCards(supabase, metro ? { metro } : {});
      const industries = [...new Set(cards.map((card) => card.industry))].sort();

      return {
        total: cards.length,
        metro: metro ?? cards[0]?.metro ?? null,
        industries,
      };
    },

    async getRecommendations(clerkUserId) {
      const supabase = await getSupabase();

      if (clerkUserId) {
        const businessId = await getApprovedBusinessForClerkUser(
          supabase,
          clerkUserId,
        );
        if (businessId) {
          return getRecommendationsForBusiness(supabase, businessId);
        }
      }

      return getDemoRecommendations(supabase);
    },

    async recordDemoInterest(targetBusinessId) {
      const supabase = await getSupabase();
      const focalBusinessId = await getBusinessIdBySlug(
        supabase,
        DEMO_FOCAL_BUSINESS_SLUG,
      );

      if (!focalBusinessId) {
        const error = new Error(
          "Demo business not found. Run npm run db:reset to seed data.",
        );
        error.status = 500;
        error.code = "DEMO_NOT_SEEDED";
        throw error;
      }

      if (targetBusinessId === focalBusinessId) {
        const error = new Error("Cannot express interest in your own business");
        error.status = 400;
        error.code = "VALIDATION_ERROR";
        throw error;
      }

      const { data: target, error: targetError } = await supabase
        .from("businesses")
        .select("id, status")
        .eq("id", targetBusinessId)
        .maybeSingle();

      if (targetError) throw targetError;
      if (!target || target.status !== "approved") {
        const error = new Error("Target business not found");
        error.status = 404;
        error.code = "NOT_FOUND";
        throw error;
      }

      const { data: swipe, error } = await supabase
        .from("business_discovery_swipes")
        .upsert(
          {
            swiper_business_id: focalBusinessId,
            target_business_id: targetBusinessId,
            action: "interested",
          },
          { onConflict: "swiper_business_id,target_business_id" },
        )
        .select("*")
        .single();

      if (error) throw error;
      return { swipe, demo: true };
    },

    async recordSwipe(clerkUserId, { targetBusinessId, action }) {
      const supabase = await getSupabase();
      const businessId = await getApprovedBusinessForClerkUser(
        supabase,
        clerkUserId,
      );

      if (!businessId) {
        const error = new Error("Approved business membership required");
        error.status = 403;
        error.code = "FORBIDDEN";
        throw error;
      }

      if (targetBusinessId === businessId) {
        const error = new Error("Cannot swipe on your own business");
        error.status = 400;
        error.code = "VALIDATION_ERROR";
        throw error;
      }

      const { data: swipe, error } = await supabase
        .from("business_discovery_swipes")
        .upsert(
          {
            swiper_business_id: businessId,
            target_business_id: targetBusinessId,
            action,
          },
          { onConflict: "swiper_business_id,target_business_id" },
        )
        .select("*")
        .single();

      if (error) throw error;
      return { swipe };
    },

    async listMatches(clerkUserId) {
      const supabase = await getSupabase();
      const businessId = await getApprovedBusinessForClerkUser(
        supabase,
        clerkUserId,
      );

      if (!businessId) {
        const error = new Error("Approved business membership required");
        error.status = 403;
        error.code = "FORBIDDEN";
        throw error;
      }

      const { data, error } = await supabase.rpc("get_business_matches", {
        p_viewer_business_id: businessId,
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

      return { members: cardsToMembers(cards) };
    },

    async checkSupabase() {
      const supabase = await getSupabase();
      const { error } = await supabase
        .from("business_discovery_cards")
        .select("business_id")
        .limit(1);

      if (error) throw error;
      return true;
    },
  };
}
