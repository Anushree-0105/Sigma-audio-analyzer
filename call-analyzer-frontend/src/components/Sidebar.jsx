// src/components/Sidebar.jsx
import React from 'react';

export default function Sidebar({ tab, setTab, isCollapsed, setIsCollapsed, C }) {
  // The navigation headers from your original dashboard concept
  const navItems = [
    { id: "Dashboard", icon: "📊", label: "Live Dashboard" },
    { id: "Call Records", icon: "📞", label: "Call Logs" },
    { id: "Student Records", icon: "👥", label: "Students" },
    { id: "Analytics", icon: "📈", label: "Staff Analytics" },
    { id: "Settings", icon: "⚙️", label: "Settings" }
  ];

  return (
    <div style={{
      width: isCollapsed ? 76 : 260,
      background: C.panel,
      borderRight: `1px solid ${C.border}`,
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)", // Smooth slide animation
      flexShrink: 0,
      overflow: "hidden",
      position: "relative",
      zIndex: 100
    }}>
      
      {/* ─── LOGO & TOGGLE BUTTON ─── */}
      <div style={{ height: 64, display: "flex", alignItems: "center", padding: isCollapsed ? "0 18px" : "0 20px", borderBottom: `1px solid ${C.border}`, justifyContent: "space-between", transition: "padding 0.3s" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, overflow: "hidden", whiteSpace: "nowrap" }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", background: `linear-gradient(135deg, ${C.accent}, ${C.accent2})`, fontSize: 18, flexShrink: 0 }}>
            🎓
          </div>
          <div style={{ opacity: isCollapsed ? 0 : 1, transition: "opacity 0.2s", display: isCollapsed ? "none" : "block" }}>
            <div style={{ fontWeight: 800, fontSize: 16, letterSpacing: -0.3 }}>AdmissionsAI</div>
          </div>
        </div>
      </div>

      {/* ─── NAVIGATION LINKS ─── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "20px 12px", flex: 1 }}>
        {navItems.map(item => {
          const isActive = tab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              title={isCollapsed ? item.label : ""}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                padding: "12px 14px",
                background: isActive ? C.accent + "1A" : "transparent", // 1A is hex for 10% opacity
                color: isActive ? C.accent : C.textDim,
                border: "none",
                borderRadius: 10,
                cursor: "pointer",
                transition: "all 0.2s",
                width: "100%",
                textAlign: "left",
                whiteSpace: "nowrap",
                fontWeight: isActive ? 700 : 600,
                borderLeft: isActive ? `4px solid ${C.accent}` : "4px solid transparent"
              }}
            >
              <span style={{ fontSize: 20, flexShrink: 0, marginLeft: isActive ? -4 : 0 }}>{item.icon}</span>
              <span style={{ opacity: isCollapsed ? 0 : 1, transition: "opacity 0.2s" }}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* ─── BOTTOM COLLAPSE TOGGLE ─── */}
      <div style={{ padding: "16px 12px", borderTop: `1px solid ${C.border}` }}>
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          style={{
            display: "flex", alignItems: "center", gap: 16, padding: "12px 14px",
            background: "transparent", color: C.textDim, border: "none", borderRadius: 10,
            cursor: "pointer", width: "100%", textAlign: "left", whiteSpace: "nowrap",
            transition: "background 0.2s"
          }}
          onMouseOver={(e) => e.currentTarget.style.background = C.border}
          onMouseOut={(e) => e.currentTarget.style.background = "transparent"}
        >
          <span style={{ fontSize: 18, flexShrink: 0 }}>{isCollapsed ? "➡️" : "⬅️"}</span>
          <span style={{ opacity: isCollapsed ? 0 : 1, transition: "opacity 0.2s", fontWeight: 600 }}>Collapse Menu</span>
        </button>
      </div>

    </div>
  );
}