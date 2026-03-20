"use client";

import Link from "next/link";
import { SHELL_LAYOUT } from "@/lib/ui-shell";
import { APP_THEME } from "@/lib/ui-theme";

const C = APP_THEME;

type WorkspaceView = "Directory" | "Providers" | "Must Haves";

type WorkspaceTopNavProps = {
  activeView: WorkspaceView;
  isLoggedIn: boolean;
};

export function WorkspaceTopNav({ activeView, isLoggedIn }: WorkspaceTopNavProps) {
  const items: Array<{ label: WorkspaceView; href: string }> = [
    { label: "Directory", href: "/directory" },
    { label: "Providers", href: "/providers" },
    { label: "Must Haves", href: "/credits" },
  ];

  return (
    <nav style={{ position: "sticky", top: 0, zIndex: 50, background: C.bg, borderBottom: `1px solid ${C.border}`, height: `${SHELL_LAYOUT.topNavHeight}px`, display: "flex", alignItems: "center", padding: `0 ${SHELL_LAYOUT.pageXPadding}px`, justifyContent: "space-between" }}>
      <Link href="/" style={{ textDecoration: "none" }}>
        <span style={{ color: C.ink, fontWeight: 800, fontSize: "15px", letterSpacing: "0.08em", textTransform: "uppercase" }}>Launch Perks</span>
      </Link>
      <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
        {items.map((item) =>
          item.label === activeView ? (
            <span key={item.label} style={{ color: C.ink, fontSize: "14px", fontWeight: 600 }}>{item.label}</span>
          ) : (
            <Link key={item.label} href={item.href} style={{ color: C.mid, fontSize: "14px", textDecoration: "none", fontWeight: 500 }}>{item.label}</Link>
          )
        )}
        {isLoggedIn ? (
          <Link href="/dashboard" style={{ color: C.mid, fontSize: "14px", textDecoration: "none", fontWeight: 500 }}>Dashboard</Link>
        ) : (
          <Link href="/login" style={{ color: C.mid, fontSize: "14px", textDecoration: "none", fontWeight: 500 }}>Sign In</Link>
        )}
        {activeView !== "Must Haves" && (
          <Link href="/credits" style={{ textDecoration: "none" }}>
            <button
              style={{ background: C.orange, color: "white", border: "none", borderRadius: C.radius, padding: "9px 20px", fontWeight: 600, cursor: "pointer", fontSize: "14px", fontFamily: "inherit", transition: "background 0.15s" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = C.orangeHover)}
              onMouseLeave={(e) => (e.currentTarget.style.background = C.orange)}
            >
              Unlock Credits
            </button>
          </Link>
        )}
      </div>
    </nav>
  );
}