"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  EmptyState,
  ErrorState,
  SkeletonCard,
  Stars,
  Vetted,
} from "@/components/reciproca/primitives";

type VendorData = {
  business: {
    legal_name: string;
    dba: string | null;
    metro: string;
    vertical: string;
    description: string | null;
    reputation_score: number | null;
    ratings_count: number;
    website: string | null;
  };
  logoUrl: string | null;
  listings: Array<{
    listing_type: string;
    category: string;
    quantity: number;
    unit: string;
    notes: string | null;
  }>;
};

export function PublicVendor({ slug }: { slug: string }) {
  const [data, setData] = useState<VendorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(`/api/vendors/${encodeURIComponent(slug)}`);
        const body = (await res.json()) as {
          data?: VendorData;
          error?: { message?: string };
        };
        if (!res.ok) {
          throw new Error(body.error?.message ?? "Vendor not found");
        }
        if (!cancelled) {
          setData(body.data ?? null);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load vendor");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [slug, reloadKey]);

  const load = () => {
    setLoading(true);
    setError(null);
    setReloadKey((k) => k + 1);
  };

  const business = data?.business;
  const offers = data?.listings.filter((l) => l.listing_type === "offer") ?? [];
  const needs = data?.listings.filter((l) => l.listing_type === "need") ?? [];

  return (
    <div className="app">
      <div className="screen">
        <div className="container page-pad-y">
          <p style={{ marginBottom: 16 }}>
            <Link href="/demo">← Explore network</Link>
          </p>

          {loading && <SkeletonCard />}
          {error && <ErrorState message={error} onRetry={load} />}

          {!loading && !error && !business && (
            <EmptyState title="Vendor not found" message="This business may not be approved yet." />
          )}

          {business && (
            <div className="card">
              <div className="profile-head">
                {data?.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={data.logoUrl} alt="" className="profile-logo" />
                ) : (
                  <div className="profile-logo" style={{ background: "var(--surface-2)" }} />
                )}
                <div>
                  <h1 style={{ margin: 0, fontSize: 28 }}>
                    {business.dba ?? business.legal_name} <Vetted />
                  </h1>
                  <p className="muted">
                    {business.metro} · {business.vertical}
                  </p>
                  {business.reputation_score != null && (
                    <Stars value={business.reputation_score} />
                  )}
                </div>
              </div>
              {business.description && <p style={{ marginTop: 16 }}>{business.description}</p>}
              {business.website && (
                <p style={{ marginTop: 8 }}>
                  <a href={business.website} target="_blank" rel="noopener noreferrer">
                    {business.website}
                  </a>
                </p>
              )}

              <section className="profile-section" style={{ marginTop: 28 }}>
                <h2 className="profile-section-title">Offers</h2>
                {offers.length === 0 ? (
                  <p className="muted">No offers listed.</p>
                ) : (
                  <ul>
                    {offers.map((l, i) => (
                      <li key={i}>
                        {l.category} — {l.quantity} {l.unit}
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section className="profile-section">
                <h2 className="profile-section-title">Needs</h2>
                {needs.length === 0 ? (
                  <p className="muted">No needs listed.</p>
                ) : (
                  <ul>
                    {needs.map((l, i) => (
                      <li key={i}>
                        {l.category} — {l.quantity} {l.unit}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
