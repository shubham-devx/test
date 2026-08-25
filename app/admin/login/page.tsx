"use client";

import { useState, type CSSProperties, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed.");
        setLoading(false);
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div style={styles.wrap}>
      <form onSubmit={handleSubmit} style={styles.card}>
        <h1 style={styles.title}>Admin Login</h1>
        <p style={styles.subtitle}>AKGEC Skills Foundation — Registrations Dashboard</p>

        <label style={styles.label} htmlFor="admin-password">
          Password
        </label>
        <input
          id="admin-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
          autoFocus
        />

        {error && <div style={styles.error}>{error}</div>}

        <button type="submit" style={styles.button} disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  wrap: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    background: "#faf8f5",
    fontFamily: "'DM Sans', sans-serif",
    padding: 20,
  },
  card: {
    width: "100%",
    maxWidth: 380,
    background: "#fff",
    padding: "36px 32px",
    borderRadius: 16,
    border: "1px solid #ded9d2",
    boxShadow: "0 18px 45px rgba(40,25,20,0.12)",
  },
  title: {
    margin: "0 0 4px",
    fontFamily: "'Manrope', sans-serif",
    fontSize: 22,
    fontWeight: 800,
    color: "#252525",
  },
  subtitle: { margin: "0 0 24px", fontSize: 13, color: "#777" },
  label: { display: "block", marginBottom: 6, fontSize: 13, fontWeight: 700, color: "#4b4b4b" },
  input: {
    width: "100%",
    padding: "11px 14px",
    marginBottom: 16,
    border: "1px solid #ded9d2",
    borderRadius: 10,
    fontSize: 15,
    boxSizing: "border-box",
  },
  error: {
    marginBottom: 16,
    padding: "10px 14px",
    borderRadius: 8,
    background: "#fdecec",
    color: "#a33b49",
    fontSize: 13,
  },
  button: {
    width: "100%",
    padding: "12px 0",
    border: 0,
    borderRadius: 10,
    background: "#7b1e2b",
    color: "#fff",
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
  },
};
