"use client";

import {
  MATCH_FIT_TIERS,
  MATCH_SCORE_COMPONENTS,
  POINTS_MAX,
  POINTS_MIN,
} from "@/lib/discovery/match-points";
import type { Navigate } from "../types";
import { Button, PageHeader } from "../primitives";

export function MatchPointsScreen({ go }: { go: Navigate }) {
  return (
    <div className="screen">
      <div className="container-narrow page-pad-y">
        <PageHeader
          title="Match Fit Points"
          subtitle="How Reciproca ranks trade partners — not a probability, but a calibrated fit score."
        />

        <div className="card points-intro">
          <p>
            Every match shows <strong>Match Fit Points</strong> from{" "}
            {POINTS_MIN} to {POINTS_MAX}. Higher points mean stronger
            two-way alignment between what you offer, what you need, and what a
            counterparty lists. Points help you compare matches in your deck —
            they are not a guarantee that a trade will close.
          </p>
        </div>

        <section className="points-section">
          <h2 className="points-heading">Fit tiers</h2>
          <div className="points-tier-grid">
            {MATCH_FIT_TIERS.map((tier) => (
              <div key={tier.id} className={`card points-tier-card tier-${tier.id}`}>
                <div className="points-tier-top">
                  <span className="points-tier-label">{tier.label}</span>
                  <span className="points-tier-range">{tier.minPoints}+ pts</span>
                </div>
                <p className="muted">{tier.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="points-section">
          <h2 className="points-heading">What goes into the score</h2>
          <div className="points-component-list">
            {MATCH_SCORE_COMPONENTS.map((component) => (
              <div key={component.label} className="points-component-row">
                <div className="points-component-head">
                  <span className="points-component-label">{component.label}</span>
                  <span className="points-component-weight">{component.weight}</span>
                </div>
                <p className="muted">{component.detail}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="points-section">
          <h2 className="points-heading">How ranking works</h2>
          <div className="card points-ranking-card">
            <ol className="points-ranking-list">
              <li>
                We score every viable offer↔need pairing in your metro, including
                two-way (direct) and one-way (partial) fits.
              </li>
              <li>
                Matches are sorted by internal fit score, then converted to the
                public {POINTS_MIN}–{POINTS_MAX} point scale so scores stay
                comparable across businesses.
              </li>
              <li>
                Your <strong>#1 match</strong> is the highest-scoring partner in
                your current deck. Lower ranks are still worth reviewing when the
                trade terms are easy to align.
              </li>
              <li>
                Outcome scores from completed trades influence ranking but never
                replace service fit — reputation is 20% of the blend.
              </li>
            </ol>
          </div>
        </section>

        <div className="points-actions">
          <Button variant="primary" onClick={() => go("matches")}>
            Back to matches
          </Button>
          <Button variant="ghost" onClick={() => go("network")}>
            Browse network
          </Button>
        </div>
      </div>
    </div>
  );
}
