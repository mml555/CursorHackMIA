"use client";

import { useState } from "react";
import type { Member, Navigate } from "../types";
import { Button, IconCheck, PageHeader, Stars } from "../primitives";

export function RatingScreen({
  member,
  demo,
  go,
}: {
  member: Member | null;
  demo: boolean;
  go: Navigate;
}) {
  const [score, setScore] = useState(5);
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <div className="screen">
        <div className="container">
          <div className="success-wrap">
            <span className="success-mark">
              <IconCheck size={34} stroke="var(--success)" />
            </span>
            <h1 style={{ fontSize: 34, margin: 0 }}>Thanks for rating.</h1>
            <p className="muted" style={{ maxWidth: 380 }}>
              {demo
                ? "In production, this updates the vendor score shown on proposal cards."
                : "Your rating updates their public reputation score."}
            </p>
            <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
              <Button variant="primary" onClick={() => go("matches")}>
                More matches
              </Button>
              <Button variant="secondary" onClick={() => go("network")}>
                Browse network
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="screen">
      <div className="container page-pad-y">
        <PageHeader
          title="Rate your counterparty"
          subtitle="Outcome scores build the trust layer — who actually delivers."
        />

        {member && (
          <div className="card" style={{ maxWidth: 480, margin: "0 auto" }}>
            <h2 style={{ margin: "0 0 8px" }}>{member.name}</h2>
            <p className="muted">{member.industry}</p>
            <div style={{ margin: "20px 0" }}>
              <Stars value={score} />
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setScore(n)}
                  className={"seg-link" + (score === n ? " on" : "")}
                  style={{ minWidth: 44 }}
                >
                  {n}★
                </button>
              ))}
            </div>
            <Button variant="primary" block onClick={() => setDone(true)}>
              Submit rating
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
