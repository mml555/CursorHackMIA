import { apiSuccess, handleRouteError } from "@/lib/api/errors";
import { getDiscoveryNetwork } from "@/lib/discovery/service";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const metro = url.searchParams.get("metro") ?? undefined;
    const industry = url.searchParams.get("industry") ?? undefined;
    const query = url.searchParams.get("q") ?? undefined;
    const payload = await getDiscoveryNetwork({ metro, industry, query });
    return apiSuccess(payload);
  } catch (error) {
    return handleRouteError(error);
  }
}
