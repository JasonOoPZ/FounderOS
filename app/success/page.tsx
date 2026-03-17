"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle, ArrowRight, Zap } from "lucide-react";

const C = {
  bg:      "#ffffff",
  surface: "#f7f7f5",
  ink:     "#0a0a0a",
  mid:     "#6b6b6b",
  light:   "#a3a3a3",
  border:  "#e5e5e5",
  orange:  "#ff4d00",
  radius:  "8px",
};

const nextSteps = [
  { step: "1", title: "Go to your dashboard", body: "Your Credits and Providers tabs are now unlocked with full instructions.", href: "/dashboard" },
  { step: "2", title: "Apply to Notion first", body: "Takes 2 minutes and approves in 1–2 days. Easiest win to start with." },
  { step: "3", title: "Then tackle AWS & GCP", body: "Have your funding docs ready. Worth $450K combined — don't skip these." },
];

export default function SuccessPage() {
  const [email, setEmail] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email) setEmail(session.user.email);
    });
  }, []);

  return (
    <div style={{ background: C.bg, minHeight: "100vh", fontFamily: "'Inter', sans-serif", WebkitFontSmoothing: "antialiased" }}>

      {/* NAV */}
      <nav style={{ borderBottom: `1px solid ${C.border}`, height: "58px", display: "flex", alignItems: "center", padding: "0 48px", justifyContent: "space-between" }}>
        <Link href="/" style={{ textDecoration: "none" }}>
          <span style={{ color: C.ink, fontWeight: 800, fontSize: "15px", letterSpacing: "0.08em", textTransform: "uppercase" }}>Launch Perks</span>
        </Link>
      </nav>

      {/* MAIN */}
      <div style={{ maxWidth: "600px", margin: "0 auto", padding: "80px 48px", textAlign: "center" }}>
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>

          {/* Success icon */}
          <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "#f0fdf4", border: "1.5px solid #bbf7d0", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 28px" }}>
            <CheckCircle style={{ width: "28px", height: "28px", color: "#16a34a" }} />
          </div>

          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: "999px", padding: "4px 14px", marginBottom: "20px" }}>
            <Zap style={{ width: "11px", height: "11px", color: C.orange }} />
            <span style={{ fontSize: "11px", color: C.mid, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>Payment confirmed</span>
          </div>

          <h1 style={{ fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 900, color: C.ink, letterSpacing: "-2px", lineHeight: 1.05, marginBottom: "16px" }}>
            You&apos;re in. 🎉
          </h1>

          <p style={{ fontSize: "16px", color: C.mid, lineHeight: 1.7, marginBottom: "8px" }}>
            Welcome to Launch Perks Pro.
          </p>
          {email && (
            <p style={{ fontSize: "14px", color: C.light, marginBottom: "48px" }}>
              Access granted to <strong style={{ color: C.ink }}>{email}</strong>
            </p>
          )}

          {/* CTA */}
          <Link href="/dashboard" style={{ textDecoration: "none" }}>
            <button style={{ background: C.orange, color: "white", border: "none", borderRadius: C.radius, padding: "14px 32px", fontWeight: 700, cursor: "pointer", fontSize: "16px", display: "inline-flex", alignItems: "center", gap: "8px", fontFamily: "inherit", marginBottom: "48px" }}>
              Go to Dashboard <ArrowRight style={{ width: "16px", height: "16px" }} />
            </button>
          </Link>

          {/* Divider */}
          <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: "40px", textAlign: "left" }}>
            <p style={{ fontSize: "11px", color: C.light, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "20px", fontWeight: 600 }}>What to do next</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {nextSteps.map((item) => (
                <div key={item.step} style={{ display: "flex", gap: "16px", alignItems: "flex-start", background: C.surface, border: `1px solid ${C.border}`, borderRadius: "10px", padding: "18px 20px" }}>
                  <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: C.ink, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontSize: "11px", color: "#fff", fontWeight: 700 }}>{item.step}</span>
                  </div>
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: 700, color: C.ink, marginBottom: "4px" }}>
                      {item.href ? <Link href={item.href} style={{ color: C.ink, textDecoration: "none" }}>{item.title} →</Link> : item.title}
                    </div>
                    <div style={{ fontSize: "13px", color: C.mid, lineHeight: 1.6 }}>{item.body}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </motion.div>
      </div>
    </div>
  );
}