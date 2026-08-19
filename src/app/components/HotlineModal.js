"use client";

export default function HotlineModal({ open, onClose }) {
  if (!open) return null;
  return (
    <div
      style={{
        position: "fixed", inset: 0, background: "rgba(20,20,20,0.55)",
        display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 50,
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{ width: "100%", maxWidth: 440, borderRadius: "22px 22px 0 0", padding: "22px", borderBottom: "none" }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-display" style={{ fontSize: 17, fontWeight: 800, margin: "0 0 6px" }}>
          ☎️ สายด่วนสุขภาพจิต
        </h3>
        <p style={{ fontSize: 12.5, color: "#4a4a4a", fontWeight: 600, lineHeight: 1.6, margin: "0 0 16px" }}>
          หากคุณหรือเพื่อนกำลังเผชิญความทุกข์ใจ ไม่ต้องเผชิญคนเดียว
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
          {[
            { n: "สายด่วนสุขภาพจิต 1323", s: "ฟรี ตลอด 24 ชม.", tel: "1323" },
            { n: "Samaritans of Thailand", s: "02-713-6791 · 12:00–22:00", tel: "027136791" },
          ].map((h) => (
            <div key={h.n} className="card-sm" style={{ background: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 13px" }}>
              <div>
                <div className="font-display" style={{ fontWeight: 800, fontSize: 13 }}>{h.n}</div>
                <div style={{ fontSize: 10.5, color: "#4a4a4a", fontWeight: 600 }}>{h.s}</div>
              </div>
              <a href={`tel:${h.tel}`} className="btn-brut" style={{ background: "var(--coral)", padding: "8px 14px", fontSize: 11.5, borderRadius: 999, textDecoration: "none" }}>
                โทรเลย
              </a>
            </div>
          ))}
        </div>
        <button onClick={onClose} className="btn-brut" style={{ width: "100%", background: "#fff", padding: 12 }}>
          ปิดหน้าต่าง
        </button>
      </div>
    </div>
  );
}
