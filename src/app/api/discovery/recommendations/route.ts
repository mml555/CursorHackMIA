import { auth } from "@clerk/nextjs/server";
import { apiSuccess, handleRouteError } from "@/lib/api/errors";
import {
  getBusinessWithMembership,
} from "@/lib/businesses/service";
import {
  getDemoRecommendations,
  getDiscoveryRecommendations,
} from "@/lib/discovery/service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { userId } = await auth();

    if (userId) {
      const context = await getBusinessWithMembership(userId);
      if (context.business?.status === "approved") {
        const recommendations = await getDiscoveryRecommendations(
          context.business.id,
        );
        return apiSuccess(recommendations);
      }
    }

    const recommendations = await getDemoRecommendations();
    return apiSuccess(recommendations);
  } catch (error) {
    return handleRouteError(error);
  }
}
