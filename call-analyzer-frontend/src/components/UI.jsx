// src/components/UI.jsx
import React from 'react';

export function Panel({ children, C, style }) {
  return (
    <div style={{
      background: C.panel, 
      border: "1px solid " + C.border, 
      borderRadius: 16,
      boxShadow: C.shadow, 
      backdropFilter: "blur(12px)", // 👈 The magic Glass effect
      WebkitBackdropFilter: "blur(12px)",
      position: "relative",
      overflow: "hidden",
      transition: "all 0.3s ease",
      ...(style || {})
    }}>
      {children}
    </div>
  );
}

export function StatCard({ label, value, sub, accent, icon, C }) {
  return (
    <div style={{
      background: `linear-gradient(180deg, ${C.panel} 0%, rgba(0,0,0,0) 100%)`, 
      border: "1px solid " + C.border, 
      borderRadius: 16,
      padding: "20px", flex: 1, minWidth: 160, position: "relative",
      overflow: "hidden", boxShadow: `0 8px 32px ${accent}15`,
      backdropFilter: "blur(10px)"
    }}>
      {/* Top glowing laser line */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: accent, boxShadow: `0 0 10px ${accent}` }} />
      
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ color: C.textDim, fontSize: 11, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>
          {label}
        </div>
        <div style={{ fontSize: 20, opacity: 0.8 }}>{icon}</div>
      </div>
      
      {/* Futuristic Monospace Font for numbers */}
      <div style={{ color: accent, fontSize: 36, fontWeight: 900, fontFamily: "'Courier New', Courier, monospace", textShadow: `0 0 15px ${accent}80`, lineHeight: 1.1 }}>
        {value}
      </div>
      {sub && <div style={{ color: C.muted, fontSize: 11, marginTop: 6, fontWeight: 600, letterSpacing: 0.5 }}>{sub}</div>}
    </div>
  );
}

export function ThemeToggle({ isDark, toggle, C }) {
  return (
    <button onClick={toggle} style={{
      display: "flex", alignItems: "center", gap: 6,
      background: "transparent", border: `1px solid ${C.border}`,
      borderRadius: 20, padding: "4px 12px", cursor: "pointer",
      color: C.accent, fontSize: 12, fontWeight: 700,
      boxShadow: isDark ? C.shadow : "none"
    }}>
      <span style={{ fontSize: 14 }}>{isDark ? "⚡ SYS.DARK" : "☀️ SYS.LIGHT"}</span>
    </button>
  );
}

export function Pill({ children, color, bg }) {
  return (
    <span style={{
      color: color, background: bg, border: `1px solid ${color}50`,
      borderRadius: 4, padding: "3px 8px", fontSize: 10, fontWeight: 800, 
      letterSpacing: 1, textTransform: "uppercase",
      boxShadow: `0 0 8px ${color}30`
    }}>
      {children}
    </span>
  );
}