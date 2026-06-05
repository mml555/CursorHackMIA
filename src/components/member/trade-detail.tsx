"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Button,
  ErrorState,
  PageHeader,
  SkeletonCard,
} from "@/components/reciproca/primitives";

type TradeDetail = {
  proposal: {
    id: string;
    title: string;
    summary: string | null;
    status: string;
    trade_type: string;
  };
  parties: Array<{
    business_id: string;
    give_lines: unknown;
    receive_lines: unknown;
    business: { legal_name: string; dba: string | null } | null;
  }>;
  invoices: Array<{ id: string; storage_path: string | null }>;
};

export function TradeDetailView({ tradeId }: { tradeId: string }) {
  const [detail, setDetail] = useState<TradeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [acting, setActing] = useState(false);
  const [taxAck, setTaxAck] = useState(false);
  const [rating, setRating] = useState(5);
  const [ratedId, setRatedId] = useState<string>("");

  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(`/api/trades/${tradeId}`);
        const body = (await res.json()) as {
          data?: TradeDetail;
          error?: { message?: string };
        };
        if (!res.ok) {
          throw new Error(body.error?.message ?? "Failed to load trade");
        }
        if (!cancelled) {
          setDetail(body.data ?? null);
          const other = body.data?.parties.find((p) => p.business)?.business_id;
          if (other) setRatedId(other);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load trade");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [tradeId, reloadKey]);

  const load = () => {
    setLoading(true);
    setError(null);
    setReloadKey((k) => k + 1);
  };

  const action = async (path: string, payload?: Record<string, unknown>) => {
    setActing(true);
    setError(null);
    try {
      const res = await fetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload ?? { proposalId: tradeId }),
      });
      const body = (await res.json()) as { error?: { message?: string } };
      if (!res.ok) {
        throw new Error(body.error?.message ?? "Action failed");
      }
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed");
    } finally {
      setActing(false);
    }
  };

  const status = detail?.proposal.status;

  return (
    <div className="screen">
      <div className="container page-pad-y">
        <p style={{ marginBottom: 16 }}>
          <Link href="/trades">← Back to trades</Link>
        </p>

        {loading && <SkeletonCard />}
        {error && <ErrorState message={error} onRetry={load} />}

        {detail && (
          <>
            <PageHeader title={detail.proposal.title} subtitle={detail.proposal.summary ?? undefined} />
            <p className="tag" style={{ display: "inline-block", marginBottom: 20 }}>
              Status: {detail.proposal.status.replace(/_/g, " ")}
            </p>

            {detail.parties.map((party) => (
              <div key={party.business_id} className="card" style={{ marginBottom: 12 }}>
                <strong>{party.business?.dba ?? party.business?.legal_name}</strong>
              </div>
            ))}

            <div className="match-actions" style={{ marginTop: 24, flexWrap: "wrap" }}>
              {status === "pending_acceptance" && (
                <>
                  <label style={{ display: "flex", gap: 8, alignItems: "center", width: "100%" }}>
                    <input
                      type="checkbox"
                      checked={taxAck}
                      onChange={(e) => setTaxAck(e.target.checked)}
                    />
                    I understand barter may be taxable income.
                  </label>
                  <Button
                    variant="primary"
                    disabled={acting || !taxAck}
                    onClick={() => action("/api/trades/accept", { proposalId: tradeId, taxAcknowledged: true })}
                  >
                    Confirm match
                  </Button>
                </>
              )}
              {status === "matched" && (
                <Button variant="primary" disabled={acting} onClick={() => action("/api/trades/confirm")}>
                  Confirm terms
                </Button>
              )}
              {status === "confirmed" && (
                <Button variant="primary" disabled={acting} onClick={() => action("/api/trades/start")}>
                  Start trade
                </Button>
              )}
              {status === "in_progress" && (
                <Button variant="primary" disabled={acting} onClick={() => action("/api/trades/complete")}>
                  Mark complete
                </Button>
              )}
              {status === "completed" && (
                <div style={{ width: "100%" }}>
                  <p className="muted" style={{ marginBottom: 8 }}>Rate your counterparty</p>
                  <select
                    value={ratedId}
                    onChange={(e) => setRatedId(e.target.value)}
                    style={{ marginBottom: 8, width: "100%" }}
                  >
                    {detail.parties.map((p) => (
                      <option key={p.business_id} value={p.business_id}>
                        {p.business?.dba ?? p.business?.legal_name}
                      </option>
                    ))}
                  </select>
                  <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setRating(n)}
                        style={{
                          padding: "8px 12px",
                          borderRadius: 8,
                          border: rating === n ? "2px solid var(--teal)" : "1px solid var(--hairline)",
                          background: "transparent",
                          cursor: "pointer",
                        }}
                      >
                        {n}★
                      </button>
                    ))}
                  </div>
                  <Button
                    variant="primary"
                    disabled={acting || !ratedId}
                    onClick={() =>
                      action("/api/trades/rate", {
                        tradeId,
                        ratedBusinessId: ratedId,
                        score: rating,
                        tags: ["quality", "timeliness"],
                      })
                    }
                  >
                    Submit rating
                  </Button>
                </div>
              )}
              {["matched", "confirmed", "in_progress"].includes(status ?? "") && (
                <Button variant="ghost" disabled={acting} onClick={() => action("/api/trades/dispute")}>
                  Open dispute
                </Button>
              )}
            </div>

            {detail.invoices.length > 0 && (
              <div style={{ marginTop: 24 }}>
                <h3>Invoice records</h3>
                <p className="muted" style={{ fontSize: 13 }}>
                  {detail.invoices.length} invoice record(s) generated for tax records.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
