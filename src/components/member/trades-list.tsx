"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  EmptyState,
  ErrorState,
  PageHeader,
  SkeletonCard,
} from "@/components/reciproca/primitives";

type Trade = {
  id: string;
  title: string;
  status: string;
  trade_type: string;
  published_at: string | null;
};

const STATUS_LABEL: Record<string, string> = {
  pending_acceptance: "Pending acceptance",
  matched: "Matched",
  confirmed: "Confirmed",
  in_progress: "In progress",
  completed: "Completed",
  disputed: "Disputed",
};

export function TradesList() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/trades");
        const body = (await res.json()) as {
          data?: { trades: Trade[] };
          error?: { message?: string };
        };
        if (!res.ok) {
          throw new Error(body.error?.message ?? "Failed to load trades");
        }
        if (!cancelled) {
          setTrades(body.data?.trades ?? []);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load trades");
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

  return (
    <div className="screen">
      <div className="container page-pad-y">
        <PageHeader
          title="My trades"
          subtitle="Active proposals and trades your business is party to."
        />

        {loading && <SkeletonCard />}
        {error && <ErrorState message={error} onRetry={load} />}

        {!loading && !error && trades.length === 0 && (
          <EmptyState
            title="No active trades"
            message="Swipe interested on proposals in your deck, or explore matches in the demo."
            actionLabel="Open deck"
            onAction={() => {
              window.location.href = "/deck";
            }}
          />
        )}

        {!loading && !error && trades.length > 0 && (
          <div className="match-list">
            {trades.map((trade) => (
              <Link
                key={trade.id}
                href={`/trades/${trade.id}`}
                className="card match-card"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <div className="match-head">
                  <div>
                    <span className="tag">
                      {trade.trade_type === "multi_party" ? "Multi-party" : "Direct"}
                    </span>
                    <h3 style={{ margin: "8px 0 4px" }}>{trade.title}</h3>
                    <p className="muted" style={{ fontSize: 13 }}>
                      {STATUS_LABEL[trade.status] ?? trade.status}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
