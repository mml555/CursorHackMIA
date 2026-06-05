"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Button,
  EmptyState,
  ErrorState,
  PageHeader,
  SkeletonCard,
} from "@/components/reciproca/primitives";

type Business = {
  id: string;
  legal_name: string;
  dba: string | null;
  metro: string;
  vertical: string;
  status: string;
  created_at: string;
};

type Proposal = {
  id: string;
  title: string;
  status: string;
  trade_type: string;
  created_at: string;
};

export function AdminConsole() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [acting, setActing] = useState<string | null>(null);

  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [bizRes, propRes] = await Promise.all([
          fetch("/api/admin/businesses?status=pending"),
          fetch("/api/admin/proposals"),
        ]);
        const bizBody = (await bizRes.json()) as {
          data?: { businesses: Business[] };
          error?: { message?: string };
        };
        const propBody = (await propRes.json()) as {
          data?: { proposals: Proposal[] };
          error?: { message?: string };
        };
        if (!bizRes.ok) {
          throw new Error(bizBody.error?.message ?? "Failed to load businesses");
        }
        if (!propRes.ok) {
          throw new Error(propBody.error?.message ?? "Failed to load proposals");
        }
        if (!cancelled) {
          setBusinesses(bizBody.data?.businesses ?? []);
          setProposals(propBody.data?.proposals ?? []);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load admin data");
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

  const vet = async (id: string, action: "approve" | "reject") => {
    setActing(id);
    try {
      const res = await fetch(`/api/admin/businesses/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const body = (await res.json()) as { error?: { message?: string } };
      if (!res.ok) {
        throw new Error(body.error?.message ?? "Vetting failed");
      }
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Vetting failed");
    } finally {
      setActing(null);
    }
  };

  const publish = async (id: string) => {
    setActing(id);
    try {
      const res = await fetch(`/api/admin/proposals/${id}/publish`, {
        method: "POST",
      });
      const body = (await res.json()) as { error?: { message?: string } };
      if (!res.ok) {
        throw new Error(body.error?.message ?? "Publish failed");
      }
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Publish failed");
    } finally {
      setActing(null);
    }
  };

  return (
    <div className="screen">
      <div className="container page-pad-y">
        <PageHeader
          title="Admin console"
          subtitle="Vet businesses and publish trade proposals."
        />

        <p style={{ marginBottom: 24 }}>
          <Link href="/demo">← Back to demo</Link>
        </p>

        {loading && <SkeletonCard />}
        {error && <ErrorState message={error} onRetry={load} />}

        {!loading && !error && (
          <>
            <h2 style={{ marginBottom: 12 }}>Pending vetting ({businesses.length})</h2>
            {businesses.length === 0 ? (
              <EmptyState title="No pending businesses" message="All caught up." />
            ) : (
              <div className="match-list" style={{ marginBottom: 40 }}>
                {businesses.map((b) => (
                  <div key={b.id} className="card match-card">
                    <strong>{b.dba ?? b.legal_name}</strong>
                    <p className="muted" style={{ fontSize: 13 }}>
                      {b.metro} · {b.vertical}
                    </p>
                    <div className="match-actions" style={{ marginTop: 12 }}>
                      <Button
                        variant="primary"
                        disabled={acting === b.id}
                        onClick={() => vet(b.id, "approve")}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="ghost"
                        disabled={acting === b.id}
                        onClick={() => vet(b.id, "reject")}
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <h2 style={{ marginBottom: 12 }}>Proposals ({proposals.length})</h2>
            <div className="match-list">
              {proposals.map((p) => (
                <div key={p.id} className="card match-card">
                  <strong>{p.title}</strong>
                  <p className="muted" style={{ fontSize: 13 }}>
                    {p.trade_type} · {p.status}
                  </p>
                  {p.status === "draft" && (
                    <Button
                      variant="secondary"
                      style={{ marginTop: 12 }}
                      disabled={acting === p.id}
                      onClick={() => publish(p.id)}
                    >
                      Publish to deck
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
