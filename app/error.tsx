"use client"

import { useEffect } from "react"

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Route error boundary:", error)
  }, [error])

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#fafafa", padding: "24px" }}>
      <div style={{ maxWidth: "520px", width: "100%", background: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "24px" }}>
        <h1 style={{ margin: 0, fontSize: "20px", color: "#111827" }}>Something went wrong</h1>
        <p style={{ marginTop: "10px", color: "#6b7280", fontSize: "14px" }}>
          A page error occurred. Try again, or return to login.
        </p>
        <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
          <button onClick={() => reset()} style={{ padding: "10px 14px", borderRadius: "8px", border: "1px solid #d1d5db", background: "#111827", color: "#fff", cursor: "pointer" }}>
            Try Again
          </button>
          <a href="/login" style={{ padding: "10px 14px", borderRadius: "8px", border: "1px solid #d1d5db", color: "#111827", textDecoration: "none" }}>
            Go to Login
          </a>
        </div>
      </div>
    </div>
  )
}
