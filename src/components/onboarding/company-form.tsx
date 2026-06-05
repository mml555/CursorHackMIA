"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ErrorBox,
  Field,
  OnboardingShell,
  Select,
  SubmitButton,
  TextArea,
  TextInput,
} from "@/components/onboarding/ui";
import { saveCompanyStep } from "@/lib/onboarding/browser-client";
import { EMPLOYEE_COUNT_OPTIONS } from "@/lib/onboarding/schemas";

export function CompanyForm({
  defaults,
}: {
  defaults: {
    legalName: string;
    dba: string;
    metro: string;
    industry: string;
    employeeCountRange: string;
    estimatedCompanyValue: string;
    website: string;
    description: string;
  };
}) {
  const router = useRouter();
  const [values, setValues] = useState(defaults);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await saveCompanyStep({
        legalName: values.legalName.trim(),
        dba: values.dba.trim() || undefined,
        metro: values.metro.trim(),
        industry: values.industry.trim(),
        employeeCountRange: values.employeeCountRange as
          | "1-10"
          | "11-50"
          | "51-200"
          | "201-500"
          | "501-1000"
          | "1000+",
        estimatedCompanyValue: values.estimatedCompanyValue
          ? Number(values.estimatedCompanyValue)
          : undefined,
        website: values.website.trim() || undefined,
        description: values.description.trim() || undefined,
      });
      router.push("/onboarding/services");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save");
    } finally {
      setLoading(false);
    }
  }

  return (
    <OnboardingShell
      step="company"
      title="Company profile"
      description="Tell us about your business. This information is reviewed before you can trade on the network."
    >
      <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
        <Field label="Company name" htmlFor="legalName">
          <TextInput id="legalName" required value={values.legalName} onChange={(e) => setValues({ ...values, legalName: e.target.value })} />
        </Field>
        <Field label="DBA" htmlFor="dba">
          <TextInput id="dba" value={values.dba} onChange={(e) => setValues({ ...values, dba: e.target.value })} />
        </Field>
        <Field label="Metro" htmlFor="metro">
          <TextInput id="metro" required value={values.metro} onChange={(e) => setValues({ ...values, metro: e.target.value })} />
        </Field>
        <Field label="Industry" htmlFor="industry">
          <TextInput id="industry" required value={values.industry} onChange={(e) => setValues({ ...values, industry: e.target.value })} />
        </Field>
        <Field label="Employees" htmlFor="employeeCountRange">
          <Select id="employeeCountRange" required value={values.employeeCountRange} onChange={(e) => setValues({ ...values, employeeCountRange: e.target.value })}>
            <option value="">Select range</option>
            {EMPLOYEE_COUNT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </Select>
        </Field>
        <Field label="Company value (USD)" htmlFor="estimatedCompanyValue">
          <TextInput id="estimatedCompanyValue" type="number" min={0} value={values.estimatedCompanyValue} onChange={(e) => setValues({ ...values, estimatedCompanyValue: e.target.value })} />
        </Field>
        <Field label="Website" htmlFor="website">
          <TextInput id="website" type="url" value={values.website} onChange={(e) => setValues({ ...values, website: e.target.value })} />
        </Field>
        <div className="md:col-span-2">
          <Field label="Description" htmlFor="description">
            <TextArea id="description" rows={4} value={values.description} onChange={(e) => setValues({ ...values, description: e.target.value })} />
          </Field>
        </div>
        <div className="md:col-span-2 space-y-3">
          <ErrorBox message={error} />
          <SubmitButton label={loading ? "Saving..." : "Continue"} disabled={loading} />
        </div>
      </form>
    </OnboardingShell>
  );
}
