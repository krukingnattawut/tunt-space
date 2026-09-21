"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "../../components/AppShell";

const DURATION = 30;
const BUBBLE_EMOJIS = ["🫧", "💙", "💜", "💚", "💛"];

export default function BubbleGame() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [score, setScore] = useState(0);
  const [bubbles, setBubbles] = useState([]);
  const [finished, setFinished] = useState(false);
  const [best, setBest] = useState(null);
  const spawnRef = useRef(null);
  const timerRef = useRef(null);
  const idRef = useRef(0);

  useEffect(() => {
    fetch("/api/me").then((res) => { if (!res.ok) { router.push("/"); return; } setReady(true); });
    fetch("/api/games/session").then(async (res) => {
      const d = await res.json();
      if (d.ok) {
        const bubbleScores = d.sessions.filter((s) => s.game_key === "bubble").map((s) => s.score || 0);
        if (bubbleScores.length) setBest(Math.max(...bubbleScores));
      }
    });
  }, [router]);

  function start() {
    setScore(0);
    setTimeLeft(DURATION);
    setBubbles([]);
    setFinished(false);
    setPlaying(true);

    spawnRef.current = setInterval(() => {
      const id = idRef.current++;
      const x = 8 + Math.random() * 80;
      const size = 44 + Math.random() * 26;
      const emoji = BUBBLE_EMOJIS[Math.floor(Math.random() * BUBBLE_EMOJIS.length)];
      setBubbles((b) => [...b, { id, x, size, emoji }]);
      setTimeout(() => setBubbles((b) => b.filter((bb) => bb.id !== id)), 2200);
    }, 550);

    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { finish(); return 0; }
        return t - 1;
      });
    }, 1000);
  }

  async function finish() {
    clearInterval(spawnRef.current);
    clearInterval(timerRef.current);
    setPlaying(false);
    setFinished(true);
    setBubbles([]);
    setScore((finalScore) => {
      fetch("/api/games/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameKey: "bubble", score: finalScore }),
      });
      setBest((b) => (b === null ? finalScore : Math.max(b, finalScore)));
      return finalScore;
    });
  }

  function pop(id) {
    setBubbles((b) => b.filter((bb) => bb.id !== id));
    setScore((s) => s + 1);
  }

  useEffect(() => () => { clearInterval(spawnRef.current); clearInterval(timerRef.current); }, []);

  if (!ready) return null;

  return (
    <AppShell title="🫧 ป๊อปฟองคลายเครียด">
      {!playing && (
        <div className="card" style={{ padding: 26, textAlign: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>🫧</div>
          <div className="font-display" style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>
            {finished ? `จบเกม! ได้ ${score} คะแนน` : "พร้อมป๊อปฟองแล้วหรือยัง?"}
          </div>
          <div style={{ fontSize: 12.5, color: "var(--text-dim)", fontWeight: 500, marginBottom: 6 }}>แตะฟองสบู่ให้ได้เยอะที่สุดภายใน {DURATION} วินาที</div>
          {best !== null && <div style={{ fontSize: 12, color: "var(--purple)", fontWeight: 700, marginBottom: 16 }}>คะแนนสูงสุดของคุณ: {best}</div>}
          <button onClick={start} className="btn-brut" style={{ padding: "12px 24px", fontSize: 14 }}>{finished ? "เล่นอีกครั้ง" : "เริ่มเกม 🎮"}</button>
          {finished && <a href="/games" style={{ display: "block", marginTop: 14, fontSize: 12, color: "var(--text-dim)", fontWeight: 600 }}>← กลับหน้าเกม</a>}
        </div>
      )}

      {playing && (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
            <div className="font-display" style={{ fontWeight: 700, fontSize: 14 }}>⏱️ {timeLeft} วิ</div>
            <div className="font-display" style={{ fontWeight: 700, fontSize: 14, color: "var(--purple)" }}>คะแนน: {score}</div>
          </div>
          <div className="card" style={{ position: "relative", height: 440, overflow: "hidden", background: "linear-gradient(180deg, var(--mint-bg), var(--lavender-bg))" }}>
            {bubbles.map((b) => (
              <div
                key={b.id}
                onClick={() => pop(b.id)}
                style={{
                  position: "absolute", left: `${b.x}%`, bottom: 0, width: b.size, height: b.size,
                  borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: b.size * 0.5, cursor: "pointer", userSelect: "none",
                  animation: "floatUp 2.2s linear forwards",
                }}
              >
                {b.emoji}
              </div>
            ))}
          </div>
        </>
      )}

      <style>{`
        @keyframes floatUp {
          from { transform: translateY(0); opacity: 1; }
          to { transform: translateY(-420px); opacity: 0.2; }
        }
      `}</style>
    </AppShell>
  );
}
