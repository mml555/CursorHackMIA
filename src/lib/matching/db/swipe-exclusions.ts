import { createAdminClient } from "@/lib/supabase/server";

/**
 * Businesses to exclude from matching for a given member business:
 * - Explicit excludeBusinessIds from options
 * - Counterparties on proposals this business passed in the deck
 */
export async function getSwipeExcludedBusinessIds(
  businessId: string,
): Promise<string[]> {
  const supabase = createAdminClient();

  const { data: passes, error: passError } = await supabase
    .from("proposal_swipes")
    .select("proposal_id")
    .eq("business_id", businessId)
    .eq("action", "pass");

  if (passError) throw passError;
  if (!passes?.length) return [];

  const proposalIds = passes.map((row) => row.proposal_id);

  const { data: parties, error: partyError } = await supabase
    .from("proposal_parties")
    .select("business_id, proposal_id")
    .in("proposal_id", proposalIds);

  if (partyError) throw partyError;

  const excluded = new Set<string>();

  for (const party of parties ?? []) {
    if (party.business_id !== businessId) {
      excluded.add(party.business_id);
    }
  }

  return [...excluded];
}

/**
 * Counterparties on proposals this business marked Interested — used for a small match boost.
 */
export async function getInterestedPartnerBusinessIds(
  businessId: string,
): Promise<string[]> {
  const supabase = createAdminClient();

  const { data: interested, error: swipeError } = await supabase
    .from("proposal_swipes")
    .select("proposal_id")
    .eq("business_id", businessId)
    .eq("action", "interested");

  if (swipeError) throw swipeError;
  if (!interested?.length) return [];

  const proposalIds = interested.map((row) => row.proposal_id);

  const { data: parties, error: partyError } = await supabase
    .from("proposal_parties")
    .select("business_id")
    .in("proposal_id", proposalIds);

  if (partyError) throw partyError;

  const ids = new Set<string>();
  for (const party of parties ?? []) {
    if (party.business_id !== businessId) ids.add(party.business_id);
  }

  return [...ids];
}

export function mergeExcludedBusinessIds(
  ...lists: (string[] | undefined)[]
): string[] {
  const merged = new Set<string>();
  for (const list of lists) {
    for (const id of list ?? []) {
      merged.add(id);
    }
  }
  return [...merged];
}
