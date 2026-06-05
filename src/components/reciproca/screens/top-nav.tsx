import type { Navigate, Screen } from "../types";
import { Button, IconArrow, Mark } from "../primitives";

export function TopNav({
  screen,
  go,
}: {
  screen: Screen;
  go: Navigate;
}) {
  const links: { id: Screen; label: string; n: string | null }[] = [
    { id: "matches", label: "Matches", n: "4" },
    { id: "network", label: "Network", n: "47" },
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
          47 vetted
        </span>
        <Button variant="ghost" size="sm" onClick={() => go("matches")}>
          Try demo
        </Button>
        <Button variant="primary" size="sm" onClick={() => go("matches")}>
          <IconArrow size={14} stroke="#0E0F11" /> Propose
        </Button>
        <span className="avatar">S</span>
      </div>
    </nav>
  );
}
