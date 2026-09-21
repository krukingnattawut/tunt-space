"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "../components/AppShell";
import HotlineModal from "../components/HotlineModal";
import HeartMascot from "../components/HeartMascot";
import { TEST_LIST } from "@/lib/testBank";

const MOODS = [
  { key: "great", icon: "😄", label: "สดใส" },
  { key: "good", icon: "🙂", label: "ปกติ" },
  { key: "neutral", icon: "😐", label: "เฉยๆ" },
  { key: "tired", icon: "😔", label: "เหนื่อยใจ" },
  { key: "bad", icon: "😢", label: "แย่มาก" },
];

const EXPLORE_CARDS = [
  { href: "/feed", icon: "💬", title: "พื้นที่ระบาย", desc: "โพสต์แบบไม่ระบุตัวตน", bg: "var(--coral-bg)" },
  { href: "/tests", icon: "🧩", title: "แบบทดสอบ", desc: "รู้จักตัวเอง", bg: "var(--lavender-bg)" },
  { href: "/chat", icon: "🤖", title: "TUNT Bot", desc: "รับฟัง 24 ชม.", bg: "var(--mint-bg)" },
  { href: "/games", icon: "🎮", title: "มินิเกม", desc: "คลายเครียดสั้นๆ", bg: "#DCEBFF" },
  { href: "/gratitude", icon: "🌻", title: "บันทึกขอบคุณ", desc: "เขียนสิ่งดีๆ วันนี้", bg: "var(--peach-bg)" },
];

function countStreak(dates) {
  const set = new Set(dates.map((d) => new Date(d).toDateString()));
  let count = 0;
  let cursor = new Date();
  while (set.has(cursor.toDateString())) {
    count++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return count;
}

export default function HomePage() {
  const router = useRouter();
  const [student, setStudent] = useState(null);
  const [selectedMood, setSelectedMood] = useState(null);
  const [saved, setSaved] = useState(false);
  const [hotlineOpen, setHotlineOpen] = useState(false);
  const [news, setNews] = useState([]);
  const [checkinStreak, setCheckinStreak] = useState(0);
  const [testsDoneCount, setTestsDoneCount] = useState(0);
  const [gratitudeStreak, setGratitudeStreak] = useState(0);

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
    fetch("/api/checkin").then(async (res) => {
      const d = await res.json();
      if (d.ok) setCheckinStreak(countStreak(d.checkins.map((c) => c.created_at)));
    });
    fetch("/api/tests/results").then(async (res) => {
      const d = await res.json();
      if (d.ok) setTestsDoneCount(new Set(d.results.map((r) => r.test_key)).size);
    });
    fetch("/api/gratitude").then(async (res) => {
      const d = await res.json();
      if (d.ok) setGratitudeStreak(countStreak(d.entries.map((e) => e.created_at)));
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
    fetch("/api/checkin").then(async (res) => {
      const d = await res.json();
      if (d.ok) setCheckinStreak(countStreak(d.checkins.map((c) => c.created_at)));
    });
  }

  if (!student) return null;

  const totalTests = TEST_LIST.length;
  const checkinPct = Math.min(100, (checkinStreak / 7) * 100);
  const testsPct = Math.min(100, (testsDoneCount / totalTests) * 100);
  const gratitudePct = Math.min(100, (gratitudeStreak / 7) * 100);

  return (
    <AppShell title="หน้าแรก" showBack={false}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16, marginBottom: 16 }} className="md:grid-cols-[1.5fr_1fr]">
        <div className="stage-panel" style={{ padding: "22px 22px 20px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
            <div>
              <div className="font-display" style={{ fontWeight: 700, fontSize: 16 }}>วันนี้รู้สึกยังไงบ้าง?</div>
              <div style={{ fontSize: 12, color: "var(--text-dim)", fontWeight: 600, marginTop: 3 }}>
                สวัสดีค่ะ {student.avatar_emoji} {student.nickname || student.full_name}
              </div>
            </div>
            <HeartMascot size={46} />
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
            {MOODS.map((m) => (
              <div
                key={m.key}
                onClick={() => handleMoodSelect(m.key)}
                className="card-sm"
                style={{
                  flex: 1, textAlign: "center", padding: "10px 0", fontSize: 20, cursor: "pointer",
                  background: selectedMood === m.key ? "var(--mint-bg)" : "#fff",
                  borderColor: selectedMood === m.key ? "var(--mint)" : "var(--line)",
                  transform: selectedMood === m.key ? "translateY(-3px)" : "none",
                }}
              >
                {m.icon}
                <small className="font-display" style={{ display: "block", fontSize: 8.5, fontWeight: 700, marginTop: 4, color: "var(--text-dim)" }}>{m.label}</small>
              </div>
            ))}
          </div>
          {saved && <div style={{ textAlign: "center", fontSize: 11.5, color: "var(--mint)", fontWeight: 700, marginTop: 10 }}>บันทึกแล้ว 💛 ต่อเนื่อง {checkinStreak} วัน</div>}
        </div>

        <div
          onClick={() => setHotlineOpen(true)}
          style={{
            borderRadius: 26, padding: "22px", color: "#fff", cursor: "pointer",
            background: "linear-gradient(150deg, var(--coral), #FF9AAE)",
            boxShadow: "0 14px 30px -16px rgba(255,111,145,0.6)",
            display: "flex", flexDirection: "column", justifyContent: "space-between",
          }}
        >
          <div>
            <div className="font-display" style={{ fontWeight: 700, fontSize: 15 }}>สายด่วนสุขภาพจิต</div>
            <div style={{ fontSize: 11.5, color: "#FFE3E9", fontWeight: 600, margin: "6px 0 16px", lineHeight: 1.6 }}>
              ไม่ต้องทนอยู่คนเดียว เราพร้อมอยู่ข้างคุณ ปรึกษาฟรี 24 ชม.
            </div>
          </div>
          <div style={{ background: "#fff", color: "var(--coral)", fontWeight: 700, fontFamily: "'Mitr'", fontSize: 13, padding: "11px 0", borderRadius: 999, textAlign: "center" }}>
            ☎️ โทร 1323
          </div>
        </div>
      </div>

      <div className="row-title">🎯 ภารกิจ & รางวัล</div>
      <div className="scroll-row grid-on-desktop" style={{ marginBottom: 22 }}>
        <div className="scroll-card card-sm" style={{ width: 200, background: "linear-gradient(160deg, var(--lavender-bg), #fff 75%)", padding: 16 }}>
          <div className="font-display" style={{ fontWeight: 700, fontSize: 13, marginBottom: 10 }}>เช็กอินต่อเนื่อง</div>
          <div style={{ height: 9, borderRadius: 99, background: "#fff", border: "1.5px solid var(--line)", overflow: "hidden", marginBottom: 6 }}>
            <div style={{ width: `${checkinPct}%`, height: "100%", background: "var(--purple)", borderRadius: 99 }} />
          </div>
          <div style={{ fontSize: 10.5, color: "var(--text-dim)", fontWeight: 600 }}>{checkinStreak} / 7 วัน</div>
        </div>
        <div className="scroll-card card-sm" style={{ width: 200, background: "linear-gradient(160deg, var(--peach-bg), #fff 75%)", padding: 16 }}>
          <div className="font-display" style={{ fontWeight: 700, fontSize: 13, marginBottom: 10 }}>สำรวจแบบทดสอบ</div>
          <div style={{ height: 9, borderRadius: 99, background: "#fff", border: "1.5px solid var(--line)", overflow: "hidden", marginBottom: 6 }}>
            <div style={{ width: `${testsPct}%`, height: "100%", background: "var(--yellow-deep)", borderRadius: 99 }} />
          </div>
          <div style={{ fontSize: 10.5, color: "var(--text-dim)", fontWeight: 600 }}>{testsDoneCount} / {totalTests} ชุด</div>
        </div>
        <div className="scroll-card card-sm" style={{ width: 200, background: "linear-gradient(160deg, var(--coral-bg), #fff 75%)", padding: 16 }}>
          <div className="font-display" style={{ fontWeight: 700, fontSize: 13, marginBottom: 10 }}>บันทึกขอบคุณต่อเนื่อง</div>
          <div style={{ height: 9, borderRadius: 99, background: "#fff", border: "1.5px solid var(--line)", overflow: "hidden", marginBottom: 6 }}>
            <div style={{ width: `${gratitudePct}%`, height: "100%", background: "var(--coral)", borderRadius: 99 }} />
          </div>
          <div style={{ fontSize: 10.5, color: "var(--text-dim)", fontWeight: 600 }}>{gratitudeStreak} / 7 วัน</div>
        </div>
      </div>

      <div className="row-title">🧭 สำรวจวันนี้</div>
      <div className="scroll-row grid-on-desktop" style={{ marginBottom: 22 }}>
        {EXPLORE_CARDS.map((c) => (
          <a key={c.href} href={c.href} className="card-sm scroll-card" style={{ width: 150, background: c.bg, padding: "16px 14px", display: "block", textDecoration: "none", color: "var(--navy)" }}>
            <div style={{ fontSize: 26, marginBottom: 8 }}>{c.icon}</div>
            <div className="font-display" style={{ fontWeight: 700, fontSize: 13 }}>{c.title}</div>
            <div style={{ fontSize: 10.5, fontWeight: 500, marginTop: 2, color: "var(--text-dim)" }}>{c.desc}</div>
          </a>
        ))}
      </div>

      <div className="row-title">🧩 แบบทดสอบแนะนำ</div>
      <div className="scroll-row" style={{ marginBottom: 22 }}>
        {TEST_LIST.slice(0, 6).map((t) => (
          <a key={t.key} href={`/tests/${t.key}`} className="card-sm scroll-card" style={{ width: 120, background: "#fff", padding: "13px 11px", display: "block", textDecoration: "none", textAlign: "center", color: "var(--navy)" }}>
            <div style={{ width: 42, height: 42, margin: "0 auto 8px", borderRadius: 14, background: t.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19 }}>{t.icon}</div>
            <div className="font-display" style={{ fontWeight: 600, fontSize: 11, lineHeight: 1.4 }}>{t.title}</div>
          </a>
        ))}
      </div>

      <div className="row-title">📰 ข่าวสารล่าสุด</div>
      {news.length > 0 ? (
        <div className="scroll-row">
          {news.map((n) => (
            <a key={n.id} href="/news" className="card-sm scroll-card" style={{ width: 180, background: "#fff", overflow: "hidden", textDecoration: "none", display: "block", color: "var(--navy)" }}>
              {n.image_url ? (
                <img src={n.image_url} alt={n.title} style={{ width: "100%", height: 90, objectFit: "cover", display: "block" }} />
              ) : (
                <div style={{ width: "100%", height: 90, background: "linear-gradient(135deg, var(--lavender-bg), var(--mint-bg))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>📰</div>
              )}
              <div style={{ padding: "10px 12px" }}>
                <div className="font-display" style={{ fontWeight: 600, fontSize: 12, lineHeight: 1.4 }}>{n.title}</div>
              </div>
            </a>
          ))}
        </div>
      ) : (
        <a href="/news" className="card-sm" style={{ background: "#fff", padding: "13px 15px", display: "block", textDecoration: "none", color: "var(--navy)" }}>
          <div className="font-display" style={{ fontWeight: 700, fontSize: 13 }}>ดูข่าวสารและกิจกรรมทั้งหมด →</div>
        </a>
      )}

      <HotlineModal open={hotlineOpen} onClose={() => setHotlineOpen(false)} />
    </AppShell>
  );
}
