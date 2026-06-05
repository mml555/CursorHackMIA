import { requireApprovedBusinessMember } from "@/lib/clerk/auth";
import { apiSuccess, handleRouteError } from "@/lib/api/errors";
import {
  ACTIVE_TRADE_STATUSES,
  listActiveTradesForBusiness,
} from "@/lib/trades/service";
import type { ProposalStatus } from "@/lib/db/types";
import { z } from "zod";

export const dynamic = "force-dynamic";

const querySchema = z.object({
  status: z.enum(ACTIVE_TRADE_STATUSES as [ProposalStatus, ...ProposalStatus[]]).optional(),
});

export async function GET(req: Request) {
  try {
    const { business } = await requireApprovedBusinessMember();
    const { searchParams } = new URL(req.url);
    const query = querySchema.parse({
      status: searchParams.get("status") ?? undefined,
    });

    const trades = await listActiveTradesForBusiness(business.id, query.status);
    return apiSuccess({ trades });
  } catch (error) {
    return handleRouteError(error);
  }
}
