"use client";
import { useEffect, useState } from "react";

export default function Logo({ size = 38, radius = 12, fontSize = 16, rotate = 0, bg = "var(--coral)" }) {
  const [logo, setLogo] = useState(null); // null = not loaded yet, "" = use default

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => setLogo(data.ok ? (data.settings.logo_emoji || "") : ""))
      .catch(() => setLogo(""));
  }, []);

  const isImage = logo && (logo.startsWith("data:") || logo.startsWith("http"));

  return (
    <div
      className="card-sm"
      style={{
        width: size, height: size, borderRadius: radius, background: bg,
        display: "flex", alignItems: "center", justifyContent: "center",
        overflow: "hidden", flexShrink: 0, transform: rotate ? `rotate(${rotate}deg)` : undefined,
      }}
    >
      {isImage ? (
        <img src={logo} alt="logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        <span className="font-display" style={{ fontWeight: 800, fontSize, color: "var(--ink)" }}>
          {logo && logo.trim() ? logo : "ใจ"}
        </span>
      )}
    </div>
  );
}
