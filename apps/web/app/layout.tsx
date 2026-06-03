import type { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "Vaishviq Knowledge Runtime",
  description: "Persistent Universal Knowledge Lineage Explorer"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <nav className="topbar">
          <a href="/dashboard">Dashboard</a>
          <a href="/universes">Universes</a>
          <a href="/lineage">Lineage</a>
          <a href="/dictionary">Dictionary</a>
          <a href="/lipi">Lipi</a>
          <a href="/radio">Radio</a>
          <a href="/ayodhya">Ayodhya AI</a>
          <a href="/hkd3d">HKD3D</a>
          <a href="/scopes">Scopes</a>
          <a href="/admin">Admin</a>
        </nav>
        {children}
      </body>
    </html>
  );
}
