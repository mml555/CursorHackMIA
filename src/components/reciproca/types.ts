import type {
  DiscoveryMatch,
  DiscoveryMember,
} from "@/lib/discovery/types";

export type Screen = "landing" | "matches" | "network" | "join";

export type Member = DiscoveryMember;
export type Match = DiscoveryMatch;

export type Navigate = (screen: Screen) => void;

export type DiscoverySummary = {
  total: number;
  metro: string | null;
  matchCount: number;
};
