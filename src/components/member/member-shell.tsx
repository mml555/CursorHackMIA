"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import Image from "next/image";

const NAV = [
  { href: "/deck", label: "Deck" },
  { href: "/trades", label: "Trades" },
  { href: "/profile", label: "Profile" },
];

export function MemberShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="app" data-screen-label="member">
      <nav className="nav" aria-label="Member">
        <Link href="/demo" className="brand brand-btn" aria-label="Reciproca home">
          <Image
            src="/reciproca/reciproca-mark.png"
            alt=""
            width={30}
            height={30}
            style={{ display: "block", objectFit: "contain" }}
          />
          <span className="brand-wm">Reciproca</span>
        </Link>
        <div className="seg nav-scroll">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={"seg-link" + (pathname.startsWith(item.href) ? " on" : "")}
              aria-current={pathname.startsWith(item.href) ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </div>
        <div className="nav-right">
          <Link href="/demo" className="nav-hide-sm" style={{ fontSize: 13, color: "var(--text-2)" }}>
            Demo
          </Link>
          <UserButton />
        </div>
      </nav>
      {children}
    </div>
  );
}
