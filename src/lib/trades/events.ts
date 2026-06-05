import { createAdminClient } from "@/lib/supabase/server";
import type { Json, ProposalStatus } from "@/lib/db/types";

type LogTradeEventInput = {
  proposalId: string;
  fromStatus: ProposalStatus | null;
  toStatus: ProposalStatus;
  actorClerkId?: string | null;
  actorBusinessId?: string | null;
  payload?: Json;
};

export async function logTradeEvent(input: LogTradeEventInput) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("trade_events").insert({
    proposal_id: input.proposalId,
    from_status: input.fromStatus,
    to_status: input.toStatus,
    actor_clerk_id: input.actorClerkId ?? null,
    actor_business_id: input.actorBusinessId ?? null,
    payload: input.payload ?? {},
  });

  if (error) throw error;
}

export async function transitionProposalStatus(
  proposalId: string,
  fromStatus: ProposalStatus,
  toStatus: ProposalStatus,
  actor: { clerkId?: string; businessId?: string },
  payload?: Json,
) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("trade_proposals")
    .update({ status: toStatus })
    .eq("id", proposalId)
    .eq("status", fromStatus)
    .select("*")
    .single();

  if (error) throw error;

  await logTradeEvent({
    proposalId,
    fromStatus,
    toStatus,
    actorClerkId: actor.clerkId,
    actorBusinessId: actor.businessId,
    payload,
  });

  return data;
}
