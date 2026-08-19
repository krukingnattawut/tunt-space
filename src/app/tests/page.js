"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "../components/AppShell";

const TESTS = [
  { icon: "🧠", title: "MBTI บุคลิกภาพของฉัน", desc: "16 คำถาม · ยอดนิยม", bg: "var(--purple)", tag: "สนุก" },
  { icon: "💌", title: "Love Language ของคุณ", desc: "10 คำถาม", bg: "var(--pink)", tag: "สนุก" },
  { icon: "🎯", title: "ค้นหาแนวถนัดอาชีพ", desc: "14 คำถาม", bg: "var(--mint)", tag: "แนะแนว" },
  { icon: "🌤️", title: "เช็กสุขภาพใจประจำสัปดาห์", desc: "SDQ ฉบับดิจิทัล · ส่วนตัว", bg: "var(--blue)", tag: "ดูแลใจ" },
  { icon: "🌱", title: "สำรวจความเครียดเชิงลึก", desc: "PHQ-A ฉบับดิจิทัล · ส่วนตัว", bg: "var(--coral)", tag: "ดูแลใจ" },
  { icon: "🔢", title: "Enneagram 9 บุคลิกภาพ", desc: "18 คำถาม", bg: "var(--yellow)", tag: "สนุก" },
];

export default function TestsPage() {
  const router = useRouter();
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetch("/api/me").then((res) => { if (!res.ok) router.push("/"); });
  }, [router]);

  return (
    <AppShell title="🧩 รู้จักตัวเอง">
      <div style={{ fontSize: 12.5, color: "#4a4a4a", marginBottom: 16, fontWeight: 600 }}>
        เลือกแบบทดสอบที่สนใจ ใช้เวลาไม่ถึง 5 นาที
      </div>
      {TESTS.map((t) => (
        <div key={t.title} onClick={() => setSelected(t)} className="card-sm" style={{ display: "flex", alignItems: "center", gap: 12, background: "#fff", padding: "12px 13px", marginBottom: 12, cursor: "pointer" }}>
          <div className="card-sm" style={{ width: 44, height: 44, background: t.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{t.icon}</div>
          <div style={{ flex: 1 }}>
            <div className="font-display" style={{ fontWeight: 700, fontSize: 13.5 }}>{t.title}</div>
            <div style={{ fontSize: 11, color: "#4a4a4a", fontWeight: 500 }}>{t.desc}</div>
          </div>
          <span className="font-display" style={{ fontWeight: 800, fontSize: 10, padding: "4px 9px", borderRadius: 999, border: "2px solid var(--ink)", background: t.bg }}>{t.tag}</span>
        </div>
      ))}

      {selected && (
        <div onClick={() => setSelected(null)} style={{ position: "fixed", inset: 0, background: "rgba(20,20,20,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 20 }}>
          <div onClick={(e) => e.stopPropagation()} className="card" style={{ background: "#fff", padding: 26, maxWidth: 340, textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>{selected.icon}</div>
            <div className="font-display" style={{ fontWeight: 800, fontSize: 16, marginBottom: 6 }}>{selected.title}</div>
            <div style={{ fontSize: 12.5, color: "#4a4a4a", fontWeight: 600, marginBottom: 18 }}>
              แบบทดสอบนี้กำลังพัฒนาอยู่ครับ จะเปิดให้ทำได้เร็วๆ นี้ 🚧
            </div>
            <button onClick={() => setSelected(null)} className="btn-brut" style={{ width: "100%", padding: 12 }}>รับทราบ</button>
          </div>
        </div>
      )}
    </AppShell>
  );
}
