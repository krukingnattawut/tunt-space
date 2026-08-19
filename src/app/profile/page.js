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
  const [messages, setMessages] = useState([]);
  const [msgInput, setMsgInput] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetch("/api/me").then(async (res) => {
      if (!res.ok) { router.push("/"); return; }
      const data = await res.json();
      setStudent(data.student);
      setNickname(data.student.nickname || "");
      setEmoji(data.student.avatar_emoji || "🙂");
      setColor(data.student.avatar_color || "#9B8CFF");
      loadMessages();
    });
  }, [router]);

  async function loadMessages() {
    const r = await fetch("/api/messages");
    const data = await r.json();
    if (data.ok) setMessages(data.messages);
  }

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

  async function handleSendMessage(e) {
    e.preventDefault();
    if (!msgInput.trim()) return;
    setSending(true);
    await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: msgInput }),
    });
    setMsgInput("");
    await loadMessages();
    setSending(false);
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
        <div className="font-display" style={{ fontWeight: 800, fontSize: 16 }}>{student.handle}</div>
        <div style={{ fontSize: 11.5, color: "#8a8a8a", fontWeight: 600 }}>{student.class_room || "—"}</div>
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

      <div className="card-sm" style={{ background: "#fff", padding: 16, marginBottom: 18 }}>
        <div className="font-display" style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 10 }}>💌 ข้อความกับครูแนะแนว</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 220, overflowY: "auto", marginBottom: 12 }}>
          {messages.length === 0 && <div style={{ fontSize: 12, color: "#8a8a8a", fontWeight: 600 }}>ยังไม่มีข้อความ</div>}
          {messages.map((m) => (
            <div key={m.id} style={{ alignSelf: m.sender === "teacher" ? "flex-start" : "flex-end", maxWidth: "85%" }}>
              <div className="font-display" style={{ fontSize: 9.5, fontWeight: 700, color: "#8a8a8a", marginBottom: 2 }}>
                {m.sender === "teacher" ? "ครูแนะแนว" : "คุณ"}
              </div>
              <div className="card-sm" style={{ padding: "8px 11px", fontSize: 12.5, fontWeight: 600, background: m.sender === "teacher" ? "var(--mint)" : "var(--blue)" }}>
                {m.content}
              </div>
            </div>
          ))}
        </div>
        <form onSubmit={handleSendMessage} style={{ display: "flex", gap: 8 }}>
          <input
            value={msgInput}
            onChange={(e) => setMsgInput(e.target.value)}
            placeholder="พิมพ์ข้อความถึงครู..."
            className="card-sm"
            style={{ flex: 1, padding: "9px 12px", fontSize: 12.5 }}
          />
          <button type="submit" disabled={sending} className="btn-brut" style={{ padding: "9px 14px", fontSize: 12 }}>ส่ง</button>
        </form>
      </div>

      <button onClick={handleLogout} className="btn-brut" style={{ width: "100%", padding: 12, background: "var(--coral)", fontSize: 13.5 }}>
        ออกจากระบบ 🚪
      </button>
    </AppShell>
  );
}
