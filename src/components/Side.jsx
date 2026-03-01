import React, { useState } from "react";
import { C, hd, bd, mono } from "../lib/theme";
import { Mag } from "./ui";

function Side({ scr, setScr, open, setOpen, onNotif, onCmdK, notifCount }) {
  const top = [{ id: "workspace", l: "顧客一覧", icon: "grid" }];
  const navIcons = {
    home: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12l9-8 9 8"/><path d="M5 10v10a1 1 0 001 1h3v-6h6v6h3a1 1 0 001-1V10"/></svg>,
    tasks: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>,
    books: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>,
    plan: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="4"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>,
    docs: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8"/></svg>,
    export: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2h9l5 5v13a2 2 0 01-2 2H6a2 2 0 01-2-2V4a2 2 0 012-2z"/><path d="M14 2v6h6"/><path d="M9 15l3-3 3 3"/><path d="M12 12v6"/></svg>,
    audit: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/></svg>,
    consult: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>,
    input: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>,
    filebox: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/><path d="M12 11v6M9 14h6"/></svg>,
    issue: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/><path d="M12 18v-6M9 15l3-3 3 3"/></svg>,
  };
  const nav = [
    { id: "home", l: "ホーム" },
    { id: "tasks", l: "タスク" },
    { id: "books", l: "仕訳帳" },
    { id: "filebox", l: "ファイルボックス" },
    { id: "docs", l: "申告書" },
    { id: "export", l: "資料作成" },
    { id: "issue", l: "書類発行" },
    { id: "plan", l: "スケジュール" },
    { id: "audit", l: "書類チェック" },
    { id: "consult", l: "財務エージェント" },
    { id: "input", l: "アップロード" },
  ];
  return (
    <div style={{ width: open ? 240 : 72, minWidth: open ? 240 : 72, height: "100vh", background: "rgba(12,14,22,.92)", backdropFilter: "blur(24px)", borderRight: "none", display: "flex", flexDirection: "column", transition: "all .4s cubic-bezier(.16,1,.3,1)", fontFamily: bd, borderTopRightRadius: 28, borderBottomRightRadius: 28, boxShadow: "4px 0 20px rgba(0,0,0,.3), 1px 0 0 rgba(139,123,244,.06)" }}>
      <div style={{ padding: open ? "20px 18px" : "20px 0", display: "flex", alignItems: "center", justifyContent: open ? "flex-start" : "center", gap: 10, borderBottom: `1px solid ${C.border}` }}>
        {/* Circuit Z mark */}
        <div style={{ flexShrink: 0, filter: "drop-shadow(0 0 8px rgba(168,155,255,.7)) drop-shadow(0 0 20px rgba(139,123,244,.35))" }}>
          <svg width="36" height="36" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="cg" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#DDD6FF"/>
                <stop offset="100%" stopColor="#7B6AF0"/>
              </linearGradient>
              <filter id="cf" x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur stdDeviation="2.5" result="b"/>
                <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
            </defs>
            <rect x="8" y="8" width="84" height="84" rx="20" stroke="url(#cg)" strokeWidth=".8" strokeOpacity=".25" fill="rgba(139,123,244,.06)"/>
            <line x1="26" y1="30" x2="54" y2="30" stroke="url(#cg)" strokeWidth="5" strokeLinecap="round" filter="url(#cf)"/>
            <line x1="62" y1="30" x2="74" y2="30" stroke="url(#cg)" strokeWidth="5" strokeLinecap="round" filter="url(#cf)"/>
            <line x1="74" y1="30" x2="26" y2="70" stroke="url(#cg)" strokeWidth="5" strokeLinecap="round" filter="url(#cf)"/>
            <line x1="26" y1="70" x2="38" y2="70" stroke="url(#cg)" strokeWidth="5" strokeLinecap="round" filter="url(#cf)"/>
            <line x1="46" y1="70" x2="74" y2="70" stroke="url(#cg)" strokeWidth="5" strokeLinecap="round" filter="url(#cf)"/>
            <circle cx="54" cy="30" r="4" fill="none" stroke="#A89BFF" strokeWidth="2" filter="url(#cf)"/>
            <circle cx="62" cy="30" r="4" fill="none" stroke="#A89BFF" strokeWidth="2" filter="url(#cf)"/>
            <circle cx="38" cy="70" r="4" fill="none" stroke="#A89BFF" strokeWidth="2" filter="url(#cf)"/>
            <circle cx="46" cy="70" r="4" fill="none" stroke="#A89BFF" strokeWidth="2" filter="url(#cf)"/>
            <circle cx="26" cy="30" r="5" fill="#EDE8FF" filter="url(#cf)"/>
            <circle cx="74" cy="30" r="5" fill="#EDE8FF" filter="url(#cf)"/>
            <circle cx="26" cy="70" r="5" fill="#EDE8FF" filter="url(#cf)"/>
            <circle cx="74" cy="70" r="5" fill="#EDE8FF" filter="url(#cf)"/>
          </svg>
        </div>
        {open && (
          <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <span style={{ fontSize: 13, color: "#fff", fontWeight: 700, letterSpacing: "-.01em", fontFamily: hd, textShadow: "0 0 12px rgba(196,184,255,.4)", lineHeight: 1 }}>Zero Touch Tax</span>
            <span style={{ fontSize: 8, color: "rgba(168,155,255,.5)", fontWeight: 500, letterSpacing: ".22em", textTransform: "uppercase", fontFamily: mono }}>AI Financial Agent</span>
          </div>
        )}
      </div>

      {/* Top: Workspace */}
      <div style={{ padding: "16px 0 8px" }}>
        {open && <div style={{ padding: "0 24px 8px", fontSize: 9, color: C.textMut, fontWeight: 500, letterSpacing: ".18em", textTransform: "uppercase" }}>ワークスペース</div>}
        {top.map(it => { const a = scr === it.id;
          return <button key={it.id} type="button" onClick={() => setScr(it.id)} style={{ display: "flex", alignItems: "center", gap: 12, width: open ? "calc(100% - 20px)" : "calc(100% - 12px)", margin: open ? "2px 10px" : "2px 6px", padding: open ? "11px 16px" : "11px 0", justifyContent: open ? "flex-start" : "center", cursor: "pointer", border: a ? "1.5px solid rgba(255,255,255,.22)" : "1.5px solid transparent", borderRadius: 14, background: a ? "rgba(255,255,255,.06)" : "transparent", color: a ? "#fff" : C.textSec, fontSize: 11, fontFamily: bd, fontWeight: a ? 600 : 400, transition: "all .25s", letterSpacing: ".01em", boxShadow: a ? "0 0 18px rgba(255,255,255,.25), 0 0 40px rgba(255,255,255,.1), inset 0 0 20px rgba(255,255,255,.04)" : "none", filter: a ? "drop-shadow(0 0 8px rgba(255,255,255,.3))" : "none" }}>
            <span style={{ color: a ? "#fff" : "rgba(255,255,255,.55)", filter:`drop-shadow(0 0 ${a?10:6}px rgba(255,255,255,${a?.5:.3})) drop-shadow(0 0 ${a?24:14}px rgba(255,255,255,${a?.2:.1}))` }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg></span>
            {open && <span style={{ textShadow: a ? "0 0 12px rgba(255,255,255,.8), 0 0 28px rgba(255,255,255,.4)" : "none", transition: "text-shadow .25s" }}>{it.l}</span>}
          </button>; })}
      </div>

      <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(139,123,244,.08), transparent)", margin: "4px 16px" }} />

      {/* Navigation */}
      <div style={{ padding: "12px 0", flex: 1 }}>
        {open && <div style={{ padding: "0 24px 8px", fontSize: 9, color: C.textMut, fontWeight: 500, letterSpacing: ".18em", textTransform: "uppercase" }}>クライアント</div>}
        {nav.map(it => { const a = scr === it.id;
          return <button key={it.id} type="button" onClick={() => setScr(it.id)} style={{ display: "flex", alignItems: "center", gap: 12, width: open ? "calc(100% - 20px)" : "calc(100% - 12px)", margin: open ? "2px 10px" : "2px 6px", padding: open ? "10px 16px" : "10px 0", justifyContent: open ? "flex-start" : "center", cursor: "pointer", border: a ? "1.5px solid rgba(255,255,255,.22)" : "1.5px solid transparent", borderRadius: 14, background: a ? "rgba(255,255,255,.06)" : "transparent", color: a ? "#fff" : C.textSec, fontSize: 12, fontFamily: bd, fontWeight: a ? 600 : 400, transition: "all .25s", letterSpacing: ".01em", boxShadow: a ? "0 0 18px rgba(255,255,255,.25), 0 0 40px rgba(255,255,255,.1), inset 0 0 20px rgba(255,255,255,.04)" : "none", filter: a ? "drop-shadow(0 0 8px rgba(255,255,255,.3))" : "none" }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: a ? "rgba(255,255,255,.08)" : "rgba(255,255,255,.03)", border: `1px solid ${a ? "rgba(255,255,255,.25)" : "rgba(255,255,255,.06)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: a ? "#fff" : "rgba(255,255,255,.55)", boxShadow: a ? "0 0 16px rgba(255,255,255,.4), 0 0 36px rgba(255,255,255,.15)" : "0 0 10px rgba(255,255,255,.1)", transition: "all .25s" }}>{navIcons[it.id]}</div>{open && <span style={{ textShadow: a ? "0 0 12px rgba(255,255,255,.8), 0 0 28px rgba(255,255,255,.4)" : "none", transition: "text-shadow .25s" }}>{it.l}</span>}
          </button>; })}
      </div>

      <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(139,123,244,.08), transparent)", margin: "4px 16px" }} />

      {/* Bottom actions */}
      <div style={{ padding: "8px 0" }}>
        {/* ⌘K Search */}
        <button type="button" onClick={onCmdK} style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", padding: open ? "10px 24px" : "10px 0", justifyContent: open ? "flex-start" : "center", cursor: "pointer", border: "none", borderRadius: 0, background: "transparent", color: C.textMut, fontSize: 12, fontFamily: bd, transition: "all .2s" }}>
          <span style={{ width: 20, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,.5)", filter: "drop-shadow(0 0 6px rgba(255,255,255,.3)) drop-shadow(0 0 14px rgba(255,255,255,.1))" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          </span>
          {open && <><span style={{ flex: 1, textAlign: "left" }}>検索</span><kbd style={{ padding: "2px 6px", borderRadius: 12, border: `1px solid ${C.border}`, fontSize: 9, fontFamily: mono, color: C.textMut }}>⌘K</kbd></>}
        </button>

        {/* Notifications */}
        <button type="button" onClick={onNotif} style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", padding: open ? "10px 24px" : "10px 0", justifyContent: open ? "flex-start" : "center", cursor: "pointer", border: "none", borderRadius: 0, background: "transparent", color: C.textMut, fontSize: 12, fontFamily: bd, transition: "all .2s", position: "relative" }}>
          <span style={{ width: 20, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", color: "rgba(255,255,255,.5)", filter: "drop-shadow(0 0 6px rgba(255,255,255,.3)) drop-shadow(0 0 14px rgba(255,255,255,.1))" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/></svg>
            {notifCount > 0 && <span style={{ position: "absolute", top: -4, right: -6, width: 14, height: 14, borderRadius: 16, background: C.b1, fontSize: 8, fontWeight: 700, color: "#060610", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 8px rgba(255,255,255,.5), 0 0 20px rgba(255,255,255,.2)" }}>{notifCount}</span>}
          </span>
          {open && <span style={{ flex: 1, textAlign: "left" }}>通知</span>}
        </button>

        {/* Settings */}
        {[{ id: "settings", l: "設定" }].map(it => { const a = scr === it.id;
          return <button key={it.id} type="button" onClick={() => setScr(it.id)} style={{ display: "flex", alignItems: "center", gap: 12, width: open ? "calc(100% - 20px)" : "calc(100% - 12px)", margin: open ? "2px 10px" : "2px 6px", padding: open ? "9px 16px" : "9px 0", justifyContent: open ? "flex-start" : "center", cursor: "pointer", border: a ? "1.5px solid rgba(139,123,244,.35)" : "1.5px solid transparent", borderRadius: 14, background: a ? "rgba(139,123,244,.06)" : "transparent", color: a ? "#fff" : C.textMut, fontSize: 12, fontFamily: bd, fontWeight: a ? 600 : 400, transition: "all .25s", boxShadow: a ? "0 0 28px rgba(255,255,255,.2), 0 0 64px rgba(255,255,255,.08)" : "none" }}>
            <span style={{ width: 20, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,.5)", filter: "drop-shadow(0 0 6px rgba(255,255,255,.3)) drop-shadow(0 0 14px rgba(255,255,255,.1))" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
            </span>
            {open && <span>{it.l}</span>}
          </button>; })}
      </div>

      <button type="button" onClick={() => setOpen(!open)} style={{ padding: 18, border: "none", background: "transparent", color: C.textMut, fontSize: 16, cursor: "pointer", borderTop: `1px solid ${C.borderLt}`, fontFamily: bd }}>{open ? "←" : "→"}</button>
    </div>
  );
}

/* ═══ JOURNAL LEDGER ═══ */

export default Side;
