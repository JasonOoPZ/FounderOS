import Link from "next/link";
import { APP_THEME } from "@/lib/ui-theme";

const C = APP_THEME;

export const metadata = {
  title: "Privacy Policy | Launch Perks",
  description: "How Launch Perks collects and uses information.",
};

export default function PrivacyPage() {
  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Inter', sans-serif" }}>
      <nav style={{ borderBottom: `1px solid ${C.border}`, height: "58px", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 48px" }}>
        <Link href="/" style={{ textDecoration: "none", color: C.ink, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", fontSize: "14px" }}>
          Launch Perks
        </Link>
      </nav>

      <main style={{ maxWidth: "900px", margin: "0 auto", padding: "56px 28px" }}>
        <p style={{ fontSize: "11px", color: C.light, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "10px", fontWeight: 600 }}>Legal</p>
        <h1 style={{ fontSize: "40px", letterSpacing: "-1px", color: C.ink, marginBottom: "16px" }}>Privacy Policy</h1>
        <p style={{ color: C.mid, fontSize: "14px", marginBottom: "24px" }}>Last updated: March 17, 2026</p>

        <section style={{ color: C.mid, lineHeight: 1.8, fontSize: "14px", display: "grid", gap: "14px" }}>
          <p><strong style={{ color: C.ink }}>Information we collect.</strong> We may collect account details, usage data, and support messages necessary to operate the service.</p>
          <p><strong style={{ color: C.ink }}>How we use data.</strong> Data is used to authenticate users, deliver paid access, improve product quality, and provide support.</p>
          <p><strong style={{ color: C.ink }}>Sharing.</strong> We do not sell personal data. We may share limited information with trusted service providers needed to run Launch Perks.</p>
          <p><strong style={{ color: C.ink }}>Security.</strong> We use reasonable safeguards, but no system can guarantee absolute security.</p>
          <p><strong style={{ color: C.ink }}>Your choices.</strong> You can request account updates or deletion by contacting us.</p>
          <p><strong style={{ color: C.ink }}>Changes.</strong> We may update this policy from time to time. The latest version is always posted on this page.</p>
        </section>
      </main>
    </div>
  );
}
