"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ErrorBox,
  OnboardingShell,
} from "@/components/onboarding/ui";
import { completeOnboarding } from "@/lib/onboarding/browser-client";
import type { OnboardingStatus } from "@/lib/onboarding/schemas";

export function CompleteView({ status }: { status: OnboardingStatus }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const profile = status.profile;

  async function onSubmit() {
    setLoading(true);
    setError(null);
    try {
      await completeOnboarding();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to submit");
    } finally {
      setLoading(false);
    }
  }

  if (status.isComplete) {
    return (
      <OnboardingShell step="complete" title="Application submitted" description="Our team is reviewing your business. You will get deck access after approval.">
        <div className="space-y-4 text-sm">
          <p>
            Profile for <strong>{profile?.legalName ?? "your company"}</strong>{" "}
            is in the vetting queue.
          </p>
          <p className="text-zinc-600 dark:text-zinc-400">
            While you wait, you can still explore how matching works in the live
            demo.
          </p>
          <a
            href="/demo"
            className="inline-flex rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-900"
          >
            Open live demo
          </a>
        </div>
      </OnboardingShell>
    );
  }

  return (
    <OnboardingShell step="complete" title="Review and submit" description="Check your details, then submit for vetting. Approved businesses get access to the trade network.">
      <div className="space-y-4 text-sm">
        <div><strong>Company:</strong> {profile?.legalName ?? "—"}</div>
        <div><strong>Industry:</strong> {profile?.industry ?? "—"}</div>
        <div><strong>Offers:</strong> {status.offers.length}</div>
        <div><strong>Needs:</strong> {status.needs.length}</div>
        <div><strong>Consent:</strong> {profile?.scrapeConsent ? "Yes" : "No"}</div>
        {status.missingFields.length > 0 ? (
          <p className="text-amber-700 dark:text-amber-300">
            Missing: {status.missingFields.join(", ")}
          </p>
        ) : null}
        <ErrorBox message={error} />
        <button
          type="button"
          disabled={loading || status.missingFields.length > 0}
          onClick={onSubmit}
          className="rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
        >
          {loading ? "Submitting..." : "Submit for vetting"}
        </button>
      </div>
    </OnboardingShell>
  );
}
