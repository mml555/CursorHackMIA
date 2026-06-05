import { requireApprovedBusinessMember } from "@/lib/clerk/auth";
import { runMatchingPipeline } from "@/lib/matching/db/run-pipeline";
import { apiSuccess, handleRouteError } from "@/lib/api/errors";
import { z } from "zod";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  persist: z.boolean().default(true),
  publish: z.boolean().default(true),
  minCombinedScore: z.number().min(0).max(1).optional(),
});

/**
 * Run matcher for the signed-in member's business.
 * Excludes deck passes automatically; can persist draft/published proposals.
 */
export async function POST(req: Request) {
  try {
    const { business, profile } = await requireApprovedBusinessMember();
    const body = bodySchema.parse(await req.json().catch(() => ({})));

    const result = await runMatchingPipeline({
      focalBusinessId: business.id,
      createdByClerkId: profile.clerk_user_id,
      persist: body.persist,
      publish: body.publish,
      matchOptions: {
        minCombinedScore: body.minCombinedScore ?? 0.55,
      },
    });

    return apiSuccess({
      businessId: business.id,
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
