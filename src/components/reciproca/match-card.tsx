import type { Match, Member } from "./types";
import {
  Button,
  Chip,
  IconStar,
  MatchRing,
  ReasonBox,
  Vetted,
} from "./primitives";

export function MatchCard({
  match,
  index,
  onPropose,
  onViewProfile,
}: {
  match: Match;
  index: number;
  onPropose: (member: Member) => void;
  onViewProfile?: (member: Member) => void;
}) {
  const m = match.member;

  return (
    <div className={"card match-card" + (match.top ? " match-top" : "")}>
      <MatchRing
        points={match.points}
        tier={match.tier}
        tierLabel={match.tierLabel}
        delay={index * 220}
      />
      <div className="match-main">
        <div className="match-head">
          <Chip name={m.name} />
          <div style={{ flex: 1 }}>
            <div className="biz-name">
              {m.name} <Vetted />
              <span className="match-rank-pill">#{match.rank}</span>
              {match.top && (
                <span className="top-pill">
                  <IconStar filled size={11} /> Top Match
                </span>
              )}
            </div>
            <span className="tag" style={{ marginTop: 6, display: "inline-block" }}>
              {m.industry}
            </span>
          </div>
        </div>
        <div className="biz-line">
          <span className="k">Trading</span> &nbsp;
          <span className="v">{m.trading}</span>
        </div>
        <div className="biz-line">
          <span className="k">Looking for</span> &nbsp;
          <span className="v">{m.looking}</span>
        </div>

        <ReasonBox
          text={match.reason}
          typeIt={match.top}
          startDelay={match.top ? 600 : 0}
        />

        <div className="match-actions">
          {onViewProfile && (
            <Button variant="ghost" block onClick={() => onViewProfile(m)}>
              View profile
            </Button>
          )}
          <Button
            variant={match.top ? "primary" : "secondary"}
            block
            onClick={() => onPropose(m)}
          >
            Propose a trade
          </Button>
        </div>
      </div>
    </div>
  );
}
