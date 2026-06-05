import { ServicesForm } from "@/components/onboarding/services-form";
import { fetchOnboardingStatus } from "@/lib/onboarding/proxy";
import type { OnboardingServiceLineInput } from "@/lib/onboarding/schemas";

export default async function OnboardingServicesPage() {
  let offers: OnboardingServiceLineInput[] = [];
  let needs: OnboardingServiceLineInput[] = [];
  try {
    const status = await fetchOnboardingStatus();
    offers = status.offers;
    needs = status.needs;
  } catch {
    offers = [];
    needs = [];
  }

  return <ServicesForm defaultOffers={offers} defaultNeeds={needs} />;
}
