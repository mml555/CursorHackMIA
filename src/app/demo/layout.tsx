import { Inter, JetBrains_Mono } from "next/font/google";
import type { Metadata } from "next";
import "@/styles/reciproca/tokens.css";
import "@/styles/reciproca/app.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
});

export const metadata: Metadata = {
  title: "Reciproca Demo",
  description: "Click-through demo of the Reciproca B2B trade network",
};

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${inter.variable} ${jetbrainsMono.variable}`}
      style={
        {
          "--font-ui": "var(--font-inter), -apple-system, BlinkMacSystemFont, sans-serif",
          "--font-mono": "var(--font-jetbrains), ui-monospace, monospace",
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
}
