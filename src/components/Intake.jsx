import React, { useState, useEffect, useRef, useCallback } from "react";
import { C, hd, bd, mono, FONT } from "../lib/theme";
import { Rv, Mag, Card3, WireCanvas, KL } from "./ui";

function JapanMap({ selected, onSelect }) {
  const [hover, setHover] = useState(null);
  const [pulse, setPulse] = useState(null);
  const [t, setT] = useState(0);
  useEffect(() => { const iv = setInterval(() => setT(p => p + 1), 50); return () => clearInterval(iv); }, []);

  const prefs = [
    { id:"北海道", cx:330,cy:52,r:32 },
    { id:"青森県", cx:310,cy:110,r:16 },{ id:"岩手県", cx:320,cy:135,r:16 },{ id:"秋田県", cx:295,cy:132,r:14 },
    { id:"宮城県", cx:312,cy:158,r:14 },{ id:"山形県", cx:293,cy:155,r:13 },{ id:"福島県", cx:300,cy:178,r:16 },
    { id:"茨城県", cx:305,cy:205,r:13 },{ id:"栃木県", cx:290,cy:192,r:12 },{ id:"群馬県", cx:272,cy:190,r:12 },
    { id:"埼玉県", cx:282,cy:210,r:11 },{ id:"千葉県", cx:305,cy:225,r:14 },{ id:"東京都", cx:286,cy:226,r:10 },{ id:"神奈川県", cx:280,cy:240,r:11 },
    { id:"新潟県", cx:265,cy:155,r:16 },{ id:"富山県", cx:235,cy:170,r:11 },{ id:"石川県", cx:220,cy:175,r:11 },{ id:"福井県", cx:210,cy:192,r:11 },
    { id:"山梨県", cx:264,cy:225,r:10 },{ id:"長野県", cx:254,cy:200,r:14 },{ id:"岐阜県", cx:228,cy:200,r:13 },
    { id:"静岡県", cx:256,cy:244,r:14 },{ id:"愛知県", cx:232,cy:230,r:13 },
    { id:"三重県", cx:215,cy:248,r:13 },{ id:"滋賀県", cx:205,cy:210,r:10 },{ id:"京都府", cx:190,cy:205,r:12 },
    { id:"大阪府", cx:195,cy:228,r:10 },{ id:"兵庫県", cx:175,cy:218,r:14 },{ id:"奈良県", cx:205,cy:232,r:9 },{ id:"和歌山県", cx:192,cy:255,r:12 },
    { id:"鳥取県", cx:158,cy:198,r:11 },{ id:"島根県", cx:135,cy:200,r:13 },{ id:"岡山県", cx:160,cy:218,r:12 },{ id:"広島県", cx:138,cy:222,r:14 },{ id:"山口県", cx:112,cy:228,r:13 },
    { id:"徳島県", cx:180,cy:258,r:10 },{ id:"香川県", cx:172,cy:242,r:9 },{ id:"愛媛県", cx:148,cy:252,r:13 },{ id:"高知県", cx:158,cy:272,r:14 },
    { id:"福岡県", cx:95,cy:252,r:13 },{ id:"佐賀県", cx:80,cy:262,r:10 },{ id:"長崎県", cx:65,cy:272,r:12 },
    { id:"熊本県", cx:88,cy:280,r:13 },{ id:"大分県", cx:110,cy:262,r:12 },{ id:"宮崎県", cx:108,cy:292,r:12 },{ id:"鹿児島県", cx:85,cy:308,r:14 },
    { id:"沖縄県", cx:42,cy:370,r:14 },
  ];

  const handleClick = (id) => { onSelect(id); setPulse(id); setTimeout(() => setPulse(null), 800); };
  const short = (id) => id.replace("県","").replace("府","").replace("都","");

  return (
    <div>
      <svg viewBox="20 10 360 390" style={{ width: "100%", maxWidth: 540, height: "auto" }}>
        <defs>
          <filter id="gl"><feGaussianBlur stdDeviation="6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          <filter id="gl2"><feGaussianBlur stdDeviation="12" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          <filter id="gl3"><feGaussianBlur stdDeviation="18" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          <filter id="elev"><feDropShadow dx="0" dy="2" stdDeviation="8" floodColor="#8B7BF4" floodOpacity=".5"/><feDropShadow dx="0" dy="0" stdDeviation="16" floodColor="#A89BFF" floodOpacity=".25"/></filter>
          <filter id="neon"><feGaussianBlur stdDeviation="3" in="SourceGraphic" result="b1"/><feGaussianBlur stdDeviation="8" in="SourceGraphic" result="b2"/><feMerge><feMergeNode in="b2"/><feMergeNode in="b1"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          <radialGradient id="bg1" cx="60%" cy="40%" r="60%"><stop offset="0%" stopColor="#8B7BF4" stopOpacity=".1"/><stop offset="100%" stopColor="#8B7BF4" stopOpacity=".02"/></radialGradient>
          <radialGradient id="neonFill" cx="35%" cy="35%" r="65%"><stop offset="0%" stopColor="#C4B8FF" stopOpacity=".9"/><stop offset="60%" stopColor="#8B7BF4" stopOpacity=".7"/><stop offset="100%" stopColor="#6B5CE7" stopOpacity=".5"/></radialGradient>
          <radialGradient id="neonHov" cx="35%" cy="35%" r="65%"><stop offset="0%" stopColor="#A89BFF" stopOpacity=".5"/><stop offset="100%" stopColor="#8B7BF4" stopOpacity=".25"/></radialGradient>
          <radialGradient id="neonIdle" cx="40%" cy="40%" r="60%"><stop offset="0%" stopColor="#8B7BF4" stopOpacity=".18"/><stop offset="100%" stopColor="#6B5CE7" stopOpacity=".08"/></radialGradient>
        </defs>
        {/* Background glow */}
        <rect x="20" y="10" width="360" height="390" fill="url(#bg1)" rx="12"/>

        {/* Connection lines */}
        {prefs.map((a, i) => prefs.slice(i+1).map((b, j) => {
          const d = Math.sqrt((a.cx-b.cx)**2+(a.cy-b.cy)**2);
          if (d > 45) return null;
          const isActive = a.id === hover || b.id === hover || a.id === selected || b.id === selected;
          return <line key={`${i}-${j}`} x1={a.cx} y1={a.cy} x2={b.cx} y2={b.cy} stroke={isActive ? "rgba(139,123,244,.35)" : "rgba(139,123,244,.1)"} strokeWidth={isActive ? 1.2 : .5} style={{ transition: "all .3s", filter: isActive ? "url(#gl)" : "none" }}/>;
        }))}

        {prefs.map((p, idx) => {
          const isSel = selected === p.id;
          const isHov = hover === p.id;
          const isPulse = pulse === p.id;
          // Subtle float animation
          const fx = Math.sin(t * .06 + idx * .8) * 1.2;
          const fy = Math.cos(t * .05 + idx * 1.2) * 1;
          const sc = isSel ? 1.3 : isHov ? 1.15 : 1;

          return (
            <g key={p.id} onClick={() => handleClick(p.id)}
              onMouseEnter={() => setHover(p.id)} onMouseLeave={() => setHover(null)}
              style={{ cursor: "pointer", filter: isSel ? "url(#gl3)" : isHov ? "url(#neon)" : "none", transition: "filter .3s" }}>
              {/* Pulse ring */}
              {isPulse && <>
                <circle cx={p.cx+fx} cy={p.cy+fy} r={p.r} fill="none" stroke="#C4B8FF" strokeWidth="2.5" opacity="0">
                  <animate attributeName="r" from={p.r} to={p.r*3.5} dur=".8s" fill="freeze"/>
                  <animate attributeName="opacity" from=".8" to="0" dur=".8s" fill="freeze"/>
                </circle>
                <circle cx={p.cx+fx} cy={p.cy+fy} r={p.r} fill="none" stroke="#A89BFF" strokeWidth="2" opacity="0">
                  <animate attributeName="r" from={p.r} to={p.r*2.5} dur=".6s" fill="freeze" begin=".1s"/>
                  <animate attributeName="opacity" from=".6" to="0" dur=".6s" fill="freeze" begin=".1s"/>
                </circle>
              </>}
              {/* Deep outer glow */}
              {(isSel || isHov) && <circle cx={p.cx+fx} cy={p.cy+fy} r={p.r*2.4} fill="#8B7BF4" opacity={isSel ? .1 : .04} filter="url(#gl2)"/>}
              {/* Mid glow ring */}
              {(isSel || isHov) && <circle cx={p.cx+fx} cy={p.cy+fy} r={p.r*1.6} fill="none" stroke="#A89BFF" strokeWidth={isSel ? 1.5 : .8} opacity={isSel ? .35 : .15} filter="url(#gl)"/>}
              {/* Main filled circle */}
              <circle cx={p.cx+fx} cy={p.cy+fy} r={p.r * sc}
                fill={isSel ? "url(#neonFill)" : isHov ? "url(#neonHov)" : "url(#neonIdle)"}
                stroke={isSel ? "#C4B8FF" : isHov ? "#A89BFF" : "rgba(139,123,244,.3)"}
                strokeWidth={isSel ? 2 : isHov ? 1.5 : .6}
                style={{ transition: "all .25s cubic-bezier(.16,1,.3,1)", transform: isSel ? `translate(${fx}px, ${fy - 6}px)` : undefined, transformOrigin: `${p.cx}px ${p.cy}px` }}/>
              {/* Inner bright core */}
              {(isSel || isHov) && <circle cx={p.cx+fx} cy={p.cy+fy} r={p.r * sc * .4}
                fill="#C4B8FF" opacity={isSel ? .25 : .12}
                style={{ transition: "all .25s" }}/>}
              {/* Label */}
              <text x={p.cx+fx} y={p.cy+fy+1} textAnchor="middle" dominantBaseline="middle"
                fill={isSel ? "#fff" : isHov ? "#E0DAFF" : "rgba(196,184,255,.6)"}
                fontSize={p.r > 14 ? 8 : p.r > 10 ? 7 : 6}
                fontWeight={isSel || isHov ? 800 : 600}
                fontFamily={bd} style={{ pointerEvents: "none", transition: "all .2s" }}>
                {short(p.id)}
              </text>
            </g>
          );
        })}
      </svg>

      {selected && (
        <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 14, animation: "fadeUp .3s ease-out" }}>
          <div style={{ padding: "12px 28px", background: "rgba(139,123,244,.1)", border: "1px solid rgba(139,123,244,.3)", borderRadius: 100, color: "#C4B8FF", fontSize: 16, fontWeight: 700, fontFamily: bd, display: "flex", alignItems: "center", gap: 10, boxShadow: "0 0 16px rgba(139,123,244,.3), 0 0 40px rgba(139,123,244,.12)" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#A89BFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>
            {selected}
          </div>
          <button type="button" onClick={() => onSelect("")} style={{ border: "1.5px solid rgba(139,123,244,.25)", borderRadius: 100, background: "transparent", color: "rgba(196,184,255,.5)", fontSize: 12, cursor: "pointer", fontFamily: bd, fontWeight: 600, padding: "8px 16px" }}>変更</button>
        </div>
      )}
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}

/* ════════════════════════════════ INTAKE ════════════════════════════════ */
/* ═══════════════════════════════════════════════
   COMPANY ARCHETYPES — 9 types
   ═══════════════════════════════════════════════ */
const COMPANY_TYPES = {
  phoenix: {
    id: "phoenix",
    name: "PHOENIX",
    jp: "再建士型",
    tag: "TURNAROUND",
    color: "#ff9060",
    colorDim: "rgba(255,144,96,0.15)",
    colorGlow: "rgba(255,96,48,0.35)",
    bgGrad: "linear-gradient(145deg,#1c0e06,#2e1608,#1a0f08)",
    foilGrad: "linear-gradient(270deg,rgba(255,80,0,.3),rgba(255,200,50,.3),rgba(255,100,30,.3),rgba(200,50,0,.3))",
    catchphrase: "炎から蘇る財務再建の専門家",
    desc: "過去の赤字や借入を整理し、次の成長フェーズへ転換することを最優先に設計します。損益改善・不採算部門の整理・債務圧縮を段階的に進めます。",
    priority: ["損益分岐点の見直し", "債務リストラクチャリング", "キャッシュフロー正常化"],
    warning: "短期の節税より財務健全化を優先。見せかけの利益計上に注意。",
    svgPath: `<path d="M25 42 Q13 32 7 18 Q15 22 20 30 Q14 18 18 9 Q23 20 23 32" fill="none" stroke="#ff9060" stroke-width="1.8"/>
      <path d="M25 42 Q37 32 43 18 Q35 22 30 30 Q36 18 32 9 Q27 20 27 32" fill="none" stroke="#ff9060" stroke-width="1.8"/>
      <ellipse cx="25" cy="36" rx="4" ry="6" fill="none" stroke="#ff9060" stroke-width="1.2"/>
      <circle cx="25" cy="30" r="3" fill="#ff9060" opacity=".8"/>
      <path d="M22 43 Q24 48 25 46 Q26 48 28 43" fill="none" stroke="#ff9060" stroke-width="1"/>`,
    score: (f) => {
      let s = 0;
      if (f.loss_carry && f.loss_carry !== "なし") s += 30;
      if (f.debt && f.debt !== "なし" && f.debt !== "わからない") s += 25;
      if (f.audit && f.audit === "あり（指摘あり）") s += 20;
      if (f.revenue && f.revenue === "〜300万円") s += 15;
      return s;
    }
  },
  leviathan: {
    id: "leviathan",
    name: "LEVIATHAN",
    jp: "融資獲得型",
    tag: "FUNDRAISING",
    color: "#60b8ff",
    colorDim: "rgba(96,184,255,0.15)",
    colorGlow: "rgba(32,128,255,0.35)",
    bgGrad: "linear-gradient(145deg,#03091e,#071530,#050d20)",
    foilGrad: "linear-gradient(270deg,rgba(0,100,255,.3),rgba(100,220,255,.3),rgba(0,150,200,.3),rgba(20,80,200,.3))",
    catchphrase: "金融機関を動かす財務設計の王者",
    desc: "銀行・政策金融公庫との関係構築と、融資を引き出すための財務書類・決算内容の最適化を最優先します。信用力の可視化が核心戦略です。",
    priority: ["決算書の見た目最適化", "借入枠の拡大戦略", "返済能力の財務証明"],
    warning: "過剰借入による利払い負担に注意。CF計画を必ず立てる。",
    svgPath: `<ellipse cx="25" cy="28" rx="16" ry="8" fill="none" stroke="#60b8ff" stroke-width="1.8"/>
      <path d="M41 28 Q47 23 47 28 Q47 33 41 31 Z" fill="#60b8ff" opacity=".7"/>
      <circle cx="15" cy="26" r="2.5" fill="none" stroke="#60b8ff" stroke-width="1.2"/>
      <circle cx="15" cy="26" r="1" fill="#60b8ff" opacity=".8"/>
      <line x1="21" y1="25" x2="35" y2="25" stroke="#60b8ff" stroke-width=".9" opacity=".6"/>
      <line x1="23" y1="30" x2="37" y2="30" stroke="#60b8ff" stroke-width=".9" opacity=".6"/>
      <path d="M16 17 L19 11 L24 15 L29 11 L32 17 Z" fill="none" stroke="#60b8ff" stroke-width="1.2" stroke-linejoin="round"/>
      <path d="M10 38 Q18 34 26 38 Q34 42 42 38" fill="none" stroke="#60b8ff" stroke-width="1" opacity=".5"/>`,
    score: (f) => {
      let s = 0;
      if (f.debt && f.debt !== "なし") s += 30;
      if (f.concern && /融資|借入|資金調達/.test(f.concern)) s += 30;
      if (f.revenue && ["3,000万〜1億円","1億〜5億円","5億円以上"].includes(f.revenue)) s += 20;
      if (f.special && f.special.includes("大きな設備投資")) s += 10;
      return s;
    }
  },
  dragon: {
    id: "dragon",
    name: "DRAGON",
    jp: "ロケット型",
    tag: "SCALE-UP",
    color: "#00e8d0",
    colorDim: "rgba(0,232,208,0.15)",
    colorGlow: "rgba(0,192,168,0.35)",
    bgGrad: "linear-gradient(145deg,#021414,#042424,#031c1c)",
    foilGrad: "linear-gradient(270deg,rgba(0,200,180,.3),rgba(100,255,240,.3),rgba(0,180,160,.3),rgba(0,220,200,.3))",
    catchphrase: "成長加速のために財務を武器にする",
    desc: "売上・人員・投資を高速で拡大するフェーズ。資金繰りの先読みと、税負担を抑えながら再投資できる財務構造の設計が鍵です。",
    priority: ["再投資サイクルの設計", "人件費増加への対応", "法人税の繰り延べ戦略"],
    warning: "成長に酔ってキャッシュ不足に陥るケースが多い。月次CF管理を徹底。",
    svgPath: `<path d="M25 40 Q14 34 10 24 Q16 24 20 28 Q16 18 22 11 Q24 20 26 28 Q28 20 30 14 Q38 22 36 32 Q40 28 44 28 Q40 36 25 40Z" fill="none" stroke="#00e8d0" stroke-width="1.8"/>
      <circle cx="21" cy="20" r="1.5" fill="#00e8d0" opacity=".9"/>
      <line x1="24" y1="22" x2="20" y2="16" stroke="#00e8d0" stroke-width=".8" opacity=".6"/>
      <line x1="25.5" y1="20" x2="24" y2="13" stroke="#00e8d0" stroke-width=".8" opacity=".6"/>
      <line x1="27" y1="18" x2="28" y2="11" stroke="#00e8d0" stroke-width=".8" opacity=".6"/>
      <line x1="38" y1="42" x2="38" y2="34" stroke="#00e8d0" stroke-width="1.2" opacity=".7"/>
      <path d="M35 37 L38 33 L41 37" fill="none" stroke="#00e8d0" stroke-width="1.2" opacity=".7"/>`,
    score: (f) => {
      let s = 0;
      if (f.revenue && ["1,000万〜3,000万円","3,000万〜1億円"].includes(f.revenue)) s += 25;
      if (f.employees && ["6〜20人","21〜50人"].includes(f.employees)) s += 20;
      if (f.concern && /成長|拡大|スケール/.test(f.concern)) s += 25;
      if (f.special && f.special.includes("新規事業の開始")) s += 20;
      if (f.revenue_model && f.revenue_model.includes("サブスクリプション")) s += 10;
      return s;
    }
  },
  sphinx: {
    id: "sphinx",
    name: "SPHINX",
    jp: "節税エキスパート型",
    tag: "TAX MASTERY",
    color: "#d080ff",
    colorDim: "rgba(208,128,255,0.15)",
    colorGlow: "rgba(160,64,224,0.35)",
    bgGrad: "linear-gradient(145deg,#120a1e,#1e1030,#160e22)",
    foilGrad: "linear-gradient(270deg,rgba(180,60,255,.3),rgba(255,200,100,.3),rgba(200,80,255,.3),rgba(150,40,220,.3))",
    catchphrase: "合法的節税の限界を知り尽くした賢者",
    desc: "利益が安定しているフェーズで、いかに合法的に税負担を圧縮するかを最優先設計します。役員報酬・経費・減価償却・法人保険を組み合わせた総合戦略です。",
    priority: ["役員報酬の最適化", "経費計上の合法的拡大", "法人保険・退職金設計"],
    warning: "過度な節税は税務調査リスクを高める。根拠のない経費計上は禁物。",
    svgPath: `<polygon points="25,8 45,38 5,38" fill="none" stroke="#d080ff" stroke-width="1.8"/>
      <polygon points="25,16 37,34 13,34" fill="none" stroke="#d080ff" stroke-width="1.2" opacity=".7"/>
      <circle cx="25" cy="23" r="3" fill="none" stroke="#d080ff" stroke-width="1.2"/>
      <circle cx="25" cy="23" r="1.2" fill="#d080ff" opacity=".9"/>
      <line x1="16" y1="42" x2="34" y2="42" stroke="#d080ff" stroke-width=".8" opacity=".4"/>`,
    score: (f) => {
      let s = 0;
      if (f.revenue && ["1,000万〜3,000万円","3,000万〜1億円","1億〜5億円","5億円以上"].includes(f.revenue)) s += 20;
      if (f.concern && /節税|税|絶税/.test(f.concern)) s += 35;
      if (f.officer_pay && ["50万〜80万円","80万〜100万円","100万円以上"].includes(f.officer_pay)) s += 20;
      if (f.filing && f.filing.includes("青色申告")) s += 10;
      return s;
    }
  },
  chimera: {
    id: "chimera",
    name: "CHIMERA",
    jp: "多角化設計型",
    tag: "DIVERSIFY",
    color: "#ff80c0",
    colorDim: "rgba(255,128,192,0.15)",
    colorGlow: "rgba(224,64,144,0.35)",
    bgGrad: "linear-gradient(145deg,#1e0614,#300820,#200810)",
    foilGrad: "linear-gradient(270deg,rgba(255,60,160,.3),rgba(255,180,220,.3),rgba(220,40,140,.3),rgba(255,100,180,.3))",
    catchphrase: "複数の事業を束ねて相乗効果を生む",
    desc: "複数の事業部門・法人を持ち、グループ全体の税務・資金の最適化を設計します。法人分割・持株会社スキーム・グループ通算制度の活用が核心です。",
    priority: ["グループ間資金移動の最適化", "持株会社スキームの検討", "事業部門ごとの損益管理"],
    warning: "複雑な構造は管理コスト増大を招く。シンプルさとのバランスが重要。",
    svgPath: `<circle cx="18" cy="22" r="7" fill="none" stroke="#ff80c0" stroke-width="1.5"/>
      <circle cx="32" cy="22" r="7" fill="none" stroke="#ff80c0" stroke-width="1.5"/>
      <circle cx="25" cy="34" r="7" fill="none" stroke="#ff80c0" stroke-width="1.5"/>
      <line x1="18" y1="22" x2="32" y2="22" stroke="#ff80c0" stroke-width=".8" opacity=".5"/>
      <line x1="18" y1="22" x2="25" y2="34" stroke="#ff80c0" stroke-width=".8" opacity=".5"/>
      <line x1="32" y1="22" x2="25" y2="34" stroke="#ff80c0" stroke-width=".8" opacity=".5"/>
      <circle cx="25" cy="25" r="2" fill="#ff80c0" opacity=".8"/>`,
    score: (f) => {
      let s = 0;
      if (f.special && f.special.includes("新規事業の開始")) s += 30;
      if (f.revenue_model && f.revenue_model.length >= 3) s += 20;
      if (f.overseas && f.overseas !== "なし") s += 20;
      if (f.employees && ["21〜50人","51〜100人","100人以上"].includes(f.employees)) s += 15;
      return s;
    }
  },
  kraken: {
    id: "kraken",
    name: "KRAKEN",
    jp: "キャッシュ王型",
    tag: "CASHFLOW",
    color: "#40d0ff",
    colorDim: "rgba(64,208,255,0.15)",
    colorGlow: "rgba(0,160,220,0.35)",
    bgGrad: "linear-gradient(145deg,#021820,#033040,#022030)",
    foilGrad: "linear-gradient(270deg,rgba(0,180,240,.3),rgba(100,240,255,.3),rgba(0,200,230,.3),rgba(20,160,210,.3))",
    catchphrase: "キャッシュを支配するものが経営を制す",
    desc: "手元現金の最大化と資金ショートゼロを絶対目標にした財務設計。入金サイクルの短縮・支払いの後ろ倒し・手元資金の運用を体系的に管理します。",
    priority: ["売掛金回収サイクルの短縮", "支払条件の最適化", "手元流動性の確保"],
    warning: "利益は出ていても資金繰り悪化で倒産する「黒字倒産」に注意。",
    svgPath: `<circle cx="25" cy="25" r="10" fill="none" stroke="#40d0ff" stroke-width="1.5"/>
      <path d="M25 15 Q15 8 8 16" fill="none" stroke="#40d0ff" stroke-width="1.2"/>
      <path d="M25 15 Q35 8 42 16" fill="none" stroke="#40d0ff" stroke-width="1.2"/>
      <path d="M25 35 Q15 42 8 34" fill="none" stroke="#40d0ff" stroke-width="1.2"/>
      <path d="M25 35 Q35 42 42 34" fill="none" stroke="#40d0ff" stroke-width="1.2"/>
      <path d="M15 25 Q8 20 6 28" fill="none" stroke="#40d0ff" stroke-width="1"/>
      <path d="M35 25 Q42 20 44 28" fill="none" stroke="#40d0ff" stroke-width="1"/>
      <circle cx="25" cy="25" r="3" fill="#40d0ff" opacity=".7"/>`,
    score: (f) => {
      let s = 0;
      if (f.concern && /キャッシュ|資金繰り|現金/.test(f.concern)) s += 35;
      if (f.debt && ["〜500万円","500万〜2,000万円"].includes(f.debt)) s += 15;
      if (f.revenue_model && f.revenue_model.includes("物販・EC")) s += 15;
      if (f.industry && ["飲食・フード","小売・EC"].includes(f.industry)) s += 20;
      return s;
    }
  },
  griffin: {
    id: "griffin",
    name: "GRIFFIN",
    jp: "出口設計型",
    tag: "EXIT DESIGN",
    color: "#e8c040",
    colorDim: "rgba(232,192,64,0.15)",
    colorGlow: "rgba(192,144,32,0.35)",
    bgGrad: "linear-gradient(145deg,#181006,#2a1c08,#201408)",
    foilGrad: "linear-gradient(270deg,rgba(220,160,20,.3),rgba(255,220,80,.3),rgba(200,140,0,.3),rgba(240,180,40,.3))",
    catchphrase: "会社の価値を最大化して飛び立つ",
    desc: "M&A・事業承継・IPOなどの出口を見据えた財務設計。企業価値評価を高めるための利益構造・BS改善・役員退職金の最大活用を計画します。",
    priority: ["企業価値評価の向上", "役員退職金の最大化", "株式評価額のコントロール"],
    warning: "出口の3〜5年前から準備しないと間に合わない。早期着手が必須。",
    svgPath: `<path d="M25 38 Q14 30 10 18 Q18 22 22 28 Q16 16 22 9 Q26 18 26 28" fill="none" stroke="#e8c040" stroke-width="1.8"/>
      <path d="M25 38 Q36 30 40 18 Q32 22 28 28 Q34 16 28 9 Q24 18 24 28" fill="none" stroke="#e8c040" stroke-width="1.8"/>
      <circle cx="25" cy="32" r="5" fill="none" stroke="#e8c040" stroke-width="1.2"/>
      <path d="M28 31 L33 33 L28 35" fill="none" stroke="#e8c040" stroke-width="1.2"/>
      <circle cx="24" cy="31" r="1.2" fill="#e8c040" opacity=".9"/>
      <line x1="16" y1="44" x2="34" y2="44" stroke="#e8c040" stroke-width="1" opacity=".5"/>
      <path d="M30 41 L34 44 L30 47" fill="none" stroke="#e8c040" stroke-width="1" opacity=".5"/>`,
    score: (f) => {
      let s = 0;
      if (f.special && f.special.includes("M&A・事業譲渡")) s += 40;
      if (f.concern && /M&A|承継|売却|IPO|上場/.test(f.concern)) s += 35;
      if (f.revenue && ["1億〜5億円","5億円以上"].includes(f.revenue)) s += 15;
      if (f.advisor && f.advisor === "いる（乗り換え検討）") s += 10;
      return s;
    }
  },
  unicorn: {
    id: "unicorn",
    name: "UNICORN",
    jp: "創業期型",
    tag: "STARTUP",
    color: "#a0c8ff",
    colorDim: "rgba(160,200,255,0.15)",
    colorGlow: "rgba(100,150,230,0.35)",
    bgGrad: "linear-gradient(145deg,#080e1e,#101830,#0c1222)",
    foilGrad: "linear-gradient(270deg,rgba(100,160,255,.3),rgba(180,220,255,.3),rgba(120,180,255,.3),rgba(80,140,240,.3))",
    catchphrase: "最速で黒字化し土台を固める",
    desc: "創業初期の不安定な時期に、いかに早く損益分岐点を超えるかを最優先。記帳習慣・経費管理・助成金の活用から始め、税務の基礎を固めます。",
    priority: ["補助金・助成金の活用", "創業融資の獲得", "青色申告体制の整備"],
    warning: "創業初年度の税務ミスは後年に尾を引く。早期に専門家と連携すべき。",
    svgPath: `<path d="M38 36 Q30 44 28 36 Q26 26 32 20 Q36 16 42 18 Q50 20 52 28 Q50 36 44 38 Z" fill="none" stroke="#a0c8ff" stroke-width="1.8" transform="translate(-14,-2) scale(.95)"/>
      <line x1="28" y1="16" x2="26" y2="6" stroke="#a0c8ff" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="28" y1="16" x2="24" y2="8" stroke="#a0c8ff" stroke-width=".9" stroke-linecap="round"/>
      <text x="38" y="14" font-size="7" fill="#a0c8ff" opacity=".8">✦</text>
      <text x="10" y="12" font-size="5" fill="#a0c8ff" opacity=".5">✦</text>
      <text x="42" y="28" font-size="4" fill="#a0c8ff" opacity=".4">✦</text>`,
    score: (f) => {
      let s = 0;
      const yr = parseInt(f.year);
      if (yr && (2026 - yr) <= 3) s += 35;
      if (f.revenue && ["〜300万円","300万〜1,000万円"].includes(f.revenue)) s += 20;
      if (f.advisor && f.advisor === "いない") s += 15;
      if (f.employees && ["1人（自分だけ）","2〜5人"].includes(f.employees)) s += 15;
      return s;
    }
  },
  golem: {
    id: "golem",
    name: "GOLEM",
    jp: "安定堅守型",
    tag: "STABILITY",
    color: "#70e880",
    colorDim: "rgba(112,232,128,0.15)",
    colorGlow: "rgba(64,192,96,0.35)",
    bgGrad: "linear-gradient(145deg,#071008,#0f1e10,#091409)",
    foilGrad: "linear-gradient(270deg,rgba(20,180,60,.3),rgba(100,255,120,.3),rgba(60,200,80,.3),rgba(10,150,40,.3))",
    catchphrase: "盤石な財務基盤で嵐を乗り越える",
    desc: "安定期にある企業の財務守備力を強化。内部留保の積み上げ・リスク分散・事業継続計画（BCP）を軸に、10年先を見据えた堅実経営を設計します。",
    priority: ["内部留保の最大化", "事業継続リスクの管理", "定期的な財務健全性チェック"],
    warning: "守りすぎて時代の変化に乗り遅れるリスクにも注意が必要。",
    svgPath: `<rect x="15" y="30" width="20" height="12" fill="none" stroke="#70e880" stroke-width="1.8" rx="2"/>
      <rect x="17" y="20" width="16" height="10" fill="none" stroke="#70e880" stroke-width="1.8" rx="2"/>
      <rect x="19" y="12" width="12" height="8" fill="none" stroke="#70e880" stroke-width="1.8" rx="2"/>
      <line x1="18" y1="34" x2="32" y2="34" stroke="#70e880" stroke-width=".8" opacity=".5"/>
      <line x1="21" y1="24" x2="29" y2="24" stroke="#70e880" stroke-width=".8" opacity=".5"/>
      <circle cx="23" cy="16" r="1.8" fill="#70e880" opacity=".9"/>
      <circle cx="27" cy="16" r="1.8" fill="#70e880" opacity=".9"/>
      <rect x="9" y="22" width="6" height="8" fill="none" stroke="#70e880" stroke-width="1" rx="2" opacity=".7"/>
      <rect x="35" y="22" width="6" height="8" fill="none" stroke="#70e880" stroke-width="1" rx="2" opacity=".7"/>`,
    score: (f) => {
      let s = 0;
      const yr = parseInt(f.year);
      if (yr && (2026 - yr) >= 10) s += 25;
      if (f.revenue && ["1,000万〜3,000万円","3,000万〜1億円"].includes(f.revenue)) s += 15;
      if (f.employees && ["6〜20人","21〜50人"].includes(f.employees)) s += 15;
      if (f.debt && f.debt === "なし") s += 20;
      if (f.loss_carry && f.loss_carry === "なし") s += 10;
      return s;
    }
  }
};

function diagnoseType(formData) {
  const scores = Object.values(COMPANY_TYPES).map(t => ({ id: t.id, score: t.score(formData) }));
  scores.sort((a, b) => b.score - a.score);
  // Default to unicorn if nothing matched
  const winner = scores[0].score > 0 ? scores[0].id : "unicorn";
  return COMPANY_TYPES[winner];
}

/* ── Holo Badge (reusable) ── */
function HoloBadge({ type, size = "md", onMouseMove, onMouseLeave, style }) {
  const ref = React.useRef(null);
  const rafRef = React.useRef(null);
  const sz = size === "lg" ? { card: [220, 290], icon: [90, 90], vb: "0 0 50 50", nameSize: 17, jpSize: 11, tagSize: 10, divW: 50 }
           : size === "sm" ? { card: [130, 170], icon: [56, 56], vb: "0 0 50 50", nameSize: 11, jpSize: 9, tagSize: 8, divW: 32 }
           : { card: [170, 230], icon: [72, 72], vb: "0 0 50 50", nameSize: 14, jpSize: 10, tagSize: 9, divW: 40 };

  const handleMove = (e) => {
    if (!ref.current) return;
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const rect = ref.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);
      if (ref.current) {
        ref.current.style.transform = `rotateX(${-dy * 16}deg) rotateY(${dx * 16}deg) scale(1.04)`;
        const mx = ((e.clientX - rect.left) / rect.width * 100).toFixed(1);
        const my = ((e.clientY - rect.top) / rect.height * 100).toFixed(1);
        const glare = ref.current.querySelector(".hb-glare");
        if (glare) glare.style.background = `radial-gradient(circle at ${mx}% ${my}%, rgba(255,255,255,.18) 0%, rgba(255,255,255,.04) 40%, transparent 70%)`;
        const foil = ref.current.querySelector(".hb-foil");
        if (foil) foil.style.opacity = "1";
      }
    });
    if (onMouseMove) onMouseMove(e);
  };
  const handleLeave = () => {
    if (ref.current) {
      ref.current.style.transform = "";
      const glare = ref.current.querySelector(".hb-glare");
      if (glare) glare.style.background = "";
      const foil = ref.current.querySelector(".hb-foil");
      if (foil) foil.style.opacity = "0";
    }
    if (onMouseLeave) onMouseLeave();
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{
        width: sz.card[0], height: sz.card[1],
        borderRadius: 18,
        background: type.bgGrad,
        border: `1px solid ${type.color}30`,
        position: "relative",
        overflow: "hidden",
        transformStyle: "preserve-3d",
        transition: "transform .08s linear, border-color .3s, box-shadow .3s",
        cursor: "default",
        boxShadow: `0 20px 50px rgba(0,0,0,.5), 0 0 0 0 ${type.colorGlow}`,
        ...style
      }}
    >
      {/* Foil layer */}
      <div className="hb-foil" style={{
        position: "absolute", inset: 0, borderRadius: 18, opacity: 0,
        transition: "opacity .3s", mixBlendMode: "screen", pointerEvents: "none",
        background: type.foilGrad, backgroundSize: "300% 300%",
        animation: "hbFoil 5s ease infinite"
      }}/>
      {/* Glare */}
      <div className="hb-glare" style={{ position:"absolute",inset:0,borderRadius:18,pointerEvents:"none",transition:"background .08s" }}/>
      {/* Glow bottom */}
      <div style={{ position:"absolute",bottom:-20,left:"50%",transform:"translateX(-50%)",width:sz.card[0]*0.7,height:40,borderRadius:"50%",background:type.color,filter:"blur(20px)",opacity:.3,pointerEvents:"none" }}/>
      {/* Content */}
      <div style={{ position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:0,padding:"28px 20px 24px",zIndex:2 }}>
        {/* Icon with parallax layers */}
        <div style={{ width:sz.icon[0],height:sz.icon[1],position:"relative",marginBottom:18 }}>
          {[0.3,0.6,1].map((op,i) => (
            <div key={i} style={{ position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",transform:`translateZ(${i*4}px)` }}>
              <svg width={sz.icon[0]*(.85+i*.08)} height={sz.icon[1]*(.85+i*.08)} viewBox={sz.vb} opacity={op} style={{position:"absolute"}}>
                <g dangerouslySetInnerHTML={{__html: type.svgPath}}/>
              </svg>
            </div>
          ))}
          {/* Ring */}
          <div style={{ position:"absolute",inset:-4,borderRadius:"50%",border:`1px solid ${type.color}`,opacity:.3,pointerEvents:"none" }}/>
          <div style={{ position:"absolute",inset:-10,borderRadius:"50%",border:`1px solid ${type.color}`,opacity:.12,pointerEvents:"none" }}/>
        </div>
        <div style={{ fontFamily:hd,fontSize:sz.nameSize,fontWeight:600,letterSpacing:1.5,color:type.color,textShadow:`0 0 20px ${type.color}`,marginBottom:4 }}>{type.name}</div>
        <div style={{ fontSize:sz.jpSize,letterSpacing:3,color:type.color,opacity:.55,marginBottom:16 }}>{type.jp}</div>
        <div style={{ width:sz.divW,height:1,background:type.color,opacity:.3,marginBottom:12 }}/>
        <div style={{ fontSize:sz.tagSize,padding:"3px 12px",borderRadius:20,border:`1px solid ${type.color}60`,color:type.color,letterSpacing:1.5,opacity:.7,fontFamily:hd }}>{type.tag}</div>
      </div>
    </div>
  );
}

/* Inject keyframe for foil animation */
(function injectHoloStyles() {
  if (typeof document === "undefined") return;
  if (document.getElementById("hb-styles")) return;
  const s = document.createElement("style");
  s.id = "hb-styles";
  s.textContent = `@keyframes hbFoil{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}`;
  document.head.appendChild(s);
})();

/* ── Archetype Result Screen ── */
function ArchetypeResult({ type, onStart }) {
  const [entered, setEntered] = React.useState(false);
  React.useEffect(() => { setTimeout(() => setEntered(true), 80); }, []);

  return (
    <div style={{ width:"100vw",height:"100vh",background:C.bg,fontFamily:bd,display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",position:"relative" }}>
      <link href={FONT} rel="stylesheet"/>
      {/* BG glow */}
      <div style={{ position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:600,height:600,borderRadius:"50%",background:`radial-gradient(circle, ${type.color}08 0%, transparent 70%)`,pointerEvents:"none" }}/>
      {/* Content */}
      <div style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:0,opacity:entered?1:0,transform:entered?"translateY(0)":"translateY(30px)",transition:"all .8s cubic-bezier(.16,1,.3,1)",textAlign:"center",maxWidth:640,padding:"0 32px" }}>
        {/* Label */}
        <div style={{ fontFamily:hd,fontSize:10,letterSpacing:5,color:`${type.color}80`,marginBottom:20,textTransform:"uppercase" }}>Company Archetype</div>
        {/* Badge */}
        <div style={{ perspective:900,marginBottom:40 }}>
          <HoloBadge type={type} size="lg"/>
        </div>
        {/* Catchphrase */}
        <div style={{ fontFamily:hd,fontSize:22,fontWeight:300,color:"#E0DAFF",letterSpacing:"-.01em",marginBottom:16,lineHeight:1.4,textShadow:`0 0 30px ${type.color}40` }}>
          {type.catchphrase}
        </div>
        {/* Description */}
        <div style={{ fontSize:13,color:"rgba(255,255,255,.5)",lineHeight:1.8,marginBottom:32,maxWidth:460 }}>
          {type.desc}
        </div>
        {/* Priority pills */}
        <div style={{ display:"flex",gap:8,flexWrap:"wrap",justifyContent:"center",marginBottom:40 }}>
          {type.priority.map((p,i) => (
            <div key={i} style={{ fontSize:10,padding:"5px 14px",borderRadius:20,background:`${type.color}12`,border:`1px solid ${type.color}30`,color:type.color,letterSpacing:1,opacity:entered?1:0,transform:entered?"translateY(0)":"translateY(10px)",transition:`all .6s ${.2+i*.1}s cubic-bezier(.16,1,.3,1)` }}>
              {p}
            </div>
          ))}
        </div>
        {/* Warning */}
        <div style={{ fontSize:11,color:"rgba(255,255,255,.3)",marginBottom:40,maxWidth:400,lineHeight:1.7,borderLeft:`2px solid ${type.color}30`,paddingLeft:12,textAlign:"left" }}>
          ⚠ {type.warning}
        </div>
        {/* CTA */}
        <Mag onClick={onStart} s={{
          padding:"16px 56px",borderRadius:100,
          border:`1.5px solid ${type.color}60`,
          background:`${type.color}08`,
          color:type.color,fontSize:13,fontWeight:700,cursor:"pointer",
          fontFamily:bd,letterSpacing:".08em",
          boxShadow:`0 0 24px ${type.colorGlow}, 0 0 60px ${type.color}20`,
          textShadow:`0 0 12px ${type.color}`,
        }}>はじめる →</Mag>
      </div>
    </div>
  );
}

function Intake({ onDone }) {
  const [step, setStep] = useState(0);
  const [vis, setVis] = useState(true);
  const [tk, setTk] = useState(0);
  const [formData, setFormData] = useState({});
  const [cur, setCur] = useState("");
  const [files, setFiles] = useState({});
  const [diagnosedType, setDiagnosedType] = useState(null);

  const QS = [
    // Phase 1: Basic
    { k: "company", q: "会社名を\n教えてください", ph: "株式会社〇〇", t: "text", phase: "BASIC INFO" },
    { k: "rep", q: "代表者のお名前は？", ph: "山田 太郎", t: "text", phase: "BASIC INFO" },
    { k: "type", q: "事業形態を\n選んでください", t: "sel", opts: ["株式会社", "合同会社", "個人事業主", "フリーランス"], phase: "BASIC INFO" },
    { k: "industry", q: "業種を\n教えてください", t: "sel", opts: ["IT・通信", "飲食・フード", "建設・不動産", "医療・福祉", "小売・EC", "製造", "コンサル・士業", "その他"], phase: "BASIC INFO" },
    { k: "sub_industry", q: "具体的な業態を\n選んでください", t: "sel", dynamic: true, phase: "BASIC INFO" },
    { k: "year", q: "設立年は？", ph: "2020", t: "text", phase: "BASIC INFO" },
    { k: "pref", q: "事業の拠点は\nどこですか？", t: "map", phase: "BASIC INFO" },
    // Phase 2: Business
    { k: "biz_desc", q: "具体的な事業内容を\n教えてください", ph: "SaaS型勤怠管理システムの開発・販売…", t: "area", phase: "BUSINESS" },
    { k: "revenue_model", q: "主な収益モデルは？", t: "multi", opts: ["サブスクリプション", "受託開発", "物販・EC", "広告収入", "手数料・仲介", "コンサル・顧問料", "その他"], phase: "BUSINESS" },
    { k: "clients", q: "主要な取引先の\n業種・規模感は？", ph: "大手通信会社、中小IT企業など…", t: "text", phase: "BUSINESS" },
    { k: "employees", q: "従業員数は？", t: "sel", opts: ["1人（自分だけ）", "2〜5人", "6〜20人", "21〜50人", "51〜100人", "100人以上"], phase: "BUSINESS" },
    { k: "overseas", q: "海外取引は\nありますか？", t: "sel", opts: ["なし", "輸出あり", "輸入あり", "両方あり"], phase: "BUSINESS" },
    // Phase 3: Financials
    { k: "revenue", q: "年間売上の\n規模は？", t: "sel", opts: ["〜300万円", "300万〜1,000万円", "1,000万〜3,000万円", "3,000万〜1億円", "1億〜5億円", "5億円以上"], phase: "FINANCIALS" },
    { k: "fiscal", q: "決算月は\n何月ですか？", t: "sel", opts: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"], phase: "FINANCIALS" },
    { k: "invoice", q: "インボイス制度への\n登録状況は？", t: "sel", opts: ["登録済み", "未登録（検討中）", "未登録（予定なし）", "わからない"], phase: "FINANCIALS" },
    // Phase 4: Tax
    { k: "software", q: "お使いの\n会計ソフトは？", t: "sel", opts: ["freee", "マネーフォワード", "弥生会計", "勘定奉行", "TKC", "Excel管理", "その他", "使っていない"], phase: "TAX STATUS" },
    { k: "soft_file", q: "会計データが\nあればアップロード", t: "file", phase: "TAX STATUS" },
    { k: "filing", q: "申告の種類を\n選んでください", t: "multi", opts: ["青色申告", "白色申告", "消費税課税", "消費税免税", "わからない"], phase: "TAX STATUS" },
    { k: "advisor", q: "顧問税理士は\nいますか？", t: "sel", opts: ["いる（継続予定）", "いる（乗り換え検討）", "いない"], phase: "TAX STATUS" },
    { k: "officer_pay", q: "役員報酬の\n月額は？", t: "sel", opts: ["設定なし", "〜30万円", "30万〜50万円", "50万〜80万円", "80万〜100万円", "100万円以上", "答えたくない"], phase: "TAX STATUS" },
    { k: "debt", q: "借入金は\nありますか？", t: "sel", opts: ["なし", "〜500万円", "500万〜2,000万円", "2,000万〜5,000万円", "5,000万円以上", "わからない"], phase: "TAX STATUS" },
    { k: "assets", q: "主な固定資産は\nありますか？", t: "multi", opts: ["不動産（自社ビル・土地）", "車両", "機械・設備", "ソフトウェア・IT資産", "特になし"], phase: "TAX STATUS" },
    { k: "family", q: "家族従業員は\nいますか？", t: "sel", opts: ["いない", "配偶者が従事", "親族が従事", "複数の家族が従事"], phase: "TAX STATUS" },
    { k: "loss_carry", q: "赤字の繰越は\nありますか？", t: "sel", opts: ["なし", "あり（金額把握済み）", "あり（金額不明）", "わからない"], phase: "TAX STATUS" },
    { k: "audit", q: "過去に税務調査を\n受けたことは？", t: "sel", opts: ["なし", "あり（指摘なし）", "あり（指摘あり）", "わからない"], phase: "TAX STATUS" },
    { k: "special", q: "今期の特別な\n出来事はありますか？", t: "multi", opts: ["大きな設備投資", "事務所の移転", "M&A・事業譲渡", "新規事業の開始", "従業員の大幅増減", "特になし"], phase: "TAX STATUS" },
    // Phase 5: Docs
    { k: "file_tax", q: "直近の決算書 /\n確定申告書をアップ", t: "file", phase: "DOCUMENTS" },
    { k: "file_bank", q: "通帳 / 取引明細を\nアップロード", t: "file", phase: "DOCUMENTS" },
    { k: "file_other", q: "その他の参考資料\nがあればどうぞ", t: "file", phase: "DOCUMENTS" },
    // Phase 6: Consultation
    { k: "concern", q: "一番困っていること\n相談したいことは？", ph: "節税対策、法人成り、記帳代行、資金調達…", t: "area", phase: "CONSULTATION" },
  ];

  const subIndustry = {
    "IT・通信": ["SaaS・クラウド", "受託開発", "SES・人材派遣", "Web制作・デザイン", "アプリ開発", "インフラ・セキュリティ", "AI・データ分析", "通信キャリア", "その他IT"],
    "飲食・フード": ["レストラン・カフェ", "居酒屋・バー", "テイクアウト・デリバリー", "食品製造・加工", "ケータリング", "フードトラック", "菓子・ベーカリー", "その他飲食"],
    "建設・不動産": ["総合建設（ゼネコン）", "内装・リフォーム", "電気工事", "管工事・空調", "塗装・防水", "解体工事", "不動産売買", "不動産賃貸・管理", "土木工事", "その他建設"],
    "医療・福祉": ["病院・クリニック", "歯科医院", "薬局・ドラッグストア", "介護施設", "訪問看護・介護", "整骨院・鍼灸院", "美容医療", "その他医療"],
    "小売・EC": ["実店舗小売", "ECサイト運営", "Amazon・楽天出店", "卸売", "輸入販売", "サブスクボックス", "ドロップシッピング", "その他小売"],
    "製造": ["機械・部品製造", "食品製造", "化学・素材", "繊維・アパレル", "電子機器", "印刷・出版", "金属加工", "その他製造"],
    "コンサル・士業": ["経営コンサルティング", "ITコンサルティング", "人事・採用コンサル", "弁護士", "司法書士", "行政書士", "社労士", "デザイン・クリエイティブ", "その他士業"],
    "その他": ["農業・林業・漁業", "運輸・物流", "教育・スクール", "エンタメ・メディア", "旅行・観光", "美容・サロン", "フィットネス", "その他"],
  };

  const getOpts = (q) => {
    if (q.dynamic) return subIndustry[formData.industry] || ["その他"];
    return q.opts;
  };

  const q = QS[step];
  const total = QS.length;
  const pct = ((step + 1) / total) * 100;

  const getVal = () => {
    if (q.t === "file") return files[q.k] ? "uploaded" : "";
    if (q.t === "multi") return (formData[q.k] || []).length > 0 ? "ok" : "";
    if (q.t === "map") return formData[q.k] || "";
    return cur.trim();
  };
  const ok = q.t === "file" ? true : getVal().length > 0;

  const goNext = () => {
    // Save current
    if (q.t === "text" || q.t === "area") { if (cur.trim()) setFormData(prev => ({ ...prev, [q.k]: cur.trim() })); }
    else if (q.t === "sel") { /* already saved on click */ }

    if (step >= total - 1) {
      const merged = { ...formData, files };
      const t = diagnoseType(merged);
      setDiagnosedType(t);
      return;
    }
    setVis(false);
    setTimeout(() => {
      setCur("");
      setStep(s => s + 1);
      setTk(k => k + 1);
      setTimeout(() => setVis(true), 50);
    }, 350);
  };

  const goBack = () => {
    if (step === 0) return;
    setVis(false);
    setTimeout(() => {
      setStep(s => s - 1);
      setTk(k => k + 1);
      const prev = QS[step - 1];
      if (prev.t === "text" || prev.t === "area") setCur(formData[prev.k] || "");
      else setCur("");
      setTimeout(() => setVis(true), 50);
    }, 350);
  };

  const selectOpt = (v) => {
    setFormData(prev => ({ ...prev, [q.k]: v }));
    setCur(v);
  };

  const toggleMulti = (v) => {
    const arr = formData[q.k] || [];
    setFormData(prev => ({ ...prev, [q.k]: arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v] }));
  };

  if (diagnosedType) {
    return <ArchetypeResult type={diagnosedType} onStart={() => onDone({ ...formData, files, companyType: diagnosedType.id })} />;
  }

  return (
    <div style={{ width: "100vw", height: "100vh", background: C.bg, fontFamily: bd, overflow: "auto" }}>
      <link href={FONT} rel="stylesheet" />
      <WireCanvas>
        <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
          {/* Top */}
          <div style={{ padding: "18px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ fontFamily: hd, fontSize: 28, color: "#A89BFF", textShadow: "0 0 12px rgba(168,155,255,.4)" }}>Z.</div>
              <span style={{ fontSize: 12, color: "rgba(168,155,255,.5)", fontWeight: 700, letterSpacing: ".22em", textTransform: "uppercase", textShadow: "0 0 8px rgba(139,123,244,.3)" }}>Zeirishi</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 10, color: "#A89BFF", fontWeight: 700, letterSpacing: ".1em", textShadow: "0 0 8px rgba(168,155,255,.3)" }}>{q.phase}</span>
              <span style={{ color: C.border, margin: "0 4px" }}>|</span>
              <span style={{ fontFamily: hd, fontSize: 28, fontWeight: 300, color: "#C4B8FF", letterSpacing: "-.02em", textShadow: "0 0 12px rgba(168,155,255,.3)" }}>{String(step + 1).padStart(2, "0")}</span>
              <span style={{ color: C.border }}>/</span>
              <span style={{ fontSize: 13, color: C.textMut }}>{String(total).padStart(2, "0")}</span>
            </div>
          </div>

          {/* Progress */}
          <div style={{ height: 3, background: `${C.border}60`, flexShrink: 0 }}>
            <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg, #8B7BF4, #A89BFF)", transition: "width .6s cubic-bezier(.16,1,.3,1)", boxShadow: "0 0 8px rgba(139,123,244,.5), 0 0 20px rgba(139,123,244,.25)" }} />
          </div>

          {/* Giant watermark */}
          <div style={{ position: "absolute", right: -40, top: "50%", transform: "translateY(-50%)", fontFamily: hd, fontSize: "min(26vw, 340px)", color: "#8B7BF4", opacity: .04, lineHeight: .85, pointerEvents: "none", letterSpacing: "-.05em", whiteSpace: "nowrap", zIndex: 0 }}>
            {q.phase.split(" ")[0]}<br/>{q.phase.split(" ")[1] || ""}
          </div>

          {/* Content */}
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 40px",
            opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(35px)", transition: "all .45s cubic-bezier(.16,1,.3,1)" }}>
            <div style={{ maxWidth: 620, width: "100%" }}>
              {/* Question */}
              <div style={{ fontFamily: hd, fontSize: "min(5.5vw, 42px)", color: "#E0DAFF", letterSpacing: "-.02em", fontWeight: 300, marginBottom: 48, lineHeight: 1.25, whiteSpace: "pre-wrap", textShadow: "0 0 20px rgba(168,155,255,.6), 0 0 50px rgba(139,123,244,.3), 0 0 90px rgba(139,123,244,.15)" }}>
                <KL key={tk} text={q.q} delay={80} />
              </div>

              {/* Input */}
              {q.t === "text" && (
                <input value={cur} onChange={e => setCur(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && ok) goNext(); }} placeholder={q.ph} autoFocus
                  style={{ width: "100%", padding: "18px 0", border: "none", borderBottom: "1px solid rgba(139,123,244,.25)", background: "transparent", fontFamily: bd, fontSize: 20, color: "#E0DAFF", outline: "none", boxSizing: "border-box", caretColor: "#A89BFF", textShadow: "0 0 10px rgba(168,155,255,.3)" }} />
              )}

              {q.t === "area" && (
                <textarea value={cur} onChange={e => setCur(e.target.value)} placeholder={q.ph} rows={3} autoFocus
                  style={{ width: "100%", padding: "16px", border: "1px solid rgba(139,123,244,.2)", borderRadius: 16, background: "rgba(139,123,244,.03)", backdropFilter: "blur(8px)", fontFamily: bd, fontSize: 16, color: "#E0DAFF", outline: "none", boxSizing: "border-box", resize: "vertical", caretColor: "#A89BFF", textShadow: "0 0 8px rgba(168,155,255,.25)" }} />
              )}

              {q.t === "sel" && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                  {getOpts(q).map((o, i) => {
                    const sel = formData[q.k] === o;
                    return (
                      <button key={o} type="button" onClick={() => selectOpt(o)}
                        style={{ padding: "14px 28px", border: sel ? "1.5px solid rgba(139,123,244,.6)" : "1.5px solid rgba(255,255,255,.08)", borderRadius: 100, background: sel ? "rgba(139,123,244,.1)" : "rgba(255,255,255,.02)", color: sel ? "#C4B8FF" : C.textSec, fontSize: 14, fontWeight: 600, fontFamily: bd, cursor: "pointer", transition: "all .25s", opacity: vis ? 1 : 0, transitionDelay: `${i * 30}ms`,
                          boxShadow: sel ? "0 0 16px rgba(139,123,244,.4), 0 0 40px rgba(139,123,244,.15), inset 0 0 12px rgba(139,123,244,.08)" : "0 0 0 transparent",
                          textShadow: sel ? "0 0 14px rgba(168,155,255,.6)" : "0 0 6px rgba(168,155,255,.15)",
                        }}>
                        {o}
                      </button>
                    );
                  })}
                </div>
              )}

              {q.t === "multi" && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                  {q.opts.map((o, i) => {
                    const sel = (formData[q.k] || []).includes(o);
                    return (
                      <button key={o} type="button" onClick={() => toggleMulti(o)}
                        style={{ padding: "14px 28px", border: sel ? "1.5px solid rgba(139,123,244,.6)" : "1.5px solid rgba(255,255,255,.08)", borderRadius: 100, background: sel ? "rgba(139,123,244,.1)" : "rgba(255,255,255,.02)", color: sel ? "#C4B8FF" : C.textSec, fontSize: 14, fontWeight: 600, fontFamily: bd, cursor: "pointer", transition: "all .25s", opacity: vis ? 1 : 0, transitionDelay: `${i * 30}ms`,
                          boxShadow: sel ? "0 0 16px rgba(139,123,244,.4), 0 0 40px rgba(139,123,244,.15), inset 0 0 12px rgba(139,123,244,.08)" : "0 0 0 transparent",
                          textShadow: sel ? "0 0 14px rgba(168,155,255,.6)" : "0 0 6px rgba(168,155,255,.15)",
                        }}>
                        {o}
                      </button>
                    );
                  })}
                </div>
              )}

              {q.t === "map" && (
                <JapanMap selected={formData[q.k] || ""} onSelect={(v) => { setFormData(prev => ({ ...prev, [q.k]: v })); setCur(v); }} />
              )}

              {q.t === "file" && (
                <div
                  onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = "rgba(139,123,244,.5)"; e.currentTarget.style.background = "rgba(139,123,244,.06)"; }}
                  onDragLeave={e => { e.currentTarget.style.borderColor = files[q.k] ? "rgba(123,224,160,.3)" : "rgba(139,123,244,.15)"; e.currentTarget.style.background = files[q.k] ? "rgba(123,224,160,.04)" : "transparent"; }}
                  onDrop={e => { e.preventDefault(); e.currentTarget.style.borderColor = "rgba(123,224,160,.3)"; e.currentTarget.style.background = "rgba(123,224,160,.04)"; const f = e.dataTransfer.files; if (f.length) setFiles(prev => ({ ...prev, [q.k]: f[0].name })); }}
                  style={{ border: `2px dashed ${files[q.k] ? "rgba(123,224,160,.3)" : "rgba(139,123,244,.15)"}`, borderRadius: 20, padding: "40px", textAlign: "center", background: files[q.k] ? "rgba(123,224,160,.04)" : "transparent", transition: "all .3s" }}>
                  {files[q.k] ? (
                    <div>
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#7BE0A0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block", margin: "0 auto 8px", filter: "drop-shadow(0 0 8px rgba(123,224,160,.4))" }}><path d="M20 6L9 17l-5-5"/></svg>
                      <div style={{ fontSize: 15, fontWeight: 700, color: "#7BE0A0", textShadow: "0 0 10px rgba(123,224,160,.4)" }}>{files[q.k]}</div>
                      <button type="button" onClick={() => setFiles(prev => { const n = { ...prev }; delete n[q.k]; return n; })} style={{ border: "none", background: "transparent", color: "rgba(196,184,255,.4)", fontSize: 12, cursor: "pointer", marginTop: 10, fontFamily: bd, fontWeight: 600, textShadow: "0 0 6px rgba(139,123,244,.2)" }}>削除</button>
                    </div>
                  ) : (
                    <div>
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(168,155,255,.4)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block", margin: "0 auto 10px", filter: "drop-shadow(0 0 12px rgba(139,123,244,.3))" }}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
                      <div style={{ fontSize: 15, color: "rgba(196,184,255,.6)", fontWeight: 700, textShadow: "0 0 10px rgba(168,155,255,.3)" }}>ドラッグ＆ドロップ</div>
                      <div style={{ fontSize: 12, color: "rgba(168,155,255,.3)", margin: "8px 0 16px" }}>または</div>
                      <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                        <button type="button" onClick={() => setFiles(prev => ({ ...prev, [q.k]: "document.pdf" }))}
                          style={{ padding: "10px 24px", border: "1.5px solid rgba(139,123,244,.25)", borderRadius: 100, background: "transparent", fontSize: 13, fontWeight: 700, color: "rgba(196,184,255,.6)", cursor: "pointer", fontFamily: bd, display: "flex", alignItems: "center", gap: 8 }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/></svg>
                          ファイル選択</button>
                        <button type="button" onClick={() => setFiles(prev => ({ ...prev, [q.k]: "photo.jpg" }))}
                          style={{ padding: "10px 24px", border: "1.5px solid rgba(139,123,244,.4)", borderRadius: 100, background: "rgba(139,123,244,.08)", fontSize: 13, fontWeight: 600, color: "#C4B8FF", cursor: "pointer", fontFamily: bd, display: "flex", alignItems: "center", gap: 8, boxShadow: "0 0 12px rgba(139,123,244,.2)" }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#A89BFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>
                          Scan</button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Nav */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 48 }}>
                {step > 0 ? (
                  <Mag onClick={goBack} s={{ padding: "14px 32px", border: "1.5px solid rgba(255,255,255,.08)", borderRadius: 100, background: "rgba(255,255,255,.02)", color: "rgba(196,184,255,.5)", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: bd, letterSpacing: ".04em", textShadow: "0 0 6px rgba(168,155,255,.2)" }}>← 戻る</Mag>
                ) : <div />}
                <Mag onClick={() => { if (ok || q.t === "file") goNext(); }} s={{
                  padding: "14px 40px", borderRadius: 100,
                  border: (ok || q.t === "file") ? "1.5px solid rgba(139,123,244,.5)" : "1.5px solid rgba(255,255,255,.06)",
                  background: (ok || q.t === "file") ? "rgba(139,123,244,.08)" : "transparent",
                  color: (ok || q.t === "file") ? "#C4B8FF" : C.textMut,
                  fontSize: 13, fontWeight: 700, cursor: (ok || q.t === "file") ? "pointer" : "default",
                  fontFamily: bd, letterSpacing: ".06em",
                  boxShadow: (ok || q.t === "file") ? "0 0 16px rgba(139,123,244,.35), 0 0 40px rgba(139,123,244,.12)" : "none",
                  textShadow: (ok || q.t === "file") ? "0 0 10px rgba(168,155,255,.4)" : "none",
                }}>
                  {q.t === "file" && !files[q.k] ? "スキップ →" : step < total - 1 ? "次へ →" : "完了 →"}
                </Mag>
              </div>
            </div>
          </div>
        </div>
      </WireCanvas>
    </div>
  );
}

/* ════════════════════════════════ SIDEBAR ════════════════════════════════ */

export { Intake, HoloBadge, ArchetypeResult, COMPANY_TYPES };
