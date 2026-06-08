// src/App.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { getTheme } from "./utils/theme";
import { ThemeToggle } from "./components/UI";
import Sidebar from "./components/Sidebar"; 
import OverviewTab from "./pages/OverviewTab";
import CallRecordsTab from "./pages/CallRecordsTab"; 
import AnalyticsTab from "./pages/AnalyticsTab";     
import SettingsTab from "./pages/SettingsTab";  
import StudentRecordsTab from "./pages/StudentRecordsTab";       

export default function App() {
  const [isDark, setIsDark] = useState(false); 
  const [tab, setTab] = useState("Dashboard");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [dbRecords, setDbRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // ─── MOBILE RESPONSIVENESS TRACKING ───
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ─── AUTHENTICATION STATE ───
  const [token, setToken] = useState(localStorage.getItem('adminToken') || '');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const C = getTheme(isDark);

  useEffect(() => {
    async function fetchCalls() {
      if (!token) return; 
      try {
        // 👈 FIX 1: Added a timestamp to the URL! 
        // This forces the browser to fetch fresh data from MongoDB instead of using old cached data.
        const timestamp = new Date().getTime();
        const response = await axios.get(`http://localhost:5000/api/calls?t=${timestamp}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const formattedData = response.data.map(call => ({
          // 👈 FIX 2: Added `call._id` so React perfectly matches the MongoDB ID
          id: call._id || call.callId || Math.random().toString(),
          staff: call.counselorName || call.staffName || "Unknown",
          phone: call.callerNumber || "Unknown",
          type: call.callType || "Inbound",
          studentName: call.studentName || "Processing...",
          course: call.course || "N/A",
          city: call.city || "N/A",
          visitPrediction: call.visitPrediction || "Processing...",
          remark: call.remark || "N/A",
          starRating: call.starRating || "⏳",
          
          // 👈 FIX 3: Linked 'outcome' to 'visitPrediction' so the table updates correctly!
          outcome: call.outcome || call.visitPrediction || "Pending",
          
          timestamp: call.createdAt,
          dateStr: call.createdAt ? new Date(call.createdAt).toISOString().slice(0, 10) : "Unknown",
          localFilePath: call.localFilePath 
        }));

        setDbRecords(formattedData);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching from MongoDB:", error);
        if (error.response?.status === 401 || error.response?.status === 403) {
          handleLogout(); 
        }
      }
    }

    fetchCalls();
    const interval = setInterval(fetchCalls, 4000); 
    return () => clearInterval(interval);
  }, [token]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/login', { 
        username: username.toLowerCase().trim(), 
        password 
      });
      setToken(res.data.token);
      localStorage.setItem('adminToken', res.data.token);
      setLoginError('');
      setIsLoading(true); 
    } catch (err) {
      setLoginError('Invalid username or password');
    }
  };

  const handleLogout = () => {
    setToken('');
    localStorage.removeItem('adminToken');
    setDbRecords([]);
  };

  // ─── LOGIN SCREEN ───
  if (!token) {
    return (
      <div style={{ display: "flex", height: "100vh", background: C.bg, alignItems: "center", justifyContent: "center", fontFamily: "'Inter', sans-serif" }}>
        <form onSubmit={handleLogin} style={{ background: C.panel, padding: 40, borderRadius: 16, border: `1px solid ${C.border}`, boxShadow: C.shadow, width: 350, display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ textAlign: "center", fontSize: 40, marginBottom: -10 }}>🎓</div>
          <h2 style={{ textAlign: "center", color: C.text, margin: "0 0 10px 0" }}>AdmissionsAI</h2>
          
          <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} autoCapitalize="none" autoCorrect="off" style={{ padding: 12, borderRadius: 8, border: `1px solid ${C.border}`, background: C.bg, color: C.text, outline: "none" }} />
          
          {/* 👈 NEW: Simple Password Input */}
          <input 
            type={showPassword ? "text" : "password"} 
            placeholder="Password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            style={{ padding: 12, borderRadius: 8, border: `1px solid ${C.border}`, background: C.bg, color: C.text, outline: "none" }} 
          />
          
          {/* 👈 NEW: Simple Text Button below the input */}
          <button 
            type="button" 
            onClick={() => setShowPassword(!showPassword)}
            style={{ background: "transparent", border: "none", color: C.textDim, textAlign: "right", marginTop: -8, cursor: "pointer", fontSize: 13, fontWeight: 600, padding: 0 }}
          >
            {showPassword ? "Hide Password" : "Show Password"}
          </button>
          
          {loginError && <div style={{ color: C.warn, fontSize: 13, textAlign: "center", fontWeight: 600 }}>{loginError}</div>}
          
          <button type="submit" style={{ background: "#0284C7", color: "#fff", border: "none", padding: 12, borderRadius: 8, fontWeight: 700, cursor: "pointer", marginTop: 8 }}>Secure Login</button>
        </form>
      </div>
    );
  }

  // ─── MAIN APP DASHBOARD ───
  return (
    <div style={{ display: "flex", height: "100vh", background: C.bg, color: C.text, fontFamily: "'Inter', sans-serif", transition: "background 0.3s, color 0.3s", overflow: "hidden" }}>
      
      <Sidebar 
        tab={tab} 
        setTab={(t) => { setTab(t); setMobileMenuOpen(false); }} 
        isCollapsed={isSidebarCollapsed} 
        setIsCollapsed={setIsSidebarCollapsed} 
        C={C} 
        isMobile={isMobile}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        
        <header style={{ borderBottom: "1px solid " + C.border, padding: "0 24px", display: "flex", alignItems: "center", justifyContent: isMobile ? "space-between" : "flex-end", height: 64, background: C.panel, flexShrink: 0 }}>
          
          {isMobile && (
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button onClick={() => setMobileMenuOpen(true)} style={{ background: "transparent", border: "none", color: C.text, fontSize: 24, cursor: "pointer", padding: 0 }}>☰</button>
              <div style={{ fontWeight: 800, fontSize: 16 }}>AdmissionsAI</div>
            </div>
          )}

          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            {!isMobile && <span style={{ fontSize: 13, fontWeight: 700, color: C.textDim }}>Sigma Admin Portal</span>}
            <ThemeToggle isDark={isDark} toggle={() => setIsDark(!isDark)} C={C} />
            <button onClick={handleLogout} style={{ background: "transparent", border: `1px solid ${C.border}`, color: C.text, padding: "4px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Logout</button>
          </div>
        </header>

        <main style={{ flex: 1, overflowY: "auto", padding: isMobile ? "16px" : "32px 24px" }}>
          <div style={{ maxWidth: 1400, margin: "0 auto" }}>
            {isLoading ? (
              <div style={{display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", marginTop: 100, gap: 16}}>
                <div style={{ width: 40, height: 40, border: `4px solid ${C.border}`, borderTop: `4px solid #0284C7`, borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                <div style={{ color: C.muted, fontSize: 15, fontWeight: 600 }}>Connecting to Database...</div>
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
              </div>
            ) : (
              <>
                {tab === "Dashboard" && <OverviewTab dbRecords={dbRecords} C={C} isMobile={isMobile} />}
                {tab === "Call Records" && <CallRecordsTab dbRecords={dbRecords} C={C} isMobile={isMobile} />}
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