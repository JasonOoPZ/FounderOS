"use client"

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  console.error("Global app error boundary:", error)

  return (
    <html>
      <body style={{ margin: 0, background: "#fafafa" }}>
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
          <div style={{ maxWidth: "560px", width: "100%", background: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "24px" }}>
            <h1 style={{ margin: 0, fontSize: "22px", color: "#111827" }}>Application error</h1>
            <p style={{ marginTop: "10px", color: "#6b7280", fontSize: "14px" }}>
              The app hit a recoverable error boundary.
            </p>
            <button onClick={() => reset()} style={{ marginTop: "16px", padding: "10px 14px", borderRadius: "8px", border: "1px solid #d1d5db", background: "#111827", color: "#fff", cursor: "pointer" }}>
              Retry
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
