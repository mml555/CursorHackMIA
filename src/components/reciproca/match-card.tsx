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
}: {
  match: Match;
  index: number;
  onPropose: (member: Member) => void;
}) {
  const m = match.member;

  return (
    <div className={"card match-card" + (match.top ? " match-top" : "")}>
      <MatchRing pct={match.pct} delay={index * 220} />
      <div className="match-main">
        <div className="match-head">
          <Chip name={m.name} />
          <div style={{ flex: 1 }}>
            <div className="biz-name">
              {m.name} <Vetted />
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

        <div style={{ marginTop: 16 }}>
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
