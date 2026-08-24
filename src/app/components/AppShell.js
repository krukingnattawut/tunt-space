"use client";
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

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/");
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex" }}>
      {/* Desktop sidebar — bright Netflix/Disney+-style rail, neo-brutalist border */}
      <aside
        className="hidden md:flex"
        style={{
          width: 230, flexShrink: 0, background: "linear-gradient(180deg, var(--stage-2), var(--stage-1))",
          borderRight: "3px solid var(--ink)",
          flexDirection: "column", padding: "22px 14px", position: "sticky", top: 0, height: "100vh",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 30, padding: "0 6px" }}>
          <Logo size={38} radius={12} fontSize={16} />
          <span className="font-display" style={{ fontWeight: 800, fontSize: 15, color: "var(--stage-text)" }}>TUNT Space</span>
        </div>
        {NAV_ITEMS.map((it) => (
          <Link
            key={it.href}
            href={it.href}
            className="font-display"
            style={{
              display: "flex", alignItems: "center", gap: 10, padding: "11px 12px", borderRadius: 12,
              fontWeight: 700, fontSize: 13.5, marginBottom: 6, textDecoration: "none",
              color: pathname === it.href ? "var(--ink)" : "var(--stage-text-dim)",
              background: pathname === it.href ? "var(--yellow)" : "transparent",
            }}
          >
            <span style={{ fontSize: 18 }}>{it.icon}</span> {it.label}
          </Link>
        ))}

        <div style={{ flex: 1 }} />
        <button
          onClick={handleLogout}
          className="font-display"
          style={{
            background: "rgba(255,107,91,0.14)", border: "1.5px solid var(--coral)", borderRadius: 12,
            padding: "10px 12px", fontSize: 12.5, display: "flex", alignItems: "center", gap: 8,
            justifyContent: "center", color: "var(--coral)", cursor: "pointer", fontWeight: 700,
          }}
        >
          🚪 ออกจากระบบ
        </button>
      </aside>

      {/* Main column — bright warm stage background */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <header
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "16px 18px",
            borderBottom: "3px solid var(--ink)", background: "rgba(255,255,255,0.9)", backdropFilter: "blur(10px)",
            position: "sticky", top: 0, zIndex: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {showBack && (
              <button
                onClick={() => router.back()}
                className="stage-panel-sm"
                style={{ width: 36, height: 36, padding: 0, fontSize: 16, color: "var(--stage-text)", cursor: "pointer" }}
                aria-label="ย้อนกลับ"
              >
                ←
              </button>
            )}
            <div className="font-display" style={{ fontWeight: 800, fontSize: 16, color: "var(--stage-text)" }}>{title}</div>
          </div>

          {/* Mobile-only quick logout (desktop uses sidebar button) */}
          <button
            onClick={handleLogout}
            className="md:hidden stage-panel-sm"
            style={{ width: 36, height: 36, padding: 0, fontSize: 15, color: "var(--coral)", cursor: "pointer" }}
            aria-label="ออกจากระบบ"
          >
            🚪
          </button>
        </header>

        <main style={{ flex: 1, maxWidth: 720, width: "100%", margin: "0 auto", padding: "18px 18px 100px" }}>
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
