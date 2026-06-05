import { CompleteView } from "@/components/onboarding/complete-view";
import { fetchOnboardingStatus } from "@/lib/onboarding/proxy";
import type { OnboardingStatus } from "@/lib/onboarding/schemas";

const emptyStatus: OnboardingStatus = {
  step: "complete",
  isComplete: false,
  missingFields: ["legalName", "offers", "needs", "scrapeConsent"],
  profile: null,
  offers: [],
  needs: [],
};

export default async function OnboardingCompletePage() {
  let status = emptyStatus;
  try {
    status = await fetchOnboardingStatus();
  } catch {
    status = emptyStatus;
  }

  return <CompleteView status={status} />;
}
