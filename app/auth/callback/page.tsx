"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function AuthCallbackPage() {
  const router = useRouter()
  const [message, setMessage] = useState("Finalizing sign in...")

  useEffect(() => {
    async function finalizeAuth() {
      try {
        const url = new URL(window.location.href)
        const code = url.searchParams.get("code")

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code)
          if (error) {
            console.error("OAuth code exchange failed:", error)
            setMessage("Sign in failed. Redirecting to login...")
            setTimeout(() => router.replace("/login"), 1200)
            return
          }
        }

        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          setMessage("No active session. Redirecting to login...")
          setTimeout(() => router.replace("/login"), 1200)
          return
        }

        router.replace("/dashboard")
      } catch (error) {
        console.error("OAuth callback failed:", error)
        setMessage("Sign in failed. Redirecting to login...")
        setTimeout(() => router.replace("/login"), 1200)
      }
    }

    finalizeAuth()
  }, [router])

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#fafafa", color: "#6b7280", fontSize: "14px" }}>
      {message}
    </div>
  )
}
