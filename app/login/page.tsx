"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  async function handleGoogleLogin() {
    try {
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
    } catch (err) {
      console.error("Google login error:", err);
      setError("Failed to start Google login. Please try again.");
    }
  }

  async function handleEmailLogin() {
    setError("");
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
      else router.push("/dashboard");
    } catch (err) {
      console.error("Email login error:", err);
      setError("Login failed. Please try again.");
    }
  }

  if (!mounted) {
    return null;
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#fafafa", fontFamily: "Inter, sans-serif" }}>
      <div style={{ width: "100%", maxWidth: "400px", padding: "24px" }}>

        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <span style={{ fontWeight: 600, fontSize: "0.95rem", letterSpacing: "0.12em", color: "#09090b" }}>Launch Perks</span>
        </div>

        <div style={{ background: "#fff", border: "1px solid #e4e4e7", borderRadius: "16px", padding: "40px" }}>
          <h1 style={{ fontSize: "1.3rem", fontWeight: 600, color: "#09090b", marginBottom: "24px" }}>Sign in</h1>

          <button onClick={handleGoogleLogin} style={{ width: "100%", padding: "10px", border: "1px solid #e4e4e7", borderRadius: "7px", background: "#fff", cursor: "pointer", fontSize: "0.875rem", fontWeight: 500, color: "#09090b", marginBottom: "16px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
            <div style={{ flex: 1, height: "1px", background: "#e4e4e7" }} />
            <span style={{ fontSize: "0.75rem", color: "#a1a1aa" }}>or</span>
            <div style={{ flex: 1, height: "1px", background: "#e4e4e7" }} />
          </div>

          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)}
            style={{ width: "100%", padding: "10px 14px", border: "1px solid #e4e4e7", borderRadius: "7px", fontSize: "0.875rem", marginBottom: "10px", boxSizing: "border-box", outline: "none", background: "#fff", color: "#09090b" }} />

          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)}
            style={{ width: "100%", padding: "10px 14px", border: "1px solid #e4e4e7", borderRadius: "7px", fontSize: "0.875rem", marginBottom: "16px", boxSizing: "border-box", outline: "none", background: "#fff", color: "#09090b" }} />

          {error && <p style={{ color: "#dc2626", fontSize: "0.8rem", marginBottom: "12px" }}>{error}</p>}

          <button onClick={handleEmailLogin} style={{ width: "100%", padding: "11px", background: "#dc2626", color: "#fff", border: "none", borderRadius: "7px", fontWeight: 500, cursor: "pointer", fontSize: "0.9rem" }}>
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
}