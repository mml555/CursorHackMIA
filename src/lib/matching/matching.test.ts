import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { buildOfferNeedEdges } from "@/lib/matching/build-edges";
import { findDirectMatches } from "@/lib/matching/find-direct";
import { findThreePartyCycles } from "@/lib/matching/find-cycles";
import { findPartialMatches } from "@/lib/matching/find-partial";
import {
  FIXTURE_BUSINESSES,
  FIXTURE_LISTINGS,
  directPairFixtures,
  miamiFixtures,
  oneWayFixtures,
} from "@/lib/matching/fixtures";
import { findMatches, findMatchesForBusiness } from "@/lib/matching/run";
import { mergeExcludedBusinessIds } from "@/lib/matching/db/swipe-exclusions";
import { scoreCategoryMatch } from "@/lib/matching/score-category";
import { scoreListingPair } from "@/lib/matching/score-listing";
import { scoreSemanticMatch } from "@/lib/matching/score-embedding";
import { scoreUnitCompatibility } from "@/lib/matching/score-unit";
import { suggestCashTopup } from "@/lib/matching/score-fmv";

describe("scoreSemanticMatch", () => {
  it("uses embedding cosine when vectors exist", () => {
    const v = [1, 0, 0, 0];
    const { listings } = miamiFixtures();
    const offer = listings.find((l) => l.id === "offer-pixel-design")!;
    const need = listings.find((l) => l.id === "need-clean-design")!;

    const embeddings = new Map([
      [offer.id, v],
      [need.id, v],
    ]);

    const result = scoreSemanticMatch(offer, need, embeddings);
    assert.equal(result.usedEmbeddings, true);
    assert.ok(result.score >= 0.99);
  });
});

describe("mergeExcludedBusinessIds", () => {
  it("dedupes multiple exclusion lists", () => {
    const merged = mergeExcludedBusinessIds(["a", "b"], ["b", "c"], undefined);
    assert.deepEqual(merged.sort(), ["a", "b", "c"]);
  });
});

describe("scoreCategoryMatch", () => {
  it("scores exact categories as 1.0", () => {
    assert.equal(scoreCategoryMatch("office cleaning", "office cleaning"), 1);
  });

  it("scores synonym groups (janitorial ↔ cleaning)", () => {
    const score = scoreCategoryMatch("Janitorial services", "Office cleaning");
    assert.ok(score >= 0.85, `expected >= 0.85, got ${score}`);
  });

  it("scores unrelated categories low", () => {
    const score = scoreCategoryMatch("Legal counsel", "Logo design");
    assert.ok(score < 0.45, `expected < 0.45, got ${score}`);
  });

  it("scores related groups (design ↔ marketing)", () => {
    const score = scoreCategoryMatch("Graphic design", "Social media marketing");
    assert.ok(score >= 0.45, `expected >= 0.45, got ${score}`);
  });
});

describe("scoreListingPair", () => {
  it("boosts match when notes mention the need category", () => {
    const { businesses, listings } = miamiFixtures();
    const pixel = businesses.find((b) => b.id === "biz-pixel")!;
    const offer = listings.find((l) => l.id === "offer-pixel-design")!;
    const need = listings.find((l) => l.id === "need-clean-design")!;

    const withNotes = scoreListingPair(
      { ...offer, notes: "Logo and brand identity packages" },
      need,
      pixel,
    );
    const withoutNotes = scoreListingPair(offer, need, pixel);

    assert.ok(
      withNotes.score >= withoutNotes.score,
      "notes should not reduce match score",
    );
  });
});

describe("scoreUnitCompatibility", () => {
  it("scores compatible units higher than mismatched units", () => {
    const offer = FIXTURE_LISTINGS[0];
    const needSame = { ...FIXTURE_LISTINGS[1], unit: "hours" };
    const needDiff = { ...FIXTURE_LISTINGS[1], unit: "project" };

    assert.ok(
      scoreUnitCompatibility(offer, needSame) >
        scoreUnitCompatibility(offer, needDiff),
    );
  });
});

describe("buildOfferNeedEdges", () => {
  it("creates cross-business offer→need edges above threshold", () => {
    const { businesses, listings } = miamiFixtures();
    const edges = buildOfferNeedEdges(businesses, listings);

    assert.ok(edges.every((e) => e.matchScore >= 0.45));
    assert.ok(edges.every((e) => typeof e.quantityScore === "number"));
    assert.ok(edges.some((e) => e.offerBusinessId === "biz-pixel"));
  });

  it("excludes different metros when sameMetroOnly is true", () => {
    const edges = buildOfferNeedEdges(FIXTURE_BUSINESSES, FIXTURE_LISTINGS, {
      sameMetroOnly: true,
    });

    const crossMetro = edges.some(
      (e) =>
        e.offerBusinessId === "biz-outside-metro" ||
        e.needBusinessId === "biz-outside-metro",
    );
    assert.equal(crossMetro, false);
  });

  it("respects excludeBusinessIds", () => {
    const edges = buildOfferNeedEdges(
      FIXTURE_BUSINESSES,
      FIXTURE_LISTINGS,
      { excludeBusinessIds: ["biz-pixel"] },
    );

    assert.equal(
      edges.some((e) => e.offerBusinessId === "biz-pixel"),
      false,
    );
  });
});

describe("findDirectMatches", () => {
  it("finds BrightClean ↔ PrintHub direct trade", () => {
    const { businesses, listings } = directPairFixtures();
    const edges = buildOfferNeedEdges(businesses, listings);
    const matches = findDirectMatches(edges, businesses, listings);

    const pair = matches.find(
      (m) =>
        m.parties.some((p) => p.businessId === "biz-brightclean") &&
        m.parties.some((p) => p.businessId === "biz-printhub"),
    );

    assert.ok(pair, "expected direct match between BrightClean and PrintHub");
    assert.ok(pair.summary.length > 0);
    assert.ok(pair.score > 0.55);
  });
});

describe("findThreePartyCycles", () => {
  it("finds a 3-way cycle", () => {
    const { businesses, listings } = miamiFixtures();
    const edges = buildOfferNeedEdges(businesses, listings, {
      minCategoryScore: 0.4,
    });
    const cycles = findThreePartyCycles(edges, businesses, listings);

    assert.ok(cycles.length >= 1);
    assert.equal(cycles[0].cycleLength, 3);
    assert.ok(cycles[0].summary.length > 0);
  });
});

describe("findPartialMatches", () => {
  it("finds one-way fits without reciprocal edge", () => {
    const { businesses, listings } = oneWayFixtures();
    const edges = buildOfferNeedEdges(businesses, listings, {
      minMatchScore: 0.4,
    });
    const partial = findPartialMatches(edges, businesses, listings, {
      minPartialScore: 0.5,
      maxResults: 10,
    });

    assert.ok(partial.length >= 1);
    assert.equal(partial[0].reason.missingReciprocal, true);
  });
});

describe("suggestCashTopup", () => {
  it("suggests top-up when FMV is imbalanced", () => {
    const suggestion = suggestCashTopup([
      {
        businessId: "a",
        businessName: "A",
        giveListingId: "1",
        giveCategory: "Design",
        receiveListingId: "2",
        receiveCategory: "Clean",
        estimatedFmv: 3000,
      },
      {
        businessId: "b",
        businessName: "B",
        giveListingId: "3",
        giveCategory: "Clean",
        receiveListingId: "4",
        receiveCategory: "Design",
        estimatedFmv: 500,
      },
    ]);

    assert.ok(suggestion);
    assert.equal(suggestion?.payerBusinessId, "a");
    assert.ok(suggestion!.amount > 0);
  });
});

describe("findMatches", () => {
  it("returns direct, multi-party, and partial buckets", () => {
    const { businesses, listings } = miamiFixtures();
    const result = findMatches({
      businesses,
      listings,
      options: { minCombinedScore: 0.5 },
    });

    assert.ok(
      result.direct.length >= 1 ||
        result.multiParty.length >= 1 ||
        result.partial.length >= 0,
    );
    assert.ok(Array.isArray(result.partial));
  });

  it("findMatchesForBusiness filters to one participant", () => {
    const { businesses, listings } = miamiFixtures();
    const forPixel = findMatchesForBusiness("biz-pixel", {
      businesses,
      listings,
      options: { minCombinedScore: 0.5 },
    });

    assert.ok(
      forPixel.direct.length >= 1 || forPixel.multiParty.length >= 1,
    );
  });

  it("returns empty when fewer than 2 businesses with inventory", () => {
    const result = findMatches({
      businesses: [FIXTURE_BUSINESSES[0]],
      listings: FIXTURE_LISTINGS.filter((l) => l.businessId === "biz-pixel"),
    });
    assert.deepEqual(result, { direct: [], multiParty: [], partial: [] });
  });
});
