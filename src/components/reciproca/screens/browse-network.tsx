"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchDiscoveryNetwork } from "@/lib/discovery/browser-client";
import { BusinessCard } from "../business-card";
import type { DiscoverySummary, Member, Navigate } from "../types";
import { Button, IconSearch } from "../primitives";

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

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const result = await fetchDiscoveryNetwork({
          metro: summary.metro ?? "Austin",
          industry: filter === "All" ? undefined : filter,
          query: q || undefined,
        });
        if (!cancelled) {
          setMembers(result.members);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load network",
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
  }, [filter, q, summary.metro]);

  const verticals = useMemo(() => {
    const industries = [...new Set(members.map((m) => m.industry))].sort();
    return ["All", ...industries];
  }, [members]);

  const shown = members.slice(0, count);
  const metroLabel = summary.metro ?? "your metro";

  return (
    <div className="screen">
      <div className="container" style={{ paddingTop: 36, paddingBottom: 56 }}>
        <div className="section-head">
          <div>
            <h1 style={{ fontSize: 40, margin: 0 }}>Member Network</h1>
            <p className="muted" style={{ marginTop: 8 }}>
              {summary.total} vetted businesses in {metroLabel}
            </p>
          </div>
          <Button variant="primary" onClick={() => go("join")}>
            List your business
          </Button>
        </div>

        <div className="toolbar">
          <div className="search">
            <IconSearch />
            <input
              placeholder="Search members or services"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setCount(6);
              }}
            />
          </div>
          <div className="pill-row">
            {verticals.map((v) => (
              <button
                key={v}
                type="button"
                className={"filter-pill" + (filter === v ? " active" : "")}
                onClick={() => {
                  setFilter(v);
                  setCount(6);
                }}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {loading && (
          <p className="muted" style={{ textAlign: "center", padding: "48px 0" }}>
            Loading member network…
          </p>
        )}

        {error && (
          <p
            className="muted"
            style={{ textAlign: "center", padding: "48px 0", color: "var(--danger)" }}
          >
            {error}
          </p>
        )}

        <div className="grid">
          {shown.map((m) => (
            <BusinessCard key={m.id} member={m} />
          ))}
        </div>

        {!loading && !error && shown.length === 0 && (
          <p className="muted" style={{ textAlign: "center", padding: "48px 0" }}>
            No members match that filter yet.
          </p>
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
