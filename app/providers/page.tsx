"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { Search, Lock, ArrowRight, Zap } from "lucide-react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const C = {
  bg:          "#ffffff",
  surface:     "#f7f7f5",
  ink:         "#0a0a0a",
  mid:         "#6b6b6b",
  light:       "#a3a3a3",
  border:      "#e5e5e5",
  orange:      "#ff4d00",
  orangeHover: "#e04400",
  tagBg:       "#f0f0ee",
  radius:      "8px",
};

const LOGO_TOKEN = "pk_cxNQIULxSGGw3kUd40puvg";

type Provider = {
  name: string;
  domain: string;
  value?: string;
  category: string;
  tags?: string[];
  description?: string;
  locked?: boolean;
};

function Logo({ domain, name }: { domain: string; name: string }) {
  const [failed, setFailed] = useState(false);
  return (
    <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: C.surface, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
      {failed ? (
        <span style={{ fontSize: "13px", fontWeight: 800, color: C.mid }}>{name[0]}</span>
      ) : (
        <img src={`https://img.logo.dev/${domain}?token=${LOGO_TOKEN}&size=40`} alt={name} width={28} height={28} style={{ objectFit: "contain" }} onError={() => setFailed(true)} />
      )}
    </div>
  );
}

function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}>
      {children}
    </motion.div>
  );
}

function ProviderCard({ provider, locked }: { provider: Provider; locked: boolean }) {
  return (
    <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "20px 22px", height: "100%", position: "relative", filter: locked ? "blur(3px)" : "none", userSelect: locked ? "none" : "auto", pointerEvents: locked ? "none" : "auto", transition: "all 0.15s" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px", marginBottom: "12px" }}>
        <Logo domain={provider.domain} name={provider.name} />
        <div style={{ display: "inline-block", padding: "2px 8px", background: C.tagBg, borderRadius: "4px", fontSize: "10px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: C.mid }}>
          {provider.category}
        </div>
      </div>
      <div style={{ fontSize: "15px", fontWeight: 800, color: C.ink, marginBottom: "4px" }}>{provider.name}</div>
      {provider.value && <div style={{ fontSize: "13px", fontWeight: 700, color: C.orange, marginBottom: "8px" }}>{provider.value}</div>}
      {provider.description && <p style={{ fontSize: "12px", color: C.mid, lineHeight: 1.6, marginBottom: "14px" }}>{provider.description}</p>}
      {provider.tags && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
          {provider.tags.slice(0, 3).map(tag => (
            <span key={tag} style={{ fontSize: "10px", padding: "2px 7px", borderRadius: "4px", background: C.surface, border: `1px solid ${C.border}`, color: C.light, fontWeight: 500 }}>{tag}</span>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProvidersPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [freeProviders, setFreeProviders] = useState<Provider[]>([]);
  const [lockedProviders, setLockedProviders] = useState<Provider[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isPro, setIsPro] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    async function fetchProviders() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const headers: Record<string, string> = {};
        if (session?.access_token) {
          headers["Authorization"] = `Bearer ${session.access_token}`;
        }
        const res = await fetch("/api/providers", { headers });
        const data = await res.json();
        setFreeProviders(data.free || []);
        setLockedProviders(data.locked || []);
        setTotal(data.total || 0);
        setIsPro(data.isPro || false);
        setIsLoggedIn(!!session);
      } catch (err) {
        console.error("Failed to fetch providers", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProviders();
  }, []);

  const allCategories = ["All", ...Array.from(new Set(freeProviders.map(p => p.category))).sort()];

  const filteredFree = freeProviders.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.description ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (p.tags ?? []).some(t => t.toLowerCase().includes(search.toLowerCase()));
    const matchCat = activeCategory === "All" || p.category === activeCategory;
    return matchSearch && matchCat;
  });

  const remainingCount = total - freeProviders.length;

  return (
    <div style={{ background: C.bg, minHeight: "100vh", fontFamily: "'Inter', sans-serif", WebkitFontSmoothing: "antialiased" as any }}>

      {/* NAV */}
      <nav style={{ position: "sticky", top: 0, zIndex: 50, background: C.bg, borderBottom: `1px solid ${C.border}`, height: "58px", display: "flex", alignItems: "center", padding: "0 48px", justifyContent: "space-between" }}>
        <Link href="/" style={{ textDecoration: "none" }}>
          <span style={{ color: C.ink, fontWeight: 800, fontSize: "15px", letterSpacing: "0.08em", textTransform: "uppercase" }}>FOUNDER OS</span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
          <Link href="/directory" style={{ color: C.mid, fontSize: "14px", textDecoration: "none", fontWeight: 500 }}>Directory</Link>
          <span style={{ color: C.ink, fontSize: "14px", fontWeight: 600 }}>Providers</span>
          {isLoggedIn ? (
            <Link href="/dashboard" style={{ color: C.mid, fontSize: "14px", textDecoration: "none", fontWeight: 500 }}>Dashboard</Link>
          ) : (
            <Link href="/login" style={{ color: C.mid, fontSize: "14px", textDecoration: "none", fontWeight: 500 }}>Sign In</Link>
          )}
          <Link href="/credits" style={{ textDecoration: "none" }}>
            <button style={{ background: C.orange, color: "white", border: "none", borderRadius: C.radius, padding: "9px 20px", fontWeight: 600, cursor: "pointer", fontSize: "14px", fontFamily: "inherit", transition: "background 0.15s" }}
              onMouseEnter={e => (e.currentTarget.style.background = C.orangeHover)}
              onMouseLeave={e => (e.currentTarget.style.background = C.orange)}>
              Unlock Credits
            </button>
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <div style={{ background: C.bg, borderBottom: `1px solid ${C.border}`, padding: "72px 48px 56px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div style={{ width: "40px", height: "4px", background: C.orange, borderRadius: "2px", marginBottom: "28px" }} />
            <p style={{ fontSize: "11px", color: C.light, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "12px", fontWeight: 600 }}>Startup Credits</p>
            <h1 style={{ fontSize: "clamp(36px, 5vw, 64px)", fontWeight: 900, letterSpacing: "-2px", color: C.ink, marginBottom: "12px", lineHeight: 1.02 }}>Providers</h1>
            <p style={{ color: C.mid, fontSize: "16px", marginBottom: "40px", lineHeight: 1.6, maxWidth: "520px" }}>
              {total}+ companies offering credits, discounts, and perks for startups.{" "}
              {!isPro && <span style={{ color: C.ink, fontWeight: 700 }}>Unlock all for $149.</span>}
              {isPro && <span style={{ color: C.ink, fontWeight: 700 }}>Full access unlocked. 🎉</span>}
            </p>
            <div style={{ display: "flex", gap: "40px", flexWrap: "wrap", marginBottom: "40px" }}>
              {[{ num: `${total}+`, label: "Total Providers" }, { num: "20+", label: "Categories" }, { num: "$1M+", label: "Potential Savings" }].map(({ num, label }) => (
                <div key={label}>
                  <div style={{ fontSize: "28px", fontWeight: 900, color: C.ink, letterSpacing: "-1px" }}>{num}</div>
                  <div style={{ fontSize: "12px", color: C.mid, marginTop: "2px", fontWeight: 500 }}>{label}</div>
                </div>
              ))}
            </div>
            <div style={{ position: "relative", maxWidth: "480px" }}>
              <Search style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", width: "15px", height: "15px", color: C.light, pointerEvents: "none" }} />
              <input type="text" placeholder="Search providers..." value={search} onChange={e => setSearch(e.target.value)}
                style={{ width: "100%", paddingLeft: "40px", paddingRight: "16px", paddingTop: "11px", paddingBottom: "11px", border: `1.5px solid ${C.border}`, borderRadius: "8px", fontSize: "14px", background: C.surface, color: C.ink, outline: "none", boxSizing: "border-box", fontFamily: "inherit", transition: "border-color 0.15s" }}
                onFocus={e => (e.currentTarget.style.borderColor = C.orange)}
                onBlur={e => (e.currentTarget.style.borderColor = C.border)} />
            </div>
          </motion.div>
        </div>
      </div>

      {/* FILTER BAR */}
      <div style={{ position: "sticky", top: "58px", zIndex: 40, background: C.bg, borderBottom: `1px solid ${C.border}`, padding: "12px 48px", display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
        {allCategories.map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)}
            style={{ padding: "6px 14px", borderRadius: "100px", fontSize: "12px", fontWeight: 500, cursor: "pointer", border: "1.5px solid", borderColor: activeCategory === cat ? C.ink : C.border, background: activeCategory === cat ? C.ink : C.bg, color: activeCategory === cat ? "#fff" : C.mid, transition: "all 0.12s", whiteSpace: "nowrap", fontFamily: "inherit" }}
            onMouseEnter={e => { if (activeCategory !== cat) { e.currentTarget.style.borderColor = C.ink; e.currentTarget.style.color = C.ink; } }}
            onMouseLeave={e => { if (activeCategory !== cat) { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.mid; } }}>
            {cat}
          </button>
        ))}
        <div style={{ marginLeft: "auto", fontSize: "13px", color: C.light, whiteSpace: "nowrap" }}>
          Showing <strong style={{ color: C.ink }}>{filteredFree.length}</strong> of <strong style={{ color: C.ink }}>{total}</strong> providers
        </div>
      </div>

      {/* GRID */}
      <div style={{ background: C.surface, padding: "32px 48px 0" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "80px 0", color: C.mid, fontSize: "14px" }}>Loading providers...</div>
          ) : (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "12px", marginBottom: "12px" }}>
                {filteredFree.map((provider, i) => (
                  <FadeIn key={provider.name + i} delay={Math.min(i * 0.02, 0.2)}>
                    <ProviderCard provider={provider} locked={false} />
                  </FadeIn>
                ))}
              </div>

              {remainingCount > 0 && (
                <div style={{ position: "relative", marginBottom: "0" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "12px" }}>
                    {lockedProviders.slice(0, 8).map((provider, i) => (
                      <ProviderCard key={provider.name + i} provider={provider} locked={true} />
                    ))}
                  </div>
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(247,247,245,0) 0%, rgba(247,247,245,0.7) 40%, rgba(247,247,245,1) 70%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", paddingBottom: "40px" }}>
                    <div style={{ textAlign: "center", maxWidth: "480px" }}>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: C.bg, border: `1px solid ${C.border}`, borderRadius: "999px", padding: "6px 16px", marginBottom: "16px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                        <Lock style={{ width: "12px", height: "12px", color: C.mid }} />
                        <span style={{ fontSize: "12px", color: C.mid, fontWeight: 600 }}>{remainingCount} more providers locked</span>
                      </div>
                      <h3 style={{ fontSize: "22px", fontWeight: 900, color: C.ink, letterSpacing: "-0.5px", marginBottom: "8px" }}>
                        {isLoggedIn ? "Unlock all providers" : "Sign in to unlock providers"}
                      </h3>
                      <p style={{ fontSize: "14px", color: C.mid, marginBottom: "20px", lineHeight: 1.6 }}>
                        {isLoggedIn
                          ? "Get full access to every provider, redemption codes, and step-by-step instructions. One-time $149."
                          : "Create a free account or sign in to get started."}
                      </p>
                      <Link href={isLoggedIn ? "/credits" : "/login"} style={{ textDecoration: "none" }}>
                        <button style={{ background: C.orange, color: "white", border: "none", borderRadius: C.radius, padding: "13px 28px", fontWeight: 700, cursor: "pointer", fontSize: "15px", display: "inline-flex", alignItems: "center", gap: "8px", fontFamily: "inherit", transition: "background 0.15s" }}
                          onMouseEnter={e => (e.currentTarget.style.background = C.orangeHover)}
                          onMouseLeave={e => (e.currentTarget.style.background = C.orange)}>
                          <Zap style={{ width: "15px", height: "15px" }} />
                          {isLoggedIn ? "Unlock All Providers — $149" : "Sign In to Unlock"}
                          <ArrowRight style={{ width: "15px", height: "15px" }} />
                        </button>
                      </Link>
                      {!isLoggedIn && (
                        <Link href="/login" style={{ textDecoration: "none" }}>
                          <p style={{ fontSize: "13px", color: C.mid, marginTop: "12px", cursor: "pointer" }}>
                            Don't have an account? <span style={{ color: C.orange, fontWeight: 600 }}>Create one free →</span>
                          </p>
                        </Link>
                      )}
                      <p style={{ fontSize: "12px", color: C.light, marginTop: "10px" }}>One-time payment · Instant access · Lifetime updates</p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* FOOTER */}
      <div style={{ borderTop: `1px solid ${C.border}`, padding: "32px 48px", marginTop: "80px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
        <span style={{ color: C.ink, fontWeight: 800, fontSize: "14px", letterSpacing: "0.08em", textTransform: "uppercase" }}>FOUNDER OS</span>
        <p style={{ fontSize: "13px", color: C.light }}>Built for founders, by founders.</p>
      </div>
    </div>
  );
}