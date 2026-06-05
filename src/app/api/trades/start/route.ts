import { requireApprovedBusinessMember } from "@/lib/clerk/auth";
import { apiSuccess, handleRouteError } from "@/lib/api/errors";
import { startTrade } from "@/lib/trades/service";
import { tradeActionSchema } from "@/lib/validation/schemas";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { business, profile } = await requireApprovedBusinessMember();
    const body = tradeActionSchema.parse(await req.json());
    const result = await startTrade(body.proposalId, {
      clerkId: profile.clerk_user_id,
      businessId: business.id,
    });
    return apiSuccess(result);
  } catch (error) {
    return handleRouteError(error);
  }
}
