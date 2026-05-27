// src/pages/SettingsTab.jsx
import React from 'react';

export default function SettingsTab({ C }) {
  const InputGroup = ({ label, type, placeholder, defaultValue }) => (
    <div style={{ marginBottom: 20 }}>
      <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: C.textDim, marginBottom: 8 }}>{label}</label>
      <input type={type} placeholder={placeholder} defaultValue={defaultValue} style={{ width: "100%", padding: "12px 16px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.bg, color: C.text, fontSize: 14, outline: "none" }} />
    </div>
  );

  return (
    <div style={{ animation: "fadeIn 0.5s", maxWidth: 800 }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: C.text }}>System Settings</h2>
        <p style={{ margin: "4px 0 0 0", color: C.textDim, fontSize: 14 }}>Configure your AI extraction pipeline and application preferences.</p>
      </div>

      <div style={{ background: C.panel, borderRadius: 12, padding: 32, border: `1px solid ${C.border}`, boxShadow: C.shadow, marginBottom: 24 }}>
        <h3 style={{ margin: "0 0 20px 0", color: C.text, fontSize: 18 }}>General Information</h3>
        <InputGroup label="University Name" type="text" defaultValue="Sigma University" />
        <InputGroup label="Admin Email" type="email" defaultValue="admin@university.edu" />
      </div>

      <div style={{ background: C.panel, borderRadius: 12, padding: 32, border: `1px solid ${C.border}`, boxShadow: C.shadow }}>
        <h3 style={{ margin: "0 0 20px 0", color: C.text, fontSize: 18 }}>AI & Integrations</h3>
        <InputGroup label="Google Gemini API Key" type="password" defaultValue="************************" />
        <InputGroup label="MongoDB Connection String" type="password" defaultValue="mongodb://127.0.0.1:27017/admissions_ai" />
        
        <button style={{ background: "#7C3AED", color: "#fff", border: "none", padding: "12px 24px", borderRadius: 8, fontWeight: 700, cursor: "pointer", marginTop: 10 }}>
          Save Configuration
        </button>
      </div>
    </div>
  );
}