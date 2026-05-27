// src/utils/theme.js

export const DARK = {
  bg: "#02050E", // Deep space black
  panel: "rgba(10, 15, 30, 0.5)", // Transparent glass
  panelAlt: "rgba(20, 30, 50, 0.7)",
  border: "rgba(0, 240, 255, 0.2)", // Glowing cyan border
  accent: "#00F0FF", // Neon Cyan
  accent2: "#BD00FF", // Neon Purple
  accent3: "#39FF14", // Toxic Green
  warn: "#FF0055", // Neon Pink/Red
  muted: "#3A4B6B",
  text: "#FFFFFF",
  textDim: "#829AB1",
  inputBg: "#050914", 
  shadow: "0 0 20px rgba(0, 240, 255, 0.15)", // Cyan glow
  green: "#39FF14",
  red: "#FF0055",
};

export const LIGHT = {
  bg:"#EFF3FB", panel:"#FFFFFF", panelAlt:"#F5F7FC", border:"#D8E0F0",
  accent:"#0088BB", accent2:"#5540CC", accent3:"#009955", warn:"#D94A15",
  muted:"#96A6C0", text:"#141E33", textDim:"#4E6080",
  inputBg:"#F5F7FC", shadow:"0 4px 20px rgba(20,40,100,.09)",
  green:"#009955", red:"#CC2233",
};

export function getTheme(isDark) { 
  return isDark ? DARK : LIGHT; 
}

export function fmtDur(s) {
  if (!s) return "00:00";
  const m = Math.floor(s/60);
  const sec = s%60;
  return `${m < 10 ? '0'+m : m}:${sec < 10 ? '0'+sec : sec}`;
}