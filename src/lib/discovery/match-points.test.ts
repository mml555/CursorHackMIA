import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  POINTS_MAX,
  POINTS_MIN,
  pointsToTier,
  rawScoreToMatchPoints,
  rawScoreToPoints,
} from "@/lib/discovery/match-points";

describe("rawScoreToPoints", () => {
  it("maps the minimum surfaced score to 40 points", () => {
    assert.equal(rawScoreToPoints(0.45), POINTS_MIN);
  });

  it("maps a perfect internal score to 100 points", () => {
    assert.equal(rawScoreToPoints(1), POINTS_MAX);
  });

  it("clamps out-of-range raw scores", () => {
    assert.equal(rawScoreToPoints(0.1), POINTS_MIN);
    assert.equal(rawScoreToPoints(1.5), POINTS_MAX);
  });

  it("never produces reputation-scale percentages", () => {
    const result = rawScoreToMatchPoints(4.8);
    assert.equal(result.points, POINTS_MAX);
  });
});

describe("pointsToTier", () => {
  it("assigns standard tier bands", () => {
    assert.equal(pointsToTier(90), "excellent");
    assert.equal(pointsToTier(85), "excellent");
    assert.equal(pointsToTier(74), "strong");
    assert.equal(pointsToTier(60), "good");
    assert.equal(pointsToTier(40), "fair");
  });
});
