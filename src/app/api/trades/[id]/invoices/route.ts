import { requireApprovedBusinessMember } from "@/lib/clerk/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { TradeError } from "@/lib/trades/errors";
import { apiSuccess, handleRouteError } from "@/lib/api/errors";
import { z } from "zod";

export const dynamic = "force-dynamic";

const paramsSchema = z.object({
  id: z.string().uuid(),
});

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { business } = await requireApprovedBusinessMember();
    const { id } = paramsSchema.parse(await context.params);
    const supabase = createAdminClient();

    const { data: party } = await supabase
      .from("proposal_parties")
      .select("id")
      .eq("proposal_id", id)
      .eq("business_id", business.id)
      .maybeSingle();

    if (!party) {
      throw new TradeError("Not a participant in this trade", 403, "FORBIDDEN");
    }

    const { data: invoices, error } = await supabase
      .from("invoices")
      .select("*")
      .eq("trade_id", id)
      .eq("business_id", business.id);

    if (error) throw error;
    return apiSuccess({ invoices: invoices ?? [] });
  } catch (error) {
    return handleRouteError(error);
  }
}
