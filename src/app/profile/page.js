"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "../components/AppShell";

const EMOJIS = ["🙂", "😄", "🐻", "🐱", "🐰", "🦊", "🐼", "🐧", "🌟", "🌈", "🍀", "🎧"];
const COLORS = ["#9B8CFF", "#FF8FCF", "#4FD9B5", "#4FA8FF", "#FFC61A", "#FF6B5B"];

export default function ProfilePage() {
  const router = useRouter();
  const [student, setStudent] = useState(null);
  const [nickname, setNickname] = useState("");
  const [emoji, setEmoji] = useState("🙂");
  const [color, setColor] = useState("#9B8CFF");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/me").then(async (res) => {
      if (!res.ok) { router.push("/"); return; }
      const data = await res.json();
      setStudent(data.student);
      setNickname(data.student.nickname || "");
      setEmoji(data.student.avatar_emoji || "🙂");
      setColor(data.student.avatar_color || "#9B8CFF");
    });
  }, [router]);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nickname, avatarEmoji: emoji, avatarColor: color }),
    });
    setSaving(false);
    setSaved(true);
  }

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/");
  }

  if (!student) return null;

  return (
    <AppShell title="👤 โปรไฟล์">
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 20 }}>
        <div className="card" style={{ width: 90, height: 90, borderRadius: "50%", background: color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, marginBottom: 10 }}>
          {emoji}
        </div>
        <div className="font-display" style={{ fontWeight: 800, fontSize: 16 }}>{nickname || student.handle}</div>
        <div style={{ fontSize: 11.5, color: "#8a8a8a", fontWeight: 600 }}>{student.class_room || "—"} · {student.handle}</div>
      </div>

      <div className="card-sm" style={{ background: "var(--mint)", padding: "12px 14px", fontSize: 12, fontWeight: 600, lineHeight: 1.6, marginBottom: 18 }}>
        💡 ชื่อเล่นที่ตั้งไว้นี้ จะแสดงในโพสต์และคอมเมนต์ที่พื้นที่ระบายแทนรหัสบัญชี — ชื่อจริงและเบอร์ติดต่อยังคงให้ครูแนะแนวเห็นเท่านั้น
      </div>

      <form onSubmit={handleSave} className="card-sm" style={{ background: "#fff", padding: 16, marginBottom: 18 }}>
        <div className="font-display" style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 10 }}>ตั้งค่าโปรไฟล์</div>

        <label className="font-display" style={{ fontSize: 12, fontWeight: 700, display: "block", marginBottom: 6 }}>ชื่อเล่น</label>
        <input
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="ชื่อเล่นที่อยากให้เรียก"
          className="card-sm"
          style={{ width: "100%", padding: "10px 12px", fontSize: 13.5, marginBottom: 14 }}
        />

        <label className="font-display" style={{ fontSize: 12, fontWeight: 700, display: "block", marginBottom: 8 }}>เลือกอวาตาร์</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
          {EMOJIS.map((e) => (
            <div
              key={e}
              onClick={() => setEmoji(e)}
              className="card-sm"
              style={{ width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, cursor: "pointer", background: emoji === e ? "var(--yellow)" : "#fff" }}
            >
              {e}
            </div>
          ))}
        </div>

        <label className="font-display" style={{ fontSize: 12, fontWeight: 700, display: "block", marginBottom: 8 }}>เลือกสีประจำตัว</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
          {COLORS.map((c) => (
            <div
              key={c}
              onClick={() => setColor(c)}
              style={{ width: 34, height: 34, borderRadius: "50%", background: c, cursor: "pointer", border: color === c ? "3px solid var(--ink)" : "2px solid var(--ink)", boxShadow: color === c ? "2px 2px 0 var(--ink)" : "none" }}
            />
          ))}
        </div>

        <button type="submit" disabled={saving} className="btn-brut" style={{ width: "100%", padding: 11, fontSize: 13 }}>
          {saving ? "กำลังบันทึก..." : saved ? "บันทึกแล้ว ✓" : "บันทึกโปรไฟล์"}
        </button>
      </form>

      <a href="/chat" className="card-sm" style={{ background: "#fff", padding: "13px 15px", display: "block", textDecoration: "none", color: "var(--ink)", marginBottom: 18 }}>
        <div className="font-display" style={{ fontWeight: 700, fontSize: 13 }}>💌 ข้อความกับครูแนะแนว / TUNT Bot →</div>
      </a>

      <button onClick={handleLogout} className="btn-brut" style={{ width: "100%", padding: 12, background: "var(--coral)", fontSize: 13.5 }}>
        ออกจากระบบ 🚪
      </button>
    </AppShell>
  );
}
