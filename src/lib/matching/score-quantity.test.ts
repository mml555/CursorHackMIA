import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { scoreQuantityFit } from "@/lib/matching/score-quantity";
import type { MatchListing } from "@/lib/matching/types";

const base = (overrides: Partial<MatchListing>): MatchListing => ({
  id: "l1",
  businessId: "b1",
  listingType: "offer",
  category: "Cleaning",
  unit: "hours",
  quantity: 10,
  fmvEstimate: 500,
  notes: null,
  ...overrides,
});

describe("scoreQuantityFit", () => {
  it("scores similar hour quantities highly", () => {
    const offer = base({ listingType: "offer", quantity: 10, unit: "hours" });
    const need = base({
      id: "l2",
      businessId: "b2",
      listingType: "need",
      quantity: 8,
      unit: "hours",
    });
    assert.ok(scoreQuantityFit(offer, need) >= 0.8);
  });

  it("penalizes mismatched unit families", () => {
    const offer = base({ quantity: 10, unit: "hours" });
    const need = base({
      id: "l2",
      businessId: "b2",
      listingType: "need",
      quantity: 1,
      unit: "project",
    });
    assert.ok(scoreQuantityFit(offer, need) < 0.6);
  });
});
