// src/pages/OverviewTab.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { AreaChart, Area, XAxis, YAxis, Tooltip as ChartTooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

// 1. 👈 We are pulling the 'C' theme object in here now!
export default function OverviewTab({ dbRecords, C }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  
  // 2. 👈 State for our dynamic chart buttons
  const [trendMode, setTrendMode] = useState("Weekly");

  const handleUpload = async () => {
    if (!selectedFile) return alert("Please select an audio file!");
    setIsUploading(true);
    const formData = new FormData();
    formData.append('audioFile', selectedFile);
    formData.append('staffName', 'Demo Staff');

    try {
      await axios.post('http://localhost:5000/api/upload-audio', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSelectedFile(null);
    } catch (error) {
      alert("Upload failed. Is Node running?");
    } finally {
      setIsUploading(false);
    }
  };

  // ─── VIBRANT BRAND COLORS (These stay the same on Light/Dark) ───
  const colors = {
    purple: "#7C3AED", blue: "#0284C7", orange: "#EA580C", 
    green: "#16A34A", yellow: "#D97706"
  };

  // ─── STATS MATH ───
  const total = dbRecords.length || 0;
  const inbound = dbRecords.filter(r => r.type === "Inbound").length;
  const outbound = dbRecords.filter(r => r.type === "Outbound").length;
  const missed = 0; 
  const admitted = dbRecords.filter(r => (r.visitPrediction||"").toLowerCase().includes("yes")).length;
  const convRate = total ? ((admitted / total) * 100).toFixed(1) : 0;

  // ─── 3. DYNAMIC CHART DATA ───
  const trendMap = {};
  dbRecords.forEach(call => {
    const d = call.dateStr || "Unknown";
    // If Monthly, group by YYYY-MM. Otherwise, group by exact date.
    let key = trendMode === "Monthly" ? d.substring(0, 7) : d; 
    
    if (!trendMap[key]) trendMap[key] = { name: key.slice(5), Inbound: 0, Outbound: 0, Missed: 0 };
    
    if (call.type === "Inbound") trendMap[key].Inbound += 1;
    else trendMap[key].Outbound += 1;
  });

  // Slice data based on the selected button
  let trendData = Object.values(trendMap).sort((a, b) => a.name.localeCompare(b.name));
  if (trendMode === "Daily") trendData = trendData.slice(-7);
  else if (trendMode === "Weekly") trendData = trendData.slice(-14);
  else trendData = trendData.slice(-30); // Monthly

  // ─── OUTCOME DATA ───
  const outcomeCounts = {
    "Admitted": admitted,
    "Interested": dbRecords.filter(r => (r.visitPrediction||"").toLowerCase().includes("high")).length,
    "Follow-up": dbRecords.filter(r => (r.visitPrediction||"").toLowerCase().includes("maybe")).length,
    "Not Interested": dbRecords.filter(r => (r.visitPrediction||"").toLowerCase().includes("no")).length,
  };

  // ─── TOP PERFORMERS DATA ───
  const staffMap = {};
  dbRecords.forEach(call => {
    const name = call.staff || "Unknown";
    if (!staffMap[name]) staffMap[name] = { name, score: 0 };
    staffMap[name].score += (call.starRating ? call.starRating.length : 0) * 10 + 14; 
  });
  const staffData = Object.values(staffMap).sort((a, b) => b.score - a.score).slice(0, 5);

  // ─── REUSABLE COMPONENTS (Now using C for theme!) ───
  const TopCard = ({ title, value, sub1, sub2, color, icon }) => (
    <div style={{ background: C.panel, borderRadius: 12, padding: "20px", flex: 1, minWidth: 160, boxShadow: C.shadow, position: "relative", overflow: "hidden", border: `1px solid ${C.border}` }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: color }} />
      <div style={{ fontSize: 20, marginBottom: 8, color: color }}>{icon}</div>
      <div style={{ color: C.textDim, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, whiteSpace: "nowrap" }}>{title}</div>
      <div style={{ color: color, fontSize: 32, fontWeight: 800, margin: "4px 0" }}>{value}</div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: C.textDim, whiteSpace: "nowrap" }}>
        <span>{sub1}</span>
        <span>{sub2}</span>
      </div>
    </div>
  );

  const ProgressBar = ({ label, count, percent, color }) => (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 6 }}>
        <span>{label}</span>
        <span style={{ color: color }}>{count} <span style={{color: C.textDim, fontWeight: 400}}>({percent}%)</span></span>
      </div>
      <div style={{ height: 6, background: C.panelAlt, borderRadius: 3, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${percent}%`, background: color, borderRadius: 3 }} />
      </div>
    </div>
  );

  return (
    <div style={{ animation: "fadeIn 0.5s" }}>
      
      {/* ─── UPLOAD BAR ─── */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 24 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center", background: C.panel, padding: "8px 12px", borderRadius: 8, border: `1px solid ${C.border}`, boxShadow: C.shadow }}>
          <input type="file" accept=".wav, .mp3" onChange={(e) => setSelectedFile(e.target.files[0])} style={{ fontSize: 12, color: C.textDim, width: 200 }} />
          <button onClick={handleUpload} disabled={isUploading || !selectedFile} style={{ background: isUploading ? C.textDim : colors.blue, color: "#fff", border: "none", padding: "8px 16px", borderRadius: 6, fontWeight: 600, cursor: isUploading || !selectedFile ? "not-allowed" : "pointer", fontSize: 13 }}>
            {isUploading ? "Uploading..." : "Process Audio"}
          </button>
        </div>
      </div>

      {/* ─── TOP STATS ROW ─── */}
      <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
        <TopCard title="Total Calls" value={total} sub1="All time" color={colors.purple} icon="📊" />
        <TopCard title="Inbound" value={inbound} sub1={`${total ? Math.round((inbound/total)*100) : 0}%`} color={colors.blue} icon="📥" />
        <TopCard title="Outbound" value={outbound} sub1={`${total ? Math.round((outbound/total)*100) : 0}%`} color={colors.green} icon="📤" />
        <TopCard title="Missed" value={missed} sub1="12% miss" color={colors.orange} icon="⚠️" />
        <TopCard title="Conversion" value={`${convRate}%`} sub1={`${admitted} admissions`} color={colors.yellow} icon="🎓" />
        <TopCard title="Avg Duration" value="4m 32s" sub1="Per call" color={colors.purple} icon="⏱" />
      </div>

      {/* ─── MIDDLE ROW (Chart & Recent Calls) ─── */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 2.5fr) minmax(0, 1fr)", gap: 16, marginBottom: 24 }}>
        
        {/* Area Chart */}
        <div style={{ background: C.panel, borderRadius: 12, padding: 24, border: `1px solid ${C.border}`, boxShadow: C.shadow }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 16, color: C.text }}>Call Volume Trends</div>
              <div style={{ fontSize: 13, color: C.textDim }}>Inbound • Outbound • Missed</div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {/* 4. 👈 Dynamic buttons mapped to state */}
              {["Daily", "Weekly", "Monthly"].map((t) => (
                <button 
                  key={t} 
                  onClick={() => setTrendMode(t)}
                  style={{ 
                    background: trendMode === t ? colors.blue : C.panelAlt, 
                    color: trendMode === t ? "#fff" : C.textDim, 
                    border: "none", padding: "4px 12px", borderRadius: 16, fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.2s" 
                  }}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={trendData} margin={{ left: -20, right: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPurple" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={colors.purple} stopOpacity={0.2}/><stop offset="95%" stopColor={colors.purple} stopOpacity={0}/></linearGradient>
                <linearGradient id="colorBlue" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={colors.blue} stopOpacity={0.2}/><stop offset="95%" stopColor={colors.blue} stopOpacity={0}/></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={C.border} />
              <XAxis dataKey="name" stroke={C.textDim} tick={{ fontSize: 11 }} tickLine={false} axisLine={{stroke: C.border}} />
              <YAxis stroke={C.textDim} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <ChartTooltip contentStyle={{ backgroundColor: C.panel, borderRadius: 8, border: `1px solid ${C.border}`, color: C.text }} />
              <Area type="monotone" dataKey="Outbound" stroke={colors.purple} fill="url(#colorPurple)" strokeWidth={2} />
              <Area type="monotone" dataKey="Inbound" stroke={colors.blue} fill="url(#colorBlue)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Calls Feed */}
        <div style={{ background: C.panel, borderRadius: 12, padding: 24, border: `1px solid ${C.border}`, boxShadow: C.shadow, display: "flex", flexDirection: "column" }}>
          <div style={{ fontWeight: 800, fontSize: 16, color: C.text }}>Recent Calls</div>
          <div style={{ fontSize: 13, color: C.textDim, marginBottom: 16 }}>Live feed</div>
          
          <div style={{ overflowY: "auto", flex: 1, paddingRight: 4, display: "flex", flexDirection: "column", gap: 12 }}>
            {dbRecords.map((r, i) => {
              const initials = (r.staff || "U").split(" ").map(n=>n[0]).join("").substring(0,2).toUpperCase();
              const isInbound = r.type === "Inbound";
              return (
                <div key={r.id || i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px", background: C.bg, borderRadius: 8, border: `1px solid ${C.border}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: isInbound ? colors.blue+"22" : colors.purple+"22", color: isInbound ? colors.blue : colors.purple, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13 }}>
                      {initials}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13, color: C.text }}>{r.staff}</div>
                      <div style={{ fontSize: 11, color: C.textDim }}>{r.dateStr}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: isInbound ? colors.blue : colors.purple, background: isInbound ? colors.blue+"11" : colors.purple+"11", padding: "4px 10px", borderRadius: 12, border: `1px solid ${isInbound ? colors.blue+"40" : colors.purple+"40"}` }}>
                    {r.type || "Inbound"}
                  </div>
                </div>
              );
            })}
            {dbRecords.length === 0 && <div style={{textAlign: "center", color: C.textDim, marginTop: 20, fontSize: 13}}>No recent calls</div>}
          </div>
        </div>
      </div>

      {/* ─── BOTTOM ROW (Outcomes & Performers) ─── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        
        {/* Outcome Breakdown */}
        <div style={{ background: C.panel, borderRadius: 12, padding: 24, border: `1px solid ${C.border}`, boxShadow: C.shadow }}>
          <div style={{ fontWeight: 800, fontSize: 16, color: C.text }}>Outcome Breakdown</div>
          <div style={{ fontSize: 13, color: C.textDim, marginBottom: 24 }}>All call results</div>
          
          <ProgressBar label="Admitted / High Intent" count={outcomeCounts["Admitted"]} percent={total ? Math.round((outcomeCounts["Admitted"]/total)*100) : 0} color={colors.green} />
          <ProgressBar label="Interested" count={outcomeCounts["Interested"]} percent={total ? Math.round((outcomeCounts["Interested"]/total)*100) : 0} color={colors.blue} />
          <ProgressBar label="Follow-up Needed" count={outcomeCounts["Follow-up"]} percent={total ? Math.round((outcomeCounts["Follow-up"]/total)*100) : 0} color={colors.purple} />
          <ProgressBar label="Not Interested" count={outcomeCounts["Not Interested"]} percent={total ? Math.round((outcomeCounts["Not Interested"]/total)*100) : 0} color={colors.orange} />
        </div>

        {/* Top Performers */}
        <div style={{ background: C.panel, borderRadius: 12, padding: 24, border: `1px solid ${C.border}`, boxShadow: C.shadow }}>
          <div style={{ fontWeight: 800, fontSize: 16, color: C.text }}>Top Performers</div>
          <div style={{ fontSize: 13, color: C.textDim, marginBottom: 24 }}>By performance score</div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {staffData.map((staff, i) => {
              const initials = staff.name.split(" ").map(n=>n[0]).join("").substring(0,2).toUpperCase();
              const rankColors = [colors.green, colors.blue, colors.purple, colors.orange, C.textDim];
              return (
                <div key={staff.name} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 24, height: 24, borderRadius: "50%", background: rankColors[i] || C.textDim, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                    {i + 1}
                  </div>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: C.panelAlt, color: C.text, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                    {initials}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 4 }}>{staff.name}</div>
                    <div style={{ height: 6, background: C.panelAlt, borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${Math.min((staff.score / 100) * 100, 100)}%`, background: rankColors[i] || C.textDim, borderRadius: 3 }} />
                    </div>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: rankColors[i] || C.textDim, width: 24, textAlign: "right" }}>
                    {staff.score}
                  </div>
                </div>
              )
            })}
            {staffData.length === 0 && <div style={{textAlign: "center", color: C.textDim, fontSize: 13}}>No staff data yet</div>}
          </div>
        </div>

      </div>
    </div>
  );
}