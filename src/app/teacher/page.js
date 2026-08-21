"use client";
import { useEffect, useRef, useState } from "react";
import FeedList from "../components/FeedList";
import { fileToCompressedDataUrl } from "@/lib/imageClient";

const MOOD_LABEL = { great: "😄 สดใส", good: "🙂 ปกติ", neutral: "😐 เฉยๆ", tired: "😔 เหนื่อยใจ", bad: "😢 แย่มาก" };

function riskLevel(s) {
  if (s.flagged_posts > 0) return "high";
  if (s.sdq_band === "ควรปรึกษาผู้เชี่ยวชาญ" || s.phqa_band === "ควรปรึกษาผู้เชี่ยวชาญโดยเร็ว") return "high";
  if (s.sdq_band === "เฝ้าระวัง" || s.phqa_band === "ปานกลาง") return "mid";
  if (s.last_mood === "bad" || s.last_mood === "tired") return "mid";
  if (Number(s.checkins_7d) === 0) return "mid";
  return "low";
}
const RISK_STYLE = { high: { label: "เสี่ยงสูง", bg: "var(--coral)" }, mid: { label: "เฝ้าระวัง", bg: "var(--yellow)" }, low: { label: "ปกติ", bg: "var(--mint)" } };

const TABS = [
  { key: "dashboard", label: "แดชบอร์ด", icon: "📊" },
  { key: "feed", label: "ฟีดนักเรียน", icon: "💬" },
  { key: "messages", label: "ข้อความ", icon: "💌" },
  { key: "news", label: "ข่าวสาร", icon: "📰" },
  { key: "settings", label: "ตั้งค่าแอป", icon: "⚙️" },
];

export default function TeacherPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("dashboard");
  const [data, setData] = useState(null);
  const [messages, setMessages] = useState([]);
  const [replyDrafts, setReplyDrafts] = useState({});
  const [news, setNews] = useState([]);
  const [newsForm, setNewsForm] = useState({ title: "", content: "" });
  const [newsImage, setNewsImage] = useState(null);
  const [newsImgError, setNewsImgError] = useState("");
  const newsFileRef = useRef(null);
  const [settingsForm, setSettingsForm] = useState({ app_name: "", logo_emoji: "", announcement: "" });
  const [resetResult, setResetResult] = useState(null); // { name, newPassword }
  const [resetting, setResetting] = useState(null);

  async function loadAll() {
    const r1 = await fetch("/api/teacher/students");
    if (r1.ok) setData(await r1.json());
    const r2 = await fetch("/api/teacher/messages");
    if (r2.ok) { const d = await r2.json(); setMessages(d.messages || []); }
    const r3 = await fetch("/api/news");
    if (r3.ok) { const d = await r3.json(); setNews(d.news || []); }
    const r4 = await fetch("/api/settings");
    if (r4.ok) { const d = await r4.json(); setSettingsForm((f) => ({ ...f, ...d.settings })); }
  }

  useEffect(() => {
    fetch("/api/teacher/students").then(async (res) => {
      if (res.ok) { setAuthed(true); setData(await res.json()); loadAll(); }
    });
  }, []);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/teacher/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error);
      setAuthed(true);
      await loadAll();
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  }

  async function handleLogout() {
    await fetch("/api/teacher/logout", { method: "POST" });
    setAuthed(false);
    setPassword("");
  }

  async function sendReply(studentId) {
    const content = replyDrafts[studentId];
    if (!content?.trim()) return;
    await fetch("/api/teacher/messages/reply", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ studentId, content }) });
    setReplyDrafts((d) => ({ ...d, [studentId]: "" }));
    const r2 = await fetch("/api/teacher/messages");
    const d = await r2.json();
    setMessages(d.messages || []);
  }

  async function handleNewsImage(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setNewsImgError("");
    try {
      const dataUrl = await fileToCompressedDataUrl(file, 1000, 0.75);
      setNewsImage(dataUrl);
    } catch (err) {
      setNewsImgError(err.message);
    }
  }

  async function addNews(e) {
    e.preventDefault();
    if (!newsForm.title.trim()) return;
    await fetch("/api/teacher/news", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...newsForm, imageDataUrl: newsImage }) });
    setNewsForm({ title: "", content: "" });
    setNewsImage(null);
    if (newsFileRef.current) newsFileRef.current.value = "";
    const r3 = await fetch("/api/news");
    const d = await r3.json();
    setNews(d.news || []);
  }

  async function resetPassword(studentId, fullName) {
    if (!confirm(`ตั้งรหัสผ่านใหม่ให้ ${fullName}? รหัสเดิมจะใช้ไม่ได้อีก`)) return;
    setResetting(studentId);
    try {
      const res = await fetch("/api/teacher/reset-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ studentId }) });
      const json = await res.json();
      if (json.ok) setResetResult({ name: fullName, newPassword: json.newPassword });
    } finally {
      setResetting(null);
    }
  }

  async function deleteNews(id) {
    await fetch("/api/teacher/news", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    setNews((n) => n.filter((x) => x.id !== id));
  }

  async function saveSetting(key) {
    await fetch("/api/teacher/settings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key, value: settingsForm[key] || "" }) });
  }

  if (!authed) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <form onSubmit={handleLogin} className="card" style={{ background: "#fff", padding: 28, width: 340, maxWidth: "100%" }}>
          <div className="font-display" style={{ fontWeight: 800, fontSize: 19, marginBottom: 6 }}>🔒 เข้าสู่ระบบครูแนะแนว</div>
          <div style={{ fontSize: 12.5, color: "#4a4a4a", fontWeight: 600, marginBottom: 18 }}>TUNT Space Admin</div>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="รหัสผ่าน" className="card-sm" style={{ width: "100%", padding: "12px 14px", fontSize: 14.5, marginBottom: 14 }} />
          {error && <div style={{ color: "var(--coral)", fontSize: 12.5, fontWeight: 700, marginBottom: 12 }}>{error}</div>}
          <button type="submit" disabled={loading} className="btn-brut" style={{ width: "100%", padding: 12 }}>{loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}</button>
          <a href="/" style={{ display: "block", textAlign: "center", marginTop: 14, fontSize: 12, fontWeight: 700, color: "#8a8a8a" }}>← กลับหน้านักเรียน</a>
        </form>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh" }}>
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: "3px solid var(--ink)", background: "#fff" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <a href="/" className="btn-brut" style={{ width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", background: "#fff", fontSize: 16, textDecoration: "none", color: "var(--ink)" }}>←</a>
          <span className="font-display" style={{ fontWeight: 800, fontSize: 15 }}>TUNT Space · ครูแนะแนว</span>
        </div>
        <button onClick={handleLogout} className="btn-brut font-display" style={{ padding: "8px 14px", fontSize: 12, background: "var(--coral)" }}>🚪 ออกจากระบบ</button>
      </header>

      <div style={{ padding: "24px 16px 50px", display: "flex", justifyContent: "center" }}>
        <div className="card" style={{ background: "#FFF6E9", width: "100%", maxWidth: 1080, overflow: "hidden" }}>
          <div style={{ background: "var(--purple)", padding: "22px 26px", borderBottom: "3px solid var(--ink)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <div>
              <div className="font-display" style={{ fontWeight: 800, fontSize: 18 }}>แผงควบคุมครูแนะแนว</div>
              <div style={{ fontSize: 12, fontWeight: 600 }}>Dashboard + Admin Panel</div>
            </div>
            {data?.unreadMessages > 0 && (
              <div className="card-sm" style={{ background: "var(--coral)", padding: "8px 14px", fontSize: 12, fontWeight: 800 }}>
                🔔 ข้อความใหม่ {data.unreadMessages} รายการ
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: 6, padding: "14px 16px 0", flexWrap: "wrap", borderBottom: "3px solid var(--ink)" }}>
            {TABS.map((t) => (
              <button key={t.key} onClick={() => setTab(t.key)} className="font-display"
                style={{
                  padding: "9px 16px", borderRadius: "10px 10px 0 0", fontWeight: 700, fontSize: 12.5, cursor: "pointer",
                  border: "2.5px solid var(--ink)", borderBottom: tab === t.key ? "2.5px solid #FFF6E9" : "2.5px solid var(--ink)",
                  background: tab === t.key ? "#FFF6E9" : "#fff", marginBottom: -3,
                }}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          <div style={{ padding: "22px 26px 30px" }}>
            {tab === "dashboard" && (
              <>
                {data?.flaggedPosts?.length > 0 && (
                  <div style={{ marginBottom: 22 }}>
                    <div className="font-display" style={{ fontWeight: 800, fontSize: 14, marginBottom: 10 }}>⚠️ โพสต์ที่ระบบตรวจพบคำเสี่ยง</div>
                    {data.flaggedPosts.map((p) => (
                      <div key={p.id} className="card-sm" style={{ background: "#FFF1EE", padding: 12, marginBottom: 8 }}>
                        <div style={{ fontSize: 12.5, fontWeight: 700 }}>{p.handle} — {p.full_name} ({p.phone})</div>
                        <div style={{ fontSize: 12.5, marginTop: 4 }}>{p.content}</div>
                      </div>
                    ))}
                  </div>
                )}
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 820 }}>
                    <thead>
                      <tr>{["บัญชี / ไอดี", "ชื่อ-เบอร์ติดต่อ", "ชั้น", "อารมณ์ล่าสุด", "SDQ / PHQ-A", "เช็กอิน 7 วัน", "ความเสี่ยง", ""].map((h) => (
                        <th key={h} className="font-display" style={{ textAlign: "left", fontSize: 11, textTransform: "uppercase", padding: "10px 12px", borderBottom: "3px solid var(--ink)" }}>{h}</th>
                      ))}</tr>
                    </thead>
                    <tbody>
                      {data?.students?.map((s) => {
                        const risk = riskLevel(s);
                        return (
                          <tr key={s.id}>
                            <td style={{ padding: "14px 12px", borderBottom: "2px solid var(--ink)", fontSize: 11 }}>
                              <div>{s.handle}</div>
                              <div style={{ color: "#8a8a8a" }}>@{s.username}</div>
                            </td>
                            <td style={{ padding: "14px 12px", borderBottom: "2px solid var(--ink)" }}>
                              <div className="font-display" style={{ fontWeight: 700 }}>{s.full_name}</div>
                              <div style={{ fontSize: 11.5, color: "#4a4a4a" }}>{s.phone}</div>
                            </td>
                            <td style={{ padding: "14px 12px", borderBottom: "2px solid var(--ink)" }}>{s.class_room || "—"}</td>
                            <td style={{ padding: "14px 12px", borderBottom: "2px solid var(--ink)" }}>{s.last_mood ? MOOD_LABEL[s.last_mood] : "—"}</td>
                            <td style={{ padding: "14px 12px", borderBottom: "2px solid var(--ink)", fontSize: 11.5 }}>
                              {s.sdq_band ? <div>SDQ: {s.sdq_band}</div> : null}
                              {s.phqa_band ? <div>PHQ-A: {s.phqa_band}</div> : null}
                              {!s.sdq_band && !s.phqa_band && "—"}
                            </td>
                            <td style={{ padding: "14px 12px", borderBottom: "2px solid var(--ink)" }}>{s.checkins_7d} ครั้ง</td>
                            <td style={{ padding: "14px 12px", borderBottom: "2px solid var(--ink)" }}>
                              <span className="font-display" style={{ fontWeight: 800, fontSize: 10.5, padding: "4px 10px", borderRadius: 999, border: "2px solid var(--ink)", background: RISK_STYLE[risk].bg }}>{RISK_STYLE[risk].label}</span>
                            </td>
                            <td style={{ padding: "14px 12px", borderBottom: "2px solid var(--ink)" }}>
                              <button onClick={() => resetPassword(s.id, s.full_name)} disabled={resetting === s.id} className="btn-brut" style={{ padding: "6px 10px", fontSize: 10.5, background: "#fff" }}>
                                {resetting === s.id ? "..." : "🔑 รีเซ็ตรหัสผ่าน"}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {(!data?.students || data.students.length === 0) && <div style={{ textAlign: "center", color: "#8a8a8a", padding: 30 }}>ยังไม่มีนักเรียนลงทะเบียน</div>}

                {resetResult && (
                  <div onClick={() => setResetResult(null)} style={{ position: "fixed", inset: 0, background: "rgba(20,20,20,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 60, padding: 20 }}>
                    <div onClick={(e) => e.stopPropagation()} className="card" style={{ background: "#fff", padding: 26, maxWidth: 360, textAlign: "center" }}>
                      <div style={{ fontSize: 32, marginBottom: 8 }}>🔑</div>
                      <div className="font-display" style={{ fontWeight: 800, fontSize: 15, marginBottom: 6 }}>ตั้งรหัสผ่านใหม่ให้ {resetResult.name} แล้ว</div>
                      <div style={{ fontSize: 12, color: "#4a4a4a", fontWeight: 600, marginBottom: 14 }}>แจ้งรหัสนี้ให้นักเรียนด้วยตนเอง (ระบบจะไม่แสดงซ้ำอีก)</div>
                      <div className="card-sm" style={{ background: "var(--yellow)", padding: "12px 16px", fontFamily: "monospace", fontSize: 18, fontWeight: 800, marginBottom: 16 }}>
                        {resetResult.newPassword}
                      </div>
                      <button onClick={() => setResetResult(null)} className="btn-brut" style={{ width: "100%", padding: 11 }}>รับทราบ</button>
                    </div>
                  </div>
                )}
              </>
            )}

            {tab === "feed" && (
              <div>
                <div className="font-display" style={{ fontWeight: 800, fontSize: 14, marginBottom: 4 }}>💬 ฟีดนักเรียน (มุมมองเดียวกับที่นักเรียนเห็น)</div>
                <div style={{ fontSize: 12, color: "#4a4a4a", fontWeight: 600, marginBottom: 16 }}>
                  ครูสามารถกดไลก์ คอมเมนต์ให้กำลังใจได้ — คอมเมนต์ของครูจะแสดงป้าย "ครูแนะแนว" ให้นักเรียนเห็นชัดเจน ครูไม่สามารถโพสต์ใหม่ได้จากหน้านี้
                </div>
                <FeedList asTeacher />
              </div>
            )}

            {tab === "messages" && (
              <div>
                <div className="font-display" style={{ fontWeight: 800, fontSize: 14, marginBottom: 14 }}>💌 กล่องข้อความจากนักเรียน</div>
                {Object.values(
                  messages.reduce((acc, m) => {
                    acc[m.student_id] = acc[m.student_id] || { student: m, items: [] };
                    acc[m.student_id].items.push(m);
                    return acc;
                  }, {})
                ).map(({ student, items }) => (
                  <div key={student.student_id} className="card-sm" style={{ background: "#fff", padding: 14, marginBottom: 14 }}>
                    <div className="font-display" style={{ fontWeight: 700, fontSize: 13 }}>{student.full_name} ({student.handle}) — {student.class_room || "—"}</div>
                    <div style={{ fontSize: 11, color: "#4a4a4a", marginBottom: 8 }}>{student.phone}</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 10 }}>
                      {items.slice().reverse().map((m) => (
                        <div key={m.id} style={{ fontSize: 12.5, fontWeight: 600, alignSelf: m.sender === "student" ? "flex-start" : "flex-end" }}>
                          <span style={{ color: m.sender === "system" ? "var(--coral)" : "#8a8a8a", fontSize: 10, fontWeight: 800 }}>
                            {m.sender === "teacher" ? "ครู" : m.sender === "system" ? "⚠️ ระบบ" : "นักเรียน"}:{" "}
                          </span>
                          {m.content}
                        </div>
                      ))}
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <input value={replyDrafts[student.student_id] || ""} onChange={(e) => setReplyDrafts((d) => ({ ...d, [student.student_id]: e.target.value }))} placeholder="พิมพ์ตอบกลับ..." className="card-sm" style={{ flex: 1, padding: "8px 12px", fontSize: 12.5 }} />
                      <button onClick={() => sendReply(student.student_id)} className="btn-brut" style={{ padding: "8px 14px", fontSize: 12 }}>ตอบกลับ</button>
                    </div>
                  </div>
                ))}
                {messages.length === 0 && <div style={{ textAlign: "center", color: "#8a8a8a", padding: 30 }}>ยังไม่มีข้อความ</div>}
              </div>
            )}

            {tab === "news" && (
              <div>
                <div className="font-display" style={{ fontWeight: 800, fontSize: 14, marginBottom: 14 }}>📰 จัดการข่าวสาร/กิจกรรม</div>
                <form onSubmit={addNews} className="card-sm" style={{ background: "#fff", padding: 14, marginBottom: 18 }}>
                  <input value={newsForm.title} onChange={(e) => setNewsForm((f) => ({ ...f, title: e.target.value }))} placeholder="หัวข้อข่าว" className="card-sm" style={{ width: "100%", padding: "9px 12px", fontSize: 13, marginBottom: 10 }} />
                  <textarea value={newsForm.content} onChange={(e) => setNewsForm((f) => ({ ...f, content: e.target.value }))} placeholder="รายละเอียด" rows={3} className="card-sm" style={{ width: "100%", padding: "9px 12px", fontSize: 13, marginBottom: 10, fontFamily: "Sarabun" }} />
                  {newsImage && (
                    <div style={{ position: "relative", display: "inline-block", marginBottom: 10 }}>
                      <img src={newsImage} alt="preview" style={{ maxHeight: 130, borderRadius: 10, border: "2.5px solid var(--ink)", display: "block" }} />
                      <button type="button" onClick={() => { setNewsImage(null); if (newsFileRef.current) newsFileRef.current.value = ""; }} style={{ position: "absolute", top: -8, right: -8, width: 24, height: 24, borderRadius: "50%", background: "var(--coral)", border: "2px solid var(--ink)", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>✕</button>
                    </div>
                  )}
                  {newsImgError && <div style={{ fontSize: 11, color: "var(--coral)", fontWeight: 700, marginBottom: 8 }}>{newsImgError}</div>}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <label className="font-display" style={{ fontSize: 12, fontWeight: 700, cursor: "pointer", color: "#4a4a4a" }}>
                      📷 แนบรูปภาพ
                      <input ref={newsFileRef} type="file" accept="image/*" onChange={handleNewsImage} style={{ display: "none" }} />
                    </label>
                    <button type="submit" className="btn-brut" style={{ padding: "9px 16px", fontSize: 12.5 }}>+ เพิ่มข่าว</button>
                  </div>
                </form>
                {news.map((n) => (
                  <div key={n.id} className="card-sm" style={{ background: "#fff", padding: 13, marginBottom: 10, display: "flex", justifyContent: "space-between", gap: 10 }}>
                    <div style={{ flex: 1 }}>
                      <div className="font-display" style={{ fontWeight: 700, fontSize: 13 }}>{n.title}</div>
                      {n.image_url && <img src={n.image_url} alt={n.title} style={{ maxWidth: 160, borderRadius: 8, border: "2px solid var(--ink)", marginTop: 6 }} />}
                      <div style={{ fontSize: 12, color: "#4a4a4a", marginTop: 5 }}>{n.content}</div>
                    </div>
                    <button onClick={() => deleteNews(n.id)} className="btn-brut" style={{ background: "var(--coral)", padding: "6px 12px", fontSize: 11, height: "fit-content" }}>ลบ</button>
                  </div>
                ))}
              </div>
            )}

            {tab === "settings" && (
              <div>
                <div className="font-display" style={{ fontWeight: 800, fontSize: 14, marginBottom: 14 }}>⚙️ ตั้งค่าแอป</div>
                <div className="card-sm" style={{ background: "#fff", padding: 16, marginBottom: 14 }}>
                  <label className="font-display" style={{ fontSize: 12, fontWeight: 700, display: "block", marginBottom: 6 }}>ชื่อแอป</label>
                  <div style={{ display: "flex", gap: 8, marginBottom: 4 }}>
                    <input value={settingsForm.app_name || ""} onChange={(e) => setSettingsForm((f) => ({ ...f, app_name: e.target.value }))} placeholder="TUNT Space" className="card-sm" style={{ flex: 1, padding: "9px 12px", fontSize: 13 }} />
                    <button onClick={() => saveSetting("app_name")} className="btn-brut" style={{ padding: "9px 14px", fontSize: 12 }}>บันทึก</button>
                  </div>
                </div>
                <div className="card-sm" style={{ background: "#fff", padding: 16, marginBottom: 14 }}>
                  <label className="font-display" style={{ fontSize: 12, fontWeight: 700, display: "block", marginBottom: 6 }}>โลโก้ (emoji หรือ URL รูปภาพ)</label>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input value={settingsForm.logo_emoji || ""} onChange={(e) => setSettingsForm((f) => ({ ...f, logo_emoji: e.target.value }))} placeholder="ใจ หรือ https://..." className="card-sm" style={{ flex: 1, padding: "9px 12px", fontSize: 13 }} />
                    <button onClick={() => saveSetting("logo_emoji")} className="btn-brut" style={{ padding: "9px 14px", fontSize: 12 }}>บันทึก</button>
                  </div>
                  <div style={{ fontSize: 11, color: "#8a8a8a", marginTop: 6 }}>ยังไม่รองรับอัปโหลดไฟล์รูปโดยตรง — ใช้ลิงก์รูปภาพหรือ emoji ไปก่อน</div>
                </div>
                <div className="card-sm" style={{ background: "#fff", padding: 16 }}>
                  <label className="font-display" style={{ fontSize: 12, fontWeight: 700, display: "block", marginBottom: 6 }}>ข้อความประกาศด่วน (ขึ้นหน้าแรกนักเรียน)</label>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input value={settingsForm.announcement || ""} onChange={(e) => setSettingsForm((f) => ({ ...f, announcement: e.target.value }))} placeholder="เช่น วันนี้พบครูแนะแนวได้ที่ห้อง..." className="card-sm" style={{ flex: 1, padding: "9px 12px", fontSize: 13 }} />
                    <button onClick={() => saveSetting("announcement")} className="btn-brut" style={{ padding: "9px 14px", fontSize: 12 }}>บันทึก</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
