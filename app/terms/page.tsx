import Link from "next/link";

const C = {
  bg: "#ffffff",
  ink: "#0a0a0a",
  mid: "#6b6b6b",
  light: "#a3a3a3",
  border: "#e5e5e5",
};

export const metadata = {
  title: "Terms of Service | Launch Perks",
  description: "Terms governing your use of Launch Perks.",
};

export default function TermsPage() {
  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Inter', sans-serif" }}>
      <nav style={{ borderBottom: `1px solid ${C.border}`, height: "58px", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 48px" }}>
        <Link href="/" style={{ textDecoration: "none", color: C.ink, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", fontSize: "14px" }}>
          Launch Perks
        </Link>
      </nav>

      <main style={{ maxWidth: "900px", margin: "0 auto", padding: "56px 28px" }}>
        <p style={{ fontSize: "11px", color: C.light, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "10px", fontWeight: 600 }}>Legal</p>
        <h1 style={{ fontSize: "40px", letterSpacing: "-1px", color: C.ink, marginBottom: "16px" }}>Terms of Service</h1>
        <p style={{ color: C.mid, fontSize: "14px", marginBottom: "24px" }}>Last updated: March 17, 2026</p>

        <section style={{ color: C.mid, lineHeight: 1.8, fontSize: "14px", display: "grid", gap: "14px" }}>
          <p><strong style={{ color: C.ink }}>Use of service.</strong> By using Launch Perks, you agree to use the platform lawfully and responsibly.</p>
          <p><strong style={{ color: C.ink }}>Content accuracy.</strong> We aim to keep listings current, but program terms and availability can change without notice.</p>
          <p><strong style={{ color: C.ink }}>Third party links.</strong> Links to provider websites are external. We are not responsible for third party content, terms, or outcomes.</p>
          <p><strong style={{ color: C.ink }}>Account and payments.</strong> Paid access features are delivered as described at checkout. Misuse or abuse may result in access restrictions.</p>
          <p><strong style={{ color: C.ink }}>Limitation of liability.</strong> Launch Perks is provided on an as is basis without guarantees of specific financial or business outcomes.</p>
          <p><strong style={{ color: C.ink }}>Changes.</strong> We may update these terms periodically. Continued use after updates means you accept the revised terms.</p>
        </section>
      </main>
    </div>
  );
}
