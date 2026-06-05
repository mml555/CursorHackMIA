import type { CSSProperties } from "react";
import { pointsToRingProgress } from "@/lib/discovery/match-points";
import type { MatchFitTier } from "@/lib/discovery/types";

export function MatchRing({
  points,
  tier,
  tierLabel,
  size = 64,
  delay = 0,
}: {
  points: number;
  tier: MatchFitTier;
  tierLabel: string;
  size?: number;
  delay?: number;
}) {
  const r = 28;
  const C = 2 * Math.PI * r;
  const progress = pointsToRingProgress(points);
  const off = C * (1 - progress / 100);

  return (
    <div className="match-ring-block">
      <div
        className={"ring-wrap" + (tier === "excellent" ? " ring-glow" : "")}
        style={{ width: size, height: size }}
        aria-label={`${points} match fit points, ${tierLabel}`}
      >
        <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
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
        <span className="ring-num">
          <span className="ring-points">{points}</span>
          <span className="ring-unit">pts</span>
        </span>
      </div>
      <span className={`ring-tier ring-tier-${tier}`}>{tierLabel}</span>
    </div>
  );
}
