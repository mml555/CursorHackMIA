import type { Member } from "./types";
import { Chip, Stars, Vetted } from "./primitives";

export function BusinessCard({ member }: { member: Member }) {
  return (
    <div className="card card-hover">
      <div className="biz-top">
        <Chip name={member.name} />
        <div>
          <div className="biz-name">
            {member.name} <Vetted />
          </div>
          <span className="tag" style={{ marginTop: 6, display: "inline-block" }}>
            {member.industry}
          </span>
        </div>
      </div>
      <div className="biz-line">
        <span className="k">Trading</span> &nbsp;
        <span className="v">{member.trading}</span>
      </div>
      <div className="biz-line">
        <span className="k">Looking for</span> &nbsp;
        <span className="v">{member.looking}</span>
      </div>
      <div className="biz-score">
        <span>
          Outcome score {member.score.toFixed(1)} · {member.trades} trades
        </span>
        <Stars value={member.score} />
      </div>
    </div>
  );
}
