/* Landing — 56px headline, single amber CTA, value bullets, problem line, logo strip */
const Landing = ({ go }) => {
  const values = [
    { ico: <IconShield size={19} />, k: "Vetted before you meet", d: "Every member clears a license check, trade reference, and onboarding review." },
    { ico: <IconSparkle size={19} />, k: "AI-matched by fit", d: "Semantic matching finds your counterpart, including multi-party trade cycles." },
    { ico: <IconNoCash size={19} />, k: "No platform currency", d: "Trade services directly. No trade dollars, no points, no bank in the middle." },
  ];
  return (
    <div className="screen">
      <section className="hero">
        <div className="container hero-inner">
          <span className="eyebrow"><span className="reason-dot" style={{ background: "var(--amber)", boxShadow: "0 0 8px var(--amber)" }} />Vetted B2B trade network · Austin</span>
          <h1>Trade the services you <b>have</b> for the ones you <b>need</b>.</h1>
          <p className="hero-sub">Reciproca is a vetted B2B network where businesses trade services directly. AI matching finds your counterpart. No trade dollars, no platform currency, no bank.</p>
          <div className="hero-cta">
            <Button variant="primary" onClick={() => go("join")}>Apply to join</Button>
            <Button variant="secondary" onClick={() => go("matches")}>See how it works</Button>
          </div>
          <p className="muted" style={{ marginTop: 22, fontSize: 14 }}>
            Most service businesses have skills to spare and budgets they would rather protect.
          </p>
        </div>

        <div className="container">
          <div className="value-row">
            {values.map((v, i) => (
              <div className="value-card" key={i}>
                <span className="value-ico">{v.ico}</span>
                <span className="vk">{v.k}</span>
                <span className="vd">{v.d}</span>
              </div>
            ))}
          </div>

          <div className="logostrip">
            <div className="logostrip-label">47 vetted businesses in Austin</div>
            <div className="logostrip-row">
              {MEMBERS.map(m => (
                <span className="lname" key={m.id}><Chip name={m.name} size={28} />{m.name}</span>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

window.Landing = Landing;
