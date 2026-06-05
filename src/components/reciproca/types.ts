import type {
  DiscoveryMatch,
  DiscoveryMember,
} from "@/lib/discovery/types";

export type Screen =
  | "landing"
  | "matches"
  | "network"
  | "join"
  | "profile"
  | "match-points"
  | "multi-party"
  | "rating";

export type Member = DiscoveryMember;
export type Match = DiscoveryMatch;

export type Navigate = (
  screen: Screen,
  options?: {
    businessId?: string;
    returnTo?: Screen;
    ratingMember?: Member;
    ratingDemo?: boolean;
  },
) => void;

export type DiscoverySummary = {
  total: number;
  metro: string | null;
  matchCount: number;
};
