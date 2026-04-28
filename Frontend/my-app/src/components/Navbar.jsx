import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const NAV_LINKS = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/create",    label: "Create"    },
  { to: "/simulate",  label: "Simulate"  },
  { to: "/analytics", label: "Analytics" },
];

const navStyle = {
  position: "sticky",
  top: 0,
  zIndex: 50,
  width: "100%",
  height: "64px",
  background: "rgba(3,7,18,0.9)",
  backdropFilter: "blur(24px)",
  WebkitBackdropFilter: "blur(24px)",
  borderBottom: "1px solid rgba(255,255,255,0.06)",
  display: "flex",
  alignItems: "center",
};

const innerStyle = {
  maxWidth: "1280px",
  margin: "0 auto",
  padding: "0 32px",
  width: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  height: "100%",
};

export default function Navbar() {
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav style={navStyle}>
      <div className="nav-shell" style={innerStyle}>

        {/* Brand */}
        <Link to="/dashboard" onClick={() => setMenuOpen(false)} style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
          <div style={{
            width: "32px", height: "32px", borderRadius: "8px",
            background: "linear-gradient(135deg, #10b981, #059669)",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <svg viewBox="0 0 20 20" fill="white" width="16" height="16">
              <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
              <path d="M3 4h1.5l2.5 8h7l2-5H6"/>
            </svg>
          </div>
          <span style={{ fontSize: "17px", fontWeight: 700, lineHeight: 1, letterSpacing: "-0.01em" }}>
            <span style={{ color: "#f9fafb" }}>Smart</span>
            <span style={{ color: "#10b981" }}>Supply</span>
          </span>
        </Link>

        <button
          type="button"
          className="nav-menu-toggle"
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
          style={{
            display: "none",
            width: "40px",
            height: "40px",
            borderRadius: "10px",
            border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.04)",
            color: "#f9fafb",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          <svg viewBox="0 0 20 20" fill="none" width="18" height="18" stroke="currentColor" strokeWidth="1.8">
            {menuOpen ? (
              <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" />
            ) : (
              <path d="M3 5h14M3 10h14M3 15h14" strokeLinecap="round" />
            )}
          </svg>
        </button>

        {/* Nav Links */}
        <div className={`nav-links ${menuOpen ? "nav-links-open" : ""}`} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          {NAV_LINKS.map(({ to, label }) => {
            const isActive = pathname === to || (to !== "/dashboard" && pathname.startsWith(to));
            return (
              <Link
                key={to}
                to={to}
                onClick={() => setMenuOpen(false)}
                style={{
                  fontSize: "14px",
                  fontWeight: isActive ? 500 : 400,
                  color: isActive ? "#10b981" : "#9ca3af",
                  textDecoration: "none",
                  padding: isActive ? "6px 16px" : "6px 14px",
                  borderRadius: "8px",
                  border: isActive ? "1px solid rgba(16,185,129,0.3)" : "1px solid transparent",
                  background: isActive ? "rgba(16,185,129,0.15)" : "transparent",
                  transition: "color 0.15s, background 0.15s, border-color 0.15s",
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = "#f9fafb"; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = "#9ca3af"; }}
              >
                {label}
              </Link>
            );
          })}
        </div>

        {/* Live indicator */}
        <div className="nav-live-indicator" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ position: "relative", width: "8px", height: "8px" }}>
            <span style={{
              display: "block", width: "8px", height: "8px",
              borderRadius: "50%", background: "#10b981",
              boxShadow: "0 0 8px #10b981",
              position: "relative", zIndex: 1,
            }} />
            <span style={{
              position: "absolute", inset: 0, borderRadius: "50%",
              background: "#10b981", animation: "navPing 1.6s ease-in-out infinite", opacity: 0.7,
            }} />
          </div>
          <span style={{ color: "#10b981", fontSize: "13px", fontWeight: 500 }}>Live</span>
        </div>

      </div>

      <style>{`
        @keyframes navPing {
          0%, 100% { transform: scale(1); opacity: 0.7; }
          50%       { transform: scale(2.2); opacity: 0; }
        }

        @media (max-width: 860px) {
          .nav-shell {
            padding: 0 16px !important;
          }

          .nav-menu-toggle {
            display: inline-flex !important;
          }

          .nav-live-indicator {
            display: none !important;
          }

          .nav-links {
            position: absolute;
            top: calc(100% + 8px);
            left: 16px;
            right: 16px;
            display: none !important;
            flex-direction: column;
            align-items: stretch !important;
            gap: 8px !important;
            padding: 12px;
            border-radius: 16px;
            background: rgba(3,7,18,0.96);
            border: 1px solid rgba(255,255,255,0.08);
            box-shadow: 0 24px 48px rgba(0,0,0,0.35);
          }

          .nav-links a {
            padding: 10px 14px !important;
            width: 100%;
          }

          .nav-links-open {
            display: flex !important;
          }
        }
      `}</style>
    </nav>
  );
}
