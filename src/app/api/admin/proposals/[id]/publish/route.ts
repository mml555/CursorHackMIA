import { requireAdmin } from "@/lib/clerk/auth";
import { apiSuccess, handleRouteError } from "@/lib/api/errors";
import { publishProposal } from "@/lib/trades/publish";
import { z } from "zod";

export const dynamic = "force-dynamic";

const paramsSchema = z.object({
  id: z.string().uuid(),
});

export async function POST(
  _req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const clerkUserId = await requireAdmin();
    const { id } = paramsSchema.parse(await context.params);
    const result = await publishProposal(id, clerkUserId);
    return apiSuccess(result);
  } catch (error) {
    return handleRouteError(error);
  }
}
