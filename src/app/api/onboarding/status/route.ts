import { apiSuccess, handleRouteError } from "@/lib/api/errors";
import { fetchOnboardingStatus } from "@/lib/onboarding/proxy";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const status = await fetchOnboardingStatus();
    return apiSuccess(status);
  } catch (error) {
    return handleRouteError(error);
  }
}
