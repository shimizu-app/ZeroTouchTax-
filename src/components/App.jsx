import React, { useState,useEffect } from "react";
import { C, hd, bd, mono, FONT } from "../lib/theme";
import Login from "./Login";
import { Intake } from "./Intake";
import Side from "./Side";
import { Home } from "./Home";
import TasksPage from "./TasksPage";
import { BooksPage } from "./BooksPage";
import { DocsPage, PlanPage, ExportPage } from "./DocsPage";
import AuditPage from "./AuditPage";
import ConsultPage from "./ConsultPage";
import { FileBoxPage, InputPage } from "./InputPage";
import DocIssuePage from "./DocIssuePage";
import { Workspace, CommandPalette, NotificationPanel, SettingsPage, UploadModal } from "./Workspace";

export default function App() {
  const [scr, setScr] = useState("login");
  const [so, setSo] = useState(true);
  const [activeCompany, setActiveCompany] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const [goalMode, setGoalMode] = useState("general");
  const [cmdK, setCmdK] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  // Global ⌘K listener
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setCmdK(p => !p); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  if (scr === "login") return <Login onLogin={() => setScr("workspace")} />;
  if (scr === "workspace") return <Workspace onSelect={(id) => { setActiveCompany(id); setScr("home"); }} onNew={() => setScr("intake")} />;
  if (scr === "intake") return <Intake onDone={() => { setActiveCompany("new"); setScr("home"); }} />;
  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "#050508", padding: "0 0 0 0" }}>
      <link href={FONT} rel="stylesheet" />
      <Side scr={scr} setScr={(s) => { if (s === "workspace") { setScr("workspace"); return; } setScr(s); }} open={so} setOpen={setSo} onNotif={() => setNotifOpen(true)} onCmdK={() => setCmdK(true)} notifCount={8} />
      <div style={{ flex:1, overflow:"hidden", borderRadius:28, margin:"8px 8px 8px 0", position:"relative", background:C.bg, boxShadow:"inset 0 0 0 1px rgba(139,123,244,.04)" }}>
      {scr === "home" && <Home goTo={setScr} goalMode={goalMode} />}
      {scr === "tasks" && <TasksPage goTo={setScr} />}
      {scr === "books" && <BooksPage />}
      {scr === "filebox" && <FileBoxPage />}
      {scr === "docs" && <DocsPage />}
      {scr === "export" && <ExportPage />}
      {scr === "issue" && <DocIssuePage />}
      {scr === "plan" && <PlanPage />}
      {scr === "audit" && <AuditPage />}
      {scr === "consult" && <ConsultPage goalMode={goalMode} setGoalMode={setGoalMode} />}
      {scr === "input" && <InputPage />}
      {scr === "settings" && <SettingsPage />}

      </div>

      {/* ── Command Palette ── */}
      <CommandPalette open={cmdK} onClose={() => setCmdK(false)} onNavigate={(s) => { setScr(s); setCmdK(false); }} />

      {/* ── Notification Panel ── */}
      <NotificationPanel open={notifOpen} onClose={() => setNotifOpen(false)} goTo={setScr} />

      {/* ── Floating Upload Button ── */}
      {scr !== "input" && <Mag onClick={() => setScr("input")}
        s={{ position: "fixed", bottom: 28, right: 28, height: 48, borderRadius: 100,
          padding: "0 24px 0 18px",
          background: "rgba(139,123,244,.12)", color: "#C4B8FF", border: "1px solid rgba(139,123,244,.3)", border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", gap: 8,
          boxShadow: "0 4px 10px rgba(0,0,0,.12), 0 0 32px rgba(255,255,255,.22), 0 0 72px rgba(255,255,255,.09)",
          zIndex: 900, fontFamily: bd, fontSize: 12, fontWeight: 600, letterSpacing: ".02em" }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
        入力
      </Mag>}
    </div>
  );
}
