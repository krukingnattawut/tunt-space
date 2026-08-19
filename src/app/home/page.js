"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "../components/AppShell";
import HotlineModal from "../components/HotlineModal";

const MOODS = [
  { key: "great", icon: "😄", label: "สดใส" },
  { key: "good", icon: "🙂", label: "ปกติ" },
  { key: "neutral", icon: "😐", label: "เฉยๆ" },
  { key: "tired", icon: "😔", label: "เหนื่อยใจ" },
  { key: "bad", icon: "😢", label: "แย่มาก" },
];

export default function HomePage() {
  const router = useRouter();
  const [student, setStudent] = useState(null);
  const [selectedMood, setSelectedMood] = useState(null);
  const [saved, setSaved] = useState(false);
  const [hotlineOpen, setHotlineOpen] = useState(false);

  useEffect(() => {
    fetch("/api/me").then(async (res) => {
      if (!res.ok) { router.push("/"); return; }
      const data = await res.json();
      setStudent(data.student);
    });
  }, [router]);

  async function handleMoodSelect(mood) {
    setSelectedMood(mood);
    setSaved(false);
    await fetch("/api/checkin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mood }),
    });
    setSaved(true);
  }

  if (!student) return null;

  return (
    <AppShell title="หน้าแรก" showBack={false}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "2px 2px 6px" }}>
        <div>
          <div style={{ fontSize: 12, color: "#4a4a4a", fontWeight: 600 }}>สวัสดีตอนเช้า 👋</div>
          <div className="font-display" style={{ fontWeight: 800, fontSize: 19 }}>
            {student.avatar_emoji} {student.nickname || student.full_name}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", margin: "16px 0 12px" }}>
        <div
          className="card"
          style={{ width: 150, height: 150, borderRadius: "50%", background: student.avatar_color || "var(--purple)", display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <div className="font-display" style={{ fontWeight: 800, fontSize: 14, textAlign: "center" }}>
            {saved ? "บันทึกแล้ว 💛" : "เลือกอารมณ์\nด้านล่าง"}
          </div>
        </div>
        <div style={{ fontSize: 12.5, color: "#4a4a4a", marginTop: 12, fontWeight: 600 }}>วันนี้คุณรู้สึกอย่างไรบ้าง?</div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", gap: 7, margin: "14px 0 4px" }}>
        {MOODS.map((m) => (
          <div
            key={m.key}
            onClick={() => handleMoodSelect(m.key)}
            className="card-sm"
            style={{ flex: 1, textAlign: "center", padding: "9px 0", fontSize: 21, cursor: "pointer", background: selectedMood === m.key ? "var(--yellow)" : "#fff" }}
          >
            {m.icon}
            <small className="font-display" style={{ display: "block", fontSize: 9, fontWeight: 700, marginTop: 3 }}>{m.label}</small>
          </div>
        ))}
      </div>

      <div className="font-display" style={{ fontWeight: 800, fontSize: 14.5, margin: "22px 0 10px" }}>🧭 สำรวจวันนี้</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <a href="/feed" className="card-sm" style={{ background: "var(--pink)", padding: "15px 13px", display: "block", textDecoration: "none", color: "var(--ink)" }}>
          <div style={{ fontSize: 22, marginBottom: 8 }}>💬</div>
          <div className="font-display" style={{ fontWeight: 700, fontSize: 13.5 }}>พื้นที่ระบาย</div>
          <div style={{ fontSize: 11, color: "#3a3a3a", fontWeight: 500 }}>โพสต์แบบไม่ระบุตัวตน</div>
        </a>
        <a href="/tests" className="card-sm" style={{ background: "var(--blue)", padding: "15px 13px", display: "block", textDecoration: "none", color: "var(--ink)" }}>
          <div style={{ fontSize: 22, marginBottom: 8 }}>🧩</div>
          <div className="font-display" style={{ fontWeight: 700, fontSize: 13.5 }}>แบบทดสอบ</div>
          <div style={{ fontSize: 11, color: "#3a3a3a", fontWeight: 500 }}>รู้จักตัวเอง</div>
        </a>
        <a href="/chat" className="card-sm" style={{ background: "var(--mint)", padding: "15px 13px", display: "block", textDecoration: "none", color: "var(--ink)" }}>
          <div style={{ fontSize: 22, marginBottom: 8 }}>🤖</div>
          <div className="font-display" style={{ fontWeight: 700, fontSize: 13.5 }}>TUNT Bot</div>
          <div style={{ fontSize: 11, color: "#3a3a3a", fontWeight: 500 }}>รับฟัง 24 ชม.</div>
        </a>
        <div onClick={() => setHotlineOpen(true)} className="card-sm" style={{ background: "var(--yellow)", padding: "15px 13px", cursor: "pointer" }}>
          <div style={{ fontSize: 22, marginBottom: 8 }}>☎️</div>
          <div className="font-display" style={{ fontWeight: 700, fontSize: 13.5 }}>สายด่วนสุขภาพจิต</div>
          <div style={{ fontSize: 11, color: "#3a3a3a", fontWeight: 500 }}>ต้องการความช่วยเหลือด่วน</div>
        </div>
      </div>

      <div className="font-display" style={{ fontWeight: 800, fontSize: 14.5, margin: "22px 0 10px" }}>📰 ข่าวสารล่าสุด</div>
      <a href="/news" className="card-sm" style={{ background: "#fff", padding: "13px 15px", display: "block", textDecoration: "none", color: "var(--ink)" }}>
        <div className="font-display" style={{ fontWeight: 700, fontSize: 13 }}>ดูข่าวสารและกิจกรรมทั้งหมด →</div>
      </a>

      <HotlineModal open={hotlineOpen} onClose={() => setHotlineOpen(false)} />
    </AppShell>
  );
}
