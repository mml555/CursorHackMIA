"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Button,
  EmptyState,
  ErrorState,
  PageHeader,
  SkeletonCard,
  Vetted,
} from "@/components/reciproca/primitives";

type TradeLine = {
  description: string;
  quantity?: number;
  unit?: string;
  fmv?: number;
};

type Party = {
  business_id: string;
  give_lines: TradeLine[];
  receive_lines: TradeLine[];
  businesses?: { legal_name: string; dba: string | null; reputation_score: number | null } | null;
};

type Proposal = {
  id: string;
  title: string;
  summary: string | null;
  trade_type: string;
  status: string;
  cash_topup_display: number | null;
  proposal_parties: Party[];
};

function linesText(lines: TradeLine[]): string {
  return lines.map((l) => l.description).join(", ");
}

export function DeckView() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [acting, setActing] = useState(false);

  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/deck");
        const body = (await res.json()) as {
          data?: { proposals: Proposal[] };
          error?: { message?: string };
        };
        if (!res.ok) {
          throw new Error(body.error?.message ?? "Failed to load deck");
        }
        if (!cancelled) {
          setProposals(body.data?.proposals ?? []);
          setIndex(0);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load deck");
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

  const swipe = async (action: "interested" | "pass" | "save") => {
    const current = proposals[index];
    if (!current || acting) return;
    setActing(true);
    try {
      const res = await fetch("/api/deck", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proposalId: current.id, action }),
      });
      const body = (await res.json()) as { error?: { message?: string } };
      if (!res.ok) {
        throw new Error(body.error?.message ?? "Swipe failed");
      }
      setProposals((prev) => prev.filter((p) => p.id !== current.id));
      setIndex(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Swipe failed");
    } finally {
      setActing(false);
    }
  };

  const current = proposals[index];

  return (
    <div className="screen">
      <div className="container page-pad-y">
        <PageHeader
          title="Proposal deck"
          subtitle="Swipe on concrete trade proposals curated for your business."
        />

        {loading && <SkeletonCard />}
        {error && <ErrorState message={error} onRetry={load} />}

        {!loading && !error && !current && (
          <EmptyState
            title="No proposals right now"
            message="We're building trades for you. Check back soon or browse the network."
            actionLabel="Open demo"
            onAction={() => {
              window.location.href = "/demo";
            }}
          />
        )}

        {current && (
          <div className="card match-card" style={{ maxWidth: 640, margin: "0 auto" }}>
            <div className="match-head" style={{ marginBottom: 16 }}>
              <div>
                <span className="tag">{current.trade_type === "multi_party" ? "3-way trade" : "Direct trade"}</span>
                <h2 style={{ margin: "8px 0 4px", fontSize: 22 }}>{current.title}</h2>
                {current.summary && <p className="muted">{current.summary}</p>}
              </div>
              <Vetted />
            </div>

            {current.proposal_parties.map((party) => {
              const name =
                party.businesses?.dba ?? party.businesses?.legal_name ?? "Business";
              return (
                <div key={party.business_id} className="cell" style={{ marginBottom: 12 }}>
                  <div className="k">{name}</div>
                  <div className="biz-line">
                    <span className="k">Gives</span> <span className="v">{linesText(party.give_lines as TradeLine[])}</span>
                  </div>
                  <div className="biz-line">
                    <span className="k">Gets</span> <span className="v">{linesText(party.receive_lines as TradeLine[])}</span>
                  </div>
                </div>
              );
            })}

            {current.cash_topup_display != null && current.cash_topup_display > 0 && (
              <p className="muted" style={{ fontSize: 13 }}>
                Cash top-up (display): ${current.cash_topup_display}
              </p>
            )}

            <div className="match-actions" style={{ marginTop: 20 }}>
              <Button variant="ghost" block disabled={acting} onClick={() => swipe("pass")}>
                Pass
              </Button>
              <Button variant="secondary" block disabled={acting} onClick={() => swipe("save")}>
                Save
              </Button>
              <Button variant="primary" block disabled={acting} onClick={() => swipe("interested")}>
                Interested
              </Button>
            </div>
            <p style={{ textAlign: "center", marginTop: 12, fontSize: 13 }}>
              <Link href={`/trades/${current.id}`}>View full terms →</Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
