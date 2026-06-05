/* MatchCard — BusinessCard + match ring + AI reasoning box + Propose CTA */
const MatchCard = ({ match, index, onPropose }) => {
  const m = match.member;
  return (
    <div className={"card match-card" + (match.top ? " match-top" : "")}>
      <MatchRing pct={match.pct} delay={index * 220} />
      <div className="match-main">
        <div className="match-head">
          <Chip name={m.name} />
          <div style={{ flex: 1 }}>
            <div className="biz-name">{m.name} <Vetted />
              {match.top && <span className="top-pill"><IconStar filled size={11} /> Top Match</span>}
            </div>
            <span className="tag" style={{ marginTop: 6, display: "inline-block" }}>{m.industry}</span>
          </div>
        </div>
        <div className="biz-line"><span className="k">Trading</span> &nbsp;<span className="v">{m.trading}</span></div>
        <div className="biz-line"><span className="k">Looking for</span> &nbsp;<span className="v">{m.looking}</span></div>

        <ReasonBox text={match.reason} typeIt={match.top} startDelay={match.top ? 600 : 0} />

        <div style={{ marginTop: 16 }}>
          <Button variant={match.top ? "primary" : "secondary"} block onClick={() => onPropose(m)}>
            Propose a trade
          </Button>
        </div>
      </div>
    </div>
  );
};

/* Propose modal */
const ProposeModal = ({ member, onSend, onClose }) => (
  <div className="scrim" onClick={onClose}>
    <div className="modal" onClick={e => e.stopPropagation()}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ fontSize: 24, margin: 0 }}>Propose a trade</h2>
        <button onClick={onClose} style={{ color: "var(--text-2)" }}><IconClose size={20} /></button>
      </div>
      <div style={{ marginTop: 20 }}>
        <label className="label">You are offering</label>
        <input className="input" defaultValue="60-minute yoga classes, 4x/month" />
      </div>
      <div style={{ marginTop: 16 }}>
        <label className="label">You are asking for</label>
        <input className="input" defaultValue={member ? member.trading : ""} />
      </div>
      <div className="disclaimer">
        Barter transactions may be taxable income. Keep records of what you give and receive.
      </div>
      <div style={{ display: "flex", gap: 12 }}>
        <Button variant="primary" onClick={onSend}>Send proposal</Button>
        <Button variant="secondary" onClick={onClose}>Not now</Button>
      </div>
    </div>
  </div>
);

/* Success state */
const SuccessView = ({ onTrades, onBrowse }) => (
  <div className="success-wrap">
    <span className="success-mark">
      <IconCheck size={34} stroke="var(--success)" />
    </span>
    <h1 style={{ fontSize: 34, margin: 0 }}>Trade proposed.</h1>
    <p className="muted" style={{ maxWidth: 380 }}>
      Demo mode: in the live network we notify the other business and surface their reply in your trades.
    </p>
    <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
      <Button variant="primary" onClick={onTrades}>View my trades</Button>
      <Button variant="secondary" onClick={onBrowse}>Browse more members</Button>
    </div>
  </div>
);

/* Matches (HERO) — summary bar + staggered match cards + propose→success flow */
const Matches = ({ go }) => {
  const [modal, setModal] = useState(null);   // member being proposed to
  const [phase, setPhase] = useState("list"); // list | success
  const [toast, setToast] = useState(false);

  if (phase === "success") {
    return (
      <div className="screen">
        <div className="container">
          <SuccessView onTrades={() => { setToast(true); setTimeout(() => setToast(false), 2600); setPhase("list"); }}
            onBrowse={() => { setPhase("list"); go("network"); }} />
        </div>
        {toast && <div className="toast"><span className="vetted-dot"><IconCheck size={15} stroke="var(--success)" /></span>Rating submitted. It appears on their profile after review.</div>}
      </div>
    );
  }

  return (
    <div className="screen">
      <div className="matches-wrap">
        <div className="matches-glow" />
        <div className="container" style={{ position: "relative" }}>
          <div className="section-head" style={{ marginBottom: 20 }}>
            <h1 style={{ fontSize: 40, margin: 0 }}>Your matches</h1>
            <span className="progress-pill"><span className="reason-dot" style={{ background: "var(--teal)", boxShadow: "0 0 8px var(--teal)" }} />AI-ranked by fit</span>
          </div>

          <div className="summary">
            <div className="cell"><div className="k">Offering</div><div className="v">Yoga classes, 4x/month</div></div>
            <div className="cell"><div className="k">Looking for</div><div className="v">Brand photography</div></div>
            <div className="cell"><Vetted /></div>
          </div>

          <div className="match-list">
            {MATCHES.map((mt, i) => (
              <MatchCard key={mt.member.id} match={mt} index={i} onPropose={(m) => setModal(m)} />
            ))}
          </div>
        </div>
      </div>

      {modal && <ProposeModal member={modal} onClose={() => setModal(null)}
        onSend={() => { setModal(null); setPhase("success"); }} />}
      {toast && <div className="toast"><span className="vetted-dot"><IconCheck size={15} stroke="var(--success)" /></span>Rating submitted. It appears on their profile after review.</div>}
    </div>
  );
};

Object.assign(window, { MatchCard, ProposeModal, SuccessView, Matches });
