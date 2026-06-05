import { requireApprovedBusinessMember } from "@/lib/clerk/auth";
import { apiSuccess, handleRouteError } from "@/lib/api/errors";
import { disputeTrade } from "@/lib/trades/service";
import { disputeTradeSchema } from "@/lib/validation/schemas";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { business, profile } = await requireApprovedBusinessMember();
    const body = disputeTradeSchema.parse(await req.json());
    const result = await disputeTrade(body.proposalId, {
      clerkId: profile.clerk_user_id,
      businessId: business.id,
    }, body.reason);
    return apiSuccess(result);
  } catch (error) {
    return handleRouteError(error);
  }
}
