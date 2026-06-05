import { createAdminClient } from "@/lib/supabase/server";
import type { ProposalParty, TradeLineItem, TradeProposal } from "@/lib/db/types";
import type { Business } from "@/lib/db/types";

function sumLineFmv(lines: TradeLineItem[]): number {
  return lines.reduce((total, line) => total + (line.fmv ?? 0), 0);
}

function parseLines(value: unknown): TradeLineItem[] {
  if (!Array.isArray(value)) return [];
  return value as TradeLineItem[];
}

export async function generateInvoicesForTrade(
  proposal: TradeProposal,
  parties: ProposalParty[],
): Promise<void> {
  const supabase = createAdminClient();

  const { data: existing } = await supabase
    .from("invoices")
    .select("id")
    .eq("trade_id", proposal.id)
    .limit(1);

  if (existing?.length) return;

  const businessIds = parties.map((party) => party.business_id);
  const { data: businesses } = await supabase
    .from("businesses")
    .select("id, legal_name, dba")
    .in("id", businessIds);

  const businessById = new Map(
    (businesses ?? []).map((business) => [business.id, business as Business]),
  );

  const rows = parties.map((party) => {
    const giveLines = parseLines(party.give_lines);
    const receiveLines = parseLines(party.receive_lines);
    const counterpartyNames = parties
      .filter((other) => other.business_id !== party.business_id)
      .map((other) => {
        const business = businessById.get(other.business_id);
        return business?.dba ?? business?.legal_name ?? "Counterparty";
      });

    return {
      trade_id: proposal.id,
      business_id: party.business_id,
      line_items: {
        tradeTitle: proposal.title,
        tradeId: proposal.id,
        completedAt: new Date().toISOString(),
        counterpartyNames,
        giveLines,
        receiveLines,
      },
      total_fmv: sumLineFmv(giveLines),
    };
  });

  const { error } = await supabase.from("invoices").insert(rows);
  if (error) throw error;
}
