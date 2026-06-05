import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16 font-sans">
      <Link href="/" className="text-sm text-zinc-500 hover:underline">
        ← Home
      </Link>
      <h1 className="mt-6 text-3xl font-semibold">Terms of Use</h1>
      <p className="mt-4 text-zinc-600 leading-relaxed">
        Reciproca is a closed, vetted network for business-to-business service trade. Members are
        responsible for fair market value reporting and tax compliance on barter income. The
        platform does not issue trade dollars or guarantee counterparty performance.
      </p>
      <p className="mt-4 text-zinc-600 leading-relaxed">
        By using Reciproca you agree to accurate listings, good-faith trade completion, and
        post-trade outcome ratings. Disputes may be escalated to Reciproca concierge review.
      </p>
    </div>
  );
}
