import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 px-6 py-24 font-sans dark:bg-black">
      <main className="flex w-full max-w-2xl flex-col items-center gap-8 text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-black dark:text-zinc-50">
          Reciproca
        </h1>
        <p className="max-w-lg text-lg leading-8 text-zinc-600 dark:text-zinc-400">
          The trust-and-matching network for B2B service trade. Businesses trade
          the services they have for the ones they need, matched by AI, inside a
          closed, vetted network.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/demo"
            className="flex h-12 items-center justify-center rounded-full bg-amber-500 px-8 text-sm font-semibold text-zinc-900 transition hover:bg-amber-400"
          >
            Open live demo
          </Link>
          <Link
            href="/design"
            className="flex h-12 items-center justify-center rounded-full border border-zinc-300 px-8 text-sm font-medium text-zinc-900 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-900"
          >
            Design system
          </Link>
        </div>
        <p className="text-sm text-zinc-500 dark:text-zinc-500">
          Sign in or sign up in the header to create your account.
        </p>
      </main>
    </div>
  );
}
