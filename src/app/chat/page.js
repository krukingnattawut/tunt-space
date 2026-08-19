"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "../components/AppShell";

const FLOW = {
  "เครียดเรื่องเรียน": { bot: "เข้าใจเลยค่ะ ช่วงนี้ตารางเรียนหนักจริงๆ ลองหายใจเข้าลึกๆ สัก 3 ครั้งด้วยกันไหมคะ 🌿", options: ["ลองแล้ว รู้สึกดีขึ้นนิดหน่อย", "อยากคุยกับครูแนะแนวจริงๆ"] },
  "ทะเลาะกับเพื่อน": { bot: "การมีเรื่องกับเพื่อนสนิทมันเจ็บใจไม่น้อยเลยนะคะ อยากเล่าเพิ่มไหมคะ", options: ["อยากระบายในพื้นที่ไม่ระบุตัวตน", "อยากคุยกับครูแนะแนวจริงๆ"] },
  "แค่อยากมีคนฟัง": { bot: "ได้เลยค่ะ พี่อยู่ตรงนี้ พร้อมรับฟัง 🙂", options: ["ขอบคุณค่ะ รู้สึกดีขึ้น", "อยากคุยกับครูแนะแนวจริงๆ"] },
  "ลองแล้ว รู้สึกดีขึ้นนิดหน่อย": { bot: "ดีใจด้วยนะคะ ค่อยๆ ไปทีละก้าวก็ได้ 💛", options: [] },
  "อยากระบายในพื้นที่ไม่ระบุตัวตน": { bot: "ไปที่หน้า 'พื้นที่ระบาย' ได้เลยนะคะ เพื่อนๆ ที่นั่นพร้อมรับฟังเสมอ", options: [] },
  "ขอบคุณค่ะ รู้สึกดีขึ้น": { bot: "ยินดีเสมอค่ะ กลับมาคุยได้ทุกเมื่อนะ 💛", options: [] },
  "default": { bot: "ขอบคุณที่เล่าให้ฟังนะคะ พี่อยู่ตรงนี้เสมอ 💛", options: [] },
};

export default function ChatPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [messages, setMessages] = useState([
    { from: "bot", text: "สวัสดีค่ะ วันนี้อยากเล่าอะไรให้ฟังไหมคะ 🙂" },
  ]);
  const [options, setOptions] = useState(["เครียดเรื่องเรียน", "ทะเลาะกับเพื่อน", "แค่อยากมีคนฟัง"]);
  const [escalated, setEscalated] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    fetch("/api/me").then((res) => { if (!res.ok) { router.push("/"); return; } setReady(true); });
  }, [router]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function pick(text) {
    setMessages((m) => [...m, { from: "user", text }]);
    setOptions([]);

    if (text === "อยากคุยกับครูแนะแนวจริงๆ") {
      setTimeout(async () => {
        setMessages((m) => [...m, { from: "bot", text: "ระบบได้แจ้งครูแนะแนวให้ทราบแล้ว ครูจะติดต่อกลับโดยเร็วที่สุด คุณไม่ได้อยู่คนเดียวนะคะ 💙" }]);
        setEscalated(true);
        await fetch("/api/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: "[ขอความช่วยเหลือจากแชทบอท] นักเรียนกดปุ่มขอคุยกับครูแนะแนว" }),
        });
      }, 500);
      return;
    }

    setTimeout(() => {
      const flow = FLOW[text] || FLOW.default;
      setMessages((m) => [...m, { from: "bot", text: flow.bot }]);
      setOptions(flow.options);
    }, 500);
  }

  if (!ready) return null;

  return (
    <AppShell title="🤖 TUNT Bot">
      <div style={{ fontSize: 12.5, color: "#4a4a4a", marginBottom: 12, fontWeight: 600 }}>
        ด่านแรกของการรับฟัง · ไม่ใช่ผู้เชี่ยวชาญ
      </div>
      <div ref={scrollRef} style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: "55vh", overflowY: "auto", paddingRight: 4 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: m.from === "user" ? "flex-end" : "flex-start" }}>
            {m.from === "bot" && (
              <span className="font-display" style={{ fontSize: 10, fontWeight: 800, marginBottom: 4, background: "var(--mint)", padding: "3px 9px", borderRadius: 999, border: "2px solid var(--ink)" }}>TUNT BOT</span>
            )}
            <div
              className="card-sm"
              style={{
                maxWidth: "78%", padding: "11px 14px", fontSize: 13, lineHeight: 1.55, fontWeight: 600,
                background: m.from === "user" ? "var(--blue)" : "#fff",
              }}
            >
              {m.text}
            </div>
          </div>
        ))}
      </div>

      {options.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 14 }}>
          {options.map((opt) => (
            <button key={opt} onClick={() => pick(opt)} className="btn-brut" style={{ background: "#fff", padding: "8px 14px", fontSize: 12, borderRadius: 999 }}>
              {opt}
            </button>
          ))}
        </div>
      )}

      {escalated && (
        <div className="card-sm" style={{ background: "var(--pink)", padding: "12px 14px", marginTop: 16, fontSize: 12, fontWeight: 700 }}>
          💌 ข้อความของคุณถูกส่งถึงครูแนะแนวแล้ว ดูคำตอบได้ที่หน้า{" "}
          <a href="/profile" style={{ textDecoration: "underline" }}>โปรไฟล์ → ข้อความจากครู</a>
        </div>
      )}
    </AppShell>
  );
}
