import {
  backendRequest,
  backendRequestOptionalAuth,
  backendRequestPublic,
} from "@/lib/backend/client";
import { requireUserId } from "@/lib/clerk/auth";
import type {
  DiscoveryRecommendations,
  DiscoveryStats,
} from "@/lib/discovery/types";

type DiscoveryNetworkResponse = {
  members: import("@/lib/discovery/types").DiscoveryMember[];
};

type DiscoverySwipeResponse = {
  swipe: unknown;
  demo?: boolean;
};

export function fetchDiscoveryNetwork(searchParams: URLSearchParams) {
  const query = searchParams.toString();
  const path = query ? `/discovery/network?${query}` : "/discovery/network";
  return backendRequestPublic<DiscoveryNetworkResponse>(path);
}

export function fetchDiscoveryStats(searchParams: URLSearchParams) {
  const query = searchParams.toString();
  const path = query ? `/discovery/stats?${query}` : "/discovery/stats";
  return backendRequestPublic<DiscoveryStats>(path);
}

export function fetchDiscoveryRecommendations() {
  return backendRequestOptionalAuth<DiscoveryRecommendations>(
    "/discovery/recommendations",
  );
}

export function submitDemoInterest(targetBusinessId: string) {
  return backendRequestPublic<DiscoverySwipeResponse>(
    "/discovery/demo-interest",
    {
      method: "POST",
      body: JSON.stringify({ targetBusinessId }),
    },
  );
}

export async function submitDiscoverySwipe(input: {
  targetBusinessId: string;
  action: "interested" | "pass" | "save";
}) {
  await requireUserId();
  return backendRequest<DiscoverySwipeResponse>("/discovery/swipe", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function fetchDiscoveryMatches() {
  await requireUserId();
  return backendRequest<DiscoveryNetworkResponse>("/discovery/matches");
}
