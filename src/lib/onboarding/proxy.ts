import { requireUserId } from "@/lib/clerk/auth";
import { backendRequest } from "@/lib/backend/client";
import type {
  OnboardingCompanyInput,
  OnboardingConsentInput,
  OnboardingServicesInput,
  OnboardingSocialInput,
  OnboardingStatus,
} from "@/lib/onboarding/schemas";

async function withAuth<T>(fn: () => Promise<T>): Promise<T> {
  await requireUserId();
  return fn();
}

export function fetchOnboardingStatus() {
  return withAuth(() =>
    backendRequest<OnboardingStatus>("/onboarding/status"),
  );
}

export function submitCompanyStep(input: OnboardingCompanyInput) {
  return withAuth(() =>
    backendRequest<OnboardingStatus>("/onboarding/company", {
      method: "PATCH",
      body: JSON.stringify(input),
    }),
  );
}

export function submitServicesStep(input: OnboardingServicesInput) {
  return withAuth(() =>
    backendRequest<OnboardingStatus>("/onboarding/services", {
      method: "PUT",
      body: JSON.stringify(input),
    }),
  );
}

export function submitSocialStep(input: OnboardingSocialInput) {
  return withAuth(() =>
    backendRequest<OnboardingStatus>("/onboarding/social", {
      method: "PATCH",
      body: JSON.stringify(input),
    }),
  );
}

export function submitConsentStep(input: OnboardingConsentInput) {
  return withAuth(() =>
    backendRequest<OnboardingStatus>("/onboarding/consent", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  );
}

export function submitOnboardingComplete() {
  return withAuth(() =>
    backendRequest<OnboardingStatus>("/onboarding/complete", {
      method: "POST",
    }),
  );
}
