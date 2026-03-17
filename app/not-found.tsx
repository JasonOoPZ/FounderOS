import Link from "next/link"

export default function NotFound() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "12px", background: "#fafafa", color: "#111827" }}>
      <h2 style={{ margin: 0, fontSize: "20px", fontWeight: 700 }}>Page not found</h2>
      <Link href="/" style={{ color: "#2563eb", textDecoration: "none", fontSize: "14px" }}>
        Back to home
      </Link>
    </div>
  )
}
