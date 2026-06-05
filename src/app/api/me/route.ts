import { requireUserId } from "@/lib/clerk/auth";
import { getBusinessWithMembership } from "@/lib/businesses/service";
import { apiSuccess, handleRouteError } from "@/lib/api/errors";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const clerkUserId = await requireUserId();
    const context = await getBusinessWithMembership(clerkUserId);

    return apiSuccess({
      clerkUserId,
      profile: context.profile,
      membership: context.membership,
      business: context.business,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
