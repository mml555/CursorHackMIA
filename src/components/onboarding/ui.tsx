import type { ReactNode } from "react";
import Link from "next/link";
import type { OnboardingStep } from "@/lib/onboarding/schemas";
import { ONBOARDING_STEPS } from "@/lib/onboarding/schemas";

const inputClass =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-950 dark:focus:ring-zinc-800";

export function DemoEscapeStrip() {
  return (
    <div className="border-b border-amber-200/80 bg-amber-50 px-6 py-3 dark:border-amber-900/50 dark:bg-amber-950/30">
      <div className="mx-auto flex max-w-4xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-amber-950 dark:text-amber-100">
          Not ready to finish? Explore the live demo with real network data — no
          account required.
        </p>
        <Link
          href="/demo"
          className="inline-flex shrink-0 items-center justify-center rounded-full border border-amber-400 bg-white px-4 py-1.5 text-sm font-semibold text-amber-900 transition hover:bg-amber-100 dark:border-amber-600 dark:bg-amber-950 dark:text-amber-100 dark:hover:bg-amber-900"
        >
          Open live demo
        </Link>
      </div>
    </div>
  );
}

export function OnboardingShell({
  step,
  title,
  description,
  children,
}: {
  step: OnboardingStep;
  title: string;
  description: string;
  children: ReactNode;
}) {
  const currentIndex = ONBOARDING_STEPS.findIndex((item) => item.id === step);

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
      <DemoEscapeStrip />
      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-6 py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-zinc-500">
              Reciproca onboarding
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">{title}</h1>
            <p className="mt-2 max-w-2xl text-base text-zinc-600 dark:text-zinc-400">
              {description}
            </p>
          </div>
          <Link
            href="/onboarding"
            className="shrink-0 text-sm font-medium text-zinc-500 underline-offset-4 hover:text-zinc-800 hover:underline dark:hover:text-zinc-300"
          >
            ← Back to start
          </Link>
        </div>

        <nav aria-label="Onboarding progress">
          <div className="mb-3 flex items-center justify-between text-sm text-zinc-500">
            <span>
              Step {currentIndex + 1} of {ONBOARDING_STEPS.length}
            </span>
            <span>{ONBOARDING_STEPS[currentIndex]?.label}</span>
          </div>
          <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
            <div
              className="h-full rounded-full bg-amber-500 transition-all duration-300"
              style={{
                width: `${((currentIndex + 1) / ONBOARDING_STEPS.length) * 100}%`,
              }}
            />
          </div>
          <div className="grid gap-2 overflow-x-auto sm:grid-cols-5">
            {ONBOARDING_STEPS.map((item, index) => (
              <Link
                key={item.id}
                href={item.href}
                aria-current={item.id === step ? "step" : undefined}
                className={`rounded-xl border px-3 py-3 text-sm whitespace-nowrap ${
                  item.id === step
                    ? "border-amber-500 bg-amber-50 text-amber-950 dark:border-amber-500 dark:bg-amber-950/30 dark:text-amber-100"
                    : index <= currentIndex
                      ? "border-zinc-300 bg-white text-zinc-700 dark:border-zinc-700 dark:bg-zinc-950"
                      : "border-dashed border-zinc-200 text-zinc-400 dark:border-zinc-800"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          {children}
        </div>
      </div>
    </div>
  );
}

export function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium">{label}</span>
      {children}
    </label>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputClass} ${props.className ?? ""}`} />;
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${inputClass} ${props.className ?? ""}`} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${inputClass} ${props.className ?? ""}`} />;
}

export function ErrorBox({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
      {message}
    </p>
  );
}

export function SubmitButton({
  label,
  disabled,
}: {
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className="rounded-full bg-amber-500 px-5 py-2.5 text-sm font-semibold text-zinc-900 transition hover:bg-amber-400 disabled:opacity-50"
    >
      {label}
    </button>
  );
}
