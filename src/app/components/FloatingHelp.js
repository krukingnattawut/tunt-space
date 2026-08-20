"use client";
import { useState } from "react";
import HotlineModal from "./HotlineModal";

export default function FloatingHelp() {
  const [open, setOpen] = useState(false);
  const [hotlineOpen, setHotlineOpen] = useState(false);

  return (
    <>
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{ position: "fixed", inset: 0, zIndex: 55 }}
        />
      )}

      <div style={{ position: "fixed", right: 20, bottom: 90, zIndex: 60, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10 }}>
        {open && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 4 }}>
            <a
              href="/chat"
              className="card-sm font-display"
              style={{ background: "var(--mint)", padding: "10px 16px", fontSize: 12.5, fontWeight: 700, textDecoration: "none", color: "var(--ink)", whiteSpace: "nowrap" }}
            >
              💬 คุยกับครู / TUNT Bot
            </a>
            <button
              onClick={() => { setHotlineOpen(true); setOpen(false); }}
              className="card-sm font-display"
              style={{ background: "var(--coral)", padding: "10px 16px", fontSize: 12.5, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap", border: "3px solid var(--ink)" }}
            >
              ☎️ สายด่วนฉุกเฉิน
            </button>
          </div>
        )}

        <div
          onClick={() => setOpen((o) => !o)}
          style={{
            width: 58, height: 58, background: "var(--yellow)", border: "3px solid var(--ink)",
            borderRadius: "0 50% 50% 50%", transform: "rotate(45deg)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", boxShadow: "4px 4px 0 var(--ink)",
          }}
        >
          <span style={{ transform: "rotate(-45deg)", fontSize: 22 }}>{open ? "✕" : "💛"}</span>
        </div>
      </div>

      <HotlineModal open={hotlineOpen} onClose={() => setHotlineOpen(false)} floatingPage />
    </>
  );
}
