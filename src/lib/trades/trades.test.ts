import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  assertTransition,
  canTransition,
  InvalidTransitionError,
  nextStatusAfterAllAccepted,
} from "@/lib/trades/state-machine";
import { ACTIVE_TRADE_STATUSES } from "@/lib/trades/service";

describe("trade state machine", () => {
  it("allows published to pending_acceptance when parties show interest", () => {
    assert.equal(canTransition("published", "pending_acceptance"), true);
  });

  it("moves to matched after all acceptances", () => {
    assert.equal(nextStatusAfterAllAccepted(), "matched");
    assert.equal(canTransition("pending_acceptance", "matched"), true);
  });

  it("requires all parties to confirm before in_progress path", () => {
    assert.equal(canTransition("matched", "confirmed"), true);
    assert.equal(canTransition("confirmed", "in_progress"), true);
    assert.equal(canTransition("in_progress", "completed"), true);
    assert.equal(canTransition("completed", "rated"), true);
  });

  it("allows dispute from active trade states", () => {
    for (const status of ["matched", "confirmed", "in_progress"] as const) {
      assert.equal(canTransition(status, "disputed"), true);
    }
  });

  it("defines active trade statuses excluding deck and terminal states", () => {
    assert.deepEqual(ACTIVE_TRADE_STATUSES, [
      "pending_acceptance",
      "matched",
      "confirmed",
      "in_progress",
      "completed",
      "disputed",
    ]);
    assert.equal(ACTIVE_TRADE_STATUSES.includes("draft"), false);
    assert.equal(ACTIVE_TRADE_STATUSES.includes("rated"), false);
    assert.equal(ACTIVE_TRADE_STATUSES.includes("cancelled"), false);
  });

  it("rejects invalid transitions", () => {
    assert.throws(
      () => assertTransition("draft", "matched"),
      InvalidTransitionError,
    );
    assert.throws(
      () => assertTransition("completed", "in_progress"),
      InvalidTransitionError,
    );
  });
});
