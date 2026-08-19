"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthLayout from "../components/AuthLayout";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ fullName: "", classRoom: "", phone: "", username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!form.fullName || !form.phone || !form.username || !form.password) {
      setError("กรุณากรอกข้อมูลให้ครบ (ยกเว้นชั้นเรียน)");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "สมัครไม่สำเร็จ");
      router.push("/home");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const fields = [
    { key: "fullName", label: "ชื่อ-นามสกุล", placeholder: "เช่น สมชาย ใจดี" },
    { key: "classRoom", label: "ชั้นเรียน", placeholder: "เช่น ม.5/2" },
    { key: "phone", label: "เบอร์ติดต่อ (ผู้ปกครอง/นักเรียน)", placeholder: "08X-XXX-XXXX" },
    { key: "username", label: "ตั้งไอดี", placeholder: "เช่น sam_tunt" },
    { key: "password", label: "ตั้งรหัสผ่าน (อย่างน้อย 6 ตัว)", placeholder: "••••••••", type: "password" },
  ];

  return (
    <AuthLayout>
      <div className="md:hidden" style={{ textAlign: "center", marginBottom: 18 }}>
        <div
          className="card"
          style={{ width: 66, height: 66, borderRadius: 18, background: "var(--coral)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", transform: "rotate(-4deg)" }}
        >
          <span className="font-display" style={{ fontWeight: 800, fontSize: 22 }}>ใจ</span>
        </div>
      </div>

      <h1 className="font-display" style={{ fontWeight: 800, fontSize: 22, margin: "0 0 4px" }}>สมัครสมาชิก TUNT Space</h1>
      <p style={{ fontSize: 12.5, color: "#4a4a4a", fontWeight: 600, margin: "0 0 20px" }}>ใช้เวลาไม่ถึงนาที</p>

      <form onSubmit={handleSubmit}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 0 }}>
          {fields.map((f) => (
            <div key={f.key} style={{ marginBottom: 14 }}>
              <label className="font-display" style={{ fontSize: 12.5, fontWeight: 700, display: "block", marginBottom: 6 }}>{f.label}</label>
              <input
                type={f.type || "text"}
                value={form[f.key]}
                onChange={(e) => update(f.key, e.target.value)}
                placeholder={f.placeholder}
                className="card-sm"
                style={{ width: "100%", padding: "12px 14px", fontSize: 14.5, background: "#fff", outline: "none" }}
              />
            </div>
          ))}
        </div>

        <div className="card-sm" style={{ background: "var(--mint)", padding: "12px 14px", fontSize: 12, fontWeight: 600, lineHeight: 1.6, margin: "8px 0 20px" }}>
          🔒 ชื่อและเบอร์ติดต่อ <b>ครูแนะแนวเท่านั้นที่เห็น</b> เพื่อนคนอื่นเห็นคุณเป็นบัญชีไม่ระบุตัวตนเสมอ
        </div>

        {error && <div style={{ color: "var(--coral)", fontSize: 12.5, fontWeight: 700, marginBottom: 12 }}>{error}</div>}

        <button type="submit" disabled={loading} className="btn-brut" style={{ width: "100%", padding: 14, fontSize: 15 }}>
          {loading ? "กำลังสมัคร..." : "สมัครสมาชิก 🚀"}
        </button>
      </form>

      <a href="/" style={{ display: "block", textAlign: "center", marginTop: 16, fontSize: 12.5, fontWeight: 700, color: "var(--ink)" }}>
        มีบัญชีอยู่แล้ว? เข้าสู่ระบบ →
      </a>
    </AuthLayout>
  );
}
