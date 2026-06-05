import type { Match, Member } from "../types";

export const MEMBERS: Member[] = [
  {
    id: "sunrise",
    name: "Sunrise Yoga Studio",
    industry: "Wellness",
    trading: "60-minute yoga classes, 4x/month",
    looking: "Brand photography",
    score: 4.9,
    trades: 24,
  },
  {
    id: "luminary",
    name: "Luminary Studio",
    industry: "Photography",
    trading: "Brand & product photography",
    looking: "Team wellness sessions",
    score: 4.8,
    trades: 31,
  },
  {
    id: "verde",
    name: "Verde Social",
    industry: "Social agency",
    trading: "Social management + reach",
    looking: "Studio video content",
    score: 4.7,
    trades: 19,
  },
  {
    id: "hill",
    name: "Hill Country Massage",
    industry: "Wellness",
    trading: "Massage therapy hours",
    looking: "Monthly bookkeeping",
    score: 4.6,
    trades: 12,
  },
  {
    id: "lonestar",
    name: "Lone Star Bookkeeping",
    industry: "Finance",
    trading: "Monthly bookkeeping",
    looking: "Marketing",
    score: 4.9,
    trades: 28,
  },
  {
    id: "atx",
    name: "ATX Web Co",
    industry: "Web design",
    trading: "Web design & build",
    looking: "Office wellness program",
    score: 4.5,
    trades: 9,
  },
];

export const MATCHES: Match[] = [
  {
    member: MEMBERS[1],
    pct: 94,
    top: true,
    reason:
      "Luminary Studio offers brand photography for small businesses and needs weekly wellness sessions for a team of 6. Your class format and their session format match in value and frequency.",
  },
  {
    member: MEMBERS[2],
    pct: 81,
    reason:
      "Verde Social manages social for local studios and wants recurring on-site classes for their team. A 4x/month cadence covers their wellness budget without cash.",
  },
  {
    member: MEMBERS[5],
    pct: 76,
    reason:
      "ATX Web Co is building an office wellness program and offers web design in return. Their need maps to your class offering, though session volume needs alignment.",
  },
  {
    member: MEMBERS[3],
    pct: 68,
    reason:
      "Hill Country Massage trades therapy hours and could co-bundle a wellness package, but the direct value overlap with your offer is partial.",
  },
];
