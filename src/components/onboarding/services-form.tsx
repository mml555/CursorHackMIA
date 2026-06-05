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
import { saveServicesStep } from "@/lib/onboarding/browser-client";
import type { OnboardingServiceLineInput } from "@/lib/onboarding/schemas";

type Line = OnboardingServiceLineInput & { key: string };

function emptyLine(): Line {
  return { key: crypto.randomUUID(), category: "", unit: "project", quantity: 1 };
}

function LineEditor({
  title,
  lines,
  onChange,
}: {
  title: string;
  lines: Line[];
  onChange: (lines: Line[]) => void;
}) {
  return (
    <section className="space-y-3 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
      <h2 className="font-semibold">{title}</h2>
      {lines.map((line, index) => (
        <div key={line.key} className="grid gap-3 md:grid-cols-2">
          <Field label={`Service ${index + 1}`} htmlFor={`${line.key}-category`}>
            <TextInput id={`${line.key}-category`} required value={line.category} onChange={(e) => onChange(lines.map((item) => item.key === line.key ? { ...item, category: e.target.value } : item))} />
          </Field>
          <Field label="Unit" htmlFor={`${line.key}-unit`}>
            <TextInput id={`${line.key}-unit`} required value={line.unit} onChange={(e) => onChange(lines.map((item) => item.key === line.key ? { ...item, unit: e.target.value } : item))} />
          </Field>
          <Field label="Quantity" htmlFor={`${line.key}-quantity`}>
            <TextInput id={`${line.key}-quantity`} type="number" min={0.01} step="0.01" required value={line.quantity} onChange={(e) => onChange(lines.map((item) => item.key === line.key ? { ...item, quantity: Number(e.target.value) || 1 } : item))} />
          </Field>
          <Field label="Commercial value (USD)" htmlFor={`${line.key}-fmv`}>
            <TextInput id={`${line.key}-fmv`} type="number" min={0} value={line.fmvEstimate ?? ""} onChange={(e) => onChange(lines.map((item) => item.key === line.key ? { ...item, fmvEstimate: e.target.value ? Number(e.target.value) : undefined } : item))} />
          </Field>
        </div>
      ))}
      <button type="button" className="text-sm underline" onClick={() => onChange([...lines, emptyLine()])}>
        Add service
      </button>
    </section>
  );
}

export function ServicesForm({
  defaultOffers,
  defaultNeeds,
}: {
  defaultOffers: OnboardingServiceLineInput[];
  defaultNeeds: OnboardingServiceLineInput[];
}) {
  const router = useRouter();
  const [offers, setOffers] = useState<Line[]>(
    defaultOffers.length ? defaultOffers.map((line) => ({ ...line, key: crypto.randomUUID() })) : [emptyLine()],
  );
  const [needs, setNeeds] = useState<Line[]>(
    defaultNeeds.length ? defaultNeeds.map((line) => ({ ...line, key: crypto.randomUUID() })) : [emptyLine()],
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const strip = (lines: Line[]) =>
        lines.map(({ category, unit, quantity, fmvEstimate, notes }) => ({
          category: category.trim(),
          unit: unit.trim(),
          quantity,
          fmvEstimate,
          notes,
        }));
      await saveServicesStep({ offers: strip(offers), needs: strip(needs) });
      router.push("/onboarding/social");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save");
    } finally {
      setLoading(false);
    }
  }

  return (
    <OnboardingShell step="services" title="Services" description="Offers and needs are sent to your backend through the middleware layer.">
      <form onSubmit={onSubmit} className="space-y-4">
        <LineEditor title="Services offered" lines={offers} onChange={setOffers} />
        <LineEditor title="Services looking for" lines={needs} onChange={setNeeds} />
        <ErrorBox message={error} />
        <SubmitButton label={loading ? "Saving..." : "Continue"} disabled={loading} />
      </form>
    </OnboardingShell>
  );
}
