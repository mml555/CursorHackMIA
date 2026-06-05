import { IconCheck } from "./icons";

export function Vetted() {
  return (
    <span className="vetted">
      <IconCheck size={12} stroke="var(--success)" />
      Vetted
    </span>
  );
}
