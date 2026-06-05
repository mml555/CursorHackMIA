import { apiSuccess, handleRouteError } from "@/lib/api/errors";
import { fetchDiscoveryStats } from "@/lib/discovery/proxy";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const stats = await fetchDiscoveryStats(url.searchParams);
    return apiSuccess(stats);
  } catch (error) {
    return handleRouteError(error);
  }
}
