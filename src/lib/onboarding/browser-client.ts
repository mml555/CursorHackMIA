import type {
  OnboardingCompanyInput,
  OnboardingConsentInput,
  OnboardingServicesInput,
  OnboardingSocialInput,
  OnboardingStatus,
} from "@/lib/onboarding/schemas";

type ApiSuccess<T> = { data: T };
type ApiFailure = { error: { code: string; message: string; details?: unknown } };

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  const json = (await response.json()) as ApiSuccess<T> | ApiFailure;
  if (!response.ok) {
    const message =
      "error" in json ? json.error.message : "Something went wrong";
    throw new Error(message);
  }

  return (json as ApiSuccess<T>).data;
}

export function getOnboardingStatus() {
  return request<OnboardingStatus>("/api/onboarding/status");
}

export function saveCompanyStep(input: OnboardingCompanyInput) {
  return request<OnboardingStatus>("/api/onboarding/company", {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function saveServicesStep(input: OnboardingServicesInput) {
  return request<OnboardingStatus>("/api/onboarding/services", {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export function saveSocialStep(input: OnboardingSocialInput) {
  return request<OnboardingStatus>("/api/onboarding/social", {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function saveConsentStep(input: OnboardingConsentInput) {
  return request<OnboardingStatus>("/api/onboarding/consent", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function completeOnboarding() {
  return request<OnboardingStatus>("/api/onboarding/complete", {
    method: "POST",
  });
}
