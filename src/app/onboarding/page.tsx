import { redirect } from "next/navigation";
import { fetchOnboardingStatus } from "@/lib/onboarding/proxy";
import { stepHref } from "@/lib/onboarding/schemas";

export default async function OnboardingIndexPage() {
  try {
    const status = await fetchOnboardingStatus();
    redirect(stepHref(status.isComplete ? "complete" : status.step));
  } catch {
    redirect("/onboarding/company");
  }
}
