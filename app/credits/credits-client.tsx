"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { Lock, CheckCircle, ArrowRight, Zap, ExternalLink, Star } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { WorkspaceAccountBar } from "@/components/workspace-account-bar";
import { WorkspaceTopNav } from "@/components/workspace-top-nav";
import { SHELL_LAYOUT } from "@/lib/ui-shell";

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

function Logo({ domain, name }: { domain: string; name: string }) {
  const [failed, setFailed] = useState(false);
  const logoUrl = `/api/logo?domain=${encodeURIComponent(domain)}&size=40`;

  return (
    <div style={{ width: "36px", height: "36px", minWidth: "36px", borderRadius: "8px", background: C.surface, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
      {failed ? (
        <span style={{ color: C.mid, fontSize: "13px", fontWeight: 800 }}>{name[0]}</span>
      ) : (
        <img
          src={logoUrl}
          alt={name}
          width={22}
          height={22}
          style={{ objectFit: "contain" }}
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}

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

function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }} style={{ height: "100%" }}>
      {children}
    </motion.div>
  );
}

const STAGES = ["Bootstrapped", "Funded", "Accelerator"];
const TOP_VENDOR_PRIORITY = ["Preferences AI"];

const VENDOR_DOMAINS: Record<string, string> = {
  "AWS": "aws.amazon.com",
  "Google Cloud": "cloud.google.com",
  "Microsoft Azure": "azure.microsoft.com",
  "Cloudflare": "cloudflare.com",
  "Notion": "notion.so",
  "Stripe": "stripe.com",
  "HubSpot": "hubspot.com",
  "Intercom": "intercom.com",
  "Mixpanel": "mixpanel.com",
  "Airtable": "airtable.com",
  "DigitalOcean": "digitalocean.com",
  "Databricks": "databricks.com",
  "Datadog": "datadoghq.com",
  "Zendesk": "zendesk.com",
  "Algolia": "algolia.com",
  "Amplitude": "amplitude.com",
  "Segment": "segment.com",
  "Sentry": "sentry.io",
  "GitHub": "github.com",
  "GitLab": "gitlab.com",
  "Linear": "linear.app",
  "Miro": "miro.com",
  "Asana": "asana.com",
  "ClickUp": "clickup.com",
  "Retool": "retool.com",
  "Webflow": "webflow.com",
  "Framer": "framer.com",
  "PostHog": "posthog.com",
  "MongoDB": "mongodb.com",
  "Redis": "redis.io",
  "Neon": "neon.tech",
  "Pinecone": "pinecone.io",
  "OpenAI": "openai.com",
  "Perplexity": "perplexity.ai",
  "ElevenLabs": "elevenlabs.io",
  "AssemblyAI": "assemblyai.com",
  "Deepgram": "deepgram.com",
  "Mistral": "mistral.ai",
  "Cerebras": "cerebras.ai",
  "Fireworks AI": "fireworks.ai",
  "xAI": "x.ai",
  "Nebius": "nebius.com",
  "HeyGen": "heygen.com",
  "Preferences AI": "preferencesai.io",
  "Airbyte": "airbyte.com",
  "Fivetran": "fivetran.com",
  "IBM Cloud": "ibm.com",
  "Vultr": "vultr.com",
  "Koyeb": "koyeb.com",
  "Scaleway": "scaleway.com",
  "Huawei Cloud": "huaweicloud.com",
  "Tencent Cloud": "tencentcloud.com",
  "Aiven": "aiven.io",
  "Akamai": "akamai.com",
  "Appwrite": "appwrite.io",
  "Pulumi": "pulumi.com",
  "CircleCI": "circleci.com",
  "Temporal": "temporal.io",
  "JetBrains": "jetbrains.com",
  "Cursor": "cursor.sh",
  "Auth0": "auth0.com",
  "Vanta": "vanta.com",
  "1Password": "1password.com",
  "Chargebee": "chargebee.com",
  "Stripe Atlas": "stripe.com",
  "Grafana": "grafana.com",
  "Statsig": "statsig.com",
  "Customer.io": "customer.io",
  "Mailchimp": "mailchimp.com",
  "Typeform": "typeform.com",
  "Mux": "mux.com",
  "Freshworks": "freshworks.com",
  "Attio": "attio.com",
  "Coda": "coda.io",
  "Make": "make.com",
  "n8n": "n8n.io",
  "Zapier": "zapier.com",
  "Apollo": "apollo.io",
  "Clay": "clay.com",
  "Remote": "remote.com",
  "QuickNode": "quicknode.com",
  "Alchemy": "alchemy.com",
  "LinkedIn": "linkedin.com",
  "Google Ads": "ads.google.com",
  "TikTok": "tiktok.com",
  "Reddit Ads": "reddit.com",
};

export default function CreditsClient({ credits }: { credits: Credit[] }) {
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  const [showMustHaveOnly, setShowMustHaveOnly] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedCredit, setSelectedCredit] = useState<Credit | null>(null);
  const [visitShift, setVisitShift] = useState(0);

  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setLoading(false); return; }
      setIsLoggedIn(true);
      setUserEmail(session.user.email ?? "");
      const { data } = await supabase
        .from("users")
        .select("is_pro")
        .eq("id", session.user.id)
        .single();
      setIsPro(data?.is_pro ?? false);
      setLoading(false);
    }
    checkAuth();
  }, []);

  useEffect(() => {
    const visitKey = "credits_must_haves_visit";
    const previousVisits = Number(window.sessionStorage.getItem(visitKey) ?? "0");
    window.sessionStorage.setItem(visitKey, String(previousVisits + 1));
    setVisitShift(previousVisits);
  }, []);

  // Sort: priority vendors first, then mustHave
  const sorted = [...credits].sort((a, b) => {
    const ai = TOP_VENDOR_PRIORITY.indexOf(a.vendor);
    const bi = TOP_VENDOR_PRIORITY.indexOf(b.vendor);
    if (ai !== -1 || bi !== -1) {
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    }
    if (a.mustHave && !b.mustHave) return -1;
    if (!a.mustHave && b.mustHave) return 1;
    return 0;
  });

  const pinned = sorted.filter((c) => TOP_VENDOR_PRIORITY.includes(c.vendor));
  const remaining = sorted.filter((c) => !TOP_VENDOR_PRIORITY.includes(c.vendor));
  const offset = remaining.length > 0 ? visitShift % remaining.length : 0;
  const visitOrdered = [...pinned, ...remaining.slice(offset), ...remaining.slice(0, offset)];

  // Apply filters
  const eligible = visitOrdered.filter((c) => {
    const stageMatch = selectedStage ? c.eligibility.includes(selectedStage) : true;
    const mustHaveMatch = showMustHaveOnly ? c.mustHave === true : true;
    return stageMatch && mustHaveMatch;
  });

  const totalValue = eligible.reduce((sum, c) => {
    const num = parseInt(c.value.replace(/[^0-9]/g, ""));
    return sum + (isNaN(num) ? 0 : num);
  }, 0);

  function creditNarrative(credit: Credit): string {
    const eligibilityText = credit.eligibility.length > 0 ? `best suited for ${credit.eligibility.join(", ")} founders` : "open to eligible founders";
    return `${credit.vendor} offers ${credit.value} in startup benefits and is ${eligibilityText}. Prioritize this if it reduces immediate burn in your current stage.`;
  }

  const formatTotal = (n: number) =>
    n >= 1000000 ? `$${(n / 1000000).toFixed(1)}M+` : `$${(n / 1000).toFixed(0)}K+`;

  const mustHaveCount = credits.filter(c => c.mustHave).length;

  async function handleSignOut() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <div style={{ background: C.surface, minHeight: "100vh", fontFamily: "'Inter', sans-serif", WebkitFontSmoothing: "antialiased" }}>

      {/* NAV */}
      <WorkspaceTopNav activeView="Must Haves" isLoggedIn={isLoggedIn} />

      {/* HEADER */}
      <div style={{ background: C.bg, borderBottom: `1px solid ${C.border}`, padding: `72px ${SHELL_LAYOUT.pageXPadding}px 56px` }}>
        <div style={{ maxWidth: `${SHELL_LAYOUT.contentMaxWidth}px`, margin: "0 auto" }}>
          <WorkspaceAccountBar
            currentView="Must Haves"
            email={userEmail}
            isLoggedIn={isLoggedIn}
            isPro={isPro}
            onSignOut={handleSignOut}
          />
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div style={{ width: "40px", height: "4px", background: C.orange, borderRadius: "2px", marginBottom: "28px" }} />
            <p style={{ fontSize: "11px", color: C.light, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "12px", fontWeight: 600 }}>
              {isPro ? "Pro Access · Unlocked" : "Premium · One time $149"}
            </p>
            <h1 style={{ fontSize: "clamp(36px, 5vw, 64px)", fontWeight: 900, letterSpacing: "-2px", color: C.ink, marginBottom: "12px", lineHeight: 1.02 }}>
              Must Haves<br />Startup Credits
            </h1>
            <p style={{ color: C.mid, fontSize: "16px", marginBottom: "36px", lineHeight: 1.6, maxWidth: "520px" }}>
              {isPro
                ? "You have full access. Filter by stage and apply directly to each program."
                : "Select your startup stage to see which credits you qualify for."}
            </p>

            {/* Filters row */}
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "24px", alignItems: "center" }}>

              {/* Must-Have Top 10 toggle */}
              <button
                onClick={() => setShowMustHaveOnly(!showMustHaveOnly)}
                style={{
                  padding: "9px 22px", borderRadius: "100px", fontSize: "14px", cursor: "pointer", fontWeight: 600,
                  border: "1.5px solid",
                  borderColor: showMustHaveOnly ? C.orange : C.border,
                  background: showMustHaveOnly ? C.orangeLight : C.bg,
                  color: showMustHaveOnly ? C.orange : C.mid,
                  transition: "all 0.15s", fontFamily: "inherit",
                  display: "flex", alignItems: "center", gap: "6px"
                }}
                onMouseEnter={e => { if (!showMustHaveOnly) { e.currentTarget.style.borderColor = C.orange; e.currentTarget.style.color = C.orange; } }}
                onMouseLeave={e => { if (!showMustHaveOnly) { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.mid; } }}
              >
                <Star style={{ width: "13px", height: "13px", fill: showMustHaveOnly ? C.orange : "none", color: showMustHaveOnly ? C.orange : C.mid }} />
                Top {mustHaveCount} — $1.5M
              </button>

              {/* Divider */}
              <div style={{ width: "1px", height: "24px", background: C.border, margin: "0 4px" }} />

              {/* Stage filters */}
              {STAGES.map((stage) => (
                <button key={stage}
                  onClick={() => setSelectedStage(selectedStage === stage ? null : stage)}
                  style={{ padding: "9px 22px", borderRadius: "100px", fontSize: "14px", cursor: "pointer", fontWeight: 500, border: "1.5px solid", borderColor: selectedStage === stage ? C.ink : C.border, background: selectedStage === stage ? C.ink : C.bg, color: selectedStage === stage ? "#fff" : C.mid, transition: "all 0.15s", fontFamily: "inherit" }}
                  onMouseEnter={e => { if (selectedStage !== stage) { e.currentTarget.style.borderColor = C.ink; e.currentTarget.style.color = C.ink; } }}
                  onMouseLeave={e => { if (selectedStage !== stage) { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.mid; } }}>
                  {stage}
                </button>
              ))}
            </div>

            {(selectedStage || showMustHaveOnly) && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                style={{ display: "inline-flex", alignItems: "center", gap: "10px", background: C.orangeLight, border: `1px solid rgba(255,77,0,0.2)`, borderRadius: "10px", padding: "12px 20px" }}>
                <CheckCircle style={{ width: "15px", height: "15px", color: C.orange }} />
                <span style={{ fontSize: "14px", color: C.ink, fontWeight: 500 }}>
                  {showMustHaveOnly && !selectedStage && <>Showing <strong style={{ color: C.orange }}>Top {mustHaveCount}</strong> must have credits <strong style={{ color: C.orange }}>$1.5M</strong> in value</>}
                  {!showMustHaveOnly && selectedStage && <>As a <strong>{selectedStage}</strong> startup, you qualify for <strong style={{ color: C.orange }}>{formatTotal(totalValue)}</strong> in credits</>}
                  {showMustHaveOnly && selectedStage && <>Top {mustHaveCount} credits available to <strong>{selectedStage}</strong> startups — <strong style={{ color: C.orange }}>{eligible.length} match</strong></>}
                </span>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>

      {/* GRID */}
      <div style={{ maxWidth: `${SHELL_LAYOUT.contentMaxWidth}px`, margin: "0 auto", padding: `48px ${SHELL_LAYOUT.pageXPadding}px` }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "16px", alignItems: "stretch" }}>
          {eligible.map((credit, i) => {
            const domain = VENDOR_DOMAINS[credit.vendor] ?? credit.vendor.toLowerCase().replace(/\s+/g, "").replace(/[^a-z0-9]/g, "") + ".com";
            const isMustHave = credit.mustHave === true;
            return (
              <FadeIn key={credit.vendor + i} delay={Math.min(i * 0.04, 0.3)}>
                <div
                  onClick={() => setSelectedCredit(credit)}
                  style={{
                    background: C.bg,
                    border: `1.5px solid ${isMustHave ? "rgba(255,77,0,0.25)" : C.border}`,
                    borderRadius: "12px",
                    overflow: "hidden",
                    transition: "box-shadow 0.15s",
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                    position: "relative",
                    cursor: "pointer",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.boxShadow = isMustHave ? "0 4px 20px rgba(255,77,0,0.10)" : "0 4px 20px rgba(0,0,0,0.06)")}
                  onMouseLeave={e => (e.currentTarget.style.boxShadow = "none")}
                >
                  {/* Must-Have badge */}
                  {isMustHave && (
                    <div style={{
                      position: "absolute", top: "12px", right: "12px", zIndex: 2,
                      background: C.orangeLight,
                      border: `1px solid rgba(255,77,0,0.3)`,
                      borderRadius: "100px",
                      padding: "3px 10px",
                      display: "flex", alignItems: "center", gap: "4px"
                    }}>
                      <Star style={{ width: "10px", height: "10px", fill: C.orange, color: C.orange }} />
                      <span style={{ fontSize: "10px", fontWeight: 700, color: C.orange, letterSpacing: "0.05em", textTransform: "uppercase" }}>Must Have</span>
                    </div>
                  )}

                  {/* HEADER — fixed height so all cards align */}
                  <div style={{ padding: "20px 24px", borderBottom: `1px solid ${C.border}`, height: "120px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>

                    {/* Row 1: logo + vendor + program */}
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <Logo domain={domain} name={credit.vendor} />
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontSize: "15px", fontWeight: 800, color: C.ink, letterSpacing: "-0.3px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", paddingRight: isMustHave ? "80px" : "0" }}>
                          {credit.vendor}
                        </div>
                        <div style={{ fontSize: "12px", color: C.light, marginTop: "1px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {credit.name}
                        </div>
                      </div>
                    </div>

                    {/* Row 2: value + category + eligibility */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                      <div style={{ fontSize: "22px", fontWeight: 900, color: isMustHave ? C.orange : C.ink, letterSpacing: "-0.8px", lineHeight: 1, whiteSpace: "nowrap" }}>
                        {credit.value}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap", justifyContent: "flex-end" }}>
                        <div style={{ padding: "3px 8px", background: C.tagBg, borderRadius: "4px", fontSize: "10px", fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: C.mid, whiteSpace: "nowrap" }}>
                          {credit.category}
                        </div>
                        {credit.eligibility.map((e) => (
                          <span key={e} style={{ fontSize: "10px", padding: "3px 8px", borderRadius: "100px", border: `1px solid ${C.border}`, color: C.light, fontWeight: 500, whiteSpace: "nowrap" }}>
                            {e}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* BODY */}
                  <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", flex: 1 }}>

                    {/* Description — fixed height, capped at 4 lines */}
                    <p style={{ fontSize: "13px", color: C.mid, lineHeight: 1.7, margin: "0 0 16px 0", height: "88px", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 4, WebkitBoxOrient: "vertical" }}>
                      {credit.public_description}
                    </p>

                    {/* Instructions — blurred for non-pro */}
                    <div style={{ position: "relative", borderRadius: C.radius, overflow: "hidden", flex: 1, marginBottom: isPro && credit.applyUrl ? "16px" : "0" }}>
                      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: C.radius, padding: "14px 16px", height: "100%", filter: isPro ? "none" : "blur(3px)", userSelect: isPro ? "auto" : "none", pointerEvents: isPro ? "auto" : "none" }}>
                        {credit.locked_instructions.split("\n").map((line, idx) => (
                          <p key={idx} style={{ fontSize: "12px", color: C.mid, lineHeight: 1.8, margin: 0 }}>{line}</p>
                        ))}
                      </div>
                      {!isPro && (
                        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.75)", backdropFilter: "blur(2px)", borderRadius: C.radius }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "7px", background: C.bg, border: `1px solid ${C.border}`, borderRadius: "100px", padding: "8px 16px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                            <Lock style={{ width: "12px", height: "12px", color: C.mid }} />
                            <span style={{ fontSize: "12px", color: C.mid, fontWeight: 600 }}>Unlock to see instructions</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Apply button — pro only */}
                    {isPro && credit.applyUrl && (
                      <a href={credit.applyUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }} onClick={(e) => e.stopPropagation()}>
                        <button
                          style={{ width: "100%", background: C.orange, color: "white", border: "none", borderRadius: C.radius, padding: "10px 16px", fontWeight: 600, cursor: "pointer", fontSize: "13px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", fontFamily: "inherit", transition: "background 0.15s" }}
                          onMouseEnter={e => (e.currentTarget.style.background = C.orangeHover)}
                          onMouseLeave={e => (e.currentTarget.style.background = C.orange)}
                        >
                          Apply Now <ExternalLink style={{ width: "12px", height: "12px" }} />
                        </button>
                      </a>
                    )}
                  </div>
                </div>
              </FadeIn>
            );
          })}
        </div>

        {/* CTA for non-pro */}
        {!isPro && !loading && (
          <FadeIn delay={0.2}>
            <div style={{ marginTop: "64px", border: `1.5px solid ${C.border}`, borderRadius: "16px", padding: "56px 64px", background: C.bg, textAlign: "center" }}>
              <div style={{ width: "32px", height: "3px", background: C.orange, borderRadius: "2px", margin: "0 auto 24px" }} />
              <p style={{ fontSize: "11px", color: C.light, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "16px", fontWeight: 600 }}>One time $149</p>
              <h2 style={{ fontSize: "clamp(24px, 3.5vw, 40px)", fontWeight: 900, letterSpacing: "-1.5px", color: C.ink, marginBottom: "14px" }}>
                Unlock all redemption instructions.
              </h2>
              <p style={{ color: C.mid, fontSize: "15px", lineHeight: 1.7, maxWidth: "420px", margin: "0 auto 36px" }}>
                Get exact apply links and step by step guides for every credit. Pay once, access forever.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", justifyContent: "center", marginBottom: "36px" }}>
                {["Direct apply links", "Step by step instructions", "Lifetime updates", "Eligibility checker"].map((perk) => (
                  <div key={perk} style={{ display: "flex", alignItems: "center", gap: "7px", fontSize: "13px", color: C.mid }}>
                    <CheckCircle style={{ width: "14px", height: "14px", color: C.orange }} /> {perk}
                  </div>
                ))}
              </div>
              <Link href={isLoggedIn ? "/api/checkout" : "/login"} style={{ textDecoration: "none" }}>
                <button
                  style={{ background: C.orange, color: "white", border: "none", borderRadius: C.radius, padding: "14px 32px", fontWeight: 700, cursor: "pointer", fontSize: "16px", display: "inline-flex", alignItems: "center", gap: "8px", fontFamily: "inherit", transition: "background 0.15s" }}
                  onMouseEnter={e => (e.currentTarget.style.background = C.orangeHover)}
                  onMouseLeave={e => (e.currentTarget.style.background = C.orange)}
                >
                  <Zap style={{ width: "16px", height: "16px" }} />
                  {isLoggedIn ? "Get Lifetime Access — $149" : "Sign In to Unlock"}
                  <ArrowRight style={{ width: "16px", height: "16px" }} />
                </button>
              </Link>
              <p style={{ fontSize: "12px", color: C.light, marginTop: "14px" }}>One time payment · No subscription · Instant access</p>
            </div>
          </FadeIn>
        )}

        {selectedCredit && (
          <div
            onClick={() => setSelectedCredit(null)}
            style={{ position: "fixed", inset: 0, background: "rgba(10,10,10,0.45)", zIndex: 130, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{ width: "min(820px, 100%)", maxHeight: "88vh", overflowY: "auto", background: C.bg, border: `1px solid ${C.border}`, borderRadius: "16px", padding: "24px", boxShadow: "0 18px 40px rgba(0,0,0,0.16)" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "14px", marginBottom: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <Logo
                    domain={VENDOR_DOMAINS[selectedCredit.vendor] ?? selectedCredit.vendor.toLowerCase().replace(/\s+/g, "").replace(/[^a-z0-9]/g, "") + ".com"}
                    name={selectedCredit.vendor}
                  />
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
                <span style={{ fontSize: "14px", fontWeight: 800, color: C.orange, background: C.orangeLight, border: `1px solid rgba(255,77,0,0.25)`, borderRadius: "999px", padding: "6px 12px" }}>
                  {selectedCredit.value}
                </span>
                <span style={{ fontSize: "11px", color: C.mid, letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600, border: `1px solid ${C.border}`, borderRadius: "999px", padding: "5px 10px" }}>
                  {selectedCredit.category}
                </span>
                {selectedCredit.eligibility.map((e) => (
                  <span key={e} style={{ fontSize: "11px", color: C.mid, border: `1px solid ${C.border}`, borderRadius: "999px", padding: "5px 10px" }}>{e}</span>
                ))}
              </div>

              <p style={{ color: C.ink, fontSize: "15px", lineHeight: 1.7, marginBottom: "8px" }}>{selectedCredit.public_description}</p>
              <p style={{ color: C.mid, fontSize: "14px", lineHeight: 1.7, marginBottom: "18px" }}>{creditNarrative(selectedCredit)}</p>

              <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "10px", padding: "16px 18px", marginBottom: "18px", filter: isPro ? "none" : "blur(2px)", position: "relative" }}>
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
                {isPro && selectedCredit.applyUrl ? (
                  <a href={selectedCredit.applyUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                    <button style={{ background: C.orange, color: "white", border: "none", borderRadius: C.radius, padding: "11px 18px", fontWeight: 700, cursor: "pointer", fontSize: "14px", display: "inline-flex", alignItems: "center", gap: "7px" }}>
                      Apply Now <ExternalLink style={{ width: "13px", height: "13px" }} />
                    </button>
                  </a>
                ) : (
                  <Link href={isLoggedIn ? "/dashboard" : "/login"} style={{ textDecoration: "none" }}>
                    <button style={{ background: C.orange, color: "white", border: "none", borderRadius: C.radius, padding: "11px 18px", fontWeight: 700, cursor: "pointer", fontSize: "14px", display: "inline-flex", alignItems: "center", gap: "7px" }}>
                      {isLoggedIn ? "Unlock Full Instructions" : "Sign In to Unlock"}
                    </button>
                  </Link>
                )}
                <button onClick={() => setSelectedCredit(null)} style={{ background: C.bg, color: C.mid, border: `1px solid ${C.border}`, borderRadius: C.radius, padding: "11px 18px", fontWeight: 600, cursor: "pointer", fontSize: "14px" }}>
                  Back to Must Haves
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ borderTop: `1px solid ${C.border}`, marginTop: "64px", paddingTop: "32px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
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
    </div>
  );
}
