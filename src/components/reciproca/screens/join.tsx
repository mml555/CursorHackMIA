"use client";

import Link from "next/link";
import type { Navigate } from "../types";
import { Button } from "../primitives";

export function Join({ go }: { go: Navigate }) {
  return (
    <div className="screen">
      <div className="container-narrow" style={{ paddingTop: 40, paddingBottom: 64 }}>
        <div className="section-head" style={{ marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: 40, margin: 0 }}>Join Reciproca</h1>
            <p className="muted" style={{ marginTop: 10, maxWidth: 520 }}>
              You can explore the network first or start your vetting
              application when you&apos;re ready to trade as your company.
            </p>
          </div>
        </div>

        <div className="grid" style={{ gap: 16 }}>
          <div
            className="card"
            style={{
              padding: 28,
              border: "1px solid var(--amber)",
              boxShadow: "0 0 0 1px rgba(240,165,0,0.15)",
            }}
          >
            <span className="top-pill" style={{ marginBottom: 14 }}>
              Recommended first
            </span>
            <h2 style={{ fontSize: 24, margin: "0 0 10px" }}>Explore the live demo</h2>
            <p className="muted" style={{ marginBottom: 20, lineHeight: 1.6 }}>
              Browse real Austin businesses, see AI-ranked matches, and propose a
              trade as our demo studio. No sign-up or onboarding required.
            </p>
            <Button variant="primary" onClick={() => go("matches")}>
              Try the demo
            </Button>
          </div>

          <div className="card" style={{ padding: 28 }}>
            <span className="tag" style={{ marginBottom: 14, display: "inline-block" }}>
              Vetted members
            </span>
            <h2 style={{ fontSize: 24, margin: "0 0 10px" }}>Apply to join the network</h2>
            <p className="muted" style={{ marginBottom: 20, lineHeight: 1.6 }}>
              Create an account and tell us about your company, offers, and needs.
              We review every business within 48 hours before granting trade access.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link href="/sign-up">
                <Button variant="secondary">Create account</Button>
              </Link>
              <Link href="/onboarding">
                <Button variant="ghost">I already have an account</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
