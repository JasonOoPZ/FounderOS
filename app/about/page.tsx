import Link from "next/link";

const C = {
  bg: "#ffffff",
  surface: "#f7f7f5",
  ink: "#0a0a0a",
  mid: "#6b6b6b",
  light: "#a3a3a3",
  border: "#e5e5e5",
  orange: "#ff4d00",
};

export const metadata = {
  title: "About Us | Launch Perks",
  description: "Learn about Launch Perks and our mission to help founders access startup resources.",
};

export default function AboutPage() {
  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Inter', sans-serif" }}>
      <nav style={{ borderBottom: `1px solid ${C.border}`, height: "58px", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 48px" }}>
        <Link href="/" style={{ textDecoration: "none", color: C.ink, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", fontSize: "14px" }}>
          Launch Perks
        </Link>
        <div style={{ display: "flex", gap: "24px" }}>
          <Link href="/directory" style={{ color: C.mid, textDecoration: "none", fontSize: "14px" }}>Directory</Link>
          <Link href="/providers" style={{ color: C.mid, textDecoration: "none", fontSize: "14px" }}>Providers</Link>
          <Link href="/credits" style={{ color: C.mid, textDecoration: "none", fontSize: "14px" }}>Must Haves</Link>
        </div>
      </nav>

      <main style={{ maxWidth: "900px", margin: "0 auto", padding: "56px 28px" }}>
        <p style={{ fontSize: "11px", color: C.light, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "10px", fontWeight: 600 }}>About Us</p>
        <h1 style={{ fontSize: "42px", letterSpacing: "-1px", color: C.ink, marginBottom: "14px" }}>Built for founders who move fast.</h1>
        <p style={{ color: C.mid, lineHeight: 1.7, fontSize: "16px", marginBottom: "22px" }}>
          Launch Perks curates startup credits, tools, and practical resources so founders can reduce burn and focus on shipping.
          Our goal is simple: make high value opportunities easier to discover and act on.
        </p>

        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "22px", marginBottom: "18px" }}>
          <h2 style={{ fontSize: "18px", marginBottom: "8px", color: C.ink }}>What we do</h2>
          <p style={{ color: C.mid, lineHeight: 1.7, fontSize: "14px" }}>
            We collect and organize startup programs, software credits, and operational partners into one searchable platform,
            with clear eligibility guidance and direct apply paths.
          </p>
        </div>

        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "22px" }}>
          <h2 style={{ fontSize: "18px", marginBottom: "8px", color: C.ink }}>How to contact us</h2>
          <p style={{ color: C.mid, lineHeight: 1.7, fontSize: "14px" }}>
            For support, data corrections, or partnership requests, use our contact page.
          </p>
          <Link href="/contact" style={{ display: "inline-block", marginTop: "12px", color: C.orange, textDecoration: "none", fontWeight: 600 }}>
            Go to Contact
          </Link>
        </div>
      </main>
    </div>
  );
}
