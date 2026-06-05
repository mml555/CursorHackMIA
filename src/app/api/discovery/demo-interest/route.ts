import { z } from "zod";
import { apiSuccess, handleRouteError } from "@/lib/api/errors";
import { submitDemoInterest } from "@/lib/discovery/proxy";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  targetBusinessId: z.string().uuid(),
});

/**
 * Public demo endpoint — records an "interested" swipe from the seeded
 * focal business (Sunrise Yoga) when the viewer is not signed in.
 */
export async function POST(req: Request) {
  try {
    const body = bodySchema.parse(await req.json());
    const payload = await submitDemoInterest(body.targetBusinessId);
    return apiSuccess(payload);
  } catch (error) {
    return handleRouteError(error);
  }
}
