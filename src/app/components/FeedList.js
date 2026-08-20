"use client";
import { useEffect, useState } from "react";

export default function FeedList({ asTeacher = false }) {
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState("");
  const [posting, setPosting] = useState(false);
  const [likedIds, setLikedIds] = useState([]);
  const [openComments, setOpenComments] = useState({}); // postId -> bool
  const [comments, setComments] = useState({}); // postId -> array
  const [commentDrafts, setCommentDrafts] = useState({});
  const [toast, setToast] = useState("");

  useEffect(() => { loadPosts(); }, []);

  async function loadPosts() {
    const res = await fetch("/api/posts");
    const data = await res.json();
    if (data.ok) setPosts(data.posts);
  }

  async function handlePost(e) {
    e.preventDefault();
    if (!content.trim() || asTeacher) return;
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

  async function handleShare(post) {
    const text = `"${post.content}" — ${post.display_name} (TUNT Space)`;
    try {
      if (navigator.share) {
        await navigator.share({ text });
      } else {
        await navigator.clipboard.writeText(text);
        setToast("คัดลอกข้อความแล้ว 📋");
        setTimeout(() => setToast(""), 2000);
      }
    } catch (e) {
      // user cancelled share sheet — ignore
    }
  }

  async function toggleComments(postId) {
    const willOpen = !openComments[postId];
    setOpenComments((s) => ({ ...s, [postId]: willOpen }));
    if (willOpen && !comments[postId]) {
      const res = await fetch(`/api/posts/${postId}/comments`);
      const data = await res.json();
      if (data.ok) setComments((c) => ({ ...c, [postId]: data.comments }));
    }
  }

  async function submitComment(postId) {
    const text = commentDrafts[postId];
    if (!text?.trim()) return;
    const endpoint = asTeacher ? "/api/teacher/comments" : `/api/posts/${postId}/comments`;
    const body = asTeacher ? { postId, content: text } : { content: text };
    await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    setCommentDrafts((d) => ({ ...d, [postId]: "" }));
    const res = await fetch(`/api/posts/${postId}/comments`);
    const data = await res.json();
    if (data.ok) setComments((c) => ({ ...c, [postId]: data.comments }));
    await loadPosts();
  }

  return (
    <div style={{ position: "relative" }}>
      {!asTeacher && (
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
      )}

      {posts.length === 0 && (
        <div style={{ textAlign: "center", color: "#8a8a8a", fontSize: 13, marginTop: 30 }}>ยังไม่มีโพสต์</div>
      )}

      {posts.map((p) => (
        <div key={p.id} className="card-sm" style={{ background: "#fff", padding: 14, marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 8 }}>
            <div className="card-sm" style={{ width: 32, height: 32, borderRadius: "50%", background: p.avatar_color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 }}>
              {p.avatar_emoji}
            </div>
            <div>
              <div className="font-display" style={{ fontWeight: 700, fontSize: 12.5 }}>{p.display_name}</div>
              <div style={{ fontSize: 10, color: "#8a8a8a", fontWeight: 600 }}>{new Date(p.created_at).toLocaleString("th-TH")}</div>
            </div>
          </div>
          <div style={{ fontSize: 13.5, lineHeight: 1.6, marginBottom: 10, fontWeight: 500 }}>{p.content}</div>

          <div style={{ display: "flex", gap: 16 }}>
            <button
              onClick={() => handleLike(p.id)}
              className="font-display"
              style={{ background: "none", border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer", color: likedIds.includes(p.id) ? "var(--coral)" : "#3a3a3a" }}
            >
              {likedIds.includes(p.id) ? "❤️" : "🤍"} {p.likes}
            </button>
            <button onClick={() => toggleComments(p.id)} className="font-display" style={{ background: "none", border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer", color: "#3a3a3a" }}>
              💬 {p.comment_count}
            </button>
            <button onClick={() => handleShare(p)} className="font-display" style={{ background: "none", border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer", color: "#3a3a3a" }}>
              ↗️ แชร์
            </button>
          </div>

          {openComments[p.id] && (
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: "2px dashed var(--ink)" }}>
              {(comments[p.id] || []).map((c) => (
                <div key={c.id} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "flex-start" }}>
                  <div style={{ fontSize: 14, flexShrink: 0 }}>{c.sender === "teacher" ? "🧑‍🏫" : c.avatar_emoji}</div>
                  <div>
                    <span className="font-display" style={{ fontWeight: 700, fontSize: 11.5 }}>
                      {c.sender === "teacher" ? "ครูแนะแนว" : c.display_name}
                    </span>{" "}
                    <span style={{ fontSize: 12, fontWeight: 500 }}>{c.content}</span>
                  </div>
                </div>
              ))}
              {(comments[p.id] || []).length === 0 && <div style={{ fontSize: 11.5, color: "#8a8a8a", marginBottom: 8 }}>ยังไม่มีคอมเมนต์</div>}
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <input
                  value={commentDrafts[p.id] || ""}
                  onChange={(e) => setCommentDrafts((d) => ({ ...d, [p.id]: e.target.value }))}
                  placeholder={asTeacher ? "แสดงความเห็นในฐานะครู..." : "คอมเมนต์..."}
                  className="card-sm"
                  style={{ flex: 1, padding: "7px 11px", fontSize: 12 }}
                />
                <button onClick={() => submitComment(p.id)} className="btn-brut" style={{ padding: "7px 13px", fontSize: 11.5 }}>ส่ง</button>
              </div>
            </div>
          )}
        </div>
      ))}

      {toast && (
        <div className="card-sm" style={{ position: "fixed", bottom: 90, left: "50%", transform: "translateX(-50%)", background: "var(--ink)", color: "#fff", padding: "10px 18px", fontSize: 12.5, fontWeight: 700, zIndex: 60 }}>
          {toast}
        </div>
      )}
    </div>
  );
}
