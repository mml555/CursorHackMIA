"use client";

import { useEffect, useState } from "react";
import {
  fetchDiscoveryRecommendations,
  fetchDiscoveryStats,
} from "@/lib/discovery/browser-client";
import type { DiscoverySummary } from "./types";

export function useDiscoveryStats(metro = "Austin") {
  const [summary, setSummary] = useState<DiscoverySummary>({
    total: 0,
    metro,
    matchCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [stats, recommendations] = await Promise.all([
          fetchDiscoveryStats(metro),
          fetchDiscoveryRecommendations(),
        ]);

        if (!cancelled) {
          setSummary({
            total: stats.total,
            metro: stats.metro ?? metro,
            matchCount: recommendations.matches.length,
          });
        }
      } catch {
        if (!cancelled) {
          setSummary({ total: 0, metro, matchCount: 0 });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [metro]);

  return { summary, loading };
}
