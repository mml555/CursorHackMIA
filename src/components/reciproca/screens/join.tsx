"use client";

import Link from "next/link";
import type { Navigate } from "../types";
import { Button } from "../primitives";

export function Join({ go }: { go: Navigate }) {
  return (
    <div className="screen">
      <div className="container-narrow page-pad-y">
        <div className="page-header">
          <div className="page-header-copy">
            <h1 className="page-title">Join Reciproca</h1>
            <p className="page-subtitle">
              Explore the network first, or start your vetting application when
              you&apos;re ready to trade as your company.
            </p>
          </div>
        </div>

        <div className="path-grid">
          <div className="card path-card path-card-featured">
            <span className="top-pill">Recommended first</span>
            <h2>Explore the live demo</h2>
            <p className="muted">
              Browse real Austin businesses, see AI-ranked matches, and propose a
              trade as our demo studio. No sign-up or onboarding required.
            </p>
            <div className="path-card-actions">
              <Button variant="primary" onClick={() => go("matches")}>
                Try the demo
              </Button>
              <Button variant="secondary" onClick={() => go("network")}>
                Browse network
              </Button>
            </div>
          </div>

          <div className="card path-card">
            <span className="tag">Vetted members</span>
            <h2>Apply to join the network</h2>
            <p className="muted">
              Create an account and tell us about your company, offers, and
              needs. We review every business within 48 hours before granting
              trade access.
            </p>
            <div className="path-card-actions">
              <Link href="/sign-up">
                <Button variant="secondary">Create account</Button>
              </Link>
              <Link href="/onboarding">
                <Button variant="ghost">I have an account</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
