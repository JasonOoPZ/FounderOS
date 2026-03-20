"use client";

import { Suspense, useState, useRef, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { Search, Lock, ArrowRight, Zap, ExternalLink, Clock3, DollarSign, Target } from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
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

type Provider = {
  name: string;
  domain: string;
  value?: string;
  category: string;
  tags?: string[];
  description?: string;
  applyUrl?: string;
  locked?: boolean;
};

const COMPANY_SETUP_HIGHLIGHTS = [
  "Hong Kong company incorporation, often completed in 1 to 2 business days.",
  "BVI company formation with registered agent support and tax neutral structuring.",
  "Hong Kong corporate bank account opening assistance with document preparation and follow up.",
  "Corporate secretarial support including annual returns, statutory registers, and compliance reminders.",
  "Document checklist support, including KYC for beneficial owners and entity setup paperwork.",
];

const PREFERENCES_AI_HIGHLIGHTS = [
  "Bring your own customer data or launch targeted surveys to seed high quality preference signals.",
  "Build digital personas that model how customer segments respond before launching campaigns or features.",
  "Run predictive market simulations to compare product positioning, messaging, and pricing options.",
  "Use startup credits to test GTM assumptions faster and reduce wasted spend on early experiments.",
  "Turn qualitative feedback and behavioral data into repeatable decision support for product and growth teams.",
];

const FEATURED_SETUP_ORDER = ["Sane Choice", "Preferences AI"];

const FEATURED_SETUP_DETAILS: Record<string, { title: string; subtitle: string; highlights: string[]; ctaLabel: string }> = {
  "Sane Choice": {
    title: "BVI incorporation plus Hong Kong banking setup",
    subtitle: "Featured Company Setup",
    highlights: COMPANY_SETUP_HIGHLIGHTS,
    ctaLabel: "Book Consultation",
  },
  "Preferences AI": {
    title: "AI powered preference modeling for faster GTM setup",
    subtitle: "Featured Setup Partner",
    highlights: PREFERENCES_AI_HIGHLIGHTS,
    ctaLabel: "Visit Preferences AI",
  },
};

const PROVIDER_OUTCOME_FOCUS = {
  speed: {
    label: "Ship Faster",
    headline: "Find the right provider in minutes, not weeks.",
    subcopy: "Skip random browsing and move straight to partner options that help you execute this quarter.",
    proof: "Shortlist providers by outcome and category so your team can make decisions fast.",
    urgency: "Every delayed decision slows product velocity and GTM execution.",
  },
  burn: {
    label: "Reduce Burn",
    headline: "Protect runway with credits and high leverage provider choices.",
    subcopy: "Use proven perks and discounts to cut non-core spend while keeping momentum high.",
    proof: "Curated providers and credits can free budget for growth, hiring, and customer acquisition.",
    urgency: "Burn compounds monthly. Better provider choices now buy you more runway later.",
  },
  focus: {
    label: "Stay Focused",
    headline: "Stop context switching and move in one clear direction.",
    subcopy: "Use a focused provider stack by category so your team spends less time debating and more time shipping.",
    proof: "Clear partner decisions reduce operational drag and execution noise.",
    urgency: "Confusion is expensive. Focus creates compounding execution advantage.",
  },
} as const;

type ProviderOutcomeKey = keyof typeof PROVIDER_OUTCOME_FOCUS;

function Logo({ domain, name }: { domain: string; name: string }) {
  const [failed, setFailed] = useState(false);
  const logoUrl = `/api/logo?domain=${encodeURIComponent(domain)}&size=40`;
  
  return (
    <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: C.surface, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
      {failed ? (
        <span style={{ fontSize: "13px", fontWeight: 800, color: C.mid }}>{name[0]}</span>
      ) : (
        <img src={logoUrl} alt={name} width={28} height={28} style={{ objectFit: "contain" }} onError={() => setFailed(true)} />
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

function getShortDescription(text?: string, limit = 120) {
  if (!text) return "";
  if (text.length <= limit) return text;
  const trimmed = text.slice(0, limit);
  const lastSpace = trimmed.lastIndexOf(" ");
  return `${(lastSpace > 0 ? trimmed.slice(0, lastSpace) : trimmed).trim()}...`;
}

function ProviderCard({ provider, locked, onOpen }: { provider: Provider; locked: boolean; onOpen?: () => void }) {
  return (
    <div
      onClick={!locked ? onOpen : undefined}
      style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "20px 22px", height: "100%", position: "relative", filter: locked ? "blur(3px)" : "none", userSelect: locked ? "none" : "auto", pointerEvents: locked ? "none" : "auto", transition: "all 0.15s", cursor: locked ? "default" : "pointer" }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px", marginBottom: "12px" }}>
        <Logo domain={provider.domain} name={provider.name} />
        <div style={{ display: "inline-block", padding: "2px 8px", background: C.tagBg, borderRadius: "4px", fontSize: "10px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: C.mid }}>
          {provider.category}
        </div>
      </div>
      <div style={{ fontSize: "15px", fontWeight: 800, color: C.ink, marginBottom: "4px" }}>{provider.name}</div>
      {provider.value && <div style={{ fontSize: "13px", fontWeight: 700, color: C.orange, marginBottom: "8px" }}>{provider.value}</div>}
      {provider.description && <p style={{ fontSize: "12px", color: C.mid, lineHeight: 1.6, marginBottom: "10px" }}>{getShortDescription(provider.description)}</p>}
      {!locked && <p style={{ fontSize: "11px", color: C.light, marginBottom: "12px" }}>Click to expand</p>}
      {provider.tags && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
          {provider.tags.slice(0, 3).map(tag => (
            <span key={tag} style={{ fontSize: "10px", padding: "2px 7px", borderRadius: "4px", background: C.surface, border: `1px solid ${C.border}`, color: C.light, fontWeight: 500 }}>{tag.replace(/-/g, " ")}</span>
          ))}
        </div>
      )}
    </div>
  );
}

function ProvidersPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [freeProviders, setFreeProviders] = useState<Provider[]>([]);
  const [lockedProviders, setLockedProviders] = useState<Provider[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isPro, setIsPro] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [potentialSavingsLabel, setPotentialSavingsLabel] = useState("$1M+");
  const [featuredSetupIndex, setFeaturedSetupIndex] = useState(0);
  const [featuredSetupVisible, setFeaturedSetupVisible] = useState(true);
  const [outcomeKey, setOutcomeKey] = useState<ProviderOutcomeKey>("speed");

  useEffect(() => {
    async function fetchProviders() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const headers: Record<string, string> = {};
        if (session?.access_token) {
          headers["Authorization"] = `Bearer ${session.access_token}`;
        }
        const res = await fetch("/api/providers", { headers });
        
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: Failed to fetch providers`);
        }
        
        const data = await res.json();
        setFreeProviders(data.free || []);
        setLockedProviders(data.locked || []);
        setTotal(data.total || 0);
        setIsPro(data.isPro || false);
        setPotentialSavingsLabel(data.totalPotentialSavingsLabel || "$1M+");
        setIsLoggedIn(!!session);
      } catch (err) {
        console.error("Failed to fetch providers", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProviders();
  }, []);

  useEffect(() => {
    const categoryParam = searchParams.get("category");
    setActiveCategory(categoryParam || "All");
  }, [searchParams]);

  const allCategories = ["All", ...Array.from(new Set(freeProviders.map(p => p.category))).sort().filter((cat) => cat !== "Company Setup")];

  const filteredFree = freeProviders.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.description ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (p.tags ?? []).some(t => t.toLowerCase().includes(search.toLowerCase()));
    const matchCat = activeCategory === "All" || p.category === activeCategory;
    return matchSearch && matchCat;
  });

  const featuredSetups = FEATURED_SETUP_ORDER
    .map((name) => freeProviders.find((p) => p.name === name))
    .filter((provider): provider is Provider => Boolean(provider));

  const activeFeaturedSetup = featuredSetups.length > 0
    ? featuredSetups[featuredSetupIndex % featuredSetups.length]
    : null;

  const activeFeaturedSetupDetails = activeFeaturedSetup
    ? FEATURED_SETUP_DETAILS[activeFeaturedSetup.name]
    : null;

  const shouldShowFeaturedSetup =
    !!activeFeaturedSetup &&
    search.trim().length === 0;

  useEffect(() => {
    setFeaturedSetupIndex(0);
    setFeaturedSetupVisible(true);
  }, [featuredSetups.length]);

  useEffect(() => {
    if (featuredSetups.length <= 1) return;

    const interval = window.setInterval(() => {
      setFeaturedSetupVisible(false);
      window.setTimeout(() => {
        setFeaturedSetupIndex((prev) => (prev + 1) % featuredSetups.length);
        setFeaturedSetupVisible(true);
      }, 350);
    }, 10000);

    return () => window.clearInterval(interval);
  }, [featuredSetups.length]);

  const remainingCount = total - freeProviders.length;
  const activeOutcome = PROVIDER_OUTCOME_FOCUS[outcomeKey];

  function providerNarrative(provider: Provider): string {
    const valueText = provider.value ? `with ${provider.value} in startup benefits` : "with meaningful startup perks";
    const tagText = provider.tags && provider.tags.length > 0 ? ` focused on ${provider.tags.slice(0, 3).join(", ")}` : "";
    return `${provider.name} is a ${provider.category.toLowerCase()} partner ${valueText}${tagText}. This can help founders reduce burn, ship faster, and unlock compounding advantages early.`;
  }

  return (
    <div style={{ background: C.bg, minHeight: "100vh", fontFamily: "'Inter', sans-serif", WebkitFontSmoothing: "antialiased" }}>

      {/* NAV */}
      <nav style={{ position: "sticky", top: 0, zIndex: 50, background: C.bg, borderBottom: `1px solid ${C.border}`, height: "58px", display: "flex", alignItems: "center", padding: "0 48px", justifyContent: "space-between" }}>
        <Link href="/" style={{ textDecoration: "none" }}>
          <span style={{ color: C.ink, fontWeight: 800, fontSize: "15px", letterSpacing: "0.08em", textTransform: "uppercase" }}>Launch Perks</span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
          <Link href="/directory" style={{ color: C.mid, fontSize: "14px", textDecoration: "none", fontWeight: 500 }}>Directory</Link>
          <span onClick={() => router.push("/providers")} style={{ color: C.ink, fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>Providers</span>
          {isLoggedIn ? (
            <Link href="/dashboard" style={{ color: C.mid, fontSize: "14px", textDecoration: "none", fontWeight: 500 }}>Dashboard</Link>
          ) : (
            <Link href="/login" style={{ color: C.mid, fontSize: "14px", textDecoration: "none", fontWeight: 500 }}>Sign In</Link>
          )}
          <Link href="/credits" style={{ textDecoration: "none" }}>
            <button onClick={(e) => { e.preventDefault(); router.push("/credits"); }} style={{ background: C.orange, color: "white", border: "none", borderRadius: C.radius, padding: "9px 20px", fontWeight: 600, cursor: "pointer", fontSize: "14px", fontFamily: "inherit", transition: "background 0.15s" }}
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
            <p style={{ fontSize: "11px", color: C.light, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "12px", fontWeight: 700 }}>Outcome Driven Providers</p>
            <h1 style={{ fontSize: "clamp(34px, 5vw, 62px)", fontWeight: 900, letterSpacing: "-2px", color: C.ink, marginBottom: "12px", lineHeight: 1.02, maxWidth: "900px" }}>{activeOutcome.headline}</h1>
            <p style={{ color: C.mid, fontSize: "16px", marginBottom: "18px", lineHeight: 1.65, maxWidth: "760px" }}>
              {activeOutcome.subcopy}
            </p>

            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "18px" }}>
              {(Object.keys(PROVIDER_OUTCOME_FOCUS) as ProviderOutcomeKey[]).map((key) => (
                <button
                  key={key}
                  onClick={() => setOutcomeKey(key)}
                  style={{
                    padding: "8px 14px",
                    borderRadius: "999px",
                    border: "1.5px solid",
                    borderColor: outcomeKey === key ? C.ink : C.border,
                    background: outcomeKey === key ? C.ink : C.bg,
                    color: outcomeKey === key ? "#fff" : C.mid,
                    fontSize: "12px",
                    fontWeight: 700,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    transition: "all 0.12s",
                  }}
                >
                  {PROVIDER_OUTCOME_FOCUS[key].label}
                </button>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: "10px", marginBottom: "24px", maxWidth: "960px" }}>
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: "10px", padding: "12px 14px", display: "flex", alignItems: "center", gap: "10px" }}>
                <Clock3 style={{ width: "14px", height: "14px", color: C.orange, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: "11px", color: C.light, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}>Execution speed</div>
                  <div style={{ fontSize: "13px", color: C.ink, fontWeight: 700 }}>{activeOutcome.proof}</div>
                </div>
              </div>
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: "10px", padding: "12px 14px", display: "flex", alignItems: "center", gap: "10px" }}>
                <DollarSign style={{ width: "14px", height: "14px", color: C.orange, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: "11px", color: C.light, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}>Savings surface area</div>
                  <div style={{ fontSize: "13px", color: C.ink, fontWeight: 700 }}>{potentialSavingsLabel} in potential savings across {total}+ providers.</div>
                </div>
              </div>
              <div style={{ background: "#fff3ee", border: "1px solid rgba(255,77,0,0.25)", borderRadius: "10px", padding: "12px 14px", display: "flex", alignItems: "center", gap: "10px" }}>
                <Target style={{ width: "14px", height: "14px", color: C.orange, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: "11px", color: C.light, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}>Urgency</div>
                  <div style={{ fontSize: "13px", color: C.ink, fontWeight: 700 }}>{activeOutcome.urgency}</div>
                </div>
              </div>
            </div>

            <p style={{ color: C.mid, fontSize: "15px", marginBottom: "28px", lineHeight: 1.6, maxWidth: "760px" }}>
              {total}+ companies offering credits, discounts, and perks for startups.{" "}
              {!isPro && <span style={{ color: C.ink, fontWeight: 700 }}>Unlock all for $149 and make faster, lower-risk decisions now.</span>}
              {isPro && <span style={{ color: C.ink, fontWeight: 700 }}>Full access unlocked. Keep execution tight.</span>}
            </p>
            <div style={{ display: "flex", gap: "40px", flexWrap: "wrap", marginBottom: "34px" }}>
              {[{ num: `${total}+`, label: "Total Providers" }, { num: "20+", label: "Categories" }, { num: potentialSavingsLabel, label: "Potential Savings" }].map(({ num, label }) => (
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

      {shouldShowFeaturedSetup && activeFeaturedSetup && activeFeaturedSetupDetails && (
        <div style={{ background: C.surface, padding: "28px 48px 0" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <div
              style={{
                background: "linear-gradient(135deg, #fff7f3 0%, #ffffff 60%)",
                border: `1px solid ${C.border}`,
                borderRadius: "14px",
                padding: "24px",
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "20px",
                opacity: featuredSetupVisible ? 1 : 0,
                transition: "opacity 0.35s ease",
              }}
            >
              <div>
                <p style={{ fontSize: "11px", color: C.light, letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600, marginBottom: "8px" }}>{activeFeaturedSetupDetails.subtitle}</p>
                <h2 style={{ margin: 0, fontSize: "30px", color: C.ink, letterSpacing: "-0.8px", fontWeight: 900 }}>{activeFeaturedSetupDetails.title}</h2>
                <p style={{ fontSize: "14px", color: C.mid, lineHeight: 1.7, marginTop: "10px", marginBottom: "14px" }}>
                  {activeFeaturedSetup.description}
                </p>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  <button onClick={() => setSelectedProvider(activeFeaturedSetup)} style={{ background: C.ink, color: "#fff", border: "none", borderRadius: C.radius, padding: "10px 16px", fontWeight: 700, cursor: "pointer", fontSize: "13px", fontFamily: "inherit" }}>
                    View Setup Details
                  </button>
                  {(activeFeaturedSetup.applyUrl || activeFeaturedSetup.domain) && (
                    <button onClick={() => window.open(activeFeaturedSetup.applyUrl || `https://${activeFeaturedSetup.domain}`, '_blank')} style={{ background: C.orange, color: "#fff", border: "none", borderRadius: C.radius, padding: "10px 16px", fontWeight: 700, cursor: "pointer", fontSize: "13px", display: "inline-flex", alignItems: "center", gap: "6px", fontFamily: "inherit" }}>
                      {activeFeaturedSetupDetails.ctaLabel} <ExternalLink style={{ width: "12px", height: "12px" }} />
                    </button>
                  )}
                </div>
              </div>
              <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: "10px", padding: "14px" }}>
                <p style={{ margin: 0, fontSize: "12px", color: C.ink, fontWeight: 700, marginBottom: "10px" }}>What founders get:</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {activeFeaturedSetupDetails.highlights.slice(0, 4).map((item) => (
                    <div key={item} style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                      <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: C.orange, marginTop: "6px", flexShrink: 0 }} />
                      <span style={{ fontSize: "12px", color: C.mid, lineHeight: 1.55 }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
                    <ProviderCard provider={provider} locked={false} onOpen={() => setSelectedProvider(provider)} />
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
                          ? "Get full access to every provider, redemption codes, and step by step instructions. One time $149."
                          : "Create a free account or sign in to get started."}
                      </p>
                      <Link href={isLoggedIn ? "/credits" : "/login"} style={{ textDecoration: "none" }}>
                        <button onClick={(e) => { e.preventDefault(); router.push(isLoggedIn ? "/credits" : "/login"); }} style={{ background: C.orange, color: "white", border: "none", borderRadius: C.radius, padding: "13px 28px", fontWeight: 700, cursor: "pointer", fontSize: "15px", display: "inline-flex", alignItems: "center", gap: "8px", fontFamily: "inherit", transition: "background 0.15s" }}
                          onMouseEnter={e => (e.currentTarget.style.background = C.orangeHover)}
                          onMouseLeave={e => (e.currentTarget.style.background = C.orange)}>
                          <Zap style={{ width: "15px", height: "15px" }} />
                          {isLoggedIn ? "Unlock All Providers — $149" : "Sign In to Unlock"}
                          <ArrowRight style={{ width: "15px", height: "15px" }} />
                        </button>
                      </Link>
                      {!isLoggedIn && (
                        <p onClick={() => router.push("/login")} style={{ fontSize: "13px", color: C.mid, marginTop: "12px", cursor: "pointer" }}>
                          Don&apos;t have an account? <span style={{ color: C.orange, fontWeight: 600 }}>Create one free →</span>
                        </p>
                      )}
                      <p style={{ fontSize: "12px", color: C.light, marginTop: "10px" }}>One time payment · Instant access · Lifetime updates</p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {selectedProvider && (
        <div
          onClick={() => setSelectedProvider(null)}
          style={{ position: "fixed", inset: 0, background: "rgba(10,10,10,0.45)", zIndex: 120, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ width: "min(760px, 100%)", maxHeight: "85vh", overflowY: "auto", background: C.bg, border: `1px solid ${C.border}`, borderRadius: "16px", padding: "24px" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px", marginBottom: "18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <Logo domain={selectedProvider.domain} name={selectedProvider.name} />
                <div>
                  <h3 style={{ margin: 0, fontSize: "24px", fontWeight: 900, color: C.ink, letterSpacing: "-0.5px" }}>{selectedProvider.name}</h3>
                  <p style={{ margin: "4px 0 0", color: C.mid, fontSize: "13px" }}>{selectedProvider.category}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedProvider(null)}
                style={{ border: `1px solid ${C.border}`, background: C.bg, borderRadius: "8px", padding: "7px 10px", cursor: "pointer", color: C.mid }}
              >
                Close
              </button>
            </div>

            {selectedProvider.value && (
              <div style={{ marginBottom: "14px", display: "inline-block", fontSize: "13px", fontWeight: 700, color: C.orange, background: "#fff3ee", border: `1px solid ${C.border}`, borderRadius: "999px", padding: "6px 12px" }}>
                Value: {selectedProvider.value}
              </div>
            )}

            <p style={{ color: C.ink, fontSize: "15px", lineHeight: 1.7, marginBottom: "12px" }}>
              {selectedProvider.description || `${selectedProvider.name} offers startup focused incentives for founders.`}
            </p>
            <p style={{ color: C.mid, fontSize: "14px", lineHeight: 1.7, marginBottom: "20px" }}>
              {providerNarrative(selectedProvider)}
            </p>

            {(selectedProvider.name === "Sane Choice" || selectedProvider.name === "Preferences AI") && (
              <div style={{ background: "#fff7f3", border: `1px solid ${C.border}`, borderRadius: "12px", padding: "16px", marginBottom: "20px" }}>
                <p style={{ margin: "0 0 10px", fontSize: "12px", color: C.ink, fontWeight: 700 }}>What is included</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {(selectedProvider.name === "Sane Choice" ? COMPANY_SETUP_HIGHLIGHTS : PREFERENCES_AI_HIGHLIGHTS).map((item) => (
                    <div key={item} style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                      <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: C.orange, marginTop: "6px", flexShrink: 0 }} />
                      <span style={{ fontSize: "12px", color: C.mid, lineHeight: 1.55 }}>{item}</span>
                    </div>
                  ))}
                </div>
                <p style={{ margin: "12px 0 0", fontSize: "11px", color: C.light }}>
                  {selectedProvider.name === "Sane Choice"
                    ? "Based on publicly listed service details and case references from sanechoice.hk."
                    : "Based on publicly listed capabilities and positioning from preferencesai.io."}
                </p>
              </div>
            )}

            {selectedProvider.tags && selectedProvider.tags.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "22px" }}>
                {selectedProvider.tags.map((tag) => (
                  <span key={tag} style={{ fontSize: "12px", padding: "4px 10px", borderRadius: "999px", background: C.surface, border: `1px solid ${C.border}`, color: C.mid }}>
                    {tag.replace(/-/g, " ")}
                  </span>
                ))}
              </div>
            )}

            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <button onClick={() => { 
                const url = selectedProvider.applyUrl || `https://${selectedProvider.domain}`;
                window.open(url, '_blank');
              }} style={{ background: C.ink, color: "#fff", border: "none", borderRadius: C.radius, padding: "11px 16px", fontWeight: 700, cursor: "pointer", fontSize: "14px", display: "inline-flex", alignItems: "center", gap: "7px", fontFamily: "inherit" }}>
                {selectedProvider.name === "Sane Choice" ? "Book Consultation" : selectedProvider.name === "Preferences AI" ? "Visit Preferences AI" : "Apply Now"} <ExternalLink style={{ width: "13px", height: "13px" }} />
              </button>
              <button onClick={() => window.open(`https://${selectedProvider.domain}`, '_blank')} style={{ background: C.orange, color: "#fff", border: "none", borderRadius: C.radius, padding: "11px 16px", fontWeight: 700, cursor: "pointer", fontSize: "14px", fontFamily: "inherit" }}>
                Visit Provider Site
              </button>
              <button
                onClick={() => setSelectedProvider(null)}
                style={{ background: C.bg, color: C.mid, border: `1px solid ${C.border}`, borderRadius: C.radius, padding: "11px 16px", fontWeight: 600, cursor: "pointer", fontSize: "14px", fontFamily: "inherit" }}
              >
                Back to Providers
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <div style={{ borderTop: `1px solid ${C.border}`, padding: "32px 48px", marginTop: "80px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
        <span style={{ color: C.ink, fontWeight: 800, fontSize: "14px", letterSpacing: "0.08em", textTransform: "uppercase" }}>Launch Perks</span>
        <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
          <Link href="/about" style={{ fontSize: "13px", color: C.mid, textDecoration: "none" }}>About Us</Link>
          <Link href="/terms" style={{ fontSize: "13px", color: C.mid, textDecoration: "none" }}>Terms</Link>
          <Link href="/privacy" style={{ fontSize: "13px", color: C.mid, textDecoration: "none" }}>Privacy</Link>
          <Link href="/contact" style={{ fontSize: "13px", color: C.mid, textDecoration: "none" }}>Contact</Link>
          <p style={{ fontSize: "13px", color: C.light }}>Built for founders, by founders.</p>
        </div>
      </div>
    </div>
  );
}

export default function ProvidersPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: C.bg }} />}>
      <ProvidersPageContent />
    </Suspense>
  );
}