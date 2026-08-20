"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "../components/AppShell";
import FeedList from "../components/FeedList";

export default function FeedPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    fetch("/api/me").then((res) => { if (!res.ok) { router.push("/"); return; } setReady(true); });
  }, [router]);

  if (!ready) return null;

  return (
    <AppShell title="💬 พื้นที่ระบาย">
      <div style={{ fontSize: 12.5, color: "#4a4a4a", marginBottom: 16, fontWeight: 600 }}>
        ใช้ชื่อเล่นของคุณ · ทุกคนปลอดภัยที่จะพูด
      </div>
      <FeedList />
    </AppShell>
  );
}
