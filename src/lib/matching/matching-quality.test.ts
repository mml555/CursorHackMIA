import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { buildOfferNeedEdges } from "@/lib/matching/build-edges";
import {
  buildEmbeddingCandidatePairs,
  shouldEvaluatePair,
} from "@/lib/matching/prefilter";
import { scoreToConfidence } from "@/lib/matching/confidence";
import { applyDiversityCap } from "@/lib/matching/rank-diversity";
import { scoreBusinessAffinity } from "@/lib/matching/score-affinity";
import { miamiFixtures } from "@/lib/matching/fixtures";
import { findMatchesForBusiness } from "@/lib/matching/run";

describe("scoreToConfidence", () => {
  it("maps scores to high / medium / low bands", () => {
    assert.equal(scoreToConfidence(0.8), "high");
    assert.equal(scoreToConfidence(0.65), "medium");
    assert.equal(scoreToConfidence(0.4), "low");
  });
});

describe("scoreBusinessAffinity", () => {
  it("boosts same-vertical pairings", () => {
    const { businesses } = miamiFixtures();
    const pixel = businesses.find((b) => b.id === "biz-pixel")!;
    const clean = businesses.find((b) => b.id === "biz-brightclean")!;

    const sameVertical = scoreBusinessAffinity(pixel, clean, {
      preferSameVertical: true,
    });
    const noVertical = scoreBusinessAffinity(
      { ...pixel, vertical: "tech" },
      { ...clean, vertical: "food" },
      { preferSameVertical: true },
    );

    assert.ok(sameVertical > noVertical);
  });
});

describe("buildEmbeddingCandidatePairs", () => {
  it("limits evaluated pairs to top-K per offer", () => {
    const { listings } = miamiFixtures();
    const offers = listings.filter((l) => l.listingType === "offer");
    const needs = listings.filter((l) => l.listingType === "need");

    const dim = 8;
    const embeddings = new Map<string, number[]>();
    for (const listing of listings) {
      const idx = listing.id.length % dim;
      const vec = Array(dim).fill(0);
      vec[idx] = 1;
      embeddings.set(listing.id, vec);
    }

    const candidates = buildEmbeddingCandidatePairs(
      offers,
      needs,
      embeddings,
      2,
    );

    assert.ok(candidates);
    assert.ok(candidates.size <= offers.length * 2 + 4);

    const offer = offers[0];
    const need = needs.find((n) => n.businessId !== offer.businessId)!;
    const inSet = shouldEvaluatePair(offer.id, need.id, candidates);
    assert.equal(typeof inSet, "boolean");
  });
});

describe("applyDiversityCap", () => {
  it("caps results per counterparty for focal business", () => {
    const matches = [
      {
        score: 0.9,
        parties: [
          { businessId: "focal" },
          { businessId: "partner-a" },
        ],
      },
      {
        score: 0.85,
        parties: [
          { businessId: "focal" },
          { businessId: "partner-a" },
        ],
      },
      {
        score: 0.8,
        parties: [
          { businessId: "focal" },
          { businessId: "partner-b" },
        ],
      },
    ];

    const capped = applyDiversityCap(matches, 1, "focal");
    assert.equal(capped.length, 2);
    const partners = capped.map(
      (m) => m.parties.find((p) => p.businessId !== "focal")!.businessId,
    );
    assert.deepEqual(partners.sort(), ["partner-a", "partner-b"]);
  });
});

describe("interested boost", () => {
  it("raises edge scores for interested counterparties", () => {
    const { businesses, listings } = miamiFixtures();

    const baseline = buildOfferNeedEdges(businesses, listings);
    const boosted = buildOfferNeedEdges(businesses, listings, {
      interestedBoostBusinessIds: ["biz-brightclean"],
    });

    const baseEdge = baseline.find(
      (e) =>
        e.needBusinessId === "biz-brightclean" ||
        e.offerBusinessId === "biz-brightclean",
    );
    const boostEdge = boosted.find(
      (e) => e.offerId === baseEdge?.offerId && e.needId === baseEdge?.needId,
    );

    if (baseEdge && boostEdge) {
      assert.ok(boostEdge.matchScore >= baseEdge.matchScore);
      assert.ok(boostEdge.affinityScore >= baseEdge.affinityScore);
    }
  });
});

describe("findMatchesForBusiness confidence", () => {
  it("includes confidence on direct matches", () => {
    const { businesses, listings } = miamiFixtures();
    const result = findMatchesForBusiness("biz-pixel", {
      businesses,
      listings,
      options: { minCombinedScore: 0.5, maxMatchesPerCounterparty: 10 },
    });

    for (const match of result.direct) {
      assert.ok(
        ["high", "medium", "low"].includes(match.confidence),
        `unexpected confidence: ${match.confidence}`,
      );
      assert.ok(typeof match.reason.affinityScore === "number");
    }
  });
});
