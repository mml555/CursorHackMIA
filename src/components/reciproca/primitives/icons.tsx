type IconProps = {
  size?: number;
  stroke?: string;
  sw?: number;
  fill?: string;
  vb?: string;
  d?: string;
  children?: React.ReactNode;
};

export function Icon({
  d,
  fill = "none",
  size = 18,
  stroke = "currentColor",
  sw = 1.6,
  children,
  vb = "0 0 24 24",
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox={vb}
      fill={fill}
      stroke={stroke}
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flex: "none" }}
    >
      {d ? <path d={d} /> : children}
    </svg>
  );
}

export function IconCheck(props: IconProps) {
  return <Icon {...props} d="M20 6 9 17l-5-5" sw={3} />;
}

export function IconSearch(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </Icon>
  );
}

export function IconSparkle(props: IconProps) {
  return (
    <Icon
      {...props}
      d="M12 3v4M12 17v4M3 12h4M17 12h4M6.3 6.3l2.4 2.4M15.3 15.3l2.4 2.4M17.7 6.3l-2.4 2.4M8.7 15.3l-2.4 2.4"
    />
  );
}

export function IconShield(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </Icon>
  );
}

export function IconNoCash(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M5.6 5.6 18.4 18.4" />
    </Icon>
  );
}

export function IconArrow(props: IconProps) {
  return <Icon {...props} d="M5 12h14M13 6l6 6-6 6" />;
}

export function IconClose(props: IconProps) {
  return <Icon {...props} d="M18 6 6 18M6 6l12 12" />;
}

export function IconStar({
  filled,
  size = 15,
}: {
  filled?: boolean;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? "var(--amber)" : "var(--hairline)"}
    >
      <path d="M12 2l3 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.9 21l1.2-6.8-5-4.9 6.9-1z" />
    </svg>
  );
}
