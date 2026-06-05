import { apiSuccess, handleRouteError } from "@/lib/api/errors";
import { submitConsentStep } from "@/lib/onboarding/proxy";
import { onboardingConsentSchema } from "@/lib/onboarding/schemas";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = onboardingConsentSchema.parse(await req.json());
    const status = await submitConsentStep(body);
    return apiSuccess(status);
  } catch (error) {
    return handleRouteError(error);
  }
}
