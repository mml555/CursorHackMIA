export type DiscoveryListing = {
  id: string;
  category: string;
  unit: string;
  quantity: number;
  fmv_estimate: number | null;
  notes: string | null;
};

export type DiscoveryCard = {
  business_id: string;
  company_name: string;
  legal_name: string;
  dba: string | null;
  industry: string;
  metro: string | null;
  website: string | null;
  description: string | null;
  reputation_score: number | null;
  ratings_count: number;
  looking_for: DiscoveryListing[];
  offering: DiscoveryListing[];
  primary_looking_for: string | null;
};

export type DiscoveryStats = {
  total: number;
  metro: string | null;
  industries: string[];
};

export type DiscoveryMember = {
  id: string;
  name: string;
  industry: string;
  trading: string;
  looking: string;
  score: number;
  trades: number;
};

export type DiscoveryMatch = {
  member: DiscoveryMember;
  pct: number;
  top?: boolean;
  reason: string;
};

export type DiscoveryRecommendations = {
  focalBusinessId: string;
  focalBusinessName: string;
  offering: string;
  looking: string;
  matches: DiscoveryMatch[];
};
