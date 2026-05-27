// src/pages/AnalyticsTab.jsx
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';

export default function AnalyticsTab({ dbRecords, C }) {
  // Aggregate data per staff member
  const staffMap = {};
  dbRecords.forEach(call => {
    const name = call.staff || "Unknown";
    if (!staffMap[name]) staffMap[name] = { name, calls: 0, stars: 0, admits: 0 };
    
    staffMap[name].calls += 1;
    staffMap[name].stars += (call.starRating ? call.starRating.length : 0);
    if ((call.visitPrediction||"").toLowerCase().includes("yes") || (call.visitPrediction||"").toLowerCase().includes("high")) {
      staffMap[name].admits += 1;
    }
  });

  const analyticsData = Object.values(staffMap).map(s => ({
    name: s.name.split(" ")[0],
    Calls: s.calls,
    AvgRating: parseFloat((s.stars / s.calls).toFixed(1)),
    Conversion: parseFloat(((s.admits / s.calls) * 100).toFixed(1))
  })).sort((a, b) => b.Calls - a.Calls);

  return (
    <div style={{ animation: "fadeIn 0.5s" }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: C.text }}>Staff Analytics</h2>
        <p style={{ margin: "4px 0 0 0", color: C.textDim, fontSize: 14 }}>Counselor performance and conversion metrics.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: 24 }}>
        
        {/* Call Volume per Staff */}
        <div style={{ background: C.panel, borderRadius: 12, padding: 24, border: `1px solid ${C.border}`, boxShadow: C.shadow }}>
          <div style={{ fontWeight: 800, fontSize: 16, color: C.text, marginBottom: 20 }}>Calls Handled</div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={C.border} />
              <XAxis dataKey="name" stroke={C.textDim} tickLine={false} axisLine={false} />
              <YAxis stroke={C.textDim} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ backgroundColor: C.panel, borderRadius: 8, border: `1px solid ${C.border}`, color: C.text }} />
              <Bar dataKey="Calls" fill="#0284C7" radius={[4, 4, 0, 0]}>
                {analyticsData.map((entry, index) => <Cell key={`cell-${index}`} fill={index === 0 ? "#7C3AED" : "#0284C7"} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Conversion Rate per Staff */}
        <div style={{ background: C.panel, borderRadius: 12, padding: 24, border: `1px solid ${C.border}`, boxShadow: C.shadow }}>
          <div style={{ fontWeight: 800, fontSize: 16, color: C.text, marginBottom: 20 }}>Conversion Rate (%)</div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={C.border} />
              <XAxis dataKey="name" stroke={C.textDim} tickLine={false} axisLine={false} />
              <YAxis stroke={C.textDim} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ backgroundColor: C.panel, borderRadius: 8, border: `1px solid ${C.border}`, color: C.text }} />
              <Bar dataKey="Conversion" fill="#16A34A" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
}