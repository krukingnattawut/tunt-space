"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNav() {
  const pathname = usePathname();
  const items = [
    { href: "/home", label: "หน้าแรก", icon: "🏠" },
    { href: "/feed", label: "ระบาย", icon: "💬" },
  ];
  return (
    <div className="bottom-nav">
      {items.map((it) => (
        <Link
          key={it.href}
          href={it.href}
          className={`nav-btn ${pathname === it.href ? "active" : ""}`}
        >
          <span style={{ fontSize: 19 }}>{it.icon}</span>
          {it.label}
        </Link>
      ))}
    </div>
  );
}
