import { apiSuccess, handleRouteError } from "@/lib/api/errors";
import { fetchDiscoveryRecommendations } from "@/lib/discovery/proxy";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const recommendations = await fetchDiscoveryRecommendations();
    return apiSuccess(recommendations);
  } catch (error) {
    return handleRouteError(error);
  }
}
