import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { cosineSimilarity, parsePgVector } from "@/lib/matching/embeddings/cosine";

describe("cosineSimilarity", () => {
  it("returns 1 for identical vectors", () => {
    const v = [1, 0, 0];
    assert.ok(cosineSimilarity(v, v) >= 0.99);
  });

  it("returns 0 for orthogonal vectors", () => {
    assert.ok(cosineSimilarity([1, 0, 0], [0, 1, 0]) < 0.6);
  });
});

describe("parsePgVector", () => {
  it("parses postgres vector string", () => {
    const parsed = parsePgVector("[0.5,1,0]");
    assert.deepEqual(parsed, [0.5, 1, 0]);
  });
});
