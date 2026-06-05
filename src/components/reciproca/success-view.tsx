import { Button, IconCheck } from "./primitives";

export function SuccessView({
  demo = false,
  onTrades,
  onBrowse,
}: {
  demo?: boolean;
  onTrades: () => void;
  onBrowse: () => void;
}) {
  return (
    <div className="success-wrap">
      <span className="success-mark">
        <IconCheck size={34} stroke="var(--success)" />
      </span>
      <h1 style={{ fontSize: 34, margin: 0 }}>Trade proposed.</h1>
      <p className="muted" style={{ maxWidth: 380 }}>
        {demo
          ? "Interest recorded for the demo business. Sign up to propose trades as your own company."
          : "We notified the other business. Their reply will appear in your trades when they accept."}
      </p>
      <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
        <Button variant="primary" onClick={onTrades}>
          View my trades
        </Button>
        <Button variant="secondary" onClick={onBrowse}>
          Browse more members
        </Button>
      </div>
    </div>
  );
}
