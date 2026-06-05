import type { MatchBusiness, MatchListing } from "@/lib/matching/types";

export const FIXTURE_BUSINESSES: MatchBusiness[] = [
  {
    id: "biz-pixel",
    legalName: "Pixel Studio",
    metro: "Miami",
    vertical: "local-services",
    reputationScore: 4.2,
    ratingsCount: 5,
    status: "approved",
  },
  {
    id: "biz-brightclean",
    legalName: "BrightClean Co",
    metro: "Miami",
    vertical: "local-services",
    reputationScore: 4.5,
    ratingsCount: 8,
    status: "approved",
  },
  {
    id: "biz-printhub",
    legalName: "PrintHub",
    metro: "Miami",
    vertical: "local-services",
    reputationScore: null,
    ratingsCount: 0,
    status: "approved",
  },
  {
    id: "biz-outside-metro",
    legalName: "Outside Metro LLC",
    metro: "Orlando",
    vertical: "local-services",
    reputationScore: null,
    ratingsCount: 0,
    status: "approved",
  },
];

/**
 * Three businesses forming a closed loop:
 *   Pixel design → BrightClean need (logo design)
 *   BrightClean cleaning → PrintHub need (office cleaning)
 *   PrintHub printing → Pixel need (business cards)
 */
export const FIXTURE_LISTINGS: MatchListing[] = [
  {
    id: "offer-pixel-design",
    businessId: "biz-pixel",
    listingType: "offer",
    category: "Graphic design",
    unit: "hours",
    quantity: 20,
    fmvEstimate: 2000,
    notes: "Brand and social assets",
  },
  {
    id: "need-pixel-printing",
    businessId: "biz-pixel",
    listingType: "need",
    category: "Business card printing",
    unit: "units",
    quantity: 500,
    fmvEstimate: 400,
    notes: null,
  },
  {
    id: "offer-clean-cleaning",
    businessId: "biz-brightclean",
    listingType: "offer",
    category: "Office cleaning",
    unit: "hours",
    quantity: 10,
    fmvEstimate: 750,
    notes: null,
  },
  {
    id: "need-clean-design",
    businessId: "biz-brightclean",
    listingType: "need",
    category: "Logo design",
    unit: "project",
    quantity: 1,
    fmvEstimate: 1500,
    notes: null,
  },
  {
    id: "offer-print-cards",
    businessId: "biz-printhub",
    listingType: "offer",
    category: "Business card printing",
    unit: "units",
    quantity: 500,
    fmvEstimate: 400,
    notes: null,
  },
  {
    id: "need-print-cleaning",
    businessId: "biz-printhub",
    listingType: "need",
    category: "Office cleaning",
    unit: "hours",
    quantity: 8,
    fmvEstimate: 600,
    notes: null,
  },
  {
    id: "offer-outside-web",
    businessId: "biz-outside-metro",
    listingType: "offer",
    category: "Website development",
    unit: "project",
    quantity: 1,
    fmvEstimate: 5000,
    notes: null,
  },
  {
    id: "need-outside-clean",
    businessId: "biz-outside-metro",
    listingType: "need",
    category: "Office cleaning",
    unit: "hours",
    quantity: 5,
    fmvEstimate: 400,
    notes: null,
  },
];

/** Two businesses with a clear 2-way direct barter */
export function directPairFixtures() {
  return {
    businesses: FIXTURE_BUSINESSES.filter((b) =>
      ["biz-brightclean", "biz-printhub"].includes(b.id),
    ),
    listings: [
      {
        ...FIXTURE_LISTINGS.find((l) => l.id === "offer-clean-cleaning")!,
      },
      {
        id: "need-clean-flyers",
        businessId: "biz-brightclean",
        listingType: "need" as const,
        category: "Flyer printing",
        unit: "units",
        quantity: 1000,
        fmvEstimate: 800,
        notes: null,
      },
      FIXTURE_LISTINGS.find((l) => l.id === "offer-print-cards")!,
      {
        id: "need-print-flyers",
        businessId: "biz-printhub",
        listingType: "need" as const,
        category: "Office cleaning",
        unit: "hours",
        quantity: 8,
        fmvEstimate: 600,
        notes: null,
      },
    ],
  };
}

/** Miami-only subset for 3-party cycle tests */
export function miamiFixtures() {
  return {
    businesses: FIXTURE_BUSINESSES.filter((b) => b.metro === "Miami"),
    listings: FIXTURE_LISTINGS.filter((l) =>
      ["biz-pixel", "biz-brightclean", "biz-printhub"].includes(l.businessId),
    ),
  };
}

/** One-way fit: Pixel offers design, NeedsCo wants logo but has nothing Pixel wants */
export function oneWayFixtures() {
  return {
    businesses: [
      FIXTURE_BUSINESSES[0],
      {
        id: "biz-needs-co",
        legalName: "NeedsCo",
        metro: "Miami",
        vertical: "local-services",
        reputationScore: null,
        ratingsCount: 0,
        status: "approved",
      },
    ],
    listings: [
      FIXTURE_LISTINGS.find((l) => l.id === "offer-pixel-design")!,
      FIXTURE_LISTINGS.find((l) => l.id === "need-pixel-printing")!,
      {
        id: "need-needs-logo",
        businessId: "biz-needs-co",
        listingType: "need" as const,
        category: "Logo design",
        unit: "project",
        quantity: 1,
        fmvEstimate: 1200,
        notes: null,
      },
      {
        id: "offer-needs-bookkeeping",
        businessId: "biz-needs-co",
        listingType: "offer" as const,
        category: "Bookkeeping",
        unit: "hours",
        quantity: 10,
        fmvEstimate: 900,
        notes: null,
      },
    ],
  };
}
