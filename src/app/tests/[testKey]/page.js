"use client";
import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import AppShell from "../../components/AppShell";
import { TESTS } from "@/lib/testBank";

export default function TestRunnerPage({ params }) {
  const { testKey } = use(params);
  const router = useRouter();
  const test = TESTS[testKey];

  const [ready, setReady] = useState(false);
  const [answers, setAnswers] = useState({}); // index -> value
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/me").then((res) => { if (!res.ok) { router.push("/"); return; } setReady(true); });
  }, [router]);

  if (!ready || !test) return null;

  const allAnswered = test.questions.every((_, i) => answers[i] !== undefined);

  function selectAnswer(qIndex, value) {
    setAnswers((a) => ({ ...a, [qIndex]: value }));
  }

  function computeResult() {
    if (test.scoreBand) {
      // Clinical scored test (SDQ / PHQ-A)
      let score = 0;
      test.questions.forEach((q, i) => {
        const v = answers[i];
        score += q.reverse ? (2 - v) : v;
      });
      return { type: "score", score, ...test.scoreBand(score) };
    }

    if (test.questions[0]?.dim) {
      // personality4d: pairs of dimensions
      const tally = {};
      test.questions.forEach((q, i) => {
        const letter = answers[i] === "A" ? q.a : q.b;
        tally[letter] = (tally[letter] || 0) + 1;
      });
      const pairs = [["E", "I"], ["S", "N"], ["T", "F"], ["J", "P"]];
      const typeLetters = pairs.map(([a, b]) => ((tally[a] || 0) >= (tally[b] || 0) ? a : b));
      return { type: "combo", letters: typeLetters, descriptions: typeLetters.map((l) => test.resultTypes[l]) };
    }

    // tally by `type` field (loveLanguage, career, ninetypes)
    const tally = {};
    test.questions.forEach((q, i) => {
      const v = Number(answers[i]) || 0;
      tally[q.type] = (tally[q.type] || 0) + v;
    });
    const topType = Object.entries(tally).sort((a, b) => b[1] - a[1])[0][0];
    return { type: "single", topType, description: test.resultTypes[topType] };
  }

  async function handleSubmit() {
    setSubmitting(true);
    const r = computeResult();
    setResult(r);
    if (test.clinical) {
      await fetch("/api/tests/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testKey: test.key, score: r.score, band: r.band, level: r.level }),
      }).catch(() => {});
    } else {
      await fetch("/api/tests/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testKey: test.key, score: null, band: r.type === "single" ? r.topType : (r.letters || []).join("") }),
      }).catch(() => {});
    }
    setSubmitting(false);
  }

  const RISK_BG = { low: "var(--mint)", mid: "var(--yellow)", high: "var(--coral)" };

  return (
    <AppShell title={test.title}>
      {!result && (
        <>
          <div className="card-sm" style={{ background: "#fff", padding: "12px 14px", marginBottom: 16, fontSize: 12, color: "#4a4a4a", fontWeight: 600, lineHeight: 1.6 }}>
            {test.description}
            <div style={{ marginTop: 8, fontSize: 10.5, color: "#8a8a8a", fontStyle: "italic" }}>อ้างอิง: {test.citation}</div>
          </div>

          {test.questions.map((q, i) => (
            <div key={i} className="card-sm" style={{ background: "#fff", padding: "13px 15px", marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, lineHeight: 1.5 }}>
                {i + 1}. {q.text}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {test.options.map((opt) => (
                  <button
                    key={opt.label}
                    onClick={() => selectAnswer(i, opt.value)}
                    className="btn-brut"
                    style={{
                      padding: "8px 14px", fontSize: 12, borderRadius: 999,
                      background: answers[i] === opt.value ? "var(--yellow)" : "#fff",
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <button
            onClick={handleSubmit}
            disabled={!allAnswered || submitting}
            className="btn-brut"
            style={{ width: "100%", padding: 14, fontSize: 14, opacity: allAnswered ? 1 : 0.5, marginTop: 8, marginBottom: 30 }}
          >
            {submitting ? "กำลังประมวลผล..." : allAnswered ? "ดูผลลัพธ์ 🎉" : `ตอบให้ครบ (${Object.keys(answers).length}/${test.questions.length})`}
          </button>
        </>
      )}

      {result && (
        <div>
          {result.type === "score" && (
            <div className="card" style={{ background: "#fff", padding: 26, textAlign: "center", marginBottom: 20 }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>{test.icon}</div>
              <div className="font-display" style={{ fontWeight: 800, fontSize: 20, marginBottom: 6 }}>คะแนนของคุณ: {result.score}</div>
              <span className="font-display" style={{ display: "inline-block", fontWeight: 800, fontSize: 13, padding: "6px 16px", borderRadius: 999, border: "2.5px solid var(--ink)", background: RISK_BG[result.level], marginBottom: 14 }}>
                {result.band}
              </span>
              <div style={{ fontSize: 13, color: "#333", fontWeight: 600, lineHeight: 1.7 }}>{result.note}</div>
              {result.level === "high" && (
                <div className="card-sm" style={{ background: "var(--coral)", padding: "12px 16px", marginTop: 16, fontSize: 12, fontWeight: 700 }}>
                  ☎️ สายด่วนสุขภาพจิต 1323 พร้อมรับฟังตลอด 24 ชม. หรือแตะปุ่มลอยมุมขวาล่างเพื่อคุยกับครูแนะแนวได้เลยค่ะ
                </div>
              )}
              <div style={{ fontSize: 10.5, color: "#8a8a8a", marginTop: 14 }}>ผลนี้เป็นเพียงการคัดกรองเบื้องต้น ไม่ใช่การวินิจฉัยทางการแพทย์</div>
            </div>
          )}

          {result.type === "combo" && (
            <div className="card" style={{ background: "#fff", padding: 26, marginBottom: 20 }}>
              <div style={{ fontSize: 40, textAlign: "center", marginBottom: 10 }}>{test.icon}</div>
              <div className="font-display" style={{ fontWeight: 800, fontSize: 24, textAlign: "center", marginBottom: 16 }}>{result.letters.join("")}</div>
              {result.descriptions.map((d, i) => (
                <div key={i} style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 8, lineHeight: 1.6 }}>• {d}</div>
              ))}
            </div>
          )}

          {result.type === "single" && (
            <div className="card" style={{ background: "#fff", padding: 26, textAlign: "center", marginBottom: 20 }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>{test.icon}</div>
              <div style={{ fontSize: 13.5, fontWeight: 600, lineHeight: 1.7 }}>{result.description}</div>
            </div>
          )}

          <a href="/tests" className="btn-brut" style={{ display: "block", textAlign: "center", padding: 13, textDecoration: "none", color: "var(--ink)" }}>
            ← กลับไปแบบทดสอบอื่น
          </a>
        </div>
      )}
    </AppShell>
  );
}
