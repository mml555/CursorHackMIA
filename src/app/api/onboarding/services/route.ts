import { apiSuccess, handleRouteError } from "@/lib/api/errors";
import { submitServicesStep } from "@/lib/onboarding/proxy";
import { onboardingServicesSchema } from "@/lib/onboarding/schemas";

export const dynamic = "force-dynamic";

export async function PUT(req: Request) {
  try {
    const body = onboardingServicesSchema.parse(await req.json());
    const status = await submitServicesStep(body);
    return apiSuccess(status);
  } catch (error) {
    return handleRouteError(error);
  }
}
