import { apiSuccess, handleRouteError } from "@/lib/api/errors";
import { submitDiscoverySwipe } from "@/lib/discovery/proxy";
import { swipeDiscoverySchema } from "@/lib/validation/schemas";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = swipeDiscoverySchema.parse(await req.json());
    const payload = await submitDiscoverySwipe(body);
    return apiSuccess(payload);
  } catch (error) {
    return handleRouteError(error);
  }
}
