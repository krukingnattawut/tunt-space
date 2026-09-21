"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import FloatingHelp from "./FloatingHelp";
import Logo from "./Logo";

const NAV_ITEMS = [
  { href: "/home", label: "หน้าแรก", icon: "🏠" },
  { href: "/feed", label: "ระบาย", icon: "💬" },
  { href: "/tests", label: "แบบทดสอบ", icon: "🧩" },
  { href: "/chat", label: "ช่วยเหลือ", icon: "💌" },
  { href: "/news", label: "ข่าวสาร", icon: "📰" },
  { href: "/profile", label: "โปรไฟล์", icon: "👤" },
];

export default function AppShell({ title, showBack = true, children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [student, setStudent] = useState(null);

  useEffect(() => {
    fetch("/api/me").then(async (res) => {
      if (res.ok) setStudent((await res.json()).student);
    });
  }, []);

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/");
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex" }}>
      {/* Desktop sidebar — bright purple rail, mascot-app style */}
      <aside
        className="hidden md:flex"
        style={{
          width: 250, flexShrink: 0, background: "linear-gradient(180deg, var(--purple), var(--purple-deep))",
          flexDirection: "column", padding: "26px 18px", position: "sticky", top: 0, height: "100vh", color: "#fff",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22, padding: "0 6px" }}>
          <Logo size={38} radius={12} />
          <span className="font-display" style={{ fontWeight: 700, fontSize: 16 }}>TUNT Space</span>
        </div>

        {student && (
          <div style={{ background: "rgba(255,255,255,0.14)", borderRadius: 18, padding: 14, marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: student.avatar_color || "var(--mint)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, border: "2px solid #fff" }}>
              {student.avatar_emoji || "🙂"}
            </div>
            <div style={{ minWidth: 0 }}>
              <div className="font-display" style={{ fontWeight: 600, fontSize: 12.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {student.nickname || student.handle}
              </div>
              <div style={{ fontSize: 10, color: "#E4DBFF" }}>{student.class_room || student.handle}</div>
            </div>
          </div>
        )}

        {NAV_ITEMS.map((it) => (
          <Link
            key={it.href}
            href={it.href}
            className="font-display"
            style={{
              display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", borderRadius: 14,
              fontWeight: 600, fontSize: 13.5, marginBottom: 6, textDecoration: "none",
              color: pathname === it.href ? "var(--purple-deep)" : "#E4DBFF",
              background: pathname === it.href ? "#fff" : "transparent",
            }}
          >
            <span style={{ fontSize: 17 }}>{it.icon}</span> {it.label}
          </Link>
        ))}

        <div style={{ flex: 1 }} />
        <button
          onClick={handleLogout}
          className="font-display"
          style={{
            background: "rgba(255,111,145,0.22)", border: "1.5px solid rgba(255,111,145,0.5)", borderRadius: 14,
            padding: "11px 14px", fontSize: 12.5, display: "flex", alignItems: "center", gap: 8,
            justifyContent: "center", color: "#FFD7E0", cursor: "pointer", fontWeight: 600,
          }}
        >
          🚪 ออกจากระบบ
        </button>
      </aside>

      {/* Main column */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <header
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "16px 18px",
            borderBottom: "2px solid var(--line)", background: "rgba(250,247,255,0.9)", backdropFilter: "blur(10px)",
            position: "sticky", top: 0, zIndex: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {showBack && (
              <button
                onClick={() => router.back()}
                className="stage-panel-sm"
                style={{ width: 36, height: 36, padding: 0, fontSize: 16, cursor: "pointer" }}
                aria-label="ย้อนกลับ"
              >
                ←
              </button>
            )}
            <div className="font-display" style={{ fontWeight: 700, fontSize: 16 }}>{title}</div>
          </div>

          <button
            onClick={handleLogout}
            className="md:hidden stage-panel-sm"
            style={{ width: 36, height: 36, padding: 0, fontSize: 15, color: "var(--coral)", cursor: "pointer" }}
            aria-label="ออกจากระบบ"
          >
            🚪
          </button>
        </header>

        <main style={{ flex: 1, maxWidth: 760, width: "100%", margin: "0 auto", padding: "18px 18px 100px" }}>
          {children}
        </main>

        <div className="md:hidden" style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 20 }}>
          <div className="bottom-nav">
            {NAV_ITEMS.map((it) => (
              <Link key={it.href} href={it.href} className={`nav-btn ${pathname === it.href ? "active" : ""}`}>
                <span style={{ fontSize: 18 }}>{it.icon}</span>
                {it.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {pathname !== "/chat" && <FloatingHelp />}
    </div>
  );
}
