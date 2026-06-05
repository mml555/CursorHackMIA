import type { CSSProperties } from "react";

export function MatchRing({
  pct,
  size = 64,
  delay = 0,
}: {
  pct: number;
  size?: number;
  delay?: number;
}) {
  const r = 28;
  const C = 2 * Math.PI * r;
  const off = C * (1 - pct / 100);

  return (
    <div
      className={"ring-wrap" + (pct >= 85 ? " ring-glow" : "")}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} viewBox="0 0 64 64">
        <circle
          cx="32"
          cy="32"
          r={r}
          fill="none"
          stroke="#2A2D35"
          strokeWidth="6"
        />
        <circle
          className="ring-arc"
          cx="32"
          cy="32"
          r={r}
          fill="none"
          stroke="#F0A500"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={C}
          transform="rotate(-90 32 32)"
          style={
            {
              strokeDashoffset: off,
              "--c": C,
              "--off": off,
              animationDelay: `${delay}ms`,
            } as CSSProperties
          }
        />
      </svg>
      <span className="ring-num">{pct}%</span>
    </div>
  );
}
