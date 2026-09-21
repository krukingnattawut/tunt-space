"use client";
import HeartMascot from "./HeartMascot";

export default function AuthLayout({ children }) {
  return (
    <div className="auth-page">
      <div className="auth-brand-panel">
        <div style={{ textAlign: "center", maxWidth: 380 }}>
          <div style={{ margin: "0 auto 22px" }}>
            <HeartMascot size={110} />
          </div>
          <h1 className="font-display" style={{ fontWeight: 700, fontSize: 34, color: "var(--navy)", margin: "0 0 8px" }}>
            TUNT Space
          </h1>
          <p className="font-display" style={{ fontWeight: 600, fontSize: 15, color: "var(--purple-deep)", margin: "0 0 22px" }}>
            พื้นที่เซฟใจของคุณ
          </p>
          <div
            className="card-sm font-display"
            style={{ background: "#fff", padding: "14px 20px", fontSize: 13, fontWeight: 600, color: "var(--navy)", display: "inline-block" }}
          >
            Track · Understand · Notify · Treat
          </div>
        </div>
      </div>

      <div className="auth-form-panel">
        <div className="auth-form-card">{children}</div>
      </div>
    </div>
  );
}
