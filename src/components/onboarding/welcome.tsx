import Link from "next/link";
import type { OnboardingStatus } from "@/lib/onboarding/schemas";
import { stepHref } from "@/lib/onboarding/schemas";

function hasStarted(status: OnboardingStatus | null): boolean {
  if (!status) return false;
  if (status.isComplete) return true;
  if (status.step !== "company") return true;
  if (status.offers.length > 0 || status.needs.length > 0) return true;
  return Boolean(status.profile?.legalName?.trim());
}

export function OnboardingWelcome({
  status,
  isSignedIn = false,
}: {
  status: OnboardingStatus | null;
  isSignedIn?: boolean;
}) {
  const started = hasStarted(status);
  const resumeHref = status ? stepHref(status.step) : "/onboarding/company";
  const companyName = status?.profile?.legalName;

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-10 px-6 py-12">
        <div className="text-center">
          <p className="text-sm font-medium uppercase tracking-wide text-zinc-500">
            Welcome to Reciproca
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            See the network first, apply when you&apos;re ready
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
            Browse real Austin businesses, AI-ranked matches, and the member
            network without creating an account. Start your vetting application
            only when you want to trade as your company.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            href="/demo"
            className="group rounded-2xl border-2 border-amber-400/80 bg-amber-50 p-6 transition hover:border-amber-500 hover:shadow-md dark:border-amber-500/60 dark:bg-amber-950/20"
          >
            <span className="inline-flex rounded-full bg-amber-500 px-2.5 py-0.5 text-xs font-semibold text-zinc-900">
              Recommended first
            </span>
            <h2 className="mt-4 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
              Explore the live demo
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              Walk through matches, browse the vetted network, and propose a
              trade as our demo studio. No sign-up required.
            </p>
            <span className="mt-5 inline-flex text-sm font-semibold text-amber-700 group-hover:underline dark:text-amber-300">
              Open demo →
            </span>
          </Link>

          <Link
            href={isSignedIn ? "/onboarding/company" : "/sign-up"}
            className="group rounded-2xl border border-zinc-200 bg-white p-6 transition hover:border-zinc-400 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950"
          >
            <span className="inline-flex rounded-full border border-zinc-200 px-2.5 py-0.5 text-xs font-medium text-zinc-500 dark:border-zinc-700">
              Vetted members only
            </span>
            <h2 className="mt-4 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
              Start your application
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              Tell us about your company, what you offer, and what you need.
              We review every business before they enter the trade network.
            </p>
            <span className="mt-5 inline-flex text-sm font-semibold text-zinc-900 group-hover:underline dark:text-zinc-100">
              {isSignedIn ? "Begin onboarding →" : "Create account →"}
            </span>
          </Link>
        </div>

        {started && (
          <div className="rounded-2xl border border-zinc-200 bg-white px-5 py-4 dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  Application in progress
                  {companyName ? ` · ${companyName}` : ""}
                </p>
                <p className="mt-1 text-sm text-zinc-500">
                  Pick up where you left off or keep exploring the demo.
                </p>
              </div>
              <Link
                href={resumeHref}
                className="inline-flex shrink-0 items-center justify-center rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
              >
                Resume application
              </Link>
            </div>
          </div>
        )}

        <div className="rounded-xl border border-dashed border-zinc-200 px-4 py-3 text-center text-sm text-zinc-500 dark:border-zinc-800">
          Demo uses seeded Austin businesses. Your application creates a separate
          profile for vetting.
        </div>
      </div>
    </div>
  );
}
