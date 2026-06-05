export function Chip({ name, size = 44 }: { name: string; size?: number }) {
  return (
    <span
      className="logo-chip"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {name[0]}
    </span>
  );
}
