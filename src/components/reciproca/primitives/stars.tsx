import { IconStar } from "./icons";

export function Stars({ value, size = 15 }: { value: number; size?: number }) {
  return (
    <span className="biz-stars">
      {[1, 2, 3, 4, 5].map((i) => (
        <IconStar key={i} filled={i <= Math.round(value)} size={size} />
      ))}
    </span>
  );
}
