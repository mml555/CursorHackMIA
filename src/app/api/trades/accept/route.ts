import { requireApprovedBusinessMember } from "@/lib/clerk/auth";
import { apiSuccess, handleRouteError } from "@/lib/api/errors";
import { acceptTrade } from "@/lib/trades/service";
import { acceptProposalSchema } from "@/lib/validation/schemas";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { business, profile } = await requireApprovedBusinessMember();
    const body = acceptProposalSchema.parse(await req.json());
    const result = await acceptTrade(body, {
      clerkId: profile.clerk_user_id,
      businessId: business.id,
    });
    return apiSuccess(result);
  } catch (error) {
    return handleRouteError(error);
  }
}
