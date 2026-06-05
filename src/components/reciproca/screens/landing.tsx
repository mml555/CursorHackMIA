"use client";

import { useEffect, useState } from "react";
import { fetchDiscoveryNetwork } from "@/lib/discovery/browser-client";
import type { DiscoverySummary, Member, Navigate } from "../types";
import {
  Button,
  Chip,
  IconNoCash,
  IconShield,
  IconSparkle,
} from "../primitives";

export function Landing({
  go,
  summary,
}: {
  go: Navigate;
  summary: DiscoverySummary;
}) {
  const [members, setMembers] = useState<Member[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const result = await fetchDiscoveryNetwork({
          metro: summary.metro ?? "Austin",
        });
        if (!cancelled) setMembers(result.members.slice(0, 6));
      } catch {
        if (!cancelled) setMembers([]);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [summary.metro]);

  const values = [
    {
      ico: <IconShield size={19} />,
      k: "Vetted before you meet",
      d: "Every member clears a license check, trade reference, and onboarding review.",
    },
    {
      ico: <IconSparkle size={19} />,
      k: "AI-matched by fit",
      d: "Semantic matching finds your counterpart, including multi-party trade cycles.",
    },
    {
      ico: <IconNoCash size={19} />,
      k: "No platform currency",
      d: "Trade services directly. No trade dollars, no points, no bank in the middle.",
    },
  ];

  const metroLabel = summary.metro ?? "Austin";

  return (
    <div className="screen">
      <section className="hero">
        <div className="container hero-inner">
          <span className="eyebrow">
            <span
              className="reason-dot"
              style={{
                background: "var(--amber)",
                boxShadow: "0 0 8px var(--amber)",
              }}
            />
            Vetted B2B trade network · {metroLabel}
          </span>
          <h1>
            Trade the services you <b>have</b> for the ones you <b>need</b>.
          </h1>
          <p className="hero-sub">
            Reciproca is a vetted B2B network where businesses trade services
            directly. AI matching finds your counterpart. No trade dollars, no
            platform currency, no bank.
          </p>
          <div className="hero-cta">
            <Button variant="primary" onClick={() => go("matches")}>
              Explore live demo
            </Button>
            <Button variant="secondary" onClick={() => go("join")}>
              Apply to join
            </Button>
          </div>
          <p className="muted" style={{ marginTop: 22, fontSize: 14 }}>
            No account needed to browse matches and the member network. Apply
            when you want to trade as your business.
          </p>
        </div>

        <div className="container">
          <div className="value-row">
            {values.map((v) => (
              <div className="value-card" key={v.k}>
                <span className="value-ico">{v.ico}</span>
                <span className="vk">{v.k}</span>
                <span className="vd">{v.d}</span>
              </div>
            ))}
          </div>

          <div className="logostrip">
            <div className="logostrip-label">
              {summary.total} vetted businesses in {metroLabel}
            </div>
            <div className="logostrip-row">
              {members.map((m) => (
                <span className="lname" key={m.id}>
                  <Chip name={m.name} size={28} />
                  {m.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
