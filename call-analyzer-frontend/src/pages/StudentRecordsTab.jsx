// src/pages/StudentRecordsTab.jsx
import React, { useState } from 'react';

export default function StudentRecordsTab({ dbRecords, C }) {
  const [search, setSearch] = useState("");
  const [expandedRow, setExpandedRow] = useState(null);

  const brandColors = { blue: "#0284C7", green: "#10B981", orange: "#F59E0B", red: "#EF4444", purple: "#8B5CF6" };

  const formatCourse = (courseStr) => courseStr ? courseStr.split('(')[0].trim() : "N/A";
  
  const getProbability = (stars) => {
    const count = stars ? stars.length : 0;
    if (count >= 5) return 95;
    if (count === 4) return 75;
    if (count === 3) return 50;
    if (count === 2) return 25;
    return 10;
  };

  const filteredRecords = dbRecords.filter(r => 
    (r.studentName || "").toLowerCase().includes(search.toLowerCase()) ||
    (r.course || "").toLowerCase().includes(search.toLowerCase()) ||
    (r.city || "").toLowerCase().includes(search.toLowerCase()) ||
    (r.staff || "").toLowerCase().includes(search.toLowerCase())
  );

  const StatCard = ({ title, value, sub, icon, color }) => (
    <div style={{ background: C.panel, borderRadius: 12, padding: "20px", flex: 1, minWidth: 180, border: `1px solid ${C.border}`, boxShadow: C.shadow }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
        <div style={{ fontSize: 24, background: color+"15", width: 40, height: 40, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: color }}>{icon}</div>
        <div style={{ color: C.textDim, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>{title}</div>
      </div>
      <div style={{ color: color, fontSize: 32, fontWeight: 800, margin: "8px 0" }}>{value}</div>
      <div style={{ fontSize: 12, color: C.textDim, fontWeight: 500 }}>{sub}</div>
    </div>
  );

  const Pill = ({ text }) => {
    let color = C.textDim, bg = C.panelAlt;
    const t = (text || "").toLowerCase();
    if (t.includes("yes") || t.includes("admitted") || t.includes("positive") || t.includes("likely")) { color = brandColors.green; bg = brandColors.green+"15"; }
    else if (t.includes("no") || t.includes("unlikely") || t.includes("negative")) { color = brandColors.red; bg = brandColors.red+"15"; }
    else if (t.includes("high") || t.includes("interested")) { color = brandColors.blue; bg = brandColors.blue+"15"; }
    else if (t.includes("maybe") || t.includes("follow")) { color = brandColors.orange; bg = brandColors.orange+"15"; }

    return <span style={{ color: color, background: bg, border: `1px solid ${color}40`, padding: "4px 10px", borderRadius: 12, fontSize: 11, fontWeight: 700, whiteSpace: "nowrap" }}>{text || "Pending"}</span>;
  };

  const total = dbRecords.length;
  const highProb = dbRecords.filter(r => (r.visitPrediction||"").toLowerCase().includes("yes") || (r.visitPrediction||"").toLowerCase().includes("high")).length;
  const connected = dbRecords.filter(r => r.outcome !== "Missed").length;

  return (
    <div style={{ animation: "fadeIn 0.5s" }}>
      <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
        <StatCard title="Total Leads" value={total} sub="All tracked calls" icon="🎓" color={brandColors.blue} />
        <StatCard title="Connected" value={connected} sub={`${total ? Math.round((connected/total)*100) : 0}% connect rate`} icon="📞" color={brandColors.green} />
        <StatCard title="High Probability" value={highProb} sub={`Adm. prob ≥ 70%`} icon="🔥" color={brandColors.orange} />
        <StatCard title="Avg AI Rating" value={(dbRecords.reduce((acc, curr) => acc + (curr.starRating ? curr.starRating.length : 0), 0) / (total || 1)).toFixed(1)} sub="Out of 5.0" icon="⭐" color={brandColors.purple} />
      </div>

      <div style={{ display: "flex", gap: 12, background: C.panel, padding: "12px 16px", borderRadius: 12, border: `1px solid ${C.border}`, marginBottom: 20, alignItems: "center", boxShadow: C.shadow }}>
        <div style={{ flex: 1, position: "relative" }}>
          <span style={{ position: "absolute", left: 12, top: 10, fontSize: 14 }}>🔍</span>
          <input type="text" placeholder="Search student, counselor, city..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: "100%", padding: "10px 10px 10px 36px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.inputBg || C.bg, color: C.text, fontSize: 13, outline: "none" }} />
        </div>
        <div style={{ fontSize: 13, color: C.textDim, padding: "0 12px" }}>{filteredRecords.length} records</div>
      </div>

      <div style={{ background: C.panel, borderRadius: 12, border: `1px solid ${C.border}`, boxShadow: C.shadow, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", whiteSpace: "nowrap" }}>
            <thead>
              <tr style={{ background: C.panelAlt, borderBottom: `1px solid ${C.border}`, color: C.textDim, fontSize: 11, textTransform: "uppercase", letterSpacing: 1 }}>
                <th style={{ padding: "16px 20px", fontWeight: 700 }}>#</th>
                <th style={{ padding: "16px 10px", fontWeight: 700 }}>Date & Time</th>
                <th style={{ padding: "16px 10px", fontWeight: 700 }}>Counselor</th>
                <th style={{ padding: "16px 10px", fontWeight: 700 }}>Student</th>
                <th style={{ padding: "16px 10px", fontWeight: 700 }}>Phone</th>
                <th style={{ padding: "16px 10px", fontWeight: 700 }}>City</th>
                <th style={{ padding: "16px 10px", fontWeight: 700 }}>Course</th>
                <th style={{ padding: "16px 10px", fontWeight: 700 }}>Visit</th>
                <th style={{ padding: "16px 10px", fontWeight: 700 }}>Adm. Prob</th>
                <th style={{ padding: "16px 20px", fontWeight: 700, textAlign: "center" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((r, i) => {
                const isExpanded = expandedRow === r.id;
                const prob = getProbability(r.starRating);
                const probColor = prob >= 70 ? brandColors.green : prob >= 40 ? brandColors.orange : brandColors.red;
                const counselorInitials = (r.staff || "U").split(" ").map(n=>n[0]).join("").substring(0,2).toUpperCase();

                return (
                  <React.Fragment key={r.id || i}>
                    <tr onClick={() => setExpandedRow(isExpanded ? null : r.id)} style={{ borderBottom: `1px solid ${C.border}`, color: C.text, fontSize: 13, background: isExpanded ? C.panelAlt : "transparent", cursor: "pointer", transition: "background 0.2s" }} onMouseOver={e => !isExpanded && (e.currentTarget.style.background = C.panelAlt)} onMouseOut={e => !isExpanded && (e.currentTarget.style.background = "transparent")}>
                      <td style={{ padding: "16px 20px", color: C.textDim }}>{filteredRecords.length - i}</td>
                      <td style={{ padding: "16px 10px", color: C.textDim }}>{r.dateStr}</td>
                      <td style={{ padding: "16px 10px" }}><div style={{ display: "flex", alignItems: "center", gap: 8 }}><div style={{ width: 28, height: 28, borderRadius: "50%", background: brandColors.blue+"20", color: brandColors.blue, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700 }}>{counselorInitials}</div><span style={{ fontWeight: 600 }}>{r.staff?.split(" ")[0]}</span></div></td>
                      <td style={{ padding: "16px 10px", fontWeight: 700 }}>{r.studentName}</td>
                      <td style={{ padding: "16px 10px", color: C.textDim }}>{r.phone}</td>
                      <td style={{ padding: "16px 10px", fontWeight: 600 }}>{r.city}</td>
                      <td style={{ padding: "16px 10px", color: C.textDim, fontWeight: 600 }}>{formatCourse(r.course)}</td>
                      <td style={{ padding: "16px 10px" }}><Pill text={r.visitPrediction} /></td>
                      <td style={{ padding: "16px 10px", width: 140 }}><div style={{ display: "flex", alignItems: "center", gap: 12 }}><div style={{ flex: 1, height: 6, background: C.border, borderRadius: 3, overflow: "hidden" }}><div style={{ height: "100%", width: `${prob}%`, background: probColor, borderRadius: 3 }} /></div><span style={{ fontWeight: 700, color: probColor, fontSize: 12 }}>{prob}%</span></div></td>
                      <td style={{ padding: "16px 20px", textAlign: "center", color: C.textDim }}><button style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 4, width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: brandColors.blue, transition: "transform 0.2s", transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)" }}>▼</button></td>
                    </tr>

                    {isExpanded && (
                      <tr style={{ background: C.panelAlt, borderBottom: `2px solid ${C.border}` }}>
                        <td colSpan="10" style={{ padding: 0 }}>
                          <div style={{ padding: "20px 40px", display: "flex", gap: 24, borderLeft: `4px solid ${brandColors.blue}` }}>
                            
                            <div style={{ flex: 1.5 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 8, color: C.textDim, fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 12 }}><span>💬</span> Conversation Summary</div>
                              <div style={{ background: C.panel, padding: 20, borderRadius: 12, border: `1px solid ${C.border}`, color: C.text, fontSize: 14, lineHeight: 1.6, boxShadow: C.shadow }}>{r.remark}</div>
                              
                              {/* 👈 THE NEW AUDIO PLAYER */}
                              {r.localFilePath && (
                                <div style={{ marginTop: 20, background: C.panel, padding: "12px 16px", borderRadius: 12, border: `1px solid ${C.border}` }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: 8, color: C.textDim, fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 12 }}><span>🎧</span> Call Recording</div>
                                  <audio controls src={`http://localhost:5000/${r.localFilePath.replace(/\\/g, '/')}`} style={{ width: "100%", height: 40, outline: "none", borderRadius: 8 }} />
                                </div>
                              )}
                            </div>

                            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
                              <div style={{ display: "flex", gap: 12 }}>
                                <div style={{ flex: 1, background: C.panel, padding: "12px 16px", borderRadius: 8, border: `1px solid ${C.border}` }}><div style={{ color: C.textDim, fontSize: 10, fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>Call Type</div><div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{r.type || "Inbound"}</div></div>
                                <div style={{ flex: 1, background: C.panel, padding: "12px 16px", borderRadius: 8, border: `1px solid ${C.border}` }}><div style={{ color: C.textDim, fontSize: 10, fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>AI Star Rating</div><div style={{ fontSize: 14, fontWeight: 600, color: brandColors.orange, letterSpacing: 2 }}>{r.starRating}</div></div>
                              </div>
                              <div style={{ background: C.panel, padding: "16px", borderRadius: 8, border: `1px solid ${C.border}` }}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}><div style={{ color: C.textDim, fontSize: 10, fontWeight: 700, textTransform: "uppercase" }}>Admission Probability</div><div style={{ fontWeight: 800, color: probColor, fontSize: 12 }}>{prob}%</div></div>
                                <div style={{ height: 6, background: C.border, borderRadius: 3, overflow: "hidden" }}><div style={{ height: "100%", width: `${prob}%`, background: probColor, borderRadius: 3 }} /></div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
              {filteredRecords.length === 0 && <tr><td colSpan="10" style={{ padding: "40px", textAlign: "center", color: C.textDim, fontSize: 14 }}>No student records found.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}