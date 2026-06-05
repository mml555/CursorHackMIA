import { SocialForm } from "@/components/onboarding/social-form";
import { fetchOnboardingStatus } from "@/lib/onboarding/proxy";

export default async function OnboardingSocialPage() {
  let social = { facebook: "", instagram: "", linkedin: "" };
  try {
    const status = await fetchOnboardingStatus();
    social = {
      facebook: status.profile?.socialLinks?.facebook ?? "",
      instagram: status.profile?.socialLinks?.instagram ?? "",
      linkedin: status.profile?.socialLinks?.linkedin ?? "",
    };
  } catch {
    social = { facebook: "", instagram: "", linkedin: "" };
  }

  return <SocialForm defaults={social} />;
}
