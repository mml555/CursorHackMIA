import { createAdminClient } from "@/lib/supabase/server";
import {
  assertProposalStatus,
  loadTrade,
  requireTradeParty,
} from "@/lib/trades/access";
import { TradeError } from "@/lib/trades/errors";
import { logTradeEvent, transitionProposalStatus } from "@/lib/trades/events";
import { generateInvoicesForTrade } from "@/lib/trades/invoices";
import { refreshBusinessReputation } from "@/lib/trades/reputation";
import {
  assertTransition,
  nextStatusAfterAllAccepted,
} from "@/lib/trades/state-machine";
import type { Json, ProposalStatus } from "@/lib/db/types";
import type {
  AcceptProposalInput,
  VendorRatingInput,
} from "@/lib/validation/schemas";

type Actor = {
  clerkId: string;
  businessId: string;
};

/** Trades in the member execution lifecycle (excludes deck-only, terminal, and cancelled). */
export const ACTIVE_TRADE_STATUSES: ProposalStatus[] = [
  "pending_acceptance",
  "matched",
  "confirmed",
  "in_progress",
  "completed",
  "disputed",
];

async function getInterestedBusinessIds(proposalId: string): Promise<Set<string>> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("proposal_swipes")
    .select("business_id")
    .eq("proposal_id", proposalId)
    .eq("action", "interested");

  if (error) throw error;
  return new Set((data ?? []).map((row) => row.business_id));
}

async function getAcceptedBusinessIds(proposalId: string): Promise<Set<string>> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("proposal_acceptances")
    .select("business_id")
    .eq("proposal_id", proposalId);

  if (error) throw error;
  return new Set((data ?? []).map((row) => row.business_id));
}

async function getPartyActionBusinessIds(
  proposalId: string,
  action: string,
  fromStatus?: ProposalStatus,
): Promise<Set<string>> {
  const supabase = createAdminClient();
  let query = supabase
    .from("trade_events")
    .select("actor_business_id, payload, from_status")
    .eq("proposal_id", proposalId)
    .not("actor_business_id", "is", null);

  if (fromStatus) {
    query = query.eq("from_status", fromStatus);
  }

  const { data, error } = await query;
  if (error) throw error;

  const ids = new Set<string>();
  for (const row of data ?? []) {
    const payload = row.payload as { action?: string } | null;
    if (payload?.action === action && row.actor_business_id) {
      ids.add(row.actor_business_id);
    }
  }
  return ids;
}

function allPartiesPresent(
  partyIds: string[],
  completedIds: Set<string>,
): boolean {
  return partyIds.every((id) => completedIds.has(id));
}

export async function maybeAdvanceToPendingAcceptance(
  proposalId: string,
): Promise<ProposalStatus | null> {
  const { proposal, partyBusinessIds } = await loadTrade(proposalId);
  if (proposal.status !== "published") return null;

  const interested = await getInterestedBusinessIds(proposalId);
  if (!allPartiesPresent(partyBusinessIds, interested)) return null;

  assertTransition("published", "pending_acceptance");
  await transitionProposalStatus(
    proposalId,
    "published",
    "pending_acceptance",
    {},
    { action: "all_parties_interested" },
  );
  return "pending_acceptance";
}

export async function acceptTrade(
  input: AcceptProposalInput,
  actor: Actor,
) {
  const { proposal, partyBusinessIds } = await requireTradeParty(
    input.proposalId,
    actor.businessId,
  );
  assertProposalStatus(proposal.status, ["pending_acceptance"]);

  const interested = await getInterestedBusinessIds(input.proposalId);
  if (!interested.has(actor.businessId)) {
    throw new TradeError(
      "Mark this proposal as interested before accepting the match",
      400,
      "NOT_INTERESTED",
    );
  }

  const supabase = createAdminClient();
  const { data: acceptance, error } = await supabase
    .from("proposal_acceptances")
    .upsert(
      {
        proposal_id: input.proposalId,
        business_id: actor.businessId,
        tax_acknowledged: input.taxAcknowledged,
      },
      { onConflict: "proposal_id,business_id" },
    )
    .select("*")
    .single();

  if (error) throw error;

  await logTradeEvent({
    proposalId: input.proposalId,
    fromStatus: "pending_acceptance",
    toStatus: "pending_acceptance",
    actorClerkId: actor.clerkId,
    actorBusinessId: actor.businessId,
    payload: { action: "accept", taxAcknowledged: true },
  });

  const accepted = await getAcceptedBusinessIds(input.proposalId);
  let status = proposal.status;

  if (allPartiesPresent(partyBusinessIds, accepted)) {
    const nextStatus = nextStatusAfterAllAccepted();
    assertTransition("pending_acceptance", nextStatus);
    await transitionProposalStatus(
      input.proposalId,
      "pending_acceptance",
      nextStatus,
      { clerkId: actor.clerkId, businessId: actor.businessId },
      { action: "all_parties_accepted" },
    );
    status = nextStatus;
  }

  return { acceptance, status };
}

export async function confirmTrade(proposalId: string, actor: Actor) {
  const { proposal, partyBusinessIds } = await requireTradeParty(
    proposalId,
    actor.businessId,
  );
  assertProposalStatus(proposal.status, ["matched"]);

  const confirmed = await getPartyActionBusinessIds(
    proposalId,
    "party_confirm",
    "matched",
  );

  if (confirmed.has(actor.businessId)) {
    return { status: proposal.status, alreadyConfirmed: true };
  }

  await logTradeEvent({
    proposalId,
    fromStatus: "matched",
    toStatus: "matched",
    actorClerkId: actor.clerkId,
    actorBusinessId: actor.businessId,
    payload: { action: "party_confirm" },
  });

  confirmed.add(actor.businessId);
  let status = proposal.status;

  if (allPartiesPresent(partyBusinessIds, confirmed)) {
    assertTransition("matched", "confirmed");
    await transitionProposalStatus(
      proposalId,
      "matched",
      "confirmed",
      { clerkId: actor.clerkId, businessId: actor.businessId },
      { action: "all_parties_confirmed" },
    );
    status = "confirmed";
  }

  return { status, alreadyConfirmed: false };
}

export async function startTrade(proposalId: string, actor: Actor) {
  const { proposal } = await requireTradeParty(proposalId, actor.businessId);
  assertProposalStatus(proposal.status, ["confirmed"]);

  assertTransition("confirmed", "in_progress");
  const updated = await transitionProposalStatus(
    proposalId,
    "confirmed",
    "in_progress",
    { clerkId: actor.clerkId, businessId: actor.businessId },
    { action: "work_started" },
  );

  return { proposal: updated };
}

export async function completeTrade(proposalId: string, actor: Actor) {
  const { proposal, parties, partyBusinessIds } = await requireTradeParty(
    proposalId,
    actor.businessId,
  );
  assertProposalStatus(proposal.status, ["in_progress"]);

  const completed = await getPartyActionBusinessIds(
    proposalId,
    "party_complete",
    "in_progress",
  );

  if (completed.has(actor.businessId)) {
    return { status: proposal.status, alreadyCompleted: true };
  }

  await logTradeEvent({
    proposalId,
    fromStatus: "in_progress",
    toStatus: "in_progress",
    actorClerkId: actor.clerkId,
    actorBusinessId: actor.businessId,
    payload: { action: "party_complete" },
  });

  completed.add(actor.businessId);
  let status = proposal.status;

  if (allPartiesPresent(partyBusinessIds, completed)) {
    assertTransition("in_progress", "completed");
    const updated = await transitionProposalStatus(
      proposalId,
      "in_progress",
      "completed",
      { clerkId: actor.clerkId, businessId: actor.businessId },
      { action: "all_parties_completed" },
    );
    await generateInvoicesForTrade(updated, parties);
    status = "completed";
  }

  return { status, alreadyCompleted: false };
}

export async function disputeTrade(
  proposalId: string,
  actor: Actor,
  reason?: string,
) {
  const { proposal } = await requireTradeParty(proposalId, actor.businessId);
  assertProposalStatus(proposal.status, ["matched", "confirmed", "in_progress"]);

  assertTransition(proposal.status, "disputed");
  const updated = await transitionProposalStatus(
    proposalId,
    proposal.status,
    "disputed",
    { clerkId: actor.clerkId, businessId: actor.businessId },
    { action: "dispute_opened", reason: reason ?? null },
  );

  return { proposal: updated };
}

export async function rateVendor(input: VendorRatingInput, actor: Actor) {
  const { proposal, partyBusinessIds } = await requireTradeParty(
    input.tradeId,
    actor.businessId,
  );
  assertProposalStatus(proposal.status, ["completed", "rated"]);

  if (input.ratedBusinessId === actor.businessId) {
    throw new TradeError("Cannot rate your own business", 400, "SELF_RATING");
  }

  if (!partyBusinessIds.includes(input.ratedBusinessId)) {
    throw new TradeError("Can only rate other trade participants", 403, "FORBIDDEN");
  }

  const supabase = createAdminClient();
  const { data: rating, error } = await supabase
    .from("vendor_ratings")
    .upsert(
      {
        trade_id: input.tradeId,
        rater_business_id: actor.businessId,
        rated_business_id: input.ratedBusinessId,
        score: input.score,
        tags: input.tags ?? [],
        comment: input.comment ?? null,
      },
      { onConflict: "trade_id,rater_business_id,rated_business_id" },
    )
    .select("*")
    .single();

  if (error) throw error;

  await refreshBusinessReputation(input.ratedBusinessId);

  await logTradeEvent({
    proposalId: input.tradeId,
    fromStatus: proposal.status,
    toStatus: proposal.status,
    actorClerkId: actor.clerkId,
    actorBusinessId: actor.businessId,
    payload: {
      action: "rate_vendor",
      ratedBusinessId: input.ratedBusinessId,
      score: input.score,
    },
  });

  const partyCount = partyBusinessIds.length;
  const expectedRatings = partyCount * (partyCount - 1);

  const { count, error: countError } = await supabase
    .from("vendor_ratings")
    .select("id", { count: "exact", head: true })
    .eq("trade_id", input.tradeId);

  if (countError) throw countError;

  let status = proposal.status;
  if ((count ?? 0) >= expectedRatings && proposal.status === "completed") {
    assertTransition("completed", "rated");
    await transitionProposalStatus(
      input.tradeId,
      "completed",
      "rated",
      { clerkId: actor.clerkId, businessId: actor.businessId },
      { action: "all_ratings_submitted" },
    );
    status = "rated";
  }

  return { rating, status };
}

export async function listActiveTradesForBusiness(
  businessId: string,
  statusFilter?: ProposalStatus,
) {
  const supabase = createAdminClient();

  const { data: partyRows, error: partyError } = await supabase
    .from("proposal_parties")
    .select("proposal_id")
    .eq("business_id", businessId);

  if (partyError) throw partyError;

  const proposalIds = (partyRows ?? []).map((row) => row.proposal_id);
  if (proposalIds.length === 0) {
    return [];
  }

  const statuses = statusFilter
    ? ACTIVE_TRADE_STATUSES.includes(statusFilter)
      ? [statusFilter]
      : []
    : ACTIVE_TRADE_STATUSES;

  if (statuses.length === 0) {
    return [];
  }

  const { data: proposals, error: proposalsError } = await supabase
    .from("trade_proposals")
    .select("*")
    .in("id", proposalIds)
    .in("status", statuses)
    .order("updated_at", { ascending: false });

  if (proposalsError) throw proposalsError;
  if (!proposals?.length) {
    return [];
  }

  const activeIds = proposals.map((proposal) => proposal.id);

  const { data: allParties, error: partiesError } = await supabase
    .from("proposal_parties")
    .select("*")
    .in("proposal_id", activeIds);

  if (partiesError) throw partiesError;

  const counterpartyIds = [
    ...new Set(
      (allParties ?? [])
        .map((party) => party.business_id)
        .filter((id) => id !== businessId),
    ),
  ];

  const { data: businesses, error: businessesError } = counterpartyIds.length
    ? await supabase
        .from("businesses")
        .select("id, legal_name, dba, reputation_score, ratings_count")
        .in("id", counterpartyIds)
    : { data: [], error: null };

  if (businessesError) throw businessesError;

  const businessById = new Map(
    (businesses ?? []).map((business) => [business.id, business]),
  );

  const partiesByProposal = new Map<string, typeof allParties>();
  for (const party of allParties ?? []) {
    const list = partiesByProposal.get(party.proposal_id) ?? [];
    list.push(party);
    partiesByProposal.set(party.proposal_id, list);
  }

  return proposals.map((proposal) => {
    const parties = partiesByProposal.get(proposal.id) ?? [];
    const counterparties = parties
      .filter((party) => party.business_id !== businessId)
      .map((party) => ({
        businessId: party.business_id,
        business: businessById.get(party.business_id) ?? null,
        estimatedFmv: party.estimated_fmv,
      }));

    return {
      proposal,
      counterparties,
      partyCount: parties.length,
    };
  });
}

export async function getTradeDetail(proposalId: string, businessId: string) {
  const context = await requireTradeParty(proposalId, businessId);
  const supabase = createAdminClient();

  const partyBusinessIds = context.partyBusinessIds;

  const [
    { data: events },
    { data: acceptances },
    { data: swipes },
    { data: ratings },
    { data: invoices },
    { data: businesses },
  ] = await Promise.all([
    supabase
      .from("trade_events")
      .select("*")
      .eq("proposal_id", proposalId)
      .order("created_at", { ascending: true }),
    supabase
      .from("proposal_acceptances")
      .select("*")
      .eq("proposal_id", proposalId),
    supabase
      .from("proposal_swipes")
      .select("*")
      .eq("proposal_id", proposalId),
    supabase
      .from("vendor_ratings")
      .select("*")
      .eq("trade_id", proposalId),
    supabase
      .from("invoices")
      .select("*")
      .eq("trade_id", proposalId),
    supabase
      .from("businesses")
      .select("id, legal_name, dba, reputation_score, ratings_count")
      .in("id", partyBusinessIds),
  ]);

  const businessById = new Map((businesses ?? []).map((business) => [business.id, business]));
  const parties = context.parties.map((party) => ({
    ...party,
    business: businessById.get(party.business_id) ?? null,
  }));

  return {
    proposal: context.proposal,
    parties,
    events: events ?? [],
    acceptances: acceptances ?? [],
    swipes: swipes ?? [],
    ratings: ratings ?? [],
    invoices: invoices ?? [],
  };
}

export async function resolveDispute(
  proposalId: string,
  targetStatus: Extract<ProposalStatus, "confirmed" | "in_progress" | "cancelled">,
  clerkId: string,
  resolutionNote?: string,
) {
  const { proposal } = await loadTrade(proposalId);
  assertProposalStatus(proposal.status, ["disputed"]);

  assertTransition("disputed", targetStatus);
  const updated = await transitionProposalStatus(
    proposalId,
    "disputed",
    targetStatus,
    { clerkId },
    {
      action: "dispute_resolved",
      resolutionNote: resolutionNote ?? null,
      targetStatus,
    } satisfies Json,
  );

  return { proposal: updated };
}
