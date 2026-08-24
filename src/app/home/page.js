"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "../components/AppShell";
import HotlineModal from "../components/HotlineModal";
import { TEST_LIST } from "@/lib/testBank";

const MOODS = [
  { key: "great", icon: "😄", label: "สดใส" },
  { key: "good", icon: "🙂", label: "ปกติ" },
  { key: "neutral", icon: "😐", label: "เฉยๆ" },
  { key: "tired", icon: "😔", label: "เหนื่อยใจ" },
  { key: "bad", icon: "😢", label: "แย่มาก" },
];

const EXPLORE_CARDS = [
  { href: "/feed", icon: "💬", title: "พื้นที่ระบาย", desc: "โพสต์แบบไม่ระบุตัวตน", bg: "var(--pink)" },
  { href: "/tests", icon: "🧩", title: "แบบทดสอบ", desc: "รู้จักตัวเอง", bg: "var(--blue)" },
  { href: "/chat", icon: "🤖", title: "TUNT Bot", desc: "รับฟัง 24 ชม.", bg: "var(--mint)" },
  { href: "/gratitude", icon: "🌻", title: "บันทึกขอบคุณ", desc: "เขียนสิ่งดีๆ วันนี้", bg: "#FFDDA1" },
];

export default function HomePage() {
  const router = useRouter();
  const [student, setStudent] = useState(null);
  const [selectedMood, setSelectedMood] = useState(null);
  const [saved, setSaved] = useState(false);
  const [hotlineOpen, setHotlineOpen] = useState(false);
  const [news, setNews] = useState([]);

  useEffect(() => {
    fetch("/api/me").then(async (res) => {
      if (!res.ok) { router.push("/"); return; }
      const data = await res.json();
      setStudent(data.student);
    });
    fetch("/api/news").then(async (res) => {
      const d = await res.json();
      if (d.ok) setNews(d.news.slice(0, 8));
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
      {/* Hero panel — Netflix/Disney+-style featured strip */}
      <div className="stage-panel" style={{ padding: "22px 20px", marginBottom: 26, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -40, right: -30, width: 160, height: 160, borderRadius: "50%", background: student.avatar_color || "var(--purple)", opacity: 0.18, filter: "blur(2px)" }} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18, position: "relative" }}>
          <div>
            <div style={{ fontSize: 12, color: "var(--stage-text-dim)", fontWeight: 600 }}>สวัสดีตอนเช้า 👋</div>
            <div className="font-display" style={{ fontWeight: 800, fontSize: 20, color: "var(--stage-text)" }}>
              {student.avatar_emoji} {student.nickname || student.full_name}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
          <div
            className="card"
            style={{
              width: 138, height: 138, borderRadius: "50%", background: student.avatar_color || "var(--purple)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "inset 4px 4px 10px rgba(0,0,0,0.12), inset -4px -4px 10px rgba(255,255,255,0.35), 6px 6px 0 var(--ink)",
            }}
          >
            <div className="font-display" style={{ fontWeight: 800, fontSize: 13, textAlign: "center" }}>
              {saved ? "บันทึกแล้ว 💛" : "เลือกอารมณ์\nด้านล่าง"}
            </div>
          </div>
          <div style={{ fontSize: 12.5, color: "var(--stage-text-dim)", margin: "12px 0 14px", fontWeight: 600 }}>วันนี้คุณรู้สึกอย่างไรบ้าง?</div>

          <div style={{ display: "flex", justifyContent: "center", gap: 7, width: "100%" }}>
            {MOODS.map((m) => (
              <div
                key={m.key}
                onClick={() => handleMoodSelect(m.key)}
                className="card-sm"
                style={{ flex: 1, maxWidth: 68, textAlign: "center", padding: "9px 0", fontSize: 20, cursor: "pointer", background: selectedMood === m.key ? "var(--yellow)" : "#fff" }}
              >
                {m.icon}
                <small className="font-display" style={{ display: "block", fontSize: 8.5, fontWeight: 700, marginTop: 3 }}>{m.label}</small>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="row-title">🧭 สำรวจวันนี้</div>
      <div className="scroll-row">
        {EXPLORE_CARDS.map((c) => (
          <a key={c.href} href={c.href} className="card-sm scroll-card" style={{ width: 140, background: c.bg, padding: "15px 13px", display: "block", textDecoration: "none" }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>{c.icon}</div>
            <div className="font-display" style={{ fontWeight: 700, fontSize: 13 }}>{c.title}</div>
            <div style={{ fontSize: 10.5, fontWeight: 500, marginTop: 2 }}>{c.desc}</div>
          </a>
        ))}
        <div onClick={() => setHotlineOpen(true)} className="card-sm scroll-card" style={{ width: 140, background: "var(--yellow)", padding: "15px 13px", cursor: "pointer" }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>☎️</div>
          <div className="font-display" style={{ fontWeight: 700, fontSize: 13 }}>สายด่วน</div>
          <div style={{ fontSize: 10.5, fontWeight: 500, marginTop: 2 }}>ช่วยเหลือด่วน</div>
        </div>
      </div>

      <div className="row-title" style={{ marginTop: 24 }}>🧩 แบบทดสอบแนะนำ</div>
      <div className="scroll-row">
        {TEST_LIST.slice(0, 6).map((t) => (
          <a key={t.key} href={`/tests/${t.key}`} className="card-sm scroll-card" style={{ width: 118, background: "#fff", padding: "13px 11px", display: "block", textDecoration: "none", textAlign: "center" }}>
            <div className="card-sm" style={{ width: 42, height: 42, margin: "0 auto 8px", background: t.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19 }}>{t.icon}</div>
            <div className="font-display" style={{ fontWeight: 700, fontSize: 11, lineHeight: 1.4 }}>{t.title}</div>
          </a>
        ))}
      </div>

      <div className="row-title" style={{ marginTop: 24 }}>📰 ข่าวสารล่าสุด</div>
      {news.length > 0 ? (
        <div className="scroll-row">
          {news.map((n) => (
            <a key={n.id} href="/news" className="card-sm scroll-card" style={{ width: 180, background: "#fff", overflow: "hidden", textDecoration: "none", display: "block" }}>
              {n.image_url ? (
                <img src={n.image_url} alt={n.title} style={{ width: "100%", height: 90, objectFit: "cover", display: "block", borderBottom: "3px solid var(--ink)" }} />
              ) : (
                <div style={{ width: "100%", height: 90, background: "linear-gradient(135deg, var(--purple), var(--blue))", borderBottom: "3px solid var(--ink)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>📰</div>
              )}
              <div style={{ padding: "10px 12px" }}>
                <div className="font-display" style={{ fontWeight: 700, fontSize: 12, lineHeight: 1.4 }}>{n.title}</div>
              </div>
            </a>
          ))}
        </div>
      ) : (
        <a href="/news" className="card-sm" style={{ background: "#fff", padding: "13px 15px", display: "block", textDecoration: "none" }}>
          <div className="font-display" style={{ fontWeight: 700, fontSize: 13 }}>ดูข่าวสารและกิจกรรมทั้งหมด →</div>
        </a>
      )}

      <HotlineModal open={hotlineOpen} onClose={() => setHotlineOpen(false)} />
    </AppShell>
  );
}
