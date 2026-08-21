"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "../components/AppShell";
import { matchRule } from "@/lib/botRules";
import { censor } from "@/lib/profanity";

export default function ChatPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [mode, setMode] = useState("bot"); // 'bot' | 'teacher'

  // bot state
  const [botMessages, setBotMessages] = useState([
    { from: "bot", text: "สวัสดีค่ะ วันนี้อยากเล่าอะไรให้ฟังไหมคะ 🙂 (พิมพ์มาได้เลย เช่น เครียดเรื่องเรียน, ทะเลาะกับเพื่อน)" },
  ]);
  const [botInput, setBotInput] = useState("");
  const [escalatedNotice, setEscalatedNotice] = useState(false);
  const botScrollRef = useRef(null);

  // teacher chat state
  const [teacherMessages, setTeacherMessages] = useState([]);
  const [teacherInput, setTeacherInput] = useState("");
  const [sending, setSending] = useState(false);
  const teacherScrollRef = useRef(null);

  useEffect(() => {
    fetch("/api/me").then(async (res) => {
      if (!res.ok) { router.push("/"); return; }
      setReady(true);
      loadTeacherMessages();
    });
  }, [router]);

  useEffect(() => {
    botScrollRef.current?.scrollTo({ top: botScrollRef.current.scrollHeight, behavior: "smooth" });
  }, [botMessages]);

  useEffect(() => {
    teacherScrollRef.current?.scrollTo({ top: teacherScrollRef.current.scrollHeight, behavior: "smooth" });
  }, [teacherMessages, mode]);

  async function loadTeacherMessages() {
    const r = await fetch("/api/messages");
    const data = await r.json();
    if (data.ok) setTeacherMessages(data.messages);
  }

  async function sendBotMessage(e) {
    e.preventDefault();
    const raw = botInput.trim();
    if (!raw) return;
    const text = censor(raw);
    setBotInput("");
    setBotMessages((m) => [...m, { from: "user", text }]);

    const result = matchRule(text);

    if (result.type === "escalate") {
      setTimeout(async () => {
        setBotMessages((m) => [...m, { from: "bot", text: "เข้าใจค่ะ พี่แจ้งครูแนะแนวให้ทราบแล้ว ครูจะติดต่อกลับโดยเร็วที่สุด ระหว่างนี้พิมพ์คุยกับพี่ต่อได้เลยนะคะ หรือสลับไปแท็บ 'คุยกับครู' ด้านบนเพื่อคุยกับครูโดยตรงก็ได้ค่ะ 💙" }]);
        setEscalatedNotice(true);
        await fetch("/api/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: `[จากแชทบอท] นักเรียนพิมพ์ว่า: "${text}"` }),
        });
        loadTeacherMessages();
      }, 500);
      return;
    }

    if (result.type === "crisis") {
      setTimeout(async () => {
        setBotMessages((m) => [...m, { from: "bot", text: result.response, crisis: true }]);
        await fetch("/api/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: `[⚠️ แจ้งเตือนจากแชทบอท] นักเรียนพิมพ์ว่า: "${text}"` }),
        });
        loadTeacherMessages();
      }, 400);
      return;
    }

    setTimeout(() => {
      setBotMessages((m) => [...m, { from: "bot", text: result.response }]);
    }, 500);
  }

  async function sendTeacherMessage(e) {
    e.preventDefault();
    if (!teacherInput.trim()) return;
    setSending(true);
    await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: teacherInput }),
    });
    setTeacherInput("");
    await loadTeacherMessages();
    setSending(false);
  }

  if (!ready) return null;

  return (
    <AppShell title="💌 ช่วยเหลือ">
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <button
          onClick={() => setMode("bot")}
          className="font-display btn-brut"
          style={{ flex: 1, padding: "10px 0", fontSize: 12.5, background: mode === "bot" ? "var(--mint)" : "#fff" }}
        >
          🤖 คุยกับ TUNT Bot
        </button>
        <button
          onClick={() => setMode("teacher")}
          className="font-display btn-brut"
          style={{ flex: 1, padding: "10px 0", fontSize: 12.5, background: mode === "teacher" ? "var(--blue)" : "#fff" }}
        >
          💌 คุยกับครูแนะแนว
        </button>
      </div>

      {mode === "bot" && (
        <>
          <div style={{ fontSize: 11.5, color: "#4a4a4a", marginBottom: 10, fontWeight: 600 }}>
            บอทนี้จับคำสำคัญที่พิมพ์มาตอบ ไม่ใช่ AI จริง และไม่ใช่ผู้เชี่ยวชาญนะคะ
          </div>
          <div ref={botScrollRef} style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: "48vh", overflowY: "auto", paddingRight: 4, marginBottom: 12 }}>
            {botMessages.map((m, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: m.from === "user" ? "flex-end" : "flex-start" }}>
                {m.from === "bot" && (
                  <span className="font-display" style={{ fontSize: 10, fontWeight: 800, marginBottom: 4, background: m.crisis ? "var(--coral)" : "var(--mint)", padding: "3px 9px", borderRadius: 999, border: "2px solid var(--ink)" }}>TUNT BOT</span>
                )}
                <div className="card-sm" style={{ maxWidth: "82%", padding: "11px 14px", fontSize: 13, lineHeight: 1.55, fontWeight: 600, background: m.from === "user" ? "var(--blue)" : "#fff" }}>
                  {m.text}
                </div>
              </div>
            ))}
          </div>
          <form onSubmit={sendBotMessage} style={{ display: "flex", gap: 8 }}>
            <input
              value={botInput}
              onChange={(e) => setBotInput(e.target.value)}
              placeholder="พิมพ์ข้อความ..."
              className="card-sm"
              style={{ flex: 1, padding: "11px 14px", fontSize: 13 }}
            />
            <button type="submit" className="btn-brut" style={{ padding: "0 18px", fontSize: 13 }}>ส่ง</button>
          </form>
          {escalatedNotice && (
            <div className="card-sm" style={{ background: "var(--pink)", padding: "10px 14px", marginTop: 12, fontSize: 11.5, fontWeight: 700 }}>
              💌 ข้อความถูกส่งถึงครูแนะแนวแล้ว ดูคำตอบได้ในแท็บ "คุยกับครูแนะแนว"
            </div>
          )}
        </>
      )}

      {mode === "teacher" && (
        <>
          <div style={{ fontSize: 11.5, color: "#4a4a4a", marginBottom: 10, fontWeight: 600 }}>
            ข้อความนี้ส่งถึงครูแนะแนวโดยตรง ครูจะเห็นชื่อจริงของคุณเสมอ
          </div>
          <div ref={teacherScrollRef} style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: "48vh", overflowY: "auto", paddingRight: 4, marginBottom: 12 }}>
            {teacherMessages.length === 0 && <div style={{ fontSize: 12, color: "#8a8a8a", fontWeight: 600 }}>ยังไม่มีข้อความ ทักทายครูได้เลยค่ะ</div>}
            {teacherMessages.map((m) => (
              <div key={m.id} style={{ display: "flex", flexDirection: "column", alignItems: m.sender === "teacher" ? "flex-start" : "flex-end" }}>
                {m.sender === "teacher" && (
                  <span className="font-display" style={{ fontSize: 10, fontWeight: 800, marginBottom: 4, background: "var(--yellow)", padding: "3px 9px", borderRadius: 999, border: "2px solid var(--ink)" }}>ครูแนะแนว</span>
                )}
                <div className="card-sm" style={{ maxWidth: "82%", padding: "11px 14px", fontSize: 13, lineHeight: 1.55, fontWeight: 600, background: m.sender === "teacher" ? "var(--mint)" : "var(--blue)" }}>
                  {m.content}
                </div>
              </div>
            ))}
          </div>
          <form onSubmit={sendTeacherMessage} style={{ display: "flex", gap: 8 }}>
            <input
              value={teacherInput}
              onChange={(e) => setTeacherInput(e.target.value)}
              placeholder="พิมพ์ข้อความถึงครู..."
              className="card-sm"
              style={{ flex: 1, padding: "11px 14px", fontSize: 13 }}
            />
            <button type="submit" disabled={sending} className="btn-brut" style={{ padding: "0 18px", fontSize: 13 }}>ส่ง</button>
          </form>
        </>
      )}
    </AppShell>
  );
}
