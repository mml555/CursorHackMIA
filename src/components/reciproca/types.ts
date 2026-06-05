import type {
  DiscoveryMatch,
  DiscoveryMember,
} from "@/lib/discovery/types";

export type Screen = "landing" | "matches" | "network" | "join" | "profile";

export type Member = DiscoveryMember;
export type Match = DiscoveryMatch;

export type Navigate = (
  screen: Screen,
  options?: { businessId?: string; returnTo?: Screen },
) => void;

export type DiscoverySummary = {
  total: number;
  metro: string | null;
  matchCount: number;
};
