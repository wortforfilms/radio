import type { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "Radio Vaigyaaniq",
  description: "Radio Vaigyaaniq — independent broadcast app.",
};

// Standalone layout: no governance/umbrella chrome — just the Radio shell.
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
