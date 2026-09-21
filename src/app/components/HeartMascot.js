"use client";

// The TUNT Space mascot — a friendly smiling heart, used across the brand
// (sidebar logo, login screen, empty states). Pure SVG so it stays crisp
// at any size and needs no image asset.
export default function HeartMascot({ size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M50 88 C20 68 8 48 8 32 C8 16 22 6 38 10 C44 12 48 17 50 22 C52 17 56 12 62 10 C78 6 92 16 92 32 C92 48 80 68 50 88 Z"
        fill="var(--coral)" stroke="var(--navy)" strokeWidth="4" strokeLinejoin="round"
      />
      <circle cx="38" cy="36" r="4" fill="var(--navy)" />
      <circle cx="62" cy="36" r="4" fill="var(--navy)" />
      <path d="M36 48 Q50 60 64 48" stroke="var(--navy)" strokeWidth="4" fill="none" strokeLinecap="round" />
    </svg>
  );
}
