"use client";
import { useEffect, useState } from "react";
import HeartMascot from "./HeartMascot";

export default function Logo({ size = 38, radius = 12, rotate = 0, bg = "var(--yellow)" }) {
  const [logo, setLogo] = useState(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => setLogo(data.ok ? (data.settings.logo_emoji || "") : ""))
      .catch(() => setLogo(""));
  }, []);

  const isImage = logo && (logo.startsWith("data:") || logo.startsWith("http"));
  const isCustomText = logo && !isImage;

  return (
    <div
      style={{
        width: size, height: size, borderRadius: radius, background: bg,
        display: "flex", alignItems: "center", justifyContent: "center",
        overflow: "hidden", flexShrink: 0, transform: rotate ? `rotate(${rotate}deg)` : undefined,
        border: "2px solid var(--navy)",
      }}
    >
      {isImage ? (
        <img src={logo} alt="logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : isCustomText ? (
        <span className="font-display" style={{ fontWeight: 700, fontSize: size * 0.42, color: "var(--navy)" }}>{logo}</span>
      ) : (
        <HeartMascot size={size * 0.66} />
      )}
    </div>
  );
}
