"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "../components/AppShell";
import { TEST_LIST } from "@/lib/testBank";

export default function TestsPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    fetch("/api/me").then((res) => { if (!res.ok) { router.push("/"); return; } setReady(true); });
  }, [router]);

  if (!ready) return null;

  return (
    <AppShell title="🧩 รู้จักตัวเอง">
      <div style={{ fontSize: 12.5, color: "#4a4a4a", marginBottom: 16, fontWeight: 600 }}>
        เลือกแบบทดสอบที่สนใจ ใช้เวลาไม่ถึง 5 นาที
      </div>
      {TEST_LIST.map((t) => (
        <a
          key={t.key}
          href={`/tests/${t.key}`}
          className="card-sm"
          style={{ display: "flex", alignItems: "center", gap: 12, background: "#fff", padding: "12px 13px", marginBottom: 12, textDecoration: "none", color: "var(--ink)" }}
        >
          <div className="card-sm" style={{ width: 44, height: 44, background: t.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{t.icon}</div>
          <div style={{ flex: 1 }}>
            <div className="font-display" style={{ fontWeight: 700, fontSize: 13.5 }}>{t.title}</div>
            <div style={{ fontSize: 11, color: "#4a4a4a", fontWeight: 500 }}>{t.questions.length} คำถาม</div>
          </div>
          <span className="font-display" style={{ fontWeight: 800, fontSize: 10, padding: "4px 9px", borderRadius: 999, border: "2px solid var(--ink)", background: t.color, flexShrink: 0, whiteSpace: "nowrap" }}>{t.tag}</span>
        </a>
      ))}
    </AppShell>
  );
}
