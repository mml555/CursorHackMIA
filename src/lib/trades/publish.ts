import { createAdminClient } from "@/lib/supabase/server";
import { TradeError } from "@/lib/trades/errors";
import { logTradeEvent, transitionProposalStatus } from "@/lib/trades/events";
import { assertTransition } from "@/lib/trades/state-machine";

export async function publishProposal(proposalId: string, clerkId: string) {
  const supabase = createAdminClient();

  const { data: proposal, error: loadError } = await supabase
    .from("trade_proposals")
    .select("*")
    .eq("id", proposalId)
    .maybeSingle();

  if (loadError) throw loadError;
  if (!proposal) {
    throw new TradeError("Proposal not found", 404, "NOT_FOUND");
  }

  if (proposal.status !== "draft") {
    throw new TradeError(
      `Only draft proposals can be published (current: ${proposal.status})`,
      409,
      "INVALID_STATUS",
    );
  }

  const { data: parties, error: partiesError } = await supabase
    .from("proposal_parties")
    .select("*")
    .eq("proposal_id", proposalId);

  if (partiesError) throw partiesError;
  if (!parties?.length || parties.length < 2) {
    throw new TradeError("Proposal must have at least two parties", 400);
  }

  const businessIds = parties.map((party) => party.business_id);
  const { data: businesses, error: businessesError } = await supabase
    .from("businesses")
    .select("id, status")
    .in("id", businessIds);

  if (businessesError) throw businessesError;

  const statusById = new Map(
    (businesses ?? []).map((business) => [business.id, business.status]),
  );

  const unapproved = parties.filter(
    (party) => statusById.get(party.business_id) !== "approved",
  );

  if (unapproved.length > 0) {
    throw new TradeError(
      "All participating businesses must be admin-approved before publishing",
      409,
      "UNAPPROVED_PARTIES",
    );
  }

  const snapshot = {
    title: proposal.title,
    summary: proposal.summary,
    tradeType: proposal.trade_type,
    cashTopupDisplay: proposal.cash_topup_display,
    versionId: proposal.version_id,
    parties: parties.map((party) => ({
      businessId: party.business_id,
      giveLines: party.give_lines,
      receiveLines: party.receive_lines,
      estimatedFmv: party.estimated_fmv,
    })),
    publishedAt: new Date().toISOString(),
  };

  assertTransition("draft", "published");
  const updated = await transitionProposalStatus(
    proposalId,
    "draft",
    "published",
    { clerkId },
    { action: "published", snapshot },
  );

  const { error: metaError } = await supabase
    .from("trade_proposals")
    .update({
      published_at: new Date().toISOString(),
      snapshot,
    })
    .eq("id", proposalId);

  if (metaError) throw metaError;

  await logTradeEvent({
    proposalId,
    fromStatus: "published",
    toStatus: "published",
    actorClerkId: clerkId,
    payload: { action: "snapshot_locked" },
  });

  return { proposal: { ...updated, snapshot, published_at: snapshot.publishedAt } };
}
