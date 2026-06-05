/* ============================================================
   Reciproca UI kit — primitives + seed data
   Exported to window for cross-file use.
   ============================================================ */
const { useState, useEffect, useRef } = React;

/* ---------- Icons (Lucide-style thin line) ---------- */
const Icon = ({ d, fill = "none", size = 18, stroke = "currentColor", sw = 1.6, children, vb = "0 0 24 24" }) => (
  <svg width={size} height={size} viewBox={vb} fill={fill} stroke={stroke}
    strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={{ flex: "none" }}>
    {d ? <path d={d} /> : children}
  </svg>
);
const IconCheck = (p) => <Icon {...p} d="M20 6 9 17l-5-5" sw={3} />;
const IconSearch = (p) => <Icon {...p}><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></Icon>;
const IconSparkle = (p) => <Icon {...p} d="M12 3v4M12 17v4M3 12h4M17 12h4M6.3 6.3l2.4 2.4M15.3 15.3l2.4 2.4M17.7 6.3l-2.4 2.4M8.7 15.3l-2.4 2.4" />;
const IconShield = (p) => <Icon {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" /></Icon>;
const IconNoCash = (p) => <Icon {...p}><circle cx="12" cy="12" r="9" /><path d="M5.6 5.6 18.4 18.4" /></Icon>;
const IconArrow = (p) => <Icon {...p} d="M5 12h14M13 6l6 6-6 6" />;
const IconClose = (p) => <Icon {...p} d="M18 6 6 18M6 6l12 12" />;
const IconStar = ({ filled, size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? "var(--amber)" : "var(--hairline)"}>
    <path d="M12 2l3 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.9 21l1.2-6.8-5-4.9 6.9-1z" />
  </svg>
);

/* ---------- Brand mark (real interlaced-knot logo) ---------- */
const Mark = ({ size = 26 }) => (
  <img src="assets/reciproca-mark.png" alt="Reciproca" width={size} height={size}
    style={{ display: "block", width: size, height: size, objectFit: "contain" }} />
);

/* ---------- Button ---------- */
const Button = ({ variant = "primary", size, block, children, ...rest }) => {
  const cls = ["btn", `btn-${variant}`, size === "sm" ? "btn-sm" : "", block ? "btn-block" : ""].join(" ");
  return <button className={cls} {...rest}>{children}</button>;
};

/* ---------- Vetted badge ---------- */
const Vetted = () => (
  <span className="vetted"><IconCheck size={12} stroke="var(--success)" />Vetted</span>
);

/* ---------- Star rating ---------- */
const Stars = ({ value, size = 15 }) => (
  <span className="biz-stars">
    {[1, 2, 3, 4, 5].map(i => <IconStar key={i} filled={i <= Math.round(value)} size={size} />)}
  </span>
);

/* ---------- Logo monogram chip ---------- */
const Chip = ({ name, size = 44 }) => (
  <span className="logo-chip" style={{ width: size, height: size, fontSize: size * 0.4 }}>{name[0]}</span>
);

/* Match ring — number always shows final value (robust for print/screenshots);
   the arc draws via CSS, gated on prefers-reduced-motion, staggered by delay. */
const MatchRing = ({ pct, size = 64, delay = 0 }) => {
  const r = 28, C = 2 * Math.PI * r;
  const off = C * (1 - pct / 100);
  return (
    <div className={"ring-wrap" + (pct >= 85 ? " ring-glow" : "")} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 64 64">
        <circle cx="32" cy="32" r={r} fill="none" stroke="#2A2D35" strokeWidth="6" />
        <circle className="ring-arc" cx="32" cy="32" r={r} fill="none" stroke="#F0A500" strokeWidth="6"
          strokeLinecap="round" strokeDasharray={C} transform="rotate(-90 32 32)"
          style={{ strokeDashoffset: off, "--c": C, "--off": off, animationDelay: delay + "ms" }} />
      </svg>
      <span className="ring-num">{pct}%</span>
    </div>
  );
};

/* ---------- AI reasoning box (types in with cursor) ---------- */
const ReasonBox = ({ text, typeIt = true, startDelay = 300 }) => {
  const [out, setOut] = useState(typeIt ? "" : text);
  const [done, setDone] = useState(!typeIt);
  useEffect(() => {
    if (!typeIt) return;
    let i = 0, timer;
    const begin = setTimeout(function tick() {
      if (i <= text.length) { setOut(text.slice(0, i)); i += 2; timer = setTimeout(tick, 14); }
      else setDone(true);
    }, startDelay);
    return () => { clearTimeout(begin); clearTimeout(timer); };
  }, [text, typeIt, startDelay]);
  return (
    <div className="reason">
      <span className="reason-rail" />
      <div className="reason-head">
        <span className="reason-dot" />why this match
        {!done && <span className="reason-think"><i /><i /><i /></span>}
      </div>
      <div className="reason-body">{out}<span className="cursor" style={{ opacity: done ? 0 : 1 }}>▌</span></div>
    </div>
  );
};

/* ---------- Seed cast: Austin / Wellness vertical ---------- */
const MEMBERS = [
  { id: "sunrise", name: "Sunrise Yoga Studio", industry: "Wellness", trading: "60-minute yoga classes, 4x/month", looking: "Brand photography", score: 4.9, trades: 24 },
  { id: "luminary", name: "Luminary Studio", industry: "Photography", trading: "Brand & product photography", looking: "Team wellness sessions", score: 4.8, trades: 31 },
  { id: "verde", name: "Verde Social", industry: "Social agency", trading: "Social management + reach", looking: "Studio video content", score: 4.7, trades: 19 },
  { id: "hill", name: "Hill Country Massage", industry: "Wellness", trading: "Massage therapy hours", looking: "Monthly bookkeeping", score: 4.6, trades: 12 },
  { id: "lonestar", name: "Lone Star Bookkeeping", industry: "Finance", trading: "Monthly bookkeeping", looking: "Marketing", score: 4.9, trades: 28 },
  { id: "atx", name: "ATX Web Co", industry: "Web design", trading: "Web design & build", looking: "Office wellness program", score: 4.5, trades: 9 },
];

const MATCHES = [
  { member: MEMBERS[1], pct: 94, top: true, reason: "Luminary Studio offers brand photography for small businesses and needs weekly wellness sessions for a team of 6. Your class format and their session format match in value and frequency." },
  { member: MEMBERS[2], pct: 81, reason: "Verde Social manages social for local studios and wants recurring on-site classes for their team. A 4x/month cadence covers their wellness budget without cash." },
  { member: MEMBERS[5], pct: 76, reason: "ATX Web Co is building an office wellness program and offers web design in return. Their need maps to your class offering, though session volume needs alignment." },
  { member: MEMBERS[3], pct: 68, reason: "Hill Country Massage trades therapy hours and could co-bundle a wellness package, but the direct value overlap with your offer is partial." },
];

Object.assign(window, {
  Icon, IconCheck, IconSearch, IconSparkle, IconShield, IconNoCash, IconArrow, IconClose, IconStar,
  Mark, Button, Vetted, Stars, Chip, MatchRing, ReasonBox, MEMBERS, MATCHES,
});
