import { apiSuccess, handleRouteError } from "@/lib/api/errors";
import { submitOnboardingComplete } from "@/lib/onboarding/proxy";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const status = await submitOnboardingComplete();
    return apiSuccess(status);
  } catch (error) {
    return handleRouteError(error);
  }
}
