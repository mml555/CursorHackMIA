import { apiSuccess, handleRouteError } from "@/lib/api/errors";
import { fetchDiscoveryMatches } from "@/lib/discovery/proxy";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const payload = await fetchDiscoveryMatches();
    return apiSuccess(payload);
  } catch (error) {
    return handleRouteError(error);
  }
}
