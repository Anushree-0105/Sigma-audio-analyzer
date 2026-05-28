// src/components/Sidebar.jsx
import React from 'react';

export default function Sidebar({ tab, setTab, isCollapsed, setIsCollapsed, C, isMobile, mobileMenuOpen, setMobileMenuOpen }) {
  const navItems = [
    { id: "Dashboard", icon: "📊", label: "Live Dashboard" },
    { id: "Call Records", icon: "📞", label: "Call Logs" },
    { id: "Student Records", icon: "👥", label: "Students" },
    { id: "Analytics", icon: "📈", label: "Staff Analytics" },
    { id: "Settings", icon: "⚙️", label: "Settings" }
  ];

  const sidebarContent = (
    <div 
      onMouseEnter={() => !isMobile && setIsCollapsed(false)} 
      onMouseLeave={() => !isMobile && setIsCollapsed(true)}  
      style={{
        width: isMobile ? 260 : (isCollapsed ? 76 : 260),
        background: C.panel,
        borderRight: `1px solid ${C.border}`,
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)", 
        flexShrink: 0,
        overflow: "hidden",
        position: isMobile ? "fixed" : "relative",
        left: isMobile ? (mobileMenuOpen ? 0 : -260) : 0,
        top: 0,
        zIndex: 1000
      }}
    >
      <div style={{ height: 64, display: "flex", alignItems: "center", padding: isCollapsed && !isMobile ? "0 18px" : "0 20px", borderBottom: `1px solid ${C.border}`, justifyContent: "space-between", transition: "padding 0.3s" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, overflow: "hidden", whiteSpace: "nowrap" }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", background: `linear-gradient(135deg, ${C.accent}, ${C.accent2})`, fontSize: 18, flexShrink: 0 }}>🎓</div>
          <div style={{ opacity: isCollapsed && !isMobile ? 0 : 1, transition: "opacity 0.2s", display: isCollapsed && !isMobile ? "none" : "block" }}>
            <div style={{ fontWeight: 800, fontSize: 16, letterSpacing: -0.3 }}>AdmissionsAI</div>
          </div>
        </div>
        {isMobile && (
          <button onClick={() => setMobileMenuOpen(false)} style={{ background: "transparent", border: "none", color: C.textDim, fontSize: 20, cursor: "pointer" }}>✕</button>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "20px 12px", flex: 1 }}>
        {navItems.map(item => {
          const isActive = tab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              title={isCollapsed && !isMobile ? item.label : ""}
              style={{
                display: "flex", alignItems: "center", gap: 16, padding: "12px 14px",
                background: isActive ? C.accent + "1A" : "transparent", 
                color: isActive ? C.accent : C.textDim,
                border: "none", borderRadius: 10, cursor: "pointer", transition: "all 0.2s", width: "100%", textAlign: "left", whiteSpace: "nowrap",
                fontWeight: isActive ? 700 : 600, borderLeft: isActive ? `4px solid ${C.accent}` : "4px solid transparent"
              }}
            >
              <span style={{ fontSize: 20, flexShrink: 0, marginLeft: isActive ? -4 : 0 }}>{item.icon}</span>
              <span style={{ opacity: isCollapsed && !isMobile ? 0 : 1, transition: "opacity 0.2s" }}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <>
      {/* Dark Backdrop for Mobile */}
      {isMobile && mobileMenuOpen && (
        <div 
          onClick={() => setMobileMenuOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 999, animation: "fadeIn 0.2s" }}
        />
      )}
      {sidebarContent}
    </>
  );
}