"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "../components/AppShell";

export default function FeedPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState("");
  const [posting, setPosting] = useState(false);
  const [likedIds, setLikedIds] = useState([]);

  useEffect(() => {
    fetch("/api/me").then(async (res) => {
      if (!res.ok) { router.push("/"); return; }
      setReady(true);
      loadPosts();
    });
  }, [router]);

  async function loadPosts() {
    const res = await fetch("/api/posts");
    const data = await res.json();
    if (data.ok) setPosts(data.posts);
  }

  async function handlePost(e) {
    e.preventDefault();
    if (!content.trim()) return;
    setPosting(true);
    try {
      await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      setContent("");
      await loadPosts();
    } finally {
      setPosting(false);
    }
  }

  async function handleLike(id) {
    if (likedIds.includes(id)) return;
    setLikedIds([...likedIds, id]);
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, likes: p.likes + 1 } : p)));
    await fetch("/api/posts/like", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId: id }),
    });
  }

  if (!ready) return null;

  return (
    <AppShell title="💬 พื้นที่ระบาย">
      <div style={{ fontSize: 12.5, color: "#4a4a4a", marginBottom: 16, fontWeight: 600 }}>
        ไม่ระบุตัวตน · ทุกคนปลอดภัยที่จะพูด
      </div>

      <form onSubmit={handlePost} className="card-sm" style={{ background: "#fff", padding: "12px 14px", marginBottom: 16 }}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="วันนี้อยากระบายอะไรไหม..."
          rows={2}
          style={{ width: "100%", border: "none", outline: "none", fontFamily: "Sarabun", fontSize: 13, resize: "none", background: "transparent" }}
        />
        <button type="submit" disabled={posting} className="btn-brut" style={{ padding: "8px 16px", fontSize: 12.5, float: "right" }}>
          {posting ? "กำลังโพสต์..." : "โพสต์"}
        </button>
        <div style={{ clear: "both" }} />
      </form>

      {posts.length === 0 && (
        <div style={{ textAlign: "center", color: "#8a8a8a", fontSize: 13, marginTop: 30 }}>ยังไม่มีโพสต์ — เป็นคนแรกที่ระบายสิ 🌱</div>
      )}

      {posts.map((p) => (
        <div key={p.id} className="card-sm" style={{ background: "#fff", padding: 14, marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", border: "2px solid var(--ink)", background: "var(--purple)" }} />
            <div>
              <div className="font-display" style={{ fontWeight: 700, fontSize: 12.5 }}>{p.handle}</div>
              <div style={{ fontSize: 10, color: "#8a8a8a", fontWeight: 600 }}>{new Date(p.created_at).toLocaleString("th-TH")}</div>
            </div>
          </div>
          <div style={{ fontSize: 13.5, lineHeight: 1.6, marginBottom: 10, fontWeight: 500 }}>{p.content}</div>
          <button
            onClick={() => handleLike(p.id)}
            className="font-display"
            style={{ background: "none", border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer", color: likedIds.includes(p.id) ? "var(--coral)" : "#3a3a3a" }}
          >
            {likedIds.includes(p.id) ? "❤️" : "🤍"} {p.likes}
          </button>
        </div>
      ))}
    </AppShell>
  );
}
