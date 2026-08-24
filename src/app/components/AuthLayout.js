"use client";
import Logo from "./Logo";

export default function AuthLayout({ children }) {
  return (
    <div className="auth-page">
      <div className="auth-brand-panel">
        <div style={{ textAlign: "center", maxWidth: 380 }}>
          <div style={{ margin: "0 auto 26px", transform: "rotate(-4deg)", display: "inline-block" }}>
            <Logo size={120} radius={30} fontSize={44} bg="#fff" />
          </div>
          <h1 className="font-display" style={{ fontWeight: 800, fontSize: 34, color: "#fff", margin: "0 0 10px", textShadow: "3px 3px 0 var(--ink)" }}>
            TUNT Space
          </h1>
          <p className="font-display" style={{ fontWeight: 700, fontSize: 15, color: "#fff", margin: "0 0 22px" }}>
            พื้นที่เซฟใจของคุณ
          </p>
          <div
            className="card-sm"
            style={{ background: "#fff", padding: "14px 18px", fontSize: 13.5, fontWeight: 700, color: "var(--ink)", display: "inline-block" }}
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
