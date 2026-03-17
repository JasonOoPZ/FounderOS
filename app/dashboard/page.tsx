"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, CheckCircle, LogOut, Zap, ArrowRight, CreditCard, BookOpen, Grid, ExternalLink, ChevronDown, ChevronRight, Search, AlertCircle } from "lucide-react";
import creditsData from "@/_data/credits.json";
import { supabase } from "@/lib/supabase";

interface User {
  id: string;
  email?: string;
}

interface NavItem {
  label: string;
  icon: React.ComponentType<{ style?: React.CSSProperties }>;
  id: string;
  href?: string;
}

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

const CREDIT_VENDOR_DOMAINS: Record<string, string> = {
  "Google Cloud": "cloud.google.com",
  "Fireworks AI": "fireworks.ai",
  "AWS": "aws.amazon.com",
  "Microsoft Azure": "azure.microsoft.com",
  "Notion": "notion.so",
  "Stripe": "stripe.com",
};

function getCreditDomain(vendor: string): string {
  return (
    CREDIT_VENDOR_DOMAINS[vendor] ??
    vendor.toLowerCase().replace(/\s+/g, "").replace(/[^a-z0-9]/g, "") + ".com"
  );
}

function Logo({ domain, name, size = 24, boxSize = 36 }: { domain: string; name: string; size?: number; boxSize?: number }) {
  const [failed, setFailed] = useState(false);
  const logoUrl = `/api/logo?domain=${encodeURIComponent(domain)}&size=${size * 2}`;
  
  return (
    <div style={{ width: `${boxSize}px`, height: `${boxSize}px`, borderRadius: "8px", background: C.surface, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
      {failed ? (
        <span style={{ color: C.mid, fontSize: `${boxSize * 0.35}px`, fontWeight: 800 }}>{name[0]}</span>
      ) : (
        <img src={logoUrl} alt={name} width={size} height={size} style={{ objectFit: "contain" }} onError={() => setFailed(true)} />
      )}
    </div>
  );
}

const tips = [
  { title: "Apply in order", body: "Start with Notion and Stripe — they approve fastest. Use that momentum before tackling AWS and GCP." },
  { title: "Have your docs ready", body: "GCP and AWS require proof of funding or accelerator acceptance. Prepare these before applying." },
  { title: "Use a company email", body: "Applications with a custom domain email get approved faster than Gmail addresses." },
  { title: "Stack your credits", body: "All credits can be used simultaneously. There's no restriction on combining them." },
];

const COMPANY_SETUP_HIGHLIGHTS = [
  "Hong Kong company incorporation with registry filing and business registration support.",
  "BVI company formation with registered agent coverage and tax neutral structuring.",
  "Hong Kong bank account opening assistance with document prep and application support.",
  "Corporate secretarial follow through for annual returns, registers, and compliance deadlines.",
  "Cross border founder setup patterns based on practical incorporation and banking case work.",
];

type Credit = {
  vendor: string;
  name: string;
  value: string;
  category: string;
  eligibility: string[];
  mustHave?: boolean;
  public_description: string;
  locked_instructions: string;
  applyUrl?: string;
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

const credits: Credit[] = creditsData as Credit[];
const TOP_VENDOR_PRIORITY = ["Preferences AI"];
const curatedCredits: Credit[] = credits
  .filter((c) => c.mustHave === true)
  .sort((a, b) => {
    const ai = TOP_VENDOR_PRIORITY.indexOf(a.vendor);
    const bi = TOP_VENDOR_PRIORITY.indexOf(b.vendor);
    if (ai !== -1 || bi !== -1) {
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    }
    return 0;
  });
const dashboardCredits: Credit[] = curatedCredits.length > 0 ? curatedCredits : credits.slice(0, 12);
const FREE_DASHBOARD_PREVIEW_COUNT = 2;

function parseMonetaryValue(value: string): number {
  // Only count explicit currency-denominated credits; ignore percentages and non-cash perks.
  if (!/[\$€£]/.test(value)) return 0;
  const cleaned = value.replace(/,/g, "");
  const match = cleaned.match(/\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : 0;
}

function getShortDescription(text?: string, limit = 120): string {
  if (!text) return "";
  if (text.length <= limit) return text;
  const trimmed = text.slice(0, limit);
  const lastSpace = trimmed.lastIndexOf(" ");
  return `${(lastSpace > 0 ? trimmed.slice(0, lastSpace) : trimmed).trim()}...`;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("credits");
  const [expanded, setExpanded] = useState<string | null>(dashboardCredits[0]?.vendor ?? null);
  const [applied, setApplied] = useState<string[]>([]);
  const [providerSearch, setProviderSearch] = useState("");
  const [providerCategory, setProviderCategory] = useState("All");
  const [providers, setProviders] = useState<Provider[]>([]);
  const [providersLoading, setProvidersLoading] = useState(false);
  const [providerError, setProviderError] = useState("");
  const [selectedCredit, setSelectedCredit] = useState<Credit | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [rotatingCredits, setRotatingCredits] = useState<Credit[]>(dashboardCredits);

  useEffect(() => {
    async function checkAuth() {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          setLoading(false);
          router.replace("/login");
          return;
        }
        
        setUser(session.user as User);
        const { data } = await supabase.from("users").select("is_pro").eq("id", session.user.id).single();
        setIsPro(data?.is_pro ?? false);

        // Fetch providers
        setProvidersLoading(true);
        setProviderError("");
        try {
          const headers: Record<string, string> = {};
          if (session.access_token) headers["Authorization"] = `Bearer ${session.access_token}`;
          const res = await fetch("/api/providers", { headers });
          
          if (!res.ok) {
            throw new Error(`HTTP ${res.status}: Failed to fetch providers`);
          }
          
          const providerData = await res.json();
          const all = [...(providerData.free || []), ...(providerData.locked || [])];
          setProviders(all);
        } catch (e) {
          console.error("Failed to fetch providers", e);
          setProviderError("Failed to load providers. Please try refreshing the page.");
        } finally {
          setProvidersLoading(false);
        }

        setLoading(false);
      } catch (error) {
        console.error("Auth check error:", error);
        setLoading(false);
      }
    }

    checkAuth();
  }, [router]);

  useEffect(() => {
    const saved = localStorage.getItem("applied_credits");
    if (saved) {
      try {
        setApplied(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved credits", e);
      }
    }
  }, []);

  useEffect(() => {
    const visitKey = "dashboard_must_haves_visit";
    const previousVisits = Number(window.sessionStorage.getItem(visitKey) ?? "0");
    window.sessionStorage.setItem(visitKey, String(previousVisits + 1));

    const pinned = dashboardCredits.filter((c) => TOP_VENDOR_PRIORITY.includes(c.vendor));
    const remaining = dashboardCredits.filter((c) => !TOP_VENDOR_PRIORITY.includes(c.vendor));

    if (remaining.length === 0) {
      setRotatingCredits(dashboardCredits);
      setExpanded(dashboardCredits[0]?.vendor ?? null);
      return;
    }

    const shift = previousVisits % remaining.length;
    const rotated = [...remaining.slice(shift), ...remaining.slice(0, shift)];
    const nextOrder = [...pinned, ...rotated];
    setRotatingCredits(nextOrder);
    setExpanded(nextOrder[0]?.vendor ?? null);
  }, []);

  function toggleApplied(vendor: string) {
    const updated = applied.includes(vendor) ? applied.filter(v => v !== vendor) : [...applied, vendor];
    setApplied(updated);
    localStorage.setItem("applied_credits", JSON.stringify(updated));
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/");
  }

  async function handleCheckout() {
    if (!user?.email) {
      alert("Email not found. Please sign out and sign in again.");
      return;
    }

    try {
      const res = await fetch("/api/checkout", { 
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ email: user.email }) 
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Checkout failed. Please try again.");
      }
    } catch (e) {
      console.error("Checkout error", e);
      alert("Failed to start checkout. Please try again.");
    }
  }

  const totalValue = dashboardCredits.reduce((sum, c) => {
    return sum + parseMonetaryValue(c.value);
  }, 0);

  const appliedValue = dashboardCredits
    .filter(c => applied.includes(c.vendor))
    .reduce((sum, c) => {
      return sum + parseMonetaryValue(c.value);
    }, 0);

  const allProviderCategories = ["All", ...Array.from(new Set(providers.map(p => p.category))).sort()];

  const filteredProviders = providers.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(providerSearch.toLowerCase()) ||
      (p.description ?? "").toLowerCase().includes(providerSearch.toLowerCase()) ||
      (p.tags ?? []).some(t => t.toLowerCase().includes(providerSearch.toLowerCase()));
    const matchCat = providerCategory === "All" || p.category === providerCategory;
    return matchSearch && matchCat;
  });

  const featuredCompanySetupProvider = providers.find((p) => p.name === "Sane Choice");
  const showCompanySetupFeature =
    !!featuredCompanySetupProvider &&
    (providerCategory === "All" || providerCategory === "Company Setup") &&
    (providerSearch.trim().length === 0 || "sane choice company setup bvi banking hong kong".includes(providerSearch.toLowerCase()));

  function handleSidebarNav(item: NavItem) {
    // For free users, keep Must-Haves and Providers as distinct pages.
    if (!isPro && item.id === "credits") {
      router.push("/credits");
      return;
    }
    if (!isPro && item.id === "companySetup") {
      router.push("/providers?category=Company%20Setup");
      return;
    }
    if (!isPro && item.id === "providers") {
      router.push("/providers");
      return;
    }
    if (item.id === "companySetup") {
      setActiveTab("providers");
      setProviderCategory("Company Setup");
      return;
    }
    setActiveTab(item.id);
  }

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: C.surface }}>
      <p style={{ color: C.light, fontSize: "14px" }}>Loading...</p>
    </div>
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: C.surface, fontFamily: "'Inter', sans-serif", WebkitFontSmoothing: "antialiased" }}>

      {/* SIDEBAR */}
      <aside style={{ width: "220px", borderRight: `1px solid ${C.border}`, background: C.bg, display: "flex", flexDirection: "column", position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 40 }}>
        <div style={{ padding: "20px 20px 16px", borderBottom: `1px solid ${C.border}` }}>
          <Link href="/" style={{ textDecoration: "none" }}>
            <span style={{ fontWeight: 800, fontSize: "14px", letterSpacing: "0.08em", textTransform: "uppercase", color: C.ink }}>Launch Perks</span>
          </Link>
          {isPro && (
            <div style={{ marginTop: "8px", display: "inline-flex", alignItems: "center", gap: "5px", background: C.ink, borderRadius: "999px", padding: "3px 10px" }}>
              <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#4ade80" }} />
              <span style={{ fontSize: "10px", color: "#fff", letterSpacing: "0.08em", fontWeight: 600 }}>PRO ACCESS</span>
            </div>
          )}
        </div>

        <nav style={{ padding: "12px", flex: 1 }}>
          {[
            { label: "Must Haves", icon: CreditCard, id: "credits" },
            { label: "Providers", icon: Grid, id: "providers" },
            { label: "Company Setup", icon: BookOpen, id: "companySetup" },
            { label: "Directory", icon: BookOpen, id: "directory", href: "/directory" },
          ].map((item: NavItem) => {
            const Icon = item.icon;
            const isCompanySetupActive = item.id === "companySetup" && activeTab === "providers" && providerCategory === "Company Setup";
            const isActive = activeTab === item.id || isCompanySetupActive;
            return item.href ? (
              <Link key={item.id} href={item.href} style={{ textDecoration: "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "9px 12px", borderRadius: "7px", marginBottom: "2px", color: C.mid, fontSize: "14px", cursor: "pointer" }}>
                  <Icon style={{ width: "15px", height: "15px" }} /> {item.label}
                </div>
              </Link>
            ) : (
              <button
                key={item.id}
                onClick={() => handleSidebarNav(item)}
                style={{ display: "flex", alignItems: "center", gap: "10px", padding: "9px 12px", borderRadius: "7px", marginBottom: "2px", background: isActive ? C.surface : "transparent", border: isActive ? `1px solid ${C.border}` : "1px solid transparent", color: isActive ? C.ink : C.mid, fontSize: "14px", fontWeight: isActive ? 600 : 400, cursor: "pointer", width: "100%", textAlign: "left", fontFamily: "inherit" }}
              >
                <Icon style={{ width: "15px", height: "15px" }} /> {item.label}
              </button>
            );
          })}
        </nav>

        {isPro && (
          <div style={{ padding: "16px", borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
            <div style={{ fontSize: "10px", color: C.light, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "8px", fontWeight: 600 }}>Progress</div>
            <div style={{ fontSize: "13px", color: C.ink, fontWeight: 600, marginBottom: "6px" }}>{applied.filter(v => dashboardCredits.some(c => c.vendor === v)).length} of {dashboardCredits.length} curated applied</div>
            <div style={{ height: "4px", background: C.surface, borderRadius: "999px", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${(applied.filter(v => dashboardCredits.some(c => c.vendor === v)).length / dashboardCredits.length) * 100}%`, background: C.orange, borderRadius: "999px", transition: "width 0.4s ease" }} />
            </div>
          </div>
        )}

        <div style={{ padding: "16px" }}>
          <div style={{ fontSize: "12px", color: C.light, marginBottom: "8px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.email}</div>
          <button onClick={handleSignOut} style={{ display: "flex", alignItems: "center", gap: "6px", background: "none", border: "none", cursor: "pointer", color: C.light, fontSize: "13px", padding: 0 }}>
            <LogOut style={{ width: "13px", height: "13px" }} /> Sign out
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main style={{ marginLeft: "220px", flex: 1, padding: "40px 48px" }}>

        {/* PAYWALL */}
        {!isPro ? (
          <div>
            <p style={{ fontSize: "11px", color: C.light, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "8px", fontWeight: 600 }}>Dashboard</p>
            <h1 style={{ fontSize: "clamp(24px, 3vw, 36px)", fontWeight: 900, color: C.ink, marginBottom: "8px", letterSpacing: "-1px" }}>Unlock Your Must Haves</h1>
            <p style={{ color: C.mid, fontSize: "14px", marginBottom: "32px" }}>Purchase lifetime access to see exact instructions for all must have credits and providers.</p>

            <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "28px 32px", marginBottom: "32px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
              <div>
                <p style={{ fontWeight: 700, color: C.ink, marginBottom: "4px" }}>Get lifetime access for $149</p>
                <p style={{ fontSize: "13px", color: C.mid }}>One time payment. Unlock all must haves and {providers.length}+ providers instantly.</p>
              </div>
              <button onClick={handleCheckout} style={{ background: C.orange, color: "white", border: "none", borderRadius: C.radius, padding: "11px 24px", fontWeight: 700, cursor: "pointer", fontSize: "14px", display: "inline-flex", alignItems: "center", gap: "8px", fontFamily: "inherit" }}
                onMouseEnter={e => (e.currentTarget.style.background = C.orangeHover)}
                onMouseLeave={e => (e.currentTarget.style.background = C.orange)}>
                <Zap style={{ width: "14px", height: "14px" }} /> Unlock Now — $149 <ArrowRight style={{ width: "14px", height: "14px" }} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {rotatingCredits.slice(0, FREE_DASHBOARD_PREVIEW_COUNT).map((credit) => (
                <div key={credit.vendor} style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "18px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <Logo domain={getCreditDomain(credit.vendor)} name={credit.vendor} />
                    <div>
                      <div style={{ fontSize: "14px", fontWeight: 700, color: C.ink }}>{credit.vendor}</div>
                      <div style={{ fontSize: "12px", color: C.mid }}>{credit.name}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <div style={{ fontSize: "18px", fontWeight: 900, color: C.ink, letterSpacing: "-0.5px" }}>{credit.value}</div>
                    <Lock style={{ width: "14px", height: "14px", color: C.border }} />
                  </div>
                </div>
              ))}
              <div style={{ textAlign: "center", padding: "16px", color: C.light, fontSize: "13px" }}>
                + {Math.max(rotatingCredits.length - FREE_DASHBOARD_PREVIEW_COUNT, 0)} more curated must haves unlocked with Pro access
              </div>
            </div>
          </div>

        ) : activeTab === "credits" ? (
          <div>
            {/* Welcome banner */}
            <div style={{ background: `linear-gradient(135deg, #ffffff 0%, #faf7f3 100%)`, border: `1px solid ${C.border}`, borderRadius: "14px", padding: "24px 28px", marginBottom: "28px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", boxShadow: "0 8px 24px rgba(0,0,0,0.04)" }}>
              <div>
                <p style={{ fontSize: "11px", color: C.light, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "4px", fontWeight: 600 }}>Welcome back</p>
                <h1 style={{ fontSize: "clamp(20px, 2.5vw, 28px)", fontWeight: 900, color: C.ink, letterSpacing: "-0.5px" }}>Your Must Haves</h1>
                <p style={{ fontSize: "12px", color: C.mid, marginTop: "6px" }}>Curated shortlist of the highest impact startup credits.</p>
              </div>
              <div style={{ display: "flex", gap: "24px" }}>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "28px", fontWeight: 900, color: C.ink, letterSpacing: "-1px" }}>${totalValue.toLocaleString()}</div>
                  <div style={{ fontSize: "10px", color: C.light, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>Curated total available</div>
                </div>
                <div style={{ width: "1px", background: C.border }} />
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "28px", fontWeight: 900, color: C.orange, letterSpacing: "-1px" }}>${appliedValue.toLocaleString()}</div>
                  <div style={{ fontSize: "10px", color: C.light, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>Applied for</div>
                </div>
              </div>
            </div>

            {/* Accordion credits */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "40px" }}>
              {rotatingCredits.map((credit) => {
                const isOpen = expanded === credit.vendor;
                const isApplied = applied.includes(credit.vendor);
                const steps = credit.locked_instructions.split("\n");
                const domain = getCreditDomain(credit.vendor);
                return (
                  <div
                    key={credit.vendor}
                    onClick={() => setExpanded(isOpen ? null : credit.vendor)}
                    style={{ background: C.bg, border: `1.5px solid ${isOpen ? C.ink : C.border}`, borderRadius: "12px", overflow: "hidden", transition: "border-color 0.2s", cursor: "pointer" }}
                  >
                    <div style={{ padding: "18px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                        <Logo domain={domain} name={credit.vendor} />
                        <div>
                          <div style={{ fontSize: "14px", fontWeight: 700, color: C.ink }}>{credit.vendor}</div>
                          <div style={{ fontSize: "12px", color: C.mid }}>{credit.name}</div>
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                        {isApplied && <span style={{ fontSize: "10px", background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0", borderRadius: "999px", padding: "2px 10px", fontWeight: 600 }}>Applied</span>}
                        <div style={{ fontSize: "18px", fontWeight: 900, color: C.ink, letterSpacing: "-0.5px" }}>{credit.value}</div>
                        {isOpen ? <ChevronDown style={{ width: "15px", height: "15px", color: C.light }} /> : <ChevronRight style={{ width: "15px", height: "15px", color: C.light }} />}
                      </div>
                    </div>

                    {isOpen && (
                      <div style={{ borderTop: `1px solid ${C.border}`, padding: "24px" }}>
                        <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", marginBottom: "16px" }}>
                          {credit.eligibility.map(e => (
                            <span key={e} style={{ fontSize: "10px", padding: "2px 9px", borderRadius: "999px", border: `1px solid ${C.border}`, color: C.mid, fontWeight: 500 }}>{e}</span>
                          ))}
                        </div>
                        <p style={{ fontSize: "13px", color: C.mid, lineHeight: 1.7, marginBottom: "20px" }}>{credit.public_description}</p>
                        <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "10px", padding: "18px 20px", marginBottom: "20px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "12px" }}>
                            <CheckCircle style={{ width: "13px", height: "13px", color: "#16a34a" }} />
                            <span style={{ fontSize: "12px", fontWeight: 700, color: C.ink }}>Step by step instructions</span>
                          </div>
                          {steps.map((step, i) => (
                            <div key={i} style={{ display: "flex", gap: "12px", marginBottom: i < steps.length - 1 ? "10px" : "0" }}>
                              <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                <span style={{ fontSize: "10px", color: "#fff", fontWeight: 700 }}>{i + 1}</span>
                              </div>
                              <p style={{ fontSize: "13px", color: "#166534", lineHeight: 1.65 }}>{step.replace(/^\d+\.\s/, "")}</p>
                            </div>
                          ))}
                        </div>
                        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                          {credit.applyUrl && (
                            <a href={credit.applyUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                              <button
                                onClick={(e) => e.stopPropagation()}
                                style={{ background: C.ink, color: "#fff", border: "none", borderRadius: C.radius, padding: "10px 20px", fontWeight: 600, cursor: "pointer", fontSize: "13px", display: "inline-flex", alignItems: "center", gap: "7px", fontFamily: "inherit" }}
                              >
                                Apply Now <ExternalLink style={{ width: "12px", height: "12px" }} />
                              </button>
                            </a>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCredit(credit);
                            }}
                            style={{ background: C.surface, color: C.ink, border: `1px solid ${C.border}`, borderRadius: C.radius, padding: "10px 20px", fontWeight: 600, cursor: "pointer", fontSize: "13px", fontFamily: "inherit" }}
                          >
                            Open Details
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleApplied(credit.vendor);
                            }}
                            style={{ background: isApplied ? "#f0fdf4" : C.surface, color: isApplied ? "#16a34a" : C.mid, border: `1px solid ${isApplied ? "#bbf7d0" : C.border}`, borderRadius: C.radius, padding: "10px 20px", fontWeight: 500, cursor: "pointer", fontSize: "13px", display: "inline-flex", alignItems: "center", gap: "7px", fontFamily: "inherit" }}
                          >
                            {isApplied ? <><CheckCircle style={{ width: "12px", height: "12px" }} /> Applied</> : "Mark as applied"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Tips */}
            <p style={{ fontSize: "11px", color: C.light, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "16px", fontWeight: 600 }}>Pro Tips</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "12px" }}>
              {tips.map(tip => (
                <div key={tip.title} style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: "10px", padding: "18px 20px" }}>
                  <div style={{ fontWeight: 700, fontSize: "13px", color: C.ink, marginBottom: "6px" }}>{tip.title}</div>
                  <div style={{ fontSize: "12px", color: C.mid, lineHeight: 1.65 }}>{tip.body}</div>
                </div>
              ))}
            </div>

            {selectedCredit && (
              <div
                onClick={() => setSelectedCredit(null)}
                style={{ position: "fixed", inset: 0, background: "rgba(10,10,10,0.45)", zIndex: 120, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}
              >
                <div
                  onClick={(e) => e.stopPropagation()}
                  style={{ width: "min(820px, 100%)", maxHeight: "88vh", overflowY: "auto", background: C.bg, border: `1px solid ${C.border}`, borderRadius: "16px", padding: "24px", boxShadow: "0 18px 40px rgba(0,0,0,0.16)" }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "14px", marginBottom: "16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <Logo domain={getCreditDomain(selectedCredit.vendor)} name={selectedCredit.vendor} />
                      <div>
                        <h3 style={{ margin: 0, fontSize: "25px", fontWeight: 900, color: C.ink, letterSpacing: "-0.6px" }}>{selectedCredit.vendor}</h3>
                        <p style={{ margin: "4px 0 0", fontSize: "13px", color: C.mid }}>{selectedCredit.name}</p>
                      </div>
                    </div>
                    <button onClick={() => setSelectedCredit(null)} style={{ border: `1px solid ${C.border}`, background: C.bg, borderRadius: "8px", padding: "7px 10px", cursor: "pointer", color: C.mid }}>
                      Close
                    </button>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "14px" }}>
                    <span style={{ fontSize: "14px", fontWeight: 800, color: C.orange, background: "#fff3ee", border: `1px solid rgba(255,77,0,0.25)`, borderRadius: "999px", padding: "6px 12px" }}>
                      {selectedCredit.value}
                    </span>
                    <span style={{ fontSize: "11px", color: C.mid, letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600, border: `1px solid ${C.border}`, borderRadius: "999px", padding: "5px 10px" }}>
                      {selectedCredit.category}
                    </span>
                    {selectedCredit.eligibility.map((e) => (
                      <span key={e} style={{ fontSize: "11px", color: C.mid, border: `1px solid ${C.border}`, borderRadius: "999px", padding: "5px 10px" }}>{e}</span>
                    ))}
                  </div>

                  <p style={{ color: C.ink, fontSize: "15px", lineHeight: 1.7, marginBottom: "16px" }}>{selectedCredit.public_description}</p>

                  <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "10px", padding: "16px 18px", marginBottom: "18px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "10px" }}>
                      <CheckCircle style={{ width: "13px", height: "13px", color: "#16a34a" }} />
                      <span style={{ fontSize: "12px", fontWeight: 700, color: C.ink }}>Step by step instructions</span>
                    </div>
                    {selectedCredit.locked_instructions.split("\n").map((line, idx) => (
                      <p key={idx} style={{ margin: idx < selectedCredit.locked_instructions.split("\n").length - 1 ? "0 0 8px" : 0, fontSize: "13px", color: "#166534", lineHeight: 1.6 }}>
                        {line}
                      </p>
                    ))}
                  </div>

                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    {selectedCredit.applyUrl && (
                      <a href={selectedCredit.applyUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                        <button style={{ background: C.orange, color: "white", border: "none", borderRadius: C.radius, padding: "11px 18px", fontWeight: 700, cursor: "pointer", fontSize: "14px", display: "inline-flex", alignItems: "center", gap: "7px" }}>
                          Apply Now <ExternalLink style={{ width: "13px", height: "13px" }} />
                        </button>
                      </a>
                    )}
                    <button onClick={() => setSelectedCredit(null)} style={{ background: C.bg, color: C.mid, border: `1px solid ${C.border}`, borderRadius: C.radius, padding: "11px 18px", fontWeight: 600, cursor: "pointer", fontSize: "14px" }}>
                      Back to Must Haves
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

        ) : (
          // PROVIDERS TAB
          <div>
            {providerError && (
              <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "10px", padding: "14px 16px", marginBottom: "20px", display: "flex", gap: "12px", alignItems: "flex-start" }}>
                <AlertCircle style={{ width: "16px", height: "16px", color: "#dc2626", flexShrink: 0, marginTop: "2px" }} />
                <p style={{ fontSize: "13px", color: "#991b1b" }}>{providerError}</p>
              </div>
            )}
            <div style={{ marginBottom: "28px" }}>
              <p style={{ fontSize: "11px", color: C.light, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "8px", fontWeight: 600 }}>All Providers</p>
              <h1 style={{ fontSize: "clamp(20px, 2.5vw, 28px)", fontWeight: 900, color: C.ink, marginBottom: "8px", letterSpacing: "-0.5px" }}>
                {providers.length}+ Startup Providers
              </h1>
              <p style={{ color: C.mid, fontSize: "14px", marginBottom: "20px" }}>Every credit, discount, and perk available to founders. Click Apply Now on any card.</p>

              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
                <div style={{ position: "relative", flex: 1, maxWidth: "360px" }}>
                  <Search style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", width: "14px", height: "14px", color: C.light, pointerEvents: "none" }} />
                  <input type="text" placeholder="Search providers..." value={providerSearch} onChange={e => setProviderSearch(e.target.value)}
                    style={{ width: "100%", paddingLeft: "36px", paddingRight: "12px", paddingTop: "9px", paddingBottom: "9px", border: `1.5px solid ${C.border}`, borderRadius: C.radius, fontSize: "13px", background: C.bg, color: C.ink, outline: "none", boxSizing: "border-box", fontFamily: "inherit", transition: "border-color 0.15s" }}
                    onFocus={e => (e.currentTarget.style.borderColor = C.orange)}
                    onBlur={e => (e.currentTarget.style.borderColor = C.border)} />
                </div>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  {allProviderCategories.slice(0, 8).map(cat => (
                    <button key={cat} onClick={() => setProviderCategory(cat)}
                      style={{ padding: "6px 12px", borderRadius: "100px", fontSize: "12px", fontWeight: 500, cursor: "pointer", border: "1.5px solid", borderColor: providerCategory === cat ? C.ink : C.border, background: providerCategory === cat ? C.ink : C.bg, color: providerCategory === cat ? "#fff" : C.mid, fontFamily: "inherit", transition: "all 0.12s", whiteSpace: "nowrap" }}
                      onMouseEnter={e => { if (providerCategory !== cat) { e.currentTarget.style.borderColor = C.ink; e.currentTarget.style.color = C.ink; } }}
                      onMouseLeave={e => { if (providerCategory !== cat) { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.mid; } }}>
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {showCompanySetupFeature && featuredCompanySetupProvider && (
              <div style={{ background: "linear-gradient(135deg, #fff7f3 0%, #ffffff 70%)", border: `1px solid ${C.border}`, borderRadius: "12px", padding: "18px", marginBottom: "18px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "14px" }}>
                <div>
                  <p style={{ margin: "0 0 6px", fontSize: "11px", color: C.light, textTransform: "uppercase", letterSpacing: "0.09em", fontWeight: 600 }}>Featured Company Setup</p>
                  <h2 style={{ margin: "0 0 8px", fontSize: "22px", fontWeight: 900, color: C.ink, letterSpacing: "-0.4px" }}>BVI incorporation with Hong Kong banking support</h2>
                  <p style={{ margin: 0, fontSize: "13px", color: C.mid, lineHeight: 1.65 }}>{featuredCompanySetupProvider.description}</p>
                  <div style={{ display: "flex", gap: "8px", marginTop: "12px", flexWrap: "wrap" }}>
                    <button
                      onClick={() => setSelectedProvider(featuredCompanySetupProvider)}
                      style={{ background: C.ink, color: "#fff", border: "none", borderRadius: "7px", padding: "8px 12px", fontWeight: 700, cursor: "pointer", fontSize: "12px", fontFamily: "inherit" }}
                    >
                      View Details
                    </button>
                    {featuredCompanySetupProvider.applyUrl && (
                      <button onClick={() => { if (featuredCompanySetupProvider.applyUrl) window.open(featuredCompanySetupProvider.applyUrl, '_blank'); }} style={{ background: C.orange, color: "#fff", border: "none", borderRadius: "7px", padding: "8px 12px", fontWeight: 700, cursor: "pointer", fontSize: "12px", display: "inline-flex", alignItems: "center", gap: "6px", fontFamily: "inherit" }}>
                        Book Consultation <ExternalLink style={{ width: "11px", height: "11px" }} />
                      </button>
                    )}
                  </div>
                </div>
                <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: "8px", padding: "12px" }}>
                  <p style={{ margin: "0 0 8px", fontSize: "12px", color: C.ink, fontWeight: 700 }}>Setup scope</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
                    {COMPANY_SETUP_HIGHLIGHTS.slice(0, 4).map((item) => (
                      <div key={item} style={{ display: "flex", gap: "7px", alignItems: "flex-start" }}>
                        <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: C.orange, marginTop: "6px", flexShrink: 0 }} />
                        <span style={{ fontSize: "12px", color: C.mid, lineHeight: 1.5 }}>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {providersLoading ? (
              <div style={{ textAlign: "center", padding: "80px 0", color: C.light, fontSize: "14px" }}>Loading providers...</div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "10px" }}>
                {filteredProviders.map((provider, i) => (
                  <div key={provider.name + i} style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "18px 20px", transition: "all 0.15s", cursor: "pointer" }}
                    onClick={() => setSelectedProvider(provider)}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.06)"; e.currentTarget.style.borderColor = "#d0d0d0"; }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = C.border; }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "10px", marginBottom: "10px" }}>
                      <Logo domain={provider.domain} name={provider.name} size={20} boxSize={32} />
                      <div style={{ display: "inline-block", padding: "2px 7px", background: C.tagBg, borderRadius: "4px", fontSize: "9px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: C.mid }}>
                        {provider.category}
                      </div>
                    </div>
                    <div style={{ fontSize: "14px", fontWeight: 800, color: C.ink, marginBottom: "3px" }}>{provider.name}</div>
                    {provider.value && <div style={{ fontSize: "13px", fontWeight: 700, color: C.orange, marginBottom: "8px" }}>{provider.value}</div>}
                    {provider.description && <p style={{ fontSize: "12px", color: C.mid, lineHeight: 1.6, marginBottom: "10px" }}>{getShortDescription(provider.description)}</p>}
                    <p style={{ fontSize: "11px", color: C.light, marginBottom: "12px" }}>Click to expand</p>
                    <button
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        const url = provider.applyUrl || `https://${provider.domain}`;
                        window.open(url, '_blank'); 
                      }}
                      style={{ background: C.ink, color: "#fff", border: "none", borderRadius: "6px", padding: "7px 14px", fontWeight: 600, cursor: "pointer", fontSize: "12px", display: "inline-flex", alignItems: "center", gap: "5px", fontFamily: "inherit", transition: "opacity 0.15s" }}
                      onMouseEnter={e => (e.currentTarget.style.opacity = "0.8")}
                      onMouseLeave={e => (e.currentTarget.style.opacity = "1")}>
                      Apply Now <ExternalLink style={{ width: "11px", height: "11px" }} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {!providersLoading && filteredProviders.length === 0 && (
              <div style={{ textAlign: "center", padding: "80px 40px", background: C.bg, borderRadius: "12px", border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: "40px", marginBottom: "12px" }}>🔍</div>
                <p style={{ color: C.mid, fontSize: "14px" }}>No providers match your search.</p>
              </div>
            )}

            {selectedProvider && (
              <div
                onClick={() => setSelectedProvider(null)}
                style={{ position: "fixed", inset: 0, background: "rgba(10,10,10,0.45)", zIndex: 120, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}
              >
                <div
                  onClick={(e) => e.stopPropagation()}
                  style={{ width: "min(760px, 100%)", maxHeight: "86vh", overflowY: "auto", background: C.bg, border: `1px solid ${C.border}`, borderRadius: "16px", padding: "24px", boxShadow: "0 18px 40px rgba(0,0,0,0.16)" }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "14px", marginBottom: "14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <Logo domain={selectedProvider.domain} name={selectedProvider.name} size={26} boxSize={38} />
                      <div>
                        <h3 style={{ margin: 0, fontSize: "24px", fontWeight: 900, color: C.ink, letterSpacing: "-0.6px" }}>{selectedProvider.name}</h3>
                        <p style={{ margin: "4px 0 0", fontSize: "13px", color: C.mid }}>{selectedProvider.category}</p>
                      </div>
                    </div>
                    <button onClick={() => setSelectedProvider(null)} style={{ border: `1px solid ${C.border}`, background: C.bg, borderRadius: "8px", padding: "7px 10px", cursor: "pointer", color: C.mid }}>
                      Close
                    </button>
                  </div>

                  {selectedProvider.value && (
                    <div style={{ fontSize: "15px", fontWeight: 800, color: C.orange, marginBottom: "10px" }}>{selectedProvider.value}</div>
                  )}

                  {selectedProvider.description && (
                    <p style={{ color: C.ink, fontSize: "14px", lineHeight: 1.7, marginBottom: "14px" }}>{selectedProvider.description}</p>
                  )}

                  {selectedProvider.name === "Sane Choice" && (
                    <div style={{ background: "#fff7f3", border: `1px solid ${C.border}`, borderRadius: "10px", padding: "14px", marginBottom: "14px" }}>
                      <p style={{ margin: "0 0 9px", fontSize: "12px", fontWeight: 700, color: C.ink }}>What founders get</p>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {COMPANY_SETUP_HIGHLIGHTS.map((item) => (
                          <div key={item} style={{ display: "flex", gap: "7px", alignItems: "flex-start" }}>
                            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: C.orange, marginTop: "6px", flexShrink: 0 }} />
                            <span style={{ fontSize: "12px", color: C.mid, lineHeight: 1.55 }}>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {(selectedProvider.tags ?? []).length > 0 && (
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "16px" }}>
                      {(selectedProvider.tags ?? []).map((tag) => (
                        <span key={tag} style={{ fontSize: "11px", color: C.mid, border: `1px solid ${C.border}`, borderRadius: "999px", padding: "5px 10px" }}>{tag.replace(/-/g, " ")}</span>
                      ))}
                    </div>
                  )}

                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    <button onClick={() => { 
                      const url = selectedProvider.applyUrl || `https://${selectedProvider.domain}`;
                      window.open(url, '_blank');
                    }} style={{ background: C.orange, color: "white", border: "none", borderRadius: C.radius, padding: "11px 18px", fontWeight: 700, cursor: "pointer", fontSize: "14px", display: "inline-flex", alignItems: "center", gap: "7px", fontFamily: "inherit" }}>
                      {selectedProvider.name === "Sane Choice" ? "Book Consultation" : "Apply Now"} <ExternalLink style={{ width: "13px", height: "13px" }} />
                    </button>
                    <button onClick={() => setSelectedProvider(null)} style={{ background: C.bg, color: C.mid, border: `1px solid ${C.border}`, borderRadius: C.radius, padding: "11px 18px", fontWeight: 600, cursor: "pointer", fontSize: "14px", fontFamily: "inherit" }}>
                      Back to Providers
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}