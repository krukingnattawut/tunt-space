"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "../components/AppShell";
import { TEST_LIST } from "@/lib/testBank";

const TAG_ORDER = ["ดูแลใจ", "แนะแนว", "สนุก"];
const TAG_TITLE = {
  "ดูแลใจ": "🩵 ดูแลใจ",
  "แนะแนว": "🎯 แนะแนวอนาคต",
  "สนุก": "✨ สนุกกับตัวเอง",
};

export default function TestsPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    fetch("/api/me").then((res) => { if (!res.ok) { router.push("/"); return; } setReady(true); });
  }, [router]);

  if (!ready) return null;

  return (
    <AppShell title="🧩 รู้จักตัวเอง">
      <div style={{ fontSize: 12.5, color: "var(--stage-text-dim)", marginBottom: 20, fontWeight: 600 }}>
        เลือกแบบทดสอบที่สนใจ ใช้เวลาไม่ถึง 5 นาที
      </div>

      {TAG_ORDER.map((tag) => {
        const items = TEST_LIST.filter((t) => t.tag === tag);
        if (items.length === 0) return null;
        return (
          <div key={tag} style={{ marginBottom: 26 }}>
            <div className="row-title">{TAG_TITLE[tag]}</div>
            <div className="scroll-row">
              {items.map((t) => (
                <a
                  key={t.key}
                  href={`/tests/${t.key}`}
                  className="card scroll-card"
                  style={{ width: 168, background: "#fff", padding: 0, overflow: "hidden", display: "block", textDecoration: "none" }}
                >
                  <div style={{ height: 84, background: t.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34, borderBottom: "3px solid var(--ink)" }}>
                    {t.icon}
                  </div>
                  <div style={{ padding: "12px 13px" }}>
                    <div className="font-display" style={{ fontWeight: 700, fontSize: 12.5, lineHeight: 1.4, marginBottom: 4 }}>{t.title}</div>
                    <div style={{ fontSize: 10.5, color: "#6a6a6a", fontWeight: 500 }}>{t.questions.length} คำถาม</div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        );
      })}
    </AppShell>
  );
}
