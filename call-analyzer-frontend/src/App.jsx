// src/App.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { getTheme } from "./utils/theme";
import { ThemeToggle } from "./components/UI";
import Sidebar from "./components/Sidebar"; // 👈 Import the new Sidebar
import OverviewTab from "./pages/OverviewTab";
import CallRecordsTab from "./pages/CallRecordsTab"; // 👈 Add this
import AnalyticsTab from "./pages/AnalyticsTab";     // 👈 Add this
import SettingsTab from "./pages/SettingsTab";  
import StudentRecordsTab from "./pages/StudentRecordsTab";       // 👈 Add this

export default function App() {
  const [isDark, setIsDark] = useState(false); 
  const [tab, setTab] = useState("Dashboard");
  
  // 👈 New state to control the sidebar animation
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  const [dbRecords, setDbRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const C = getTheme(isDark);

  useEffect(() => {
    async function fetchCalls() {
      try {
        const response = await axios.get('http://localhost:5000/api/calls');
        
        const formattedData = response.data.map(call => ({
          id: call.callId,
          staff: call.counselorName || call.staffName,
          phone: call.callerNumber || "Unknown",
          type: call.callType || "Inbound",
          studentName: call.studentName || "Processing...",
          course: call.course || "N/A",
          city: call.city || "N/A",
          visitPrediction: call.visitPrediction || "Processing...",
          remark: call.remark || "N/A",
          starRating: call.starRating || "⏳",
          outcome: call.outcome || "Pending",
          timestamp: call.timestamp,
          dateStr: call.timestamp ? new Date(call.timestamp).toISOString().slice(0, 10) : "Unknown",
        }));

        setDbRecords(formattedData);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching from MongoDB:", error);
        setIsLoading(false);
      }
    }

    fetchCalls();
    const interval = setInterval(fetchCalls, 4000); 
    return () => clearInterval(interval);
  }, []);

  return (
    // 👈 Main wrapper is now a FLEX ROW, locking height to 100vh
    <div style={{ display: "flex", height: "100vh", background: C.bg, color: C.text, fontFamily: "'DM Sans', sans-serif", transition: "background 0.3s, color 0.3s", overflow: "hidden" }}>
      
      {/* ─── SIDEBAR COMPONENT ─── */}
      <Sidebar 
        tab={tab} 
        setTab={setTab} 
        isCollapsed={isSidebarCollapsed} 
        setIsCollapsed={setIsSidebarCollapsed} 
        C={C} 
      />

      {/* ─── RIGHT CONTENT AREA ─── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        
        {/* Top Header (Now much cleaner, just for User Profile & Theme) */}
        <header style={{ borderBottom: "1px solid " + C.border, padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "flex-end", height: 64, background: C.panel, flexShrink: 0 }}>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: C.textDim }}>Admin Portal</span>
            <ThemeToggle isDark={isDark} toggle={() => setIsDark(!isDark)} C={C} />
          </div>
        </header>

        {/* Scrollable Main Canvas */}
        <main style={{ flex: 1, overflowY: "auto", padding: "32px 24px" }}>
          <div style={{ maxWidth: 1400, margin: "0 auto" }}>
            
            

            {/* Global Loader or Current Tab Content */}
            {isLoading ? (
              <div style={{display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", marginTop: 100, gap: 16}}>
                <div style={{ width: 40, height: 40, border: `4px solid ${C.border}`, borderTop: `4px solid #0284C7`, borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                <div style={{ color: C.muted, fontSize: 15, fontWeight: 600 }}>Connecting to Database...</div>
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
              </div>
            ) : (
              <>
                {tab === "Dashboard" && <OverviewTab dbRecords={dbRecords} C={C} />}
                {tab === "Call Records" && <CallRecordsTab dbRecords={dbRecords} C={C} />}
                {tab === "Student Records" && <StudentRecordsTab dbRecords={dbRecords} C={C} />}
                {tab === "Analytics" && <AnalyticsTab dbRecords={dbRecords} C={C} />}
                {tab === "Settings" && <SettingsTab C={C} />}
              </>
            )}

          </div>
        </main>
      </div>

    </div>
  );
}