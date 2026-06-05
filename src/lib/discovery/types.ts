export type DiscoveryListing = {
  id: string;
  category: string;
  unit: string;
  quantity: number;
  fmv_estimate: number | null;
  notes: string | null;
};

export type DiscoveryPhoto = {
  id: string;
  storage_path: string;
  file_name: string;
  mime_type: string | null;
  caption: string | null;
  sort_order: number;
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
  logo_storage_path: string | null;
  photos: DiscoveryPhoto[];
  reputation_score: number | null;
  ratings_count: number;
  looking_for: DiscoveryListing[];
  offering: DiscoveryListing[];
  primary_looking_for: string | null;
};

export type BusinessProfilePhoto = DiscoveryPhoto & {
  public_url: string;
};

export type BusinessProfile = {
  id: string;
  name: string;
  legalName: string;
  dba: string | null;
  industry: string;
  metro: string | null;
  website: string | null;
  description: string | null;
  logoUrl: string | null;
  photos: BusinessProfilePhoto[];
  offering: DiscoveryListing[];
  lookingFor: DiscoveryListing[];
  trading: string;
  looking: string;
  score: number;
  trades: number;
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

export type MatchFitTier = "excellent" | "strong" | "good" | "fair";

export type DiscoveryMatch = {
  member: DiscoveryMember;
  points: number;
  tier: MatchFitTier;
  tierLabel: string;
  rank: number;
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
