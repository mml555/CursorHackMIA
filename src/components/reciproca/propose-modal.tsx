import type { Member } from "./types";
import { Button, IconClose } from "./primitives";

export function ProposeModal({
  member,
  onSend,
  onClose,
}: {
  member: Member;
  onSend: () => void;
  onClose: () => void;
}) {
  return (
    <div className="scrim" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2 style={{ fontSize: 24, margin: 0 }}>Propose a trade</h2>
          <button type="button" onClick={onClose} style={{ color: "var(--text-2)" }}>
            <IconClose size={20} />
          </button>
        </div>
        <div style={{ marginTop: 20 }}>
          <label className="label">You are offering</label>
          <input
            className="input"
            defaultValue="60-minute yoga classes, 4x/month"
          />
        </div>
        <div style={{ marginTop: 16 }}>
          <label className="label">You are asking for</label>
          <input className="input" defaultValue={member.trading} />
        </div>
        <div className="disclaimer">
          Barter transactions may be taxable income. Keep records of what you give
          and receive.
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <Button variant="primary" onClick={onSend}>
            Send proposal
          </Button>
          <Button variant="secondary" onClick={onClose}>
            Not now
          </Button>
        </div>
      </div>
    </div>
  );
}
