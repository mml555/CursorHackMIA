/* Join — 3 segmented sections, 1-of-3 progress pill, one inline validation error */
const Join = ({ go }) => {
  const [step, setStep] = useState(1); // which section is "active" for the progress pill
  const [services, setServices] = useState("");
  const [showErr, setShowErr] = useState(true); // demo shows the services error state
  const sections = ["Company", "Your contact information", "What you trade"];

  return (
    <div className="screen">
      <div className="container-narrow" style={{ paddingTop: 40, paddingBottom: 64 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <h1 style={{ fontSize: 36, margin: 0 }}>Apply to join</h1>
          <span className="progress-pill">
            <span className="progress-dots">
              {[1, 2, 3].map(i => <span key={i} className={"pdot" + (i <= step ? " on" : "")} />)}
            </span>
            {step} of 3 · {sections[step - 1]}
          </span>
        </div>
        <p className="muted" style={{ marginBottom: 28 }}>
          We review your profile within 48 hours. Vetting includes a license check, a trade reference, and an onboarding review.
        </p>

        <div className="card" style={{ padding: 28 }}>
          {/* Section 1 — Company */}
          <div className="form-section" onFocus={() => setStep(1)}>
            <h3 style={{ margin: "0 0 18px" }}>Company</h3>
            <div className="field-grid">
              <div>
                <label className="label">Legal business name</label>
                <input className="input" placeholder="Sunrise Yoga Studio LLC" defaultValue="Sunrise Yoga Studio LLC" />
              </div>
              <div>
                <label className="label">Industry</label>
                <input className="input" placeholder="Wellness" defaultValue="Wellness" />
              </div>
            </div>
            <div style={{ marginTop: 18 }}>
              <label className="label">Website</label>
              <input className="input" placeholder="sunriseyoga.co" />
            </div>
          </div>

          {/* Section 2 — Contact */}
          <div className="form-section" onFocus={() => setStep(2)}>
            <h3 style={{ margin: "0 0 18px" }}>Your contact information</h3>
            <div className="field-grid">
              <div>
                <label className="label">Full name</label>
                <input className="input" placeholder="Maya Ellis" />
              </div>
              <div>
                <label className="label">Business email</label>
                <input className="input" placeholder="maya@sunriseyoga.co" />
                <div className="helper">We need a valid business email. Personal addresses like Gmail are not accepted for vetting.</div>
              </div>
            </div>
          </div>

          {/* Section 3 — What you trade (inline error on services) */}
          <div className="form-section" onFocus={() => setStep(3)}>
            <h3 style={{ margin: "0 0 18px" }}>What you trade</h3>
            <div>
              <label className="label">Services you will trade</label>
              <input className={"input" + (showErr && !services ? " error" : "")}
                placeholder="60-minute yoga classes"
                value={services}
                onChange={e => { setServices(e.target.value); }}
                onFocus={() => setStep(3)} />
              {showErr && !services
                ? <div className="error-msg"><IconClose size={13} stroke="var(--destructive)" />Services you will trade is required.</div>
                : <div className="helper">Be specific. "60-minute yoga classes" beats "wellness."</div>}
            </div>
            <div style={{ marginTop: 18 }}>
              <label className="label">What you are looking for</label>
              <input className="input" placeholder="Brand photography" />
              <div className="helper">What would you normally pay a vendor for?</div>
            </div>
            <div style={{ marginTop: 18 }}>
              <label className="label">Approximate annual revenue (optional)</label>
              <select className="select" defaultValue="">
                <option value="" disabled>Select a range</option>
                <option>Under $250K</option><option>$250K – $1M</option><option>$1M – $5M</option><option>Over $5M</option>
              </select>
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, marginTop: 28 }}>
            <Button variant="primary" onClick={() => { if (!services) setShowErr(true); else go("matches"); }}>Submit application</Button>
            <Button variant="secondary" onClick={() => go("matches")}>Explore the demo</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

window.Join = Join;
