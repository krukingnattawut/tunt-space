"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "../../components/AppShell";

const PHASES = [
  { key: "in", label: "หายใจเข้า...", seconds: 4, scale: 1.5 },
  { key: "hold1", label: "กลั้นไว้...", seconds: 4, scale: 1.5 },
  { key: "out", label: "หายใจออก...", seconds: 4, scale: 1 },
  { key: "hold2", label: "กลั้นไว้...", seconds: 4, scale: 1 },
];

export default function BreathingGame() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [running, setRunning] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [cycles, setCycles] = useState(0);
  const [targetCycles, setTargetCycles] = useState(5);
  const [done, setDone] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    fetch("/api/me").then((res) => { if (!res.ok) { router.push("/"); return; } setReady(true); });
  }, [router]);

  useEffect(() => {
    if (!running) return;
    const phase = PHASES[phaseIndex];
    timerRef.current = setTimeout(() => {
      const next = (phaseIndex + 1) % PHASES.length;
      if (next === 0) {
        setCycles((c) => {
          const nc = c + 1;
          if (nc >= targetCycles) finishSession(nc);
          return nc;
        });
      }
      setPhaseIndex(next);
    }, phase.seconds * 1000);
    return () => clearTimeout(timerRef.current);
  }, [running, phaseIndex]);

  async function finishSession(finalCycles) {
    setRunning(false);
    setDone(true);
    await fetch("/api/games/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gameKey: "breathing", score: finalCycles }),
    });
  }

  function start(target) {
    setTargetCycles(target);
    setCycles(0);
    setPhaseIndex(0);
    setDone(false);
    setRunning(true);
  }

  function stop() {
    setRunning(false);
    clearTimeout(timerRef.current);
  }

  if (!ready) return null;
  const phase = PHASES[phaseIndex];

  return (
    <AppShell title="🫁 เกมหายใจคลายเครียด">
      {!running && !done && (
        <div className="card" style={{ padding: 26, textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>🫁</div>
          <div className="font-display" style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>Box Breathing</div>
          <div style={{ fontSize: 12.5, color: "var(--text-dim)", fontWeight: 500, lineHeight: 1.7, marginBottom: 20 }}>
            หายใจเข้า 4 วิ - กลั้น 4 วิ - หายใจออก 4 วิ - กลั้น 4 วิ วนซ้ำ<br />
            เทคนิคนี้ช่วยลดความเครียดและความวิตกกังวลได้จริงตามหลักสรีรวิทยา
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            {[3, 5, 8].map((n) => (
              <button key={n} onClick={() => start(n)} className="btn-brut" style={{ padding: "12px 20px", fontSize: 13 }}>{n} รอบ</button>
            ))}
          </div>
        </div>
      )}

      {running && (
        <div className="card" style={{ padding: 30, textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: 220 }}>
            <div
              style={{
                width: 130, height: 130, borderRadius: "50%",
                background: "linear-gradient(150deg, var(--mint), var(--purple-light))",
                transform: `scale(${phase.scale})`,
                transition: `transform ${phase.seconds}s ease-in-out`,
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 20px 40px -16px rgba(62,214,184,0.5)",
              }}
            >
              <span style={{ fontSize: 28 }}>💛</span>
            </div>
          </div>
          <div className="font-display" style={{ fontWeight: 700, fontSize: 18, margin: "16px 0 6px" }}>{phase.label}</div>
          <div style={{ fontSize: 12.5, color: "var(--text-dim)", fontWeight: 600, marginBottom: 20 }}>รอบที่ {cycles + 1} / {targetCycles}</div>
          <button onClick={stop} className="btn-brut" style={{ padding: "10px 20px", fontSize: 12.5, background: "var(--coral)" }}>หยุดก่อน</button>
        </div>
      )}

      {done && (
        <div className="card" style={{ padding: 30, textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>🎉</div>
          <div className="font-display" style={{ fontWeight: 700, fontSize: 17, marginBottom: 8 }}>เยี่ยมมาก! ทำครบ {targetCycles} รอบแล้ว</div>
          <div style={{ fontSize: 12.5, color: "var(--text-dim)", fontWeight: 500, marginBottom: 20 }}>รู้สึกผ่อนคลายขึ้นไหมคะ ลองสังเกตความรู้สึกตัวเองดูนะคะ</div>
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <button onClick={() => start(targetCycles)} className="btn-brut" style={{ padding: "11px 18px", fontSize: 12.5 }}>เล่นอีกครั้ง</button>
            <a href="/games" className="btn-brut" style={{ padding: "11px 18px", fontSize: 12.5, background: "#fff", color: "var(--navy)", border: "2px solid var(--line)", textDecoration: "none" }}>กลับหน้าเกม</a>
          </div>
        </div>
      )}
    </AppShell>
  );
}
