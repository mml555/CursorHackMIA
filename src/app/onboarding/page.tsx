import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { OnboardingWelcome } from "@/components/onboarding/welcome";
import { fetchOnboardingStatus } from "@/lib/onboarding/proxy";

export default async function OnboardingIndexPage() {
  const { userId } = await auth();
  let status = null;

  if (userId) {
    try {
      status = await fetchOnboardingStatus();
      if (status.isComplete) {
        redirect("/onboarding/complete");
      }
    } catch {
      status = null;
    }
  }

  return <OnboardingWelcome status={status} isSignedIn={Boolean(userId)} />;
}
