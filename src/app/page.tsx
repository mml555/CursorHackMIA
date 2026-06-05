import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 px-6 py-16 font-sans dark:bg-black">
      <main className="flex w-full max-w-3xl flex-col items-center gap-10 text-center">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight text-black dark:text-zinc-50">
            Reciproca
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            The trust-and-matching network for B2B service trade. Browse the
            network first, then apply when you want to trade as your business.
          </p>
        </div>

        <div className="grid w-full gap-4 text-left sm:grid-cols-2">
          <Link
            href="/demo"
            className="group rounded-2xl border-2 border-amber-400 bg-amber-50 p-6 transition hover:border-amber-500 hover:shadow-md dark:border-amber-500/70 dark:bg-amber-950/20"
          >
            <span className="inline-flex rounded-full bg-amber-500 px-2.5 py-0.5 text-xs font-semibold text-zinc-900">
              Start here
            </span>
            <h2 className="mt-4 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
              Explore the live demo
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              See AI-ranked matches, browse vetted Austin businesses, and propose
              a trade — no account required.
            </p>
            <span className="mt-4 inline-flex text-sm font-semibold text-amber-800 group-hover:underline dark:text-amber-300">
              Open demo →
            </span>
          </Link>

          <Link
            href="/onboarding"
            className="group rounded-2xl border border-zinc-200 bg-white p-6 transition hover:border-zinc-400 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950"
          >
            <span className="inline-flex rounded-full border border-zinc-200 px-2.5 py-0.5 text-xs font-medium text-zinc-500 dark:border-zinc-700">
              When you&apos;re ready
            </span>
            <h2 className="mt-4 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
              Apply to join
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              Create your account and submit your company for vetting when
              you&apos;re ready to trade on the network.
            </p>
            <span className="mt-4 inline-flex text-sm font-semibold text-zinc-900 group-hover:underline dark:text-zinc-100">
              Get started →
            </span>
          </Link>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
          <Link
            href="/design"
            className="font-medium text-zinc-500 underline-offset-4 hover:text-zinc-800 hover:underline dark:hover:text-zinc-300"
          >
            Design system
          </Link>
          <span className="text-zinc-300 dark:text-zinc-700">·</span>
          <Link
            href="/sign-in"
            className="font-medium text-zinc-500 underline-offset-4 hover:text-zinc-800 hover:underline dark:hover:text-zinc-300"
          >
            Sign in
          </Link>
        </div>
      </main>
    </div>
  );
}
