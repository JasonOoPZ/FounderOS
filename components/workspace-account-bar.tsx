"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, CreditCard, LayoutDashboard, LogOut, Sparkles } from "lucide-react";
import { SHELL_LAYOUT } from "@/lib/ui-shell";
import { APP_THEME } from "@/lib/ui-theme";

const C = {
  ...APP_THEME,
};

type WorkspaceAccountBarProps = {
  currentView: string;
  email?: string | null;
  isLoggedIn: boolean;
  isPro: boolean;
  onSignOut?: () => void;
};

export function WorkspaceAccountBar({ currentView, email, isLoggedIn, isPro, onSignOut }: WorkspaceAccountBarProps) {
  const [showAccountMenu, setShowAccountMenu] = useState(false);

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #ffffff 0%, #faf7f3 100%)",
        border: `1px solid ${C.border}`,
        borderRadius: "14px",
        padding: "16px 18px",
        marginBottom: `${SHELL_LAYOUT.accountBarGapBottom}px`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "16px",
        flexWrap: "wrap",
        boxShadow: "0 8px 24px rgba(0,0,0,0.04)",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <span style={{ fontSize: "11px", color: C.light, letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 700 }}>Workspace</span>
          <span style={{ fontSize: "11px", color: C.light }}>•</span>
          <span style={{ fontSize: "11px", color: C.ink, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>{currentView}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <span style={{ fontSize: "14px", color: C.ink, fontWeight: 700 }}>{isLoggedIn ? (email || "Signed in") : "Guest mode"}</span>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              borderRadius: "999px",
              padding: "5px 10px",
              background: isPro ? C.ink : C.bg,
              color: isPro ? "#fff" : C.mid,
              border: isPro ? "1px solid transparent" : `1px solid ${C.border}`,
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            <Sparkles style={{ width: "11px", height: "11px" }} />
            {isPro ? "Pro Access" : isLoggedIn ? "Free Access" : "Not Signed In"}
          </span>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
        <Link href="/dashboard" style={{ textDecoration: "none" }}>
          <button
            style={{
              background: C.bg,
              color: C.mid,
              border: `1px solid ${C.border}`,
              borderRadius: C.radius,
              padding: "9px 14px",
              fontWeight: 600,
              cursor: "pointer",
              fontSize: "13px",
              display: "inline-flex",
              alignItems: "center",
              gap: "7px",
              fontFamily: "inherit",
            }}
          >
            <LayoutDashboard style={{ width: "13px", height: "13px" }} /> Dashboard
          </button>
        </Link>
        {isLoggedIn ? (
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setShowAccountMenu((prev) => !prev)}
              style={{
                background: C.orange,
                color: "#fff",
                border: "none",
                borderRadius: C.radius,
                padding: "9px 14px",
                fontWeight: 700,
                cursor: "pointer",
                fontSize: "13px",
                display: "inline-flex",
                alignItems: "center",
                gap: "7px",
                fontFamily: "inherit",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = C.orangeHover)}
              onMouseLeave={(e) => (e.currentTarget.style.background = C.orange)}
            >
              Account <ChevronDown style={{ width: "13px", height: "13px" }} />
            </button>

            {showAccountMenu && (
              <div
                style={{
                  position: "absolute",
                  right: 0,
                  top: "calc(100% + 8px)",
                  minWidth: "250px",
                  background: C.bg,
                  border: `1px solid ${C.border}`,
                  borderRadius: "10px",
                  boxShadow: "0 16px 32px rgba(0,0,0,0.12)",
                  padding: "10px",
                  zIndex: 120,
                }}
              >
                <div style={{ padding: "6px 8px 10px", borderBottom: `1px solid ${C.border}`, marginBottom: "8px" }}>
                  <div style={{ fontSize: "11px", color: C.light, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, marginBottom: "4px" }}>Signed in as</div>
                  <div style={{ fontSize: "13px", color: C.ink, fontWeight: 700, wordBreak: "break-word" }}>{email || "Account"}</div>
                  <div style={{ fontSize: "12px", color: C.mid, marginTop: "4px" }}>Plan: {isPro ? "Pro" : "Free"}</div>
                </div>

                <Link href="/credits" style={{ textDecoration: "none" }}>
                  <button
                    style={{ width: "100%", background: "transparent", border: "1px solid transparent", borderRadius: "8px", padding: "8px 10px", color: C.mid, fontSize: "13px", fontWeight: 600, display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = C.surface)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <CreditCard style={{ width: "13px", height: "13px" }} /> {isPro ? "Manage Plan" : "Upgrade to Pro"}
                  </button>
                </Link>

                {onSignOut && (
                  <button
                    onClick={onSignOut}
                    style={{ width: "100%", background: "transparent", border: "1px solid transparent", borderRadius: "8px", padding: "8px 10px", color: C.mid, fontSize: "13px", fontWeight: 600, display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = C.surface)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <LogOut style={{ width: "13px", height: "13px" }} /> Sign out
                  </button>
                )}
              </div>
            )}
          </div>
        ) : (
          <Link href="/login" style={{ textDecoration: "none" }}>
            <button
              style={{
                background: C.orange,
                color: "#fff",
                border: "none",
                borderRadius: C.radius,
                padding: "9px 14px",
                fontWeight: 700,
                cursor: "pointer",
                fontSize: "13px",
                fontFamily: "inherit",
              }}
            >
              Sign In
            </button>
          </Link>
        )}
      </div>
    </div>
  );
}