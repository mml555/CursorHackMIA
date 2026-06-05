import { apiError, apiSuccess, handleRouteError } from "@/lib/api/errors";
import { fetchDiscoveryBusinessProfile } from "@/lib/discovery/proxy";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_req: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    if (!id) {
      return apiError("VALIDATION_ERROR", "Business id is required", 400);
    }

    const profile = await fetchDiscoveryBusinessProfile(id);
    return apiSuccess({ profile });
  } catch (error) {
    return handleRouteError(error);
  }
}
