import { apiSuccess, handleRouteError } from "@/lib/api/errors";
import { submitCompanyStep } from "@/lib/onboarding/proxy";
import { onboardingCompanySchema } from "@/lib/onboarding/schemas";

export const dynamic = "force-dynamic";

export async function PATCH(req: Request) {
  try {
    const body = onboardingCompanySchema.parse(await req.json());
    const status = await submitCompanyStep(body);
    return apiSuccess(status);
  } catch (error) {
    return handleRouteError(error);
  }
}
