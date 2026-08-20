"use client";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import FloatingHelp from "./FloatingHelp";

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

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/");
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex" }}>
      {/* Desktop sidebar */}
      <aside
        className="hidden md:flex"
        style={{
          width: 220, flexShrink: 0, background: "#fff", borderRight: "3px solid var(--ink)",
          flexDirection: "column", padding: "22px 14px", position: "sticky", top: 0, height: "100vh",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 26, padding: "0 6px" }}>
          <div className="card-sm" style={{ width: 38, height: 38, background: "var(--coral)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span className="font-display" style={{ fontWeight: 800 }}>ใจ</span>
          </div>
          <span className="font-display" style={{ fontWeight: 800, fontSize: 15 }}>TUNT Space</span>
        </div>
        {NAV_ITEMS.map((it) => (
          <Link
            key={it.href}
            href={it.href}
            className="font-display"
            style={{
              display: "flex", alignItems: "center", gap: 10, padding: "11px 12px", borderRadius: 12,
              fontWeight: 700, fontSize: 13.5, marginBottom: 6, textDecoration: "none",
              color: pathname === it.href ? "var(--ink)" : "#8a8a8a",
              background: pathname === it.href ? "var(--yellow)" : "transparent",
              border: pathname === it.href ? "2.5px solid var(--ink)" : "2.5px solid transparent",
            }}
          >
            <span style={{ fontSize: 18 }}>{it.icon}</span> {it.label}
          </Link>
        ))}

        <div style={{ flex: 1 }} />
        <button
          onClick={handleLogout}
          className="btn-brut font-display"
          style={{ background: "#fff", padding: "10px 12px", fontSize: 12.5, display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}
        >
          🚪 ออกจากระบบ
        </button>
      </aside>

      {/* Main column */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, background: "var(--cream, #FFF6E9)" }}>
        <header
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "16px 18px",
            borderBottom: "3px solid var(--ink)", background: "#fff", position: "sticky", top: 0, zIndex: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {showBack && (
              <button
                onClick={() => router.back()}
                className="btn-brut"
                style={{ width: 36, height: 36, padding: 0, background: "#fff", fontSize: 16 }}
                aria-label="ย้อนกลับ"
              >
                ←
              </button>
            )}
            <div className="font-display" style={{ fontWeight: 800, fontSize: 16 }}>{title}</div>
          </div>

          {/* Mobile-only quick logout (desktop uses sidebar button) */}
          <button
            onClick={handleLogout}
            className="btn-brut md:hidden"
            style={{ width: 36, height: 36, padding: 0, background: "#fff", fontSize: 15 }}
            aria-label="ออกจากระบบ"
          >
            🚪
          </button>
        </header>

        <main style={{ flex: 1, maxWidth: 640, width: "100%", margin: "0 auto", padding: "18px 18px 100px" }}>
          {children}
        </main>

        {/* Mobile bottom nav — wrapper div (no conflicting custom class) controls responsive visibility */}
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
