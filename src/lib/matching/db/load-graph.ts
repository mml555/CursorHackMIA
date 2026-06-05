import { createAdminClient } from "@/lib/supabase/server";
import type { MatchBusiness, MatchListing } from "@/lib/matching/types";

export type MatchGraph = {
  businesses: MatchBusiness[];
  listings: MatchListing[];
};

/**
 * Load all approved businesses + active listings for the matcher.
 * Optionally scope to the same metro as `focalBusinessId`.
 */
export async function loadMatchGraph(options?: {
  focalBusinessId?: string;
  approvedOnly?: boolean;
  sameMetroAsFocal?: boolean;
}): Promise<MatchGraph> {
  const supabase = createAdminClient();
  const approvedOnly = options?.approvedOnly ?? true;

  let metroFilter: string | null = null;
  if (options?.focalBusinessId && options?.sameMetroAsFocal !== false) {
    const { data: focal, error: focalError } = await supabase
      .from("businesses")
      .select("metro")
      .eq("id", options.focalBusinessId)
      .maybeSingle();

    if (focalError) throw focalError;
    metroFilter = focal?.metro ?? null;
  }

  let businessQuery = supabase
    .from("businesses")
    .select(
      "id, legal_name, metro, vertical, description, reputation_score, ratings_count, status",
    );

  if (approvedOnly) {
    businessQuery = businessQuery.eq("status", "approved");
  }

  if (metroFilter) {
    businessQuery = businessQuery.eq("metro", metroFilter);
  }

  const { data: businessRows, error: businessError } = await businessQuery;
  if (businessError) throw businessError;

  const businessIds = (businessRows ?? []).map((b) => b.id);
  if (businessIds.length === 0) {
    return { businesses: [], listings: [] };
  }

  const { data: listingRows, error: listingError } = await supabase
    .from("listings")
    .select(
      "id, business_id, listing_type, category, unit, quantity, fmv_estimate, notes, is_active",
    )
    .in("business_id", businessIds)
    .eq("is_active", true);

  if (listingError) throw listingError;

  const businesses: MatchBusiness[] = (businessRows ?? []).map((b) => ({
    id: b.id,
    legalName: b.legal_name,
    metro: b.metro,
    vertical: b.vertical,
    description: b.description,
    reputationScore: b.reputation_score,
    ratingsCount: b.ratings_count,
    status: b.status,
  }));

  const listings: MatchListing[] = (listingRows ?? []).map((l) => ({
    id: l.id,
    businessId: l.business_id,
    listingType: l.listing_type,
    category: l.category,
    unit: l.unit,
    quantity: Number(l.quantity),
    fmvEstimate: l.fmv_estimate != null ? Number(l.fmv_estimate) : null,
    notes: l.notes,
    isActive: l.is_active,
  }));

  return { businesses, listings };
}
