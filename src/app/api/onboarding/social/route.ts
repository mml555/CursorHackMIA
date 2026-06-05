import { apiSuccess, handleRouteError } from "@/lib/api/errors";
import { submitSocialStep } from "@/lib/onboarding/proxy";
import { onboardingSocialSchema } from "@/lib/onboarding/schemas";

export const dynamic = "force-dynamic";

export async function PATCH(req: Request) {
  try {
    const body = onboardingSocialSchema.parse(await req.json());
    const status = await submitSocialStep(body);
    return apiSuccess(status);
  } catch (error) {
    return handleRouteError(error);
  }
}
