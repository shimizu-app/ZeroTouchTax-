import React, { useState, useEffect, useRef, useCallback } from "react";
import { C, hd, bd, mono } from "../lib/theme";
import { Rv, Mag, Card3, PageShell } from "./ui";
import { CyclingText, Folder3D, Calc3D, GlossyButton } from "./InputPage";
import { FORM_DEFS } from "./BooksPage";

function AuditLandingSelector({ onSelect }) {
  const [step,        setStep]        = useState(0);
  const [hintIn,      setHintIn]      = useState(false);
  const [nudge,       setNudge]       = useState(false);
  const [dragOver,    setDragOver]    = useState(false);
  const [dropped,     setDropped]     = useState(false);
  const [files,       setFiles]       = useState([]);
  const [exiting,     setExiting]     = useState(false);
  const [done,        setDone]        = useState(false);
  const [mode,        setMode]        = useState(null); // "upload"|"numeric"
  const [folderHov,   setFolderHov]   = useState(false);
  const [folderPress, setFolderPress] = useState(false);
  const [calcHov,     setCalcHov]     = useState(false);
  const [calcPress,   setCalcPress]   = useState(false);

  useEffect(()=>{
    setTimeout(()=>setStep(1),300);
    setTimeout(()=>setStep(2),1000);
    setTimeout(()=>setHintIn(true),2800);
  },[]);

  const handleDragOver  = useCallback(e=>{ e.preventDefault(); setDragOver(true); },[]);
  const handleDragLeave = useCallback(()=>setDragOver(false),[]);
  const handleDrop      = useCallback(e=>{
    e.preventDefault(); setDragOver(false);
    const fs2=Array.from(e.dataTransfer.files); if(!fs2.length) return;
    setFiles(f=>[...f,...fs2.map(x=>x.name)]); setDropped(true);
  },[]);
  const handleDroppedDone = useCallback(()=>{
    setDropped(false);
    setTimeout(()=>{ onSelect("upload"); },400);
  },[onSelect]);
  const handleFolderClick = useCallback(()=>{
    if(dropped) return;
    setNudge(true);
    setTimeout(()=>setNudge(false), 2200);
  },[dropped]);
  const handleCalcClick = useCallback(()=>{
    onSelect("numeric");
  },[onSelect]);

  const fd=(show,delay=0)=>({
    opacity:show?1:0,
    transform:show?"translateY(0)":"translateY(20px)",
    transition:`opacity 1.2s cubic-bezier(.16,1,.3,1) ${delay}ms,transform 1.2s cubic-bezier(.16,1,.3,1) ${delay}ms`,
  });

  return (
    <div style={{
      minHeight:"100vh", background:"#000",
      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
      userSelect:"none", padding:"0 32px",
    }}>
      <style>{`
        @keyframes glowWhite {
          0%,100%{filter:drop-shadow(0 40px 70px #000) drop-shadow(0 0 40px rgba(255,255,255,.12)) drop-shadow(0 0 90px rgba(255,255,255,.05));}
          50%    {filter:drop-shadow(0 40px 70px #000) drop-shadow(0 0 90px rgba(255,255,255,.40)) drop-shadow(0 0 200px rgba(255,255,255,.15));}
        }
        @keyframes glowAmber {
          0%,100%{filter:drop-shadow(0 40px 70px #000) drop-shadow(0 0 40px rgba(255,160,30,.18)) drop-shadow(0 0 90px rgba(255,130,0,.08));}
          50%    {filter:drop-shadow(0 40px 70px #000) drop-shadow(0 0 90px rgba(255,160,30,.50)) drop-shadow(0 0 200px rgba(255,130,0,.22));}
        }
        @keyframes glowBlue {
          0%,100%{filter:drop-shadow(0 40px 70px #000) drop-shadow(0 0 80px rgba(80,130,255,.55));}
          50%    {filter:drop-shadow(0 40px 70px #000) drop-shadow(0 0 140px rgba(100,160,255,.75));}
        }
        @keyframes glowSilver {
          0%,100%{filter:drop-shadow(0 50px 90px #000) drop-shadow(0 0 45px rgba(255,255,255,.13)) drop-shadow(0 0 110px rgba(255,255,255,.05));}
          50%    {filter:drop-shadow(0 50px 90px #000) drop-shadow(0 0 100px rgba(255,255,255,.44)) drop-shadow(0 0 230px rgba(255,255,255,.17));}
        }
        @keyframes glowPurple {
          0%,100%{filter:drop-shadow(0 40px 70px #000) drop-shadow(0 0 55px rgba(150,60,255,.55)) drop-shadow(0 0 110px rgba(130,20,230,.25));}
          50%    {filter:drop-shadow(0 40px 70px #000) drop-shadow(0 0 110px rgba(170,80,255,.85)) drop-shadow(0 0 240px rgba(150,40,240,.45));}
        }
        @keyframes hintDiag { 0%,100%{opacity:.6;transform:translate(0,0)} 50%{opacity:1;transform:translate(-3px,3px)} }
        @keyframes arrowFloat { 0%,100%{transform:translateY(0);opacity:.7;} 50%{transform:translateY(-5px);opacity:1;} }
        @keyframes arrowGlow {
          0%,100%{filter:drop-shadow(0 0 8px rgba(255,255,255,.5)) drop-shadow(0 0 18px rgba(200,220,255,.3));}
          50%    {filter:drop-shadow(0 0 15px rgba(255,255,255,.9)) drop-shadow(0 0 40px rgba(200,230,255,.6));}
        }
        @keyframes textGlow {
          0%,100%{opacity:.45;}
          50%    {opacity:.8;}
        }
        .label-tag {
          fontFamily: "-apple-system,'SF Pro Text',sans-serif";
          font-size: 11px; font-weight: 500;
          letter-spacing: .08em; text-transform: uppercase;
          padding: 4px 12px;
          border-radius: 20px;
          border: 1px solid;
          backdrop-filter: blur(10px);
          transition: opacity .4s ease, transform .4s ease;
        }
      `}</style>

      {/* Cycling text */}
      <div style={{marginBottom:0,...fd(step>=2)}}>
        <CyclingText started={step>=2} hidden={dragOver||dropped}/>
      </div>

      {/* ── Two icons row ── */}
      <div style={{
        display:"flex", flexDirection:"row",
        alignItems:"flex-start", justifyContent:"center",
        gap:80, position:"relative",
        ...fd(step>=1),
      }}>

        {/* FOLDER */}
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"flex-start",width:280}}>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleFolderClick}
            onMouseEnter={()=>setFolderHov(true)}
            onMouseLeave={()=>setFolderHov(false)}
            onPointerDown={()=>setFolderPress(true)}
            onPointerUp={()=>setFolderPress(false)}
            style={{
              animation:dragOver?"glowBlue 1s ease-in-out infinite":"glowWhite 4.5s ease-in-out infinite",
              cursor:"pointer", position:"relative",
            }}
          >
            <Folder3D hovered={folderHov} pressed={folderPress} dragOver={dragOver} dropped={dropped} onDroppedDone={handleDroppedDone}/>
            {/* drag overlay */}
            <div style={{
              position:"absolute", inset:0,
              display:"flex", alignItems:"center", justifyContent:"center",
              pointerEvents:"none",
              opacity:dragOver?1:0, transition:"opacity .25s ease",
            }}>
              <div style={{fontFamily:"-apple-system,sans-serif",fontSize:18,fontWeight:700,color:"#fff",letterSpacing:"-.02em",textShadow:"0 0 40px rgba(120,170,255,1)"}}>
                ドロップして開始
              </div>
            </div>
            {/* ── Side hint: LEFT side, arrow → points INTO folder ── */}
            <div style={{
              position:"absolute", left:-155, top:"50%", transform:"translateY(-50%)",
              display:"flex", flexDirection:"row", alignItems:"center", gap:8,
              pointerEvents:"none",
              opacity: dragOver||dropped ? 0 : hintIn ? 1 : 0,
              transition:"opacity 1.4s ease",
              animation: hintIn ? "hintDiag 3s ease-in-out infinite" : "none",
              whiteSpace:"nowrap",
            }}>
              <div style={{
                fontFamily:"-apple-system,'SF Pro Display',sans-serif",
                fontSize:13, fontWeight:800, color:"rgba(255,255,255,.82)",
                letterSpacing:".02em", lineHeight:1.35, textAlign:"right",
                textShadow:"0 0 18px rgba(255,255,255,.99), 0 0 40px rgba(255,255,255,.65), 0 0 80px rgba(255,255,255,.35)",
              }}>ここにファイルを<br/>ドロップ</div>
              {/* arrow → pointing right into folder */}
              <svg width="56" height="22" viewBox="0 0 56 22" fill="none"
                style={{filter:"drop-shadow(0 0 6px rgba(255,255,255,.65)) drop-shadow(0 0 16px rgba(255,255,255,.3))"}}>
                <path d="M2 11h48" stroke="rgba(255,255,255,.80)" strokeWidth="2.2" strokeLinecap="round"/>
                <path d="M44 5l10 6-10 6" stroke="rgba(255,255,255,.80)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>

          <GlossyButton
            hovered={folderHov}
            onMouseEnter={()=>setFolderHov(true)}
            onMouseLeave={()=>setFolderHov(false)}
            onPointerDown={()=>setFolderPress(true)}
            onPointerUp={()=>setFolderPress(false)}
            onClick={handleFolderClick}
          >書類審査</GlossyButton>
          <div style={{
            marginTop:14, textAlign:"center", maxWidth:280,
            fontFamily:"-apple-system,'SF Pro Text',sans-serif",
            fontSize:14, fontWeight:500, lineHeight:1.75,
            color:"rgba(255,255,255,.88)", letterSpacing:".02em",
            textShadow:"0 0 18px rgba(255,255,255,.7), 0 0 40px rgba(255,255,255,.35)",
          }}>領収書・請求書などのファイルを<br/>アップロードして、AIが自動で<br/>読み取り・解析します</div>

          {/* ── Nudge message on click ── */}
          <div style={{
            marginTop:6, pointerEvents:"none",
            opacity: nudge ? 1 : 0,
            transform: nudge ? "translateY(0)" : "translateY(6px)",
            transition:"opacity .4s ease, transform .4s ease",
          }}>
            <div style={{
              fontFamily:"-apple-system,'SF Pro Text',sans-serif",
              fontSize:12, fontWeight:400,
              color:"rgba(255,255,255,.55)",
              letterSpacing:".02em", textAlign:"center", lineHeight:1.6,
              textShadow:"0 0 20px rgba(255,255,255,.4)",
            }}>
              ここにファイルをドロップしてみよう
            </div>
          </div>
        </div>

        {/* CALCULATOR */}
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"flex-start",width:340}}>
          <div
            onClick={handleCalcClick}
            onMouseEnter={()=>setCalcHov(true)}
            onMouseLeave={()=>setCalcHov(false)}
            onPointerDown={()=>setCalcPress(true)}
            onPointerUp={()=>setCalcPress(false)}
            style={{
              animation:"glowWhite 4.5s ease-in-out infinite",
              cursor:"pointer",
            }}
          >
            <Calc3D hovered={calcHov} pressed={calcPress}/>
          </div>
          <GlossyButton
            hovered={calcHov}
            onMouseEnter={()=>setCalcHov(true)}
            onMouseLeave={()=>setCalcHov(false)}
            onPointerDown={()=>setCalcPress(true)}
            onPointerUp={()=>setCalcPress(false)}
            onClick={handleCalcClick}
          >数値照合</GlossyButton>
          <div style={{
            marginTop:14, textAlign:"center", maxWidth:280,
            fontFamily:"-apple-system,'SF Pro Text',sans-serif",
            fontSize:14, fontWeight:500, lineHeight:1.75,
            color:"rgba(255,255,255,.88)", letterSpacing:".02em",
            textShadow:"0 0 18px rgba(255,255,255,.7), 0 0 40px rgba(255,255,255,.35)",
          }}>帳簿や決算書の数値を直接入力して<br/>差異・不一致を自動で検出します</div>
        </div>
      </div>



    </div>
  );
}


// ══════════════════════════════════════════════════════════════
// NUMERIC AUDIT — 数値照合フロー
// ══════════════════════════════════════════════════════════════


// Valid reconciliation pairs
const VALID_PAIRS = new Set([
  "bs-uchiwake","uchiwake-bs",
  "pl-shinkoku","shinkoku-pl",
  "pl-hojin","hojin-pl",
  "pl-kotei","kotei-pl",
  "bs-kotei","kotei-bs",
  "kubun-pl","pl-kubun",
  "kubun-shinkoku","shinkoku-kubun",
]);

const hasValidPair = (ids) => {
  for(let i=0;i<ids.length;i++)
    for(let j=i+1;j<ids.length;j++)
      if(VALID_PAIRS.has(ids[i]+"-"+ids[j])) return true;
  return false;
};


const buildSingleResults = (docId) => {
  return [];
};

const AUDIT_DOCS = [
  { id:"bs",       label:"貸借対照表",     sub:"",       icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="12" y1="3" x2="12" y2="21"/></svg> },
  { id:"pl",       label:"損益計算書",     sub:"",   icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg> },
  { id:"hojin",    label:"法人税 別表一",  sub:"法人税申告書",             icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18M9 8h1M14 8h1M9 12h1M14 12h1M9 16h1M14 16h1"/><path d="M5 21V5a2 2 0 012-2h10a2 2 0 012 2v16"/></svg> },
  { id:"shinkoku", label:"確定申告書B",    sub:"第一表",                   icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg> },
  { id:"kotei",    label:"固定資産台帳",   sub:"減価償却資産明細",         icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/></svg> },
  { id:"kubun",    label:"消費税区分別表", sub:"課税区分別取引集計",       icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> },
  { id:"uchiwake", label:"内訳書",         sub:"勘定科目内訳明細書",       icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg> },
];

// Cross-document reconciliation checks
const buildReconciliationResults = (selectedIds) => {
  return [];
};

function NumericAuditPage({ onBack }) {
  const [step, setStep] = useState("select");
  const [selected, setSelected] = useState([]);
  const [results, setResults] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [isSingle, setIsSingle] = useState(false);

  const toggle = (id) => setSelected(s => s.includes(id) ? s.filter(x=>x!==id) : [...s,id]);

  const canReconcile = selected.length >= 2 && hasValidPair(selected);
  const noValidPair  = selected.length >= 2 && !hasValidPair(selected);
  const isSingleSel  = selected.length === 1;

  const startCheck = () => {
    if(isSingleSel) {
      setIsSingle(true);
      setStep("analyzing");
      setTimeout(() => { setResults(buildSingleResults(selected[0])); setStep("results"); }, 1800);
    } else if(canReconcile) {
      setIsSingle(false);
      setStep("analyzing");
      setTimeout(() => { setResults(buildReconciliationResults(selected)); setStep("results"); }, 2400);
    }
  };

  const fmt = (v) => "¥" + v.toLocaleString();
  const diffCount = results.filter(r=>!r.match).length;
  const okCount   = results.filter(r=>r.match).length;

  const btnLabel = () => {
    if(selected.length === 0)  return "書類を選択してください";
    if(isSingleSel)            return "単体チェックを実行";
    if(noValidPair)            return "この組み合わせは照合できません";
    return `${selected.length}件を照合する`;
  };
  const btnActive = isSingleSel || canReconcile;

  // ── SELECT ──
  if(step === "select") return (
    <PageShell title="数値照合" watermark={"照\n合"}>
      <Rv>
        <div style={{ fontSize:12, color:C.textSec, fontWeight:500, marginBottom:4, letterSpacing:".04em" }}>照合する書類を選択</div>
        <div style={{ fontSize:11, color:C.textMut, marginBottom:22, lineHeight:1.7 }}>
          1件 → 単体の計算チェック　　2件以上 → 書類間の数値を突き合わせ
        </div>
      </Rv>
      <Rv d={10}>
        <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:24 }}>
          {AUDIT_DOCS.map(doc => {
            const checked = selected.includes(doc.id);
            // Check if this doc can pair with any already-selected doc
            const wouldPair = selected.length > 0 && !checked &&
              selected.some(id => VALID_PAIRS.has(id+"-"+doc.id) || VALID_PAIRS.has(doc.id+"-"+id));
            const noPair = selected.length > 0 && !checked && !wouldPair;
            return (
              <div key={doc.id} onClick={()=>toggle(doc.id)}
                style={{
                  display:"flex", alignItems:"center", gap:14,
                  padding:"13px 16px", borderRadius:14, cursor:"pointer",
                  border:`1.5px solid ${checked ? "rgba(139,123,244,.65)" : noPair ? "rgba(255,255,255,.05)" : C.border}`,
                  background: checked ? "rgba(139,123,244,.10)" : noPair ? "rgba(255,255,255,.02)" : C.surface,
                  opacity: noPair ? 0.38 : 1,
                  transition:"all .15s ease",
                  boxShadow: checked ? "0 0 18px rgba(139,123,244,.15)" : wouldPair ? "0 0 12px rgba(139,123,244,.08)" : "none",
                }}>
                {/* Checkbox */}
                <div style={{
                  width:20, height:20, borderRadius:5, flexShrink:0,
                  border:`1.8px solid ${checked ? "rgba(139,123,244,.9)" : "rgba(255,255,255,.18)"}`,
                  background: checked ? "rgba(139,123,244,.65)" : "transparent",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  transition:"all .15s ease",
                }}>
                  {checked && <svg width="11" height="11" viewBox="0 0 12 12"><path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>}
                </div>
                {/* SVG icon */}
                <div style={{ color: checked ? "rgba(139,123,244,.9)" : "rgba(255,255,255,.4)", flexShrink:0 }}>
                  {doc.icon}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, fontWeight:600, color: noPair ? "rgba(255,255,255,.35)" : "#fff", letterSpacing:".01em" }}>{doc.label}</div>
                  <div style={{ fontSize:10, color:C.textMut, marginTop:2 }}>{doc.sub}</div>
                </div>
                {noPair && <div style={{ fontSize:9, color:"rgba(255,255,255,.22)", fontWeight:500, letterSpacing:".06em", whiteSpace:"nowrap" }}>照合不可</div>}
                {wouldPair && !checked && <div style={{ fontSize:9, color:"rgba(139,123,244,.7)", fontWeight:600, letterSpacing:".06em", whiteSpace:"nowrap" }}>照合可能</div>}
              </div>
            );
          })}
        </div>
      </Rv>
      <Rv d={20}>
        <button onClick={startCheck} disabled={!btnActive}
          style={{
            width:"100%", padding:"15px 0", borderRadius:32, border:"none",
            cursor: btnActive ? "pointer" : "not-allowed",
            background: btnActive ? (isSingleSel ? "rgba(255,255,255,.12)" : "rgba(139,123,244,.85)") : "rgba(255,255,255,.04)",
            color: btnActive ? "#fff" : "rgba(255,255,255,.25)",
            fontSize:14, fontWeight:700, letterSpacing:".08em",
            transition:"all .2s ease",
            boxShadow: canReconcile ? "0 0 24px rgba(139,123,244,.4)" : isSingleSel ? "0 0 16px rgba(255,255,255,.1)" : "none",
          }}>
          {btnLabel()}
        </button>
        {noValidPair && (
          <div style={{ textAlign:"center", marginTop:10, fontSize:11, color:"rgba(255,255,255,.28)", letterSpacing:".04em" }}>
            選択中の書類間に共通する照合項目がありません
          </div>
        )}
      </Rv>
    </PageShell>
  );

  // ── ANALYZING ──
  if(step === "analyzing") return (
    <PageShell title="数値照合" watermark={"照\n合"}>
      <Rv><Card3 s={{ padding:"60px 24px", textAlign:"center" }}>
        <div style={{ width:48, height:48, borderRadius:"50%", border:`2px solid ${C.border}`, borderTopColor:"rgba(139,123,244,1)", margin:"0 auto 20px", animation:"spin 1s linear infinite", boxShadow:"0 0 16px rgba(139,123,244,.4)" }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <div style={{ fontFamily:hd, fontSize:20, fontWeight:400, color:"#fff", marginBottom:8 }}>
          {isSingle ? "計算を検証中..." : "数値を照合中..."}
        </div>
        <div style={{ fontSize:12, color:C.textMut }}>
          {isSingle
            ? AUDIT_DOCS.find(d=>d.id===selected[0])?.label + " の内部計算を確認しています"
            : selected.map(id=>AUDIT_DOCS.find(d=>d.id===id)?.label).join(" × ") + " を突き合わせています"}
        </div>
      </Card3></Rv>
    </PageShell>
  );

  // ── RESULTS ──
  const issues = results.filter(r => !r.match);
  return (
    <PageShell title="数値照合" watermark={"照\n合"}>
      <Rv>
        <div style={{ fontSize:11, color:C.textMut, marginBottom:20, letterSpacing:".04em" }}>
          {isSingle
            ? AUDIT_DOCS.find(d=>d.id===selected[0])?.label + " — 単体チェック"
            : selected.map(id=>AUDIT_DOCS.find(d=>d.id===id)?.label).join(" × ")}
        </div>

        {issues.length === 0 ? (
          <Card3 s={{ padding:"48px 24px", textAlign:"center" }}>
            <div style={{ width:40, height:40, borderRadius:"50%", background:"rgba(34,197,94,.12)", border:"1.5px solid rgba(34,197,94,.35)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px", boxShadow:"0 0 20px rgba(34,197,94,.2)" }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M3 9l4 4 8-8" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <div style={{ fontSize:15, fontWeight:600, color:"#fff", marginBottom:6 }}>差異なし</div>
            <div style={{ fontSize:11, color:C.textMut, lineHeight:1.7 }}>すべての項目が一致しています</div>
          </Card3>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {issues.map(r => {
              const open = expanded === r.id;
              return (
                <div key={r.id} onClick={()=>setExpanded(open ? null : r.id)}
                  style={{
                    borderRadius:14, cursor:"pointer", overflow:"hidden",
                    border: open ? "1.5px solid rgba(239,68,68,.75)" : "1.5px solid rgba(239,68,68,.30)",
                    background: open ? "rgba(239,68,68,.10)" : "rgba(239,68,68,.04)",
                    transition:"border-color .15s, background .15s",
                    boxShadow: open ? "0 0 24px rgba(239,68,68,.18)" : "none",
                  }}>
                  <div style={{ display:"flex", alignItems:"center", gap:12, padding:"14px 16px" }}>
                    <div style={{
                      width:8, height:8, borderRadius:"50%", flexShrink:0,
                      background:"#ef4444",
                      boxShadow: open ? "0 0 14px rgba(239,68,68,1)" : "0 0 6px rgba(239,68,68,.65)",
                      transition:"box-shadow .15s",
                    }}/>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13, fontWeight:600, color:"#fff", letterSpacing:".01em" }}>{r.label}</div>
                      {!open && r.valA !== undefined && (
                        <div style={{ fontSize:10, color:"rgba(239,68,68,.75)", marginTop:3, fontWeight:500 }}>
                          差異 ¥{Math.abs(r.valA - r.valB).toLocaleString()}
                        </div>
                      )}
                    </div>
                    <svg width="14" height="14" viewBox="0 0 14 14"
                      style={{ transform:open?"rotate(180deg)":"rotate(0)", transition:"transform .2s", opacity:.4, flexShrink:0 }}>
                      <path d="M3 5l4 4 4-4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
                    </svg>
                  </div>
                  {open && (
                    <div style={{ padding:"0 16px 16px", borderTop:"1px solid rgba(239,68,68,.18)" }}>
                      {r.valA !== undefined && (
                        <div style={{ display:"flex", gap:10, marginTop:12, marginBottom:12, alignItems:"center" }}>
                          <div style={{ flex:1, background:"rgba(255,255,255,.04)", borderRadius:10, padding:"10px 12px" }}>
                            <div style={{ fontSize:9, color:C.textMut, letterSpacing:".07em", marginBottom:4 }}>{r.docA || "計算値"}</div>
                            <div style={{ fontSize:15, fontWeight:700, color:"#fff" }}>¥{r.valA.toLocaleString()}</div>
                          </div>
                          <div style={{ fontSize:18, color:"#ef4444", fontWeight:800, flexShrink:0 }}>≠</div>
                          <div style={{ flex:1, background:"rgba(239,68,68,.08)", borderRadius:10, padding:"10px 12px", border:"1px solid rgba(239,68,68,.22)" }}>
                            <div style={{ fontSize:9, color:"rgba(239,68,68,.65)", letterSpacing:".07em", marginBottom:4 }}>{r.docB || "書類値"}</div>
                            <div style={{ fontSize:15, fontWeight:700, color:"#ef4444" }}>¥{r.valB.toLocaleString()}</div>
                          </div>
                        </div>
                      )}
                      <div style={{ fontSize:11, color:"rgba(255,255,255,.60)", lineHeight:1.75 }}>{r.detail}</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Document viewer — show selected docs with highlighted rows */}
        {expanded && results.find(r=>r.id===expanded)?.hl && (
          <div style={{ marginTop:28 }}>
            <div style={{ fontSize:10, color:C.textMut, letterSpacing:".1em", textTransform:"uppercase", marginBottom:12 }}>書類内の該当箇所</div>
            {Object.entries(results.find(r=>r.id===expanded).hl).map(([docId, secIds]) => {
              const def = FORM_DEFS[docId];
              if(!def) return null;
              // Collect all rows, flatten with section headings
              const rows = [];
              def.sections.forEach(sec => {
                rows.push({ type:"heading", label:sec.heading });
                sec.rows.forEach(row => rows.push({ type:"row", ...row, isHl: secIds.includes(row.sec) }));
              });
              const hlRows = rows.filter(r => r.type==="row" && r.isHl);
              const hlSectionHeadings = new Set(
                def.sections.filter(s => s.rows.some(r => secIds.includes(r.sec))).map(s=>s.heading)
              );
              return (
                <div key={docId} style={{ marginBottom:16 }}>
                  <div style={{ fontSize:11, fontWeight:600, color:"rgba(255,255,255,.5)", marginBottom:8, letterSpacing:".06em" }}>{def.title}</div>
                  <Card3 s={{ padding:"0", overflow:"hidden" }}>
                    {def.sections.map((sec, si) => {
                      const hasHl = sec.rows.some(r => secIds.includes(r.sec));
                      return (
                        <div key={si}>
                          <div style={{
                            padding:"7px 14px",
                            fontSize:9, fontWeight:700, letterSpacing:".1em", textTransform:"uppercase",
                            color: hasHl ? "rgba(239,68,68,.8)" : "rgba(255,255,255,.25)",
                            background: hasHl ? "rgba(239,68,68,.06)" : "transparent",
                            borderBottom:`1px solid ${C.border}`,
                          }}>{sec.heading}</div>
                          {sec.rows.map((row, ri) => {
                            const isHl = secIds.includes(row.sec);
                            const fmt = v => v == null ? "—" : typeof v === "number" ? "¥"+v.toLocaleString() : String(v);
                            return (
                              <div key={ri} style={{
                                display:"flex", alignItems:"center", gap:10,
                                padding:"9px 14px",
                                background: isHl ? "rgba(239,68,68,.10)" : "transparent",
                                borderLeft: isHl ? "3px solid #ef4444" : "3px solid transparent",
                                borderBottom: ri < sec.rows.length-1 ? `1px solid rgba(255,255,255,.04)` : "none",
                                transition:"background .15s",
                              }}>
                                <div style={{ width:28, fontSize:9, color: isHl ? "rgba(239,68,68,.7)" : "rgba(255,255,255,.25)", fontWeight:600, flexShrink:0 }}>{row.sec}</div>
                                <div style={{ flex:1, fontSize:11, color: isHl ? "#fff" : "rgba(255,255,255,.55)", fontWeight: row.bold||isHl ? 700 : 400 }}>{row.l}</div>
                                {row.v != null && typeof row.v === "number" && (
                                  <div style={{ fontSize:12, fontWeight:700, color: isHl ? "#ef4444" : "rgba(255,255,255,.45)", fontVariantNumeric:"tabular-nums" }}>
                                    {fmt(row.v)}
                                  </div>
                                )}
                                {isHl && (
                                  <div style={{ width:6, height:6, borderRadius:"50%", background:"#ef4444", flexShrink:0, boxShadow:"0 0 8px rgba(239,68,68,.9)" }}/>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </Card3>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ marginTop:24 }}>
          <button onClick={()=>{ setStep("select"); setSelected([]); setResults([]); setExpanded(null); }}
            style={{ width:"100%", padding:"12px 0", borderRadius:32, border:`1px solid ${C.border}`, background:"transparent", color:C.textSec, fontSize:12, fontWeight:600, cursor:"pointer", letterSpacing:".06em" }}>
            ← 書類を選び直す
          </button>
        </div>
      </Rv>
    </PageShell>
  );
}


function AuditPage() {
  const [mode, setMode] = useState(null); // null=select, "auto"=from filings, "upload"=custom docs
  const [uploadFiles, setUploadFiles] = useState([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [resolved, setResolved] = useState([]);
  const [dragging, setDragging] = useState(false);

  // Auto-check results (populated from actual data)
  const autoResults = [];

  // Upload-check results (populated from actual uploaded docs)
  const uploadResults = [];

  const startAutoCheck = () => {
    setMode("auto");
    setAnalyzing(true);
    setResolved([]);
    setTimeout(() => { setResults(autoResults); setAnalyzing(false); }, 2200);
  };

  const startUploadCheck = () => {
    if (uploadFiles.length === 0) return;
    setAnalyzing(true);
    setResolved([]);
    setTimeout(() => { setResults(uploadResults); setAnalyzing(false); }, 2800);
  };

  const addFiles = (fileList) => {
    const nf = Array.from(fileList || []).map(f => ({ name: f.name, size: (f.size / 1024).toFixed(0) + "KB" }));
    setUploadFiles(p => [...p, ...nf]);
  };

  const toggleResolve = (id) => {
    setResolved(r => r.includes(id) ? r.filter(x => x !== id) : [...r, id]);
  };

  const errCount = results ? results.filter(r => r.severity === "err").length : 0;
  const warnCount = results ? results.filter(r => r.severity === "warn").length : 0;
  const okCount = results ? results.filter(r => r.severity === "ok").length : 0;
  const totalIssues = results ? results.filter(r => r.severity !== "ok").length : 0;
  const resolvedIssues = results ? results.filter(r => r.severity !== "ok" && resolved.includes(r.id)).length : 0;
  const allClear = results && totalIssues === resolvedIssues;

  const back = () => { setMode(null); setResults(null); setAnalyzing(false); setResolved([]); setUploadFiles([]); };

  // ════ MODE SELECT ════
  if (!mode) {
    return <AuditLandingSelector onSelect={(m) => {
      if(m === "upload") { setMode("upload"); }
      else { setMode("numeric"); }
    }}/>;
  }

  if (mode === "numeric") {
    return <NumericAuditPage onBack={() => setMode(null)} />;
  }

  if (mode === "upload" && !results && !analyzing) {
    return (
      <PageShell title="書類チェック" watermark={"Che\nck"}>
        <Rv><div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20 }}>
          <button type="button" onClick={back} style={{ padding:"6px 14px", borderRadius:100, border:`1px solid ${C.border}`, background:"transparent", color:C.textMut, fontSize:10, fontWeight:500, cursor:"pointer", fontFamily:bd }}>← 戻る</button>
          <span style={{ fontSize:12, color:C.textSec, fontWeight:500, letterSpacing:".04em" }}>書類をアップロード</span>
        </div></Rv>
        <Rv d={10}><Card3 s={{ padding:"32px 24px", textAlign:"center", marginBottom:20 }}>
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={e => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
            style={{ border: dragging ? "2px solid rgba(139,123,244,.5)" : "2px dashed rgba(139,123,244,.15)", borderRadius:20, padding:"40px 24px", background: dragging ? "rgba(139,123,244,.06)" : "transparent", transition:"all .3s", cursor:"pointer" }}
            onClick={() => { const inp = document.createElement("input"); inp.type="file"; inp.multiple=true; inp.accept=".pdf,.jpg,.jpeg,.png,.xlsx,.xls,.csv"; inp.onchange=e=>addFiles(e.target.files); inp.click(); }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(168,155,255,.4)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display:"block", margin:"0 auto 10px" }}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
            <div style={{ fontSize:15, color:"rgba(196,184,255,.6)", fontWeight:700 }}>ドラッグ＆ドロップ</div>
            <div style={{ fontSize:12, color:"rgba(168,155,255,.3)", marginTop:8 }}>またはクリックしてファイルを選択</div>
          </div>
          {uploadFiles.length > 0 && (
            <div style={{ marginTop:20, textAlign:"left" }}>
              <div style={{ fontSize:10, color:C.textMut, fontWeight:500, letterSpacing:".1em", marginBottom:8 }}>アップロード済み ({uploadFiles.length}件)</div>
              {uploadFiles.map((f,i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 12px", borderRadius:12, background:"rgba(255,255,255,.02)", marginBottom:4 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7BE0A0" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg>
                  <span style={{ fontSize:11, color:"#E0DAFF", flex:1 }}>{f.name}</span>
                  <span style={{ fontSize:10, color:C.textMut }}>{f.size}</span>
                </div>
              ))}
            </div>
          )}
        </Card3></Rv>
        <Rv d={20}><Mag onClick={startUploadCheck} s={{
          padding:"14px 40px", borderRadius:100,
          border: uploadFiles.length > 0 ? "1.5px solid rgba(139,123,244,.5)" : "1.5px solid rgba(255,255,255,.06)",
          background: uploadFiles.length > 0 ? "rgba(139,123,244,.08)" : "transparent",
          color: uploadFiles.length > 0 ? "#C4B8FF" : C.textMut,
          fontSize:13, fontWeight:700, cursor: uploadFiles.length > 0 ? "pointer" : "default",
          fontFamily:bd, letterSpacing:".06em",
          boxShadow: uploadFiles.length > 0 ? "0 0 16px rgba(139,123,244,.35)" : "none",
          width:"100%", textAlign:"center",
        }}>チェックを開始</Mag></Rv>
      </PageShell>
    );
  }

  if (analyzing) {
    return (
      <PageShell title="書類チェック" watermark={"Che\nck"}>
        <Rv><Card3 s={{ padding:"60px 24px", textAlign:"center" }}>
          <div style={{ width:48, height:48, borderRadius:"50%", border:`2px solid ${C.border}`, borderTopColor:"#fff", margin:"0 auto 20px", animation:"spin 1s linear infinite", boxShadow:"0 0 16px rgba(255,255,255,.2), 0 0 40px rgba(255,255,255,.08)" }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          <div style={{ fontFamily:hd, fontSize:20, fontWeight:400, color:"#fff", marginBottom:8 }}>分析中...</div>
          <div style={{ fontSize:12, color:C.textMut }}>{mode === "auto" ? "申告書・帳簿データを照合しています" : `${uploadFiles.length}件の書類を読み取り中`}</div>
        </Card3></Rv>
      </PageShell>
    );
  }

  // ════ RESULTS ════
  return (
    <PageShell title="書類チェック" watermark={"Che\nck"}>
      {/* Header */}
      <Rv><div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <button type="button" onClick={back} style={{ padding:"6px 14px", borderRadius:100, border:`1px solid ${C.border}`, background:"transparent", color:C.textMut, fontSize:10, fontWeight:500, cursor:"pointer", fontFamily:bd }}>← 戻る</button>
          <span style={{ fontSize:12, color:C.textSec, fontWeight:500, letterSpacing:".04em" }}>{mode === "auto" ? "申告書チェック結果" : "アップロード書類チェック結果"}</span>
        </div>
        {allClear && <span style={{ fontSize:10, color:C.b4, fontWeight:600, padding:"4px 12px", border:`1px solid ${C.b4}40`, borderRadius:100 }}>全件解消済み</span>}
      </div></Rv>

      {/* Summary bar */}
      <Rv d={5}><div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:20 }}>
        <Card3 s={{ padding:"20px 18px", textAlign:"center" }}>
          <div style={{ fontFamily:hd, fontSize:36, fontWeight:300, color:"#fff", letterSpacing:"-.02em", textShadow:"0 0 16px rgba(255,255,255,.3), 0 0 40px rgba(255,255,255,.1)" }}>{results.length}</div>
          <div style={{ fontSize:9, color:C.textMut, fontWeight:500, letterSpacing:".08em" }}>チェック項目</div>
        </Card3>
        <Card3 s={{ padding:"20px 18px", textAlign:"center" }}>
          <div style={{ fontFamily:hd, fontSize:32, fontWeight:300, color:C.b4, textShadow:`0 0 12px ${C.b4}60` }}>{okCount}</div>
          <div style={{ fontSize:9, color:C.textMut, fontWeight:500, letterSpacing:".08em" }}>問題なし</div>
        </Card3>
        <Card3 s={{ padding:"20px 18px", textAlign:"center" }}>
          <div style={{ fontFamily:hd, fontSize:32, fontWeight:300, color:"rgba(255,255,255,.45)", textShadow:"0 0 10px rgba(255,255,255,.15)" }}>{warnCount}</div>
          <div style={{ fontSize:9, color:C.textMut, fontWeight:500, letterSpacing:".08em" }}>要確認</div>
        </Card3>
        <Card3 s={{ padding:"20px 18px", textAlign:"center" }}>
          <div style={{ fontFamily:hd, fontSize:32, fontWeight:300, color:C.b1, textShadow:`0 0 12px ${C.b1}60` }}>{errCount}</div>
          <div style={{ fontSize:9, color:C.textMut, fontWeight:500, letterSpacing:".08em" }}>問題あり</div>
        </Card3>
      </div></Rv>

      {/* Issues first */}
      {results.filter(r => r.severity !== "ok").length > 0 && (
        <Rv d={10}><Card3 s={{ padding:"18px 20px", marginBottom:12 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
            <span style={{ fontSize:9, color:C.textMut, fontWeight:500, letterSpacing:".12em", textTransform:"uppercase", fontFamily:hd }}>要対応</span>
            <span style={{ fontSize:10, color:C.textSec }}>{resolvedIssues}/{totalIssues} 解消</span>
          </div>
          {results.filter(r => r.severity !== "ok").map(r => {
            const isResolved = resolved.includes(r.id);
            const col = r.severity === "err" ? C.b1 : "rgba(139,123,244,.45)";
            return (
              <div key={r.id} style={{ display:"flex", gap:12, padding:"12px 0", borderTop:`1px solid ${C.border}`, opacity:isResolved ? 0.5 : 1, transition:"opacity .2s" }}>
                <div style={{ width:32, height:32, borderRadius:"50%", background:isResolved ? C.greenBg : `${col}15`, border:`1px solid ${isResolved ? "rgba(123,224,160,.12)" : `${col}30`}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:2, boxShadow:isResolved ? "0 0 10px rgba(123,224,160,.15), 0 0 24px rgba(123,224,160,.06)" : `0 0 12px ${col}35, 0 0 28px ${col}12` }}>
                  {isResolved
                    ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.b4} strokeWidth="2.5" style={{ filter:"drop-shadow(0 0 5px rgba(255,255,255,.3))" }}><path d="M20 6L9 17l-5-5" /></svg>
                    : <span style={{ fontSize:12, fontWeight:700, color:col, textShadow:`0 0 8px ${col}` }}>{r.severity === "err" ? "!" : "?"}</span>}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, color:isResolved ? C.textMut : "#fff", fontWeight:500, marginBottom:3, textDecoration:isResolved ? "line-through" : "none" }}>{r.label}</div>
                  <div style={{ fontSize:11, color:C.textMut, lineHeight:1.6 }}>{r.detail}</div>
                </div>
                <button type="button" onClick={() => toggleResolve(r.id)}
                  style={{ padding:"6px 14px", borderRadius:14, border:`1px solid ${isResolved ? C.b4 + "40" : C.border}`, background:"transparent", color:isResolved ? C.b4 : C.textSec, fontSize:10, fontWeight:500, cursor:"pointer", fontFamily:bd, alignSelf:"center", flexShrink:0 }}>
                  {isResolved ? "解消済み" : "確認する"}
                </button>
              </div>
            );
          })}
        </Card3></Rv>
      )}

      {/* OK items */}
      <Rv d={15}><Card3 s={{ padding:"18px 20px", marginBottom:12 }}>
        <div style={{ fontSize:9, color:C.textMut, fontWeight:500, letterSpacing:".12em", textTransform:"uppercase", fontFamily:hd, marginBottom:12 }}>問題なし</div>
        {results.filter(r => r.severity === "ok").map((r, i) => (
          <div key={r.id} style={{ display:"flex", gap:10, padding:"8px 0", borderTop:i ? `1px solid ${C.border}` : "none" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.b4} strokeWidth="2.5" style={{ flexShrink:0, marginTop:2, filter:"drop-shadow(0 0 5px rgba(255,255,255,.25))" }}><path d="M20 6L9 17l-5-5" /></svg>
            <div>
              <div style={{ fontSize:12, color:C.textSec, fontWeight:500 }}>{r.label}</div>
              <div style={{ fontSize:10, color:C.textMut, lineHeight:1.5, marginTop:1 }}>{r.detail}</div>
            </div>
          </div>
        ))}
      </Card3></Rv>

      {/* Submit section */}
      <Rv d={20}><Card3 s={{ padding:"24px 20px", textAlign:"center" }}>
        {allClear ? (<>
          <div style={{ width:52, height:52, borderRadius:"50%", background:C.greenBg, border:"1px solid rgba(123,224,160,.15)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 12px", boxShadow:"0 0 16px rgba(123,224,160,.2), 0 0 40px rgba(123,224,160,.08)" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.b4} strokeWidth="2.5" style={{ filter:"drop-shadow(0 0 6px rgba(255,255,255,.3))" }}><path d="M20 6L9 17l-5-5" /></svg>
          </div>
          <div style={{ fontFamily:hd, fontSize:22, fontWeight:400, color:C.b4, marginBottom:6, letterSpacing:"-.01em", textShadow:`0 0 14px ${C.b4}50` }}>全チェック完了</div>
          <div style={{ fontSize:11, color:C.textMut, marginBottom:16 }}>提出の準備ができました</div>
          <Mag s={{ padding:"14px 36px", border:"none", borderRadius:18, background:"rgba(139,123,244,.12)", color:"#C4B8FF", border:"1px solid rgba(139,123,244,.3)", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:bd, boxShadow:"0 0 14px rgba(139,123,244,.3), 0 0 36px rgba(139,123,244,.1)" }}>提出を確定する</Mag>
        </>) : (<>
          <div style={{ fontSize:12, color:C.textMut, marginBottom:4 }}>要対応の項目を解消すると提出できます</div>
          <div style={{ fontFamily:hd, fontSize:18, fontWeight:400, color:"#fff", letterSpacing:"-.01em" }}>{resolvedIssues}/{totalIssues} <span style={{fontSize:12, fontWeight:400, color:C.textSec}}>解消済み</span></div>
          <div style={{ height:4, background:C.border, borderRadius:8, marginTop:10, overflow:"hidden" }}>
            <div style={{ height:"100%", width:totalIssues > 0 ? `${(resolvedIssues / totalIssues) * 100}%` : "0%", background:C.b4, borderRadius:8, transition:"width .3s", boxShadow:"0 0 8px rgba(255,255,255,.2), 0 0 20px rgba(255,255,255,.08)" }} />
          </div>
        </>)}
      </Card3></Rv>
    </PageShell>
  );
}



/* ═══ Report Helper Components ═══ */

export default AuditPage;
