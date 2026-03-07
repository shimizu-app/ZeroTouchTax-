import React, { useState, useEffect, useRef, useCallback } from "react";
import { C, hd, bd, mono } from "../lib/theme";
import { Rv, Mag, Card3, PageShell, PressableCard } from "./ui";
import { HoloBadge, COMPANY_TYPES } from "./Intake";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function RProse({ children }) { return <div style={{ fontSize:13, color:C.textSec, lineHeight:1.85, letterSpacing:".01em" }}>{children}</div>; }
function RStrong({ children }) { return <span style={{ color:"#fff", fontWeight:600 }}>{children}</span>; }
function RNum({ children, color="#fff" }) { return <span style={{ fontFamily:hd, fontWeight:600, color, letterSpacing:"-.01em" }}>{children}</span>; }
function RAccent({ children }) { return <span style={{ color:C.purpleLight, fontWeight:500 }}>{children}</span>; }
function RCallout({ type="info", children }) {
  const cls = { info:C.purpleLight, warn:"#F0C866", danger:"#E87070", good:"#7BE0A0" };
  const c = cls[type]||C.purpleLight;
  return <div style={{ padding:"14px 18px", background:`${c}08`, border:`1px solid ${c}18`, borderRadius:14, marginTop:16, marginBottom:8 }}><RProse>{children}</RProse></div>;
}
function RDivider() { return <div style={{ height:1, background:C.border, margin:"20px 0" }} />; }
function RIconBadge({ children, color="rgba(255,255,255,.6)" }) { return <div style={{ width:40, height:40, borderRadius:"50%", background:"rgba(255,255,255,.03)", border:"1px solid rgba(255,255,255,.06)", display:"flex", alignItems:"center", justifyContent:"center", color, flexShrink:0 }}>{children}</div>; }
function RKpiRow({ items }) { return <div style={{ display:"grid", gridTemplateColumns:`repeat(${items.length},1fr)`, gap:10, marginBottom:24 }}>{items.map((k,i) => <div key={i} style={{ padding:"16px 14px", background:"rgba(255,255,255,.02)", border:`1px solid ${C.border}`, borderRadius:14, textAlign:"center" }}><div style={{ fontSize:9, color:C.textMut, fontFamily:mono, letterSpacing:".08em", marginBottom:6 }}>{k.l}</div><div style={{ fontFamily:hd, fontSize:20, fontWeight:300, color:k.c||"#fff", letterSpacing:"-.02em", textShadow:`0 0 16px ${k.c||"#fff"}25` }}>{k.v}</div></div>)}</div>; }
function RBeforeAfter({ icon, name, before, after, save, children }) {
  return <div style={{ padding:"18px 0" }}>
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}><RIconBadge>{icon}</RIconBadge><span style={{ fontSize:14, color:"#fff", fontWeight:600 }}>{name}</span></div>
      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
        <span style={{ fontFamily:hd, fontSize:14, color:C.textMut }}>{before}</span>
        <span style={{ color:"rgba(255,255,255,.15)", fontSize:10 }}>→</span>
        <span style={{ fontFamily:hd, fontSize:14, color:"#fff", fontWeight:600 }}>{after}</span>
        <span style={{ fontFamily:mono, fontSize:11, color:"#7BE0A0", fontWeight:600, background:"rgba(123,224,160,.06)", padding:"3px 8px", borderRadius:6 }}>{save}</span>
      </div>
    </div>
    <RProse>{children}</RProse>
  </div>;
}
function RTimeline({ items }) {
  return <div style={{ position:"relative", paddingLeft:32 }}>
    <div style={{ position:"absolute", left:7, top:8, bottom:8, width:1, background:"linear-gradient(180deg, rgba(139,123,244,.6), rgba(139,123,244,.1))" }} />
    {items.map((s,i) => <div key={i} style={{ position:"relative", marginBottom:i<items.length-1?24:0 }}>
      <div style={{ position:"absolute", left:-32, top:2, width:16, height:16, borderRadius:"50%", background:i===0?"#8B7BF4":"transparent", border:`2px solid ${i===0?"#8B7BF4":"rgba(255,255,255,.12)"}`, boxShadow:i===0?"0 0 10px rgba(139,123,244,.5)":"none", display:"flex", alignItems:"center", justifyContent:"center" }}>{i===0 && <div style={{ width:4, height:4, borderRadius:"50%", background:"#fff" }} />}</div>
      <div style={{ display:"flex", gap:14, alignItems:"flex-start" }}>
        <span style={{ fontFamily:mono, fontSize:10, color:i===0?"#8B7BF4":C.textMut, fontWeight:600, minWidth:56, paddingTop:1 }}>{s.date}</span>
        <div style={{ flex:1 }}><div style={{ fontSize:14, fontWeight:600, color:i===0?"#fff":C.textSec, marginBottom:6 }}>{s.label}</div><RProse>{s.detail}</RProse></div>
      </div>
    </div>)}
  </div>;
}
function RScoreItem({ label, actual, threshold, unit, max, pass=true }) {
  return <div style={{ display:"flex", alignItems:"center", gap:12, padding:"14px 0" }}>
    <div style={{ width:24, height:24, borderRadius:"50%", background:pass?"rgba(123,224,160,.08)":"rgba(232,112,112,.08)", border:`1px solid ${pass?"rgba(123,224,160,.15)":"rgba(232,112,112,.15)"}`, display:"flex", alignItems:"center", justifyContent:"center", color:pass?"#7BE0A0":"#E87070", fontSize:11, fontWeight:700 }}>{pass?"✓":"!"}</div>
    <div style={{ width:100, fontSize:12, color:C.textSec }}>{label}</div>
    {actual!==null ? <><div style={{ flex:1, height:6, background:"rgba(255,255,255,.03)", borderRadius:3, position:"relative" }}>
      <div style={{ position:"absolute", left:`${(threshold/max)*100}%`, top:-3, bottom:-3, width:1, background:"rgba(255,255,255,.2)" }} />
      <div style={{ position:"absolute", left:`${(threshold/max)*100}%`, top:-15, transform:"translateX(-50%)", fontSize:8, color:C.textMut, fontFamily:mono, whiteSpace:"nowrap" }}>基準{threshold}{unit}</div>
      <div style={{ height:"100%", width:`${Math.min((actual/max)*100,100)}%`, background:`linear-gradient(90deg, ${pass?"#7BE0A0":"#E87070"}40, ${pass?"#7BE0A0":"#E87070"})`, borderRadius:3 }} />
    </div><span style={{ fontFamily:hd, fontSize:15, fontWeight:500, color:"#fff", minWidth:55, textAlign:"right" }}>{actual}{unit}</span></> : <div style={{ flex:1, fontSize:12, color:"#7BE0A0", fontWeight:500 }}>実績あり</div>}
  </div>;
}
function RBar({ label, value, max, color="#8B7BF4", suffix="" }) {
  return <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:12 }}>
    <div style={{ width:80, fontSize:11, color:C.textSec, textAlign:"right" }}>{label}</div>
    <div style={{ flex:1, height:24, background:"rgba(255,255,255,.02)", borderRadius:6, position:"relative" }}>
      <div style={{ position:"absolute", top:0, left:0, bottom:0, width:`${(value/max)*100}%`, background:`linear-gradient(90deg, ${color}30, ${color}90)`, borderRadius:6 }} />
      <div style={{ position:"absolute", top:"50%", transform:"translateY(-50%)", right:10, fontFamily:hd, fontSize:13, fontWeight:600, color:"#fff" }}>{value}{suffix}</div>
    </div>
  </div>;
}
const RI = {
  pc:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>,
  phone:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/></svg>,
  bldg:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="1"/><path d="M9 22v-4h6v4M8 6h.01M16 6h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01"/></svg>,
  ppl:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>,
  bolt:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  chart:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>,
  shield:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  doc:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
  coin:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>,
  alert:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01"/></svg>,
};
/* ════════════════════════════════ コンサル (CONSULT) ════════════════════════════════ */
function ConsultPage({ goalMode, setGoalMode }) {
  // ═══ 全stateを最初に宣言（Reactのルール） ═══
  const [selected, setSelected] = useState(null);
  const [chatMsgs, setChatMsgs] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [rci, setRci] = useState(0);
  const [showOverview, setShowOverview] = useState(true);
  const [COMPANY_DATA, setCOMPANY_DATA] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [reportContent, setReportContent] = useState({});
  const [reportLoading, setReportLoading] = useState({});
  const [chatLoading, setChatLoading] = useState(false);

  const ic = (d) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d={d}/></svg>;

  /* ═══ アーキタイプ別優先カード順序 ═══ */
  const ARCHETYPE_PRIORITY = {
    leviathan: ["loanStrategy","cashflow","execComp","costStructure","taxSim","filingTax","salesTrend","marketing","laborCost","procurement","capexSubsidy","corpStrategy"],
    phoenix:   ["costStructure","cashflow","procurement","loanStrategy","laborCost","taxSim","filingTax","salesTrend","execComp","capexSubsidy","marketing","corpStrategy"],
    dragon:    ["salesTrend","cashflow","laborCost","taxSim","marketing","costStructure","loanStrategy","execComp","capexSubsidy","procurement","filingTax","corpStrategy"],
    sphinx:    ["taxSim","execComp","filingTax","capexSubsidy","corpStrategy","costStructure","cashflow","loanStrategy","laborCost","salesTrend","procurement","marketing"],
    chimera:   ["corpStrategy","costStructure","taxSim","laborCost","cashflow","loanStrategy","capexSubsidy","execComp","salesTrend","procurement","filingTax","marketing"],
    kraken:    ["cashflow","procurement","costStructure","loanStrategy","taxSim","laborCost","salesTrend","filingTax","execComp","capexSubsidy","marketing","corpStrategy"],
    griffin:   ["corpStrategy","execComp","taxSim","capexSubsidy","loanStrategy","cashflow","costStructure","laborCost","filingTax","salesTrend","procurement","marketing"],
    unicorn:   ["capexSubsidy","cashflow","loanStrategy","taxSim","salesTrend","costStructure","filingTax","laborCost","execComp","procurement","marketing","corpStrategy"],
    golem:     ["taxSim","execComp","capexSubsidy","corpStrategy","costStructure","cashflow","laborCost","loanStrategy","procurement","filingTax","salesTrend","marketing"],
  };

  const ARCHETYPE_TOP3 = {
    leviathan: [
      { n:"1", title:"決算書を融資目線で整える", detail:"売掛回収サイトの短縮で銀行への返済余力をアピール", c:"#60b8ff", card:"loanStrategy" },
      { n:"2", title:"役員報酬を融資有利に調整", detail:"報酬調整で法人利益を積み上げ。銀行の黒字評価に直結", c:"#60b8ff", card:"execComp" },
      { n:"3", title:"キャッシュフロー計画の整備", detail:"13週間CF予測を作成。融資面談で「資金計画がある経営者」を示す", c:"#60b8ff", card:"cashflow" },
    ],
    phoenix: [
      { n:"1", title:"固定費を今月中に削れる分だけ削る", detail:"SaaS解約・外注費交渉で即時改善。損益分岐点を下げる", c:"#ff9060", card:"costStructure" },
      { n:"2", title:"売掛回収サイクルの短縮", detail:"回収サイト短縮でCF改善。資金ショートを防ぐ最優先施策", c:"#ff9060", card:"cashflow" },
      { n:"3", title:"借入条件のリスケ検討", detail:"返済負担が重い場合は早期に金融機関と条件変更交渉。手遅れ前に動く", c:"#ff9060", card:"loanStrategy" },
    ],
    dragon: [
      { n:"1", title:"成長を支えるCF計画を立てる", detail:"人員増・投資増に備えた四半期CF予測。黒字でも資金ショートするリスクを先読み", c:"#00e8d0", card:"cashflow" },
      { n:"2", title:"人件費の生産性を測る", detail:"急拡大期に採用が先行しがち。部門別1人あたり売上を四半期ごとに追う", c:"#00e8d0", card:"laborCost" },
      { n:"3", title:"法人税の繰り延べ策を設計", detail:"節税3段重ねで成長投資の原資を確保するための必須施策", c:"#00e8d0", card:"taxSim" },
    ],
    sphinx: [
      { n:"1", title:"節税3段重ねを今期中に実行", detail:"小規模共済+iDeCo+セーフティ共済で節税。今月動けば今期適用", c:"#d080ff", card:"taxSim" },
      { n:"2", title:"役員報酬の最適額を再設計", detail:"法人税×所得税の交差点を計算。退職金積立と組み合わせた総合設計が必要", c:"#d080ff", card:"execComp" },
      { n:"3", title:"補助金・税制優遇のフル活用", detail:"少額償却残枠が期末に消滅。今期中に設備購入か経費化を判断", c:"#d080ff", card:"capexSubsidy" },
    ],
    chimera: [
      { n:"1", title:"法人分割・持株会社スキームの検討", detail:"事業部門ごとの損益を可視化。どこが利益源でどこがコストセンターかを明確に", c:"#ff80c0", card:"corpStrategy" },
      { n:"2", title:"部門別コスト構造の整理", detail:"固定費率62%の内訳を部門別に分解。グループ全体の最適化ポイントを特定", c:"#ff80c0", card:"costStructure" },
      { n:"3", title:"グループ税務の最適化", detail:"節税3段重ねに加えグループ通算制度の適用可否を検討。専門家と設計を", c:"#ff80c0", card:"taxSim" },
    ],
    kraken: [
      { n:"1", title:"13週間CFシミュレーションの作成", detail:"資金ショートを2ヶ月先まで予測する習慣。月次では手遅れになることがある", c:"#40d0ff", card:"cashflow" },
      { n:"2", title:"売掛回収を業界最速に", detail:"回収サイト短縮でCF改善。新規契約から条件変更を徹底する", c:"#40d0ff", card:"procurement" },
      { n:"3", title:"仕入・支払条件の見直し", detail:"支払サイトを30日→45日に延長交渉。回収短縮と合わせてCFギャップをゼロに", c:"#40d0ff", card:"costStructure" },
    ],
    griffin: [
      { n:"1", title:"役員退職金の積立設計を開始", detail:"最終報酬×在任年数×功績倍率で損金算入。今から原資積立が必要", c:"#e8c040", card:"execComp" },
      { n:"2", title:"企業価値評価に有利なBSを作る", detail:"不良資産の整理と純資産の積み上げ。M&Aバリュエーションに直結する", c:"#e8c040", card:"corpStrategy" },
      { n:"3", title:"節税で手元資金を最大化", detail:"出口直前の大きな節税より、今から積み上げる節税の方が効果が大きい", c:"#e8c040", card:"taxSim" },
    ],
    unicorn: [
      { n:"1", title:"補助金・助成金の申請を今すぐ", detail:"IT導入補助金・ものづくり補助金など3件が申請可能。期限があるので先手を", c:"#a0c8ff", card:"capexSubsidy" },
      { n:"2", title:"創業融資の枠を早期に確保", detail:"設立後3年以内は政策金融公庫の融資が通りやすい。タイミングを逃さない", c:"#a0c8ff", card:"loanStrategy" },
      { n:"3", title:"青色申告と記帳体制の整備", detail:"創業初年度の税務ミスは後年に響く。今期の申告を正確に仕上げることが最優先", c:"#a0c8ff", card:"filingTax" },
    ],
    golem: [
      { n:"1", title:"節税3段重ねで内部留保を最大化", detail:"小規模共済+iDeCo+セーフティ共済で節税。安定期こそ節税効果が高い", c:"#70e880", card:"taxSim" },
      { n:"2", title:"役員退職金の積立を本格化", detail:"安定利益を退職金原資に変換。法人税を払うより将来の手取りを増やす設計を", c:"#70e880", card:"execComp" },
      { n:"3", title:"内部留保の運用方針を決める", detail:"積み上がった手元資金をどう使うか。設備投資・補助金活用・次世代承継の設計を", c:"#70e880", card:"capexSubsidy" },
    ],
  };

  // Supabaseから取得した企業データのアーキタイプを使う（ロード前はleviathan仮表示）
  const activeArchetype = COMPANY_DATA
    ? (COMPANY_TYPES[Object.keys(COMPANY_TYPES).find(k => COMPANY_TYPES[k].name === COMPANY_DATA.archetype || COMPANY_TYPES[k].jp === COMPANY_DATA.archetypeJp)] || COMPANY_TYPES.leviathan)
    : COMPANY_TYPES.leviathan;
  const priorityOrder = ARCHETYPE_PRIORITY[activeArchetype.id] || ARCHETYPE_PRIORITY.leviathan;
  const top3 = ARCHETYPE_TOP3[activeArchetype.id] || ARCHETYPE_TOP3.leviathan;
  const ac = activeArchetype.color;

  /* ═══ 6 pillars ═══ */
  const pillars = [
    { cat:"全体", items:[
      { id:"overview", label:"全体分析", sub:"6領域の財務診断・アーキタイプ別優先アクション",
        icon:<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/><path d="M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z"/></svg> },
    ]},
    { cat:"売上・成長", items:[
      { id:"salesTrend", label:"売上トレンド分析", sub:"月次推移・前年比・顧客依存度・単価変動",
        icon:<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 6l-9.5 9.5-5-5L1 18"/><path d="M17 6h6v6"/></svg> },
      { id:"marketing", label:"集客・マーケ戦略", sub:"広告ROI・チャネル分析・業種別施策",
        icon:<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg> },
    ]},
    { cat:"コスト・効率", items:[
      { id:"costStructure", label:"経費構造分析", sub:"固定費/変動費・異常値・感度分析・業界比較",
        icon:<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12H9M15 18l-6-6 6-6"/></svg> },
      { id:"procurement", label:"取引条件・仕入改善", sub:"支払サイト・単価交渉・まとめ買い・早期割引",
        icon:<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18"/><path d="M16 10a4 4 0 01-8 0"/></svg> },
    ]},
    { cat:"人件費・組織", items:[
      { id:"laborCost", label:"人件費・生産性", sub:"部門別生産性・残業分析・雇用形態最適化",
        icon:<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6M22 11h-6"/></svg> },
      { id:"execComp", label:"役員報酬・退職金", sub:"最適報酬設計・中退共・出口戦略",
        icon:<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg> },
    ]},
    { cat:"税務・申告", items:[
      { id:"taxSim", label:"節税シミュレーション", sub:"重ね技・業種別経費・控除積上げ・タイミング",
        icon:<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg> },
      { id:"filingTax", label:"申告・消費税・インボイス", sub:"確定申告進捗・消費税最適化・インボイス対応",
        icon:<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M9 15l2 2 4-4"/></svg> },
    ]},
    { cat:"資金・融資", items:[
      { id:"cashflow", label:"キャッシュフロー", sub:"CF予測・季節変動・運転資金・売掛回収",
        icon:<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M2 12h20"/><path d="M17 7l-5 5-3-3-4 4"/></svg> },
      { id:"loanStrategy", label:"融資・返済戦略", sub:"返済負担率・借換え・追加融資逆算・増資",
        icon:<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18M3 10h18M5 6l7-3 7 3"/><path d="M4 10v11M8 10v11M12 10v11M16 10v11M20 10v11"/></svg> },
    ]},
    { cat:"資産・制度活用", items:[
      { id:"capexSubsidy", label:"設備投資・補助金", sub:"税制優遇・補助金マッチング・リース最適化",
        icon:<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg> },
      { id:"corpStrategy", label:"法人成り・事業承継", sub:"法人化シミュレーション・出口設計",
        icon:<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="4"/><path d="M9 22v-4h6v4M8 6h.01M12 6h.01M16 6h.01M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01"/></svg> },
    ]},
  ];
  const allCards = pillars.flatMap(p => p.items);

  // アーキタイプ順にカード全体をソート（カード詳細用）
  const sortedCards = [...allCards].sort((a, b) => {
    const ai = priorityOrder.indexOf(a.id);
    const bi = priorityOrder.indexOf(b.id);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });

  // 全体カテゴリは常に先頭、残りをアーキタイプ順でソート
  const sortedPillars = [
    ...pillars.filter(p => p.cat === "全体"),
    ...[...pillars.filter(p => p.cat !== "全体")].sort((a, b) => {
      const aMin = Math.min(...a.items.map(i => { const idx = priorityOrder.indexOf(i.id); return idx === -1 ? 99 : idx; }));
      const bMin = Math.min(...b.items.map(i => { const idx = priorityOrder.indexOf(i.id); return idx === -1 ? 99 : idx; }));
      return aMin - bMin;
    }),
  ];

  /* ═══ Overall Analysis Grades ═══ */
  const overviewGrades = [];

  /* ═══ KPIs per card ═══ */
  const allKPIs = {
    salesTrend:[{l:"月間売上",v:"—"},{l:"前年同月比",v:"—"},{l:"顧客数",v:"—"},{l:"平均単価",v:"—"}],
    marketing:[{l:"広告費/月",v:"—"},{l:"広告費比率",v:"—"},{l:"新規獲得",v:"—"},{l:"紹介依存率",v:"—"}],
    costStructure:[{l:"月間経費",v:"—"},{l:"固定費率",v:"—"},{l:"削減可能",v:"—"},{l:"前年比",v:"—"}],
    procurement:[{l:"仕入原価",v:"—"},{l:"支払サイト",v:"—"},{l:"回収サイト",v:"—"},{l:"交渉余地",v:"—"}],
    laborCost:[{l:"人件費/月",v:"—"},{l:"人件費率",v:"—"},{l:"1人あたり売上",v:"—"},{l:"残業代/月",v:"—"}],
    execComp:[{l:"役員報酬/月",v:"—"},{l:"法人税率",v:"—"},{l:"所得税率",v:"—"},{l:"最適報酬",v:"—"}],
    taxSim:[{l:"推定法人税",v:"—"},{l:"推定消費税",v:"—"},{l:"節税余地",v:"—"},{l:"実効税率",v:"—"}],
    filingTax:[{l:"確定申告",v:"—"},{l:"消費税申告",v:"—"},{l:"期限まで",v:"—"},{l:"インボイス",v:"—"}],
    cashflow:[{l:"預金残高",v:"—"},{l:"月間CF",v:"—"},{l:"運転資金月数",v:"—"},{l:"売掛回収",v:"—"}],
    loanStrategy:[{l:"借入残高",v:"—"},{l:"月間返済",v:"—"},{l:"返済比率",v:"—"},{l:"加重平均金利",v:"—"}],
    capexSubsidy:[{l:"固定資産残高",v:"—"},{l:"少額特例残枠",v:"—"},{l:"申請可能補助金",v:"—"},{l:"投資余力",v:"—"}],
    corpStrategy:[{l:"個人税額(推定)",v:"—"},{l:"法人税額(推定)",v:"—"},{l:"差額メリット",v:"—"},{l:"設立コスト",v:"—"}],
  };

  /* ═══ 企業データ（Supabase取得） ═══ */
  React.useEffect(() => {
    if (!SUPABASE_URL || !SUPABASE_KEY) { setDataLoading(false); return; }
    fetch(`${SUPABASE_URL}/rest/v1/companies?select=*&limit=1`, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
    })
      .then(r => r.json())
      .then(data => { if (data?.[0]) setCOMPANY_DATA(data[0]); })
      .catch(() => {})
      .finally(() => setDataLoading(false));
  }, []);

  /* ═══ カード別システムプロンプト ═══ */
  const CARD_PROMPTS = {
    salesTrend: `あなたは日本の中小企業専門の財務コンサルタントです。売上データの分析と将来予測が専門です。

【出力の構成】
以下の3つに絞って出力してください。

1. 現状の数字整理
   - 月商・前年比・顧客数・平均単価のデータをそのまま整理
   - 3軸（前年比・顧客数・単価）のどこが原因で変動しているかを分解する

2. このペースが続くと（将来予測）
   - 現在のトレンドが続いた場合、半年後・1年後の売上がどうなるかを計算して示す
   - 上位顧客依存など構造的リスクがあれば数字で示す

3. まず動くべきポイント
   - 3軸の中で最も改善インパクトが大きい1〜2点に絞る
   - 具体的なアクションを示す

【ルール】
- 「〇日以内」などの期限表現は禁止。「決算前に」「次の契約更新時に」など状況ベースで
- 数字は必ず計算根拠を示す（例：¥1,540万×▲3.2%=月▲¥49万）
- 一般論・抽象論禁止。このデータに基づく内容のみ
- 日本語で出力`,

    marketing: `あなたは日本の中小企業専門の財務コンサルタントです。マーケティング投資の判断支援が専門です。

【出力の構成】
以下の3つに絞って出力してください。

1. 投資不足の診断
   - 現在の広告費比率を業界平均と比較し、どれだけ差があるかを数字で示す
   - 紹介依存率・新規獲得数から「このままでは自然回復しない」根拠を示す

2. 投資できる根拠
   - CFと預金残高から、月いくらなら無理なく投資できるかを計算して示す
   - コスト構造カードとの連動があれば言及する

3. この業種・このフェーズに相性のいい媒体
   - ITコンサル・SaaS業種として効果が出やすい媒体を2〜3つ提案
   - 各媒体の特徴（即効性・長期性・コスト感）を簡潔に比較する
   - 運用の細かい方法は不要。「何から始めるか」の優先順だけ示す

【ルール】
- 期限表現は禁止。状況ベースの表現を使う
- 数字は計算根拠を示す
- 一般論禁止。このデータに基づく内容のみ
- 日本語で出力`,

    costStructure: `あなたは日本の中小企業専門のトップCFOレベルの財務アドバイザーです。業種モデル別コスト構造設計の最高峰の専門家として分析してください。

【出力の構成】

1. この業種モデルにおける「正しいコスト構造」の定義
   - 業種・ビジネスモデル（例：ITコンサル・地域密着型・SNS集客型など）を判断し、その業種で利益を出すために正しいコスト配分の基準を示す
   - 現在のコスト構造がその基準に対してどこがずれているかを数字で比較する
   - 「このモデルでは人件費率が高いのは正常」「この業種で広告費を削るのは逆効果」など業種特性を踏まえた評価をする

2. このモデルで利益を伸ばすレバーはどこか
   - 業種×モデルごとに「ここを動かすと一番効く」というレバーを特定する
   - 単価アップ・回転率・広告投資・外注化など、モデル別に効くアプローチが違うことを示す
   - 各施策のインパクトを数字で試算して優先順を付ける

3. 今すぐ着手できる再設計ポイント
   - 削減すべき項目と、逆に増やすべき投資項目を分けて提案する
   - 削減・増加それぞれの金額インパクトを計算根拠付きで示す
   - 融資審査・CF・節税カードとの連動を明示する

【ルール】
- 期限表現禁止。状況ベースの表現を使う
- 数字は全て計算根拠を示す
- 「コストを削る」より「正しいコスト配分に再設計する」視点で
- 業種一般論禁止。このデータから業種モデルを判断して特化した内容のみ
- 日本語で出力`,

    procurement: `あなたは日本の中小企業専門のトップCFOレベルの財務アドバイザーです。取引条件・運転資本最適化の最高峰の専門家として分析してください。

【出力の構成】

1. 取引条件の現状診断
   - 回収サイトと支払サイトのギャップを計算
   - このギャップによって月商ベースで何万円の資金が常に拘束されているかを金額で示す
   - 業界標準と比較してどちらが不利な条件か評価する

2. 条件改善でCFにどう効くか
   - 回収を短縮した場合 vs 支払を延長した場合、CFへの効果を数字で比較
   - どちらが現実的に交渉しやすいかを顧客・仕入先との力関係から判断して提案

3. CFO目線の交渉戦略
   - 具体的にどの条件をどう変えるか（例：新規契約から適用・既存顧客への段階的交渉）
   - 融資を使わずにCFギャップを埋める最速の手段として位置づけ
   - CFカードとの連動を明示

【ルール】
- 期限表現禁止。状況ベースの表現を使う
- 数字は全て計算根拠を示す
- CFO視点：融資に頼らない自己改善を優先する
- 日本語で出力`,

    laborCost: `あなたは日本の中小企業専門のトップCFOレベルの財務アドバイザーです。人件費・組織生産性の最高峰の専門家として分析してください。

【出力の構成】

1. 人件費の現状診断
   - 人件費率を業界平均と比較し、圧迫しているか余裕があるかを評価
   - 残業代・正社員・外注などの内訳から「どこがコストを押し上げているか」を特定
   - 1人あたり売上を業界標準と比較して生産性を評価する

2. 状況に応じた提案（分岐）
   - 圧迫している場合：削減できる項目（残業代・雇用形態見直し・外注化など）を具体的に提案。削減額を計算根拠付きで示す
   - 余裕がある場合：CFと事業規模から採用投資の余地があるかを評価。採用した場合の売上増加試算を示す

3. 雇用形態と経費の最適化
   - 正社員・パート・業務委託それぞれの経費面での違いを比較
   - この業種・規模で最もコスト効率のいい雇用形態の組み合わせを提案
   - 役員報酬カード・節税カードとの連動を明示

【ルール】
- 期限表現禁止。状況ベースの表現を使う
- 数字は全て計算根拠を示す
- 「決めきる」より「選択肢を示す」提案スタイルで
- 日本語で出力`,

    execComp: `あなたは日本の中小企業専門のトップCFOレベルの財務アドバイザーです。役員報酬設計・退職金・税務最適化の最高峰の専門家として分析してください。

【出力の構成】

1. 現在の報酬設計の診断
   - 現在の役員報酬月額から所得税・住民税・社会保険料を計算し、実質の手取り額を示す
   - 法人の利益水準と合わせて、今の設定が法人税・所得税どちらに偏っているかを評価

2. 手取り最大化の最適報酬額
   - 法人税率と所得税率の交差点を計算し、トータルの税負担が最小になる報酬額を示す
   - 退職金積立（中小企業退職金共済・生命保険）との組み合わせで長期的な手取りをどう最大化するかを設計
   - 計算は所得税・住民税・社保・法人税を全て含めたネットで比較する

3. 家族・配偶者への報酬分散
   - 配偶者や家族を役員・従業員にして報酬を分散することで所得税の累進税率を下げる効果を計算する
   - 分散後の世帯全体の税負担を計算して現状との差額メリットを示す
   - 要件：業務実態があること・報酬額が職務内容に照らして相当であること を必ず説明する
   - 節税シミュカードとの連動を明示する

4. アーキタイプに合わせたトレードオフの判断
   - 融資目線（報酬を下げて法人利益を積む）vs 節税目線（報酬を上げて法人税を下げる）の2択を明示
   - このアーキタイプの優先順位に基づいてどちらを選ぶべきかの判断を示す
   - 融資カード・節税カードとの連動を明示

【ルール】
- 期限表現禁止。状況ベースの表現を使う
- 数字は全て計算根拠を示す（税率×金額=節税額）
- CFO視点：短期の節税より長期の手取り最大化を優先
- 日本語で出力`,

    taxSim: `あなたは日本の中小企業専門のトップCFOレベルの財務アドバイザーです。節税設計・消費税・業種別課税ロジックの最高峰の専門家として分析してください。

【勘定科目の判断フレームワーク】
経費・支出の科目を判断する際は必ず以下の4ステップで推論すること：
① 明らかに該当しない科目を除外する（例：交際費に見えるが業務関連性が薄い→除外）
② 残った候補科目を全て列挙する（例：福利厚生費・会議費・広告宣伝費など）
③ 各候補のメリット・デメリットを比較する（損金算入の要件・税務調査での安全性・税額への影響）
④ 最有力候補が名目上・税務上通せるかを検証する（要件を満たすか・根拠法令・過去の判例・税務署の解釈）
→ 通せる根拠があれば提案。グレーな場合は「要確認」として条件を明示する。

【業界クラスター別の課税ロジック原則】
企業の業種から以下のクラスターを判断して分析に適用すること：

▼ 医療・介護・福祉クラスター
- 介護保険法・医療法に基づくサービスは消費税法別表第二により原則非課税
- 課税判断のキーは「一体性」：施設サービスに付随して提供されるものは非課税だが単体で切り出すと課税
- 食費・居住費は介護報酬との一体性が認められる範囲で非課税。単独提供は課税
- 訪問介護・デイサービス・老人ホーム・障害者施設で同じロジックが適用可能

▼ 飲食・小売クラスター
- 軽減税率8%の適用は「飲食料品の譲渡」かつ「テイクアウト・持帰り」が条件
- 店内飲食10%・テイクアウト8%の区分が業務フローのどこで発生するかが重要
- EC追加で販路開拓補助金の名目が通りやすくなる

▼ IT・コンサルクラスター
- 役務提供は原則課税。国外提供は輸出免税の検討余地あり
- SaaSは「電気通信利用役務の提供」として消費税の特別ルールあり

▼ 建設・製造クラスター
- 材料費・外注費の課税仕入れ構造が複雑。インボイス対応で仕入税額控除の要件確認が必須

【出力の構成】

1. 消費税：簡易課税 vs 原則課税の選択
   - 現在の売上規模・仕入率から簡易課税と原則課税どちらが有利かを計算して比較する
   - みなし仕入率（業種別：第一種90%〜第六種40%）を適用して税額差を示す
   - 選択のタイミング（課税期間開始前の届出が必要）と切り替えの判断基準を示す

2. ✅ 確実にできる節税（今すぐ実行・リスクなし）
   - 各手段：根拠法令・掛金上限・節税額計算（掛金×実効税率）・要件を示す
   - 家族・配偶者への役員報酬・給与による所得分散の効果を計算する（役員報酬カードと連動）
   - シミュレーション：実行後の税額変化を計算して示す

3. ⚠️ 要確認の節税（効果は大きいが解釈・要件の確認が必要）
   - 上記の勘定科目判断フレームワークを適用して各項目を評価する
   - なぜ要確認か・確認すべきポイント・通る条件を明示する
   - シミュレーション：通った場合の節税額を計算して示す

4. 🔄 この変更を加えると新たにできる節税
   - 業種の掛け合わせで名目が通るものを提案する
   - **親和性が自然に見える組み合わせのみ提案。不自然な業種追加は税務署に疑われるため提案しない**
   - シミュレーション：変更後の税額・補助金額の変化を計算して示す

5. 決算対策：期末の利益調整
   - 決算前に実行できる利益圧縮の手法を列挙する（前払費用・在庫評価・修繕費・役員賞与など）
   - 各手法の損金算入要件と税額インパクトを計算根拠付きで示す
   - 融資審査への影響（利益を下げると銀行評価が下がる）とのトレードオフをこのアーキタイプに合わせて判断する

6. 融資審査とのトレードオフ
   - 節税で利益が減ると銀行評価が下がるリスクを数字で示す
   - このアーキタイプの優先順位に基づいてどこまで節税すべきかの判断を示す

【ルール】
- 期限表現禁止。状況ベースの表現を使う
- 数字は全て計算根拠を示す
- 業種クラスターを必ず判断してそのロジックを適用する
- 勘定科目は必ず4ステップフレームワークで推論する
- 親和性のない業種掛け合わせは絶対に提案しない
- 日本語で出力`,

    filingTax: `あなたは日本の中小企業専門のトップCFOレベルの財務アドバイザーです。税務申告戦略の最高峰の専門家として分析してください。

【出力の構成】

1. 今期の申告で確定させる数字の診断
   - 現在の利益水準が消費税の課税・免税の境目（1,000万円）に近いかを評価し、来期の消費税負担への影響を示す
   - インボイス登録状況が取引先との関係・消費税負担にどう影響しているかを評価する
   - 青色申告の特典（赤字繰越10年・特別控除・少額減価償却）を最大限使えているかを確認する

2. 申告は「提出」ではなく「今期の数字を確定させる戦略的判断」
   - 経費の計上タイミング（今期か来期か）で税額がどう変わるかを計算して示す
   - 申告内容が融資審査の決算書になるため、銀行に見せる数字としてどう作るかの判断軸を示す
   - 節税と融資審査のトレードオフ（利益を減らすと節税になるが銀行評価が下がる）をこのアーキタイプに合わせて判断する

3. 申告前に動くべき最終チェック
   - 計上漏れになりやすい経費項目（交際費・減価償却・前払費用など）を洗い出す
   - 消費税の課税区分（課税・非課税・不課税・免税）の見直しポイントを示す
   - 節税カード・融資カードとの連動を明示する

【ルール】
- 期限表現禁止。「申告前に」「決算確定前に」など状況ベースの表現を使う
- 数字は全て計算根拠を示す
- CFO視点：申告を事務作業ではなく経営判断として位置づける
- 日本語で出力`,

    cashflow: `あなたは日本の中小企業専門のトップCFOレベルの財務アドバイザーです。キャッシュフロー管理の最高峰の専門家として分析してください。

【出力の構成】

1. キャッシュ健全性の診断
   - 預金残高を月商比で評価（何ヶ月分か）。業界安全水準と比較
   - CCC（キャッシュコンバージョンサイクル）= 回収日数 - 支払日数 を計算し、何日分・金額にして何万円が資金として拘束されているかを示す
   - 月間CFが継続した場合の資金推移を示す

2. このまま放置すると
   - CF悪化シナリオを数字で示す（売上▲10%・回収遅延などのストレステスト）
   - どのタイミングで資金ショートのリスクが生じるかを明示

3. CFO目線の改善優先順
   - 融資に頼らずCFを改善できる手段を優先順に示す
   - 各施策のCF改善額を計算根拠付きで示す
   - 融資・取引条件カードとの連動を明示

【ルール】
- 期限表現禁止。状況ベースの表現を使う
- 数字は全て計算根拠を示す
- CFO視点：資金の流れを構造的に捉えて提案する
- 日本語で出力`,

    loanStrategy: `あなたは日本の中小企業専門のトップCFOレベルの財務アドバイザーです。融資戦略・金融機関対策の最高峰の専門家として分析してください。

【出力の構成】

1. 今の数字でいくら狙えるか
   - 債務償還年数（借入残高÷（営業利益＋減価償却））・自己資本比率・営業利益率の3指標を計算し、金融機関の審査基準と比較する
   - 現在の数字から上限借入可能額を逆算して示す
   - 目的・名目別に借りられる額の違いを示す（設備資金は運転資金より多く・長期で借りられる理由も説明）

2. BSとコストの見せ方で借りられる額が変わる
   - 審査に不利な項目（役員貸付金・過大な売掛金・赤字・高い固定費率）を特定し、改善すると評価がどう変わるかを数字で示す
   - 今すぐ申請すべきか、数字を整えてから申請すべきかの判断軸を示す
   - 申告直後のタイミングが最も審査に通りやすい理由を説明する
   - 銀行に出す事業計画書に何を書くべきか（売上予測の根拠・返済原資の説明・楽観・中立・悲観の3シナリオ）を具体的に示す

3. どの金融機関からどの順番で攻めるか
   - 公庫→信金→地銀の順番戦略とその理由を示す
   - 保証協会付き融資 vs 直接融資の条件の違いをコスト・スピード・上限額で比較する
   - 複数行同時申請で金利交渉の余地を作る方法を示す
   - 補助金採択実績が信用力向上につながり融資額が増える連動戦略を明示する

4. 融資以外の資金調達との比較
   - ファクタリング（売掛債権の早期現金化・手数料2〜5%）の使いどころと注意点を示す
   - ABL（売掛債権・在庫担保融資）が使える状況かをデータから評価する
   - 融資・ファクタリング・補助金それぞれのコスト・速度・条件を比較して最適な組み合わせを提案する

5. 節税・申告・CFカードとのトレードオフ
   - 節税で利益を減らすと融資審査にどう不利になるかを数字で示す
   - このアーキタイプの優先順位に基づいて節税と融資のバランスをどう取るかの判断を示す

【ルール】
- 期限表現禁止。状況ベースの表現を使う
- 数字は全て計算根拠を示す
- CFO視点：融資は「借りる」ではなく「戦略的に調達する」
- 日本語で出力`,

    capexSubsidy: `あなたは日本の中小企業専門のトップCFOレベルの財務アドバイザーです。補助金戦略・設備投資・税制優遇の最高峰の専門家として分析してください。

【姿勢】
補助金は「出す分だけタダ」。落ちても失うのは手間だけ。リスクを恐れず全部申請する方針でアグレッシブに提案すること。

【出力の構成】

1. 今の数字で対象になる補助金の判定
   - 売上・従業員数・業種・設立年数から今すぐ申請できる補助金を国・都道府県・市区町村の3層で洗い出す
   - 各補助金について：対象要件・補助額・補助率・採択率・申請の難易度 を示す
   - 今の売上水準では対象外でも、この数字になれば狙えるという予測も示す

2. 名目と目的の作り方が採択率を決める
   - 同じ設備投資・経費でも「IT化」「生産性向上」「省エネ」「販路開拓」どの名目で出すかで通過率が全然違うことを示す
   - この企業のデータから最も採択されやすい名目・ストーリーの組み立て方を提案する
   - 人件費・広告費・設備費など各経費項目をどの補助金の名目で計上できるかを具体的に示す

3. 補助金×融資×節税の連動戦略
   - 補助金採択が融資審査の信用力向上につながる連動を説明する
   - 設備投資すると減価償却で利益が減り節税になるが融資審査への影響も説明する
   - 少額減価償却の残枠・税制優遇（中小企業投資促進税制・経営強化税制）との組み合わせを提案する
   - 根拠法令（租税特別措置法○条）・要件・計算根拠を必ず示す

【ルール】
- 期限表現禁止。ただし補助金の公募タイミングは「公募開始後すぐに」など状況ベースで表現
- 数字は全て計算根拠を示す
- CFO視点：補助金は経営戦略の一部として組み込む
- 日本語で出力`,

    corpStrategy: `あなたは日本の中小企業専門のトップCFOレベルの財務アドバイザーです。法人成り・事業戦略・出口設計の最高峰の専門家として分析してください。

【出力の構成】

1. 個人事業のままでの節税の限界を先に示す
   - 現在の売上・利益水準で個人事業として使える節税手段を全て列挙し、その限界額を計算する
   - 「ここまでやり切った上でまだ税負担が重い」という状態を数字で示してから法人化の必要性を説く

2. 個人vs法人の税負担を全部込みで比較
   - 個人事業：所得税・住民税・事業税・国民健康保険 を全て計算
   - 法人：法人税・法人住民税・法人事業税＋役員報酬への所得税・社保 を全て計算
   - 差額メリットを年間金額で明示し、設立コストの回収期間を計算する

3. 法人化で使える追加の節税手段
   - 個人事業では使えないが法人では使える節税手段を列挙（役員社宅・出張日当・退職金・生命保険・家族役員報酬など）
   - 各手段の概算節税額を示してトータルのメリットを積み上げる

4. 資産管理会社との組み合わせ
   - 不動産・金融資産・株式を保有している場合、資産管理会社を設立するとどれだけ節税・資産保全の効果があるかを示す
   - 事業会社と資産管理会社の2社体制にすることで相続税・贈与税の対策にもなることを説明する
   - データからこのスキームが有効なケースかどうかを判断して提案する

5. 設立タイミングと形態の判断軸
   - 株式会社vs合同会社の違いを税務・コスト・信用・将来の出口で比較
   - 今の売上・利益水準で法人化すべきタイミングかどうかの判断根拠を示す
   - 将来の出口（事業承継・M&A・IPO）を見据えてどの形態が有利かを示す

【ルール】
- 期限表現禁止。状況ベースの表現を使う
- 数字は全て計算根拠を示す
- CFO視点：目先の節税より事業の将来像から逆算して判断
- 日本語で出力`,
  };

  /* ═══ APIレポート生成 ═══ */
  React.useEffect(() => {
    if (!selected || !COMPANY_DATA) return;
    if (reportContent[selected] || reportLoading[selected]) return;

    const cardId = selected;
    setReportLoading(p => ({...p, [cardId]: true}));

    const kpiText = (allKPIs[cardId] || []).map(k => `${k.l}: ${k.v}`).join(" / ");
    const sysPrompt = CARD_PROMPTS[cardId] || CARD_PROMPTS.salesTrend;
    const cardLabel = allCards.find(c => c.id === cardId)?.label || cardId;

    const userMsg = `以下の企業データを分析し、${cardLabel}に関する財務コンサルティングレポートを作成してください。

【企業情報】
社名: ${COMPANY_DATA.name} / 業種: ${COMPANY_DATA.industry} / 従業員: ${COMPANY_DATA.employees}名
企業タイプ: ${COMPANY_DATA.archetype}（${COMPANY_DATA.archetypeJp}）
優先施策: ${COMPANY_DATA.archetypePriority}
注意点: ${COMPANY_DATA.archetypeWarning}

【財務データ】
月商: ¥${COMPANY_DATA.monthlySales}万 / 前年比: ${COMPANY_DATA.yoyGrowth}%
月間経費: ¥${COMPANY_DATA.monthlyExpense}万 / 固定費率: ${COMPANY_DATA.fixedCostRatio}%（業界平均${COMPANY_DATA.industryAvgFixedCost}%）
人件費: ¥${COMPANY_DATA.laborCost}万/月 / 1人あたり売上: ¥${COMPANY_DATA.salesPerEmployee}万
役員報酬: ¥${COMPANY_DATA.execSalary}万/月 / 法人税率: ${COMPANY_DATA.corpTaxRate}% / 所得税率: ${COMPANY_DATA.incomeTaxRate}%
推定法人税: ¥${COMPANY_DATA.estimatedCorpTax}万 / 節税余地: ¥${COMPANY_DATA.taxSavingPotential}万
預金残高: ¥${COMPANY_DATA.bankBalance}万 / 月間CF: ¥${COMPANY_DATA.monthlyCF}万
売掛回収サイト: ${COMPANY_DATA.arDays}日 / 支払サイト: ${COMPANY_DATA.apDays}日
借入残高: ¥${COMPANY_DATA.loanBalance}万 / 返済比率: ${COMPANY_DATA.debtServiceRatio}% / 平均金利: ${COMPANY_DATA.avgInterestRate}%
小規模企業共済: ${COMPANY_DATA.smallBizSharedPension?'加入':'未加入'} / iDeCo: ${COMPANY_DATA.iDeCo?'加入':'未加入'} / セーフティ共済: ${COMPANY_DATA.safetyCoop?'加入':'未加入'}
少額償却残枠: ¥${COMPANY_DATA.smallAssetAllowance}万 / 申請可能補助金: ${COMPANY_DATA.subsidyCount}件

【このカードのKPI】
${kpiText}

レポートは以下の構成でMarkdown形式で出力してください：
## 現状診断
（数字に基づく現状評価。業界平均・基準値との比較で「今どこにいるか」を明確に）

## なぜこれが重要か
（放置した場合の影響を数字で示す。他の財務指標との連動も説明）

## 具体的な対応策
（優先順に3〜5つ。各施策に根拠・計算・要件を含める）

## 他カードとの連動
（この施策が融資・節税・CF・役員報酬などに与える影響）`;

    fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1500,
        system: sysPrompt,
        messages: [{ role: "user", content: userMsg }],
      }),
    })
      .then(r => r.json())
      .then(data => {
        const text = data.content?.[0]?.text || "レポートを生成できませんでした。";
        setReportContent(p => ({...p, [cardId]: text}));
      })
      .catch(() => {
        setReportContent(p => ({...p, [cardId]: "通信エラーが発生しました。"}));
      })
      .finally(() => {
        setReportLoading(p => ({...p, [cardId]: false}));
      });
  }, [selected, COMPANY_DATA]);

  /* ═══ Markdown renderer (simple) ═══ */
  const RenderMarkdown = ({ text }) => {
    if (!text) return null;
    const lines = text.split("\n");
    return (
      <div>
        {lines.map((line, i) => {
          if (line.startsWith("## ")) return <div key={i} style={{fontSize:14,fontWeight:700,color:"#fff",marginTop:i>0?22:0,marginBottom:8,paddingBottom:8,borderBottom:`1px solid rgba(139,123,244,.1)`}}>{line.slice(3)}</div>;
          if (line.startsWith("### ")) return <div key={i} style={{fontSize:13,fontWeight:600,color:"#C4B8FF",marginTop:14,marginBottom:6}}>{line.slice(4)}</div>;
          if (line.startsWith("- ") || line.startsWith("• ")) {
            const content = line.slice(2);
            const parts = content.split(/\*\*(.*?)\*\*/g);
            return <div key={i} style={{display:"flex",gap:8,alignItems:"flex-start",marginBottom:6}}>
              <div style={{width:4,height:4,borderRadius:"50%",background:"rgba(168,155,255,.5)",flexShrink:0,marginTop:7}}/>
              <div style={{fontSize:12,color:"rgba(255,255,255,.65)",lineHeight:1.75}}>
                {parts.map((p,j) => j%2===1 ? <strong key={j} style={{color:"#fff",fontWeight:600}}>{p}</strong> : p)}
              </div>
            </div>;
          }
          if (/^\d+\.\s/.test(line)) {
            const num = line.match(/^(\d+)\./)[1];
            const content = line.slice(num.length+2);
            const parts = content.split(/\*\*(.*?)\*\*/g);
            return <div key={i} style={{display:"flex",gap:10,alignItems:"flex-start",marginBottom:8}}>
              <div style={{width:20,height:20,borderRadius:"50%",background:"rgba(139,123,244,.1)",border:"1px solid rgba(139,123,244,.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:"#A89BFF",fontWeight:700,flexShrink:0,marginTop:2}}>{num}</div>
              <div style={{fontSize:12,color:"rgba(255,255,255,.65)",lineHeight:1.75}}>
                {parts.map((p,j) => j%2===1 ? <strong key={j} style={{color:"#fff",fontWeight:600}}>{p}</strong> : p)}
              </div>
            </div>;
          }
          if (line.trim()==="") return <div key={i} style={{height:6}}/>;
          const parts = line.split(/\*\*(.*?)\*\*/g);
          return <div key={i} style={{fontSize:12,color:"rgba(255,255,255,.6)",lineHeight:1.8,marginBottom:2}}>
            {parts.map((p,j) => j%2===1 ? <strong key={j} style={{color:"#fff",fontWeight:600}}>{p}</strong> : p)}
          </div>;
        })}
      </div>
    );
  };

  /* ═══ Report pages per card (API生成に切替) ═══ */
  const allReportPages = Object.fromEntries(
    allCards.map(card => [
      card.id,
      [() => {
        const loading = reportLoading[card.id];
        const content = reportContent[card.id];
        const kpis = allKPIs[card.id] || [];
        return (
          <div>
            <RKpiRow items={kpis} />
            {loading && (
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"40px 0",gap:16}}>
                <div style={{display:"flex",gap:6}}>
                  {[0,1,2].map(i=><div key={i} style={{width:8,height:8,borderRadius:"50%",background:"rgba(168,155,255,.5)",animation:`dotPulse 1.2s ease-in-out ${i*0.2}s infinite`}}/>)}
                </div>
                <div style={{fontSize:11,color:"rgba(168,155,255,.5)"}}>財務データを分析中…</div>
              </div>
            )}
            {!loading && content && <RenderMarkdown text={content} />}
          </div>
        );
      }]
    ])
  );

  /* ═══ Report pages per card ═══
  const allReportPages_ARCHIVED = {
    salesTrend: [
      () => <div>
        <RKpiRow items={allKPIs.salesTrend} />
        <RProse>直近6ヶ月の売上推移を分析しました。月間売上は<RNum>¥1,540万</RNum>で安定しているように見えますが、前年同月比で<RNum color="#E87070">▲3.2%</RNum>の下落傾向が3ヶ月連続で発生しています。このペースが続くと年間で<RNum color="#E87070">¥590万</RNum>の売上減少になります。</RProse>
        <RDivider />
        <div style={{fontSize:13,color:"#fff",fontWeight:600,marginBottom:14}}>原因の分解</div>
        {[
          {title:"新規獲得の鈍化",text:"月平均1.2件→0.6件に半減。紹介依存率87%が原因。紹介元の1社が取引縮小したことで連鎖的に新規パイプラインが細っている。自社での集客チャネルがほぼ存在しない。",c:"#E87070"},
          {title:"既存顧客の単価下落",text:"平均単価が前年比▲5.2%（¥31.9万→¥30.2万）。値下げ要請に応じたケースが3件。競合の参入による価格圧力が主因。付加価値の訴求で単価を守る戦略が必要。",c:"#F0C866"},
          {title:"上位顧客への依存",text:"上位3社で売上の62%を占める。最大顧客（売上比28%）を失うと月¥430万の減収で一気に赤字転落。リスク分散が急務。",c:"#E87070"},
        ].map((it,i)=><div key={i} style={{padding:"12px 0",borderBottom:i<2?`1px solid ${C.border}`:"none"}}><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}><div style={{width:8,height:8,borderRadius:"50%",background:it.c}} /><span style={{fontSize:14,color:"#fff",fontWeight:600}}>{it.title}</span></div><RProse>{it.text}</RProse></div>)}
      </div>,
      () => <div>
        <div style={{fontSize:13,color:"#fff",fontWeight:600,marginBottom:14}}>顧客ポートフォリオ分析</div>
        <div style={{marginBottom:20}}>
          {[{l:"A社（IT）",pct:28,v:"¥431万",c:"#E87070"},{l:"B社（製造）",pct:19,v:"¥293万",c:"#F0C866"},{l:"C社（不動産）",pct:15,v:"¥231万",c:"#F0C866"},{l:"D〜F社",pct:22,v:"¥339万",c:"#7BE0A0"},{l:"G社以降（45社）",pct:16,v:"¥246万",c:"#7BE0A0"}].map((it,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:12,marginBottom:8}}>
            <span style={{width:100,fontSize:11,color:C.textSec,textAlign:"right"}}>{it.l}</span>
            <div style={{flex:1,height:20,background:"rgba(255,255,255,.02)",borderRadius:4,position:"relative"}}><div style={{position:"absolute",top:0,left:0,bottom:0,width:`${it.pct*2.5}%`,background:`linear-gradient(90deg, ${it.c}30, ${it.c}80)`,borderRadius:4}} /><span style={{position:"absolute",right:8,top:"50%",transform:"translateY(-50%)",fontFamily:mono,fontSize:10,color:"#fff"}}>{it.pct}% {it.v}</span></div>
          </div>)}
        </div>
        <RCallout type="danger"><RStrong>上位3社依存率 62%</RStrong> — 健全な目安は40%以下。A社の契約更新（6月）が最大リスク。更新3ヶ月前から関係強化と同時に、新規チャネルの立ち上げを開始してください。</RCallout>
        <RDivider />
        <div style={{fontSize:13,color:"#fff",fontWeight:600,marginBottom:14}}>推奨アクション</div>
        <RTimeline items={[
          {date:"今月",label:"既存顧客へのアップセル提案",detail:"上位10社に追加サービス（保守・コンサル等）を提案。単価10%アップで年¥1,850万の売上増。成功率30%でも¥555万。"},
          {date:"来月",label:"紹介プログラムの仕組み化",detail:"既存顧客に紹介料¥5万を設定。紹介1件あたりLTV¥300万なら圧倒的にペイ。四半期で3件の紹介獲得を目標。"},
          {date:"3ヶ月内",label:"自社集客チャネルの構築",detail:"マーケ戦略カードで詳細分析。最低でも月¥30万の広告予算を確保し、紹介依存率を60%以下に。"},
        ]} />
      </div>,
    ],

    marketing: [
      () => <div>
        <RKpiRow items={allKPIs.marketing} />
        <RProse>広告費比率<RNum color="#E87070">0.8%</RNum>は業界平均8〜12%の<RStrong>10分の1以下</RStrong>。これは「マーケティングをしていない」に等しい水準です。紹介依存率87%は経営リスクそのものです。</RProse>
        <RDivider />
        <div style={{fontSize:13,color:"#fff",fontWeight:600,marginBottom:14}}>予算別マーケ施策プラン</div>
        {[
          {budget:"月¥10万プラン",roi:"期待ROI: 200%",items:"Google広告（リスティング）に集中投下。キーワード5〜10個で小さく始めてCPA（顧客獲得単価）を測定。3ヶ月で効果検証。月1件の新規獲得が目標。",c:"#7BE0A0"},
          {budget:"月¥30万プラン（推奨）",roi:"期待ROI: 340%",items:"リスティング¥15万 + コンテンツSEO¥10万 + SNS広告¥5万。3チャネルで分散。リスティングで即効性、コンテンツで中長期のオーガニック流入を構築。月2件の新規獲得が目標。",c:C.purpleLight},
          {budget:"月¥50万プラン",roi:"期待ROI: 280%",items:"上記 + ウェビナー¥10万 + メールマーケ¥5万 + LP制作¥5万。フルファネル施策。認知→興味→検討→商談の各段階にアプローチ。月3〜4件の新規獲得が目標。",c:"#6BA3FF"},
        ].map((it,i)=><div key={i} style={{padding:"16px 18px",background:"rgba(255,255,255,.01)",border:`1px solid ${C.border}`,borderRadius:14,marginBottom:10}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><span style={{fontSize:14,color:"#fff",fontWeight:600}}>{it.budget}</span><span style={{fontFamily:mono,fontSize:11,color:it.c,fontWeight:600}}>{it.roi}</span></div>
          <RProse>{it.items}</RProse>
        </div>)}
        <RCallout type="info">広告費は「コスト」ではなく<RStrong>「投資」</RStrong>。月¥30万の投資で年間LTVベース¥1,800万のリターンが見込めます。コスト削減で月¥20万の原資を作り、残り¥10万は利益から。PLの利益額を変えずにマーケ投資できます。</RCallout>
      </div>,
      () => <div>
        <div style={{fontSize:13,color:"#fff",fontWeight:600,marginBottom:14}}>業種別の効果的なチャネル</div>
        <RProse>貴社の業種（IT/コンサル系）に最も効果的なチャネルを分析しました。</RProse>
        <RDivider />
        {[
          {title:"コンテンツマーケティング（最推奨）",text:"ブログ記事・ホワイトペーパー・事例紹介を月4本ペースで発信。SEOで「業種名+課題キーワード」の上位を狙う。効果が出るまで3〜6ヶ月かかるが、一度上位を取ると広告費ゼロで毎月リードが流入。年間で最もROIが高い施策。"},
          {title:"リスティング広告",text:"Google広告で「業種+サービス名」の検索キーワードに出稿。CPC（クリック単価）¥300〜800、CVR（成約率）2〜5%で計算すると、CPA（獲得単価）は¥6,000〜40,000。LTV¥300万に対して圧倒的に安い。即効性があり、2〜4週間で効果測定可能。"},
          {title:"セミナー/ウェビナー",text:"月1回の無料ウェビナーで見込み客を集める。参加者20名×商談化率15%=月3件の商談。会場不要・録画で再利用可能。テーマは「業界の課題解決」が最も集客力が高い。"},
          {title:"紹介プログラムの制度化",text:"既存顧客・パートナーに紹介料¥5〜10万を設定。口頭でのお願いではなく制度として告知。紹介カードやLP を用意し、紹介のハードルを下げる。最もCPAが低い最強チャネル。"},
        ].map((it,i)=><div key={i} style={{padding:"12px 0",borderBottom:i<3?`1px solid ${C.border}`:"none"}}><div style={{fontSize:14,color:"#fff",fontWeight:600,marginBottom:6}}>{it.title}</div><RProse>{it.text}</RProse></div>)}
      </div>,
    ],

    costStructure: [
      () => <div>
        <RKpiRow items={allKPIs.costStructure} />
        <RProse>月間経費<RNum>¥710万</RNum>で、固定費率<RNum color="#F0C866">62%</RNum>は業界平均55%を7pt超過。前年同月比<RNum color="#E87070">+4.2%</RNum>で増加傾向。このまま放置すると年間約<RNum>¥360万</RNum>の追加コスト。</RProse>
        <RDivider />
        <div style={{fontSize:13,color:"#fff",fontWeight:600,marginBottom:14}}>感度分析 — どこを動かすと一番効くか</div>
        {[
          {l:"売上+1%",v:"+¥15.4万/月",c:"#7BE0A0",w:77},{l:"原価率▲1%",v:"+¥15.4万/月",c:"#7BE0A0",w:77},{l:"変動費率▲1%",v:"+¥7.0万/月",c:"#6BA3FF",w:35},{l:"固定費▲1%",v:"+¥4.4万/月",c:C.purpleLight,w:22},
        ].map((it,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:14,marginBottom:10}}>
          <div style={{width:100,fontSize:11,color:C.textSec,textAlign:"right"}}>{it.l}</div>
          <div style={{flex:1,height:24,background:"rgba(255,255,255,.02)",borderRadius:6,position:"relative"}}><div style={{position:"absolute",top:0,left:0,bottom:0,width:`${it.w}%`,background:`linear-gradient(90deg, ${it.c}30, ${it.c}80)`,borderRadius:6}} /></div>
          <span style={{fontFamily:hd,fontSize:13,fontWeight:600,color:it.c,minWidth:90}}>{it.v}</span>
        </div>)}
        <RProse>売上増加と原価改善が<RStrong>同じインパクト</RStrong>。固定費削減は相対的に効果が小さいが、実行が容易。売上施策と並行してコスト改善を進めるのが最適。</RProse>
      </div>,
      () => <div>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20}}>
          <div style={{padding:"6px 12px",background:"rgba(123,224,160,.06)",border:"1px solid rgba(123,224,160,.1)",borderRadius:8,fontSize:10,fontWeight:600,color:"#7BE0A0",fontFamily:mono}}>月 ¥8.2万 即時削減</div>
          <div style={{padding:"6px 12px",background:"rgba(168,155,255,.06)",border:"1px solid rgba(168,155,255,.1)",borderRadius:8,fontSize:10,fontWeight:600,color:C.purpleLight,fontFamily:mono}}>月 ¥12万 交渉で削減</div>
        </div>
        <div style={{borderBottom:`1px solid ${C.border}`}}><RBeforeAfter icon={RI.pc} name="SaaS利用料" before="15万" after="10万" save="▼5万">Backlogは過去3ヶ月ログインゼロ→即解約で月5万円。Slack/Adobeはプランダウングレードで月1.8万円。4月のSlack更新が次のタイミング。</RBeforeAfter></div>
        <div style={{borderBottom:`1px solid ${C.border}`}}><RBeforeAfter icon={RI.phone} name="通信費" before="7.2万" after="4.0万" save="▼3.2万">法人携帯8台を格安法人プラン（IIJmioビズ）に。違約金4万円は1.3ヶ月で回収。MNPで番号変更なし。</RBeforeAfter></div>
        <RBeforeAfter icon={RI.bldg} name="オフィス賃料" before="45万" after="40万" save="▼5万">同エリア相場38〜40万に対して+12%。9月の契約更新で減額交渉。近隣3〜5件の募集賃料エビデンスを事前準備。</RBeforeAfter>
        <RBeforeAfter icon={RI.ppl} name="外注費" before="48万" after="36万" save="▼12万">前月比+29%の急増。6ヶ月以上月40万超が続くなら正社員1人（年収500万）の方がコスト効率◎。短期はバルク契約で10〜15%の単価交渉。</RBeforeAfter>
      </div>,
    ],

    procurement: [
      () => <div>
        <RKpiRow items={allKPIs.procurement} />
        <RProse>仕入原価<RNum>¥280万/月</RNum>に対し、取引条件の見直しで<RNum color="#7BE0A0">年間¥170〜230万</RNum>の改善余地があります。</RProse>
        <RDivider />
        {[
          {title:"回収サイトの短縮（最大効果）",save:"CF +¥150万/月",text:"売掛回収45日→30日に短縮。新規契約から「月末締め翌15日払い」に変更。既存は更新時に条件変更を交渉。大口2社が翌々月払いなのが主因。ファクタリング（手数料2〜5%）で即現金化も選択肢。"},
          {title:"仕入単価の交渉",save:"年 ¥170〜230万",text:"年間契約+一括発注で5〜8%の単価ダウンを交渉。3社以上の相見積もりを取り、最安値をレバレッジに使う。切替コストが低い消耗品系から着手。"},
          {title:"早期支払い割引の活用",save:"年 ¥30〜50万",text:"「10日以内支払いで2%割引」を提示している仕入先がある場合、年利換算36%相当。手元資金に余裕があれば必ず活用すべき。CF¥2,480万あれば十分対応可能。"},
          {title:"支払サイトの延長",save:"CF改善",text:"自社の支払サイト30日を45日に延長交渉。仕入先への影響を考慮しつつ、大口先から交渉。回収サイト短縮と併せて実施すれば、運転資金ギャップが30日→0日に解消。"},
        ].map((it,i)=><div key={i} style={{display:"flex",gap:14,padding:"14px 0",borderBottom:i<3?`1px solid ${C.border}`:"none"}}><div style={{flex:1}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:14,color:"#fff",fontWeight:600}}>{it.title}</span><span style={{fontFamily:mono,fontSize:11,color:"#7BE0A0",fontWeight:600,background:"rgba(123,224,160,.06)",padding:"3px 8px",borderRadius:6}}>{it.save}</span></div><RProse>{it.text}</RProse></div></div>)}
      </div>,
    ],

    laborCost: [
      () => <div>
        <RKpiRow items={allKPIs.laborCost} />
        <RProse>人件費は月間経費の<RNum>45%</RNum>を占める最大項目。1人あたり売上¥193万は業界平均（150〜180万）を上回り<RStrong>生産性は良好</RStrong>。ただし残業代月¥48万と役員報酬設計に改善余地。</RProse>
        <RDivider />
        <div style={{fontSize:13,color:"#fff",fontWeight:600,marginBottom:14}}>部門別生産性</div>
        {[{l:"営業（3名）",v:280,c:"#7BE0A0",avg:200},{l:"開発（3名）",v:120,c:"#F0C866",avg:150},{l:"管理（2名）",v:0,c:C.textMut,avg:0}].map((it,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:14,marginBottom:10}}>
          <span style={{width:90,fontSize:11,color:C.textSec,textAlign:"right"}}>{it.l}</span>
          <div style={{flex:1,height:24,background:"rgba(255,255,255,.02)",borderRadius:6,position:"relative"}}>{it.v>0 && <><div style={{position:"absolute",top:0,left:0,bottom:0,width:`${it.v/3}%`,background:`linear-gradient(90deg, ${it.c}30, ${it.c}80)`,borderRadius:6}} />{it.avg>0&&<div style={{position:"absolute",top:-2,bottom:-2,left:`${it.avg/3}%`,width:1,background:"rgba(255,255,255,.3)"}} />}</>}</div>
          <span style={{fontFamily:hd,fontSize:13,fontWeight:600,color:it.c,minWidth:70}}>{it.v>0?`¥${it.v}万/人`:"-"}</span>
        </div>)}
        <RProse>開発部門の1人あたり売上が業界平均以下。<RAccent>ツール導入による自動化</RAccent>で20%改善すれば月¥72万分の生産性向上（年¥864万相当）。残業代月¥48万の内訳は開発部門が68%を占めており、根本原因は工数見積もりの甘さ。</RProse>
        <RCallout type="info"><RStrong>残業半減</RStrong>で年¥288万の削減。業務フロー見直し+プロジェクト管理ツール活用で実現可能。従業員満足度向上→離職率低下の副次効果も。</RCallout>
      </div>,
      () => <div>
        <div style={{fontSize:13,color:"#fff",fontWeight:600,marginBottom:14}}>雇用形態の最適化</div>
        {[
          {title:"業務委託への切替検討",text:"開発の1人を業務委託に切り替えると社保会社負担¥5.4万/月が消える。年¥64.8万の削減。ただし偽装請負リスクがあり、指揮命令の範囲を明確に業務委託契約書に規定する必要あり。成果物ベースの契約にすること。"},
          {title:"繁忙期パート活用",text:"繁閑差が大きい場合、繁忙期3ヶ月だけパート2人追加の方が通年正社員1人より年¥120万安い。データ入力・CS一次対応など定型業務が対象。"},
          {title:"賃上げ税制の活用",text:"給与総額を前年比1.5%以上増やすと、増加額の15%を法人税から直接控除。2.5%以上なら30%控除。つまり¥100万の昇給で¥30万の税額控除。どうせ昇給するなら基準を超える額に設定すべき。昇給が節税になる逆転現象。"},
        ].map((it,i)=><div key={i} style={{padding:"14px 0",borderBottom:i<2?`1px solid ${C.border}`:"none"}}><div style={{fontSize:14,color:"#fff",fontWeight:600,marginBottom:6}}>{it.title}</div><RProse>{it.text}</RProse></div>)}
      </div>,
    ],

    execComp: [
      () => <div>
        <RKpiRow items={allKPIs.execComp} />
        <RProse>現在の役員報酬月¥80万は<RStrong>最適額を外している可能性</RStrong>があります。法人税率と所得税率の交差点で最適値が変わり、経営方針によっても正解が異なります。</RProse>
        <RDivider />
        <div style={{fontSize:13,color:"#fff",fontWeight:600,marginBottom:14}}>報酬額別シミュレーション</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:0,marginBottom:20}}>
          {["報酬/月","法人税","所得税+社保","世帯手取り"].map((h,i)=><div key={i} style={{padding:"10px 8px",borderBottom:`1px solid ${C.border}`,fontSize:9,color:C.textMut,fontWeight:600,textAlign:"center",fontFamily:mono}}>{h}</div>)}
          {[
            {r:"¥60万",lt:"¥720万",it:"¥168万",take:"¥552万",hl:false},
            {r:"¥70万",lt:"¥697万",it:"¥198万",take:"¥642万",hl:false},
            {r:"¥80万（現在）",lt:"¥677万",it:"¥234万",take:"¥726万",hl:true},
            {r:"¥90万",lt:"¥654万",it:"¥276万",take:"¥804万",hl:false},
            {r:"¥100万",lt:"¥631万",it:"¥324万",take:"¥876万",hl:false},
          ].map((row,i)=><React.Fragment key={i}>
            {[row.r,row.lt,row.it,row.take].map((v,j)=><div key={j} style={{padding:"10px 8px",borderBottom:i<4?`1px solid ${C.border}`:"none",fontSize:12,color:row.hl?"#C4B8FF":"#fff",fontWeight:row.hl?600:400,textAlign:"center",fontFamily:hd,background:row.hl?"rgba(139,123,244,.03)":"transparent"}}>{v}</div>)}
          </React.Fragment>)}
        </div>
        <RCallout type="info"><RStrong>融資狙いの場合:</RStrong> 月¥70万に下げると法人利益+¥180万。銀行に「利益を出せる経営」を示せる。<br/><RStrong>手取り最大化の場合:</RStrong> 月¥95万で給与所得控除が効き、世帯手取りが最大化。法人に残す利益は縮小。</RCallout>
      </div>,
      () => <div>
        <div style={{fontSize:13,color:"#fff",fontWeight:600,marginBottom:14}}>退職金制度の設計</div>
        {[
          {title:"中小企業退職金共済（中退共）",text:"掛金全額損金。月¥1万×8人=年¥96万が経費。従業員の定着率改善+節税の一石二鳥。掛金の一部を国が助成（加入後4ヶ月目〜1年間、掛金の1/2）。退職金は直接従業員に支払われるため、会社の経営状態に左右されない安心感。"},
          {title:"役員退職金の準備",text:"最終月額報酬×在任年数×功績倍率（通常2〜3倍）が損金算入の目安。月80万×20年×3倍=¥4,800万が退職時に経費計上可能。退職所得控除が使えるため、税負担は極めて軽い（実効税率10%以下になることも）。原資は生命保険の解約返戻金で準備するのが一般的。"},
          {title:"確定拠出年金（企業型DC）",text:"掛金は全額損金かつ従業員の給与所得にならない。社保の算定基礎にも含まれないため、会社・従業員双方の社保負担が軽減。月¥5.5万×8人=年¥528万の損金。60歳まで引出不可が最大のデメリット。"},
        ].map((it,i)=><div key={i} style={{padding:"14px 0",borderBottom:i<2?`1px solid ${C.border}`:"none"}}><div style={{fontSize:14,color:"#fff",fontWeight:600,marginBottom:6}}>{it.title}</div><RProse>{it.text}</RProse></div>)}
      </div>,
    ],

    taxSim: [
      () => <div>
        <RKpiRow items={allKPIs.taxSim} />
        <RProse>推定税額合計<RNum>¥801万</RNum>に対し、未着手の節税施策を<RStrong>正しい順番で積み上げる</RStrong>ことで最大<RNum color="#7BE0A0">¥120万</RNum>の節税が可能です。</RProse>
        <RDivider />
        <div style={{fontSize:13,color:"#fff",fontWeight:600,marginBottom:14}}>重ね技シミュレーション（累積効果）</div>
        {[
          {layer:"① 小規模企業共済",amount:"年84万円控除",cum:"▲¥28万",cumPct:23,text:"月7万円の掛金が全額所得控除。商工会議所のWebから手続き。今月中なら今年度適用。退職時に退職所得として受取可能。"},
          {layer:"② iDeCo",amount:"年27.6万円控除",cum:"▲¥37万",cumPct:31,text:"月2.3万円が全額所得控除。60歳まで引出不可。①と合わせて年111.6万円の所得控除。"},
          {layer:"③ 経営セーフティ共済",amount:"年240万円損金",cum:"▲¥117万",cumPct:98,text:"月20万円の掛金が全額損金。40ヶ月以上で100%返戻。BS上は保険積立金で資産計上も可能→融資審査にプラス。解約時は益金なので退職金と相殺がベスト。"},
          {layer:"④ 少額償却特例",amount:"残枠172万円",cum:"▲¥120万+",cumPct:100,text:"30万円未満の資産を全額即時経費。PC・モニター・ソフトウェア等を期末までに購入。枠は翌期にリセット。"},
        ].map((it,i)=><div key={i} style={{padding:"14px 0",borderBottom:i<3?`1px solid ${C.border}`:"none"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
            <span style={{fontSize:14,color:"#fff",fontWeight:600}}>{it.layer}</span>
            <div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontFamily:mono,fontSize:11,color:C.purpleLight}}>{it.amount}</span><span style={{fontFamily:mono,fontSize:11,color:"#7BE0A0",fontWeight:600,background:"rgba(123,224,160,.06)",padding:"3px 8px",borderRadius:6}}>累計{it.cum}</span></div>
          </div>
          <div style={{height:6,background:"rgba(255,255,255,.03)",borderRadius:3,marginBottom:8}}><div style={{height:"100%",width:`${it.cumPct}%`,background:"linear-gradient(90deg, rgba(123,224,160,.3), rgba(123,224,160,.8))",borderRadius:3,transition:"width .6s"}} /></div>
          <RProse>{it.text}</RProse>
        </div>)}
      </div>,
      () => <div>
        <div style={{fontSize:13,color:"#fff",fontWeight:600,marginBottom:14}}>業種別「通る経費」ガイド</div>
        <RProse>同じ支出でも<RStrong>科目の選び方と根拠の作り方</RStrong>で損金算入の可否が変わります。IT/コンサル業で認められやすい経費を整理しました。</RProse>
        <RDivider />
        {[
          {item:"自宅兼事務所",account:"地代家賃（按分）",rate:"40〜50%",tip:"面積按分が最も根拠として強い。作業部屋の面積÷総面積で計算し、根拠を書面で残す。時間按分（1日8h÷24h=33%）も認められるが面積按分より低くなりがち。光熱費・通信費も同率で按分可能。"},
          {item:"技術書・カンファレンス",account:"研修費",rate:"100%",tip:"業務との関連性が説明できれば全額経費。Udemy・書籍・技術カンファレンス参加費+交通費+宿泊費をセットで計上。年間30万円くらいまでは自然な水準。"},
          {item:"PC・モニター・椅子",account:"消耗品費 or 工具器具備品",rate:"100%",tip:"30万円未満は少額特例で即時経費。高スペックPCでも「業務上必要」と説明できれば問題なし。ゲーミングチェアは「長時間作業の健康対策」で福利厚生費としても通る。"},
          {item:"クラウドサービス",account:"通信費 or 業務委託費",rate:"100%",tip:"AWS/GCP/Azure等は通信費。GitHub/Figma等は業務委託費。SaaSのサブスクはそのまま経費計上可能。年払いにすると今期に一括計上できて節税タイミングの調整に使える。"},
          {item:"会食・贈答品",account:"交際費",rate:"年800万枠",tip:"現在の利用額¥264万で枠が大幅に余っている。取引先との会食は1人¥5,000以下なら「会議費」として交際費枠を使わずに損金算入可能。5,000円ルールを活用してください。"},
        ].map((it,i)=><div key={i} style={{padding:"12px 0",borderBottom:i<4?`1px solid ${C.border}`:"none"}}>
          <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:4,flexWrap:"wrap"}}><span style={{fontSize:13,color:"#fff",fontWeight:600}}>{it.item}</span><span style={{fontSize:9,color:C.purpleLight,fontWeight:600,background:"rgba(168,155,255,.06)",padding:"2px 8px",borderRadius:4}}>{it.account}</span><span style={{fontSize:9,color:"#7BE0A0",fontWeight:600,background:"rgba(123,224,160,.06)",padding:"2px 8px",borderRadius:4}}>按分{it.rate}</span></div>
          <RProse>{it.tip}</RProse>
        </div>)}
      </div>,
    ],

    filingTax: [
      () => <div>
        <RKpiRow items={allKPIs.filingTax} />
        {[{l:"確定申告書B",pct:40,c:"#F0C866",d:"収入・所得入力済。控除の一部未入力"},{l:"消費税申告書",pct:10,c:"#E87070",d:"課税標準額のみ。仕入税額控除・インボイス確認残"},{l:"法人税別表",pct:45,c:"#F0C866",d:"所得金額計算完了。別表四・別表十五確認残"}].map((it,i)=><div key={i} style={{marginBottom:18}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><span style={{fontSize:13,color:"#fff",fontWeight:500}}>{it.l}</span><span style={{fontFamily:mono,fontSize:12,color:it.c,fontWeight:600}}>{it.pct}%</span></div>
          <div style={{height:6,background:"rgba(255,255,255,.04)",borderRadius:3,overflow:"hidden",marginBottom:6}}><div style={{height:"100%",width:`${it.pct}%`,background:`linear-gradient(90deg, ${it.c}88, ${it.c})`,borderRadius:3}} /></div>
          <div style={{fontSize:11,color:C.textMut}}>{it.d}</div>
        </div>)}
        <RDivider />
        <div style={{fontSize:13,color:"#fff",fontWeight:600,marginBottom:14}}>消費税: 本則 vs 簡易</div>
        <div style={{display:"flex",gap:12,marginBottom:16}}>
          <div style={{flex:1,padding:"16px",background:"rgba(123,224,160,.03)",border:"1px solid rgba(123,224,160,.08)",borderRadius:14,textAlign:"center"}}><div style={{fontSize:10,color:C.textMut,marginBottom:4}}>本則課税（現在）</div><div style={{fontFamily:hd,fontSize:20,color:"#7BE0A0"}}>控除率 75.6%</div></div>
          <div style={{flex:1,padding:"16px",background:"rgba(232,112,112,.03)",border:"1px solid rgba(232,112,112,.08)",borderRadius:14,textAlign:"center"}}><div style={{fontSize:10,color:C.textMut,marginBottom:4}}>簡易課税</div><div style={{fontFamily:hd,fontSize:20,color:"#E87070"}}>みなし 50%</div></div>
        </div>
        <RProse><RStrong>本則課税の方が有利</RStrong>。簡易課税に変更すると約<RNum color="#E87070">¥437万</RNum>の追加負担。インボイス未登録仕入先2社（年間¥180万）の経過措置が2026年10月に50%引下げ。早期に登録促進を。</RProse>
      </div>,
      () => <div>
        <div style={{fontSize:13,color:"#fff",fontWeight:600,marginBottom:6}}>申告スケジュール</div>
        <RTimeline items={[
          {date:"〜2/28",label:"未確認仕訳4件+不足書類2件",detail:"Tasksから即対応（推定30分）。書類回収は取引先に再発行依頼、3〜5営業日。放置で経費計上漏れリスク¥8〜15万。"},
          {date:"〜3/05",label:"控除確認・消費税チェック",detail:"医療費控除、配偶者所得、ふるさと納税証明書、仕入税額控除の確認。この段階で申告書の9割を完成。"},
          {date:"〜3/10",label:"最終レビュー・数値整合性",detail:"BS残高と申告書の対応確認。源泉所得税の納付。税理士レビュー。"},
          {date:"〜3/15",label:"e-Tax提出",detail:"電子証明書の有効期限を事前確認。還付がある場合は早期提出で1〜2週間早く入金。"},
        ]} />
      </div>,
    ],

    cashflow: [
      () => <div>
        <RKpiRow items={allKPIs.cashflow} />
        <div style={{fontSize:13,color:"#fff",fontWeight:600,marginBottom:14}}>今後3ヶ月のCF予測</div>
        <RBar label="3月" value={1970} max={2500} color="#F0C866" suffix="万" />
        <RBar label="4月" value={2190} max={2500} color="#7BE0A0" suffix="万" />
        <RBar label="5月" value={2270} max={2500} color="#7BE0A0" suffix="万" />
        <RCallout type="warn"><RStrong>3月の納税集中</RStrong>で約¥500万減少。残高¥1,970万は維持見込みで資金ショートリスクは低い。ただし予備として当座貸越枠¥500〜1,000万を事前設定推奨。振替納税で4月中旬まで引落延期可能。</RCallout>
        <RDivider />
        <div style={{fontSize:13,color:"#fff",fontWeight:600,marginBottom:14}}>CF改善策</div>
        {[
          {title:"売掛回収サイト短縮",effect:"CF +¥150万/月",text:"45日→30日。新規契約から条件変更、既存は更新時に交渉。"},
          {title:"請求書の即日発行",effect:"回収15〜20日短縮",text:"月末締めではなく納品完了時に即日発行。実質的な回収サイトが大幅短縮。"},
          {title:"余剰資金の運用",effect:"年¥5〜12万",text:"余剰¥500〜800万を定期預金（ネット銀行0.3〜0.5%）に。"},
        ].map((it,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"10px 0",borderBottom:i<2?`1px solid ${C.border}`:"none"}}><div style={{flex:1}}><div style={{fontSize:13,color:"#fff",fontWeight:600,marginBottom:3}}>{it.title}</div><RProse>{it.text}</RProse></div><span style={{fontFamily:mono,fontSize:11,color:"#7BE0A0",fontWeight:600,flexShrink:0,marginLeft:12}}>{it.effect}</span></div>)}
      </div>,
    ],

    loanStrategy: [
      () => <div>
        <RKpiRow items={allKPIs.loanStrategy} />
        <div style={{fontSize:13,color:"#fff",fontWeight:600,marginBottom:14}}>融資審査スコアカード</div>
        <div style={{borderBottom:`1px solid ${C.border}`}}><RScoreItem label="営業利益率" actual={13.6} threshold={10} unit="%" max={20} /></div>
        <div style={{borderBottom:`1px solid ${C.border}`}}><RScoreItem label="自己資本比率" actual={42} threshold={30} unit="%" max={60} /></div>
        <div style={{borderBottom:`1px solid ${C.border}`}}><RScoreItem label="債務償還年数" actual={3.2} threshold={10} unit="年" max={15} /></div>
        <RScoreItem label="流動比率" actual={185} threshold={120} unit="%" max={250} />
        <RProse>全指標が基準をクリア。追加融資の可能性は<RStrong>高い</RStrong>。</RProse>
        <RDivider />
        <div style={{fontSize:13,color:"#fff",fontWeight:600,marginBottom:14}}>現在の返済状況</div>
        {[
          {l:"公庫",bal:"¥1,200万",pay:"¥15万/月",rate:"1.2%",rem:"6年8ヶ月"},
          {l:"信金",bal:"¥800万",pay:"¥12万/月",rate:"2.1%",rem:"5年",hl:true},
          {l:"保証協会付",bal:"¥300万",pay:"¥8万/月",rate:"1.8%",rem:"3年"},
        ].map((it,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"10px 0",borderBottom:i<2?`1px solid ${C.border}`:"none",background:it.hl?"rgba(232,112,112,.02)":"transparent"}}>
          <span style={{fontSize:13,color:"#fff",fontWeight:500,width:80}}>{it.l}</span>
          <span style={{fontSize:12,color:C.textSec,fontFamily:hd}}>{it.bal}</span>
          <span style={{fontSize:12,color:C.textSec,fontFamily:mono}}>{it.pay}</span>
          <span style={{fontSize:12,color:it.hl?"#E87070":C.textSec,fontFamily:mono}}>{it.rate}</span>
          <span style={{fontSize:12,color:C.textMut}}>{it.rem}</span>
        </div>)}
        <RCallout type="info"><RStrong>借り換え提案:</RStrong> 信金の2.1%を公庫1.0%に借り換えで年¥24万の金利差。手数料¥5万差引で初年度¥19万のメリット。5年で¥115万。</RCallout>
      </div>,
      () => <div>
        <div style={{fontSize:13,color:"#fff",fontWeight:600,marginBottom:14}}>追加融資の逆算ガイドライン</div>
        <RProse>追加で<RNum>¥3,000万</RNum>を借りたい場合の準備事項を逆算しました。</RProse>
        <RDivider />
        <RTimeline items={[
          {date:"Week 1",label:"書類準備",detail:"直近2期分の決算書（勘定科目内訳書・別表含む）、確定申告書写し、試算表。役員貸付金があれば精算完了。"},
          {date:"Week 2-3",label:"事業計画書",detail:"売上予測3年分を積み上げ式で。①既存顧客リピート売上②新規開拓見込み③単価改定計画。3シナリオ（楽観・標準・保守）で説得力増。"},
          {date:"Week 3-4",label:"金融機関面談",detail:"公庫+メインバンク+もう1行の計3行。複数同時で金利交渉の余地が生まれる。借入3,000万で0.2%の差は10年で約30万円。"},
          {date:"Week 5-8",label:"審査〜実行",detail:"公庫3〜4週間、民間2〜3週間。追加書類に即日対応できるよう経理に事前共有。"},
        ]} />
        <RCallout type="info"><RStrong>資金調達の選択肢比較:</RStrong> 公庫（低金利・無担保）が第一選択。急ぎならファクタリング（手数料2〜5%）。自己資本比率を上げたいなら役員借入のDES（デット・エクイティ・スワップ）。</RCallout>
      </div>,
    ],

    capexSubsidy: [
      () => <div>
        <RKpiRow items={allKPIs.capexSubsidy} />
        <div style={{fontSize:13,color:"#fff",fontWeight:600,marginBottom:14}}>活用できる税制優遇</div>
        {[
          {title:"少額減価償却資産の特例",tag:"全額即時経費（残枠¥172万）",text:"30万円未満の資産は全額経費計上可能（年300万円まで）。期末までに活用しなければ枠は消滅。PC、モニター、ソフトウェアライセンス等が該当。"},
          {title:"中小企業投資促進税制",tag:"特別償却30% or 税額控除7%",text:"機械装置160万円以上、ソフトウェア70万円以上が対象。現在の利益率なら税額控除が有利。500万円の設備で¥35万の直接減税。"},
          {title:"中小企業経営強化税制",tag:"即時償却 or 税額控除10%",text:"経営力向上計画の認定（約1ヶ月）が必要。DX投資が対象。今期適用なら早急に着手。"},
        ].map((it,i)=><div key={i} style={{padding:"14px 0",borderBottom:i<2?`1px solid ${C.border}`:"none"}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:14,color:"#fff",fontWeight:600}}>{it.title}</span><span style={{fontSize:10,color:C.purpleLight,fontWeight:500,background:"rgba(168,155,255,.06)",padding:"3px 8px",borderRadius:6}}>{it.tag}</span></div><RProse>{it.text}</RProse></div>)}
        <RDivider />
        <div style={{fontSize:13,color:"#fff",fontWeight:600,marginBottom:14}}>申請可能な補助金</div>
        {[
          {l:"IT導入補助金",amt:"最大¥450万",pct:"費用の1/2〜3/4",d:"ソフトウェア・クラウド導入。申請は年数回の公募。"},
          {l:"小規模事業者持続化補助金",amt:"最大¥200万",pct:"費用の2/3",d:"販路開拓（Web制作・広告）。商工会議所の支援が必要。"},
          {l:"キャリアアップ助成金",amt:"1人¥57万",pct:"-",d:"非正規→正規転換。パート雇用→正社員化で申請可能。"},
        ].map((it,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"10px 0",borderBottom:i<2?`1px solid ${C.border}`:"none"}}><div><div style={{fontSize:13,color:"#fff",fontWeight:500}}>{it.l}</div><div style={{fontSize:11,color:C.textMut}}>{it.d}</div></div><div style={{textAlign:"right"}}><div style={{fontFamily:hd,fontSize:14,color:C.purpleLight}}>{it.amt}</div><div style={{fontSize:10,color:C.textMut}}>{it.pct}</div></div></div>)}
      </div>,
    ],

    corpStrategy: [
      () => <div>
        <RKpiRow items={allKPIs.corpStrategy} />
        <div style={{display:"grid",gridTemplateColumns:"1fr 140px 140px",gap:0,marginBottom:20}}>
          <div style={{padding:"10px 0",borderBottom:`1px solid ${C.border}`}} />
          <div style={{padding:"10px 12px",borderBottom:`1px solid ${C.border}`,fontSize:10,fontWeight:600,color:C.textMut,textAlign:"center",fontFamily:mono}}>個人事業</div>
          <div style={{padding:"10px 12px",borderBottom:`1px solid ${C.border}`,fontSize:10,fontWeight:600,color:C.purpleLight,textAlign:"center",fontFamily:mono,background:"rgba(139,123,244,.03)"}}>法人</div>
          {[{l:"税額合計",a:"¥855万",b:"¥677万"},{l:"給与所得控除",a:"なし",b:"¥190万"},{l:"赤字繰越",a:"3年",b:"10年"},{l:"経費範囲",a:"限定的",b:"社宅・日当・退職金"}].map((r,i)=><React.Fragment key={i}>
            <div style={{padding:"12px 0",borderBottom:i<3?`1px solid ${C.border}`:"none",fontSize:12,color:C.textSec}}>{r.l}</div>
            <div style={{padding:"12px",borderBottom:i<3?`1px solid ${C.border}`:"none",fontSize:13,color:C.textMut,textAlign:"center",fontFamily:hd}}>{r.a}</div>
            <div style={{padding:"12px",borderBottom:i<3?`1px solid ${C.border}`:"none",fontSize:13,color:"#fff",textAlign:"center",fontFamily:hd,fontWeight:600,background:"rgba(139,123,244,.03)"}}>{r.b}</div>
          </React.Fragment>)}
        </div>
        <RProse>年間所得3,984万円では法人成りのメリットが年間<RNum color="#7BE0A0">¥178万</RNum>。設立コスト約¥25万は<RStrong>約2ヶ月で回収</RStrong>。合同会社なら設立費¥10万で開始でき、1ヶ月で回収。最適タイミングは確定申告完了後の4月以降。</RProse>
        <RCallout type="good">法人化で使える追加の節税手段: 役員社宅（家賃50〜80%を経費）、出張日当（月3〜5万を非課税支給）、生命保険料（条件付き経費計上）、退職金積立。個人事業では使えなかったこれらで<RStrong>さらに年¥100〜200万</RStrong>の節税が可能。</RCallout>
      </div>,
    ],
  }; // end allReportPages_ARCHIVED
  */

  const pick = (id) => { setSelected(id); setShowOverview(false); setChatMsgs([]); setChatInput(""); setRci(0); };
  const kpis = allKPIs[selected] || [];
  const pages = allReportPages[selected] || [];
  const topicLabel = allCards.find(t=>t.id===selected)?.label || "";

  /* ═══ Chat response engine — Claude API ═══ */
  const sendMsg = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const q = chatInput.trim();
    setChatMsgs(c => [...c, { role:"user", text:q }]);
    setChatInput("");
    setChatLoading(true);

    const cardKpis = (allKPIs[selected] || []).map(k => `${k.l}: ${k.v}`).join(" / ");
    const archetypeCtx = activeArchetype
      ? `企業タイプ: ${activeArchetype.name}（${activeArchetype.jp}）\nキャッチフレーズ: ${activeArchetype.catchphrase}\n優先施策: ${activeArchetype.priority.join("、")}\n注意点: ${activeArchetype.warning}`
      : "";

    const systemPrompt = `あなたは日本の中小企業専門の最上位レベルの財務コンサルタントです。税理士・公認会計士・中小企業診断士の知識を統合し、経営者に対して最高水準の財務アドバイスを提供します。

【クライアント企業の診断情報】
${archetypeCtx}

【現在の相談テーマ】
${topicLabel || "財務全般"}

【関連KPIデータ】
${cardKpis || "データなし"}

【回答の原則】
- 経営者目線で「今すぐ動けること」を具体的に伝える
- 数字・金額・期限を必ず含める
- 企業タイプの優先施策に沿ったアドバイスにする
- 抽象論・一般論は避け、このクライアントに特化した内容にする
- 日本の税法・会計基準に準拠した正確な情報を提供する
- 300〜500文字程度で明快に答える
- 専門用語は使うが必ず平易な言葉で補足する`;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: systemPrompt,
          messages: [
            ...chatMsgs.map(m => ({ role: m.role === "ai" ? "assistant" : "user", content: m.text })),
            { role: "user", content: q }
          ],
        }),
      });
      const data = await res.json();
      const reply = data.content?.[0]?.text || "回答を取得できませんでした。";
      setChatMsgs(c => [...c, { role:"ai", text:reply }]);
    } catch (e) {
      setChatMsgs(c => [...c, { role:"ai", text:"通信エラーが発生しました。再度お試しください。" }]);
    } finally {
      setChatLoading(false);
    }
  };

  /* ═══ OVERALL ANALYSIS (default view) ═══ */
  if (dataLoading) {
    return (
      <PageShell title="財務エージェント" watermark={"Ag\nent"}>
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:320, gap:16 }}>
          <div style={{ display:"flex", gap:6 }}>
            {[0,1,2].map(i=><div key={i} style={{ width:8, height:8, borderRadius:"50%", background:"rgba(168,155,255,.5)", animation:`dotPulse 1.2s ease-in-out ${i*0.2}s infinite` }}/>)}
          </div>
          <div style={{ fontSize:12, color:"rgba(168,155,255,.5)" }}>財務データを読み込んでいます…</div>
        </div>
      </PageShell>
    );
  }

  if (!selected) {
    return (
      <PageShell title="財務エージェント" watermark={"Ag\nent"}>
        <Rv><div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
          <div>
            <div style={{ fontSize:18, color:"#fff", fontWeight:600, letterSpacing:"-.01em" }}>財務エージェント</div>
            <div style={{ fontSize:11, color:C.textMut, marginTop:4 }}>分析したいテーマを選んでください</div>
          </div>
          <div style={{ padding:"6px 14px", background:`${ac}12`, border:`1px solid ${ac}30`, borderRadius:12, fontSize:11, color:ac, fontWeight:600, letterSpacing:.5 }}>{activeArchetype.name} — {activeArchetype.jp}</div>
        </div></Rv>

        {sortedPillars.map((p, pi) => (
          <Rv key={pi} d={20 + pi*5}>
            <div style={{ fontSize:11, color:C.textMut, fontWeight:500, marginBottom:8, marginTop:pi?12:0 }}>{p.cat}</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:4 }}>
              {p.items.map((t) => {
                const rank = priorityOrder.indexOf(t.id);
                const isTop = rank !== -1 && rank < 3;
                const isOverview = t.id === "overview";
                return (
                  <PressableCard key={t.id} onClick={()=>pick(t.id)} fullWidth={isOverview} accentColor={isOverview ? ac : isTop ? ac : undefined}>
                    {isOverview && <div style={{ position:"absolute", top:10, right:12, fontSize:8, color:ac, fontWeight:700, letterSpacing:1, padding:"2px 8px", borderRadius:20, background:`${ac}10`, border:`1px solid ${ac}20` }}>まずここから</div>}
                    {!isOverview && isTop && <div style={{ position:"absolute", top:10, right:12, fontSize:8, color:ac, fontWeight:700, letterSpacing:1, padding:"2px 8px", borderRadius:20, background:`${ac}10`, border:`1px solid ${ac}20` }}>優先</div>}
                    <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                      <div style={{ width:40, height:40, borderRadius:"50%", background: isOverview ? `${ac}10` : "rgba(255,255,255,.03)", border: isOverview ? `1px solid ${ac}25` : "1px solid rgba(255,255,255,.08)", display:"flex", alignItems:"center", justifyContent:"center", color: isOverview ? ac : "rgba(255,255,255,.5)", flexShrink:0, boxShadow: isOverview ? `0 0 14px ${ac}20` : "0 0 10px rgba(255,255,255,.08)" }}>{t.icon}</div>
                      <div>
                        <div style={{ fontSize:14, fontWeight:600, color:"#fff", marginBottom:4 }}>{t.label}</div>
                        <div style={{ fontSize:10, color:C.textMut, lineHeight:1.5 }}>{t.sub}</div>
                      </div>
                    </div>
                  </PressableCard>
                );
              })}
            </div>
          </Rv>
        ))}
      </PageShell>
    );
  }

  /* ═══ OVERVIEW CARD DETAIL ═══ */
  if (selected === "overview") {
    return (
      <PageShell title="財務エージェント" watermark={"Ag\nent"}>
        <Rv><div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:36, height:36, borderRadius:"50%", background:`${ac}10`, border:`1px solid ${ac}25`, display:"flex", alignItems:"center", justifyContent:"center", color:ac }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z"/></svg>
            </div>
            <span style={{ fontSize:18, color:"#fff", fontWeight:600, letterSpacing:"-.01em" }}>全体分析</span>
          </div>
          <button type="button" onClick={()=>{ setSelected(null); setChatMsgs([]); }} style={{ padding:"6px 14px", borderRadius:100, border:`1px solid ${C.border}`, background:"transparent", color:C.textMut, fontSize:10, fontWeight:500, cursor:"pointer", fontFamily:bd }}>← 戻る</button>
        </div></Rv>

        {/* TOP3 priority */}
        <Rv d={5}><div style={{ padding:"18px 20px", background:`${ac}04`, border:`1px solid ${ac}10`, borderRadius:16, marginBottom:20 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={ac} strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z"/></svg>
            <div style={{ fontSize:11, color:ac, fontWeight:600, letterSpacing:".06em" }}>{activeArchetype.jp}として優先すべきアクション</div>
          </div>
          {top3.map((it,i) => (
            <Mag key={i} onClick={()=>pick(it.card)} s={{ display:"flex", gap:12, padding:"10px 0", borderTop:i?`1px solid ${ac}08`:"none", cursor:"pointer" }}>
              <div style={{ width:24, height:24, borderRadius:"50%", background:`${it.c}10`, border:`1.5px solid ${it.c}30`, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:mono, fontSize:11, color:it.c, fontWeight:700, flexShrink:0, marginTop:2 }}>{it.n}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, color:"#fff", fontWeight:600, marginBottom:2 }}>{it.title}</div>
                <div style={{ fontSize:11, color:C.textMut, lineHeight:1.5 }}>{it.detail}</div>
              </div>
              <span style={{ color:C.textMut, fontSize:10, marginTop:4 }}>→</span>
            </Mag>
          ))}
        </div></Rv>

        {/* 6 area overview grades */}
        <Rv d={10}><div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          {overviewGrades.map((og, i) => (
            <Card3 key={i} s={{ padding:"20px" }}>
              <div style={{ fontSize:14, color:"#fff", fontWeight:600, marginBottom:10 }}>{og.cat}</div>
              <div style={{ fontSize:11, color:C.textMut, lineHeight:1.7, marginBottom:12 }}>{og.summary}</div>
              <div style={{ fontSize:10, color:og.color, fontWeight:600, background:`${og.color}08`, border:`1px solid ${og.color}15`, borderRadius:8, padding:"6px 10px" }}>{og.impact}</div>
            </Card3>
          ))}
        </div></Rv>
      </PageShell>
    );
  }

  /* ═══ CARD DETAIL VIEW ═══ */
  return (
    <PageShell title="財務エージェント" watermark={"Ag\nent"}>
      <Rv><div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:36, height:36, borderRadius:"50%", background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.08)", display:"flex", alignItems:"center", justifyContent:"center", color:"rgba(255,255,255,.6)", boxShadow:"0 0 12px rgba(255,255,255,.12)" }}>{allCards.find(t=>t.id===selected)?.icon}</div>
          <span style={{ fontSize:18, color:"#fff", fontWeight:600, letterSpacing:"-.01em" }}>{topicLabel}</span>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <button type="button" onClick={()=>{ setSelected(null); setChatMsgs([]); }} style={{ padding:"6px 14px", borderRadius:100, border:`1px solid ${C.border}`, background:"transparent", color:C.textMut, fontSize:10, fontWeight:500, cursor:"pointer", fontFamily:bd }}>← 戻る</button>
        </div>
      </div></Rv>

      {/* KPI row */}
      <Rv d={10}><div style={{ display:"grid", gridTemplateColumns:`repeat(${kpis.length},1fr)`, gap:10, marginBottom:16 }}>
        {kpis.map((k,i)=>(
          <Mag key={i} onClick={()=>setChatInput(`${k.l}について詳しく教えて`)} s={{ cursor:"pointer", display:"block", textAlign:"left" }}>
            <Card3 s={{ padding:"14px 16px" }}>
              <div style={{ fontSize:9, color:C.textMut, fontWeight:500, letterSpacing:".1em", fontFamily:mono, marginBottom:4 }}>{k.l}</div>
              <div style={{ fontFamily:hd, fontSize:20, fontWeight:300, color:k.c||"#fff", letterSpacing:"-.02em", textShadow:`0 0 16px ${k.c||"#fff"}25` }}>{k.v}</div>
            </Card3>
          </Mag>
        ))}
      </div></Rv>

      {/* Report pages */}
      <Rv d={15}><Card3 s={{ padding:"32px 28px" }}>
        {pages[rci] ? pages[rci]() : <RProse>分析データを読み込んでいます…</RProse>}
        {pages.length > 1 && <div style={{ display:"flex", justifyContent:"center", gap:8, marginTop:24, paddingTop:16, borderTop:`1px solid ${C.border}` }}>
          {pages.map((_,i) => (
            <Mag key={i} onClick={()=>setRci(i)} s={{ width:32, height:32, borderRadius:"50%", border:rci===i?`1.5px solid ${C.purpleLight}`:`1.5px solid ${C.border}`, background:rci===i?"rgba(139,123,244,.1)":"transparent", color:rci===i?C.purpleLight:C.textMut, fontFamily:mono, fontSize:11, fontWeight:600, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>{i+1}</Mag>
          ))}
        </div>}
      </Card3></Rv>

      {/* Chat */}
      <Rv d={20}><Card3 s={{ padding:"20px 24px", marginTop:16 }}>
        <div style={{ fontSize:11, color:C.textMut, fontWeight:600, letterSpacing:".06em", marginBottom:12 }}>チャットで深掘り</div>
        <div style={{ maxHeight:280, overflowY:"auto", marginBottom:12 }}>
          {chatMsgs.length===0 && !chatLoading && <div style={{ textAlign:"center", padding:"20px 0", color:C.textMut, fontSize:11 }}>KPIカードをタップで質問を自動入力。最高水準の財務アドバイスを受けられます。</div>}
          {chatMsgs.map((msg,i)=>(
            <div key={i} style={{ display:"flex", justifyContent:msg.role==="user"?"flex-end":"flex-start", marginBottom:10 }}>
              <div style={{ maxWidth:"85%", padding:"10px 16px", borderRadius:msg.role==="user"?"18px 18px 4px 18px":"18px 18px 18px 4px", background:msg.role==="user"?"rgba(139,123,244,.1)":"rgba(255,255,255,.03)", border:`1px solid ${msg.role==="user"?"rgba(139,123,244,.2)":"rgba(255,255,255,.06)"}` }}>
                <div style={{ fontSize:12, color:msg.role==="user"?"#C4B8FF":"#E0DAFF", lineHeight:1.7, whiteSpace:"pre-wrap" }}>{msg.text}</div>
              </div>
            </div>
          ))}
          {chatLoading && (
            <div style={{ display:"flex", justifyContent:"flex-start", marginBottom:10 }}>
              <div style={{ padding:"12px 18px", borderRadius:"18px 18px 18px 4px", background:"rgba(255,255,255,.03)", border:"1px solid rgba(255,255,255,.06)", display:"flex", gap:6, alignItems:"center" }}>
                {[0,1,2].map(i => (
                  <div key={i} style={{ width:6, height:6, borderRadius:"50%", background:"rgba(168,155,255,.5)", animation:`dotPulse 1.2s ease-in-out ${i*0.2}s infinite` }}/>
                ))}
              </div>
            </div>
          )}
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <input value={chatInput} onChange={e=>setChatInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendMsg()}
            placeholder="質問を入力..."
            style={{ flex:1, padding:"10px 16px", borderRadius:18, border:"1px solid rgba(139,123,244,.15)", background:"rgba(139,123,244,.04)", color:"#E0DAFF", fontSize:12, fontFamily:bd, outline:"none", caretColor:"#A89BFF" }}/>
          <BtnApprove onClick={sendMsg} s={{ padding:"10px 18px", borderRadius:18, border:chatInput.trim()&&!chatLoading?"1px solid rgba(139,123,244,.4)":"none", background:chatInput.trim()&&!chatLoading?"rgba(139,123,244,.12)":C.border, color:chatInput.trim()&&!chatLoading?"#C4B8FF":C.textMut, fontSize:12, fontWeight:600, cursor:chatInput.trim()&&!chatLoading?"pointer":"default", fontFamily:bd, boxShadow:chatInput.trim()&&!chatLoading?"0 0 14px rgba(139,123,244,.3)":"none", opacity:chatLoading?.5:1 }}>{chatLoading?"…":"送信"}</BtnApprove>
        </div>
      </Card3></Rv>
    </PageShell>
  );
}

/* ════════════════════════════════ 入力 (INPUT) ════════════════════════════════ */
/* ═══ INPUT PAGE ICONS ═══ */
const InputIconCamera = ({ size = 38, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/>
  </svg>
);
const InputIconFolder = ({ size = 38, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
    <line x1="12" y1="11" x2="12" y2="17"/><polyline points="9 14 12 11 15 14"/>
  </svg>
);
const InputIconTable = ({ size = 38, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2"/>
    <line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/>
    <line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/>
  </svg>
);
const InputIconScan = ({ size = 28, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 7V2h5"/><path d="M22 7V2h-5"/><path d="M2 17v5h5"/><path d="M22 17v5h-5"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const InputIconUpArrow = ({ size = 28, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
  </svg>
);
const InputIconBolt = ({ size = 28, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);
const InputIconCheck = ({ size = 14, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);
const InputIconFileText = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
);

/* ════════════════════════════════ ファイルボックス (FILE BOX) ════════════════════════════════ */

export default ConsultPage;
