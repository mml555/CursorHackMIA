"use client";

import { useCallback, useEffect, useState } from "react";
import {
  expressDiscoveryInterest,
  fetchDiscoveryRecommendations,
} from "@/lib/discovery/browser-client";
import type { DiscoveryRecommendations } from "@/lib/discovery/types";
import { MatchCard } from "../match-card";
import { ProposeModal } from "../propose-modal";
import { SuccessView } from "../success-view";
import type { Member, Match, Navigate } from "../types";
import {
  DemoBanner,
  EmptyState,
  ErrorState,
  IconCheck,
  PageHeader,
  SkeletonMatchCard,
  Vetted,
} from "../primitives";

export function Matches({ go }: { go: Navigate }) {
  const [modal, setModal] = useState<Member | null>(null);
  const [lastProposed, setLastProposed] = useState<Member | null>(null);
  const [phase, setPhase] = useState<"list" | "success">("list");
  const [toast, setToast] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DiscoveryRecommendations | null>(null);
  const [interestMode, setInterestMode] = useState<"member" | "demo" | null>(
    null,
  );
  const [reloadKey, setReloadKey] = useState(0);

  const retry = useCallback(() => {
    setLoading(true);
    setError(null);
    setReloadKey((k) => k + 1);
  }, []);

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
          setError(err instanceof Error ? err.message : "Failed to load matches");
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

  if (phase === "success") {
    return (
      <div className="screen">
        <div className="container">
          <SuccessView
            demo={interestMode === "demo"}
            onRate={() => {
              if (lastProposed) {
                go("rating", {
                  ratingMember: lastProposed,
                  ratingDemo: interestMode === "demo",
                });
                setPhase("list");
              }
            }}
            onTrades={() => {
              if (interestMode === "demo") {
                setToast(true);
                setTimeout(() => setToast(false), 2600);
                setPhase("list");
              } else {
                window.location.href = "/trades";
              }
            }}
            onBrowse={() => {
              setPhase("list");
              go("network");
            }}
          />
        </div>
        {toast && (
          <div className="toast" role="status">
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
        <div className="container page-relative">
          <PageHeader
            title="Your matches"
            badge={
              <button
                type="button"
                className="progress-pill progress-pill-link"
                onClick={() => go("match-points")}
              >
                <span
                  className="reason-dot"
                  style={{
                    background: "var(--teal)",
                    boxShadow: "0 0 8px var(--teal)",
                  }}
                />
                Match Fit Points · How it works
              </button>
            }
          />

          {data?.focalBusinessName && (
            <DemoBanner businessName={data.focalBusinessName} />
          )}

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
            <div className="match-list" aria-busy="true" aria-label="Loading matches">
              <SkeletonMatchCard />
              <SkeletonMatchCard />
            </div>
          )}

          {error && <ErrorState message={error} onRetry={retry} />}

          {!loading && !error && matches.length === 0 && (
            <EmptyState
              title="No matches yet"
              message="More businesses are joining the network. Browse members or check back soon."
              actionLabel="Browse network"
              onAction={() => go("network")}
            />
          )}

          {!loading && !error && matches.length > 0 && (
            <div className="match-list">
              {matches.map((mt, i) => (
                <MatchCard
                  key={mt.member.id}
                  match={mt}
                  index={i}
                  onPropose={(m) => setModal(m)}
                  onViewProfile={(m) =>
                    go("profile", { businessId: m.id, returnTo: "matches" })
                  }
                />
              ))}
            </div>
          )}
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
            setLastProposed(modal);
            setInterestMode(mode);
            setModal(null);
            setPhase("success");
          }}
        />
      )}
      {toast && (
        <div className="toast" role="status">
          <span className="vetted-dot">
            <IconCheck size={15} stroke="var(--success)" />
          </span>
          Interest recorded. A trade proposal will follow mutual review.
        </div>
      )}
    </div>
  );
}
