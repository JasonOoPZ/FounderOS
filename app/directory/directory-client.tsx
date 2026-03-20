"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { Search, ExternalLink, Lock, ArrowRight, Clock3, DollarSign, Target } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { FREE_DIRECTORY_COUNT } from "@/lib/constants";
import { WorkspaceAccountBar } from "@/components/workspace-account-bar";
import { WorkspaceTopNav } from "@/components/workspace-top-nav";
import { SHELL_LAYOUT } from "@/lib/ui-shell";
import { APP_THEME } from "@/lib/ui-theme";

const C = APP_THEME;

const FREE_COUNT = FREE_DIRECTORY_COUNT;

const OUTCOME_FOCUS = {
  speed: {
    label: "Ship Faster",
    headline: "Cut the research spiral and execute this week.",
    subcopy: "Stop wasting nights hunting tools. Get a founder-grade shortlist and move from idea to shipped output faster.",
    proof: "Founders can skip weeks of random tool discovery and start with proven options.",
    urgency: "Every week of delay means lost momentum and slower distribution.",
  },
  burn: {
    label: "Reduce Burn",
    headline: "Protect runway by avoiding expensive tool mistakes.",
    subcopy: "Choose stack decisions with confidence and avoid paying for bloated tools before product-market fit.",
    proof: "Use curated picks and credits to stretch cash while still moving quickly.",
    urgency: "Burn compounds monthly. Waste less now to buy more iterations later.",
  },
  focus: {
    label: "Stay Focused",
    headline: "Know what to use next so your team can stay in flow.",
    subcopy: "Replace tool chaos with a clear operating stack by category, so your team can execute instead of debating.",
    proof: "Clear decisions reduce context switching and improve weekly output.",
    urgency: "Confusion is expensive. Focus is your unfair advantage early on.",
  },
} as const;

type OutcomeKey = keyof typeof OUTCOME_FOCUS;

type Resource = { title: string; url: string; category: string };

function getDomain(url: string) {
  try { return new URL(url).hostname.replace("www.", ""); }
  catch { return ""; }
}

function Logo({ url, name }: { url: string; name: string }) {
  const [failed, setFailed] = useState(false);
  const domain = getDomain(url);
  const letter = name.charAt(0).toUpperCase();
  const logoUrl = domain ? `/api/logo?domain=${encodeURIComponent(domain)}&size=40` : "";

  if (failed || !domain) {
    return (
      <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: C.tagBg, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <span style={{ fontSize: "13px", fontWeight: 700, color: C.mid }}>{letter}</span>
      </div>
    );
  }

  return (
    <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: C.surface, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
      <img
        src={logoUrl}
        alt={name}
        width={24}
        height={24}
        onError={() => setFailed(true)}
        style={{ objectFit: "contain" }}
      />
    </div>
  );
}

function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.45, delay, ease: [0.16, 1, 0.3, 1] }}>
      {children}
    </motion.div>
  );
}

function ResourceCard({ resource, locked }: { resource: Resource; locked: boolean }) {
  return (
    <div style={{ position: "relative", filter: locked ? "blur(3px)" : "none", userSelect: locked ? "none" : "auto", pointerEvents: locked ? "none" : "auto" }}>
      <a href={resource.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", display: "block" }}>
        <div
          style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: "10px", padding: "16px 18px", cursor: "pointer", transition: "all 0.12s" }}
          onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.06)"; e.currentTarget.style.borderColor = "#d0d0d0"; }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = C.border; }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Logo url={resource.url} name={resource.title} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: "13px", fontWeight: 700, color: C.ink, lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: "3px" }}>
                {resource.title}
              </div>
              <div style={{ fontSize: "11px", color: C.light, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {getDomain(resource.url)}
              </div>
            </div>
            <ExternalLink style={{ width: "12px", height: "12px", color: C.border, flexShrink: 0 }} />
          </div>
        </div>
      </a>
    </div>
  );
}

export default function DirectoryClient({ resources, categories }: { resources: Resource[]; categories: string[] }) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [showSuggest, setShowSuggest] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [isPro, setIsPro] = useState(false);
  const [outcomeKey, setOutcomeKey] = useState<OutcomeKey>("speed");

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setIsLoggedIn(!!session);
      setUserEmail(session?.user.email ?? "");

      if (!session?.user.id) {
        setIsPro(false);
        return;
      }

      const { data } = await supabase.from("users").select("is_pro").eq("id", session.user.id).single();
      setIsPro(data?.is_pro ?? false);
    });
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  const filtered = resources.filter((r) => {
    const matchSearch = (r.title ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (r.url ?? "").toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === "All" || r.category === activeCategory;
    return matchSearch && matchCat;
  });

  const grouped: Record<string, Resource[]> = {};
  filtered.forEach(r => {
    if (!grouped[r.category]) grouped[r.category] = [];
    grouped[r.category].push(r);
  });

  const visibleResources = isLoggedIn ? filtered : filtered.slice(0, FREE_COUNT);
  const lockedResources = isLoggedIn ? [] : filtered.slice(FREE_COUNT, FREE_COUNT + 6);
  const isGated = !isLoggedIn && filtered.length > FREE_COUNT;

  const groupedVisible: Record<string, Resource[]> = {};
  visibleResources.forEach(r => {
    if (!groupedVisible[r.category]) groupedVisible[r.category] = [];
    groupedVisible[r.category].push(r);
  });

  const sortedCategories = ["All", ...categories.filter(c => c !== "All")];
  const activeOutcome = OUTCOME_FOCUS[outcomeKey];
  const availableNow = isLoggedIn ? filtered.length : Math.min(FREE_COUNT, filtered.length);
  const lockedCount = Math.max(filtered.length - FREE_COUNT, 0);

  return (
    <div style={{ background: C.bg, minHeight: "100vh", fontFamily: "'Inter', sans-serif", WebkitFontSmoothing: "antialiased" }}>

      {/* NAV */}
      <WorkspaceTopNav activeView="Directory" isLoggedIn={isLoggedIn} />

      {/* HERO */}
      <div style={{ background: C.bg, borderBottom: `1px solid ${C.border}`, padding: `64px ${SHELL_LAYOUT.pageXPadding}px 48px` }}>
        <div style={{ maxWidth: `${SHELL_LAYOUT.contentMaxWidth}px`, margin: "0 auto" }}>
          <WorkspaceAccountBar
            currentView="Directory"
            email={userEmail}
            isLoggedIn={isLoggedIn}
            isPro={isPro}
            onSignOut={handleSignOut}
          />
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div style={{ width: "48px", height: "4px", background: C.orange, borderRadius: "2px", marginBottom: "20px" }} />
          <p style={{ fontSize: "11px", color: C.light, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "10px", fontWeight: 700 }}>Results First Toolkit</p>
          <h1 style={{ fontSize: "clamp(34px, 5vw, 58px)", fontWeight: 900, letterSpacing: "-2px", lineHeight: 1.02, color: C.ink, marginBottom: "12px", maxWidth: "920px" }}>
            {activeOutcome.headline}
          </h1>
          <p style={{ fontSize: "16px", color: C.mid, maxWidth: "760px", marginBottom: "20px", lineHeight: 1.65 }}>
            {activeOutcome.subcopy}
          </p>

          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "18px" }}>
            {(Object.keys(OUTCOME_FOCUS) as OutcomeKey[]).map((key) => (
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
                {OUTCOME_FOCUS[key].label}
              </button>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "10px", marginBottom: "24px", maxWidth: "960px" }}>
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: "10px", padding: "12px 14px", display: "flex", alignItems: "center", gap: "10px" }}>
              <Clock3 style={{ width: "14px", height: "14px", color: C.orange, flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: "11px", color: C.light, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}>Time to action</div>
                <div style={{ fontSize: "13px", color: C.ink, fontWeight: 700 }}>{activeOutcome.proof}</div>
              </div>
            </div>
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: "10px", padding: "12px 14px", display: "flex", alignItems: "center", gap: "10px" }}>
              <DollarSign style={{ width: "14px", height: "14px", color: C.orange, flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: "11px", color: C.light, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}>Runway impact</div>
                <div style={{ fontSize: "13px", color: C.ink, fontWeight: 700 }}>{availableNow} ready now, {lockedCount} more unlocked with sign in.</div>
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

          <p style={{ fontSize: "14px", color: C.mid, maxWidth: "760px", marginBottom: "18px", lineHeight: 1.6 }}>
            {resources.length} curated resources across {categories.length} categories.{" "}
            {!isLoggedIn && <span style={{ color: C.ink, fontWeight: 700 }}>Sign in free to unlock the full operating stack now.</span>}
            {isLoggedIn && <span style={{ color: C.ink, fontWeight: 700 }}>Full access unlocked. Stay in execution mode.</span>}
          </p>

          <div style={{ position: "relative", maxWidth: "560px" }}>
            <Search style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", width: "15px", height: "15px", color: C.light, pointerEvents: "none" }} />
            <input type="text" placeholder="Search tools, resources..." value={search} onChange={e => setSearch(e.target.value)}
              style={{ width: "100%", paddingLeft: "40px", paddingRight: "16px", paddingTop: "11px", paddingBottom: "11px", border: `1.5px solid ${C.border}`, borderRadius: "8px", fontSize: "14px", background: C.surface, color: C.ink, outline: "none", boxSizing: "border-box", fontFamily: "inherit", transition: "border-color 0.15s" }}
              onFocus={e => (e.currentTarget.style.borderColor = C.orange)}
              onBlur={e => (e.currentTarget.style.borderColor = C.border)} />
          </div>
          </motion.div>
        </div>
      </div>

      {/* BODY: SIDEBAR + CONTENT */}
      <div style={{ display: "flex", minHeight: `calc(100vh - ${SHELL_LAYOUT.topNavHeight}px)` }}>

        {/* SIDEBAR */}
        <aside style={{ width: "220px", flexShrink: 0, borderRight: `1px solid ${C.border}`, position: "sticky", top: `${SHELL_LAYOUT.topNavHeight}px`, height: `calc(100vh - ${SHELL_LAYOUT.topNavHeight}px)`, overflowY: "auto", background: C.bg, padding: "20px 12px" }}>
          <p style={{ fontSize: "10px", color: C.light, letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600, marginBottom: "10px", paddingLeft: "8px" }}>Categories</p>
          {sortedCategories.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              style={{ display: "block", width: "100%", textAlign: "left", padding: "8px 12px", borderRadius: "7px", marginBottom: "2px", fontSize: "13px", fontWeight: activeCategory === cat ? 600 : 400, background: activeCategory === cat ? C.surface : "transparent", border: activeCategory === cat ? `1px solid ${C.border}` : "1px solid transparent", color: activeCategory === cat ? C.ink : C.mid, cursor: "pointer", fontFamily: "inherit", transition: "all 0.1s", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
              onMouseEnter={e => { if (activeCategory !== cat) e.currentTarget.style.color = C.ink; }}
              onMouseLeave={e => { if (activeCategory !== cat) e.currentTarget.style.color = C.mid; }}>
              {cat}
            </button>
          ))}
        </aside>

        {/* MAIN CONTENT */}
        <main style={{ flex: 1, background: C.surface, padding: "32px 40px 80px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
            <p style={{ fontSize: "13px", color: C.light }}>
              {isLoggedIn ? (
                <><strong style={{ color: C.ink }}>{filtered.length}</strong> resources{activeCategory !== "All" && ` in ${activeCategory}`}</>
              ) : (
                <><strong style={{ color: C.ink }}>{FREE_COUNT}</strong> of <strong style={{ color: C.ink }}>{filtered.length}</strong> resources — <span style={{ color: C.orange, fontWeight: 600 }}>sign in for full access</span></>
              )}
            </p>
          </div>

          {isLoggedIn ? (
            Object.entries(grouped).map(([cat, items]) => (
              <div key={cat} style={{ marginBottom: "40px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
                  <h2 style={{ fontSize: "13px", fontWeight: 700, color: C.ink, letterSpacing: "0.04em" }}>{cat}</h2>
                  <div style={{ flex: 1, height: "1px", background: C.border }} />
                  <span style={{ fontSize: "11px", color: C.light, fontWeight: 500 }}>{items.length}</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "8px" }}>
                  {items.map((resource, i) => (
                    <FadeIn key={resource.url + i} delay={Math.min(i * 0.02, 0.15)}>
                      <ResourceCard resource={resource} locked={false} />
                    </FadeIn>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div>
              {Object.entries(groupedVisible).map(([cat, items]) => (
                <div key={cat} style={{ marginBottom: "32px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
                    <h2 style={{ fontSize: "13px", fontWeight: 700, color: C.ink }}>{cat}</h2>
                    <div style={{ flex: 1, height: "1px", background: C.border }} />
                    <span style={{ fontSize: "11px", color: C.light }}>{items.length}</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "8px" }}>
                    {items.map((resource, i) => (
                      <FadeIn key={resource.url + i} delay={i * 0.02}>
                        <ResourceCard resource={resource} locked={false} />
                      </FadeIn>
                    ))}
                  </div>
                </div>
              ))}

              {isGated && (
                <div style={{ position: "relative" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "8px" }}>
                    {lockedResources.map((resource, i) => (
                      <ResourceCard key={resource.url + i} resource={resource} locked={true} />
                    ))}
                  </div>
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(247,247,245,0) 0%, rgba(247,247,245,0.8) 30%, rgba(247,247,245,1) 60%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", paddingBottom: "32px" }}>
                    <div style={{ textAlign: "center", maxWidth: "440px" }}>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: C.bg, border: `1px solid ${C.border}`, borderRadius: "999px", padding: "5px 14px", marginBottom: "14px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                        <Lock style={{ width: "11px", height: "11px", color: C.mid }} />
                        <span style={{ fontSize: "11px", color: C.mid, fontWeight: 600 }}>{filtered.length - FREE_COUNT} more resources locked</span>
                      </div>
                      <h3 style={{ fontSize: "20px", fontWeight: 900, color: C.ink, letterSpacing: "-0.5px", marginBottom: "8px" }}>
                        Sign in to unlock the full directory
                      </h3>
                      <p style={{ fontSize: "13px", color: C.mid, marginBottom: "20px", lineHeight: 1.6 }}>
                        Free forever. No credit card required.
                      </p>
                      <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
                        <Link href="/login" style={{ textDecoration: "none" }}>
                          <button style={{ background: C.orange, color: "white", border: "none", borderRadius: C.radius, padding: "11px 24px", fontWeight: 700, cursor: "pointer", fontSize: "14px", display: "inline-flex", alignItems: "center", gap: "7px", fontFamily: "inherit", transition: "background 0.15s" }}
                            onMouseEnter={e => (e.currentTarget.style.background = C.orangeHover)}
                            onMouseLeave={e => (e.currentTarget.style.background = C.orange)}>
                            Sign In <ArrowRight style={{ width: "14px", height: "14px" }} />
                          </button>
                        </Link>
                        <Link href="/login" style={{ textDecoration: "none" }}>
                          <button style={{ background: "transparent", color: C.mid, border: `1.5px solid ${C.border}`, borderRadius: C.radius, padding: "11px 24px", fontWeight: 500, cursor: "pointer", fontSize: "14px", fontFamily: "inherit", transition: "all 0.15s" }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = C.ink; e.currentTarget.style.color = C.ink; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.mid; }}>
                            Create free account
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "80px 40px", background: C.bg, borderRadius: "12px", border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: "40px", marginBottom: "12px" }}>🔍</div>
              <p style={{ color: C.mid, fontSize: "14px" }}>No tools match your search. Try a different keyword!</p>
            </div>
          )}
        </main>
      </div>

      {/* FOOTER */}
      <div style={{ borderTop: `1px solid ${C.border}`, padding: `32px ${SHELL_LAYOUT.pageXPadding}px`, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
        <span style={{ color: C.ink, fontWeight: 800, fontSize: "14px", letterSpacing: "0.08em", textTransform: "uppercase" }}>LAUNCH PERKS</span>
        <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
          <Link href="/about" style={{ fontSize: "13px", color: C.mid, textDecoration: "none" }}>About Us</Link>
          <Link href="/terms" style={{ fontSize: "13px", color: C.mid, textDecoration: "none" }}>Terms</Link>
          <Link href="/privacy" style={{ fontSize: "13px", color: C.mid, textDecoration: "none" }}>Privacy</Link>
          <Link href="/contact" style={{ fontSize: "13px", color: C.mid, textDecoration: "none" }}>Contact</Link>
        </div>
        <button onClick={() => setShowSuggest(true)}
          style={{ background: "transparent", border: `1.5px solid ${C.border}`, color: C.mid, borderRadius: C.radius, padding: "8px 16px", cursor: "pointer", fontSize: "13px", fontWeight: 500, fontFamily: "inherit", transition: "all 0.12s" }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = C.ink; e.currentTarget.style.color = C.ink; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.mid; }}>
          Suggest a Tool
        </button>
        <p style={{ fontSize: "13px", color: C.light }}>Built for founders, by founders.</p>
      </div>

      {/* SUGGEST MODAL */}
      {showSuggest && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }} onClick={() => setShowSuggest(false)}>
          <motion.div initial={{ opacity: 0, scale: 0.96, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.2 }}
            style={{ background: C.bg, borderRadius: "14px", padding: "36px", maxWidth: "420px", width: "100%", boxShadow: "0 24px 64px rgba(0,0,0,0.12)" }}
            onClick={e => e.stopPropagation()}>
            <div style={{ width: "32px", height: "3px", background: C.orange, borderRadius: "2px", marginBottom: "20px" }} />
            <h3 style={{ fontWeight: 800, fontSize: "20px", marginBottom: "6px", color: C.ink }}>Suggest a Tool</h3>
            <p style={{ fontSize: "13px", color: C.mid, marginBottom: "24px", lineHeight: 1.5 }}>Know a great resource for startups? Share it below.</p>
            <input placeholder="Tool name" style={{ width: "100%", padding: "11px 14px", border: `1.5px solid ${C.border}`, borderRadius: C.radius, fontSize: "14px", marginBottom: "10px", boxSizing: "border-box", outline: "none", fontFamily: "inherit", color: C.ink }}
              onFocus={e => (e.currentTarget.style.borderColor = C.orange)}
              onBlur={e => (e.currentTarget.style.borderColor = C.border)} />
            <input placeholder="URL (https://...)" style={{ width: "100%", padding: "11px 14px", border: `1.5px solid ${C.border}`, borderRadius: C.radius, fontSize: "14px", marginBottom: "20px", boxSizing: "border-box", outline: "none", fontFamily: "inherit", color: C.ink }}
              onFocus={e => (e.currentTarget.style.borderColor = C.orange)}
              onBlur={e => (e.currentTarget.style.borderColor = C.border)} />
            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
              <button onClick={() => setShowSuggest(false)} style={{ padding: "10px 20px", border: `1.5px solid ${C.border}`, borderRadius: C.radius, background: "transparent", color: C.mid, cursor: "pointer", fontSize: "14px", fontFamily: "inherit" }}>Cancel</button>
              <button onClick={() => setShowSuggest(false)} style={{ padding: "10px 20px", border: "none", borderRadius: C.radius, background: C.orange, color: "#fff", cursor: "pointer", fontSize: "14px", fontWeight: 600, fontFamily: "inherit" }}>Submit</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
