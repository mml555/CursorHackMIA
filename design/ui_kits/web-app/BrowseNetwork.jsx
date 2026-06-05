/* BusinessCard — reused on Network grid */
const BusinessCard = ({ m, onPropose }) => (
  <div className="card card-hover">
    <div className="biz-top">
      <Chip name={m.name} />
      <div>
        <div className="biz-name">{m.name} <Vetted /></div>
        <span className="tag" style={{ marginTop: 6, display: "inline-block" }}>{m.industry}</span>
      </div>
    </div>
    <div className="biz-line"><span className="k">Trading</span> &nbsp;<span className="v">{m.trading}</span></div>
    <div className="biz-line"><span className="k">Looking for</span> &nbsp;<span className="v">{m.looking}</span></div>
    <div className="biz-score">
      <span>Outcome score {m.score.toFixed(1)} · {m.trades} trades</span>
      <Stars value={m.score} />
    </div>
  </div>
);

/* Browse Network — filter pills + search + responsive grid, load-more (no pagination) */
const BrowseNetwork = ({ go }) => {
  const verticals = ["All", "Wellness", "Photography", "Social agency", "Finance", "Web design"];
  const [filter, setFilter] = useState("All");
  const [q, setQ] = useState("");
  const [count, setCount] = useState(6);
  const list = MEMBERS.filter(m =>
    (filter === "All" || m.industry === filter) &&
    (q === "" || m.name.toLowerCase().includes(q.toLowerCase()) || m.trading.toLowerCase().includes(q.toLowerCase()))
  );
  const shown = list.slice(0, count);
  return (
    <div className="screen">
      <div className="container" style={{ paddingTop: 36, paddingBottom: 56 }}>
        <div className="section-head">
          <div>
            <h1 style={{ fontSize: 40, margin: 0 }}>Member Network</h1>
            <p className="muted" style={{ marginTop: 8 }}>47 vetted businesses in Austin</p>
          </div>
          <Button variant="primary" onClick={() => go("join")}>List your business</Button>
        </div>

        <div className="toolbar">
          <div className="search">
            <IconSearch />
            <input placeholder="Search members or services" value={q} onChange={e => setQ(e.target.value)} />
          </div>
          <div className="pill-row">
            {verticals.map(v => (
              <button key={v} className={"filter-pill" + (filter === v ? " active" : "")}
                onClick={() => { setFilter(v); setCount(6); }}>{v}</button>
            ))}
          </div>
        </div>

        <div className="grid">
          {shown.map(m => <BusinessCard key={m.id} m={m} />)}
        </div>

        {shown.length === 0 && (
          <p className="muted" style={{ textAlign: "center", padding: "48px 0" }}>No members match that filter yet.</p>
        )}
        {count < list.length && (
          <div className="loadmore"><Button variant="secondary" onClick={() => setCount(c => c + 6)}>Load more members</Button></div>
        )}
      </div>
    </div>
  );
};

window.BusinessCard = BusinessCard;
window.BrowseNetwork = BrowseNetwork;
