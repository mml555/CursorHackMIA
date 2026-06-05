import type { Navigate } from "../types";
import { Button, Mark } from "../primitives";

export function LandingNav({ go }: { go: Navigate }) {
  return (
    <nav className="nav">
      <button
        type="button"
        className="brand"
        style={{ cursor: "pointer", background: "none", border: "none", padding: 0 }}
        onClick={() => go("landing")}
      >
        <Mark size={24} /> Reciproca
      </button>
      <div className="nav-right">
        <Button variant="primary" size="sm" onClick={() => go("matches")}>
          Live demo
        </Button>
        <Button variant="ghost" size="sm" onClick={() => go("join")}>
          Apply
        </Button>
      </div>
    </nav>
  );
}
