"use client";

import { useEffect, useState } from "react";
import {
  expressDiscoveryInterest,
  fetchDiscoveryRecommendations,
} from "@/lib/discovery/browser-client";
import type { DiscoveryRecommendations } from "@/lib/discovery/types";
import { MatchCard } from "../match-card";
import { ProposeModal } from "../propose-modal";
import { SuccessView } from "../success-view";
import type { Member, Match, Navigate } from "../types";
import { IconCheck, Vetted } from "../primitives";

export function Matches({ go }: { go: Navigate }) {
  const [modal, setModal] = useState<Member | null>(null);
  const [phase, setPhase] = useState<"list" | "success">("list");
  const [toast, setToast] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DiscoveryRecommendations | null>(null);
  const [interestMode, setInterestMode] = useState<"member" | "demo" | null>(
    null,
  );

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const recommendations = await fetchDiscoveryRecommendations();
        if (!cancelled) {
          setData(recommendations);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load matches",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (phase === "success") {
    return (
      <div className="screen">
        <div className="container">
          <SuccessView
            demo={interestMode === "demo"}
            onTrades={() => {
              setToast(true);
              setTimeout(() => setToast(false), 2600);
              setPhase("list");
            }}
            onBrowse={() => {
              setPhase("list");
              go("network");
            }}
          />
        </div>
        {toast && (
          <div className="toast">
            <span className="vetted-dot">
              <IconCheck size={15} stroke="var(--success)" />
            </span>
            Interest recorded. A trade proposal will follow mutual review.
          </div>
        )}
      </div>
    );
  }

  const matches: Match[] = data?.matches ?? [];

  return (
    <div className="screen">
      <div className="matches-wrap">
        <div className="matches-glow" />
        <div className="container" style={{ position: "relative" }}>
          <div className="section-head" style={{ marginBottom: 20 }}>
            <h1 style={{ fontSize: 40, margin: 0 }}>Your matches</h1>
            <span className="progress-pill">
              <span
                className="reason-dot"
                style={{
                  background: "var(--teal)",
                  boxShadow: "0 0 8px var(--teal)",
                }}
              />
              AI-ranked by fit
            </span>
          </div>

          <div className="summary">
            <div className="cell">
              <div className="k">Offering</div>
              <div className="v">{data?.offering ?? "—"}</div>
            </div>
            <div className="cell">
              <div className="k">Looking for</div>
              <div className="v">{data?.looking ?? "—"}</div>
            </div>
            <div className="cell">
              <Vetted />
            </div>
          </div>

          {loading && (
            <p className="muted" style={{ padding: "32px 0" }}>
              Loading matches from the network…
            </p>
          )}

          {error && (
            <p className="muted" style={{ padding: "32px 0", color: "var(--danger)" }}>
              {error}
            </p>
          )}

          {!loading && !error && matches.length === 0 && (
            <p className="muted" style={{ padding: "32px 0" }}>
              No matches yet. Check back after more businesses join the network.
            </p>
          )}

          <div className="match-list">
            {matches.map((mt, i) => (
              <MatchCard
                key={mt.member.id}
                match={mt}
                index={i}
                onPropose={(m) => setModal(m)}
              />
            ))}
          </div>
        </div>
      </div>

      {modal && (
        <ProposeModal
          member={modal}
          offeringDefault={data?.offering}
          onClose={() => setModal(null)}
          onSend={async () => {
            if (!modal) return;
            const mode = await expressDiscoveryInterest(modal.id);
            setInterestMode(mode);
            setModal(null);
            setPhase("success");
          }}
        />
      )}
      {toast && (
        <div className="toast">
          <span className="vetted-dot">
            <IconCheck size={15} stroke="var(--success)" />
          </span>
          Interest recorded. A trade proposal will follow mutual review.
        </div>
      )}
    </div>
  );
}
