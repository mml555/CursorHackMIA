import { apiSuccess, handleRouteError } from "@/lib/api/errors";
import { fetchDiscoveryNetwork } from "@/lib/discovery/proxy";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const payload = await fetchDiscoveryNetwork(url.searchParams);
    return apiSuccess(payload);
  } catch (error) {
    return handleRouteError(error);
  }
}
