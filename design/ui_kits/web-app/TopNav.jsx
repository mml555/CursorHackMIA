/* TopNav — flat, gradient-free, amber + neutrals. Segmented nav, brand badge,
   live vetted-count status, Try demo always visible. */
const TopNav = ({ screen, go }) => {
  const links = [
    { id: "matches", label: "Matches", n: "4" },
    { id: "network", label: "Network", n: "47" },
    { id: "join", label: "Join", n: null },
  ];
  return (
    <nav className="nav">
      <div className="brand" onClick={() => go("landing")} style={{ cursor: "pointer" }}>
        <Mark size={30} />
        <span className="brand-wm">Reciproca</span>
        <span className="brand-beta">BETA</span>
      </div>
      <div className="seg">
        {links.map(l => (
          <a key={l.id} className={"seg-link" + (screen === l.id ? " on" : "")} onClick={() => go(l.id)}>
            {l.label}{l.n && <span className="seg-n">{l.n}</span>}
          </a>
        ))}
      </div>
      <div className="nav-right">
        <span className="nav-status"><span className="nav-status-dot" />47 vetted</span>
        <Button variant="ghost" size="sm" onClick={() => go("matches")}>Try demo</Button>
        <Button variant="primary" size="sm" onClick={() => go("matches")}>
          <IconArrow size={14} stroke="#0E0F11" /> Propose
        </Button>
        <span className="avatar">S</span>
      </div>
    </nav>
  );
};

window.TopNav = TopNav;
