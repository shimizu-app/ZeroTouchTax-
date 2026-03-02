import React, { useState, useEffect, useRef } from "react";
import { C, hd, bd, mono, FONT } from "../lib/theme";
import { Rv, Mag, Card3, PageShell, BtnApprove } from "./ui";
import { ClientGlossyButton } from "./InputPage";

const Toggle = ({ on, onClick }) => (
  <div onClick={onClick} style={{ width:44, height:24, borderRadius:12, background: on ? "rgba(139,123,244,.5)" : "rgba(255,255,255,.08)", border: on ? "1px solid rgba(139,123,244,.6)" : "1px solid rgba(255,255,255,.12)", cursor:"pointer", position:"relative", transition:"all .25s cubic-bezier(.16,1,.3,1)", flexShrink:0 }}>
    <div style={{ position:"absolute", top:3, left: on ? 23 : 3, width:16, height:16, borderRadius:"50%", background: on ? "#A89BFF" : "#6A6A84", transition:"all .25s cubic-bezier(.16,1,.3,1)", boxShadow: on ? "0 0 8px rgba(168,155,255,.5)" : "none" }} />
  </div>
);

function Workspace({ onSelect, onNew }) {
  const [hover, setHover] = useState(null);
  const companies = [];

  return (
    <div style={{ width: "100vw", height: "100vh", background: C.bg, fontFamily: bd, overflow: "auto" }}>
      <link href={FONT} rel="stylesheet" />
      {/* Giant watermark */}
      <div style={{ position: "fixed", right: -60, top: "50%", transform: "translateY(-50%)", fontFamily: hd, fontSize: "min(24vw, 320px)", color: "#8B7BF4", opacity: .03, lineHeight: .85, pointerEvents: "none", letterSpacing: "-.05em", whiteSpace: "nowrap", textShadow: "0 0 80px rgba(139,123,244,.08)" }}>Work<br/>space</div>

      {/* Top bar */}
      <div style={{ padding: "24px 48px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ fontFamily: hd, fontSize: 32, color: "#A89BFF", textShadow: "0 0 14px rgba(168,155,255,.4)" }}>Z.</div>
          <div>
            <div style={{ fontFamily: hd, fontSize: 22, color: "#E0DAFF", letterSpacing: "-.02em", textShadow: "0 0 10px rgba(168,155,255,.2)" }}>Zeirishi</div>
            <div style={{ fontSize: 9, color: "rgba(168,155,255,.35)", fontWeight: 500, letterSpacing: ".14em", textTransform: "uppercase" }}>Tax Intelligence Platform</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(139,123,244,.12)", border: "1px solid rgba(139,123,244,.3)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 12px rgba(139,123,244,.2)" }}>
            <span style={{ color: "#C4B8FF", fontSize: 14, fontWeight: 800 }}>YT</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "20px 48px 60px", position: "relative", zIndex: 1 }}>
        <Rv>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 40 }}>
            <div>
              <div style={{ fontSize: 10, color: "rgba(168,155,255,.4)", fontWeight: 700, letterSpacing: ".18em", textTransform: "uppercase", marginBottom: 6 }}>Dashboard</div>
              <div style={{ fontFamily: hd, fontSize: 48, color: "#E0DAFF", letterSpacing: "-.04em", textShadow: "0 0 30px rgba(168,155,255,.3), 0 0 60px rgba(139,123,244,.12)" }}>クライアント一覧</div>
            </div>
            <Mag onClick={onNew} s={{ padding: "14px 32px", border: "1.5px solid rgba(139,123,244,.4)", borderRadius: 100, background: "rgba(139,123,244,.08)", color: "#C4B8FF", fontSize: 12, cursor: "pointer", fontFamily: bd, fontWeight: 700, letterSpacing: ".06em", display: "flex", alignItems: "center", gap: 8, boxShadow: "0 0 16px rgba(139,123,244,.3), 0 0 40px rgba(139,123,244,.1)", textShadow: "0 0 10px rgba(168,155,255,.4)" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#A89BFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
              新しい企業を追加
            </Mag>
          </div>
        </Rv>

        {/* Stats bar */}
        <Rv d={80}>
          <div style={{ display: "flex", gap: 32, marginBottom: 36 }}>
            {[{ l: "全体", v: companies.length, c: "#A89BFF" }, { l: "要対応", v: 1, c: C.b1 }, { l: "申告準備中", v: 1, c: C.b3 }, { l: "完了", v: 1, c: C.b4 }].map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: s.c, boxShadow: `0 0 8px ${s.c}60, 0 0 18px ${s.c}25` }} />
                <span style={{ fontSize: 12, color: "rgba(196,184,255,.45)", fontWeight: 600 }}>{s.l}</span>
                <span style={{ fontFamily: hd, fontSize: 24, color: "#E0DAFF", textShadow: "0 0 8px rgba(168,155,255,.2)" }}>{s.v}</span>
              </div>
            ))}
          </div>
        </Rv>

        {/* Card grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
          {companies.map((co, i) => (
            <Rv key={co.id} d={120 + i * 80}>
              <div onClick={() => onSelect(co.id)}
                onMouseEnter={() => setHover(co.id)} onMouseLeave={() => setHover(null)}
                style={{ padding: "28px 28px 24px", border: `1px solid ${hover === co.id ? "rgba(139,123,244,.35)" : "rgba(255,255,255,.06)"}`, borderRadius: 20, background: hover === co.id ? "rgba(139,123,244,.06)" : "rgba(255,255,255,.02)", cursor: "pointer", transition: "all .35s cubic-bezier(.16,1,.3,1)", boxShadow: hover === co.id ? "0 0 30px rgba(139,123,244,.15), 0 0 60px rgba(139,123,244,.06)" : "none" }}>
                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 14, background: hover === co.id ? "rgba(139,123,244,.15)" : "rgba(139,123,244,.06)", border: `1px solid ${hover === co.id ? "rgba(139,123,244,.3)" : "rgba(139,123,244,.1)"}`, display: "flex", alignItems: "center", justifyContent: "center", transition: "all .3s", boxShadow: hover === co.id ? "0 0 14px rgba(139,123,244,.25)" : "none" }}>
                    <span style={{ fontFamily: hd, fontSize: 20, color: hover === co.id ? "#C4B8FF" : "#A89BFF", transition: "all .3s", textShadow: hover === co.id ? "0 0 8px rgba(168,155,255,.4)" : "none" }}>{co.name[0]}</span>
                  </div>
                  <span style={{ fontSize: 9, color: co.statusCol, fontWeight: 800, letterSpacing: ".08em", padding: "4px 12px", border: `1.5px solid ${co.statusCol}40`, borderRadius: 100, background: `${co.statusCol}0a`, textShadow: `0 0 8px ${co.statusCol}40` }}>{co.status}</span>
                </div>
                {/* Company info */}
                <div style={{ fontFamily: hd, fontSize: 22, color: "#E0DAFF", letterSpacing: "-.02em", marginBottom: 6, lineHeight: 1.2, textShadow: "0 0 10px rgba(168,155,255,.15)" }}>{co.name}</div>
                <div style={{ fontSize: 12, color: "#A89BFF", fontWeight: 600, marginBottom: 16, textShadow: "0 0 6px rgba(168,155,255,.2)" }}>{co.industry} — {co.sub}</div>
                {/* Meta */}
                <div style={{ display: "flex", gap: 20, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,.04)" }}>
                  {[{ l: "売上規模", v: co.revenue }, { l: "拠点", v: co.pref }, { l: "更新日", v: co.updated }].map((m, mi) => (
                    <div key={mi}>
                      <div style={{ fontSize: 9, color: "rgba(168,155,255,.3)", fontWeight: 500, letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 3 }}>{m.l}</div>
                      <div style={{ fontSize: 12, color: "rgba(224,218,255,.7)", fontWeight: 600 }}>{m.v}</div>
                    </div>
                  ))}
                </div>
                {/* Hover indicator */}
                <div style={{ height: 2, background: "linear-gradient(90deg, #8B7BF4, #C4B8FF)", marginTop: 20, borderRadius: 2, width: hover === co.id ? "100%" : "0%", transition: "width .4s cubic-bezier(.16,1,.3,1)", boxShadow: hover === co.id ? "0 0 10px rgba(139,123,244,.4)" : "none" }} />
              </div>
            </Rv>
          ))}

          {/* Add new card */}
          <Rv d={120 + companies.length * 80}>
            <div onClick={onNew} onMouseEnter={() => setHover("new")} onMouseLeave={() => setHover(null)}
              style={{ border: `2px dashed ${hover === "new" ? "rgba(139,123,244,.4)" : "rgba(255,255,255,.06)"}`, borderRadius: 20, background: hover === "new" ? "rgba(139,123,244,.04)" : "transparent", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 28px", cursor: "pointer", transition: "all .35s cubic-bezier(.16,1,.3,1)", minHeight: 220, boxShadow: hover === "new" ? "0 0 30px rgba(139,123,244,.1)" : "none" }}>
              <div style={{ width: 48, height: 48, borderRadius: "50%", border: `1.5px solid ${hover === "new" ? "rgba(139,123,244,.4)" : "rgba(255,255,255,.08)"}`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16, transition: "all .3s", boxShadow: hover === "new" ? "0 0 16px rgba(139,123,244,.25)" : "none" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={hover === "new" ? "#A89BFF" : "rgba(168,155,255,.3)"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transition: "all .3s" }}><path d="M12 5v14M5 12h14"/></svg>
              </div>
              <div style={{ fontSize: 14, color: hover === "new" ? "#C4B8FF" : "rgba(196,184,255,.4)", fontWeight: 700, transition: "all .3s", textShadow: hover === "new" ? "0 0 10px rgba(168,155,255,.3)" : "none" }}>新しい企業を追加</div>
              <div style={{ fontSize: 11, color: "rgba(168,155,255,.25)", marginTop: 4 }}>インテークを開始</div>
            </div>
          </Rv>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════ COMMAND PALETTE (⌘K) ════════════════════════════════ */
function CommandPalette({ open, onClose, onNavigate }) {
  const [query, setQuery] = useState("");
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef(null);

  const allItems = [
    { id:"nav-home", type:"nav", label:"ダッシュボード", sub:"KPI・チャート・タスク概要", icon:"home", action:()=>onNavigate("home") },
    { id:"nav-tasks", type:"nav", label:"タスク", sub:"AI仕訳・締切・未処理タスク", icon:"tasks", action:()=>onNavigate("tasks") },
    { id:"nav-books", type:"nav", label:"仕訳帳", sub:"仕訳帳・経費内訳", icon:"books", action:()=>onNavigate("books") },
    { id:"nav-filebox", type:"nav", label:"ファイルボックス", sub:"証憑保管・電帳法対応・検索", icon:"filebox", action:()=>onNavigate("filebox") },
    { id:"nav-docs", type:"nav", label:"申告書", sub:"確定申告・法人税・消費税・決算書", icon:"docs", action:()=>onNavigate("docs") },
    { id:"nav-export", type:"nav", label:"資料作成", sub:"書類選択・PDF出力・一括ダウンロード", icon:"export", action:()=>onNavigate("export") },
    { id:"nav-issue", type:"nav", label:"書類発行", sub:"請求書・見積書・納品書・領収書", icon:"issue", action:()=>onNavigate("issue") },
    { id:"nav-plan", type:"nav", label:"スケジュール", sub:"年間タイムライン・締切管理", icon:"plan", action:()=>onNavigate("plan") },
    { id:"nav-audit", type:"nav", label:"書類チェック", sub:"自動チェック・問題検出・電帳法", icon:"audit", action:()=>onNavigate("audit") },
    { id:"nav-consult", type:"nav", label:"財務エージェント", sub:"AIが財務データを分析・提案", icon:"consult", action:()=>onNavigate("consult") },
    { id:"nav-input", type:"nav", label:"アップロード", sub:"レシート・請求書・CSV取込", icon:"input", action:()=>onNavigate("input") },
    { id:"nav-settings", type:"nav", label:"設定", sub:"ユーザー・通知・連携・表示", icon:"settings", action:()=>onNavigate("settings") },
    { id:"nav-workspace", type:"nav", label:"クライアント一覧", sub:"企業の切替・追加", icon:"workspace", action:()=>onNavigate("workspace") },
    { id:"act-upload", type:"action", label:"書類をアップロード", sub:"レシート・請求書を取り込む", icon:"upload", action:()=>onNavigate("input") },
    { id:"act-journal", type:"action", label:"仕訳を追加", sub:"手動で仕訳を登録", icon:"plus", action:()=>onNavigate("books") },
    { id:"act-consult-tax", type:"action", label:"節税について相談", sub:"AIが節税施策を分析", icon:"ai", action:()=>onNavigate("consult") },
    { id:"rec-1", type:"recent", label:"最近の操作はまだありません", sub:"", icon:"entry" },
  ];

  const filtered = query.trim() === "" ? allItems : allItems.filter(item => {
    const q = query.toLowerCase();
    return item.label.toLowerCase().includes(q) || item.sub.toLowerCase().includes(q);
  });

  useEffect(() => {
    if (open && inputRef.current) { inputRef.current.focus(); setQuery(""); setSelectedIdx(0); }
  }, [open]);
  useEffect(() => { setSelectedIdx(0); }, [query]);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.key === "ArrowDown") { e.preventDefault(); setSelectedIdx(p => Math.min(p + 1, filtered.length - 1)); }
      else if (e.key === "ArrowUp") { e.preventDefault(); setSelectedIdx(p => Math.max(p - 1, 0)); }
      else if (e.key === "Enter" && filtered[selectedIdx]) { filtered[selectedIdx].action?.(); onClose(); }
      else if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, filtered, selectedIdx, onClose]);

  if (!open) return null;

  const typeLabel = { nav: "ページ", action: "アクション", recent: "最近の項目" };
  const typeColor = { nav: "rgba(139,123,244,.5)", action: "#8B7BF4", recent: "rgba(139,123,244,.3)" };
  const iconMap = {
    home: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 12l9-8 9 8"/><path d="M5 10v10a1 1 0 001 1h3v-6h6v6h3a1 1 0 001-1V10"/></svg>,
    tasks: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>,
    books: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>,
    docs: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/></svg>,
    plan: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="4" width="18" height="18" rx="4"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>,
    audit: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/></svg>,
    consult: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2"/></svg>,
    input: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>,
    settings: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9"/></svg>,
    workspace: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>,
    upload: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>,
    plus: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>,
    ai: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4"/></svg>,
    entry: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>,
    doc: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M9 15l2 2 4-4"/></svg>,
  };

  let lastType = null;

  return (
    <div style={{ position:"fixed", inset:0, zIndex:9999, display:"flex", justifyContent:"center", paddingTop:"12vh", fontFamily:bd }} onClick={(e) => { if(e.target===e.currentTarget) onClose(); }}>
      <div style={{ position:"absolute", inset:0, background:"rgba(5,5,5,.75)", backdropFilter:"blur(12px)" }} />
      <div style={{ position:"relative", width:560, maxWidth:"92vw", maxHeight:"65vh", display:"flex", flexDirection:"column", background:"rgba(14,14,22,.92)", backdropFilter:"blur(24px)", border:"1px solid rgba(139,123,244,.1)", borderRadius:26, boxShadow:"0 16px 48px rgba(0,0,0,.5), 0 0 0 1px rgba(139,123,244,.06)", overflow:"hidden" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, padding:"16px 20px", borderBottom:"1px solid rgba(139,123,244,.1)" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#A89BFF" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          <input ref={inputRef} value={query} onChange={e=>setQuery(e.target.value)} placeholder="ページ、アクション、仕訳を検索..."
            style={{ flex:1, border:"none", background:"transparent", color:"#E0DAFF", fontSize:15, fontFamily:bd, outline:"none", caretColor:"#A89BFF" }} />
          <kbd style={{ padding:"2px 6px", borderRadius:12, border:`1px solid ${C.border}`, fontSize:9, color:C.textMut, fontFamily:hd }}>ESC</kbd>
        </div>
        <div style={{ flex:1, overflow:"auto", padding:"8px 0" }}>
          {filtered.length === 0 && <div style={{ padding:"40px 20px", textAlign:"center", color:C.textMut, fontSize:13 }}>「{query}」に一致する結果がありません</div>}
          {filtered.map((item, i) => {
            const showHeader = item.type !== lastType;
            lastType = item.type;
            return (
              <div key={item.id}>
                {showHeader && <div style={{ padding:"8px 20px 4px", fontSize:9, color:C.textMut, fontWeight:500, letterSpacing:".12em", textTransform:"uppercase" }}>{typeLabel[item.type]}</div>}
                <div onClick={() => { item.action?.(); onClose(); }} onMouseEnter={() => setSelectedIdx(i)}
                  style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 18px", margin:"2px 8px", cursor:"pointer", borderRadius:14,
                    background: i===selectedIdx ? "rgba(139,123,244,.06)" : "transparent",
                    border: i===selectedIdx ? "1.5px solid rgba(139,123,244,.3)" : "1.5px solid transparent",
                    boxShadow: i===selectedIdx ? "0 0 24px rgba(255,255,255,.18), 0 0 56px rgba(255,255,255,.07)" : "none", transition:"all .1s" }}>
                  <div style={{ width:32, height:32, borderRadius:"50%", background:`${typeColor[item.type]}08`, border:`1px solid ${typeColor[item.type]}15`, display:"flex", alignItems:"center", justifyContent:"center", color:typeColor[item.type], flexShrink:0, boxShadow:`0 0 10px ${typeColor[item.type]}25, 0 0 22px ${typeColor[item.type]}10` }}>
                    {iconMap[item.icon]}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:13, fontWeight: i===selectedIdx?600:400, color: i===selectedIdx?"#fff":C.text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{item.label}</div>
                    <div style={{ fontSize:10, color:C.textMut, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", fontWeight:400 }}>{item.sub}</div>
                  </div>
                  {i===selectedIdx && <kbd style={{ padding:"2px 8px", borderRadius:12, border:`1px solid ${C.border}`, fontSize:9, color:C.textMut, fontFamily:hd, flexShrink:0 }}>↵</kbd>}
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ padding:"10px 20px", borderTop:`1px solid ${C.border}`, display:"flex", gap:16, fontSize:10, color:C.textMut }}>
          <span style={{ display:"flex", alignItems:"center", gap:4 }}><kbd style={{ padding:"1px 4px", borderRadius:10, border:`1px solid ${C.border}`, fontSize:8, fontFamily:hd }}>↑↓</kbd> 移動</span>
          <span style={{ display:"flex", alignItems:"center", gap:4 }}><kbd style={{ padding:"1px 4px", borderRadius:10, border:`1px solid ${C.border}`, fontSize:8, fontFamily:hd }}>↵</kbd> 選択</span>
          <span style={{ display:"flex", alignItems:"center", gap:4 }}><kbd style={{ padding:"1px 4px", borderRadius:10, border:`1px solid ${C.border}`, fontSize:8, fontFamily:hd }}>⌘K</kbd> 開閉</span>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════ NOTIFICATION PANEL ════════════════════════════════ */
function NotificationPanel({ open, onClose, goTo }) {
  const [filter, setFilter] = useState("all");
  const [dismissed, setDismissed] = useState([]);

  const notifications = [];

  const typeIcon = {
    urgent: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.b1} strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>,
    ai: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8B7BF4" strokeWidth="2.5"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4"/></svg>,
    success: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.b4} strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>,
    warning: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(139,123,244,.5)" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01"/></svg>,
    info: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.blue} strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>,
  };
  const typeBg = { urgent:"#E87070", ai:"#8B7BF4", success:"#7BE0A0", warning:"#FFB060", info:"#8B7BF4" };

  const visible = notifications.filter(n => !dismissed.includes(n.id)).filter(n => filter === "all" || n.type === filter);
  const unreadCount = notifications.filter(n => !dismissed.includes(n.id)).length;

  if (!open) return null;

  return (
    <div style={{ position:"fixed", inset:0, zIndex:9998, fontFamily:bd }} onClick={(e) => { if(e.target===e.currentTarget) onClose(); }}>
      <div style={{ position:"absolute", inset:0, background:"rgba(5,5,5,.5)" }} onClick={onClose} />
      <div style={{ position:"absolute", right:0, top:0, bottom:0, width:420, maxWidth:"95vw", background:"rgba(10,10,18,.92)", backdropFilter:"blur(24px)", borderLeft:"1px solid rgba(139,123,244,.08)", boxShadow:"-8px 0 30px rgba(0,0,0,.4), inset 1px 0 0 rgba(139,123,244,.05)", display:"flex", flexDirection:"column", animation:"slideInRight .25s cubic-bezier(.16,1,.3,1)" }}>
        <div style={{ padding:"24px 24px 16px", borderBottom:`1px solid ${C.border}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ fontFamily:hd, fontSize:18, color:"#fff" }}>通知</span>
            {unreadCount > 0 && <span style={{ background:C.b1, color:"#fff", fontSize:9, fontWeight:600, padding:"2px 8px", borderRadius:100 }}>{unreadCount}</span>}
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            {unreadCount > 0 && <button type="button" onClick={() => setDismissed(notifications.map(n=>n.id))} style={{ padding:"5px 12px", borderRadius:14, border:`1px solid ${C.border}`, background:"transparent", color:C.textMut, fontSize:10, fontWeight:500, cursor:"pointer", fontFamily:bd }}>すべて既読</button>}
            <button type="button" onClick={onClose} style={{ border:"none", background:"transparent", color:C.textMut, cursor:"pointer", padding:4 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
        </div>
        <div style={{ display:"flex", gap:4, padding:"12px 24px", borderBottom:`1px solid ${C.borderLt}` }}>
          {[["all","すべて"],["urgent","緊急"],["ai","AI"],["warning","警告"]].map(([id,l]) => (
            <button key={id} type="button" onClick={() => setFilter(id)}
              style={{ padding:"5px 12px", borderRadius:100, border:`1.5px solid ${filter===id ? "rgba(139,123,244,.35)" : C.border}`, background: filter===id ? "rgba(139,123,244,.06)" : "transparent", color: filter===id ? "#fff" : C.textMut, fontSize:10, fontWeight: filter===id ? 700 : 500, cursor:"pointer", fontFamily:bd, boxShadow: filter===id ? "0 0 28px rgba(255,255,255,.2), 0 0 64px rgba(255,255,255,.08)" : "none", transition:"all .2s" }}>
              {l}
            </button>
          ))}
        </div>
        <div style={{ flex:1, overflow:"auto" }}>
          {visible.length === 0 && (
            <div style={{ padding:"60px 24px", textAlign:"center" }}>
              <div style={{ fontSize:36, opacity:.1, marginBottom:12 }}>🔔</div>
              <div style={{ fontSize:13, color:C.textMut }}>通知はありません</div>
            </div>
          )}
          {visible.map(n => (
            <div key={n.id} style={{ padding:"16px 24px", borderBottom:`1px solid ${C.borderLt}`, cursor:"pointer", transition:"background .1s" }}
              onMouseEnter={e => e.currentTarget.style.background = `${C.blue}04`}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              onClick={() => { goTo(n.page); onClose(); }}>
              <div style={{ display:"flex", gap:12 }}>
                <div style={{ width:32, height:32, borderRadius:"50%", background:`${typeBg[n.type]}08`, border:`1px solid ${typeBg[n.type]}18`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:2, boxShadow:`0 0 12px ${typeBg[n.type]}30, 0 0 28px ${typeBg[n.type]}10` }}>
                  {typeIcon[n.type]}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:8 }}>
                    <span style={{ fontSize:13, fontWeight:600, color:"#fff" }}>{n.title}</span>
                    <span style={{ fontSize:9, color:C.textMut, flexShrink:0, marginTop:2 }}>{n.time}</span>
                  </div>
                  <div style={{ fontSize:11, color:C.textMut, lineHeight:1.5, marginTop:4 }}>{n.body}</div>
                </div>
                <button type="button" onClick={(e) => { e.stopPropagation(); setDismissed(p => [...p, n.id]); }}
                  style={{ border:"none", background:"transparent", color:C.textMut, cursor:"pointer", padding:4, flexShrink:0, opacity:.5, alignSelf:"center" }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <style>{`@keyframes slideInRight{from{transform:translateX(100%)}to{transform:translateX(0)}}`}</style>
    </div>
  );
}

function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [notifSettings, setNotifSettings] = useState({ email:true, push:true, ai:true, deadline:true, weekly:false });
  const [displaySettings, setDisplaySettings] = useState({ compact:false, animations:true, lang:"ja" });

  const Toggle = ({ on, onClick }) => (
    <div onClick={onClick} style={{ width:40, height:22, borderRadius:20, background: on ? C.b4 : C.border, cursor:"pointer", position:"relative", transition:"background .2s" }}>
      <div style={{ width:18, height:18, borderRadius:18, background:"#fff", position:"absolute", top:2, left: on ? 20 : 2, transition:"left .2s cubic-bezier(.16,1,.3,1)", boxShadow:"0 1px 3px rgba(0,0,0,.2)" }} />
    </div>
  );

  const tabs = [
    { id:"profile", label:"プロフィール", icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
    { id:"notifications", label:"通知", icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/></svg> },
    { id:"integrations", label:"連携", icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg> },
    { id:"display", label:"表示", icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="4"/><path d="M8 21h8M12 17v4"/></svg> },
    { id:"security", label:"セキュリティ", icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="4"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg> },
  ];

  return (
    <PageShell title="設定" watermark={"Se\ntti\nngs"}>
      <Rv><div style={{ display:"grid", gridTemplateColumns:"200px 1fr", gap:20 }}>
        <Card3 s={{ padding:"12px 0", alignSelf:"start" }}>
          {tabs.map(t => (
            <button key={t.id} type="button" onClick={() => setActiveTab(t.id)}
              style={{ display:"flex", alignItems:"center", gap:10, width:"calc(100% - 16px)", margin:"2px 8px", padding:"10px 14px", border: activeTab===t.id ? "1.5px solid rgba(139,123,244,.35)" : "1.5px solid transparent", borderRadius:14, background: activeTab===t.id ? "rgba(139,123,244,.06)" : "transparent", color: activeTab===t.id ? "#fff" : C.textSec, fontSize:12, fontWeight: activeTab===t.id ? 600 : 400, cursor:"pointer", fontFamily:bd, textAlign:"left", transition:"all .25s", boxShadow: activeTab===t.id ? "0 0 28px rgba(255,255,255,.2), 0 0 64px rgba(255,255,255,.08)" : "none" }}>
              <span style={{ width:20, display:"flex", alignItems:"center", justifyContent:"center", color:"rgba(255,255,255,.6)", filter:"drop-shadow(0 0 6px rgba(255,255,255,.3)) drop-shadow(0 0 14px rgba(255,255,255,.1))" }}>{t.icon}</span>{t.label}
            </button>
          ))}
        </Card3>

        <div>
          {activeTab === "profile" && (
            <Card3 s={{ padding:28 }}>
              <div style={{ fontSize:9, color:C.textMut, fontWeight:500, letterSpacing:".14em", textTransform:"uppercase", marginBottom:20, fontFamily:hd }}>プロフィール</div>
              <div style={{ display:"flex", alignItems:"center", gap:20, marginBottom:28 }}>
                <div style={{ width:64, height:64, borderRadius:"50%", background:"linear-gradient(135deg, rgba(139,123,244,.3), rgba(139,123,244,.1))", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <span style={{ fontFamily:hd, fontSize:22, color:"#0A0A0A", fontWeight:600 }}>YT</span>
                </div>
                <div>
                  <div style={{ fontSize:18, fontWeight:600, color:"#fff" }}>山田 太郎</div>
                  <div style={{ fontSize:12, color:C.textMut }}>yamada@techknova.jp</div>
                </div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                {[
                  { label:"表示名", value:"山田 太郎", type:"text" },
                  { label:"メールアドレス", value:"yamada@techknova.jp", type:"email" },
                  { label:"電話番号", value:"未設定", type:"tel" },
                  { label:"役職", value:"代表取締役", type:"text" },
                ].map((f, i) => (
                  <div key={i}>
                    <label style={{ fontSize:9, color:C.textMut, fontWeight:500, letterSpacing:".1em", textTransform:"uppercase", marginBottom:6, display:"block" }}>{f.label}</label>
                    <input defaultValue={f.value} type={f.type}
                      style={{ width:"100%", padding:"10px 14px", border:"1px solid rgba(139,123,244,.15)", borderRadius:18, background:"rgba(139,123,244,.04)", color:"#E0DAFF", fontSize:13, fontFamily:bd, outline:"none", boxSizing:"border-box", caretColor:"#A89BFF" }} />
                  </div>
                ))}
              </div>
              <div style={{ marginTop:20, display:"flex", justifyContent:"flex-end" }}>
                <BtnApprove s={{ padding:"10px 24px", border:"none", borderRadius:18, background:"rgba(139,123,244,.12)", color:"#C4B8FF", border:"1px solid rgba(139,123,244,.3)", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:bd, boxShadow:"0 0 14px rgba(139,123,244,.3), 0 0 36px rgba(139,123,244,.1)" }}>保存</BtnApprove>
              </div>
            </Card3>
          )}

          {activeTab === "notifications" && (
            <Card3 s={{ padding:28 }}>
              <div style={{ fontSize:9, color:C.textMut, fontWeight:500, letterSpacing:".14em", textTransform:"uppercase", marginBottom:20, fontFamily:hd }}>通知設定</div>
              {[
                { key:"email", label:"メール通知", desc:"重要な締切や更新をメールで通知" },
                { key:"push", label:"プッシュ通知", desc:"ブラウザのプッシュ通知を有効化" },
                { key:"ai", label:"AI分析通知", desc:"AIが新しい仕訳候補や節税機会を検出した時" },
                { key:"deadline", label:"締切リマインド", desc:"申告期限の7日前・3日前・当日に通知" },
                { key:"weekly", label:"週次レポート", desc:"毎週月曜日に週次サマリーをメール送信" },
              ].map((item, i) => (
                <div key={item.key} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"16px 0", borderTop: i ? `1px solid ${C.borderLt}` : "none" }}>
                  <div>
                    <div style={{ fontSize:13, fontWeight:600, color:"#fff" }}>{item.label}</div>
                    <div style={{ fontSize:11, color:C.textMut, marginTop:2 }}>{item.desc}</div>
                  </div>
                  <Toggle on={notifSettings[item.key]} onClick={() => setNotifSettings(p => ({...p, [item.key]: !p[item.key]}))} />
                </div>
              ))}
            </Card3>
          )}

          {activeTab === "integrations" && (
            <Card3 s={{ padding:28 }}>
              <div style={{ fontSize:9, color:C.textMut, fontWeight:500, letterSpacing:".14em", textTransform:"uppercase", marginBottom:20, fontFamily:hd }}>外部連携</div>
              {[
                { name:"freee", desc:"会計freeeからデータを自動同期", status:"connected", color:C.b4 },
                { name:"Money Forward", desc:"マネーフォワードとの連携", status:"disconnected", color:C.textMut },
                { name:"三菱UFJ銀行", desc:"口座データの自動取込（API連携）", status:"connected", color:C.b4 },
                { name:"Slack", desc:"締切リマインドをSlackに通知", status:"disconnected", color:C.textMut },
                { name:"Google Drive", desc:"書類のバックアップを自動保存", status:"connected", color:C.b4 },
                { name:"e-Tax", desc:"電子申告の連携", status:"disconnected", color:C.textMut },
              ].map((svc, i) => (
                <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px 0", borderTop: i ? `1px solid ${C.borderLt}` : "none" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                    <div style={{ width:36, height:36, borderRadius:"50%", background: svc.status==="connected" ? "rgba(123,224,160,.04)" : "rgba(139,123,244,.04)", border: svc.status==="connected" ? "1px solid rgba(123,224,160,.12)" : "1px solid rgba(139,123,244,.08)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow: svc.status==="connected" ? "0 0 14px rgba(123,224,160,.15), 0 0 32px rgba(123,224,160,.06)" : "0 0 12px rgba(255,255,255,.08)" }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={svc.status==="connected" ? C.b4 : C.textMut} strokeWidth="2.5"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
                    </div>
                    <div>
                      <div style={{ fontSize:13, fontWeight:600, color:"#fff" }}>{svc.name}</div>
                      <div style={{ fontSize:10, color:C.textMut }}>{svc.desc}</div>
                    </div>
                  </div>
                  <button type="button" style={{ padding:"6px 16px", borderRadius:100, border: svc.status==="connected" ? `1px solid ${C.b4}40` : `1px solid ${C.border}`, background:"transparent", color: svc.status==="connected" ? C.b4 : C.textSec, fontSize:10, fontWeight:600, cursor:"pointer", fontFamily:bd }}>
                    {svc.status === "connected" ? "接続済み" : "接続する"}
                  </button>
                </div>
              ))}
            </Card3>
          )}

          {activeTab === "display" && (
            <Card3 s={{ padding:28 }}>
              <div style={{ fontSize:9, color:C.textMut, fontWeight:500, letterSpacing:".14em", textTransform:"uppercase", marginBottom:20, fontFamily:hd }}>表示設定</div>
              {[
                { key:"compact", label:"コンパクト表示", desc:"テーブルやリストの行間を縮小" },
                { key:"animations", label:"アニメーション", desc:"UIのアニメーション・トランジション効果" },
              ].map((item, i) => (
                <div key={item.key} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"16px 0", borderTop: i ? `1px solid ${C.borderLt}` : "none" }}>
                  <div>
                    <div style={{ fontSize:13, fontWeight:600, color:"#fff" }}>{item.label}</div>
                    <div style={{ fontSize:11, color:C.textMut, marginTop:2 }}>{item.desc}</div>
                  </div>
                  <Toggle on={displaySettings[item.key]} onClick={() => setDisplaySettings(p => ({...p, [item.key]: !p[item.key]}))} />
                </div>
              ))}
              <div style={{ padding:"16px 0", borderTop:`1px solid ${C.borderLt}` }}>
                <div style={{ fontSize:13, fontWeight:600, color:"#fff", marginBottom:8 }}>言語</div>
                <div style={{ display:"flex", gap:6 }}>
                  {[["ja","日本語"],["en","English"]].map(([id,l]) => (
                    <button key={id} type="button" onClick={() => setDisplaySettings(p => ({...p, lang:id}))}
                      style={{ padding:"8px 18px", borderRadius:18, border: displaySettings.lang===id ? `1.5px solid ${C.blue}` : `1px solid ${C.border}`, background: displaySettings.lang===id ? `${C.blue}08` : "transparent", color: displaySettings.lang===id ? C.blue : C.textSec, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:bd }}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ padding:"16px 0", borderTop:`1px solid ${C.borderLt}` }}>
                <div style={{ fontSize:13, fontWeight:600, color:"#fff", marginBottom:4 }}>決算月</div>
                <div style={{ fontSize:11, color:C.textMut, marginBottom:8 }}>会計年度の終了月</div>
                <select defaultValue="3" style={{ padding:"8px 14px", borderRadius:18, border:`1.5px solid ${C.border}`, background:C.surface, color:"#fff", fontSize:12, fontFamily:bd, outline:"none" }}>
                  {Array.from({length:12},(_,i)=><option key={i+1} value={i+1}>{i+1}月</option>)}
                </select>
              </div>
            </Card3>
          )}

          {activeTab === "security" && (
            <Card3 s={{ padding:28 }}>
              <div style={{ fontSize:9, color:C.textMut, fontWeight:500, letterSpacing:".14em", textTransform:"uppercase", marginBottom:20, fontFamily:hd }}>セキュリティ</div>
              <div style={{ padding:"16px 0", borderBottom:`1px solid ${C.borderLt}` }}>
                <div style={{ fontSize:13, fontWeight:600, color:"#fff", marginBottom:4 }}>パスワード変更</div>
                <div style={{ fontSize:11, color:C.textMut, marginBottom:12 }}>最終変更: 2025年12月15日</div>
                <button type="button" style={{ padding:"8px 20px", borderRadius:18, border:`1px solid ${C.border}`, background:"transparent", color:C.textSec, fontSize:11, fontWeight:600, cursor:"pointer", fontFamily:bd }}>パスワードを変更</button>
              </div>
              <div style={{ padding:"16px 0", borderBottom:`1px solid ${C.borderLt}` }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <div>
                    <div style={{ fontSize:13, fontWeight:600, color:"#fff" }}>二要素認証</div>
                    <div style={{ fontSize:11, color:C.textMut, marginTop:2 }}>認証アプリによる二要素認証</div>
                  </div>
                  <span style={{ fontSize:10, color:C.b4, fontWeight:600, padding:"3px 10px", border:`1px solid ${C.b4}40`, borderRadius:100 }}>有効</span>
                </div>
              </div>
              <div style={{ padding:"16px 0" }}>
                <div style={{ fontSize:13, fontWeight:600, color:"#fff", marginBottom:4 }}>ログインセッション</div>
                <div style={{ fontSize:11, color:C.textMut, marginBottom:12 }}>現在のセッション: Chrome / macOS — 東京</div>
                <button type="button" style={{ padding:"8px 20px", borderRadius:18, border:"1px solid rgba(139,123,244,.12)", background:"rgba(139,123,244,.04)", color:"#E87070", fontSize:11, fontWeight:600, cursor:"pointer", fontFamily:bd }}>他のセッションをログアウト</button>
              </div>
            </Card3>
          )}
        </div>
      </div></Rv>
    </PageShell>
  );
}

/* ════════════════════════════════ APP ════════════════════════════════ */
/* ════════════════════════════════ UPLOAD MODAL ════════════════════════════════ */
function UploadModal({ onClose }) {
  const [files, setFiles] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [category, setCategory] = useState("auto");

  const cats = [
    { id: "auto", l: "AIが自動判別" },
    { id: "receipt", l: "レシート・領収書" },
    { id: "invoice", l: "請求書" },
    { id: "bank", l: "通帳・入出金明細" },
    { id: "contract", l: "契約書" },
    { id: "tax", l: "税務関連書類" },
    { id: "other", l: "その他" },
  ];

  const addFiles = (newFiles) => {
    const arr = Array.from(newFiles).map(f => ({
      name: f.name,
      size: (f.size / 1024).toFixed(0) + " KB",
      type: f.name.split(".").pop().toUpperCase(),
      status: "ready",
      id: Math.random().toString(36).slice(2),
    }));
    setFiles(prev => [...prev, ...arr]);
  };

  const removeFile = (id) => setFiles(prev => prev.filter(f => f.id !== id));

  const processAll = () => {
    setFiles(prev => prev.map(f => ({ ...f, status: "processing" })));
    setTimeout(() => setFiles(prev => prev.map(f => ({ ...f, status: "done" }))), 2000);
  };

  const ready = files.filter(f => f.status === "ready").length;
  const done = files.filter(f => f.status === "done").length;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: bd }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      {/* Backdrop */}
      <div style={{ position: "absolute", inset: 0, background: "rgba(10,10,10,.5)", backdropFilter: "blur(4px)" }} />

      {/* Modal */}
      <div style={{ position: "relative", background: C.surface, width: 560, maxWidth: "95vw", maxHeight: "85vh", overflow: "auto", borderRadius: 26, boxShadow: "0 24px 80px rgba(0,0,0,.25)" }}>
        {/* Header */}
        <div style={{ padding: "24px 28px 20px", borderBottom: `1px solid ${C.borderLt}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontFamily: hd, fontSize: 22, color: C.dark, letterSpacing: "-.02em" }}>資料アップロード</div>
            <div style={{ fontSize: 11, color: C.textMut, marginTop: 2 }}>レシート・請求書・明細をドラッグ＆ドロップ</div>
          </div>
          <button type="button" onClick={onClose}
            style={{ border: "none", background: "transparent", cursor: "pointer", padding: 8, color: C.textMut }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        {/* Drop zone */}
        <div style={{ padding: "24px 28px" }}>
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={e => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
            onClick={() => { const input = document.createElement("input"); input.type = "file"; input.multiple = true; input.accept = ".pdf,.jpg,.jpeg,.png,.csv,.xlsx"; input.onchange = (e) => addFiles(e.target.files); input.click(); }}
            style={{
              border: `2px dashed ${dragging ? C.blue : C.border}`,
              borderRadius: 22, padding: "40px 24px", textAlign: "center", cursor: "pointer",
              background: dragging ? `${C.blue}06` : "transparent",
              transition: "all .2s",
            }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={dragging ? C.blue : C.textMut} strokeWidth="2.5" style={{ margin: "0 auto 12px", display: "block" }}>
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
            </svg>
            <div style={{ fontSize: 14, fontWeight: 700, color: dragging ? C.blue : C.dark, marginBottom: 4 }}>
              {dragging ? "ここにドロップ" : "クリックまたはドラッグ＆ドロップ"}
            </div>
            <div style={{ fontSize: 11, color: C.textMut }}>PDF · JPG · PNG · CSV · XLSX　最大20MB</div>
          </div>
        </div>

        {/* Category selector */}
        <div style={{ padding: "0 28px 16px" }}>
          <div style={{ fontSize: 10, color: C.textMut, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 8 }}>書類カテゴリ</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {cats.map(c => (
              <button key={c.id} type="button" onClick={() => setCategory(c.id)}
                style={{
                  padding: "6px 14px", borderRadius: 100, border: `1.5px solid ${category === c.id ? C.blue : C.border}`,
                  background: category === c.id ? `${C.blue}08` : "transparent",
                  color: category === c.id ? C.blue : C.textSec, fontSize: 11, fontWeight: 600,
                  cursor: "pointer", fontFamily: bd, transition: "all .15s",
                }}>
                {c.l}
              </button>
            ))}
          </div>
        </div>

        {/* File list */}
        {files.length > 0 && (
          <div style={{ padding: "0 28px 20px" }}>
            <div style={{ fontSize: 10, color: C.textMut, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 8 }}>
              アップロードファイル ({files.length})
            </div>
            {files.map(f => (
              <div key={f.id} style={{
                display: "flex", alignItems: "center", gap: 12, padding: "10px 14px",
                border: `1px solid ${C.borderLt}`, borderRadius: 18, marginBottom: 6,
                background: f.status === "done" ? "rgba(139,123,244,.03)" : "transparent",
                transition: "all .3s",
              }}>
                {/* File type icon */}
                <div style={{
                  width: 36, height: 36, borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center",
                  background: f.status === "done" ? "rgba(139,123,244,.05)" : "rgba(139,123,244,.03)",
                  fontSize: 9, fontWeight: 600, color: f.status === "done" ? C.b4 : C.blue, letterSpacing: ".04em",
                }}>{f.type}</div>

                {/* File info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: C.dark, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</div>
                  <div style={{ fontSize: 10, color: C.textMut }}>{f.size}</div>
                </div>

                {/* Status */}
                {f.status === "processing" ? (
                  <div style={{ fontSize: 9, color: C.b2, fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                    <div style={{ width: 12, height: 12, border: `2px solid ${C.blue}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                    OCR処理中
                  </div>
                ) : f.status === "done" ? (
                  <span style={{ fontSize: 9, color: C.b4, fontWeight: 800, letterSpacing: ".06em" }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ verticalAlign: "middle", marginRight: 3 }}><path d="M20 6L9 17l-5-5"/></svg>
                    完了
                  </span>
                ) : (
                  <button type="button" onClick={() => removeFile(f.id)}
                    style={{ border: "none", background: "transparent", cursor: "pointer", color: C.textMut, padding: 4 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Memo */}
        {files.length > 0 && (
          <div style={{ padding: "0 28px 20px" }}>
            <div style={{ fontSize: 10, color: C.textMut, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 8 }}>メモ（任意）</div>
            <input placeholder="例：2月分の交通費レシート" style={{
              width: "100%", padding: "10px 16px", border: "1px solid rgba(139,123,244,.15)", borderRadius: 100,
              fontFamily: bd, fontSize: 12, color: "#E0DAFF", outline: "none", boxSizing: "border-box",
              background: "rgba(139,123,244,.04)", caretColor: "#A89BFF",
            }} />
          </div>
        )}

        {/* Footer */}
        <div style={{ padding: "16px 28px", borderTop: `1px solid ${C.borderLt}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 11, color: C.textMut }}>
            {done > 0 && <span style={{ color: C.b4, fontWeight: 700 }}>{done}件 処理完了 · </span>}
            {ready > 0 && `${ready}件 待機中`}
            {files.length === 0 && "ファイルを追加してください"}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" onClick={onClose}
              style={{ padding: "10px 20px", border: `1px solid ${C.border}`, borderRadius: 100, background: "transparent", color: C.textSec, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: bd }}>キャンセル</button>
            {files.length > 0 && done < files.length && (
              <Mag onClick={processAll}
                s={{ padding: "10px 24px", border: "none", borderRadius: 100, background: "rgba(139,123,244,.12)", color: "#C4B8FF", border: "1px solid rgba(139,123,244,.3)", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: bd, boxShadow: "0 0 14px rgba(139,123,244,.3), 0 0 36px rgba(139,123,244,.1)" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ verticalAlign: "middle", marginRight: 6 }}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
                アップロード＆OCR処理
              </Mag>
            )}
            {done > 0 && done === files.length && (
              <Mag onClick={onClose}
                s={{ padding: "10px 24px", border: "none", borderRadius: 100, background: C.b1, color: "#0A0A0A", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: bd }}>
                完了して閉じる
              </Mag>
            )}
          </div>
        </div>
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}


export { Workspace, CommandPalette, NotificationPanel, SettingsPage, UploadModal };
