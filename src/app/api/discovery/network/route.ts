import { apiSuccess, handleRouteError } from "@/lib/api/errors";
import { cardsToMembers } from "@/lib/discovery/mappers";
import { listDiscoveryCards } from "@/lib/discovery/service";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const metro = url.searchParams.get("metro") ?? undefined;
    const industry = url.searchParams.get("industry") ?? undefined;
    const query = url.searchParams.get("q") ?? undefined;

    const cards = await listDiscoveryCards({ metro, industry, query });
    return apiSuccess({ members: cardsToMembers(cards) });
  } catch (error) {
    return handleRouteError(error);
  }
}
