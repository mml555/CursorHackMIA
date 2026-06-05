import { apiSuccess, handleRouteError } from "@/lib/api/errors";
import { getDiscoveryStats } from "@/lib/discovery/service";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const metro = url.searchParams.get("metro") ?? undefined;
    const stats = await getDiscoveryStats(metro);
    return apiSuccess(stats);
  } catch (error) {
    return handleRouteError(error);
  }
}
