import { createAdminClient } from "@/lib/supabase/server";
import type { ProposalParty, ProposalStatus, TradeProposal } from "@/lib/db/types";
import { TradeError } from "@/lib/trades/errors";

export type TradeContext = {
  proposal: TradeProposal;
  parties: ProposalParty[];
  partyBusinessIds: string[];
};

export async function loadTrade(proposalId: string): Promise<TradeContext> {
  const supabase = createAdminClient();

  const { data: proposal, error } = await supabase
    .from("trade_proposals")
    .select("*")
    .eq("id", proposalId)
    .maybeSingle();

  if (error) throw error;
  if (!proposal) {
    throw new TradeError("Trade not found", 404, "NOT_FOUND");
  }

  const { data: parties, error: partiesError } = await supabase
    .from("proposal_parties")
    .select("*")
    .eq("proposal_id", proposalId);

  if (partiesError) throw partiesError;

  return {
    proposal,
    parties: parties ?? [],
    partyBusinessIds: (parties ?? []).map((party) => party.business_id),
  };
}

export async function requireTradeParty(
  proposalId: string,
  businessId: string,
): Promise<TradeContext> {
  const context = await loadTrade(proposalId);
  if (!context.partyBusinessIds.includes(businessId)) {
    throw new TradeError("Not a participant in this trade", 403, "FORBIDDEN");
  }
  return context;
}

export function assertProposalStatus(
  status: ProposalStatus,
  allowed: ProposalStatus[],
): void {
  if (!allowed.includes(status)) {
    throw new TradeError(
      `Trade must be in ${allowed.join(" or ")} status (current: ${status})`,
      409,
      "INVALID_STATUS",
    );
  }
}
