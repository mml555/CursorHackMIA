"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  EmptyState,
  ErrorState,
  PageHeader,
  SkeletonCard,
  Stars,
  Vetted,
} from "@/components/reciproca/primitives";

type MeResponse = {
  business: {
    id: string;
    legal_name: string;
    dba: string | null;
    slug: string | null;
    metro: string;
    vertical: string;
    description: string | null;
    status: string;
    reputation_score: number | null;
    ratings_count: number;
  } | null;
  logoUrl: string | null;
};

type Listing = {
  id: string;
  listing_type: string;
  category: string;
  unit: string;
  quantity: number;
  fmv_estimate: number | null;
  notes: string | null;
};

export function ProfileView() {
  const [me, setMe] = useState<MeResponse | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [meRes, listingsRes] = await Promise.all([
          fetch("/api/me"),
          fetch("/api/listings"),
        ]);
        const meBody = (await meRes.json()) as {
          data?: MeResponse;
          error?: { message?: string };
        };
        const listingsBody = (await listingsRes.json()) as {
          data?: { listings: Listing[] };
        };
        if (!meRes.ok) {
          throw new Error(meBody.error?.message ?? "Failed to load profile");
        }
        if (!cancelled) {
          setMe(meBody.data ?? null);
          setListings(listingsBody.data?.listings ?? []);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load profile");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const load = () => {
    setLoading(true);
    setError(null);
    setReloadKey((k) => k + 1);
  };

  const business = me?.business;

  return (
    <div className="screen">
      <div className="container page-pad-y">
        <PageHeader title="My business" subtitle="Listings, reputation, and public profile." />

        {loading && <SkeletonCard />}
        {error && <ErrorState message={error} onRetry={load} />}

        {!loading && !error && !business && (
          <EmptyState
            title="No business yet"
            message="Complete onboarding to create your company profile."
            actionLabel="Start onboarding"
            onAction={() => {
              window.location.href = "/onboarding";
            }}
          />
        )}

        {business && (
          <div className="card">
            <div className="profile-head">
              {me?.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={me.logoUrl} alt="" className="profile-logo" />
              ) : (
                <div className="profile-logo" style={{ background: "var(--surface-2)" }} />
              )}
              <div>
                <h2 style={{ margin: 0 }}>
                  {business.dba ?? business.legal_name} <Vetted />
                </h2>
                <p className="muted">
                  {business.metro} · {business.vertical} · {business.status}
                </p>
                {business.reputation_score != null && (
                  <Stars value={business.reputation_score} />
                )}
              </div>
            </div>
            {business.description && <p style={{ marginTop: 16 }}>{business.description}</p>}
            {business.slug && business.status === "approved" && (
              <p style={{ marginTop: 12 }}>
                <Link href={`/v/${business.slug}`}>Public vendor page →</Link>
              </p>
            )}
            {business.status !== "approved" && (
              <p className="muted" style={{ marginTop: 12 }}>
                Your application is under review. Deck access unlocks after approval.
              </p>
            )}

            <h3 style={{ marginTop: 28 }}>Listings</h3>
            {listings.length === 0 ? (
              <p className="muted">No listings yet.</p>
            ) : (
              <ul style={{ paddingLeft: 18 }}>
                {listings.map((listing) => (
                  <li key={listing.id} style={{ marginBottom: 8 }}>
                    <strong>{listing.listing_type}</strong>: {listing.category} ({listing.quantity}{" "}
                    {listing.unit})
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
