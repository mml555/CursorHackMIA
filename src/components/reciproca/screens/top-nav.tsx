"use client";

import type { DiscoverySummary, Navigate, Screen } from "../types";
import { Button, IconArrow, Mark } from "../primitives";

export function TopNav({
  screen,
  go,
  summary,
}: {
  screen: Screen;
  go: Navigate;
  summary: DiscoverySummary;
}) {
  const metroLabel = summary.metro ?? "Austin";
  const links: { id: Screen; label: string; n: string | null }[] = [
    {
      id: "matches",
      label: "Matches",
      n: summary.matchCount > 0 ? String(summary.matchCount) : null,
    },
    {
      id: "network",
      label: "Network",
      n: summary.total > 0 ? String(summary.total) : null,
    },
    { id: "join", label: "Join", n: null },
  ];

  return (
    <nav className="nav">
      <button
        type="button"
        className="brand"
        style={{ cursor: "pointer", background: "none", border: "none", padding: 0 }}
        onClick={() => go("landing")}
      >
        <Mark size={30} />
        <span className="brand-wm">Reciproca</span>
        <span className="brand-beta">BETA</span>
      </button>
      <div className="seg">
        {links.map((l) => (
          <button
            key={l.id}
            type="button"
            className={"seg-link" + (screen === l.id ? " on" : "")}
            onClick={() => go(l.id)}
          >
            {l.label}
            {l.n && <span className="seg-n">{l.n}</span>}
          </button>
        ))}
      </div>
      <div className="nav-right">
        <span className="nav-status">
          <span className="nav-status-dot" />
          {summary.total} vetted
        </span>
        <Button variant="ghost" size="sm" onClick={() => go("join")}>
          Apply
        </Button>
        <Button variant="primary" size="sm" onClick={() => go("matches")}>
          <IconArrow size={14} stroke="#0E0F11" /> Matches
        </Button>
        <span className="avatar" title={metroLabel}>
          {metroLabel.slice(0, 1).toUpperCase()}
        </span>
      </div>
    </nav>
  );
}
