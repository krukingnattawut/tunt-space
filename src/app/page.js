"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthLayout from "./components/AuthLayout";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/me").then((res) => {
      if (res.ok) router.push("/home");
    });
  }, [router]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!username.trim() || !password.trim()) {
      setError("กรุณากรอกไอดีและรหัสผ่าน");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "เข้าสู่ระบบไม่สำเร็จ");
      router.push("/home");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      {/* Mobile-only brand mark (desktop shows the left brand panel instead) */}
      <div className="md:hidden" style={{ textAlign: "center", marginBottom: 22 }}>
        <div
          className="card"
          style={{ width: 78, height: 78, borderRadius: 20, background: "var(--coral)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px", transform: "rotate(-4deg)" }}
        >
          <span className="font-display" style={{ fontWeight: 800, fontSize: 26 }}>ใจ</span>
        </div>
        <h1 className="font-display" style={{ fontWeight: 800, fontSize: 23, margin: "0 0 4px" }}>TUNT Space</h1>
        <p style={{ fontSize: 13, color: "#4a4a4a", fontWeight: 600, margin: 0, lineHeight: 1.6 }}>
          พื้นที่เซฟใจของคุณ ✦ Track · Understand · Notify · Treat
        </p>
      </div>

      <div className="hidden md:block" style={{ marginBottom: 22 }}>
        <h2 className="font-display" style={{ fontWeight: 800, fontSize: 24, margin: "0 0 6px" }}>เข้าสู่ระบบ</h2>
        <p style={{ fontSize: 13.5, color: "#4a4a4a", fontWeight: 600, margin: 0 }}>ยินดีต้อนรับกลับมาครับ</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 14 }}>
          <label className="font-display" style={{ fontSize: 12.5, fontWeight: 700, display: "block", marginBottom: 6 }}>ไอดี</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="ไอดีของคุณ"
            className="card-sm"
            style={{ width: "100%", padding: "12px 14px", fontSize: 14.5, background: "#fff", outline: "none" }}
          />
        </div>
        <div style={{ marginBottom: 14 }}>
          <label className="font-display" style={{ fontSize: 12.5, fontWeight: 700, display: "block", marginBottom: 6 }}>รหัสผ่าน</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="card-sm"
            style={{ width: "100%", padding: "12px 14px", fontSize: 14.5, background: "#fff", outline: "none" }}
          />
        </div>

        {error && <div style={{ color: "var(--coral)", fontSize: 12.5, fontWeight: 700, marginBottom: 12 }}>{error}</div>}

        <button type="submit" disabled={loading} className="btn-brut" style={{ width: "100%", padding: 14, fontSize: 15 }}>
          {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ 🔑"}
        </button>
      </form>

      <a href="/register" style={{ display: "block", textAlign: "center", marginTop: 16, fontSize: 12.5, fontWeight: 700, color: "var(--ink)" }}>
        ยังไม่มีบัญชี? สมัครสมาชิก →
      </a>
      <a href="/teacher" style={{ display: "block", textAlign: "center", marginTop: 10, fontSize: 12, color: "#8a8a8a", fontWeight: 700 }}>
        สำหรับครูแนะแนว →
      </a>
    </AuthLayout>
  );
}
