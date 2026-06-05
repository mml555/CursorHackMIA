import { requireApprovedBusinessMember } from "@/lib/clerk/auth";
import { apiSuccess, handleRouteError } from "@/lib/api/errors";
import { getTradeDetail } from "@/lib/trades/service";
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
    const trade = await getTradeDetail(id, business.id);
    return apiSuccess(trade);
  } catch (error) {
    return handleRouteError(error);
  }
}
