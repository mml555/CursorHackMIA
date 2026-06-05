import { requireAdmin } from "@/lib/clerk/auth";
import { runMatchingPipeline } from "@/lib/matching/db/run-pipeline";
import { apiSuccess, handleRouteError } from "@/lib/api/errors";
import { z } from "zod";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  focalBusinessId: z.string().uuid().optional(),
  persist: z.boolean().default(true),
  publish: z.boolean().default(false),
  minCombinedScore: z.number().min(0).max(1).optional(),
});

export async function POST(req: Request) {
  try {
    const clerkUserId = await requireAdmin();
    const body = bodySchema.parse(await req.json().catch(() => ({})));

    const result = await runMatchingPipeline({
      focalBusinessId: body.focalBusinessId,
      createdByClerkId: clerkUserId,
      persist: body.persist,
      publish: body.publish,
      matchOptions: {
        minCombinedScore: body.minCombinedScore,
      },
    });

    return apiSuccess({
      direct: result.matches.direct.length,
      multiParty: result.matches.multiParty.length,
      partial: result.matches.partial.length,
      embeddingsLoaded: result.embeddingsLoaded,
      excludedBusinessIds: result.excludedBusinessIds,
      persisted: result.persisted,
      matches: result.matches,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
