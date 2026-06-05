"use client";

import type { Navigate } from "../types";
import { Button, PageHeader, Vetted } from "../primitives";

const CYCLE = [
  {
    name: "Sunrise Yoga Studio",
    gives: "6 team wellness classes",
    gets: "3-month social content package",
  },
  {
    name: "Luminary Studio",
    gives: "Brand photography package",
    gets: "6 team wellness classes",
  },
  {
    name: "Verde Social",
    gives: "3-month social content package",
    gets: "Brand photography package",
  },
];

export function MultiParty({ go }: { go: Navigate }) {
  return (
    <div className="screen">
      <div className="container page-pad-y">
        <PageHeader
          title="Multi-party clearing"
          subtitle="When no pair lines up, Reciproca clears circular trades — no trade dollars required."
        />

        <div className="card" style={{ marginBottom: 24 }}>
          <span className="tag">Demo · Austin · Wellness</span>
          <p className="muted" style={{ marginTop: 12 }}>
            Three vetted businesses exchange services in a closed loop. Each party gives what they
            have idle and receives what they need — cleared as one proposal.
          </p>
        </div>

        <div className="match-list">
          {CYCLE.map((node, i) => (
            <div key={node.name} className="card match-card">
              <div className="match-head">
                <div>
                  <span className="tag">Party {i + 1}</span>
                  <h3 style={{ margin: "8px 0 4px" }}>
                    {node.name} <Vetted />
                  </h3>
                </div>
                {i < CYCLE.length - 1 && (
                  <span aria-hidden style={{ fontSize: 20, color: "var(--teal)" }}>
                    ↓
                  </span>
                )}
              </div>
              <div className="biz-line">
                <span className="k">Gives</span> <span className="v">{node.gives}</span>
              </div>
              <div className="biz-line">
                <span className="k">Gets</span> <span className="v">{node.gets}</span>
              </div>
            </div>
          ))}
        </div>

        <p className="muted" style={{ marginTop: 20, fontSize: 14 }}>
          Optional $200 cash top-up displayed when FMV is uneven — members settle the gap in cash,
          not platform currency.
        </p>

        <div style={{ display: "flex", gap: 12, marginTop: 24, flexWrap: "wrap" }}>
          <Button variant="primary" onClick={() => go("matches")}>
            See 1:1 matches
          </Button>
          <Button variant="secondary" onClick={() => go("network")}>
            Browse network
          </Button>
        </div>
      </div>
    </div>
  );
}
