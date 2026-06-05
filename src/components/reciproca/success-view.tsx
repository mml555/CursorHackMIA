import { Button, IconCheck } from "./primitives";

export function SuccessView({
  onTrades,
  onBrowse,
}: {
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
        Demo mode: in the live network we notify the other business and surface
        their reply in your trades.
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
