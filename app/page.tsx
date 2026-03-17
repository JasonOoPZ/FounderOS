"use client";

import Link from "next/link";
import { ArrowRight, Zap, Lock, CheckCircle } from "lucide-react";
import { useState } from "react";

const C = {
  bg:          "#ffffff",
  surface:     "#f7f7f5",
  ink:         "#0a0a0a",
  mid:         "#6b6b6b",
  light:       "#a3a3a3",
  border:      "#e5e5e5",
  orange:      "#ff4d00",
  orangeHover: "#e04400",
  orangeLight: "#fff3ee",
  tagBg:       "#f0f0ee",
  radius:      "8px",
};

function Logo({ domain, name, size = 28, boxSize = 28, color }: { domain: string; name: string; size?: number; boxSize?: number; color?: string }) {
  const [failed, setFailed] = useState(false);
  const logoUrl = `/api/logo?domain=${encodeURIComponent(domain)}&size=${size * 2}`;

  return (
    <div style={{ width: `${boxSize}px`, height: `${boxSize}px`, borderRadius: "6px", background: failed ? (color || C.surface) : C.surface, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
      {failed ? (
        <span style={{ color: "#fff", fontSize: `${boxSize * 0.4}px`, fontWeight: 700 }}>{name[0]}</span>
      ) : (
        <img src={logoUrl} alt={name} width={size} height={size} style={{ objectFit: "contain" }} onError={() => setFailed(true)} />
      )}
    </div>
  );
}

const row1 = [
  { vendor: "Google Cloud", domain: "cloud.google.com", value: "$350,000", category: "Cloud", color: "#4285F4" },
  { vendor: "AWS", domain: "aws.amazon.com", value: "$100,000", category: "Cloud", color: "#FF9900" },
  { vendor: "Preferences AI", domain: "preferencesai.io", value: "$500", category: "AI", color: "#111827" },
  { vendor: "Stripe", domain: "stripe.com", value: "$50,000", category: "Finance", color: "#635BFF" },
  { vendor: "Notion", domain: "notion.so", value: "$12,000", category: "Productivity", color: "#000000" },
  { vendor: "Cloudflare", domain: "cloudflare.com", value: "$250,000", category: "Networking", color: "#F48120" },
  { vendor: "Mixpanel", domain: "mixpanel.com", value: "$150,000", category: "Analytics", color: "#7856FF" },
  { vendor: "GitHub", domain: "github.com", value: "20 seats free", category: "Dev Tools", color: "#24292e" },
  { vendor: "Intercom", domain: "intercom.com", value: "90% off", category: "Support", color: "#1F8DED" },
];
const row2 = [
  { vendor: "Datadog", domain: "datadoghq.com", value: "$800/yr", category: "Monitoring", color: "#632CA6" },
  { vendor: "Linear", domain: "linear.app", value: "6mo free", category: "PM", color: "#5E6AD2" },
  { vendor: "Retool", domain: "retool.com", value: "12mo free", category: "Dev Tools", color: "#3D3D3D" },
  { vendor: "PostHog", domain: "posthog.com", value: "$50,000", category: "Analytics", color: "#F54E00" },
  { vendor: "Neon", domain: "neon.tech", value: "$100,000", category: "Database", color: "#00E599" },
  { vendor: "OpenAI", domain: "openai.com", value: "$25,000", category: "AI", color: "#000000" },
  { vendor: "Sentry", domain: "sentry.io", value: "6mo free", category: "Monitoring", color: "#362D59" },
  { vendor: "Webflow", domain: "webflow.com", value: "12mo free", category: "No-Code", color: "#4353FF" },
];

function CreditCard({ vendor, domain, value, category, color }: { vendor: string; domain: string; value: string; category: string; color: string }) {
  return (
    <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "16px 20px", minWidth: "180px", flexShrink: 0, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
        <Logo domain={domain} name={vendor} size={20} boxSize={28} color={color} />
        <span style={{ fontSize: "0.8rem", fontWeight: 600, color: C.ink }}>{vendor}</span>
      </div>
      <div style={{ fontSize: "1.1rem", fontWeight: 800, color: C.ink, letterSpacing: "-0.02em" }}>{value}</div>
      <div style={{ fontSize: "0.65rem", color: C.light, marginTop: "4px", textTransform: "uppercase", letterSpacing: "0.08em" }}>{category}</div>
    </div>
  );
}

function TickerRow({ cards, direction }: { cards: typeof row1; direction: "left" | "right" }) {
  return (
    <div style={{ overflow: "hidden", width: "100%" }}>
      <div
        className={direction === "left" ? "ticker-left" : "ticker-right"}
        style={{ display: "flex", gap: "12px", width: "max-content" }}
      >
        {[...cards, ...cards].map((card, i) => <CreditCard key={i} {...card} />)}
      </div>
    </div>
  );
}

function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return <div style={{ transitionDelay: `${delay}s` }}>{children}</div>;
}

export default function HomePage() {
  const resources = 300;
  const creditsCount = 500;

  return (
    <div style={{ background: C.bg, color: C.ink, fontFamily: "'Inter', sans-serif", WebkitFontSmoothing: "antialiased" }}>

      {/* NAV */}
      <nav style={{ position: "sticky", top: 0, zIndex: 50, background: C.bg, borderBottom: `1px solid ${C.border}`, height: "58px", display: "flex", alignItems: "center", padding: "0 48px", justifyContent: "space-between" }}>
        <span style={{ color: C.ink, fontWeight: 800, fontSize: "15px", letterSpacing: "0.08em", textTransform: "uppercase" }}>LAUNCH PERKS</span>
        <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
          <Link href="/directory" style={{ color: C.mid, fontSize: "14px", textDecoration: "none", fontWeight: 500 }}>Directory</Link>
          <Link href="/providers" style={{ color: C.mid, fontSize: "14px", textDecoration: "none", fontWeight: 500 }}>Providers</Link>
          <Link href="/providers?category=Company%20Setup" style={{ color: C.mid, fontSize: "14px", textDecoration: "none", fontWeight: 500 }}>Company Setup</Link>
          <Link href="/login" style={{ color: C.mid, fontSize: "14px", textDecoration: "none", fontWeight: 500 }}>Sign In</Link>
          <Link href="/credits" style={{ textDecoration: "none" }}>
            <button style={{ background: C.orange, color: "white", border: "none", borderRadius: C.radius, padding: "9px 20px", fontWeight: 600, cursor: "pointer", fontSize: "14px", fontFamily: "inherit", transition: "background 0.15s" }}
              onMouseEnter={e => (e.currentTarget.style.background = C.orangeHover)}
              onMouseLeave={e => (e.currentTarget.style.background = C.orange)}>
              Must Haves
            </button>
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ padding: "100px 48px 80px", textAlign: "center", borderBottom: `1px solid ${C.border}` }}>
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", border: `1px solid ${C.border}`, borderRadius: "999px", padding: "5px 16px", marginBottom: "32px", background: C.surface }}>
            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: C.orange }} />
            <span style={{ fontSize: "11px", color: C.mid, letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600 }}>Startup Credits Platform</span>
          </div>

          <h1 style={{ fontSize: "clamp(42px, 7vw, 88px)", fontWeight: 900, lineHeight: 1.0, marginBottom: "24px", letterSpacing: "-3px", color: C.ink, maxWidth: "900px", margin: "0 auto 24px" }}>
            The fastest way to unlock<br />startup credits.
          </h1>

          <p style={{ fontSize: "18px", color: C.mid, lineHeight: 1.7, maxWidth: "480px", margin: "0 auto 44px" }}>
            300+ curated tools, free forever. Plus unlock{" "}
            <span style={{ color: C.ink, fontWeight: 700 }}>$500,000+ in startup credits</span>{" "}
            from AWS, Google Cloud, and Stripe for a one time $149.
          </p>

          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/directory" style={{ textDecoration: "none" }}>
              <button style={{ background: "transparent", border: `1.5px solid ${C.border}`, color: C.mid, borderRadius: C.radius, padding: "12px 24px", fontWeight: 500, cursor: "pointer", fontSize: "15px", fontFamily: "inherit", transition: "all 0.15s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = C.ink; e.currentTarget.style.color = C.ink; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.mid; }}>
                Browse Free Directory
              </button>
            </Link>
            <Link href="/credits" style={{ textDecoration: "none" }}>
              <button style={{ background: C.orange, color: "white", border: "none", borderRadius: C.radius, padding: "12px 28px", fontWeight: 700, cursor: "pointer", fontSize: "15px", display: "inline-flex", alignItems: "center", gap: "8px", fontFamily: "inherit", transition: "background 0.15s" }}
                onMouseEnter={e => (e.currentTarget.style.background = C.orangeHover)}
                onMouseLeave={e => (e.currentTarget.style.background = C.orange)}>
                Unlock $500K+ in Must Haves <ArrowRight style={{ width: "16px", height: "16px" }} />
              </button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", justifyContent: "center", gap: "64px", marginTop: "72px", paddingTop: "48px", borderTop: `1px solid ${C.border}`, flexWrap: "wrap" }}>
          {[
            { label: "Free Resources", value: `${resources}+` },
            { label: "Credit Value", value: `$${creditsCount}K+` },
            { label: "One time Fee", value: "$149" },
          ].map((stat) => (
            <div key={stat.label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: "40px", fontWeight: 900, color: C.ink, letterSpacing: "-2px", lineHeight: 1 }}>{stat.value}</div>
              <div style={{ fontSize: "13px", color: C.mid, marginTop: "6px", fontWeight: 500 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* TICKER */}
      <div style={{ padding: "28px 0", borderBottom: `1px solid ${C.border}`, background: C.surface, display: "flex", flexDirection: "column", gap: "12px", overflow: "hidden" }}>
        <TickerRow cards={row1} direction="left" />
        <TickerRow cards={row2} direction="right" />
      </div>

      {/* FREE TOOLS */}
      <section style={{ maxWidth: "1200px", margin: "0 auto", padding: "96px 48px" }}>
        <FadeIn>
          <div style={{ marginBottom: "56px" }}>
            <div style={{ width: "40px", height: "4px", background: C.orange, borderRadius: "2px", marginBottom: "28px" }} />
            <p style={{ fontSize: "11px", color: C.light, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "12px", fontWeight: 600 }}>Free Tier</p>
            <h2 style={{ fontSize: "clamp(32px, 4vw, 52px)", fontWeight: 900, letterSpacing: "-2px", color: C.ink, marginBottom: "12px" }}>Your startup toolkit.</h2>
            <p style={{ color: C.mid, fontSize: "16px", lineHeight: 1.7, maxWidth: "440px" }}>Every tool a startup needs, searchable and filterable. No account required.</p>
          </div>
        </FadeIn>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1px", border: `1px solid ${C.border}`, borderRadius: "12px", overflow: "hidden", background: C.border }}>
          {[
            { title: "Learning & Knowledge", description: "Essays, books, and courses from YC, Paul Graham, and top founders.", count: "50+ resources" },
            { title: "Tools & Software", description: "Design, analytics, automation, CRM, and dev tools for every stage.", count: "200+ tools" },
            { title: "Growth & Marketing", description: "Channels, tactics, and places to share and promote your product.", count: "100+ tactics" },
            { title: "Communities", description: "Indie Hackers, YC alumni networks, and active founder forums.", count: "30+ communities" },
            { title: "Fundraising", description: "Pitch deck examples, angel directories, and fundraising guides.", count: "40+ guides" },
            { title: "Startup Programs", description: "Public listings of AWS, GCP, Stripe, and other startup programs.", count: "60+ programs" },
          ].map((cat, i) => (
            <FadeIn key={cat.title} delay={i * 0.07}>
              <div style={{ background: C.bg, padding: "32px 28px", height: "100%", transition: "background 0.12s" }}
                onMouseEnter={e => (e.currentTarget.style.background = C.surface)}
                onMouseLeave={e => (e.currentTarget.style.background = C.bg)}>
                <div style={{ fontSize: "10px", color: C.light, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "12px", fontWeight: 600 }}>{cat.count}</div>
                <h3 style={{ fontWeight: 700, marginBottom: "8px", color: C.ink, fontSize: "15px" }}>{cat.title}</h3>
                <p style={{ fontSize: "13px", color: C.mid, lineHeight: 1.65 }}>{cat.description}</p>
              </div>
            </FadeIn>
          ))}
        </div>

        <div style={{ marginTop: "28px" }}>
          <Link href="/directory" style={{ textDecoration: "none" }}>
            <button style={{ background: "transparent", border: `1.5px solid ${C.border}`, color: C.mid, borderRadius: C.radius, padding: "10px 20px", cursor: "pointer", fontSize: "14px", display: "inline-flex", alignItems: "center", gap: "6px", fontFamily: "inherit", fontWeight: 500, transition: "all 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = C.ink; e.currentTarget.style.color = C.ink; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.mid; }}>
              Browse all resources <ArrowRight style={{ width: "14px", height: "14px" }} />
            </button>
          </Link>
        </div>
      </section>

      {/* PREMIUM CTA */}
      <FadeIn>
        <section style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 48px 112px", borderTop: `1px solid ${C.border}` }}>
          <div style={{ border: `1.5px solid ${C.border}`, borderRadius: "16px", padding: "64px 72px", background: C.bg, marginTop: "96px" }}>
            <div style={{ width: "40px", height: "4px", background: C.orange, borderRadius: "2px", marginBottom: "28px" }} />
            <p style={{ fontSize: "11px", color: C.light, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "16px", fontWeight: 600 }}>Premium · One time $149</p>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 52px)", fontWeight: 900, letterSpacing: "-2px", color: C.ink, marginBottom: "16px" }}>
              Unlock $500K+ in startup credits.
            </h2>
            <p style={{ color: C.mid, marginBottom: "48px", maxWidth: "480px", lineHeight: 1.7, fontSize: "16px" }}>
              Exact redemption codes and step by step instructions for AWS, Google Cloud, Stripe, and more. Pay once, access forever.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "40px" }}>
              {[
                { vendor: "Google Cloud", domain: "cloud.google.com", value: "$350,000", color: "#4285F4" },
                { vendor: "AWS Activate", domain: "aws.amazon.com", value: "$100,000", color: "#FF9900" },
                { vendor: "Stripe", domain: "stripe.com", value: "$50,000", color: "#635BFF" },
                { vendor: "Notion", domain: "notion.so", value: "$12,000", color: "#000000" },
              ].map((credit) => (
                <div key={credit.vendor} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: "10px", padding: "18px 20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                    <Logo domain={credit.domain} name={credit.vendor} size={18} boxSize={26} color={credit.color} />
                    <Lock style={{ width: "11px", height: "11px", color: C.border }} />
                  </div>
                  <div style={{ fontSize: "22px", fontWeight: 900, color: C.ink, letterSpacing: "-1px" }}>{credit.value}</div>
                  <div style={{ fontSize: "13px", color: C.mid, marginTop: "4px" }}>{credit.vendor}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "24px", marginBottom: "40px" }}>
              {["Exact redemption codes", "Step by step instructions", "Eligibility checker", "Lifetime updates"].map((perk) => (
                <div key={perk} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: C.mid }}>
                  <CheckCircle style={{ width: "14px", height: "14px", color: C.orange }} /> {perk}
                </div>
              ))}
            </div>

            <Link href="/credits" style={{ textDecoration: "none" }}>
              <button style={{ background: C.orange, color: "white", border: "none", borderRadius: C.radius, padding: "14px 32px", fontWeight: 700, cursor: "pointer", fontSize: "16px", display: "inline-flex", alignItems: "center", gap: "8px", fontFamily: "inherit", transition: "background 0.15s" }}
                onMouseEnter={e => (e.currentTarget.style.background = C.orangeHover)}
                onMouseLeave={e => (e.currentTarget.style.background = C.orange)}>
                <Zap style={{ width: "16px", height: "16px" }} />
                Get Lifetime Access — $149
                <ArrowRight style={{ width: "16px", height: "16px" }} />
              </button>
            </Link>
            <p style={{ fontSize: "13px", color: C.light, marginTop: "14px" }}>One time payment · No subscription · Instant access</p>
          </div>
        </section>
      </FadeIn>

      {/* FOOTER */}
      <footer style={{ borderTop: `1px solid ${C.border}`, padding: "36px 48px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
          <span style={{ color: C.ink, fontWeight: 800, fontSize: "14px", letterSpacing: "0.08em", textTransform: "uppercase" }}>LAUNCH PERKS</span>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
            <Link href="/about" style={{ fontSize: "13px", color: C.mid, textDecoration: "none" }}>About Us</Link>
            <Link href="/terms" style={{ fontSize: "13px", color: C.mid, textDecoration: "none" }}>Terms</Link>
            <Link href="/privacy" style={{ fontSize: "13px", color: C.mid, textDecoration: "none" }}>Privacy</Link>
            <Link href="/contact" style={{ fontSize: "13px", color: C.mid, textDecoration: "none" }}>Contact</Link>
            <p style={{ fontSize: "13px", color: C.light }}>Built for founders, by founders.</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
