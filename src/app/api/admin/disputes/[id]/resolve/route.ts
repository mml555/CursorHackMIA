import { requireAdmin } from "@/lib/clerk/auth";
import { apiSuccess, handleRouteError } from "@/lib/api/errors";
import { resolveDispute } from "@/lib/trades/service";
import { resolveDisputeSchema } from "@/lib/validation/schemas";
import { z } from "zod";

export const dynamic = "force-dynamic";

const paramsSchema = z.object({
  id: z.string().uuid(),
});

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const clerkUserId = await requireAdmin();
    const { id } = paramsSchema.parse(await context.params);
    const body = resolveDisputeSchema.parse(await req.json());
    const result = await resolveDispute(
      id,
      body.targetStatus,
      clerkUserId,
      body.resolutionNote,
    );
    return apiSuccess(result);
  } catch (error) {
    return handleRouteError(error);
  }
}
