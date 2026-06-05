import { CompanyForm } from "@/components/onboarding/company-form";
import { fetchOnboardingStatus } from "@/lib/onboarding/proxy";

export default async function OnboardingCompanyPage() {
  let profile = null;
  try {
    const status = await fetchOnboardingStatus();
    profile = status.profile;
  } catch {
    profile = null;
  }

  return (
    <CompanyForm
      defaults={{
        legalName: profile?.legalName ?? "",
        dba: profile?.dba ?? "",
        metro: profile?.metro ?? "",
        industry: profile?.industry ?? "",
        employeeCountRange: profile?.employeeCountRange ?? "",
        estimatedCompanyValue:
          profile?.estimatedCompanyValue != null
            ? String(profile.estimatedCompanyValue)
            : "",
        website: profile?.website ?? "",
        description: profile?.description ?? "",
      }}
    />
  );
}
