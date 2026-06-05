"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ErrorBox,
  OnboardingShell,
  SubmitButton,
} from "@/components/onboarding/ui";
import { saveConsentStep } from "@/lib/onboarding/browser-client";
import { SCRAPE_CONSENT_VERSION } from "@/lib/onboarding/schemas";

export function ConsentForm() {
  const router = useRouter();
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!accepted) {
      setError("Please accept the consent terms.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await saveConsentStep({
        scrapeConsent: true,
        consentVersion: SCRAPE_CONSENT_VERSION,
      });
      router.push("/onboarding/complete");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save");
    } finally {
      setLoading(false);
    }
  }

  return (
    <OnboardingShell step="consent" title="Scraping consent" description="Consent is recorded by your backend via the middleware API.">
      <form onSubmit={onSubmit} className="space-y-4">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          I consent to Reciproca using publicly available information from the URLs I
          provided to enrich my company profile (policy version {SCRAPE_CONSENT_VERSION}).
        </p>
        <label className="flex items-start gap-3 text-sm">
          <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} className="mt-1" />
          <span>I agree to the enrichment terms above.</span>
        </label>
        <ErrorBox message={error} />
        <SubmitButton label={loading ? "Saving..." : "Continue"} disabled={loading} />
      </form>
    </OnboardingShell>
  );
}
