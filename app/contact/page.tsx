import Link from "next/link";

const C = {
  bg: "#ffffff",
  surface: "#f7f7f5",
  ink: "#0a0a0a",
  mid: "#6b6b6b",
  light: "#a3a3a3",
  border: "#e5e5e5",
};

export const metadata = {
  title: "Contact | Launch Perks",
  description: "Contact Launch Perks for support and partnerships.",
};

export default function ContactPage() {
  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Inter', sans-serif" }}>
      <nav style={{ borderBottom: `1px solid ${C.border}`, height: "58px", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 48px" }}>
        <Link href="/" style={{ textDecoration: "none", color: C.ink, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", fontSize: "14px" }}>
          Launch Perks
        </Link>
      </nav>

      <main style={{ maxWidth: "900px", margin: "0 auto", padding: "56px 28px" }}>
        <p style={{ fontSize: "11px", color: C.light, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "10px", fontWeight: 600 }}>Contact</p>
        <h1 style={{ fontSize: "40px", letterSpacing: "-1px", color: C.ink, marginBottom: "16px" }}>Get in touch</h1>
        <p style={{ color: C.mid, lineHeight: 1.7, fontSize: "15px", marginBottom: "20px" }}>
          For support, billing questions, listing corrections, or partnerships, contact us at:
        </p>

        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "20px", marginBottom: "18px" }}>
          <p style={{ color: C.ink, fontWeight: 700, marginBottom: "6px" }}>Email</p>
          <p style={{ color: C.mid, fontSize: "14px" }}>support@launchperks.com</p>
        </div>

        <p style={{ color: C.mid, fontSize: "14px" }}>
          We typically respond within 2 business days.
        </p>
      </main>
    </div>
  );
}
