import { requireApprovedBusinessMember } from "@/lib/clerk/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { maybeAdvanceToPendingAcceptance } from "@/lib/trades/service";
import { swipeProposalSchema } from "@/lib/validation/schemas";
import { apiSuccess, handleRouteError } from "@/lib/api/errors";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { business } = await requireApprovedBusinessMember();
    const supabase = createAdminClient();

    const { data: partyRows, error: partyError } = await supabase
      .from("proposal_parties")
      .select("proposal_id")
      .eq("business_id", business.id);

    if (partyError) throw partyError;

    const proposalIds = (partyRows ?? []).map((row) => row.proposal_id);
    if (proposalIds.length === 0) {
      return apiSuccess({ proposals: [] });
    }

    const { data: passed } = await supabase
      .from("proposal_swipes")
      .select("proposal_id")
      .eq("business_id", business.id)
      .eq("action", "pass");

    const passedIds = new Set((passed ?? []).map((row) => row.proposal_id));
    const visibleIds = proposalIds.filter((id) => !passedIds.has(id));

    if (visibleIds.length === 0) {
      return apiSuccess({ proposals: [] });
    }

    const { data: proposals, error } = await supabase
      .from("trade_proposals")
      .select("*, proposal_parties(*, businesses(id, legal_name, reputation_score, ratings_count))")
      .in("id", visibleIds)
      .eq("status", "published")
      .order("published_at", { ascending: false });

    if (error) throw error;
    return apiSuccess({ proposals: proposals ?? [] });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(req: Request) {
  try {
    const { business, profile } = await requireApprovedBusinessMember();
    const body = swipeProposalSchema.parse(await req.json());
    const supabase = createAdminClient();

    const { data: party } = await supabase
      .from("proposal_parties")
      .select("id")
      .eq("proposal_id", body.proposalId)
      .eq("business_id", business.id)
      .maybeSingle();

    if (!party) {
      return handleRouteError(new Error("Proposal not found for this business"));
    }

    const { data: swipe, error } = await supabase
      .from("proposal_swipes")
      .upsert(
        {
          proposal_id: body.proposalId,
          business_id: business.id,
          action: body.action,
          reason_tags: body.reasonTags ?? [],
        },
        { onConflict: "proposal_id,business_id" },
      )
      .select("*")
      .single();

    if (error) throw error;

    if (body.action === "interested") {
      await supabase.from("trade_events").insert({
        proposal_id: body.proposalId,
        from_status: "published",
        to_status: "published",
        actor_clerk_id: profile.clerk_user_id,
        actor_business_id: business.id,
        payload: { action: "interested" },
      });

      await maybeAdvanceToPendingAcceptance(body.proposalId);
    }

    return apiSuccess({ swipe });
  } catch (error) {
    return handleRouteError(error);
  }
}
