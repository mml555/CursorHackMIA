export type Screen = "landing" | "matches" | "network" | "join";

export type Member = {
  id: string;
  name: string;
  industry: string;
  trading: string;
  looking: string;
  score: number;
  trades: number;
};

export type Match = {
  member: Member;
  pct: number;
  top?: boolean;
  reason: string;
};

export type Navigate = (screen: Screen) => void;
