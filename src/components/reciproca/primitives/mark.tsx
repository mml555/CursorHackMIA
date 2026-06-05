import Image from "next/image";

export function Mark({ size = 26 }: { size?: number }) {
  return (
    <Image
      src="/reciproca/reciproca-mark.png"
      alt="Reciproca"
      width={size}
      height={size}
      style={{
        display: "block",
        width: size,
        height: size,
        objectFit: "contain",
      }}
    />
  );
}
