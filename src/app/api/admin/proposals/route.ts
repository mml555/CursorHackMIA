import { requireAdmin } from "@/lib/clerk/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { createProposalSchema } from "@/lib/validation/schemas";
import { logTradeEvent } from "@/lib/trades/events";
import { apiSuccess, handleRouteError } from "@/lib/api/errors";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdmin();
    const supabase = createAdminClient();

    const { data: proposals, error } = await supabase
      .from("trade_proposals")
      .select("*, proposal_parties(*)")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) throw error;
    return apiSuccess({ proposals: proposals ?? [] });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(req: Request) {
  try {
    const clerkUserId = await requireAdmin();
    const body = createProposalSchema.parse(await req.json());
    const supabase = createAdminClient();

    const { data: proposal, error: proposalError } = await supabase
      .from("trade_proposals")
      .insert({
        title: body.title,
        summary: body.summary ?? null,
        trade_type: body.tradeType,
        metro: body.metro ?? null,
        vertical: body.vertical ?? null,
        cash_topup_display: body.cashTopupDisplay ?? null,
        status: "draft",
        created_by_clerk_id: clerkUserId,
      })
      .select("*")
      .single();

    if (proposalError) throw proposalError;

    const partyRows = body.parties.map((party) => ({
      proposal_id: proposal.id,
      business_id: party.businessId,
      give_lines: party.giveLines,
      receive_lines: party.receiveLines,
      estimated_fmv: party.estimatedFmv ?? null,
    }));

    const { error: partiesError } = await supabase
      .from("proposal_parties")
      .insert(partyRows);

    if (partiesError) throw partiesError;

    await logTradeEvent({
      proposalId: proposal.id,
      fromStatus: null,
      toStatus: "draft",
      actorClerkId: clerkUserId,
      payload: { action: "created" },
    });

    return apiSuccess({ proposal }, 201);
  } catch (error) {
    return handleRouteError(error);
  }
}
