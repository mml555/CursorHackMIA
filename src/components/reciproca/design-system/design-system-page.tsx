"use client";

import Image from "next/image";
import Link from "next/link";
import { BusinessCard } from "../business-card";
import { MEMBERS } from "../data/members";
import {
  Button,
  Chip,
  IconStar,
  MatchRing,
  ReasonBox,
  Stars,
  Vetted,
} from "../primitives";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section style={{ marginBottom: 48 }}>
      <h2
        style={{
          fontSize: 20,
          fontWeight: 600,
          margin: "0 0 16px",
          color: "var(--text-1)",
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

function Swatch({
  name,
  hex,
  note,
  color,
}: {
  name: string;
  hex: string;
  note: string;
  color: string;
}) {
  return (
    <div
      style={{
        flex: 1,
        borderRadius: 10,
        border: "1px solid var(--hairline)",
        overflow: "hidden",
      }}
    >
      <div style={{ height: 64, background: color }} />
      <div style={{ padding: "10px 12px", background: "var(--obsidian)" }}>
        <div style={{ fontSize: 13, fontWeight: 600 }}>{name}</div>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            color: "var(--text-2)",
            marginTop: 2,
          }}
        >
          {hex} · {note}
        </div>
      </div>
    </div>
  );
}

export function DesignSystemPage() {
  return (
    <div style={{ background: "var(--ink)", minHeight: "100vh", padding: "32px 28px 64px" }}>
      <div style={{ maxWidth: 1120, margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 40,
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div>
            <h1 style={{ fontSize: 40, margin: 0 }}>Reciproca Design System</h1>
            <p className="muted" style={{ marginTop: 8 }}>
              Tokens, components, and UI kit previews in React
            </p>
          </div>
          <Link href="/demo">
            <Button variant="primary">Open live demo</Button>
          </Link>
        </div>

        <Section title="Base colors">
          <div style={{ display: "flex", gap: 14 }}>
            <Swatch name="Ink" hex="#0E0F11" note="page" color="#0E0F11" />
            <Swatch name="Obsidian" hex="#16181C" note="card" color="#16181C" />
            <Swatch name="Raised" hex="#1E2026" note="inputs" color="#1E2026" />
            <Swatch name="Hairline" hex="#2A2D35" note="border" color="#2A2D35" />
          </div>
        </Section>

        <Section title="Accent colors">
          <div style={{ display: "flex", gap: 14 }}>
            <Swatch name="Amber" hex="#F0A500" note="primary CTA" color="#F0A500" />
            <Swatch name="Teal" hex="#2DD4AA" note="AI text only" color="#2DD4AA" />
            <Swatch name="Success" hex="#22C55E" note="vetted" color="#22C55E" />
          </div>
        </Section>

        <Section title="Text colors">
          <div style={{ display: "flex", gap: 14 }}>
            <Swatch name="Text 1" hex="#F4F4F2" note="primary" color="#F4F4F2" />
            <Swatch name="Text 2" hex="#8C8F99" note="secondary" color="#8C8F99" />
            <Swatch name="Text 3" hex="#52555E" note="tertiary" color="#52555E" />
          </div>
        </Section>

        <Section title="Typography">
          <div className="card" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <div className="caption" style={{ marginBottom: 8 }}>
                DISPLAY · 56px
              </div>
              <div className="display">Trade the services you have.</div>
            </div>
            <div>
              <div className="caption" style={{ marginBottom: 8 }}>
                H1 · 40px
              </div>
              <h1 style={{ margin: 0 }}>Your matches</h1>
            </div>
            <div>
              <div className="caption" style={{ marginBottom: 8 }}>
                BODY · 15px
              </div>
              <p style={{ margin: 0 }}>
                Reciproca is a vetted B2B network where businesses trade services
                directly.
              </p>
            </div>
            <div>
              <div className="caption" style={{ marginBottom: 8 }}>
                MONO · AI reasoning
              </div>
              <div className="reason-text">
                Luminary Studio offers brand photography for small businesses.
              </div>
            </div>
          </div>
        </Section>

        <Section title="Buttons">
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <Button variant="primary">Apply to join</Button>
            <Button variant="secondary">See how it works</Button>
            <Button variant="ghost" size="sm">
              Try demo
            </Button>
          </div>
        </Section>

        <Section title="Badges & stars">
          <div style={{ display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" }}>
            <Vetted />
            <Stars value={4.8} />
            <span className="top-pill">
              <IconStar filled size={11} /> Top Match
            </span>
          </div>
        </Section>

        <Section title="Business card">
          <div style={{ maxWidth: 380 }}>
            <BusinessCard member={MEMBERS[1]} />
          </div>
        </Section>

        <Section title="Match ring">
          <div style={{ display: "flex", gap: 40, alignItems: "center" }}>
            <MatchRing pct={78} />
            <MatchRing pct={94} />
          </div>
        </Section>

        <Section title="AI reasoning box">
          <div style={{ maxWidth: 560 }}>
            <ReasonBox
              text="Luminary Studio offers brand photography for small businesses and needs weekly wellness sessions for a team of 6. Your class format and their session format match in value and frequency."
              typeIt
            />
          </div>
        </Section>

        <Section title="Monogram chips">
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            {MEMBERS.slice(0, 4).map((m) => (
              <Chip key={m.id} name={m.name} />
            ))}
          </div>
        </Section>

        <Section title="Form input">
          <div style={{ maxWidth: 400 }}>
            <label className="label">Services you will trade</label>
            <input className="input" placeholder="60-minute yoga classes" />
            <div className="helper" style={{ marginTop: 7 }}>
              Be specific. &quot;60-minute yoga classes&quot; beats &quot;wellness.&quot;
            </div>
          </div>
        </Section>

        <Section title="Summary bar">
          <div className="summary" style={{ maxWidth: 640 }}>
            <div className="cell">
              <div className="k">Offering</div>
              <div className="v">Yoga classes, 4x/month</div>
            </div>
            <div className="cell">
              <div className="k">Looking for</div>
              <div className="v">Brand photography</div>
            </div>
            <div className="cell">
              <Vetted />
            </div>
          </div>
        </Section>

        <Section title="Logo">
          <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
            <Image
              src="/reciproca/reciproca-mark.png"
              alt="Reciproca mark"
              width={64}
              height={64}
            />
            <Image
              src="/reciproca/reciproca-logo-full.png"
              alt="Reciproca full logo"
              width={240}
              height={80}
              style={{ objectFit: "contain" }}
            />
          </div>
        </Section>

        <Section title="Spacing grid (4px)">
          <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
            {[4, 8, 12, 16, 24, 32, 48, 64].map((s) => (
              <div key={s} style={{ textAlign: "center" }}>
                <div
                  style={{
                    width: s,
                    height: s,
                    background: "var(--amber)",
                    borderRadius: 2,
                    margin: "0 auto",
                  }}
                />
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    color: "var(--text-3)",
                    marginTop: 6,
                  }}
                >
                  {s}
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Radius">
          <div style={{ display: "flex", gap: 20 }}>
            {[
              { r: 6, label: "tag" },
              { r: 10, label: "input" },
              { r: 14, label: "card" },
              { r: 20, label: "modal" },
            ].map(({ r, label }) => (
              <div key={label} style={{ textAlign: "center" }}>
                <div
                  style={{
                    width: 72,
                    height: 48,
                    background: "var(--obsidian)",
                    border: "1px solid var(--hairline)",
                    borderRadius: r,
                  }}
                />
                <div className="caption" style={{ marginTop: 8 }}>
                  {label} · {r}px
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Elevation">
          <div style={{ display: "flex", gap: 20 }}>
            <div
              className="card"
              style={{ width: 160, textAlign: "center", padding: 20 }}
            >
              Card shadow
            </div>
            <div
              className="card match-top"
              style={{ width: 160, textAlign: "center", padding: 20 }}
            >
              Amber glow
            </div>
          </div>
        </Section>

        <Section title="Demo screenshot">
          <Image
            src="/reciproca/demo-screenshot.png"
            alt="Reciproca demo screenshot"
            width={900}
            height={506}
            style={{
              width: "100%",
              height: "auto",
              borderRadius: 14,
              border: "1px solid var(--hairline)",
            }}
          />
        </Section>
      </div>
    </div>
  );
}
