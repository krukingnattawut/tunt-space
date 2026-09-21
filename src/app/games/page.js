"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "../components/AppShell";

const GAMES = [
  { key: "breathing", href: "/games/breathing", icon: "🫁", title: "เกมหายใจคลายเครียด", desc: "ฝึกหายใจตามจังหวะ ช่วยผ่อนคลายและลดความวิตกกังวล", bg: "var(--mint-bg)" },
  { key: "bubble", href: "/games/bubble", icon: "🫧", title: "ป๊อปฟองคลายเครียด", desc: "แตะป๊อปฟองสบู่ให้ได้คะแนนเยอะที่สุดใน 30 วินาที", bg: "var(--lavender-bg)" },
];

export default function GamesPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    fetch("/api/me").then((res) => { if (!res.ok) { router.push("/"); return; } setReady(true); });
  }, [router]);

  if (!ready) return null;

  return (
    <AppShell title="🎮 มินิเกมคลายเครียด">
      <div style={{ fontSize: 12.5, color: "var(--text-dim)", marginBottom: 20, fontWeight: 600 }}>
        เล่นสั้นๆ ผ่อนคลายใจก่อนกลับไปทำอย่างอื่นต่อ
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 14 }} className="md:grid-cols-2">
        {GAMES.map((g) => (
          <a key={g.key} href={g.href} className="card" style={{ padding: 20, display: "block", textDecoration: "none", color: "var(--navy)", background: g.bg }}>
            <div style={{ fontSize: 34, marginBottom: 10 }}>{g.icon}</div>
            <div className="font-display" style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{g.title}</div>
            <div style={{ fontSize: 12, color: "var(--text-dim)", fontWeight: 500, lineHeight: 1.6 }}>{g.desc}</div>
          </a>
        ))}
      </div>
    </AppShell>
  );
}
