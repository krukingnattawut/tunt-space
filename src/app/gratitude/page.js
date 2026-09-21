"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "../components/AppShell";

export default function GratitudePage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [entries, setEntries] = useState([]);
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [postedToday, setPostedToday] = useState(false);

  useEffect(() => {
    fetch("/api/me").then(async (res) => {
      if (!res.ok) { router.push("/"); return; }
      setReady(true);
      load();
    });
  }, [router]);

  async function load() {
    const r = await fetch("/api/gratitude");
    const data = await r.json();
    if (data.ok) {
      setEntries(data.entries);
      const today = new Date().toDateString();
      setPostedToday(data.entries.some((e) => new Date(e.created_at).toDateString() === today));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!content.trim()) return;
    setSaving(true);
    await fetch("/api/gratitude", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    setContent("");
    await load();
    setSaving(false);
  }

  if (!ready) return null;

  const streak = (() => {
    let count = 0;
    let cursor = new Date();
    const dates = new Set(entries.map((e) => new Date(e.created_at).toDateString()));
    while (dates.has(cursor.toDateString())) {
      count++;
      cursor.setDate(cursor.getDate() - 1);
    }
    return count;
  })();

  return (
    <AppShell title="🌻 บันทึกขอบคุณประจำวัน">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ fontSize: 12.5, color: "var(--text-dim)", fontWeight: 600 }}>
          เขียนสิ่งเล็กๆ ที่ทำให้รู้สึกขอบคุณวันนี้ ช่วยฝึกมองบวกได้จริงตามหลักจิตวิทยาเชิงบวก
        </div>
        {streak > 0 && (
          <div className="card-sm font-display" style={{ background: "var(--yellow)", padding: "6px 12px", fontSize: 12, fontWeight: 800, whiteSpace: "nowrap", marginLeft: 10 }}>
            🔥 {streak} วัน
          </div>
        )}
      </div>

      {!postedToday ? (
        <form
          onSubmit={handleSubmit}
          style={{
            background: "#fff", border: "3px solid var(--ink)", borderRadius: 16,
            padding: "14px 16px", marginBottom: 20,
            boxShadow: "inset 3px 3px 8px rgba(0,0,0,0.06), inset -3px -3px 8px rgba(255,255,255,0.7), 4px 4px 0 var(--ink)",
          }}
        >
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="วันนี้ฉันรู้สึกขอบคุณ... (เช่น เพื่อนช่วยติวให้, แม่ทำกับข้าวอร่อย, แดดออกสวย)"
            rows={3}
            style={{ width: "100%", border: "none", outline: "none", fontFamily: "Sarabun", fontSize: 13.5, resize: "none", background: "transparent" }}
          />
          <button type="submit" disabled={saving} className="btn-brut" style={{ padding: "9px 18px", fontSize: 13, float: "right" }}>
            {saving ? "กำลังบันทึก..." : "บันทึก 🌻"}
          </button>
          <div style={{ clear: "both" }} />
        </form>
      ) : (
        <div className="card-sm" style={{ background: "var(--mint)", padding: "14px 16px", marginBottom: 20, fontSize: 13, fontWeight: 700, textAlign: "center" }}>
          🌟 วันนี้บันทึกแล้ว เจอกันพรุ่งนี้นะคะ
        </div>
      )}

      <div className="font-display" style={{ fontWeight: 800, fontSize: 14, marginBottom: 10 }}>บันทึกย้อนหลัง</div>
      {entries.length === 0 && <div style={{ textAlign: "center", color: "var(--text-dim)", fontSize: 13 }}>ยังไม่มีบันทึก เริ่มเขียนวันนี้เลยไหมคะ</div>}
      {entries.map((e) => (
        <div key={e.id} className="card-sm" style={{ background: "#fff", padding: "12px 14px", marginBottom: 10 }}>
          <div style={{ fontSize: 10, color: "#8a8a8a", fontWeight: 700, marginBottom: 4 }}>
            {new Date(e.created_at).toLocaleDateString("th-TH", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </div>
          <div style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.6 }}>{e.content}</div>
        </div>
      ))}
    </AppShell>
  );
}
