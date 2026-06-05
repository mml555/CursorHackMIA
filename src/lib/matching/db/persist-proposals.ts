import { createAdminClient } from "@/lib/supabase/server";
import { logTradeEvent } from "@/lib/trades/events";
import type { TradeLineItem } from "@/lib/db/types";
import type {
  DirectTradeMatch,
  MatchListing,
  MultiPartyTradeMatch,
} from "@/lib/matching/types";

function lineFromListing(
  listing: MatchListing,
  fmv?: number | null,
): TradeLineItem {
  return {
    description: listing.category,
    quantity: listing.quantity,
    unit: listing.unit,
    fmv: fmv ?? listing.fmvEstimate ?? undefined,
  };
}

function partyFingerprint(businessIds: string[]): string {
  return [...businessIds].sort().join("|");
}

export async function existingAutoProposalFingerprints(): Promise<Set<string>> {
  const supabase = createAdminClient();
  const { data: proposals, error } = await supabase
    .from("trade_proposals")
    .select("id")
    .eq("source", "auto")
    .in("status", ["draft", "published", "pending_acceptance"]);

  if (error) throw error;
  if (!proposals?.length) return new Set();

  const proposalIds = proposals.map((p) => p.id);
  const { data: parties, error: partyError } = await supabase
    .from("proposal_parties")
    .select("proposal_id, business_id")
    .in("proposal_id", proposalIds);

  if (partyError) throw partyError;

  const byProposal = new Map<string, string[]>();
  for (const row of parties ?? []) {
    const list = byProposal.get(row.proposal_id) ?? [];
    list.push(row.business_id);
    byProposal.set(row.proposal_id, list);
  }

  const fingerprints = new Set<string>();
  for (const ids of byProposal.values()) {
    if (ids.length > 0) fingerprints.add(partyFingerprint(ids));
  }

  return fingerprints;
}

type PersistResult = {
  created: string[];
  skipped: number;
};

async function insertAutoProposal(
  match: DirectTradeMatch | MultiPartyTradeMatch,
  listingsById: Map<string, MatchListing>,
  createdByClerkId: string | null,
): Promise<string> {
  const supabase = createAdminClient();

  const { data: proposal, error: proposalError } = await supabase
    .from("trade_proposals")
    .insert({
      title: match.summary.slice(0, 200),
      summary: match.summary,
      trade_type: match.tradeType,
      status: "draft",
      source: "auto",
      match_score: match.score,
      match_reason: { ...match.reason, confidence: match.confidence },
      cash_topup_display: match.cashTopup?.amount ?? null,
      created_by_clerk_id: createdByClerkId,
      metro: null,
      vertical: null,
    })
    .select("id")
    .single();

  if (proposalError) throw proposalError;

  const partyRows = match.parties.map((party) => {
    const giveListing = listingsById.get(party.giveListingId);
    const receiveListing = listingsById.get(party.receiveListingId);

    return {
      proposal_id: proposal.id,
      business_id: party.businessId,
      give_lines: giveListing
        ? [lineFromListing(giveListing, party.estimatedFmv)]
        : [{ description: party.giveCategory, fmv: party.estimatedFmv ?? undefined }],
      receive_lines: receiveListing
        ? [lineFromListing(receiveListing)]
        : [{ description: party.receiveCategory }],
      estimated_fmv: party.estimatedFmv,
    };
  });

  const { error: partiesError } = await supabase
    .from("proposal_parties")
    .insert(partyRows);

  if (partiesError) throw partiesError;

  await logTradeEvent({
    proposalId: proposal.id,
    fromStatus: null,
    toStatus: "draft",
    actorClerkId: createdByClerkId,
    payload: { action: "auto_matched", score: match.score },
  });

  return proposal.id;
}

export async function persistMatchResults(
  direct: DirectTradeMatch[],
  multiParty: MultiPartyTradeMatch[],
  listings: MatchListing[],
  options?: {
    createdByClerkId?: string | null;
    publish?: boolean;
  },
): Promise<PersistResult> {
  const listingsById = new Map(listings.map((l) => [l.id, l]));
  const existing = await existingAutoProposalFingerprints();
  const created: string[] = [];
  let skipped = 0;

  const candidates = [
    ...direct.map((m) => ({ match: m as DirectTradeMatch | MultiPartyTradeMatch })),
    ...multiParty.map((m) => ({ match: m })),
  ].sort((a, b) => b.match.score - a.match.score);

  for (const { match } of candidates) {
    const fingerprint = partyFingerprint(
      match.parties.map((p) => p.businessId),
    );
    if (existing.has(fingerprint)) {
      skipped += 1;
      continue;
    }

    const id = await insertAutoProposal(
      match,
      listingsById,
      options?.createdByClerkId ?? null,
    );
    created.push(id);
    existing.add(fingerprint);

    if (options?.publish) {
      const supabase = createAdminClient();
      const snapshot = {
        title: match.summary.slice(0, 200),
        summary: match.summary,
        parties: match.parties,
        reason: match.reason,
        generatedAt: new Date().toISOString(),
      };

      await supabase
        .from("trade_proposals")
        .update({
          status: "published",
          published_at: new Date().toISOString(),
          snapshot,
        })
        .eq("id", id);

      await logTradeEvent({
        proposalId: id,
        fromStatus: "draft",
        toStatus: "published",
        actorClerkId: options?.createdByClerkId ?? null,
        payload: { action: "auto_publish" },
      });
    }
  }

  return { created, skipped };
}
