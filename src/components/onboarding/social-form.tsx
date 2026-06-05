"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ErrorBox,
  Field,
  OnboardingShell,
  SubmitButton,
  TextInput,
} from "@/components/onboarding/ui";
import { saveSocialStep } from "@/lib/onboarding/browser-client";

export function SocialForm({
  defaults,
}: {
  defaults: { facebook: string; instagram: string; linkedin: string };
}) {
  const router = useRouter();
  const [values, setValues] = useState(defaults);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(valuesToSend: typeof defaults) {
    setLoading(true);
    setError(null);
    try {
      await saveSocialStep({
        facebook: valuesToSend.facebook.trim() || undefined,
        instagram: valuesToSend.instagram.trim() || undefined,
        linkedin: valuesToSend.linkedin.trim() || undefined,
      });
      router.push("/onboarding/consent");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save");
    } finally {
      setLoading(false);
    }
  }

  return (
    <OnboardingShell step="social" title="Social profiles" description="Optional links that help us verify your business during vetting.">
      <form onSubmit={(e) => { e.preventDefault(); submit(values); }} className="space-y-4">
        <Field label="Facebook" htmlFor="facebook"><TextInput id="facebook" type="url" value={values.facebook} onChange={(e) => setValues({ ...values, facebook: e.target.value })} /></Field>
        <Field label="Instagram" htmlFor="instagram"><TextInput id="instagram" type="url" value={values.instagram} onChange={(e) => setValues({ ...values, instagram: e.target.value })} /></Field>
        <Field label="LinkedIn" htmlFor="linkedin"><TextInput id="linkedin" type="url" value={values.linkedin} onChange={(e) => setValues({ ...values, linkedin: e.target.value })} /></Field>
        <ErrorBox message={error} />
        <div className="flex gap-3">
          <SubmitButton label={loading ? "Saving..." : "Continue"} disabled={loading} />
          <button type="button" disabled={loading} className="rounded-full border px-5 py-2.5 text-sm" onClick={() => submit({ facebook: "", instagram: "", linkedin: "" })}>
            Skip
          </button>
        </div>
      </form>
    </OnboardingShell>
  );
}
