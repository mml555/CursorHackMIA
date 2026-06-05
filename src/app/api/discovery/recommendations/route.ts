import { apiSuccess, handleRouteError } from "@/lib/api/errors";
import { getDemoRecommendations } from "@/lib/discovery/service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const recommendations = await getDemoRecommendations();
    return apiSuccess(recommendations);
  } catch (error) {
    return handleRouteError(error);
  }
}
