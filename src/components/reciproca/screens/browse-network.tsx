"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchDiscoveryNetwork } from "@/lib/discovery/browser-client";
import { BusinessCard } from "../business-card";
import type { DiscoverySummary, Member, Navigate } from "../types";
import {
  Button,
  EmptyState,
  ErrorState,
  IconSearch,
  PageHeader,
  SkeletonCard,
} from "../primitives";

export function BrowseNetwork({
  go,
  summary,
}: {
  go: Navigate;
  summary: DiscoverySummary;
}) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("All");
  const [q, setQ] = useState("");
  const [count, setCount] = useState(6);
  const [reloadKey, setReloadKey] = useState(0);

  const metro = summary.metro ?? "Austin";

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const result = await fetchDiscoveryNetwork({
          metro,
          industry: filter === "All" ? undefined : filter,
          query: q || undefined,
        });
        if (!cancelled) {
          setMembers(result.members);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load network");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [metro, filter, q, reloadKey]);

  const verticals = useMemo(() => {
    const industries = [...new Set(members.map((m) => m.industry))].sort();
    return ["All", ...industries];
  }, [members]);

  const shown = members.slice(0, count);
  const metroLabel = summary.metro ?? "your metro";

  const retry = () => {
    setLoading(true);
    setError(null);
    setReloadKey((k) => k + 1);
  };

  return (
    <div className="screen">
      <div className="container page-pad-y">
        <PageHeader
          title="Member Network"
          subtitle={`${summary.total} vetted businesses in ${metroLabel}`}
          action={
            <Button variant="primary" onClick={() => go("join")}>
              List your business
            </Button>
          }
        />

        <div className="toolbar">
          <div className="search">
            <IconSearch />
            <input
              placeholder="Search members or services"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setCount(6);
                setLoading(true);
              }}
              aria-label="Search members or services"
            />
          </div>
          <div className="pill-row" role="tablist" aria-label="Filter by industry">
            {verticals.map((v) => (
              <button
                key={v}
                type="button"
                role="tab"
                aria-selected={filter === v}
                className={"filter-pill" + (filter === v ? " active" : "")}
                onClick={() => {
                  setFilter(v);
                  setCount(6);
                  setLoading(true);
                }}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {loading && (
          <div className="grid" aria-busy="true" aria-label="Loading members">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        )}

        {error && <ErrorState message={error} onRetry={retry} />}

        {!loading && !error && (
          <div className="grid">
            {shown.map((m) => (
              <BusinessCard
                key={m.id}
                member={m}
                onView={(member) =>
                  go("profile", { businessId: member.id, returnTo: "network" })
                }
              />
            ))}
          </div>
        )}

        {!loading && !error && shown.length === 0 && (
          <EmptyState
            title="No members found"
            message="Try a different search or clear your industry filter."
            actionLabel="Show all"
            onAction={() => {
              setFilter("All");
              setQ("");
              setLoading(true);
            }}
          />
        )}

        {!loading && count < members.length && (
          <div className="loadmore">
            <Button variant="secondary" onClick={() => setCount((c) => c + 6)}>
              Load more members
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
