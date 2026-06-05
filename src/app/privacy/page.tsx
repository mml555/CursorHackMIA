import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16 font-sans">
      <Link href="/" className="text-sm text-zinc-500 hover:underline">
        ← Home
      </Link>
      <h1 className="mt-6 text-3xl font-semibold">Privacy Policy</h1>
      <p className="mt-4 text-zinc-600 leading-relaxed">
        Reciproca collects business contact information, offer/need listings, and trade activity
        to operate the B2B trade network. We do not sell personal data. Verification documents are
        stored in private storage and accessed only by authorized admins.
      </p>
      <p className="mt-4 text-zinc-600 leading-relaxed">
        For demo and pilot purposes, data may be synthetic or seeded. Contact the operator for
        deletion requests or data questions.
      </p>
    </div>
  );
}
