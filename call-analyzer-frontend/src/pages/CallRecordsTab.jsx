// src/pages/CallRecordsTab.jsx
import React, { useState } from 'react';

export default function CallRecordsTab({ dbRecords, C }) {
  const [search, setSearch] = useState("");

  // Filter records based on search input
  const filteredRecords = dbRecords.filter(r => 
    (r.studentName || "").toLowerCase().includes(search.toLowerCase()) ||
    (r.staff || "").toLowerCase().includes(search.toLowerCase()) ||
    (r.phone || "").includes(search)
  );

  return (
    <div style={{ animation: "fadeIn 0.5s" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: C.text }}>Call Logs</h2>
          <p style={{ margin: "4px 0 0 0", color: C.textDim, fontSize: 14 }}>Search and review all AI-extracted call records.</p>
        </div>
        <input 
          type="text" 
          placeholder="Search student, counselor, or phone..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: "10px 16px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.panel, color: C.text, width: 300, fontSize: 14, outline: "none" }}
        />
      </div>

      <div style={{ background: C.panel, borderRadius: 12, border: `1px solid ${C.border}`, boxShadow: C.shadow, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ background: C.panelAlt, borderBottom: `1px solid ${C.border}`, color: C.textDim, fontSize: 12, textTransform: "uppercase", letterSpacing: 1 }}>
                <th style={{ padding: "16px", fontWeight: 700 }}>Date</th>
                <th style={{ padding: "16px", fontWeight: 700 }}>Student Name</th>
                <th style={{ padding: "16px", fontWeight: 700 }}>Counselor</th>
                <th style={{ padding: "16px", fontWeight: 700 }}>Type</th>
                <th style={{ padding: "16px", fontWeight: 700 }}>Intent</th>
                <th style={{ padding: "16px", fontWeight: 700 }}>Rating</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((r, i) => (
                <tr key={r.id || i} style={{ borderBottom: `1px solid ${C.border}`, color: C.text, fontSize: 14, transition: "background 0.2s" }} onMouseOver={e => e.currentTarget.style.background = C.panelAlt} onMouseOut={e => e.currentTarget.style.background = "transparent"}>
                  <td style={{ padding: "16px", color: C.textDim }}>{r.dateStr}</td>
                  <td style={{ padding: "16px", fontWeight: 600 }}>{r.studentName}</td>
                  <td style={{ padding: "16px" }}>{r.staff}</td>
                  <td style={{ padding: "16px" }}>
                    <span style={{ background: r.type === "Inbound" ? "#0284C722" : "#7C3AED22", color: r.type === "Inbound" ? "#0284C7" : "#7C3AED", padding: "4px 8px", borderRadius: 4, fontSize: 12, fontWeight: 700 }}>{r.type || "Inbound"}</span>
                  </td>
                  <td style={{ padding: "16px", fontWeight: 600, color: (r.visitPrediction||"").toLowerCase().includes("yes") ? C.green : C.warn }}>{r.visitPrediction}</td>
                  <td style={{ padding: "16px", letterSpacing: 2 }}>{r.starRating}</td>
                </tr>
              ))}
              {filteredRecords.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ padding: "40px", textAlign: "center", color: C.textDim }}>No records found matching your search.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}