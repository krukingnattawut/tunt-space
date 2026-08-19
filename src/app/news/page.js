"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "../components/AppShell";

export default function NewsPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [news, setNews] = useState([]);

  useEffect(() => {
    fetch("/api/me").then(async (res) => {
      if (!res.ok) { router.push("/"); return; }
      setReady(true);
      const r = await fetch("/api/news");
      const data = await r.json();
      if (data.ok) setNews(data.news);
    });
  }, [router]);

  if (!ready) return null;

  return (
    <AppShell title="📰 ข่าวสารและกิจกรรม">
      {news.length === 0 && (
        <div style={{ textAlign: "center", color: "#8a8a8a", fontSize: 13, marginTop: 30 }}>
          ยังไม่มีข่าวสาร — ครูแนะแนวจะประกาศที่นี่เมื่อมีอัปเดต 📌
        </div>
      )}
      {news.map((n) => (
        <div key={n.id} className="card-sm" style={{ background: "#fff", padding: 15, marginBottom: 14 }}>
          <div className="font-display" style={{ fontWeight: 700, fontSize: 14.5, marginBottom: 4 }}>{n.title}</div>
          <div style={{ fontSize: 10.5, color: "#8a8a8a", fontWeight: 600, marginBottom: 8 }}>
            {new Date(n.created_at).toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" })}
          </div>
          <div style={{ fontSize: 13, lineHeight: 1.6, fontWeight: 500, whiteSpace: "pre-wrap" }}>{n.content}</div>
        </div>
      ))}
    </AppShell>
  );
}
