import React, { useState, useEffect, useRef, useCallback } from "react";
import * as THREE from "three";

/* ════════════════════════════════════════════════════
   G: WAVE AREA — ベジェ曲線 + ホバースライス + オーバーレイ
   ════════════════════════════════════════════════════ */
const CHART_DATA_6 = [
  { label:"9月", revenue:12.8, expense:7.2, profit:5.6, clients:42 },
  { label:"10月", revenue:13.1, expense:7.8, profit:5.3, clients:44 },
  { label:"11月", revenue:12.5, expense:7.0, profit:5.5, clients:41 },
  { label:"12月", revenue:14.2, expense:8.1, profit:6.1, clients:48 },
  { label:"1月", revenue:13.8, expense:7.5, profit:6.3, clients:46 },
  { label:"2月", revenue:15.4, expense:7.1, profit:8.3, clients:51 },
];
const CHART_DATA_12 = [
  {label:"3月",revenue:14.2,profit:1.8},{label:"4月",revenue:13.8,profit:1.5},{label:"5月",revenue:15.1,profit:2.0},{label:"6月",revenue:14.5,profit:1.7},
  {label:"7月",revenue:16.2,profit:2.3},{label:"8月",revenue:13.9,profit:1.4},{label:"9月",revenue:15.8,profit:2.1},{label:"10月",revenue:16.5,profit:2.4},
  {label:"11月",revenue:17.2,profit:2.6},{label:"12月",revenue:18.0,profit:2.8},{label:"1月",revenue:16.8,profit:2.2},{label:"2月",revenue:15.4,profit:2.1},
];
const EXPENSE_DATA = [
  { label:"人件費", value:4.2, color:"rgba(168,155,255,.8)" },
  { label:"外注費", value:1.1, color:"rgba(139,123,244,.55)" },
  { label:"地代家賃", value:0.6, color:"rgba(120,108,220,.4)" },
  { label:"通信費", value:0.38, color:"rgba(100,90,200,.35)" },
  { label:"交際費", value:0.28, color:"rgba(80,70,180,.3)" },
  { label:"その他", value:0.93, color:"rgba(60,55,160,.25)" },
];

function ChartWaveArea() {
  const [animated, setAnimated] = useState(false);
  const [hover, setHover] = useState(null);
  const [clicked, setClicked] = useState(null);
  const containerRef = useRef();
  useEffect(() => { const t = setTimeout(() => setAnimated(true), 150); return () => clearTimeout(t); }, []);

  const w = 600, h = 200, py = 20;
  const max = 20;
  const data = CHART_DATA_6;

  const makeSpline = (key) => {
    const pts = data.map((d,i) => ({
      x: (i / (data.length-1)) * w,
      y: py + (1 - d[key] / max) * (h - py*2),
    }));
    let path = "M" + pts[0].x + "," + pts[0].y;
    for (let i = 1; i < pts.length; i++) {
      const cpx1 = pts[i-1].x + (pts[i].x - pts[i-1].x) * 0.4;
      const cpx2 = pts[i].x - (pts[i].x - pts[i-1].x) * 0.4;
      path += " C" + cpx1 + "," + pts[i-1].y + " " + cpx2 + "," + pts[i].y + " " + pts[i].x + "," + pts[i].y;
    }
    return { path, pts };
  };
  const revenue = makeSpline("revenue");
  const profit = makeSpline("profit");
  const revArea = revenue.path + " L" + w + "," + h + " L0," + h + " Z";
  const profArea = profit.path + " L" + w + "," + h + " L0," + h + " Z";

  const handleMove = useCallback((e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const idx = Math.round(x * (data.length - 1));
    if (idx >= 0 && idx < data.length) setHover(idx);
  }, []);

  const active = clicked !== null ? clicked : hover;

  return (
    <div style={{ position:"relative" }}>
      <div ref={containerRef} style={{ padding:"0 4px" }}
        onMouseMove={handleMove} onMouseLeave={() => { if (clicked===null) setHover(null); }}
        onClick={() => setClicked(clicked===hover ? null : hover)}
      >
        <svg width="100%" viewBox={"0 0 " + w + " " + (h+30)} style={{ display:"block", overflow:"visible" }}>
          <defs>
            <linearGradient id="waveRevGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(139,123,244,.35)" /><stop offset="100%" stopColor="rgba(139,123,244,.01)" />
            </linearGradient>
            <linearGradient id="waveProfGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(123,224,160,.25)" /><stop offset="100%" stopColor="rgba(123,224,160,.01)" />
            </linearGradient>
            <filter id="waveGlow"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            <filter id="waveDotGlow"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          </defs>
          <path d={revArea} fill="url(#waveRevGrad)" opacity={animated?1:0} style={{ transition:"opacity .8s" }} />
          <path d={profArea} fill="url(#waveProfGrad)" opacity={animated?1:0} style={{ transition:"opacity .8s .2s" }} />
          <path d={revenue.path} fill="none" stroke="rgba(168,155,255,.8)" strokeWidth="2.5" strokeLinecap="round" filter="url(#waveGlow)" opacity={animated?1:0} style={{ transition:"opacity .6s .3s" }} />
          <path d={profit.path} fill="none" stroke="rgba(123,224,160,.6)" strokeWidth="2" strokeLinecap="round" filter="url(#waveGlow)" opacity={animated?1:0} style={{ transition:"opacity .6s .5s" }} />
          {active !== null && (() => {
            const rp = revenue.pts[active]; const pp = profit.pts[active];
            return (<g>
              <line x1={rp.x} y1={0} x2={rp.x} y2={h} stroke="rgba(168,155,255,.15)" strokeWidth="1" />
              <rect x={rp.x-1} y={0} width={2} height={h} fill="rgba(168,155,255,.06)" />
              <circle cx={rp.x} cy={rp.y} r="6" fill="#A89BFF" stroke="#0C0C16" strokeWidth="3" filter="url(#waveDotGlow)" />
              <circle cx={pp.x} cy={pp.y} r="5" fill="#7BE0A0" stroke="#0C0C16" strokeWidth="3" filter="url(#waveDotGlow)" />
            </g>);
          })()}
          {data.map((d,i) => (
            <text key={i} x={revenue.pts[i].x} y={h+24} textAnchor="middle" fill={active===i?"#fff":"#C8C8D8"} fontSize="13" fontWeight={active===i?"600":"400"} fontFamily="'Noto Sans JP', sans-serif" style={{ transition:"all .2s" }}>{d.label}</text>
          ))}
        </svg>
      </div>
      <div style={{ overflow:"hidden", maxHeight:active!==null?140:0, opacity:active!==null?1:0, transition:"all .4s cubic-bezier(.16,1,.3,1)" }}>
        {active !== null && (() => {
          const d = data[active]; const prev = data[active > 0 ? active-1 : 0];
          const change = ((d.revenue - prev.revenue) / prev.revenue * 100).toFixed(1);
          return (
            <div style={{ padding:"14px 16px 18px", background:"linear-gradient(180deg, rgba(139,123,244,.03), transparent)", borderTop:"1px solid rgba(139,123,244,.06)", display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:16 }}>
              {[{ l:"売上", v:"¥"+Math.round(d.revenue*100).toLocaleString()+"万", c:"#fff" }, { l:"経費", v:"¥"+Math.round(d.expense*100).toLocaleString()+"万", c:"rgba(255,255,255,.5)" }, { l:"利益", v:"¥"+Math.round(d.profit*100).toLocaleString()+"万", c:"#7BE0A0" }, { l:"顧客数", v:d.clients+"社", c:"#fff" }].map((item,i) => (
                <div key={i}>
                  <div style={{ fontSize:10, color:"#C8C8D8", fontFamily:"'JetBrains Mono', monospace", letterSpacing:".1em", marginBottom:4 }}>{item.l}</div>
                  <div style={{ fontFamily:"'Outfit', sans-serif", fontSize:22, fontWeight:300, color:item.c, letterSpacing:"-.02em", textShadow:item.c==="#7BE0A0"?"0 0 12px rgba(123,224,160,.25)":item.c==="#fff"?"0 0 12px rgba(255,255,255,.12)":"none" }}>{item.v}</div>
                </div>
              ))}
            </div>
          );
        })()}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════
   H: MORPH RING — ドーナツ + クリックでセグメント拡大
   ════════════════════════════════════════════════════ */
function ChartMorphRing({ data: dataProp, periodLabel }) {
  const [animated, setAnimated] = useState(false);
  const [active, setActive] = useState(null);
  useEffect(() => { setAnimated(false); setActive(null); const t = setTimeout(() => setAnimated(true), 100); return () => clearTimeout(t); }, [dataProp]);

  const expenses = dataProp || EXPENSE_DATA;
  const total = expenses.reduce((s,e) => s+e.value, 0);
  const cx = 100, cy = 100, r = 76, sw = 20;
  let cumAngle = -90;
  const segments = expenses.map((e) => {
    const angle = (e.value / total) * 360;
    const startAngle = cumAngle; cumAngle += angle;
    const endAngle = cumAngle;
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    const x1 = cx + r * Math.cos(startRad); const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);   const y2 = cy + r * Math.sin(endRad);
    const large = angle > 180 ? 1 : 0;
    return { ...e, path: "M"+x1+","+y1+" A"+r+","+r+" 0 "+large+" 1 "+x2+","+y2 };
  });

  return (
    <div style={{ display:"flex", gap:24, alignItems:"center" }}>
      <div style={{ position:"relative", width:200, height:200, flexShrink:0 }}>
        <svg width="200" height="200" viewBox="0 0 200 200">
          <defs><filter id="ringGlw"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(139,123,244,.04)" strokeWidth={sw} />
          {segments.map((seg,i) => (
            <path key={i} d={seg.path} fill="none" stroke={seg.color} strokeWidth={active===i?sw+8:sw}
              strokeLinecap="round" style={{ cursor:"pointer", filter:active===i?"url(#ringGlw)":"none",
                opacity:animated?(active!==null&&active!==i?0.3:1):0, transition:"all .5s cubic-bezier(.16,1,.3,1)",
                transformOrigin:cx+"px "+cy+"px", transform:active===i?"scale(1.06)":"scale(1)" }}
              onClick={() => setActive(active===i?null:i)} />
          ))}
        </svg>
        <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", textAlign:"center" }}>
          {active !== null ? (<>
            <div style={{ fontFamily:"'Outfit', sans-serif", fontSize:24, fontWeight:300, color:"#fff", letterSpacing:"-.02em", textShadow:"0 0 16px rgba(255,255,255,.2)", transition:"all .3s" }}>{"\u00A5"}{Math.round(expenses[active].value*100).toLocaleString()}万</div>
            <div style={{ fontSize:10, color:"#C8C8D8", fontFamily:"'JetBrains Mono', monospace" }}>{expenses[active].label}</div>
          </>) : (<>
            <div style={{ fontFamily:"'Outfit', sans-serif", fontSize:28, fontWeight:300, color:"#fff", letterSpacing:"-.02em", textShadow:"0 0 16px rgba(255,255,255,.2)" }}>{"\u00A5"}{Math.round(total*100).toLocaleString()}万</div>
            <div style={{ fontSize:10, color:"#C8C8D8", fontFamily:"'JetBrains Mono', monospace" }}>{periodLabel || "総経費"}</div>
          </>)}
        </div>
      </div>
      <div style={{ flex:1 }}>
        {expenses.map((e,i) => (
          <div key={i} onClick={() => setActive(active===i?null:i)}
            style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 12px", marginBottom:3,
              borderRadius:12, cursor:"pointer", transition:"all .3s",
              background:active===i?"rgba(139,123,244,.06)":"transparent",
              border:active===i?"1px solid rgba(139,123,244,.15)":"1px solid transparent",
              boxShadow:active===i?"0 0 20px rgba(139,123,244,.08)":"none" }}>
            <div style={{ width:8, height:8, borderRadius:"50%", background:e.color, flexShrink:0,
              boxShadow:active===i?"0 0 10px "+e.color+", 0 0 24px "+e.color:"none", transition:"box-shadow .3s" }} />
            <span style={{ fontSize:12, color:active===i?"#fff":"#E8E8F0", flex:1, fontWeight:active===i?600:400, transition:"all .3s" }}>{e.label}</span>
            <span style={{ fontSize:13, color:active===i?"#fff":"#9999B0", fontFamily:"'Outfit', sans-serif", fontWeight:300,
              textShadow:active===i?"0 0 10px rgba(255,255,255,.2)":"none" }}>{"\u00A5"}{Math.round(e.value*100)}万</span>
            <span style={{ fontSize:11, color:"#B0B0C8", fontFamily:"'JetBrains Mono', monospace", width:36, textAlign:"right" }}>{((e.value/total)*100).toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════
   I: RUNWAY BAR — 12ヶ月横並び + スクラブ + オーバーレイ
   ════════════════════════════════════════════════════ */
function ChartRunwayBar() {
  const [animated, setAnimated] = useState(false);
  const [active, setActive] = useState(null);
  const barRef = useRef();
  useEffect(() => { const t = setTimeout(() => setAnimated(true), 200); return () => clearTimeout(t); }, []);
  const data = CHART_DATA_12;
  const max = Math.max(...data.map(d => d.revenue));

  const handleMove = useCallback((e) => {
    if (!barRef.current) return;
    const rect = barRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const idx = Math.floor(x * data.length);
    if (idx >= 0 && idx < data.length) setActive(idx);
  }, []);

  return (
    <div style={{ position:"relative" }}>
      <div ref={barRef} onMouseMove={handleMove} onMouseLeave={() => setActive(null)}
        style={{ padding:"0 4px", display:"flex", gap:3, alignItems:"flex-end", height:160, cursor:"crosshair" }}>
        {data.map((d,i) => {
          const isActive = active === i;
          const heightPct = (d.revenue / (max * 1.15)) * 100;
          return (
            <div key={i} style={{
              flex:1, borderRadius:"6px 6px 2px 2px",
              height:animated?heightPct+"%":"0%",
              background:isActive?"linear-gradient(180deg, rgba(168,155,255,1) 0%, rgba(139,123,244,.5) 100%)":i===data.length-1?"linear-gradient(180deg, rgba(139,123,244,.7) 0%, rgba(139,123,244,.2) 100%)":"linear-gradient(180deg, rgba(139,123,244,.3) 0%, rgba(139,123,244,.06) 100%)",
              boxShadow:isActive?"0 0 20px rgba(168,155,255,.5), 0 -8px 28px rgba(139,123,244,.2), 0 0 48px rgba(139,123,244,.1)":"0 0 4px rgba(139,123,244,.05)",
              transition:isActive?"all .15s":"all .6s cubic-bezier(.16,1,.3,1) "+(i*40)+"ms",
              transform:isActive?"scaleX(1.6) scaleY(1.04)":"scaleX(1) scaleY(1)",
              transformOrigin:"bottom center", position:"relative", zIndex:isActive?10:1,
            }} />
          );
        })}
      </div>
      <div style={{ display:"flex", padding:"6px 4px 0", gap:3 }}>
        {data.map((d,i) => (
          <div key={i} style={{ flex:1, textAlign:"center", fontSize:11,
            color:active===i?"#fff":i===data.length-1?"rgba(255,255,255,.5)":"#C8C8D8",
            fontWeight:active===i?700:400, transition:"all .15s" }}>{d.label.replace("月","")}</div>
        ))}
      </div>
      <div style={{ overflow:"hidden", maxHeight:active!==null?110:0, opacity:active!==null?1:0, transition:"all .25s cubic-bezier(.16,1,.3,1)" }}>
        {active !== null && (() => {
          const d = data[active]; const prev = data[active > 0 ? active - 1 : 0];
          const change = ((d.revenue - prev.revenue) / prev.revenue * 100).toFixed(1);
          return (
            <div style={{ padding:"12px 4px 6px", borderTop:"1px solid rgba(139,123,244,.06)", display:"flex", alignItems:"center", gap:24, background:"linear-gradient(180deg, rgba(139,123,244,.03), transparent)" }}>
              <div style={{ fontFamily:"'Outfit', sans-serif", fontSize:32, fontWeight:300, color:"#fff", letterSpacing:"-.03em", textShadow:"0 0 18px rgba(255,255,255,.25), 0 0 44px rgba(255,255,255,.06)", minWidth:110 }}>{"00A5"}{Math.round(d.revenue*100).toLocaleString()}万</div>
              <div><div style={{ fontSize:10, color:"#C8C8D8", fontFamily:"'JetBrains Mono', monospace", marginBottom:2 }}>利益</div><div style={{ fontFamily:"'Outfit', sans-serif", fontSize:18, fontWeight:300, color:"#7BE0A0", textShadow:"0 0 10px rgba(123,224,160,.2)" }}>{"00A5"}{Math.round(d.profit*100).toLocaleString()}万</div></div>
              <div><div style={{ fontSize:10, color:"#C8C8D8", fontFamily:"'JetBrains Mono', monospace", marginBottom:2 }}>前月比</div><div style={{ fontFamily:"'Outfit', sans-serif", fontSize:18, fontWeight:300, color:change>=0?"#fff":"#E87070" }}>{change>=0?"+":""}{change}%</div></div>
              <div><div style={{ fontSize:10, color:"#C8C8D8", fontFamily:"'JetBrains Mono', monospace", marginBottom:2 }}>利益率</div><div style={{ fontFamily:"'Outfit', sans-serif", fontSize:18, fontWeight:300, color:"rgba(255,255,255,.6)" }}>{((d.profit/d.revenue)*100).toFixed(1)}%</div></div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}


const C = {
  bg: "#07070E", surface: "#0C0C16", surfAlt: "#111119",
  border: "#1C1C2E", borderLt: "#15152A",
  text: "#E8E8F0", textSec: "#C8C8D8", textMut: "#B0B0C8",
  blue: "#E0E0F0", blueLt: "#FFFFFF", blueDk: "#C0C0D8", blueBg: "rgba(200,200,255,.03)",
  dark: "#F0F0F8", dark2: "#E0E0EC",
  /* Purple accent — planet.ai main color */
  purple: "#8B7BF4", purpleLt: "#A89BFF", purpleDk: "#6B5CD4",
  purpleBg: "rgba(139,123,244,.06)", purpleBorder: "rgba(139,123,244,.2)",
  b1: "#FFFFFF",   /* White — urgent */
  b2: "#E0E0F0",   /* White-ish — primary */
  b3: "#6B6B88",   /* Muted purple-grey */
  b4: "#E8E8F0",   /* White — success/accent */
  b5: "#2A2A3E",   /* Dark purple-grey */
  b6: "#12121C",   /* Near black */
  muted: "#404058",
  /* Red/Green — very muted, only for critical status */
  red: "#E87070", redBg: "rgba(232,112,112,.06)",
  gold: "#8B7BF4", goldBg: "rgba(139,123,244,.04)",
  green: "#7BE0A0", greenBg: "rgba(123,224,160,.04)",
  accent: "#FFFFFF",
  cardBg: "rgba(14,14,24,.8)",
  cardBorder: "rgba(139,123,244,.08)",
  cardShadow: "0 1px 3px rgba(0,0,0,.2), 0 0 0 1px rgba(139,123,244,.06), 0 0 30px rgba(255,255,255,.04), 0 0 70px rgba(255,255,255,.02)",
};
const FONT = "https://fonts.googleapis.com/css2?family=Outfit:wght@200;300;400;500;600;700&family=Noto+Sans+JP:wght@300;400;500;600;700&family=JetBrains+Mono:wght@300;400;500;600&display=swap";
const hd = "'Outfit', 'Noto Sans JP', system-ui, sans-serif";
const bd = "'Noto Sans JP', 'Outfit', system-ui, -apple-system, sans-serif";
const mono = "'JetBrains Mono', 'SF Mono', monospace";

/* ═══ WIRE CANVAS ═══ */
function WireCanvas({ children }) {
  const ref = useRef(null);
  const mouse = useRef({ x: -999, y: -999 });
  const circles = useRef([]);
  const raf = useRef();
  const time = useRef(0);
  const [circleState, setCircleState] = useState([]);
  const palette = [[139,123,244],[168,155,255],[196,184,255],[220,215,255],[255,255,255],[139,123,244]];

  const clickCircle = (idx) => {
    const ci = circles.current[idx];
    if (!ci) return;
    ci.col = (ci.col + 1) % 6;
    ci.vx += (Math.random() - .5) * 18;
    ci.vy += (Math.random() - .5) * 18;
  };

  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d");
    const rs = () => {
      c.width = c.offsetWidth * 2; c.height = c.offsetHeight * 2; ctx.scale(2, 2);
      const w = c.offsetWidth, h = c.offsetHeight;
      if (circles.current.length === 0) {
        circles.current = [
          { x: w*.08, y: h*.12, r: 110, vx: 0, vy: 0, bx: w*.08, by: h*.12, col: 0 },
          { x: w*.92, y: h*.1, r: 75, vx: 0, vy: 0, bx: w*.92, by: h*.1, col: 1 },
          { x: w*.9, y: h*.88, r: 140, vx: 0, vy: 0, bx: w*.9, by: h*.88, col: 2 },
          { x: w*.06, y: h*.9, r: 55, vx: 0, vy: 0, bx: w*.06, by: h*.9, col: 3 },
          { x: w*.94, y: h*.5, r: 90, vx: 0, vy: 0, bx: w*.94, by: h*.5, col: 4 },
        ];
      }
    };
    rs(); window.addEventListener("resize", rs);

    let frameCount = 0;
    const draw = () => {
      time.current += .008;
      const w = c.offsetWidth, h = c.offsetHeight;
      ctx.clearRect(0, 0, w, h);
      const mx = mouse.current.x, my = mouse.current.y;

      // Bars — neon glow
      const barN = 24, mD = mx > 0 ? Math.max(0, 1 - mx / (w * .4)) : 0;
      for (let i = 0; i < barN; i++) {
        const y = (h / barN) * i, bh = h / barN - 1.5;
        const w1 = Math.sin(time.current * .8 + i * .4), w2 = Math.cos(time.current * .6 + i * .3);
        const mb = mD * Math.sin(time.current * 2 + i * .6) * 25;
        const bw = 25 + w1 * 18 + mb + Math.sin(time.current * 1.2 + i * .8) * 12;
        // Main bar — brighter
        ctx.save();
        ctx.shadowColor = `rgba(139,123,244,${.15 + mD * .15})`;
        ctx.shadowBlur = 10 + mD * 12;
        ctx.fillStyle = `rgba(139,123,244,${.15 + w1 * .06 + mD * .12})`;
        ctx.fillRect(w2 * 2, y, Math.max(4, bw), bh);
        ctx.restore();
        // Secondary bar — accent glow
        const bw2 = 8 + Math.sin(time.current * 1.5 + i * .9) * 10 + mb * .5;
        ctx.save();
        ctx.shadowColor = `rgba(168,155,255,${.12 + mD * .12})`;
        ctx.shadowBlur = 8 + mD * 10;
        ctx.fillStyle = `rgba(168,155,255,${.12 + Math.sin(time.current + i * .7) * .05 + mD * .1})`;
        ctx.fillRect(bw + 3 + w2 * 2, y, Math.max(2, bw2), bh);
        ctx.restore();
        // Third bar
        if (i % 2 === 0) { const a = .08 + Math.sin(time.current * 1.8 + i * .5) * .04; if (a > .04) { ctx.save(); ctx.shadowColor = `rgba(196,184,255,${a * .6})`; ctx.shadowBlur = 6; ctx.fillStyle = `rgba(196,184,255,${a + mD * .06})`; ctx.fillRect(bw + bw2 + 8, y, 3 + Math.sin(time.current * 2.2 + i) * 5, bh); ctx.restore(); } }
        // Wide pulse bar
        if (i % 5 === 0) { ctx.save(); ctx.shadowColor = `rgba(139,123,244,${.08 + mD * .08})`; ctx.shadowBlur = 14; ctx.fillStyle = `rgba(139,123,244,${Math.max(0, Math.sin(time.current * 3 + i * 2)) * .08 + mD * .06})`; ctx.fillRect(0, y, 60 + Math.sin(time.current * .5 + i) * 30 + mb * 1.5, bh); ctx.restore(); }
      }

      // Update circle physics
      const tL = w * .22, tR = w * .78, tT = h * .18, tB = h * .82;
      const positions = [];
      circles.current.forEach((ci, idx) => {
        const dx = mx - ci.x, dy = my - ci.y, dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 200 && dist > 0) { const f = (200 - dist) / 200 * 3; ci.vx -= dx / dist * f; ci.vy -= dy / dist * f; }
        ci.vx += (ci.bx - ci.x) * .008; ci.vy += (ci.by - ci.y) * .008; ci.vx *= .94; ci.vy *= .94; ci.x += ci.vx; ci.y += ci.vy;
        const fx = Math.sin(time.current * .7 + idx * 2) * 8, fy = Math.cos(time.current * .5 + idx * 3) * 6;
        const dX = ci.x + fx, dY = ci.y + fy;
        if (dX > tL - ci.r && dX < tR + ci.r && dY > tT - ci.r && dY < tB + ci.r) { const cx2 = w * .5, cy2 = h * .5, pd = Math.sqrt((dX - cx2) ** 2 + (dY - cy2) ** 2) || 1; ci.vx += (dX - cx2) / pd * 1.2; ci.vy += (dY - cy2) / pd * 1.2; }
        const near = dist < 250, [cr, cg, cb] = palette[ci.col % 6];
        const intensity = near ? 1 : .6;
        // Multi-layer neon glow — INTENSE
        ctx.save();
        // Layer 1: Deep outer bloom
        ctx.shadowColor = `rgba(${cr},${cg},${cb},${.6 * intensity})`;
        ctx.shadowBlur = near ? 120 : 50;
        ctx.beginPath(); ctx.arc(dX, dY, ci.r * 1.3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${cr},${cg},${cb},${near ? .12 : .05})`;
        ctx.fill();
        // Layer 2: Mid bloom
        ctx.shadowBlur = near ? 70 : 30;
        ctx.shadowColor = `rgba(${cr},${cg},${cb},${.8 * intensity})`;
        ctx.beginPath(); ctx.arc(dX, dY, ci.r * 1.05, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${cr},${cg},${cb},${near ? .15 : .07})`;
        ctx.fill();
        // Layer 3: Main circle neon edge
        ctx.shadowBlur = near ? 40 : 18;
        ctx.shadowColor = `rgba(${cr},${cg},${cb},${intensity})`;
        ctx.beginPath(); ctx.arc(dX, dY, ci.r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${cr},${cg},${cb},${near ? .85 : .35})`;
        ctx.lineWidth = near ? 3 : 1.5;
        ctx.stroke();
        // Double-stroke for extra neon
        ctx.shadowBlur = near ? 20 : 8;
        ctx.beginPath(); ctx.arc(dX, dY, ci.r - 3, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${cr},${cg},${cb},${near ? .3 : .1})`;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.shadowBlur = 0; ctx.restore();
        // Inner dashed ring
        ctx.beginPath(); ctx.setLineDash([4, 6]); ctx.arc(dX, dY, ci.r * .65, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${cr},${cg},${cb},${near ? .45 : .15})`;
        ctx.lineWidth = 1.2; ctx.stroke(); ctx.setLineDash([]);
        // Hot core glow
        const coreGrd = ctx.createRadialGradient(dX, dY, 0, dX, dY, ci.r * (near ? .5 : .35));
        coreGrd.addColorStop(0, `rgba(${Math.min(cr+80,255)},${Math.min(cg+80,255)},${Math.min(cb+80,255)},${near ? .3 : .1})`);
        coreGrd.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
        ctx.beginPath(); ctx.arc(dX, dY, ci.r * (near ? .5 : .35), 0, Math.PI * 2); ctx.fillStyle = coreGrd; ctx.fill();
        if (near) {
          // Crosshair
          ctx.save(); ctx.shadowColor = `rgba(${cr},${cg},${cb},.6)`; ctx.shadowBlur = 12;
          ctx.beginPath(); ctx.moveTo(dX - 14, dY); ctx.lineTo(dX + 14, dY); ctx.moveTo(dX, dY - 14); ctx.lineTo(dX, dY + 14);
          ctx.strokeStyle = `rgba(${cr},${cg},${cb},.6)`; ctx.lineWidth = 1.5; ctx.stroke(); ctx.restore();
        }
        positions.push({ x: dX, y: dY, r: ci.r, col: ci.col, near });
      });

      // Lines
      for (let i = 0; i < circles.current.length; i++) for (let j = i + 1; j < circles.current.length; j++) { const a = circles.current[i], b = circles.current[j], d = Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2); if (d < 500) { const [r1, g1, b1] = palette[a.col % 6]; const [r2, g2, b2] = palette[b.col % 6]; const al = (1 - d / 500) * .18; ctx.save(); ctx.shadowColor = `rgba(${r1},${g1},${b1},${al})`; ctx.shadowBlur = 12; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); const lg = ctx.createLinearGradient(a.x,a.y,b.x,b.y); lg.addColorStop(0,`rgba(${r1},${g1},${b1},${al})`); lg.addColorStop(1,`rgba(${r2},${g2},${b2},${al})`); ctx.strokeStyle = lg; ctx.lineWidth = 1.2; ctx.stroke(); ctx.restore(); } }

      // Dots
      for (let gx = 60; gx < w; gx += 60) for (let gy = 60; gy < h; gy += 60) { const gd = Math.sqrt((mx - gx) ** 2 + (my - gy) ** 2); if (gd < 200) { ctx.save(); ctx.shadowColor = `rgba(139,123,244,${(200 - gd) / 200 * .4})`; ctx.shadowBlur = 6; ctx.beginPath(); ctx.arc(gx, gy, 1.5 + (200 - gd) / 200 * 3, 0, Math.PI * 2); ctx.fillStyle = `rgba(168,155,255,${.08 + (200 - gd) / 200 * .3})`; ctx.fill(); ctx.restore(); } }
      if (mx > 0 && my > 0) { ctx.save(); ctx.shadowColor = "rgba(139,123,244,.25)"; ctx.shadowBlur = 15; ctx.beginPath(); ctx.arc(mx, my, 32, 0, Math.PI * 2); ctx.strokeStyle = "rgba(168,155,255,.22)"; ctx.lineWidth = 1.2; ctx.stroke(); ctx.restore(); }

      // Update hit areas every 3 frames for performance
      frameCount++;
      if (frameCount % 3 === 0) setCircleState(positions);

      raf.current = requestAnimationFrame(draw);
    };
    raf.current = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf.current); window.removeEventListener("resize", rs); };
  }, []);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}
      onMouseMove={e => { const r = ref.current?.getBoundingClientRect(); if (r) mouse.current = { x: e.clientX - r.left, y: e.clientY - r.top }; }}
      onMouseLeave={() => { mouse.current = { x: -999, y: -999 }; }}>
      <canvas ref={ref} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} />
      {/* Invisible clickable circle overlays */}
      {circleState.map((ci, i) => (
        <div key={i} onClick={(e) => { e.stopPropagation(); clickCircle(i); }}
          style={{ position: "absolute", left: ci.x - ci.r, top: ci.y - ci.r, width: ci.r * 2, height: ci.r * 2, borderRadius: "50%", cursor: "pointer", zIndex: 3 }} />
      ))}
      <div style={{ position: "relative", zIndex: 2, width: "100%", height: "100%" }}>{children}</div>
    </div>
  );
}

/* ═══ Helpers ═══ */
function Rv({ children, d = 0, y = 50, s = {} }) {
  const [v, setV] = useState(false); const ref = useRef();
  useEffect(() => { const el = ref.current; if (!el) return; const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setTimeout(() => setV(true), d); o.disconnect(); } }, { threshold: .05 }); o.observe(el); return () => o.disconnect(); }, [d]);
  return <div ref={ref} style={{ opacity: v ? 1 : 0, transform: v ? "translateY(0)" : `translateY(${y}px)`, transition: `all .8s cubic-bezier(.16,1,.3,1) ${d}ms`, ...s }}>{children}</div>;
}

function Mag({ children, s = {}, onClick }) {
  const [o, setO] = useState({ x: 0, y: 0 });
  const [charging, setCharging] = useState(false);
  const [released, setReleased] = useState(false);
  const ref = useRef();
  const isPrimary = (s.background && s.background.includes && (s.background.includes("rgba(139,123,244") || s.background.includes("linear-gradient")));
  const handleUp = () => { setCharging(false); setReleased(true); setTimeout(() => setReleased(false), 400); if (onClick) onClick(); };
  return <button type="button" ref={ref}
    onMouseMove={e => { const r = ref.current.getBoundingClientRect(); setO({ x: (e.clientX - r.left - r.width / 2) * .3, y: (e.clientY - r.top - r.height / 2) * .3 }); }}
    onMouseDown={() => { setCharging(true); setReleased(false); }}
    onMouseUp={handleUp}
    onMouseLeave={() => { setO({ x: 0, y: 0 }); setCharging(false); setReleased(false); }}
    style={{ ...s, transform: `translate(${o.x}px,${o.y}px) scale(${charging ? .97 : released ? 1.02 : 1})`,
      transition: charging ? "transform .6s ease-out, box-shadow .6s ease-out, border-color .3s" : o.x === 0 ? "all .5s cubic-bezier(.16,1,.3,1)" : "transform .08s, box-shadow .3s",
      boxShadow: charging ? (s.boxShadow || "") + ", 0 0 24px rgba(139,123,244,.25), 0 0 48px rgba(139,123,244,.1)"
        : released ? (s.boxShadow || "") + (isPrimary ? ", 0 0 36px rgba(139,123,244,.5), 0 0 64px rgba(139,123,244,.2)" : ", 0 0 36px rgba(139,123,244,.35), 0 0 64px rgba(139,123,244,.12)")
        : s.boxShadow || "none",
      borderColor: charging ? "rgba(139,123,244,.4)" : released ? (isPrimary ? "rgba(139,123,244,.4)" : "rgba(139,123,244,.3)") : undefined,
      position:"relative", overflow:"hidden",
    }}>
    {/* Charge bar */}
    <div style={{
      position:"absolute", bottom:0, left:0, height:2, borderRadius:4,
      background: charging ? "linear-gradient(90deg, rgba(139,123,244,.7), rgba(168,155,255,1))" : released ? (isPrimary ? "rgba(168,155,255,.6)" : "rgba(123,224,160,.6)") : "transparent",
      width: charging ? "100%" : released ? "100%" : "0%",
      transition: charging ? "width .6s ease-out" : "width .08s",
      boxShadow: charging ? "0 0 10px rgba(139,123,244,.5)" : released ? (isPrimary ? "0 0 10px rgba(168,155,255,.4)" : "0 0 10px rgba(123,224,160,.4)") : "none",
    }} />
    <span style={{ position:"relative", zIndex:1 }}>{children}</span>
  </button>;
}

function BtnApprove({ children, s = {}, onClick }) {
  const [phase, setPhase] = useState(0);
  const [o, setO] = useState({ x: 0, y: 0 });
  const ref = useRef();
  const handleClick = () => {
    if (phase !== 0) return;
    setPhase(1); setTimeout(() => setPhase(2), 250); setTimeout(() => setPhase(3), 900); setTimeout(() => { setPhase(0); if (onClick) onClick(); }, 1200);
  };
  const isCircle = phase === 1 || phase === 2;
  return <button type="button" ref={ref} onClick={handleClick}
    onMouseMove={e => { const r = ref.current.getBoundingClientRect(); setO({ x: (e.clientX - r.left - r.width / 2) * .3, y: (e.clientY - r.top - r.height / 2) * .3 }); }}
    onMouseLeave={() => setO({ x: 0, y: 0 })}
    style={{ ...s,
      padding: isCircle ? "14px 14px" : (s.padding || "14px 0"),
      width: isCircle ? 48 : (s.width || s.flex ? undefined : "auto"),
      borderRadius: isCircle ? 100 : (s.borderRadius || 20),
      background: phase===2 ? "#7BE0A0" : (s.background || "#fff"),
      border: phase===2 ? "none" : (s.border || "none"),
      color: phase===2 ? "#0A0A0A" : (s.color || "#0A0A0A"),
      boxShadow: phase===2 ? "0 0 32px rgba(123,224,160,.4), 0 0 64px rgba(123,224,160,.15)" : (s.boxShadow || "0 2px 8px rgba(0,0,0,.12), 0 0 32px rgba(255,255,255,.22), 0 0 72px rgba(255,255,255,.09)"),
      transform: `translate(${phase===0?o.x:0}px,${phase===0?o.y:0}px)`,
      transition: "all .25s cubic-bezier(.16,1,.3,1)",
      display:"flex", alignItems:"center", justifyContent:"center",
      cursor: phase===0 ? "pointer" : "default",
      overflow:"hidden", position:"relative",
    }}>
    {phase === 2 ? (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M4 12l6 6L20 6" style={{ strokeDasharray:30, strokeDashoffset:30, animation:"checkDraw .3s ease-out .05s forwards" }} /></svg>
    ) : (
      <span style={{ opacity:isCircle?0:1, transition:"opacity .15s", whiteSpace:"nowrap", position:"relative", zIndex:1 }}>{children}</span>
    )}
  </button>;
}

function Card3({ children, s = {} }) {
  const ref = useRef(); const [t, setT] = useState({ rx: 0, ry: 0, on: false });
  return <div ref={ref} onMouseMove={e => { const r = ref.current.getBoundingClientRect(); setT({ rx: ((e.clientY - r.top) / r.height - .5) * -5, ry: ((e.clientX - r.left) / r.width - .5) * 5, on: true }); }} onMouseLeave={() => setT({ rx: 0, ry: 0, on: false })}
    style={{ background: C.cardBg, backdropFilter: "blur(20px)", border: "1px solid rgba(139,123,244,.08)", borderRadius: 22, position: "relative", overflow: "hidden", transform: `perspective(800px) rotateX(${t.rx}deg) rotateY(${t.ry}deg)`, transition: t.on ? "box-shadow .15s, border .15s" : "all .6s cubic-bezier(.16,1,.3,1)", boxShadow: t.on ? "0 8px 24px rgba(0,0,0,.2), 0 0 30px rgba(255,255,255,.15), 0 0 70px rgba(255,255,255,.06)" : C.cardShadow, borderColor: t.on ? "rgba(139,123,244,.25)" : "rgba(139,123,244,.08)", ...s }}>
    <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
  </div>;
}

function Cnt({ to, pre = "" }) {
  const [v, setV] = useState(0); const r = useRef();
  useEffect(() => { const s = Date.now(); const t = () => { const p = Math.min((Date.now() - s) / 1500, 1); setV(Math.floor(to * (1 - Math.pow(1 - p, 4)))); if (p < 1) r.current = requestAnimationFrame(t); }; r.current = requestAnimationFrame(t); return () => cancelAnimationFrame(r.current); }, [to]);
  return <span>{pre}{v.toLocaleString()}</span>;
}

function KL({ text, delay = 0 }) {
  const [v, setV] = useState(false);
  useEffect(() => { const t = setTimeout(() => setV(true), delay); return () => clearTimeout(t); }, [delay]);
  // Split by \n first, then by natural word boundaries for Japanese
  const lines = text.split("\n");
  let charIdx = 0;
  return <span style={{ display: "inline" }}>{lines.map((line, li) => {
    // Split Japanese into chunks of ~4 chars to prevent single-char orphans
    const chunks = [];
    for (let i = 0; i < line.length; i += 4) chunks.push(line.slice(i, i + 4));
    const els = chunks.map((chunk, ci) => {
      const baseIdx = charIdx;
      charIdx += chunk.length;
      return <span key={`${li}-${ci}`} style={{ display: "inline-block", opacity: v ? 1 : 0, transform: v ? "translateY(0) skewY(0)" : "translateY(100%) skewY(8deg)", transition: `all .6s cubic-bezier(.16,1,.3,1) ${baseIdx * 22 + 60}ms`, transformOrigin: "bottom left" }}>{chunk}</span>;
    });
    if (li < lines.length - 1) { charIdx++; return [...els, <br key={`br-${li}`}/>]; }
    return els;
  })}</span>;
}

/* ════════════════════════════════ LOGIN ════════════════════════════════ */

/* ═══ LOGIN — 3D scene with floating objects ═══ */

/* ═══ LOGIN — Lightweight 3D (2 objects, low poly) ═══ */
function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const ok = email && pass;
  const bgRef = useRef(null);
  const frameRef = useRef(0);

  useEffect(() => {
    const el = bgRef.current;
    if (!el) return;
    let w = el.clientWidth, h = el.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, w / h, 0.1, 100);
    camera.position.set(0, 0.5, 16);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x020208, 1);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 3.5;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    el.appendChild(renderer.domElement);

    /* ── Materials: Silver / Chrome ── */
    var matPed = new THREE.MeshStandardMaterial({ color:0x18142e, metalness:0.95, roughness:0.08, emissive:0x0a0818, emissiveIntensity:0.05 });
    var matPedTop = new THREE.MeshStandardMaterial({ color:0x201a3a, metalness:0.98, roughness:0.04, emissive:0x0f0a28, emissiveIntensity:0.08 });
    var matSilver = new THREE.MeshStandardMaterial({ color:0xc0b8e8, metalness:0.98, roughness:0.06, emissive:0x5544cc, emissiveIntensity:0.3 });
    var matBright = new THREE.MeshStandardMaterial({ color:0xd0c8f8, metalness:1, roughness:0.02, emissive:0x7766ee, emissiveIntensity:0.7 });
    var matGlow = new THREE.MeshStandardMaterial({ color:0xe0d8ff, metalness:1, roughness:0, emissive:0x9988ff, emissiveIntensity:2.0 });
    var matEdgeR = new THREE.MeshStandardMaterial({ color:0xb0a8d8, metalness:0.98, roughness:0.05, emissive:0x6655cc, emissiveIntensity:0.4 });
    var edgeLineMat = new THREE.MeshBasicMaterial({ color:0x8B7BF4, transparent:true, opacity:0.35 });

    /* ── Hero Group ── */
    var heroGroup = new THREE.Group();
    scene.add(heroGroup);

    /* ── Pedestal ── */
    var pedestal = new THREE.Group();
    var pedBlock = new THREE.Mesh(new THREE.BoxGeometry(4.5, 2.0, 4.5), matPed);
    pedBlock.position.y = -1.0; pedBlock.castShadow = true; pedBlock.receiveShadow = true;
    pedestal.add(pedBlock);

    var pedTop = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.06, 4.6), matPedTop);
    pedTop.position.y = 0.03; pedTop.receiveShadow = true;
    pedestal.add(pedTop);

    // Glowing edge lines
    var edgeFront = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.02, 0.02), edgeLineMat);
    edgeFront.position.set(0, 0.06, 2.3); pedestal.add(edgeFront);
    var edgeBack = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.02, 0.02), edgeLineMat);
    edgeBack.position.set(0, 0.06, -2.3); pedestal.add(edgeBack);
    var edgeL = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.02, 4.6), edgeLineMat);
    edgeL.position.set(-2.3, 0.06, 0); pedestal.add(edgeL);
    var edgeR = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.02, 4.6), edgeLineMat);
    edgeR.position.set(2.3, 0.06, 0); pedestal.add(edgeR);

    pedestal.position.set(0, -2.5, 0);
    heroGroup.add(pedestal);

    /* ── Coin Stack Base (2 flat discs) ── */
    var stackBase = new THREE.Group();
    for (var si = 0; si < 2; si++) {
      var disc = new THREE.Mesh(new THREE.CylinderGeometry(1.55, 1.55, 0.18, 72), matSilver);
      disc.position.y = si * 0.2; disc.castShadow = true;
      stackBase.add(disc);
      var dRim = new THREE.Mesh(new THREE.TorusGeometry(1.55, 0.035, 8, 72), matBright);
      dRim.rotation.x = Math.PI / 2; dRim.position.y = si * 0.2;
      stackBase.add(dRim);
      var gLine = new THREE.Mesh(new THREE.TorusGeometry(1.55, 0.015, 6, 72), matGlow);
      gLine.rotation.x = Math.PI / 2; gLine.position.y = si * 0.2 + 0.09;
      stackBase.add(gLine);
    }
    stackBase.position.set(0, -0.9, 0);
    heroGroup.add(stackBase);

    /* ── Main Z Coin (standing upright via pivot group) ── */
    var coinPivot = new THREE.Group();
    coinPivot.position.set(0, 0.6, 0);
    coinPivot.rotation.z = Math.PI / 2; // stand the coin upright
    heroGroup.add(coinPivot);

    var coin = new THREE.Group();
    coinPivot.add(coin);

    var CR = 1.5, CTH = 0.22;

    // Body
    var coinBody = new THREE.Mesh(new THREE.CylinderGeometry(CR, CR, CTH, 80), matSilver);
    coinBody.castShadow = true; coin.add(coinBody);

    // Outer rim
    var outerRim = new THREE.Mesh(new THREE.TorusGeometry(CR, 0.05, 12, 80), matBright);
    outerRim.rotation.x = Math.PI / 2; coin.add(outerRim);

    // Glow rim
    var glowRim = new THREE.Mesh(new THREE.TorusGeometry(CR + 0.01, 0.025, 8, 80), matGlow);
    glowRim.rotation.x = Math.PI / 2; coin.add(glowRim);

    // Inner rings on faces
    var innerFront = new THREE.Mesh(new THREE.TorusGeometry(CR - 0.15, 0.025, 8, 80), matBright);
    innerFront.rotation.x = Math.PI / 2; innerFront.position.y = CTH / 2 + 0.004;
    coin.add(innerFront);
    var innerBack = new THREE.Mesh(new THREE.TorusGeometry(CR - 0.15, 0.025, 8, 80), matBright);
    innerBack.rotation.x = Math.PI / 2; innerBack.position.y = -(CTH / 2 + 0.004);
    coin.add(innerBack);

    // Concentric face rings
    var ringRadii = [1.05, 0.65];
    for (var ri0 = 0; ri0 < ringRadii.length; ri0++) {
      var cr0 = ringRadii[ri0];
      var rFront = new THREE.Mesh(new THREE.TorusGeometry(cr0, 0.018, 8, 64), matBright);
      rFront.rotation.x = Math.PI / 2; rFront.position.y = CTH / 2 + 0.006;
      coin.add(rFront);
      var rBack = new THREE.Mesh(new THREE.TorusGeometry(cr0, 0.018, 8, 64), matBright);
      rBack.rotation.x = Math.PI / 2; rBack.position.y = -(CTH / 2 + 0.006);
      coin.add(rBack);
    }

    // Knurled edge ridges
    for (var ri = 0; ri < 100; ri++) {
      var a = (ri / 100) * Math.PI * 2;
      var ridge = new THREE.Mesh(new THREE.BoxGeometry(0.016, CTH * 0.8, 0.05), matEdgeR);
      ridge.position.set(Math.cos(a) * (CR + 0.012), 0, Math.sin(a) * (CR + 0.012));
      ridge.rotation.y = -a;
      coin.add(ridge);
    }

    // Dot pattern around face
    for (var di = 0; di < 28; di++) {
      var da = (di / 28) * Math.PI * 2;
      var dot = new THREE.Mesh(new THREE.SphereGeometry(0.022, 6, 6), matBright);
      dot.position.set(Math.cos(da) * 1.15, CTH / 2 + 0.008, Math.sin(da) * 1.15);
      dot.scale.y = 0.4;
      coin.add(dot);
    }

    // "Z" emboss on front face
    var fY = CTH / 2 + 0.012;
    var zH = 0.04;
    // Top bar
    var zt = new THREE.Mesh(new THREE.BoxGeometry(0.7, zH, 0.11), matBright);
    zt.position.set(0, fY, 0.3); coin.add(zt);
    // Bottom bar
    var zb = new THREE.Mesh(new THREE.BoxGeometry(0.7, zH, 0.11), matBright);
    zb.position.set(0, fY, -0.3); coin.add(zb);
    // Diagonal
    var dLen = Math.sqrt(0.6 * 0.6 + 0.7 * 0.7);
    var zd = new THREE.Mesh(new THREE.BoxGeometry(dLen, zH, 0.09), matBright);
    zd.position.set(0, fY, 0); zd.rotation.y = Math.atan2(0.7, 0.6); coin.add(zd);
    // Serifs
    var s1 = new THREE.Mesh(new THREE.BoxGeometry(0.14, zH, 0.065), matBright);
    s1.position.set(-0.38, fY, 0.3); coin.add(s1);
    var s2 = new THREE.Mesh(new THREE.BoxGeometry(0.14, zH, 0.065), matBright);
    s2.position.set(0.38, fY, 0.3); coin.add(s2);
    var s3 = new THREE.Mesh(new THREE.BoxGeometry(0.14, zH, 0.065), matBright);
    s3.position.set(-0.38, fY, -0.3); coin.add(s3);
    var s4 = new THREE.Mesh(new THREE.BoxGeometry(0.14, zH, 0.065), matBright);
    s4.position.set(0.38, fY, -0.3); coin.add(s4);
    // Strike-through lines
    var st1 = new THREE.Mesh(new THREE.BoxGeometry(0.95, zH * 0.7, 0.03), matBright);
    st1.position.set(0, fY, 0.08); coin.add(st1);
    var st2 = new THREE.Mesh(new THREE.BoxGeometry(0.95, zH * 0.7, 0.03), matBright);
    st2.position.set(0, fY, -0.08); coin.add(st2);

    // Back face Z
    var bY = -(CTH / 2 + 0.012);
    var bzt = new THREE.Mesh(new THREE.BoxGeometry(0.6, zH, 0.09), matBright);
    bzt.position.set(0, bY, 0.25); coin.add(bzt);
    var bzb = new THREE.Mesh(new THREE.BoxGeometry(0.6, zH, 0.09), matBright);
    bzb.position.set(0, bY, -0.25); coin.add(bzb);
    var bzd = new THREE.Mesh(new THREE.BoxGeometry(dLen * 0.8, zH, 0.07), matBright);
    bzd.position.set(0, bY, 0); bzd.rotation.y = Math.atan2(0.6, 0.5); coin.add(bzd);

    /* ── (halo removed — was visible as square) ── */

    /* ── (floor removed — was visible as rectangle) ── */

    /* ═══ PARTICLE SYSTEM — 均一サイズ・最大発光 ═══ */

    var cY = 0.3;
    var cZ = -1.0;
    var PS = 0.04; // 統一パーティクルサイズ

    // ── Layer 1: メインの円 ──
    var ringCount = 4000;
    var ringGeo = new THREE.BufferGeometry();
    var ringArr = new Float32Array(ringCount * 3);
    var ringAngle = [];
    var ringR = [];
    var ringSpeed = [];
    for (var rp = 0; rp < ringCount; rp++) {
      var a1 = Math.random() * Math.PI * 2;
      var r1 = 3.8 + (Math.random() - 0.5) * 1.4;
      ringArr[rp * 3] = Math.cos(a1) * r1;
      ringArr[rp * 3 + 1] = Math.sin(a1) * r1 + cY;
      ringArr[rp * 3 + 2] = cZ + (Math.random() - 0.5) * 0.5;
      ringAngle.push(a1);
      ringR.push(r1);
      ringSpeed.push(0.0002 + Math.random() * 0.0005);
    }
    ringGeo.setAttribute("position", new THREE.BufferAttribute(ringArr, 3));
    var ringMat = new THREE.PointsMaterial({
      color: 0xc0b0ff, size: PS, transparent: true, opacity: 1.0,
      blending: THREE.AdditiveBlending, depthWrite: false
    });
    scene.add(new THREE.Points(ringGeo, ringMat));

    // ── Layer 2: 密度アップ層（同じサイズ） ──
    var kiraCount = 2000;
    var kiraGeo = new THREE.BufferGeometry();
    var kiraArr = new Float32Array(kiraCount * 3);
    var kiraAngle = [];
    var kiraR = [];
    var kiraSpeed = [];
    var kiraPhase = [];
    for (var ki = 0; ki < kiraCount; ki++) {
      var a2 = Math.random() * Math.PI * 2;
      var r2 = 3.8 + (Math.random() - 0.5) * 1.0;
      kiraArr[ki * 3] = Math.cos(a2) * r2;
      kiraArr[ki * 3 + 1] = Math.sin(a2) * r2 + cY;
      kiraArr[ki * 3 + 2] = cZ + (Math.random() - 0.5) * 0.3;
      kiraAngle.push(a2);
      kiraR.push(r2);
      kiraSpeed.push(0.0003 + Math.random() * 0.0008);
      kiraPhase.push(Math.random() * Math.PI * 2);
    }
    kiraGeo.setAttribute("position", new THREE.BufferAttribute(kiraArr, 3));
    var kiraMat = new THREE.PointsMaterial({
      color: 0xc0b0ff, size: PS, transparent: true, opacity: 1.0,
      blending: THREE.AdditiveBlending, depthWrite: false
    });
    scene.add(new THREE.Points(kiraGeo, kiraMat));

    // ── Layer 3: Click-burst sparkles (spkGeo) ──
    var spkCount = 80;
    var spkGeo = new THREE.BufferGeometry();
    var spkArr = new Float32Array(spkCount * 3);
    var spkPhase = [];
    var spkAngle = [];
    var spkR2 = [];
    for (var sp = 0; sp < spkCount; sp++) {
      var a5 = Math.random() * Math.PI * 2;
      var r5 = 3.8 + (Math.random() - 0.5) * 1.2;
      spkArr[sp * 3] = Math.cos(a5) * r5;
      spkArr[sp * 3 + 1] = Math.sin(a5) * r5 + cY;
      spkArr[sp * 3 + 2] = cZ;
      spkPhase.push(Math.random() * Math.PI * 2);
      spkAngle.push(a5);
      spkR2.push(r5);
    }
    spkGeo.setAttribute("position", new THREE.BufferAttribute(spkArr, 3));
    var spkMat = new THREE.PointsMaterial({
      color: 0xc0b0ff, size: PS, transparent: true, opacity: 1.0,
      blending: THREE.AdditiveBlending, depthWrite: false
    });
    scene.add(new THREE.Points(spkGeo, spkMat));


    /* ── Lights (MAX光量) ── */
    scene.add(new THREE.AmbientLight(0x100818, 1.0));
    var keyLight = new THREE.DirectionalLight(0xccbbff, 5.0);
    keyLight.position.set(-5, 10, 8); keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024; keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 0.5; keyLight.shadow.camera.far = 35;
    keyLight.shadow.camera.left = -10; keyLight.shadow.camera.right = 10;
    keyLight.shadow.camera.top = 10; keyLight.shadow.camera.bottom = -10;
    scene.add(keyLight);

    var rimLight = new THREE.PointLight(0x8B7BF4, 8.0, 30);
    rimLight.position.set(2, 3, -5); scene.add(rimLight);
    var warmFill = new THREE.PointLight(0xbbaaee, 2.5, 20);
    warmFill.position.set(0, -2, 4); scene.add(warmFill);
    var coolSide = new THREE.PointLight(0x6655cc, 4.5, 30);
    coolSide.position.set(-5, 1, 3); scene.add(coolSide);
    var topSpot = new THREE.PointLight(0xddccff, 4.5, 20);
    topSpot.position.set(0, 6, 2); scene.add(topSpot);
    // Extra back glow light
    var backGlow = new THREE.PointLight(0x5544cc, 3.0, 25);
    backGlow.position.set(0, 0, -6); scene.add(backGlow);

    /* ── Mouse / Touch ── */
    var targetMX = 0, targetMY = 0, smoothMX = 0, smoothMY = 0;
    var onMouseMove = function(e) { targetMX = (e.clientX / w - 0.5) * 2; targetMY = (e.clientY / h - 0.5) * 2; };
    var onTouchMove = function(e) { if (e.touches[0]) { targetMX = (e.touches[0].clientX / w - 0.5) * 2; targetMY = (e.touches[0].clientY / h - 0.5) * 2; } };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("touchmove", onTouchMove, { passive: true });

    /* ── Click interaction ── */
    var clickSpinVel = 0;
    var clickBounceT = 0;
    var clickGlow = 0;
    var isHovering = false;

    var raycaster = new THREE.Raycaster();
    var mouseVec = new THREE.Vector2();

    // Collect all coin meshes for raycast
    var coinMeshes = [];
    coin.traverse(function(c) { if (c.isMesh) coinMeshes.push(c); });
    stackBase.traverse(function(c) { if (c.isMesh) coinMeshes.push(c); });

    var onPointerMove = function(e) {
      var rect = el.getBoundingClientRect();
      mouseVec.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseVec.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouseVec, camera);
      var hits = raycaster.intersectObjects(coinMeshes);
      var over = hits.length > 0;
      if (over !== isHovering) {
        isHovering = over;
        el.style.cursor = over ? "pointer" : "default";
      }
    };

    var onClick = function(e) {
      var rect = el.getBoundingClientRect();
      mouseVec.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseVec.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouseVec, camera);
      var hits = raycaster.intersectObjects(coinMeshes);
      if (hits.length > 0) {
        // Trigger spin burst
        clickSpinVel += 0.35;
        // Trigger bounce
        clickBounceT = 1.0;
        // Trigger glow burst
        clickGlow = 1.5;
        // Burst sparkles outward
        var pp = spkGeo.attributes.position.array;
        for (var bi = 0; bi < spkCount; bi++) {
          var bAng = Math.random() * Math.PI * 2;
          var bDist = 0.5 + Math.random() * 2;
          pp[bi * 3] += Math.cos(bAng) * bDist * 0.3;
          pp[bi * 3 + 1] += (Math.random() - 0.3) * 1.5;
        }
        spkGeo.attributes.position.needsUpdate = true;
      }
    };

    var onTouchEnd = function(e) {
      if (e.changedTouches && e.changedTouches[0]) {
        var rect = el.getBoundingClientRect();
        var t = e.changedTouches[0];
        mouseVec.x = ((t.clientX - rect.left) / rect.width) * 2 - 1;
        mouseVec.y = -((t.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(mouseVec, camera);
        var hits = raycaster.intersectObjects(coinMeshes);
        if (hits.length > 0) {
          clickSpinVel += 0.35;
          clickBounceT = 1.0;
          clickGlow = 1.5;
        }
      }
    };

    el.addEventListener("click", onClick);
    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("touchend", onTouchEnd);

    /* ── Animation ── */
    var time = 0;
    var animate = function() {
      frameRef.current = requestAnimationFrame(animate);
      time += 0.016;
      smoothMX += (targetMX - smoothMX) * 0.04;
      smoothMY += (targetMY - smoothMY) * 0.04;

      // Hero group rotation from mouse
      heroGroup.rotation.y += ((-0.15 + smoothMX * 0.5) - heroGroup.rotation.y) * 0.05;
      heroGroup.rotation.x += ((0.1 - smoothMY * 0.25) - heroGroup.rotation.x) * 0.05;
      heroGroup.rotation.z += (smoothMX * -0.06 - heroGroup.rotation.z) * 0.04;
      heroGroup.position.x += (smoothMX * 0.5 - heroGroup.position.x) * 0.03;
      heroGroup.position.y += (-smoothMY * 0.25 - heroGroup.position.y) * 0.03;

      // Coin: base spin + click spin burst
      clickSpinVel *= 0.97; // decay spin velocity
      coin.rotation.y += 0.003 + clickSpinVel;

      // Click bounce (spring up then settle)
      if (clickBounceT > 0) {
        clickBounceT -= 0.025;
        if (clickBounceT < 0) clickBounceT = 0;
        var bounceY = Math.sin(clickBounceT * Math.PI) * 0.8;
        coinPivot.position.y = 0.3 + bounceY;
        // Stack discs scatter slightly
        stackBase.children.forEach(function(c, i) {
          c.position.x += (Math.sin(i * 1.5) * clickBounceT * 0.3 - c.position.x * 0.05);
        });
      } else {
        coinPivot.position.y += (0.3 - coinPivot.position.y) * 0.05;
      }

      // Click glow burst on coin material
      clickGlow *= 0.95;
      matBright.emissiveIntensity = 0.9 + clickGlow;
      matGlow.emissiveIntensity = 2.5 + Math.sin(time * 0.8) * 0.8 + clickGlow * 3;

      // Hover scale
      var targetScale = isHovering ? 1.06 : 1.0;
      coinPivot.scale.x += (targetScale - coinPivot.scale.x) * 0.08;
      coinPivot.scale.y += (targetScale - coinPivot.scale.y) * 0.08;
      coinPivot.scale.z += (targetScale - coinPivot.scale.z) * 0.08;

      // Camera parallax
      camera.position.x += (smoothMX * 0.5 - camera.position.x) * 0.02;
      camera.position.y += (0.5 - smoothMY * 0.25 - camera.position.y) * 0.02;
      camera.lookAt(0, -0.5, 0);

      // Lights follow mouse
      rimLight.position.x = 2 + smoothMX * 3;
      rimLight.position.y = 3 - smoothMY * 1.5;
      coolSide.position.x = -5 + smoothMX * 2;

      // ═══ 均一キラキラ Animation (XY plane) ═══

      // Main ring — rotate in XY
      var rArr2 = ringGeo.attributes.position.array;
      for (var ri3 = 0; ri3 < ringCount; ri3++) {
        ringAngle[ri3] += ringSpeed[ri3];
        rArr2[ri3 * 3] = Math.cos(ringAngle[ri3]) * ringR[ri3];
        rArr2[ri3 * 3 + 1] = Math.sin(ringAngle[ri3]) * ringR[ri3] + cY;
      }
      ringGeo.attributes.position.needsUpdate = true;

      // Dense layer — XY orbit
      var kArr2 = kiraGeo.attributes.position.array;
      for (var ki2 = 0; ki2 < kiraCount; ki2++) {
        kiraAngle[ki2] += kiraSpeed[ki2];
        kArr2[ki2 * 3] = Math.cos(kiraAngle[ki2]) * kiraR[ki2];
        kArr2[ki2 * 3 + 1] = Math.sin(kiraAngle[ki2]) * kiraR[ki2] + cY;
      }
      kiraGeo.attributes.position.needsUpdate = true;

      // Click-burst sparkles
      var pp = spkGeo.attributes.position.array;
      for (var si2 = 0; si2 < spkCount; si2++) {
        spkAngle[si2] += 0.001;
        pp[si2 * 3] = Math.cos(spkAngle[si2]) * spkR2[si2];
        pp[si2 * 3 + 1] = Math.sin(spkAngle[si2]) * spkR2[si2] + cY;
      }
      spkGeo.attributes.position.needsUpdate = true;

      // Light, glow pulse (MAX)
      rimLight.intensity = 8.0 + Math.sin(time * 0.4) * 2.0 + clickGlow * 6;
      topSpot.intensity = 4.5 + Math.sin(time * 0.5 + 1) * 1.5;
      backGlow.intensity = 3.0 + Math.sin(time * 0.3) * 1.0;

      renderer.render(scene, camera);
    };
    animate();

    var onResize = function() {
      w = el.clientWidth; h = el.clientHeight;
      camera.aspect = w / h; camera.updateProjectionMatrix(); renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    return function() {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("resize", onResize);
      el.removeEventListener("click", onClick);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("touchend", onTouchEnd);
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  return (
    <div style={{ width:"100vw", minHeight:"100vh", background:"#020208", fontFamily:bd, overflow:"auto", position:"relative" }}>
      <link href={FONT} rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600&family=Outfit:wght@200;300;400;500;600;700&family=Noto+Sans+JP:wght@700;800;900&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(32px)}to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn { from{opacity:0}to{opacity:1} }
        @keyframes gradShift { 0%,100%{background-position:0% 50%}50%{background-position:100% 50%} }
        @keyframes checkDraw { 0%{stroke-dashoffset:30} 100%{stroke-dashoffset:0} }
        @keyframes holoShimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
        @keyframes dotPulse { 0%,80%,100%{opacity:.2;transform:scale(.8)} 40%{opacity:1;transform:scale(1)} }
        @keyframes holoShimmerFast { 0%{background-position:-200% center} 100%{background-position:200% center} }
        .li5:focus{border-color:rgba(139,123,244,.3)!important;box-shadow:0 0 12px rgba(255,255,255,.06)!important;background:rgba(139,123,244,.04)!important}
        button{transition:all .2s ease!important}
        
      `}</style>

      {/* 3D Canvas */}
      <div ref={bgRef} style={{ position:"absolute", inset:0 }} />

      {/* Cinematic vignette overlays — wider to show ring */}
      <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse 85% 80% at 50% 45%, rgba(2,2,8,0) 0%, rgba(2,2,8,.7) 100%)", zIndex:2, pointerEvents:"none" }} />

      {/* Top nav */}
      <div style={{ position:"absolute", top:0, left:0, right:0, zIndex:20, padding:"20px 40px", display:"flex", justifyContent:"space-between", alignItems:"center", animation:"fadeIn 1s .3s both" }}>
        <div style={{ display:"flex", alignItems:"center", gap:28, background:"rgba(10,12,24,.6)", backdropFilter:"blur(20px)", border:"1px solid rgba(139,123,244,.08)", borderRadius:100, padding:"10px 28px", boxShadow:"0 2px 12px rgba(0,0,0,.25)" }}>
          <span style={{ fontFamily:hd, fontSize:20, color:"#fff", letterSpacing:"-.02em" }}>Z.</span>
          {["機能","料金","導入事例","お知らせ"].map(t=>(
            <button key={t} type="button" style={{ border:"none", background:"transparent", color:"rgba(255,255,255,.35)", fontSize:12, cursor:"pointer", fontFamily:bd, transition:"color .2s" }}
              onMouseEnter={e=>e.target.style.color="#fff"} onMouseLeave={e=>e.target.style.color="rgba(255,255,255,.35)"}>{t}</button>
          ))}
        </div>
        <button type="button" style={{ padding:"10px 28px", borderRadius:100, border:"1px solid rgba(100,130,255,.3)", background:"rgba(60,90,200,.12)", color:"rgba(200,210,255,.9)", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:bd, backdropFilter:"blur(8px)", boxShadow:"0 0 28px rgba(255,255,255,.22), 0 0 64px rgba(255,255,255,.09)" }}>ログイン</button>
      </div>

      {/* Hero Headline — Apple style large white text */}
      <div style={{ position:"absolute", top:"8vh", left:0, right:0, zIndex:10, textAlign:"center", animation:"fadeUp 1.2s .3s both", pointerEvents:"none" }}>
        <div style={{ fontFamily:"'Cormorant Garamond', 'Hiragino Mincho ProN', serif", fontSize:"clamp(14px,1.8vw,18px)", fontWeight:400, color:"rgba(200,210,255,.4)", letterSpacing:".3em", marginBottom:12 }}>Zeirishi</div>
        <div style={{ fontFamily:"'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Noto Sans JP', -apple-system, sans-serif", fontSize:"clamp(36px,5.5vw,72px)", fontWeight:800, color:"#fff", lineHeight:1.15, letterSpacing:"-.02em" }}>
          税の革新を、AIで。
        </div>
      </div>

      {/* Bottom-left: Sub branding */}
      <div style={{ position:"absolute", left:44, bottom:44, zIndex:10, animation:"fadeUp 1s .7s both" }}>
        <div style={{ fontSize:11, color:"rgba(180,190,255,.25)", fontFamily:bd, lineHeight:1.7, maxWidth:300 }}>
          確定申告・法人税・消費税<br/>AIが仕訳から申告書作成まで自動化
        </div>
      </div>

      {/* Right: Login card */}
      <div style={{ position:"absolute", right:"5vw", top:"50%", transform:"translateY(-50%)", zIndex:20, animation:"fadeUp .9s .4s cubic-bezier(.16,1,.3,1) both" }}>
          <div style={{ position:"relative", background:"rgba(14,16,26,.82)", backdropFilter:"blur(30px)", border:"1px solid rgba(139,123,244,.12)", borderRadius:32, padding:"40px 36px", width:340, maxWidth:"85vw", boxSizing:"border-box", boxShadow:"0 4px 12px rgba(0,0,0,.2), 0 0 0 1px rgba(139,123,244,.1), 0 0 30px rgba(255,255,255,.06), 0 0 70px rgba(255,255,255,.02)" }}>

            <div style={{ textAlign:"center", marginBottom:24 }}>
                <div style={{ fontFamily:hd, fontSize:38, color:"#fff", letterSpacing:"-.04em", textShadow:"none" }}>Z.</div>
              <div style={{ fontFamily:hd, fontSize:9, color:"rgba(180,190,255,.3)", letterSpacing:".24em", textTransform:"uppercase", marginTop:4, fontFamily:mono }}>AI税務アシスタント</div>
            </div>

            <div style={{ height:1, background:"linear-gradient(90deg, transparent, rgba(139,123,244,.08), transparent)", margin:"0 0 24px" }} />

            <label style={{ fontSize:8, color:"rgba(180,190,255,.25)", letterSpacing:".2em", textTransform:"uppercase", marginBottom:7, display:"block", paddingLeft:16, fontFamily:mono }}>メールアドレス</label>
            <input className="li5" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@company.com" type="email"
              style={{ width:"100%", padding:"12px 18px", border:"1px solid rgba(139,123,244,.1)", borderRadius:100, background:"rgba(139,123,244,.04)", fontFamily:bd, fontSize:13, color:"#fff", outline:"none", boxSizing:"border-box", marginBottom:14, caretColor:"rgba(160,180,255,.9)", transition:"all .3s" }} />

            <label style={{ fontSize:8, color:"rgba(180,190,255,.25)", letterSpacing:".2em", textTransform:"uppercase", marginBottom:7, display:"block", paddingLeft:16, fontFamily:mono }}>パスワード</label>
            <input className="li5" value={pass} onChange={e=>setPass(e.target.value)} placeholder="••••••••" type="password"
              style={{ width:"100%", padding:"12px 18px", border:"1px solid rgba(139,123,244,.1)", borderRadius:100, background:"rgba(139,123,244,.04)", fontFamily:bd, fontSize:13, color:"#fff", outline:"none", boxSizing:"border-box", marginBottom:6, caretColor:"rgba(160,180,255,.9)", transition:"all .3s" }} />

            <div style={{ textAlign:"right", marginBottom:22 }}>
              <button type="button" style={{ border:"none", background:"transparent", color:"rgba(255,255,255,.15)", fontSize:10, cursor:"pointer", fontFamily:bd }}>パスワードを忘れた</button>
            </div>

            <div style={{ position:"relative" }}>
              <Mag onClick={()=>{ if(ok) onLogin(); }} s={{
                position:"relative", width:"100%", padding:"13px", border:ok?"none":"1px solid rgba(100,130,255,.08)", borderRadius:100,
                background:ok?"linear-gradient(135deg, rgba(140,165,255,.9), rgba(100,130,240,.85))":"transparent",
                color:ok?"#060610":"rgba(139,123,244,.15)", fontFamily:mono, fontSize:10, fontWeight:600,
                letterSpacing:".16em", textTransform:"uppercase", cursor:ok?"pointer":"default", transition:"all .4s",
                boxShadow:ok?"0 0 32px rgba(255,255,255,.28), 0 0 72px rgba(255,255,255,.1)":"none"
              }}>ログイン →</Mag>
            </div>

            <div style={{ textAlign:"center", marginTop:18, fontSize:10, color:"rgba(139,123,244,.1)" }}>
              アカウントをお持ちでない方　<button type="button" style={{ border:"none", background:"transparent", color:"rgba(160,175,255,.3)", fontWeight:600, cursor:"pointer", fontFamily:bd, fontSize:10 }}>新規登録</button>
            </div>
          </div>
      </div>
    </div>
  );
}


/* ═══ JAPAN MAP ═══ */
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
function JournalLedger({ compact, acctFilter, onAcctFilter }) {
  const [editRow, setEditRow] = useState(null);
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState({ k: "date", d: "desc" });
  const [periodMode, setPeriodMode] = useState("month"); // month | year
  const [selectedMonth, setSelectedMonth] = useState("02");
  const [selectedYear, setSelectedYear] = useState("2026");
  const [acctOpen, setAcctOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const closeAll = () => { setAcctOpen(false); setStatusOpen(false); setPeriodMode("month"); };

  const accounts = ["会議費","交際費","旅費交通費","消耗品費","通信費","外注費","広告宣伝費","地代家賃","水道光熱費","給料手当","法定福利費","福利厚生費","工具器具備品","雑費","研究開発費","支払手数料","新聞図書費","諸会費","租税公課","減価償却費"];

  const [rows, setRows] = useState([]);

  // acctFilter is now an array
  const acctArr = acctFilter || [];
  const toggleAcct = (acc) => {
    if (!onAcctFilter) return;
    if (acctArr.includes(acc)) onAcctFilter(acctArr.filter(a => a !== acc));
    else onAcctFilter([...acctArr, acc]);
  };

  const filtered = rows.filter(r => {
    // Period filter
    const yr = r.date.split("/")[0];
    const mon = r.date.split("/")[1];
    if (periodMode === "month" && selectedMonth !== "all" && mon !== selectedMonth) return false;
    if (periodMode === "month" && yr !== selectedYear) return false;
    // Status filter
    if (filter === "review" && r.st !== "要確認") return false;
    if (filter === "auto" && r.st !== "自動確定") return false;
    if (filter === "done" && r.st !== "承認済") return false;
    // Account filter (multi)
    if (acctArr.length > 0 && !acctArr.includes(r.debitAcc)) return false;
    return true;
  }).sort((a, b) => {
    if (sort.k === "date") return sort.d === "desc" ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date);
    if (sort.k === "amount") return sort.d === "desc" ? b.debit - a.debit : a.debit - b.debit;
    if (sort.k === "conf") return sort.d === "desc" ? b.conf - a.conf : a.conf - b.conf;
    return 0;
  });

  const toggleSort = (k) => setSort(prev => ({ k, d: prev.k === k && prev.d === "desc" ? "asc" : "desc" }));
  const stColor = (st) => st === "要確認" ? C.b1 : st === "自動確定" ? C.b4 : C.b2;
  const confColor = (c) => c >= 95 ? C.b4 : c >= 75 ? C.b3 : C.b1;
  const fmt = (n) => "¥" + n.toLocaleString();

  const updateRow = (id, field, value) => {
    setRows(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const approveRow = (id) => {
    setRows(prev => prev.map(r => r.id === id ? { ...r, st: "承認済" } : r));
    setEditRow(null);
  };

  const SortIcon = ({ k: key }) => (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke={sort.k === key ? C.blue : C.textMut} strokeWidth="2.5" style={{ marginLeft: 4, cursor: "pointer" }} onClick={() => toggleSort(key)}>
      <path d={sort.k === key && sort.d === "asc" ? "M2 6l3-3 3 3" : "M2 4l3 3 3-3"} />
    </svg>
  );

  return (
    <Card3 s={{ padding: 0, marginBottom: 20, overflow: "hidden" }}>
      {/* Header + Filter dropdowns */}
      <div style={{ padding: "18px 28px 14px", display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 9, color: C.textMut, fontWeight: 500, letterSpacing: ".16em", textTransform: "uppercase", marginRight: 4 }}>仕訳帳</span>

        {/* Period dropdown */}
        <div style={{ position: "relative" }}>
          <Mag onClick={() => { const next = periodMode === "open" ? "month" : "open"; closeAll(); if (next === "open") setPeriodMode("open"); }} s={{ padding: "7px 14px", borderRadius: 18, border: `1.5px solid ${C.border}`, background: C.surface, color: C.dark, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: bd, display: "flex", alignItems: "center", gap: 6 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={C.textMut} strokeWidth="2.5"><rect x="3" y="4" width="18" height="18" rx="4"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
            {selectedMonth === "all" ? `${selectedYear}年 全月` : `${selectedYear}年${Number(selectedMonth)}月`}
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={C.textMut} strokeWidth="2.5"><path d="M6 9l6 6 6-6"/></svg>
          </Mag>
          {periodMode === "open" && (
            <div style={{ position: "absolute", top: "100%", left: 0, marginTop: 4, background: C.surface, border: `1.5px solid ${C.border}`, borderRadius: 20, boxShadow: "0 8px 28px rgba(0,0,0,.5), 0 0 0 1px rgba(139,123,244,.06)", zIndex: 20, padding: "8px 0", minWidth: 160 }}>
              <div style={{ padding: "5px 14px", fontSize: 9, color: C.textMut, fontWeight: 500, letterSpacing: ".1em" }}>年度</div>
              {["2024","2025","2026"].map(y => (
                <Mag key={y} onClick={() => setSelectedYear(y)} s={{ display: "block", width: "100%", padding: "7px 14px", border: "none", background: selectedYear === y ? `${C.blue}08` : "transparent", color: selectedYear === y ? C.blue : C.dark, fontSize: 12, fontWeight: selectedYear === y ? 700 : 500, cursor: "pointer", fontFamily: bd, textAlign: "left" }}>{y}年</Mag>
              ))}
              <div style={{ borderTop: `1px solid ${C.borderLt}`, margin: "4px 0" }} />
              <div style={{ padding: "5px 14px", fontSize: 9, color: C.textMut, fontWeight: 500, letterSpacing: ".1em" }}>月</div>
              <Mag onClick={() => { setSelectedMonth("all"); setPeriodMode("month"); }} s={{ display: "block", width: "100%", padding: "7px 14px", border: "none", background: selectedMonth === "all" ? `${C.blue}08` : "transparent", color: selectedMonth === "all" ? C.blue : C.dark, fontSize: 12, fontWeight: selectedMonth === "all" ? 700 : 500, cursor: "pointer", fontFamily: bd, textAlign: "left" }}>全月</Mag>
              {["01","02","03","04","05","06","07","08","09","10","11","12"].map(m => (
                <Mag key={m} onClick={() => { setSelectedMonth(m); setPeriodMode("month"); }} s={{ display: "block", width: "100%", padding: "7px 14px", border: "none", background: selectedMonth === m ? `${C.blue}08` : "transparent", color: selectedMonth === m ? C.blue : C.dark, fontSize: 12, fontWeight: selectedMonth === m ? 700 : 500, cursor: "pointer", fontFamily: bd, textAlign: "left" }}>{Number(m)}月</Mag>
              ))}
            </div>
          )}
        </div>

        {/* Account dropdown */}
        <div style={{ position: "relative" }}>
          <Mag onClick={() => { const next = !acctOpen; closeAll(); if (next) setAcctOpen(true); }} s={{ padding: "7px 14px", borderRadius: 18, border: `1.5px solid ${acctArr.length > 0 ? "rgba(139,123,244,.35)" : C.border}`, background: acctArr.length > 0 ? "rgba(139,123,244,.06)" : C.surface, color: acctArr.length > 0 ? C.blue : C.dark, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: bd, display: "flex", alignItems: "center", gap: 6, boxShadow: acctArr.length > 0 ? "0 0 28px rgba(255,255,255,.2), 0 0 64px rgba(255,255,255,.08)" : "none", transition: "all .2s" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={acctArr.length > 0 ? C.blue : C.textMut} strokeWidth="2.5"><path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"/></svg>
            {acctArr.length === 0 ? "科目" : acctArr.length === 1 ? acctArr[0] : `${acctArr.length}科目`}
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={C.textMut} strokeWidth="2.5"><path d="M6 9l6 6 6-6"/></svg>
          </Mag>
          {acctOpen && (
            <div style={{ position: "absolute", top: "100%", left: 0, marginTop: 4, background: C.surface, border: `1.5px solid ${C.border}`, borderRadius: 20, boxShadow: "0 8px 28px rgba(0,0,0,.5), 0 0 0 1px rgba(139,123,244,.06)", zIndex: 20, padding: "8px 0", minWidth: 200, maxHeight: 320, overflowY: "auto" }}>
              <Mag onClick={() => { if (onAcctFilter) onAcctFilter([]); }} s={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "7px 14px", border: "none", background: acctArr.length === 0 ? `${C.blue}08` : "transparent", color: acctArr.length === 0 ? C.blue : C.dark, fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: bd, textAlign: "left" }}>
                <div style={{ width: 15, height: 15, borderRadius: 10, border: `1.5px solid ${acctArr.length === 0 ? C.blue : C.border}`, background: acctArr.length === 0 ? C.blue : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {acctArr.length === 0 && <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>}
                </div>すべて
              </Mag>
              <div style={{ borderTop: `1px solid ${C.borderLt}`, margin: "4px 0" }} />
              {[...new Set(rows.map(r => r.debitAcc))].sort().map(acc => {
                const on = acctArr.includes(acc);
                const cnt = rows.filter(r => r.debitAcc === acc).length;
                return (
                  <Mag key={acc} onClick={() => toggleAcct(acc)} s={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "7px 14px", border: "none", background: on ? `${C.blue}08` : "transparent", color: on ? C.blue : C.dark, fontSize: 12, fontWeight: on ? 600 : 500, cursor: "pointer", fontFamily: bd, textAlign: "left" }}>
                    <div style={{ width: 15, height: 15, borderRadius: 10, border: `1.5px solid ${on ? C.blue : C.border}`, background: on ? C.blue : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {on && <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>}
                    </div>
                    <span style={{ flex: 1 }}>{acc}</span>
                    <span style={{ fontSize: 10, color: C.textMut }}>{cnt}</span>
                  </Mag>
                );
              })}
            </div>
          )}
        </div>

        {/* Status dropdown */}
        <div style={{ position: "relative" }}>
          <Mag onClick={() => { const next = !statusOpen; closeAll(); if (next) setStatusOpen(true); }} s={{ padding: "7px 14px", borderRadius: 18, border: `1.5px solid ${filter !== "all" ? "rgba(139,123,244,.35)" : C.border}`, background: filter !== "all" ? "rgba(139,123,244,.06)" : C.surface, color: filter !== "all" ? C.blue : C.dark, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: bd, display: "flex", alignItems: "center", gap: 6, boxShadow: filter !== "all" ? "0 0 28px rgba(255,255,255,.2), 0 0 64px rgba(255,255,255,.08)" : "none", transition: "all .2s" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={filter !== "all" ? C.blue : C.textMut} strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M8 12l2.5 2.5L16 9"/></svg>
            {filter === "all" ? "ステータス" : filter === "review" ? "要確認" : filter === "auto" ? "自動確定" : "承認済"}
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={C.textMut} strokeWidth="2.5"><path d="M6 9l6 6 6-6"/></svg>
          </Mag>
          {statusOpen && (
            <div style={{ position: "absolute", top: "100%", left: 0, marginTop: 4, background: C.surface, border: `1.5px solid ${C.border}`, borderRadius: 20, boxShadow: "0 8px 28px rgba(0,0,0,.5), 0 0 0 1px rgba(139,123,244,.06)", zIndex: 20, padding: "8px 0", minWidth: 150 }}>
              {[{ id: "all", l: "すべて", cnt: rows.length }, { id: "review", l: "要確認", cnt: rows.filter(r => r.st === "要確認").length }, { id: "auto", l: "自動確定", cnt: rows.filter(r => r.st === "自動確定").length }, { id: "done", l: "承認済", cnt: rows.filter(r => r.st === "承認済").length }].map(f => (
                <Mag key={f.id} onClick={() => { setFilter(f.id); setStatusOpen(false); }} s={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "8px 14px", border: "none", background: filter === f.id ? `${C.blue}08` : "transparent", color: filter === f.id ? C.blue : C.dark, fontSize: 12, fontWeight: filter === f.id ? 600 : 500, cursor: "pointer", fontFamily: bd, textAlign: "left" }}>
                  <span>{f.l}</span><span style={{ fontSize: 10, color: C.textMut }}>{f.cnt}</span>
                </Mag>
              ))}
            </div>
          )}
        </div>

        {/* Result count */}
        <span style={{ fontSize: 11, color: C.textMut, marginLeft: "auto" }}>{filtered.length} / {rows.length} 件</span>
      </div>

      {/* Table */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, fontFamily: bd }}>
          <thead>
            <tr style={{ borderTop: `1px solid ${C.borderLt}`, borderBottom: `1px solid ${C.border}` }}>
              {[
                { l: "日付", k: "date", w: 90 }, { l: "摘要", w: 170 }, { l: "借方科目", w: 100 }, { l: "借方金額", k: "amount", w: 100 },
                { l: "貸方科目", w: 100 }, { l: "貸方金額", w: 100 }, { l: "証憑", w: 36 }, { l: "信頼度", k: "conf", w: 60 }, { l: "ステータス", w: 72 }, { l: "メモ", w: 90 }
              ].map((h, i) => (
                <th key={i} style={{ padding: "10px 8px", textAlign: i >= 3 && i <= 6 ? "right" : "left", fontSize: 9, fontWeight: 600, color: C.textMut, letterSpacing: ".1em", textTransform: "uppercase", width: h.w, whiteSpace: "nowrap" }}>
                  <span style={{ display: "inline-flex", alignItems: "center" }}>
                    {h.l}{h.k && <SortIcon k={h.k} />}
                  </span>
                </th>
              ))}
              <th style={{ width: 50, padding: "10px 8px" }} />
            </tr>
          </thead>
          <tbody>
            {(compact ? filtered.slice(0, 6) : filtered).map(r => {
              const isEditing = editRow === r.id;
              return (
                <tr key={r.id} onClick={() => !isEditing && setEditRow(r.id)}
                  style={{ borderBottom: `1px solid ${C.borderLt}`, background: isEditing ? `${C.blue}06` : r.st === "要確認" ? `${C.b3}05` : "transparent", cursor: "pointer", transition: "background .15s" }}
                  onMouseEnter={e => { if (!isEditing) e.currentTarget.style.background = `${C.blue}04`; }}
                  onMouseLeave={e => { if (!isEditing) e.currentTarget.style.background = r.st === "要確認" ? `${C.b3}05` : "transparent"; }}>
                  <td style={{ padding: "10px 8px", color: C.textMut, fontWeight: 600 }}>{r.date}</td>
                  <td style={{ padding: "10px 8px", color: C.dark, fontWeight: 600 }}>{r.desc}</td>
                  <td style={{ padding: "10px 8px" }}>
                    {isEditing ? (
                      <select value={r.debitAcc} onChange={e => updateRow(r.id, "debitAcc", e.target.value)} onClick={e => e.stopPropagation()}
                        style={{ border: `1px solid ${C.blue}`, padding: "4px 8px", fontSize: 11, fontFamily: bd, width: "100%", background: "rgba(139,123,244,.04)", color: "#E0DAFF", borderRadius: 12, outline: "none" }}>
                        {accounts.map(a => <option key={a} value={a} style={{ background: "#1a1a2e", color: "#E0DAFF" }}>{a}</option>)}
                      </select>
                    ) : <span style={{ color: C.dark }}>{r.debitAcc}</span>}
                  </td>
                  <td style={{ padding: "10px 8px", textAlign: "right" }}>
                    {isEditing ? (
                      <input type="number" value={r.debit} onChange={e => { const v = parseInt(e.target.value) || 0; updateRow(r.id, "debit", v); updateRow(r.id, "credit", v); }} onClick={e => e.stopPropagation()}
                        style={{ border: `1px solid ${C.blue}`, padding: "4px 8px", fontSize: 11, fontFamily: bd, width: 80, textAlign: "right", background: "rgba(139,123,244,.04)", color: "#E0DAFF", borderRadius: 12, outline: "none" }} />
                    ) : <span style={{ fontWeight: 600 }}>{fmt(r.debit)}</span>}
                  </td>
                  <td style={{ padding: "10px 8px" }}>
                    {isEditing ? (
                      <select value={r.creditAcc} onChange={e => updateRow(r.id, "creditAcc", e.target.value)} onClick={e => e.stopPropagation()}
                        style={{ border: `1px solid ${C.blue}`, padding: "4px 8px", fontSize: 11, fontFamily: bd, width: "100%", background: "rgba(139,123,244,.04)", color: "#E0DAFF", borderRadius: 12, outline: "none" }}>
                        {["現金","普通預金","法人カード","売掛金","買掛金","未払金",...accounts].map(a => <option key={a} value={a} style={{ background: "#1a1a2e", color: "#E0DAFF" }}>{a}</option>)}
                      </select>
                    ) : <span style={{ color: C.textSec }}>{r.creditAcc}</span>}
                  </td>
                  <td style={{ padding: "10px 8px", textAlign: "right", color: C.textSec }}>{fmt(r.credit)}</td>
                  <td style={{ padding: "10px 8px", textAlign: "center" }}>
                    {r.doc ? (
                      <span title="証憑添付済" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 20, height: 20, borderRadius: 6, background: "rgba(123,224,160,.08)", border: "1px solid rgba(123,224,160,.2)" }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#7BE0A0" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>
                      </span>
                    ) : (
                      <span title="証憑未添付" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 20, height: 20, borderRadius: 6, background: "rgba(232,184,75,.06)", border: "1px solid rgba(232,184,75,.15)" }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#E8B84B" strokeWidth="2.5"><path d="M12 9v4M12 17h.01"/></svg>
                      </span>
                    )}
                  </td>
                  <td style={{ padding: "10px 8px", textAlign: "right" }}>
                    <span style={{ fontSize: 10, color: confColor(r.conf), fontWeight: 800 }}>{r.conf}%</span>
                  </td>
                  <td style={{ padding: "10px 8px" }}>
                    <span style={{ fontSize: 9, color: stColor(r.st), fontWeight: 800, letterSpacing: ".04em", padding: "2px 8px", border: `1px solid ${stColor(r.st)}30`, background: `${stColor(r.st)}08` }}>{r.st}</span>
                  </td>
                  <td style={{ padding: "10px 8px" }}>
                    {isEditing ? (
                      <input value={r.memo} onChange={e => updateRow(r.id, "memo", e.target.value)} onClick={e => e.stopPropagation()} placeholder="メモ..."
                        style={{ border: `1px solid ${C.blue}`, padding: "4px 8px", fontSize: 11, fontFamily: bd, width: "100%", background: "rgba(139,123,244,.04)", color: "#E0DAFF", borderRadius: 12, outline: "none" }} />
                    ) : <span style={{ fontSize: 11, color: C.textMut }}>{r.memo}</span>}
                  </td>
                  <td style={{ padding: "10px 8px" }}>
                    {isEditing && (
                      <div style={{ display: "flex", gap: 4 }} onClick={e => e.stopPropagation()}>
                        <button type="button" onClick={() => approveRow(r.id)} style={{ border: "none", background: "rgba(139,123,244,.12)", color: "#C4B8FF", border: "1px solid rgba(139,123,244,.3)", fontSize: 9, fontWeight: 700, padding: "4px 8px", cursor: "pointer", fontFamily: bd }}>OK</button>
                        <button type="button" onClick={() => setEditRow(null)} style={{ border: `1px solid ${C.border}`, background: "transparent", color: C.textMut, fontSize: 9, fontWeight: 600, padding: "4px 6px", cursor: "pointer", fontFamily: bd }}>
                          <svg width="8" height="8" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M2 2l6 6M8 2l-6 6"/></svg>
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div style={{ padding: "14px 28px", borderTop: `1px solid ${C.borderLt}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 11, color: C.textMut }}>合計: {fmt(filtered.reduce((s, r) => s + r.debit, 0))}</span>
        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" onClick={() => { setRows(prev => prev.map(r => r.st === "要確認" ? { ...r, st: "承認済" } : r)); }}
            style={{ padding: "6px 16px", border: "none", background: "rgba(139,123,244,.12)", color: "#C4B8FF", border: "1px solid rgba(139,123,244,.3)", fontSize: 10, fontWeight: 700, cursor: "pointer", fontFamily: bd }}>要確認を全て承認</button>
          <Mag s={{ padding: "6px 16px", border: `1px solid ${C.border}`, background: "transparent", color: C.textSec, fontSize: 10, cursor: "pointer", fontFamily: bd, fontWeight: 700 }}>CSV出力</Mag>
        </div>
      </div>
    </Card3>
  );
}

/* ════════════════════════════════ FILING FORMS ════════════════════════════════ */
const FORM_DEFS = {
    shinkoku: {
      title: "確定申告書B（第一表）", subtitle: "令和7年分 所得税及び復興特別所得税の申告書",
      sections: [
        { heading: "収入金額等", rows: [
          { sec: "ア", l: "事業 営業等", v: 192000000, auto: true, note: "売上高合計から自動" },
          { sec: "イ", l: "事業 農業", v: 0, auto: true },
          { sec: "ウ", l: "不動産", v: 0, auto: true },
          { sec: "エ", l: "利子", v: 24000, auto: true, note: "預金利息" },
          { sec: "オ", l: "配当", v: 0, auto: true },
          { sec: "カ", l: "給与", v: 9600000, auto: false, note: "役員報酬（月80万×12）" },
          { sec: "キ", l: "雑（公的年金等）", v: 0, auto: true },
          { sec: "ク", l: "雑（その他）", v: 360000, auto: false, note: "原稿料・講演料" },
          { sec: "ケ", l: "総合譲渡（短期）", v: 0, auto: true },
          { sec: "コ", l: "総合譲渡（長期）", v: 0, auto: true },
          { sec: "サ", l: "一時", v: 0, auto: true },
        ]},
        { heading: "所得金額等", rows: [
          { sec: "①", l: "事業 営業等", v: 32000000, auto: true, note: "収入-必要経費", calc: true },
          { sec: "②", l: "事業 農業", v: 0, auto: true },
          { sec: "③", l: "不動産", v: 0, auto: true },
          { sec: "④", l: "利子", v: 24000, auto: true },
          { sec: "⑤", l: "配当", v: 0, auto: true },
          { sec: "⑥", l: "給与", v: 7460000, auto: true, note: "給与所得控除後", calc: true },
          { sec: "⑦", l: "雑", v: 360000, auto: true },
          { sec: "⑧", l: "総合譲渡", v: 0, auto: true },
          { sec: "⑨", l: "一時", v: 0, auto: true },
          { sec: "⑫", l: "合計", v: 39844000, auto: true, calc: true, bold: true },
        ]},
        { heading: "所得から差し引かれる金額", rows: [
          { sec: "⑬", l: "雑損控除", v: 0, auto: true },
          { sec: "⑭", l: "医療費控除", v: 0, auto: false },
          { sec: "⑮", l: "社会保険料控除", v: 1680000, auto: true, note: "国保+年金+健保" },
          { sec: "⑯", l: "小規模企業共済等掛金控除", v: 0, auto: false, note: "未加入 → Review参照" },
          { sec: "⑰", l: "生命保険料控除", v: 120000, auto: false },
          { sec: "⑱", l: "地震保険料控除", v: 50000, auto: false },
          { sec: "⑲", l: "寄附金控除", v: 48000, auto: false, note: "ふるさと納税" },
          { sec: "⑳", l: "寡婦、ひとり親控除", v: 0, auto: true },
          { sec: "㉑", l: "勤労学生、障害者控除", v: 0, auto: true },
          { sec: "㉒", l: "配偶者控除", v: 380000, auto: false },
          { sec: "㉓", l: "配偶者特別控除", v: 0, auto: true },
          { sec: "㉔", l: "扶養控除", v: 380000, auto: false, note: "子1人" },
          { sec: "㉕", l: "基礎控除", v: 480000, auto: true, note: "所得2,400万以下" },
          { sec: "㉙", l: "合計", v: 3138000, auto: true, calc: true, bold: true },
        ]},
        { heading: "税金の計算", rows: [
          { sec: "㉚", l: "課税される所得金額", v: 36706000, auto: true, calc: true, bold: true },
          { sec: "㉛", l: "上の㉚に対する税額", v: 8371880, auto: true, calc: true },
          { sec: "㉜", l: "配当控除", v: 0, auto: true },
          { sec: "㉝", l: "（特定増改築等）住宅借入金等特別控除", v: 0, auto: false },
          { sec: "㊱", l: "差引所得税額", v: 8371880, auto: true, calc: true, bold: true },
          { sec: "㊲", l: "復興特別所得税額", v: 175609, auto: true, calc: true, note: "㊱×2.1%" },
          { sec: "㊳", l: "所得税及び復興特別所得税の額", v: 8547489, auto: true, calc: true, bold: true },
          { sec: "㊴", l: "源泉徴収税額", v: 1920000, auto: false, note: "支払調書より" },
          { sec: "㊵", l: "予定納税額（第1期）", v: 0, auto: false },
          { sec: "㊶", l: "予定納税額（第2期）", v: 0, auto: false },
          { sec: "㊹", l: "申告納税額", v: 6627489, auto: true, calc: true, bold: true },
        ]},
      ]
    },
    hojin: {
      title: "法人税 別表一", subtitle: "各事業年度の所得に係る申告書 — 令和7年4月1日〜令和8年3月31日",
      sections: [
        { heading: "所得金額の計算", rows: [
          { sec: "1", l: "所得金額又は欠損金額", v: 32000000, auto: true, bold: true },
          { sec: "1-2", l: "うち留保金額", v: 28000000, auto: true, calc: true },
        ]},
        { heading: "法人税額の計算", rows: [
          { sec: "2", l: "法人税額（所得800万以下 15%）", v: 1200000, auto: true, calc: true },
          { sec: "3", l: "法人税額（所得800万超 23.2%）", v: 5568000, auto: true, calc: true },
          { sec: "4", l: "法人税額計", v: 6768000, auto: true, calc: true, bold: true },
          { sec: "5", l: "控除税額（所得税額等）", v: 192000, auto: false },
          { sec: "6", l: "差引所得に対する法人税額", v: 6576000, auto: true, calc: true, bold: true },
        ]},
        { heading: "中間申告・税額の確定", rows: [
          { sec: "7", l: "特定同族会社の特別税率", v: 0, auto: true },
          { sec: "8", l: "中間申告分の法人税額", v: 3600000, auto: false, note: "前期実績基準" },
          { sec: "9", l: "差引確定法人税額", v: 2976000, auto: true, calc: true },
          { sec: "10", l: "この申告による還付金額", v: 0, auto: true, calc: true },
        ]},
        { heading: "地方法人税", rows: [
          { sec: "11", l: "課税標準法人税額", v: 6576000, auto: true, calc: true },
          { sec: "12", l: "地方法人税額（10.3%）", v: 677328, auto: true, calc: true, note: "11×10.3%" },
          { sec: "13", l: "控除税額", v: 0, auto: true },
          { sec: "14", l: "差引地方法人税額", v: 677328, auto: true, calc: true },
          { sec: "15", l: "中間申告分の地方法人税額", v: 360000, auto: false },
          { sec: "16", l: "差引確定地方法人税額", v: 317328, auto: true, calc: true, bold: true },
        ]},
        { heading: "合計額", rows: [
          { sec: "17", l: "法人税＋地方法人税 合計納付税額", v: 3293328, auto: true, calc: true, bold: true },
        ]},
      ]
    },
    shohi: {
      title: "消費税及び地方消費税申告書", subtitle: "第一表（一般用）— 課税期間 令和7年4月1日〜令和8年3月31日",
      sections: [
        { heading: "課税標準額等の計算", rows: [
          { sec: "①", l: "課税標準額", v: 174545454, auto: true, calc: true, note: "税抜売上" },
          { sec: "②", l: "消費税額", v: 17454546, auto: true, calc: true, note: "①×10%" },
        ]},
        { heading: "控除税額の計算", rows: [
          { sec: "③", l: "控除過大調整税額", v: 0, auto: true },
          { sec: "④", l: "控除対象仕入税額", v: 13200000, auto: true, note: "仕入税額控除合計" },
          { sec: "⑤", l: "返還等対価に係る税額", v: 0, auto: false },
          { sec: "⑥", l: "貸倒れに係る税額", v: 0, auto: false },
          { sec: "⑦", l: "控除税額小計", v: 13200000, auto: true, calc: true },
          { sec: "⑧", l: "控除不足還付税額", v: 0, auto: true, calc: true },
        ]},
        { heading: "差引税額", rows: [
          { sec: "⑨", l: "差引税額", v: 4254546, auto: true, calc: true, bold: true },
          { sec: "⑩", l: "中間納付税額", v: 2400000, auto: false },
          { sec: "⑪", l: "中間納付還付税額", v: 0, auto: true, calc: true },
          { sec: "⑫", l: "納付税額", v: 1854546, auto: true, calc: true, bold: true },
        ]},
        { heading: "地方消費税の計算", rows: [
          { sec: "⑬〜⑲", l: "譲渡割額の計算過程", v: null, auto: true, note: "内訳は別紙" },
          { sec: "⑳", l: "差引譲渡割額", v: 1063636, auto: true, calc: true, note: "消費税額×22/78" },
          { sec: "㉑", l: "中間納付譲渡割額", v: 600000, auto: false },
          { sec: "㉒", l: "納付譲渡割額", v: 463636, auto: true, calc: true },
        ]},
        { heading: "消費税及び地方消費税の合計", rows: [
          { sec: "㉓", l: "消費税額合計", v: 1854546, auto: true, calc: true },
          { sec: "㉔", l: "地方消費税額合計", v: 463636, auto: true, calc: true },
          { sec: "㉕", l: "中間納付税額合計", v: 3000000, auto: true, calc: true },
          { sec: "㉖", l: "合計差引納付（還付）税額", v: 2318182, auto: true, calc: true, bold: true },
        ]},
      ]
    },
    bs: {
      title: "貸借対照表", subtitle: "令和8年3月31日現在 — クライアント名",
      sections: [
        { heading: "資産の部 — 流動資産", rows: [
          { sec: "A1", l: "現金及び預金", v: 24800000, auto: true, note: "普通預金＋当座預金" },
          { sec: "A2", l: "売掛金", v: 18500000, auto: true, note: "12月〜3月未回収分" },
          { sec: "A3", l: "商品・製品", v: 0, auto: true },
          { sec: "A4", l: "前払費用", v: 2400000, auto: true, note: "保険料・サーバー費前払" },
          { sec: "A5", l: "未収入金", v: 360000, auto: false, note: "原稿料未収" },
          { sec: "A6", l: "流動資産合計", v: 46060000, auto: true, calc: true, bold: true },
        ]},
        { heading: "資産の部 — 固定資産", rows: [
          { sec: "A7", l: "建物（純額）", v: 0, auto: true },
          { sec: "A8", l: "工具器具備品（純額）", v: 3200000, auto: true, note: "サーバー・PC等" },
          { sec: "A9", l: "ソフトウェア", v: 8500000, auto: true, note: "自社SaaS開発費" },
          { sec: "A10", l: "敷金・保証金", v: 2400000, auto: false, note: "オフィス保証金" },
          { sec: "A11", l: "固定資産合計", v: 14100000, auto: true, calc: true, bold: true },
        ]},
        { heading: "資産の部 合計", rows: [
          { sec: "A12", l: "資産合計", v: 60160000, auto: true, calc: true, bold: true },
        ]},
        { heading: "負債の部 — 流動負債", rows: [
          { sec: "L1", l: "買掛金", v: 4800000, auto: true, note: "外注費未払" },
          { sec: "L2", l: "未払金", v: 2100000, auto: true, note: "経費未払分" },
          { sec: "L3", l: "未払法人税等", v: 3293328, auto: true, calc: true, note: "法人税＋地方法人税" },
          { sec: "L4", l: "未払消費税等", v: 2318182, auto: true, calc: true },
          { sec: "L5", l: "預り金", v: 680000, auto: true, note: "源泉所得税・住民税" },
          { sec: "L6", l: "流動負債合計", v: 13191510, auto: true, calc: true, bold: true },
        ]},
        { heading: "負債の部 — 固定負債", rows: [
          { sec: "L7", l: "長期借入金", v: 12000000, auto: false, note: "日本政策金融公庫" },
          { sec: "L8", l: "固定負債合計", v: 12000000, auto: true, calc: true, bold: true },
        ]},
        { heading: "負債合計", rows: [
          { sec: "L9", l: "負債合計", v: 25191510, auto: true, calc: true, bold: true },
        ]},
        { heading: "純資産の部", rows: [
          { sec: "E1", l: "資本金", v: 10000000, auto: false },
          { sec: "E2", l: "資本剰余金", v: 0, auto: true },
          { sec: "E3", l: "利益剰余金", v: 24968490, auto: true, calc: true, note: "前期繰越＋当期純利益" },
          { sec: "E4", l: "純資産合計", v: 34968490, auto: true, calc: true, bold: true },
        ]},
        { heading: "負債・純資産合計", rows: [
          { sec: "T1", l: "負債及び純資産合計", v: 60160000, auto: true, calc: true, bold: true },
        ]},
      ]
    },
    pl: {
      title: "損益計算書", subtitle: "令和7年4月1日〜令和8年3月31日 — クライアント名",
      sections: [
        { heading: "売上高", rows: [
          { sec: "P1", l: "売上高", v: 192000000, auto: true, bold: true, note: "SaaS＋受託開発" },
        ]},
        { heading: "売上原価", rows: [
          { sec: "P2", l: "外注費", v: 48000000, auto: true, note: "開発外注" },
          { sec: "P3", l: "サーバー・インフラ費", v: 14400000, auto: true, note: "AWS・GCP等" },
          { sec: "P4", l: "売上原価合計", v: 62400000, auto: true, calc: true, bold: true },
        ]},
        { heading: "売上総利益", rows: [
          { sec: "P5", l: "売上総利益", v: 129600000, auto: true, calc: true, bold: true, note: "粗利率67.5%" },
        ]},
        { heading: "販売費及び一般管理費", rows: [
          { sec: "P6", l: "役員報酬", v: 9600000, auto: false, note: "月80万×12" },
          { sec: "P7", l: "給料手当", v: 42000000, auto: true, note: "従業員6名" },
          { sec: "P8", l: "法定福利費", v: 6300000, auto: true, calc: true },
          { sec: "P9", l: "地代家賃", v: 7200000, auto: false, note: "月60万" },
          { sec: "P10", l: "通信費", v: 3600000, auto: true },
          { sec: "P11", l: "広告宣伝費", v: 4800000, auto: true },
          { sec: "P12", l: "減価償却費", v: 5400000, auto: true, calc: true },
          { sec: "P13", l: "交際費", v: 7264000, auto: false, note: "限度額注意" },
          { sec: "P14", l: "その他販管費", v: 11436000, auto: true },
          { sec: "P15", l: "販管費合計", v: 97600000, auto: true, calc: true, bold: true },
        ]},
        { heading: "営業利益", rows: [
          { sec: "P16", l: "営業利益", v: 32000000, auto: true, calc: true, bold: true, note: "営業利益率16.7%" },
        ]},
        { heading: "営業外損益", rows: [
          { sec: "P17", l: "受取利息", v: 24000, auto: true },
          { sec: "P18", l: "支払利息", v: 360000, auto: true, note: "借入金利息" },
          { sec: "P19", l: "営業外損益計", v: -336000, auto: true, calc: true },
        ]},
        { heading: "経常利益・税引前", rows: [
          { sec: "P20", l: "経常利益", v: 31664000, auto: true, calc: true, bold: true },
          { sec: "P21", l: "特別利益", v: 0, auto: true },
          { sec: "P22", l: "特別損失", v: 0, auto: true },
          { sec: "P23", l: "税引前当期純利益", v: 31664000, auto: true, calc: true, bold: true },
        ]},
        { heading: "法人税等・当期純利益", rows: [
          { sec: "P24", l: "法人税・住民税・事業税", v: 9568490, auto: true, calc: true },
          { sec: "P25", l: "当期純利益", v: 22095510, auto: true, calc: true, bold: true },
        ]},
      ]
    },
    kotei: {
      title: "固定資産台帳", subtitle: "減価償却資産の明細 — 令和8年3月31日現在", cat: "決算整理",
      sections: [
        { heading: "建物", rows: [
          { sec: "K1", l: "該当なし", v: 0, auto: true },
        ]},
        { heading: "工具器具備品", rows: [
          { sec: "K2", l: "サーバー機器（Dell PowerEdge）", v: 2800000, auto: true, note: "R6.6取得 耐用5年 定率法" },
          { sec: "K3", l: "  取得価額", v: 4200000, auto: true },
          { sec: "K4", l: "  期首帳簿価額", v: 3360000, auto: true, calc: true },
          { sec: "K5", l: "  当期償却額", v: 1120000, auto: true, calc: true, note: "償却率0.400" },
          { sec: "K6", l: "  期末帳簿価額", v: 2240000, auto: true, calc: true },
          { sec: "K7", l: "ノートPC×8台（MacBook Pro）", v: 960000, auto: true, note: "R6.10取得 耐用4年 定率法" },
          { sec: "K8", l: "  取得価額", v: 2400000, auto: false, note: "30万×8台" },
          { sec: "K9", l: "  当期償却額", v: 1200000, auto: true, calc: true, note: "償却率0.500" },
          { sec: "K10", l: "  期末帳簿価額", v: 960000, auto: true, calc: true },
        ]},
        { heading: "ソフトウェア", rows: [
          { sec: "K11", l: "自社SaaSプラットフォーム開発費", v: 8500000, auto: true, note: "R5.4取得 耐用5年 定額法" },
          { sec: "K12", l: "  取得価額", v: 15000000, auto: true },
          { sec: "K13", l: "  当期償却額", v: 3000000, auto: true, calc: true, note: "年300万" },
          { sec: "K14", l: "  期末帳簿価額", v: 8500000, auto: true, calc: true },
        ]},
        { heading: "償却費合計", rows: [
          { sec: "K15", l: "当期減価償却費合計", v: 5320000, auto: true, calc: true, bold: true },
          { sec: "K16", l: "固定資産期末残高合計", v: 11700000, auto: true, calc: true, bold: true },
        ]},
      ]
    },
    kubun: {
      title: "消費税区分別表", subtitle: "課税区分別取引集計 — 令和7年4月〜令和8年3月", cat: "決算整理",
      sections: [
        { heading: "売上（出力）", rows: [
          { sec: "Z1", l: "課税売上（10%）", v: 189600000, auto: true, note: "標準税率" },
          { sec: "Z2", l: "課税売上（8%軽減）", v: 0, auto: true },
          { sec: "Z3", l: "非課税売上", v: 2400000, auto: true, note: "受取利息等" },
          { sec: "Z4", l: "不課税売上", v: 0, auto: true },
          { sec: "Z5", l: "売上合計", v: 192000000, auto: true, calc: true, bold: true },
        ]},
        { heading: "仕入（入力）", rows: [
          { sec: "Z6", l: "課税仕入（10%）", v: 128400000, auto: true, note: "標準税率" },
          { sec: "Z7", l: "課税仕入（8%軽減）", v: 3600000, auto: true, note: "福利厚生費（飲食等）" },
          { sec: "Z8", l: "非課税仕入", v: 7200000, auto: true, note: "地代家賃" },
          { sec: "Z9", l: "不課税仕入", v: 20800000, auto: true, note: "給与・社保等" },
          { sec: "Z10", l: "仕入合計", v: 160000000, auto: true, calc: true, bold: true },
        ]},
        { heading: "インボイス対応状況", rows: [
          { sec: "Z11", l: "適格請求書あり（控除可能）", v: 125800000, auto: true, note: "98.0%" },
          { sec: "Z12", l: "適格請求書なし（経過措置80%）", v: 2600000, auto: false, note: "控除額: 208万" },
          { sec: "Z13", l: "免税事業者取引", v: 0, auto: true },
          { sec: "Z14", l: "仕入税額控除合計", v: 13200000, auto: true, calc: true, bold: true },
        ]},
        { heading: "消費税額サマリー", rows: [
          { sec: "Z15", l: "課税標準額に対する消費税額", v: 17454546, auto: true, calc: true },
          { sec: "Z16", l: "控除対象仕入税額", v: 13200000, auto: true, calc: true },
          { sec: "Z17", l: "差引納付消費税額", v: 4254546, auto: true, calc: true, bold: true },
        ]},
      ]
    },
    uchiwake: {
      title: "内訳書・概況書", subtitle: "勘定科目内訳明細書 / 法人事業概況説明書", cat: "提出書類",
      sections: [
        { heading: "預貯金等の内訳", rows: [
          { sec: "U1", l: "三菱UFJ銀行 渋谷支店 普通", v: 18200000, auto: true, note: "メイン口座" },
          { sec: "U2", l: "三井住友銀行 新宿支店 普通", v: 4100000, auto: true, note: "経費決済用" },
          { sec: "U3", l: "住信SBIネット銀行 普通", v: 2500000, auto: true, note: "ネットバンキング" },
          { sec: "U4", l: "預貯金合計", v: 24800000, auto: true, calc: true, bold: true },
        ]},
        { heading: "売掛金の内訳", rows: [
          { sec: "U5", l: "株式会社NTTデータ", v: 8500000, auto: true, note: "SaaSライセンス 3月末入金" },
          { sec: "U6", l: "ソフトバンク株式会社", v: 5200000, auto: true, note: "受託開発 4月入金" },
          { sec: "U7", l: "株式会社リクルート", v: 3200000, auto: true, note: "API利用料 3月末" },
          { sec: "U8", l: "その他（5社）", v: 1600000, auto: true },
          { sec: "U9", l: "売掛金合計", v: 18500000, auto: true, calc: true, bold: true },
        ]},
        { heading: "買掛金・未払金の内訳", rows: [
          { sec: "U10", l: "フリーランスエンジニア（3名）", v: 2800000, auto: true, note: "外注費" },
          { sec: "U11", l: "AWS Japan", v: 1200000, auto: true, note: "インフラ費" },
          { sec: "U12", l: "その他未払金", v: 2900000, auto: true },
          { sec: "U13", l: "買掛金・未払金合計", v: 6900000, auto: true, calc: true, bold: true },
        ]},
        { heading: "事業概況", rows: [
          { sec: "U14", l: "主たる業種", v: null, auto: true, note: "情報通信業 — SaaS開発・販売" },
          { sec: "U15", l: "従業員数（期末）", v: 6, auto: false, note: "正社員5名＋パート1名" },
          { sec: "U16", l: "主要取引先", v: null, auto: true, note: "NTTデータ、ソフトバンク、リクルート" },
          { sec: "U17", l: "経理方式", v: null, auto: true, note: "税抜経理方式・発生主義" },
        ]},
      ]
    },
    shokyaku: {
      title: "償却資産申告書", subtitle: "固定資産税（償却資産）申告書 — 令和8年度", cat: "提出書類",
      sections: [
        { heading: "前年前取得のもの", rows: [
          { sec: "S1", l: "サーバー機器（Dell PowerEdge）", v: 4200000, auto: true, note: "R6.6取得 耐用5年" },
          { sec: "S2", l: "  評価額", v: 2772000, auto: true, calc: true, note: "減価残存率0.658適用" },
        ]},
        { heading: "前年中取得のもの", rows: [
          { sec: "S3", l: "ノートPC×8台（MacBook Pro）", v: 2400000, auto: true, note: "R6.10取得 耐用4年" },
          { sec: "S4", l: "  評価額（半年償却）", v: 1896000, auto: true, calc: true, note: "取得価額×0.790" },
        ]},
        { heading: "合計", rows: [
          { sec: "S5", l: "資産の総額（取得価額）", v: 6600000, auto: true, calc: true, bold: true },
          { sec: "S6", l: "課税標準額", v: 4668000, auto: true, calc: true, bold: true },
          { sec: "S7", l: "算出税額（1.4%）", v: 65352, auto: true, calc: true, note: "4,668,000×1.4%" },
          { sec: "S8", l: "免税点（150万円）", v: null, auto: true, note: "課税標準額 > 150万 → 課税" },
        ]},
      ]
    },
    shiharai: {
      title: "支払調書", subtitle: "報酬・料金等の支払調書 — 令和7年分", cat: "提出書類",
      sections: [
        { heading: "フリーランスエンジニア", rows: [
          { sec: "H1", l: "田中 一郎（個人・T1234567890123）", v: 4800000, auto: true, note: "源泉徴収: ¥490,368" },
          { sec: "H2", l: "  支払金額", v: 4800000, auto: true },
          { sec: "H3", l: "  源泉徴収税額", v: 490368, auto: true, calc: true, note: "100万以下10.21%+超過20.42%" },
          { sec: "H4", l: "佐藤 花子（個人・T9876543210987）", v: 3600000, auto: true, note: "源泉徴収: ¥367,560" },
          { sec: "H5", l: "  支払金額", v: 3600000, auto: true },
          { sec: "H6", l: "  源泉徴収税額", v: 367560, auto: true, calc: true },
        ]},
        { heading: "デザイナー・コンサルタント", rows: [
          { sec: "H7", l: "高橋デザイン事務所", v: 2400000, auto: true, note: "UI/UXデザイン委託" },
          { sec: "H8", l: "  源泉徴収税額", v: 245040, auto: true, calc: true },
          { sec: "H9", l: "山本会計事務所", v: 1200000, auto: true, note: "税務顧問料" },
          { sec: "H10", l: "  源泉徴収税額", v: 122520, auto: true, calc: true },
        ]},
        { heading: "合計", rows: [
          { sec: "H11", l: "支払金額合計", v: 12000000, auto: true, calc: true, bold: true },
          { sec: "H12", l: "源泉徴収税額合計", v: 1225488, auto: true, calc: true, bold: true },
          { sec: "H13", l: "提出対象者数", v: 4, auto: true, note: "年5万円超の報酬支払先" },
        ]},
      ]
    },
    tsukijime: {
      title: "月締め", subtitle: "月次決算チェックリスト — 令和8年2月度", cat: "締め作業",
      sections: [
        { heading: "仕訳・帳簿", rows: [
          { sec: "M1", l: "全仕訳の入力完了", v: null, auto: true, note: "✓ 完了 — 2/25確認" },
          { sec: "M2", l: "未承認仕訳の確認", v: 0, auto: true, note: "✓ 残り0件" },
          { sec: "M3", l: "証憑の添付確認", v: 2, auto: false, note: "⚠ 2件未添付" },
          { sec: "M4", l: "消費税区分の確認", v: 4, auto: false, note: "⚠ 4件仮設定" },
        ]},
        { heading: "残高確認", rows: [
          { sec: "M5", l: "銀行残高照合", v: null, auto: true, note: "✓ 一致確認済" },
          { sec: "M6", l: "売掛金の回収確認", v: null, auto: true, note: "✓ 入金消込完了" },
          { sec: "M7", l: "買掛金の支払確認", v: null, auto: true, note: "✓ 2/28支払予定分確認" },
          { sec: "M8", l: "仮勘定の精算", v: 1, auto: false, note: "⚠ 仮払金1件未精算" },
        ]},
        { heading: "月次レポート", rows: [
          { sec: "M9", l: "月次試算表の出力", v: null, auto: true, note: "✓ 生成済" },
          { sec: "M10", l: "前月比較分析", v: null, auto: true, note: "✓ 営業利益+8.2%" },
          { sec: "M11", l: "月次報告の承認", v: null, auto: false, note: "→ 代表承認待ち" },
        ]},
      ]
    },
    nendojime: {
      title: "年度締め", subtitle: "決算締め処理 — 令和7年度（R7.4.1〜R8.3.31）", cat: "締め作業",
      sections: [
        { heading: "決算整理仕訳", rows: [
          { sec: "Y1", l: "減価償却費の計上", v: 5320000, auto: true, calc: true, note: "✓ 自動計算済" },
          { sec: "Y2", l: "貸倒引当金の計上", v: 185000, auto: true, calc: true, note: "売掛金×1%" },
          { sec: "Y3", l: "賞与引当金の計上", v: 3500000, auto: false, note: "→ 未計上" },
          { sec: "Y4", l: "前払費用の振替", v: 2400000, auto: true, note: "✓ 計上済" },
          { sec: "Y5", l: "未払費用の計上", v: 2100000, auto: true, note: "✓ 計上済" },
        ]},
        { heading: "税金計算", rows: [
          { sec: "Y6", l: "法人税等の計上", v: 9568490, auto: true, calc: true, note: "✓ 確定" },
          { sec: "Y7", l: "消費税の確定", v: 2318182, auto: true, calc: true, note: "✓ 確定" },
          { sec: "Y8", l: "事業税の計上", v: 1920000, auto: true, calc: true },
        ]},
        { heading: "締め処理ステータス", rows: [
          { sec: "Y9", l: "残高試算表の確認", v: null, auto: true, note: "✓ BS/PL一致" },
          { sec: "Y10", l: "勘定科目内訳書の作成", v: null, auto: true, note: "✓ 完了" },
          { sec: "Y11", l: "税務申告書の作成", v: null, auto: true, note: "⚠ 進行中 65%" },
          { sec: "Y12", l: "年度締めの確定（ロック）", v: null, auto: false, note: "→ 未実行" },
        ]},
      ]
    },
    denchoho: {
      title: "電子帳簿保存法 対応ステータスレポート", subtitle: "電帳法準拠状況 — 令和7年度",
      sections: [
        { heading: "電子帳簿等保存（区分1）", rows: [
          { sec: "D1", l: "仕訳帳の電子保存", v: null, auto: true, note: "✓ 対応済" },
          { sec: "D2", l: "総勘定元帳の電子保存", v: null, auto: true, note: "✓ 対応済" },
          { sec: "D3", l: "訂正削除履歴の保持", v: null, auto: true, note: "✓ 対応済" },
          { sec: "D4", l: "相互関連性の確保", v: null, auto: true, note: "✓ 対応済" },
          { sec: "D5", l: "検索機能（日付・金額・取引先）", v: null, auto: true, note: "✓ 対応済" },
          { sec: "D6", l: "ダウンロード要件", v: null, auto: true, note: "✓ 対応済" },
        ]},
        { heading: "スキャナ保存（区分2）", rows: [
          { sec: "S1", l: "解像度 200dpi以上", v: null, auto: true, note: "✓ 自動確認" },
          { sec: "S2", l: "タイムスタンプ付与", v: null, auto: true, note: "✓ 自動付与" },
          { sec: "S3", l: "入力期間制限（概ね7営業日）", v: null, auto: true, note: "⚠ 2件超過" },
          { sec: "S4", l: "適正事務処理要件", v: null, auto: true, note: "✓ 対応済" },
          { sec: "S5", l: "バージョン管理", v: null, auto: true, note: "✓ 対応済" },
        ]},
        { heading: "電子取引データ保存（区分3）", rows: [
          { sec: "E1", l: "電子取引データの電子保存", v: null, auto: true, note: "✓ 義務対応済" },
          { sec: "E2", l: "真実性の確保（改ざん防止）", v: null, auto: true, note: "✓ 対応済" },
          { sec: "E3", l: "可視性の確保", v: null, auto: true, note: "✓ 対応済" },
          { sec: "E4", l: "タイムスタンプ付与", v: null, auto: true, note: "✓ 12/12件" },
          { sec: "E5", l: "ファイル命名規則の統一", v: null, auto: false, note: "⚠ 3件未整形" },
          { sec: "E6", l: "検索要件（3項目）", v: null, auto: true, note: "✓ 対応済" },
        ]},
        { heading: "証憑管理サマリー", rows: [
          { sec: "C1", l: "証憑添付率", v: 67, auto: true, note: "12/18件", bold: true },
          { sec: "C2", l: "未添付（要対応）", v: 6, auto: true, note: "⚠ 6件" },
          { sec: "C3", l: "タイムスタンプ付与率", v: 100, auto: true, note: "12/12件" },
          { sec: "C4", l: "ファイル命名規則準拠率", v: 75, auto: true, note: "9/12件" },
          { sec: "C5", l: "重加算税リスク", v: null, auto: true, note: "✓ 低リスク" },
        ]},
      ]
    },
  };

function FilingForms() {
  const formDefs = FORM_DEFS;

  const [activeForm, setActiveForm] = useState("shinkoku");
  const [edits, setEdits] = useState({});
  const [editingCell, setEditingCell] = useState(null);
  const [editBuf, setEditBuf] = useState("");

  const form = formDefs[activeForm];
  const allRows = form.sections.flatMap(s => s.rows);
  const filledCount = allRows.filter(r => r.v !== null && r.v !== 0).length;
  const editedCount = Object.keys(edits).filter(k => k.startsWith(activeForm)).length;

  const getVal = (sec) => {
    const key = `${activeForm}:${sec}`;
    return edits[key] !== undefined ? edits[key] : allRows.find(r => r.sec === sec)?.v;
  };

  const startEdit = (sec, val) => {
    setEditingCell(sec);
    setEditBuf(val !== null && val !== undefined ? String(val) : "");
  };

  const commitEdit = (sec) => {
    const key = `${activeForm}:${sec}`;
    const num = editBuf === "" ? null : Number(editBuf.replace(/,/g, ""));
    if (!isNaN(num)) setEdits(prev => ({ ...prev, [key]: num }));
    setEditingCell(null);
  };

  const fmtV = (v) => v === null ? "—" : typeof v === "number" ? v.toLocaleString() : v;

  const formKeys = Object.keys(formDefs);
  const cats = [
    { label: "決算整理", keys: ["kotei", "kubun"] },
    { label: "提出書類", keys: ["bs", "pl", "shinkoku", "hojin", "shohi", "uchiwake", "shokyaku", "shiharai"] },
    { label: "締め作業", keys: ["tsukijime", "nendojime"] },
  ];

  return (
    <Card3 s={{ padding: 0, marginBottom: 20, overflow: "hidden" }}>
      <div style={{ display: "flex", minHeight: 600 }}>
        {/* Sidebar */}
        <div style={{ width: 210, borderRight: `1px solid ${C.border}`, background: "rgba(139,123,244,.02)", flexShrink: 0, padding: "12px 0", overflow: "auto" }}>
          {cats.map((cat, ci) => (
            <div key={ci} style={{ marginBottom: 8 }}>
              <div style={{ padding: "8px 18px 4px", fontSize: 9, color: "rgba(168,155,255,.4)", fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase" }}>{cat.label}</div>
              {cat.keys.map(k => {
                const f = formDefs[k], active = k === activeForm;
                const total = f.sections.flatMap(s => s.rows).length;
                const filled = f.sections.flatMap(s => s.rows).filter(r => r.v !== null && r.v !== 0).length;
                return (
                  <button key={k} type="button" onClick={() => { setActiveForm(k); setEditingCell(null); }}
                    style={{ display: "block", width: "calc(100% - 12px)", margin: "1px 6px", padding: "8px 12px", border: active ? "1px solid rgba(139,123,244,.25)" : "1px solid transparent", borderRadius: 10, background: active ? "rgba(139,123,244,.08)" : "transparent", cursor: "pointer", fontFamily: bd, transition: "all .2s", textAlign: "left" }}>
                    <div style={{ fontSize: 12, fontWeight: active ? 700 : 500, color: active ? "#C4B8FF" : C.textSec, letterSpacing: "-.01em", textShadow: active ? "0 0 8px rgba(168,155,255,.3)" : "none" }}>
                      {f.title.split("（")[0].split("別表")[0].split("及び")[0].trim()}
                    </div>
                    <div style={{ fontSize: 9, color: active ? "rgba(168,155,255,.5)" : C.textMut, marginTop: 1 }}>
                      {filled}/{total}
                    </div>
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Main content */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>

      {/* Form title bar */}
      <div style={{ padding: "16px 28px", background: `${C.blue}04`, borderBottom: `1px solid ${C.borderLt}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontFamily: hd, fontSize: 20, fontWeight: 600, color: C.dark, letterSpacing: "-.02em" }}>{form.title}</div>
          <div style={{ fontSize: 10, color: C.textMut, marginTop: 2 }}>{form.subtitle}</div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {editedCount > 0 && (
            <span style={{ fontSize: 9, color: C.b2, fontWeight: 800, letterSpacing: ".06em", padding: "3px 10px", border: `1.5px solid ${C.b2}`, display: "flex", alignItems: "center", gap: 4 }}>
              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 20h9M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4z"/></svg>
              {editedCount}件 手動修正
            </span>
          )}
          <Mag s={{ padding: "6px 16px", border: `1px solid ${C.border}`, background: C.surface, color: C.textSec, fontSize: 10, cursor: "pointer", fontFamily: bd, fontWeight: 700 }}>PDF出力</Mag>
          <BtnApprove s={{ padding: "6px 16px", border: "none", background: "rgba(139,123,244,.12)", color: "#C4B8FF", border: "1px solid rgba(139,123,244,.3)", fontSize: 10, cursor: "pointer", fontFamily: bd, fontWeight: 700, boxShadow: "0 0 14px rgba(139,123,244,.3), 0 0 36px rgba(139,123,244,.1)" }}>e-Tax送信</BtnApprove>
        </div>
      </div>

      {/* Column headers */}
      <div style={{ display: "grid", gridTemplateColumns: "44px 1fr 160px 110px", padding: "8px 28px", background: C.surfAlt, borderBottom: `1px solid ${C.border}`, fontSize: 9, color: C.textMut, fontWeight: 500, letterSpacing: ".1em", textTransform: "uppercase" }}>
        <span>欄</span><span>項目名</span><span style={{ textAlign: "right" }}>金額（円）</span><span style={{ textAlign: "center" }}>ステータス</span>
      </div>

      {/* Form body */}
      <div style={{ maxHeight: 520, overflow: "auto" }}>
        {form.sections.map((sec, si) => (
          <div key={si}>
            {/* Section heading */}
            <div style={{ padding: "10px 28px 8px", background: `${C.blue}05`, borderBottom: `1px solid ${C.borderLt}`, borderTop: si > 0 ? `2px solid ${C.border}` : "none" }}>
              <span style={{ fontSize: 10, color: C.b1, fontWeight: 800, letterSpacing: ".08em" }}>{sec.heading}</span>
            </div>

            {/* Rows */}
            {sec.rows.map((r, ri) => {
              const key = `${activeForm}:${r.sec}`;
              const isEdited = edits[key] !== undefined;
              const displayVal = isEdited ? edits[key] : r.v;
              const isEditing = editingCell === r.sec;

              return (
                <div key={ri}
                  style={{
                    display: "grid", gridTemplateColumns: "44px 1fr 160px 110px", alignItems: "center",
                    padding: "0 28px", minHeight: 40,
                    borderBottom: `1px solid ${C.borderLt}`,
                    background: isEditing ? `${C.blue}08` : isEdited ? `${C.b2}04` : r.bold ? `${C.b1}03` : ri % 2 === 0 ? "transparent" : `${C.blue}01`,
                    transition: "background .15s",
                  }}
                  onMouseEnter={e => { if (!isEditing && !r.calc) e.currentTarget.style.background = `${C.blue}06`; }}
                  onMouseLeave={e => { if (!isEditing) e.currentTarget.style.background = isEdited ? `${C.b2}04` : r.bold ? `${C.b1}03` : ri % 2 === 0 ? "transparent" : `${C.blue}01`; }}
                >
                  {/* Section number */}
                  <span style={{ fontSize: 11, color: C.b2, fontWeight: 800, textAlign: "center" }}>{r.sec}</span>

                  {/* Label + note */}
                  <div style={{ padding: "8px 0" }}>
                    <span style={{ fontSize: 12, color: r.bold ? C.b1 : C.dark, fontWeight: r.bold ? 800 : 500 }}>{r.l}</span>
                    {r.note && <span style={{ fontSize: 9, color: C.textMut, marginLeft: 8 }}>— {r.note}</span>}
                  </div>

                  {/* Value — editable cell */}
                  <div style={{ textAlign: "right", padding: "4px 0" }}>
                    {isEditing ? (
                      <input
                        autoFocus
                        value={editBuf}
                        onChange={e => setEditBuf(e.target.value)}
                        onBlur={() => commitEdit(r.sec)}
                        onKeyDown={e => { if (e.key === "Enter") commitEdit(r.sec); if (e.key === "Escape") setEditingCell(null); }}
                        style={{
                          width: "100%", textAlign: "right", padding: "4px 8px",
                          border: `2px solid ${C.blue}`, outline: "none", fontSize: 13, fontWeight: 700,
                          fontFamily: bd, background: C.surface, color: C.dark,
                          boxShadow: "0 0 0 3px rgba(139,123,244,.12)",
                        }}
                      />
                    ) : (
                      <span
                        onClick={() => { if (!r.calc) startEdit(r.sec, displayVal); }}
                        style={{
                          display: "inline-block", padding: "4px 8px", minWidth: 80,
                          fontSize: 13, fontWeight: r.bold ? 800 : 600,
                          fontFamily: r.bold ? mono : bd, letterSpacing: r.bold ? "-.02em" : 0,
                          color: displayVal === null || displayVal === 0 ? C.textMut : r.bold ? C.b1 : C.dark,
                          cursor: r.calc ? "default" : "pointer",
                          borderBottom: r.calc ? "none" : `1px dashed ${C.borderLt}`,
                          transition: "all .15s",
                        }}
                      >
                        {fmtV(displayVal)}
                      </span>
                    )}
                  </div>

                  {/* Status badge */}
                  <div style={{ textAlign: "center" }}>
                    {isEdited ? (
                      <span style={{ fontSize: 8, color: C.b2, fontWeight: 800, letterSpacing: ".06em", padding: "2px 8px", background: "rgba(139,123,244,.03)", display: "inline-flex", alignItems: "center", gap: 3 }}>
                        <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 20h9M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4z"/></svg>
                        手動修正
                      </span>
                    ) : r.calc ? (
                      <span style={{ fontSize: 8, color: C.b3, fontWeight: 700, letterSpacing: ".06em", padding: "2px 8px", background: `${C.b3}08` }}>自動計算</span>
                    ) : r.v !== null && r.v !== 0 ? (
                      <span style={{ fontSize: 8, color: C.b4, fontWeight: 700, letterSpacing: ".06em", padding: "2px 8px", background: `${C.b5}60` }}>入力済</span>
                    ) : (
                      <span style={{ fontSize: 8, color: C.muted, fontWeight: 700, letterSpacing: ".06em", padding: "2px 8px" }}>未入力</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ padding: "14px 28px", borderTop: `2px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", background: `${C.blue}02` }}>
        <div style={{ display: "flex", gap: 20, fontSize: 10, color: C.textMut }}>
          <span>{filledCount}/{allRows.length} 入力済</span>
          {editedCount > 0 && <span style={{ color: C.b2, fontWeight: 700 }}>{editedCount}件 手動修正済</span>}
          <span>自動計算: {allRows.filter(r => r.calc).length}項目</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {editedCount > 0 && (
            <button type="button" onClick={() => { const next = {}; Object.keys(edits).forEach(k => { if (!k.startsWith(activeForm)) next[k] = edits[k]; }); setEdits(next); }}
              style={{ padding: "6px 16px", border: `1px solid ${C.border}`, background: C.surface, color: C.textSec, fontSize: 10, fontWeight: 700, cursor: "pointer", fontFamily: bd }}>修正をリセット</button>
          )}
          <BtnApprove s={{ padding: "6px 16px", border: "none", background: C.b1, color: "#0A0A0A", fontSize: 10, cursor: "pointer", fontFamily: bd, fontWeight: 700, letterSpacing: ".04em" }}>保存して確定</BtnApprove>
        </div>
      </div>
      </div>{/* end main content */}
      </div>{/* end flex */}
    </Card3>
  );
}

/* ════════════════════════════════ MONTHLY LEDGER ════════════════════════════════ */
function MonthlyLedger() {
  const months = ["4月","5月","6月","7月","8月","9月","10月","11月","12月","1月","2月","3月"];

  const initData = {
    "収入": {
      "現金売上":  [7000000,7500000,7200000,8000000,0,0,0,0,0,0,0,0],
      "掛売上":    [5000000,6000000,5500000,0,0,0,0,0,0,0,0,0],
      "家事消費等": [0,0,0,0,0,0,0,0,0,0,0,0],
    },
    "経費": {
      "現金仕入":  [0,0,0,0,0,0,0,0,0,0,0,0],
      "掛仕入":    [6000000,5000000,4500000,0,0,0,0,0,0,0,0,0],
      "租税公課":  [0,0,0,0,0,0,0,0,0,0,0,0],
      "荷造運賃":  [0,0,0,0,0,0,0,0,0,0,0,0],
      "水道光熱費": [300000,310000,310000,0,0,0,0,0,0,0,0,0],
      "旅費交通費": [100000,100000,0,0,0,0,0,0,0,0,0,0],
      "通信費":    [150000,120000,130000,0,0,0,0,0,0,0,0,0],
      "広告宣伝費": [150000,120000,120000,0,0,0,0,0,0,0,0,0],
      "接待交際費": [0,0,0,0,0,0,0,0,0,0,0,0],
      "損害保険料": [0,0,0,0,0,0,0,0,0,0,0,0],
      "修繕費":    [100000,150000,150000,450000,0,0,0,0,0,0,0,0],
      "減価償却費": [0,0,0,0,0,0,0,0,0,0,0,0],
      "福利厚生費": [0,0,0,0,0,0,0,0,0,0,0,0],
      "給料賃金":  [1500000,1700000,1500000,1800000,0,0,0,0,0,0,0,0],
      "外注工賃":  [0,0,0,0,0,0,0,0,0,0,0,0],
      "利子割引料": [0,0,0,0,0,0,0,0,0,0,0,0],
      "地代家賃":  [0,0,0,0,0,0,0,0,0,0,0,0],
      "貸倒金":    [0,0,0,0,0,0,0,0,0,0,0,0],
      "雑費":      [0,0,0,0,0,0,0,0,0,0,0,0],
    },
  };

  const [data, setData] = useState(initData);
  const [editCell, setEditCell] = useState(null); // "section:row:col"
  const [editBuf, setEditBuf] = useState("");

  const startEdit = (section, row, col) => {
    const key = `${section}:${row}:${col}`;
    setEditCell(key);
    setEditBuf(String(data[section][row][col] || ""));
  };

  const commitEdit = (section, row, col) => {
    const num = editBuf === "" || editBuf === "0" ? 0 : Number(editBuf.replace(/,/g, ""));
    if (!isNaN(num)) {
      setData(prev => {
        const next = { ...prev, [section]: { ...prev[section], [row]: [...prev[section][row]] } };
        next[section][row][col] = num;
        return next;
      });
    }
    setEditCell(null);
  };

  const fmtCell = (v) => v === 0 ? "" : v.toLocaleString();
  const rowSum = (section, row) => data[section][row].reduce((a, b) => a + b, 0);
  const colSum = (section, col) => Object.values(data[section]).reduce((a, r) => a + r[col], 0);
  const totalSum = (section) => Object.values(data[section]).reduce((a, r) => a + r.reduce((s, v) => s + v, 0), 0);

  const cellW = 80;
  const labelW = 110;
  const cs = { fontSize: 11, textAlign: "right", padding: "6px 8px", borderRight: `1px solid ${C.borderLt}`, borderBottom: `1px solid ${C.borderLt}`, fontFamily: mono, whiteSpace: "nowrap", minWidth: cellW, boxSizing: "border-box" };

  const renderSection = (sectionKey, sectionLabel) => {
    const rows = Object.entries(data[sectionKey]);
    return (
      <>
        {/* Section header row */}
        <tr style={{ background: `${C.blue}06` }}>
          <td colSpan={2} style={{ ...cs, textAlign: "left", fontWeight: 800, color: C.b1, fontSize: 10, letterSpacing: ".08em", borderRight: `2px solid ${C.border}` }}>{sectionLabel}</td>
          {months.map((_, ci) => <td key={ci} style={{ ...cs, background: `${C.blue}04` }} />)}
          <td style={{ ...cs, background: `${C.blue}04` }} />
        </tr>
        {/* Data rows */}
        {rows.map(([rowName, vals], ri) => (
          <tr key={rowName} style={{ background: ri % 2 === 0 ? "transparent" : `${C.blue}02` }}
            onMouseEnter={e => e.currentTarget.style.background = `${C.blue}05`}
            onMouseLeave={e => e.currentTarget.style.background = ri % 2 === 0 ? "transparent" : `${C.blue}02`}>
            <td style={{ ...cs, textAlign: "center", width: 28, color: C.textMut, fontSize: 10, fontWeight: 600 }}>{ri + 1}</td>
            <td style={{ ...cs, textAlign: "left", fontWeight: 600, color: C.dark, width: labelW, borderRight: `2px solid ${C.border}`, fontSize: 12 }}>{rowName}</td>
            {vals.map((v, ci) => {
              const cellKey = `${sectionKey}:${rowName}:${ci}`;
              const isEditing = editCell === cellKey;
              return (
                <td key={ci} onClick={() => startEdit(sectionKey, rowName, ci)}
                  style={{ ...cs, cursor: "pointer", color: v === 0 ? C.textMut : C.dark, fontWeight: v === 0 ? 400 : 600, position: "relative", transition: "background .1s" }}>
                  {isEditing ? (
                    <input autoFocus value={editBuf} onChange={e => setEditBuf(e.target.value)}
                      onBlur={() => commitEdit(sectionKey, rowName, ci)}
                      onKeyDown={e => { if (e.key === "Enter") commitEdit(sectionKey, rowName, ci); if (e.key === "Escape") setEditCell(null); if (e.key === "Tab") { e.preventDefault(); commitEdit(sectionKey, rowName, ci); if (ci < 11) startEdit(sectionKey, rowName, ci + 1); } }}
                      style={{ width: "100%", border: `2px solid ${C.blue}`, outline: "none", fontSize: 11, fontWeight: 700, textAlign: "right", padding: "2px 4px", fontFamily: bd, background: C.surface, boxShadow: "0 0 0 3px rgba(139,123,244,.12)", boxSizing: "border-box", position: "absolute", inset: 0 }} />
                  ) : fmtCell(v)}
                </td>
              );
            })}
            {/* Row total */}
            <td style={{ ...cs, fontWeight: 800, color: C.b1, background: `${C.blue}04`, borderRight: "none" }}>{fmtCell(rowSum(sectionKey, rowName))}</td>
          </tr>
        ))}
        {/* Section subtotal */}
        <tr style={{ background: "rgba(139,123,244,.02)" }}>
          <td style={{ ...cs }} />
          <td style={{ ...cs, textAlign: "left", fontWeight: 800, color: C.b1, fontSize: 12, borderRight: `2px solid ${C.border}` }}>計</td>
          {months.map((_, ci) => (
            <td key={ci} style={{ ...cs, fontWeight: 800, color: C.b1, borderTop: `2px solid ${C.b1}` }}>{fmtCell(colSum(sectionKey, ci))}</td>
          ))}
          <td style={{ ...cs, fontWeight: 800, color: "#fff", background: "rgba(139,123,244,.04)", borderTop: "1px solid rgba(139,123,244,.15)", fontFamily: mono, fontSize: 13, borderRight: "none" }}>{fmtCell(totalSum(sectionKey))}</td>
        </tr>
      </>
    );
  };

  return (
    <Card3 s={{ padding: 0, marginBottom: 20, overflow: "hidden" }}>
      {/* Header */}
      <div style={{ padding: "18px 28px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 9, color: C.textMut, fontWeight: 500, letterSpacing: ".16em", textTransform: "uppercase" }}>月別経費帳</div>
          <div style={{ fontSize: 11, color: C.textSec, marginTop: 2 }}>セルをクリックして直接編集 · Tab で横移動</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Mag s={{ padding: "6px 14px", border: `1px solid ${C.border}`, background: C.surface, color: C.textSec, fontSize: 10, cursor: "pointer", fontFamily: bd, fontWeight: 700 }}>CSV出力</Mag>
          <BtnApprove s={{ padding: "6px 14px", border: "none", background: "rgba(139,123,244,.12)", color: "#C4B8FF", border: "1px solid rgba(139,123,244,.3)", fontSize: 10, cursor: "pointer", fontFamily: bd, fontWeight: 700 }}>保存</BtnApprove>
        </div>
      </div>

      {/* Scrollable table */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 1200 }}>
          <thead>
            <tr style={{ background: C.surfAlt }}>
              <th style={{ ...cs, fontSize: 9, color: C.textMut, fontWeight: 500, letterSpacing: ".1em", width: 28 }}></th>
              <th style={{ ...cs, fontSize: 9, color: C.textMut, fontWeight: 500, letterSpacing: ".1em", textAlign: "left", width: labelW, borderRight: `2px solid ${C.border}` }}>勘定科目</th>
              {months.map(m => <th key={m} style={{ ...cs, fontSize: 10, color: C.textMut, fontWeight: 700 }}>{m}</th>)}
              <th style={{ ...cs, fontSize: 10, color: C.b1, fontWeight: 800, background: `${C.blue}06`, borderRight: "none" }}>年計</th>
            </tr>
          </thead>
          <tbody>
            {renderSection("収入", "収入金額")}
            {renderSection("経費", "必要経費")}
            {/* Profit row */}
            <tr style={{ background: "rgba(139,123,244,.03)" }}>
              <td style={{ ...cs }} />
              <td style={{ ...cs, textAlign: "left", fontWeight: 800, color: C.b2, fontSize: 13, fontFamily: mono, borderRight: `2px solid ${C.border}` }}>差引金額</td>
              {months.map((_, ci) => {
                const rev = colSum("収入", ci);
                const exp = colSum("経費", ci);
                const diff = rev - exp;
                return <td key={ci} style={{ ...cs, fontWeight: 800, color: diff >= 0 ? C.b2 : C.b1, fontFamily: mono, fontSize: 12 }}>{diff === 0 ? "" : fmtCell(diff)}</td>;
              })}
              <td style={{ ...cs, fontWeight: 800, color: "#fff", fontFamily: mono, fontSize: 14, background: "rgba(139,123,244,.06)", borderRight: "none" }}>{fmtCell(totalSum("収入") - totalSum("経費"))}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div style={{ padding: "10px 28px", borderTop: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 10, color: C.textMut }}>
        <span>収入計: ¥{totalSum("収入").toLocaleString()} · 経費計: ¥{totalSum("経費").toLocaleString()}</span>
        <span style={{ color: C.b2, fontWeight: 700 }}>差引金額: ¥{(totalSum("収入") - totalSum("経費")).toLocaleString()}</span>
      </div>
    </Card3>
  );
}

/* ════════════════════════════════ MISSING DOCS PANEL (Collapsible) ════════════════════════════════ */
function MissingDocsPanel({ missing, sevColor, sevLabel }) {
  const [open, setOpen] = useState(false);
  const highCount = missing.filter(m => m.severity === "high").length;
  return (
    <Card3 s={{ padding: 0, overflow: "hidden", marginBottom: 24 }}>
      {/* Collapsed header — always visible */}
      <Mag onClick={() => setOpen(!open)} s={{ padding: "18px 28px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", border: "none", background: "transparent", fontFamily: bd, textAlign: "left" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={highCount > 0 ? C.b1 : C.b4} strokeWidth="2.5" style={{ filter: "drop-shadow(0 0 6px rgba(255,255,255,.25))" }} strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M12 11v6M12 17h.01"/></svg>
          <span style={{ fontSize: 13, fontWeight: 700, color: C.dark }}>未回収・不足書類</span>
          <span style={{ background: highCount > 0 ? C.b1 : C.b4, color: "#fff", fontSize: 9, fontWeight: 600, padding: "2px 10px", borderRadius: 100 }}>{missing.length}件</span>
          {highCount > 0 && <span style={{ fontSize: 10, color: C.b1, fontWeight: 700 }}>うち{highCount}件 急ぎ</span>}
        </div>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.textMut} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform .2s" }}><path d="M6 9l6 6 6-6"/></svg>
      </Mag>

      {/* Expanded content */}
      {open && (
        <div style={{ borderTop: `1px solid ${C.borderLt}` }}>
          {/* Action bar */}
          <div style={{ padding: "12px 28px", display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <button type="button" style={{ padding: "7px 18px", borderRadius: 100, border: `1.5px solid ${C.border}`, background: "transparent", color: C.textSec, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: bd }}>+ 不足書類を追加</button>
            <button type="button" style={{ padding: "7px 18px", borderRadius: 100, border: "none", background: "rgba(139,123,244,.12)", color: "#C4B8FF", border: "1px solid rgba(139,123,244,.3)", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: bd, boxShadow: "0 0 14px rgba(139,123,244,.3), 0 0 36px rgba(139,123,244,.1)" }}>リマインド一括送信</button>
          </div>

          {/* List */}
          {missing.map((m, i) => (
            <div key={m.id} style={{ padding: "14px 28px", borderTop: `1px solid ${C.borderLt}`, display: "flex", alignItems: "center", gap: 14, transition: "background .15s" }}>
              <div style={{ width: 30, height: 30, borderRadius: "50%", background: `${sevColor(m.severity)}08`, border: `1px solid ${sevColor(m.severity)}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 600, color: sevColor(m.severity), flexShrink: 0, boxShadow: `0 0 10px ${sevColor(m.severity)}20, 0 0 22px ${sevColor(m.severity)}08` }}>{sevLabel(m.severity)}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: C.dark }}>{m.doc}</div>
                <div style={{ fontSize: 10, color: C.textMut, marginTop: 1 }}>期限: {m.due}</div>
              </div>
              <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                <button type="button" style={{ padding: "5px 14px", borderRadius: 100, border: `1.5px solid ${C.border}`, background: "transparent", color: C.textSec, fontSize: 10, fontWeight: 600, cursor: "pointer", fontFamily: bd }}>リマインド</button>
                <button type="button" style={{ padding: "5px 14px", borderRadius: 100, border: "1px solid rgba(139,123,244,.15)", background: "rgba(139,123,244,.06)", color: "rgba(139,123,244,.6)", fontSize: 10, fontWeight: 700, cursor: "pointer", fontFamily: bd }}>受領済み</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card3>
  );
}

/* ════════════════════════════════ HOME ════════════════════════════════ */

/* ═══════════════════════ HOME — Dashboard (view only) ═══════════════════════ */
/* ── Archetype Banner (Home用) ── */
/* ── compass detail data (per type) ── */
const COMPASS_DATA = {
  leviathan: {
    reasons: [
      "借入残高が存在し、金融機関との関係が財務の中心にある",
      "資金調達・設備投資への関心が回答に表れている",
      "売上規模に対して外部資本への依存度が高い構造",
    ],
    tendencies: [
      { label:"資金調達依存度", level: 4, note:"外部借入に頼る傾向" },
      { label:"財務健全性", level: 3, note:"CF管理に改善余地" },
      { label:"信用力への意識", level: 5, note:"金融機関対策が強い" },
    ],
    compass: "今期は決算書の「見た目」を金融機関目線で整える時期。売上総利益率と営業CFのプラス維持を最優先にすること。次の融資枠拡大に向けた根拠資料の整備を今から始めるべき。",
  },
  phoenix: {
    reasons: [
      "繰越欠損金が存在し、財務の立て直しが急務",
      "借入残高が重く、返済に追われるキャッシュ構造",
      "過去の税務調査指摘が財務管理上のリスクを示している",
    ],
    tendencies: [
      { label:"財務健全性", level: 2, note:"赤字・借入過多の兆候" },
      { label:"再建への意欲", level: 5, note:"課題認識は明確" },
      { label:"キャッシュ余力", level: 2, note:"手元流動性が課題" },
    ],
    compass: "まず損益分岐点を明確にし、不採算部門・経費を徹底精査。金融機関へのリスケ交渉も視野に入れ、短期的な黒字化ラインを引き直すことが先決。",
  },
  dragon: {
    reasons: [
      "売上・従業員数が成長フェーズに入っている",
      "新規事業の開始や再投資サイクルが加速している",
      "サブスク収益モデルで将来CFの見通しが立ちやすい",
    ],
    tendencies: [
      { label:"成長速度", level: 5, note:"急拡大フェーズ" },
      { label:"CF先読み精度", level: 3, note:"計画と実績にズレが出やすい" },
      { label:"税負担の最適化", level: 2, note:"成長優先で後回しになりがち" },
    ],
    compass: "成長に伴う人件費・外注費の急増に備え、四半期ごとのCF予測を立てること。再投資額と手元留保のバランスを意識し、法人税の繰り延べ策を今期中に設計すべき。",
  },
  sphinx: {
    reasons: [
      "安定した利益水準で節税余地が大きい",
      "役員報酬が高水準で個人・法人の税最適化が有効",
      "青色申告で各種特典をフル活用できる体制",
    ],
    tendencies: [
      { label:"節税意識", level: 5, note:"税負担最小化へ強い関心" },
      { label:"内部留保", level: 4, note:"利益が手元に残る構造" },
      { label:"税務調査リスク", level: 3, note:"節税強度に比例して上昇" },
    ],
    compass: "役員退職金の積立設計と法人保険の見直しが最優先。経費計上の根拠書類を今から整備し、税務調査に耐えられるエビデンスを揃えておくこと。",
  },
  chimera: {
    reasons: [
      "複数の収益モデルを持ち、事業間の資金移動が複雑",
      "新規事業開始や多角化の動きが回答に反映されている",
      "海外取引も絡み、国際税務の視点が必要",
    ],
    tendencies: [
      { label:"事業多様性", level: 5, note:"複数収益柱がある" },
      { label:"管理コスト", level: 4, note:"複雑化で経理負荷が高い" },
      { label:"グループ最適化", level: 3, note:"まだ整理の余地がある" },
    ],
    compass: "事業ごとのセグメント損益を可視化し、どの事業が利益を生んでいるかを明確にする時期。持株会社スキームの検討も視野に入れ、グループ全体の税負担を最小化する設計を。",
  },
  kraken: {
    reasons: [
      "飲食・小売など入出金サイクルが速い業種特性",
      "手元現金の不足・資金繰り不安が相談内容に表れている",
      "物販ECなど在庫を持つビジネスでCF管理が命綱",
    ],
    tendencies: [
      { label:"CF変動リスク", level: 5, note:"入出金のズレが大きい" },
      { label:"在庫・仕入管理", level: 4, note:"資金拘束の主要因" },
      { label:"収益の安定性", level: 3, note:"季節変動・波がある" },
    ],
    compass: "売掛金の回収サイクルを最短化し、支払いは合法的に後ろ倒し。月次で13週間のCFシミュレーションを作成し、資金ショートを常に2ヶ月先まで予測する習慣をつけること。",
  },
  griffin: {
    reasons: [
      "M&A・事業譲渡が選択肢として具体的に挙がっている",
      "売上規模が出口戦略を現実的にする水準に達している",
      "事業承継や株式評価の最適化に経営者の関心がある",
    ],
    tendencies: [
      { label:"出口意識", level: 5, note:"売却・承継を視野に" },
      { label:"企業価値への注力", level: 4, note:"BS・PLの見た目を意識" },
      { label:"準備期間の認識", level: 3, note:"まだ時間はあると思いがち" },
    ],
    compass: "出口の3〜5年前から企業価値評価を高める財務改善が必要。今期は不良資産の整理と役員退職金の積立設計を開始し、株価算定に有利なBSを作る基盤固めを。",
  },
  unicorn: {
    reasons: [
      "設立から3年以内の創業初期フェーズ",
      "売上規模がまだ立ち上がり段階にある",
      "顧問税理士不在で、税務の基礎構築が急務",
    ],
    tendencies: [
      { label:"税務基盤の整備度", level: 2, note:"記帳・申告が未整備" },
      { label:"助成金活用", level: 3, note:"まだ使えるものがある" },
      { label:"資金調達余地", level: 4, note:"創業融資の窓口は広い" },
    ],
    compass: "青色申告の承認申請と記帳体制の整備が最優先。創業融資（日本政策金融公庫）は設立後早いほど有利なので今すぐ動くこと。補助金・助成金のカレンダーも確認すべき。",
  },
  golem: {
    reasons: [
      "設立10年以上の安定期にある老舗企業",
      "借入なし・欠損なしで財務の健全性が高い",
      "従業員構成・売上規模ともに安定した水準を維持",
    ],
    tendencies: [
      { label:"財務安定性", level: 5, note:"ほぼリスクなし" },
      { label:"変化への対応力", level: 2, note:"現状維持バイアスが強い" },
      { label:"内部留保の活用", level: 3, note:"積み上がっているが使えていない" },
    ],
    compass: "安定は強みだが、内部留保の活用方針を明確にする時期。役員退職金の設計・設備更新・新規投資の検討を今期から始め、10年後も競争力を維持できる財務戦略を描くべき。",
  },
};

/* ── Archetype Banner (Home用・羅針盤) ── */
function ArchetypeBanner() {
  const type = COMPANY_TYPES.leviathan;
  const compass = COMPASS_DATA.leviathan;
  const ref = React.useRef(null);
  const rafRef = React.useRef(null);
  const c = type.color;

  const handleMove = (e) => {
    if (!ref.current) return;
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const dx = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
      const dy = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
      const badge = ref.current.querySelector(".ab-badge");
      if (badge) badge.style.transform = `rotateX(${-dy * 12}deg) rotateY(${dx * 12}deg) scale(1.04)`;
      const foil = ref.current.querySelector(".ab-foil");
      if (foil) foil.style.opacity = "1";
    });
  };
  const handleLeave = () => {
    if (!ref.current) return;
    const badge = ref.current.querySelector(".ab-badge");
    if (badge) badge.style.transform = "";
    const foil = ref.current.querySelector(".ab-foil");
    if (foil) foil.style.opacity = "0";
  };

  /* テンダンシーバー */
  const TendBar = ({ level }) => (
    <div style={{ display:"flex", gap:2 }}>
      {[1,2,3,4,5].map(i => (
        <div key={i} style={{ width:14, height:4, borderRadius:2,
          background: i <= level ? c : `${c}18`,
          boxShadow: i <= level && i === level ? `0 0 6px ${c}` : "none",
          transition:"background .2s"
        }}/>
      ))}
    </div>
  );

  return (
    <Card3 s={{ padding:0, marginBottom:14, overflow:"hidden", position:"relative" }}>
      {/* BG glow */}
      <div style={{ position:"absolute", inset:0, background:`radial-gradient(ellipse at 80% 50%, ${c}06 0%, transparent 65%)`, pointerEvents:"none" }}/>

      {/* ── ヘッダー行 ── */}
      <div style={{ display:"flex", alignItems:"center", gap:12, padding:"16px 24px 14px", borderBottom:`1px solid ${c}12` }}>
        <div style={{ fontFamily:hd, fontSize:9, letterSpacing:5, color:`${c}70`, textTransform:"uppercase" }}>Company Archetype</div>
        <div style={{ width:1, height:10, background:`${c}30` }}/>
        <div style={{ fontFamily:hd, fontSize:9, padding:"2px 10px", borderRadius:20, border:`1px solid ${c}30`, color:c, letterSpacing:1.5, opacity:.8 }}>{type.tag}</div>
        <div style={{ flex:1 }}/>
        <div style={{ fontSize:10, color:"rgba(255,255,255,.2)", letterSpacing:1 }}>羅針盤</div>
        {/* compass icon */}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={`${c}50`} strokeWidth="1.5">
          <circle cx="12" cy="12" r="10"/><path d="M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z"/>
        </svg>
      </div>

      {/* ── メイン3カラム ── */}
      <div
        ref={ref}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        style={{ display:"grid", gridTemplateColumns:"auto 1fr 1fr 1fr", gap:0, cursor:"default" }}
      >
        {/* ─ LEFT: Badge ─ */}
        <div style={{ padding:"20px 24px", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", borderRight:`1px solid ${c}10`, gap:10 }}>
          <div style={{ perspective:600 }}>
            <div className="ab-badge" style={{ width:76, height:102, borderRadius:12, background:type.bgGrad, border:`1px solid ${c}30`, position:"relative", overflow:"hidden", transformStyle:"preserve-3d", transition:"transform .08s linear", boxShadow:`0 8px 32px rgba(0,0,0,.4)` }}>
              <div className="ab-foil" style={{ position:"absolute",inset:0,borderRadius:12,opacity:0,transition:"opacity .3s",mixBlendMode:"screen",background:type.foilGrad,backgroundSize:"300% 300%",animation:"hbFoil 5s ease infinite" }}/>
              <div style={{ position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:4,padding:"10px 8px",zIndex:2 }}>
                <svg width="38" height="38" viewBox="0 0 50 50"><g dangerouslySetInnerHTML={{__html:type.svgPath}}/></svg>
                <div style={{ fontFamily:hd,fontSize:6,color:c,letterSpacing:1,textAlign:"center",textShadow:`0 0 10px ${c}` }}>{type.name}</div>
              </div>
            </div>
          </div>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontFamily:hd, fontSize:13, fontWeight:600, color:c, letterSpacing:1, textShadow:`0 0 16px ${c}60`, marginBottom:2 }}>{type.name}</div>
            <div style={{ fontSize:10, color:`${c}70`, letterSpacing:2 }}>{type.jp}</div>
          </div>
        </div>

        {/* ─ COL 1: このタイプと診断された理由 ─ */}
        <div style={{ padding:"20px 20px", borderRight:`1px solid ${c}10` }}>
          <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:14 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
            <div style={{ fontSize:9, fontFamily:hd, letterSpacing:3, color:`${c}80`, textTransform:"uppercase" }}>診断の根拠</div>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
            {compass.reasons.map((r, i) => (
              <div key={i} style={{ display:"flex", gap:8, alignItems:"flex-start" }}>
                <div style={{ width:16, height:16, borderRadius:"50%", background:`${c}15`, border:`1px solid ${c}30`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:1 }}>
                  <div style={{ fontFamily:hd, fontSize:8, color:c }}>{i+1}</div>
                </div>
                <div style={{ fontSize:11, color:"rgba(255,255,255,.5)", lineHeight:1.7 }}>{r}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ─ COL 2: 貴社の財務傾向 ─ */}
        <div style={{ padding:"20px 20px", borderRight:`1px solid ${c}10` }}>
          <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:14 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
            <div style={{ fontSize:9, fontFamily:hd, letterSpacing:3, color:`${c}80`, textTransform:"uppercase" }}>財務傾向</div>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:13 }}>
            {compass.tendencies.map((t, i) => (
              <div key={i}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:5 }}>
                  <div style={{ fontSize:11, color:"rgba(255,255,255,.6)", fontWeight:500 }}>{t.label}</div>
                  <div style={{ fontSize:9, color:`${c}60` }}>{t.note}</div>
                </div>
                <TendBar level={t.level}/>
              </div>
            ))}
          </div>
        </div>

        {/* ─ COL 3: 今期の羅針盤 ─ */}
        <div style={{ padding:"20px 20px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:14 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z"/></svg>
            <div style={{ fontSize:9, fontFamily:hd, letterSpacing:3, color:`${c}80`, textTransform:"uppercase" }}>今期の方針</div>
          </div>
          <div style={{ fontSize:12, color:"rgba(255,255,255,.55)", lineHeight:1.85, marginBottom:16 }}>
            {compass.compass}
          </div>
          {/* priority pills */}
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            {type.priority.map((p, i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:8 }}>
                <div style={{ width:4, height:4, borderRadius:"50%", background:c, opacity:.6, flexShrink:0 }}/>
                <div style={{ fontSize:10, color:c, opacity:.8, letterSpacing:.5 }}>{p}</div>
              </div>
            ))}
          </div>
          {/* warning */}
          <div style={{ marginTop:14, padding:"10px 12px", borderRadius:8, background:`rgba(255,255,255,.02)`, border:`1px solid ${c}15` }}>
            <div style={{ fontSize:10, color:"rgba(255,255,255,.28)", lineHeight:1.65 }}>⚠ {type.warning}</div>
          </div>
        </div>
      </div>
    </Card3>
  );
}

function Home({ goTo, goalMode }) {
  const Y = "\u00A5";

  /* ── Segmented Bar component (planet.ai style) ── */
  const SegBar = ({ value, max, segments = 28, color = "rgba(139,123,244,.6)" }) => {
    const filled = Math.round((value / max) * segments);
    return (
      <div style={{ display: "flex", gap: 2, filter: "drop-shadow(0 0 6px rgba(255,255,255,.1))" }}>
        {Array.from({ length: segments }, (_, i) => (
          <div key={i} style={{
            flex: 1, height: 14, borderRadius: 2,
            background: i < filled ? color : "rgba(139,123,244,.04)",
            opacity: i < filled ? (0.4 + 0.6 * (i / segments)) : 1,
            boxShadow: i === filled - 1 ? `0 0 10px ${color}, 0 0 20px ${color}` : "none",
          }} />
        ))}
      </div>
    );
  };

  /* ── Icon Badge (planet.ai rounded square) ── */
  const IconBadge = ({ children, color = "rgba(139,123,244,.08)", size = 56 }) => (
    <div style={{ width: size, height: size, borderRadius: "50%", background: color, border: "1px solid rgba(255,255,255,.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 0 14px rgba(255,255,255,.12), 0 0 32px rgba(255,255,255,.05)" }}>
      {children}
    </div>
  );

  /* ── Pct change arrow ── */
  const Pct = ({ value, suffix = "%" }) => {
    const up = value >= 0;
    return (
      <span style={{ fontSize: 11, fontWeight: 600, color: up ? "#7BE0A0" : "#E87070", fontFamily: mono }}>
        {up ? "+" : ""}{value}{suffix} {up ? "↗" : "↘"}
      </span>
    );
  };

  return (
    <PageShell title="ホーム" watermark={"ホー\nム"}>
      {/* ── Hero KPI Row: planet.ai style ── */}
      <Rv><div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:12, marginBottom:14 }}>
        {[
          { label:"売上", jp:"売上", value:"1,540万", pct:2.1, icon:<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg> },
          { label:"経費", jp:"経費", value:"710万", pct:-3.4, icon:<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 010-4h14v4"/><path d="M3 5v14a2 2 0 002 2h16v-5"/><path d="M18 12a2 2 0 000 4h4v-4z"/></svg> },
          { label:"営業利益", jp:"営業利益", value:"210万", pct:5.65, icon:<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg> },
        ].map((k,i)=>(
          <Card3 key={i} s={{ padding:"20px 22px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:14 }}>
              <IconBadge>{k.icon}</IconBadge>
              <div>
                <div style={{ fontSize:10, color:C.textMut, fontWeight:500, letterSpacing:".15em", textTransform:"uppercase", marginBottom:8 }}>{k.jp}</div>
                <div style={{ display:"flex", alignItems:"baseline", gap:10 }}>
                  <span style={{ fontFamily:hd, fontSize:48, fontWeight:300, color:"#fff", letterSpacing:"-.03em", textShadow:"0 0 20px rgba(255,255,255,.25), 0 0 50px rgba(255,255,255,.08)" }}>{Y}{k.value}</span>
                  <Pct value={k.pct} />
                </div>
              </div>
            </div>
          </Card3>
        ))}
      </div></Rv>

      {/* ── Archetype Banner ── */}
      <Rv d={10}><ArchetypeBanner /></Rv>

      {/* ── Analytic View + 3D Chart — side by side ── */}
      <Rv d={15}><div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:14 }}>

        {/* Left: Analytic view with segmented bars (planet.ai style) */}
        <Card3 s={{ padding:"20px 22px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
            <span style={{ fontSize:18, fontWeight:600, color:"#fff", fontFamily:hd, letterSpacing:"-.01em" }}>分析ビュー</span>
            <span style={{ fontSize:10, color:C.textMut, fontWeight:500 }}>This month ▾</span>
          </div>

          {/* Bar 1: Average revenue */}
          <div style={{ marginBottom:20 }}>
            <div style={{ fontSize:10, color:C.textMut, marginBottom:4 }}>月間売上推移</div>
            <div style={{ fontFamily:hd, fontSize:28, fontWeight:300, color:"#fff", marginBottom:8, letterSpacing:"-.02em", textShadow:"0 0 12px rgba(255,255,255,.2), 0 0 36px rgba(255,255,255,.06)" }}>¥1,250万 — 1,540万</div>
            <SegBar value={15.4} max={20} segments={30} color="rgba(160,145,255,.65)" />
          </div>

          {/* Bar 2: Expense ratio */}
          <div style={{ marginBottom:20 }}>
            <div style={{ fontSize:10, color:C.textMut, marginBottom:4 }}>経費率</div>
            <div style={{ fontFamily:hd, fontSize:28, fontWeight:300, color:"#fff", marginBottom:8, letterSpacing:"-.02em", textShadow:"0 0 12px rgba(255,255,255,.2), 0 0 36px rgba(255,255,255,.06)" }}>46.1%</div>
            <SegBar value={46} max={100} segments={30} color="rgba(139,123,244,.45)" />
          </div>

          {/* Bar 3: Profit margin */}
          <div>
            <div style={{ fontSize:10, color:C.textMut, marginBottom:4 }}>利益率</div>
            <div style={{ fontFamily:hd, fontSize:28, fontWeight:300, color:"#fff", marginBottom:8, letterSpacing:"-.02em", textShadow:"0 0 12px rgba(255,255,255,.2), 0 0 36px rgba(255,255,255,.06)" }}>13.6%</div>
            <SegBar value={13.6} max={30} segments={30} color="rgba(139,123,244,.35)" />
          </div>
        </Card3>

        {/* Right: Wave Area chart */}
        <Card3 s={{ padding:0, overflow:"hidden" }}>
          <div style={{ padding:"18px 22px 0", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontSize:18, fontWeight:600, color:"#fff", fontFamily:hd, letterSpacing:"-.01em" }}>6ヶ月推移</span>
            <div style={{ display:"flex", gap:12, fontSize:10 }}>
              <span style={{ display:"flex", alignItems:"center", gap:4 }}><div style={{ width:8, height:3, borderRadius:2, background:"rgba(139,123,244,.7)", boxShadow:"0 0 8px rgba(139,123,244,.4)" }}/>売上</span>
              <span style={{ display:"flex", alignItems:"center", gap:4 }}><div style={{ width:8, height:3, borderRadius:2, background:"rgba(123,224,160,.5)", boxShadow:"0 0 8px rgba(123,224,160,.3)" }}/>利益</span>
            </div>
          </div>
          <div style={{ padding:"8px 16px 0" }}>
            <ChartWaveArea />
          </div>
        </Card3>
      </div></Rv>

      {/* ── Balance + Progress Row (planet.ai Parcels-in-way style) ── */}
      <Rv d={25}><div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:14 }}>
        {/* Left: Balance card */}
        <Card3 s={{ padding:"20px 22px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            <IconBadge>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M2 10h20"/></svg>
            </IconBadge>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:10, color:C.textMut, marginBottom:4 }}>預金残高</div>
              <div style={{ display:"flex", alignItems:"baseline", gap:8 }}>
                <span style={{ fontFamily:hd, fontSize:36, fontWeight:300, color:"#fff", letterSpacing:"-.03em" }}>¥2,480万</span>
              </div>
            </div>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontSize:9, color:C.textMut }}>Updated</div>
              <div style={{ fontSize:10, color:"rgba(255,255,255,.35)" }}>30m ago</div>
            </div>
          </div>
          {/* Gradient progress bar (planet.ai Parcels style) */}
          <div style={{ marginTop:16, height:10, borderRadius:8, background:"rgba(139,123,244,.04)", overflow:"hidden", position:"relative" }}>
            <div style={{ height:"100%", width:"73%", borderRadius:8, background:"linear-gradient(90deg, rgba(139,123,244,.12), rgba(139,123,244,.45))", boxShadow:"0 0 8px rgba(139,123,244,.2), 0 0 20px rgba(139,123,244,.08)" }} />
            {/* Tick mark at end */}
            <div style={{ position:"absolute", right:"27%", top:0, bottom:0, width:2, background:"rgba(139,123,244,.3)" }} />
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", marginTop:6 }}>
            <span style={{ fontSize:9, color:C.textMut }}>普通 1,820万</span>
            <span style={{ fontSize:9, color:C.textMut }}>当座 660万</span>
          </div>
        </Card3>

        {/* Right: Year progress */}
        <Card3 s={{ padding:"20px 22px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:16 }}>
            <IconBadge>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            </IconBadge>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:10, color:C.textMut, marginBottom:4 }}>2025年度進捗</div>
              <div style={{ display:"flex", alignItems:"baseline", gap:8 }}>
                <span style={{ fontFamily:hd, fontSize:40, fontWeight:300, color:"#fff", letterSpacing:"-.02em" }}>11</span>
                <span style={{ fontSize:14, color:"rgba(255,255,255,.25)" }}>/ 12ヶ月</span>
              </div>
            </div>
            <span style={{ fontFamily:hd, fontSize:36, fontWeight:300, color:"rgba(255,255,255,.5)", letterSpacing:"-.02em" }}>92%</span>
          </div>
          {/* Segmented progress */}
          <div style={{ display:"flex", gap:3, filter: "drop-shadow(0 0 6px rgba(255,255,255,.08))" }}>
            {Array.from({ length: 12 }, (_, i) => (
              <div key={i} style={{
                flex: 1, height: 10, borderRadius: 3,
                background: i < 11 ? "rgba(139,123,244,.45)" : "rgba(139,123,244,.04)",
                opacity: i < 11 ? (0.3 + 0.7 * (i / 11)) : 1,
                boxShadow: i === 10 ? "0 0 8px rgba(139,123,244,.4), 0 0 18px rgba(139,123,244,.15)" : "none",
              }} />
            ))}
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", marginTop:6 }}>
            <span style={{ fontSize:9, color:C.textMut }}>Apr 2025</span>
            <span style={{ fontSize:9, color:C.textMut }}>Mar 2026</span>
          </div>
        </Card3>
      </div></Rv>

      {/* ── Goal-specific KPIs ── */}
      {goalMode && goalMode !== "general" && <Rv d={30}><div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:14 }}>
        {({
          tax: [{ l:"推定税額", v:"¥680万", s:"法人税+消費税", c:"#A89BFF" }, { l:"節税余地", v:"¥120万", s:"控除・前倒し可能", c:"#8B7BF4" }],
          cost: [{ l:"削減可能経費", v:"¥82万", s:"3科目で削減余地", c:"#8B7BF4" }, { l:"固定費率", v:"62%", s:"業界平均55%", c:"#A89BFF" }],
          loan: [{ l:"営業利益率", v:"13.6%", s:"目安10%以上 ✓", c:"#8B7BF4" }, { l:"自己資本比率", v:"42%", s:"目安30%以上 ✓", c:"#8B7BF4" }],
          growth: [{ l:"広告費比率", v:"0.8%", s:"業界平均8-12%", c:"#A89BFF" }, { l:"キャッシュ余力", v:"¥2,480万", s:"6ヶ月分確保", c:"#8B7BF4" }],
        }[goalMode] || []).map((k,i)=>(
          <Card3 key={i} s={{ padding:"18px 20px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:14 }}>
              <div style={{ width:4, height:36, borderRadius:4, background:k.c, flexShrink:0 }} />
              <div>
                <div style={{ fontSize:9, color:C.textMut, fontWeight:500, letterSpacing:".1em", textTransform:"uppercase", fontFamily:mono, marginBottom:4 }}>{k.l}</div>
                <div style={{ fontFamily:hd, fontSize:32, fontWeight:300, color:"#fff", letterSpacing:"-.02em" }}>{k.v}</div>
                <div style={{ fontSize:10, color:C.textMut, marginTop:2 }}>{k.s}</div>
              </div>
            </div>
          </Card3>
        ))}
      </div></Rv>}

      {/* ── Deadlines + Tasks — planet.ai tracking history style ── */}
      <Rv d={40}><div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:14 }}>

        {/* Deadlines — timeline dots (planet.ai tracking style) */}
        <Mag onClick={()=>goTo("plan")} s={{ cursor:"pointer", display:"block" }}>
          <Card3 s={{ padding:0, overflow:"hidden" }}>
            <div style={{ padding:"18px 22px 14px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <span style={{ fontSize:18, fontWeight:600, color:"#fff", fontFamily:hd, letterSpacing:"-.01em" }}>直近の締切</span>
              <span style={{ fontSize:10, color:"rgba(255,255,255,.35)", fontWeight:600 }}>Plan →</span>
            </div>
            {[
              {l:"源泉所得税 2月分",due:"03/10",left:19,color:"rgba(255,255,255,.8)"},
              {l:"確定申告",due:"03/15",left:24,color:"rgba(255,255,255,.65)"},
              {l:"消費税申告",due:"03/31",left:40,color:"rgba(255,255,255,.4)"},
              {l:"法人税申告",due:"05/31",left:101,color:"rgba(255,255,255,.2)"},
            ].map((d,i,arr)=>(
              <div key={i} style={{ display:"flex", gap:16, padding:"0 22px", position:"relative" }}>
                {/* Timeline line + dot */}
                <div style={{ display:"flex", flexDirection:"column", alignItems:"center", width:12 }}>
                  <div style={{ width:10, height:10, borderRadius:"50%", background:d.color, flexShrink:0, zIndex:1, border:"2px solid rgba(6,6,12,.9)", boxShadow:`0 0 8px ${d.color}` }} />
                  {i < arr.length-1 && <div style={{ width:1, flex:1, background:"rgba(139,123,244,.08)" }} />}
                </div>
                <div style={{ flex:1, paddingBottom:16 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <span style={{ fontSize:12, fontWeight:600, color:"#fff" }}>{d.l}</span>
                    <span style={{ fontSize:10, color:C.textMut }}>{d.due}</span>
                  </div>
                  <div style={{ fontSize:10, color:C.textMut, marginTop:2 }}>残り {d.left}日</div>
                </div>
              </div>
            ))}
          </Card3>
        </Mag>

        {/* Tasks — clean icon list (planet.ai style) */}
        <Mag onClick={()=>goTo("tasks")} s={{ cursor:"pointer", display:"block" }}>
          <Card3 s={{ padding:0, overflow:"hidden" }}>
            <div style={{ padding:"18px 22px 14px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <span style={{ fontSize:18, fontWeight:600, color:"#fff", fontFamily:hd, letterSpacing:"-.01em" }}>未処理タスク</span>
              <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                <span style={{ fontFamily:hd, fontSize:36, fontWeight:300, color:"#fff", letterSpacing:"-.02em" }}>8</span>
                <span style={{ fontSize:10, color:C.textMut }}>件</span>
                <span style={{ fontSize:10, color:"rgba(255,255,255,.35)", fontWeight:600, marginLeft:4 }}>Tasks →</span>
              </div>
            </div>
            {[
              {l:"AI仕訳候補",n:3,icon:<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4"/></svg>,desc:"OCRから自動推定された仕訳"},
              {l:"未確認仕訳",n:3,icon:<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,desc:"信頼度95%未満の仕訳"},
              {l:"締切リマインド",n:2,icon:<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>,desc:"対応が必要な期限"},
              {l:"不足書類",n:2,icon:<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/></svg>,desc:"回収待ちの書類"},
            ].map((t,i)=>(
              <div key={i} style={{ display:"flex", alignItems:"center", gap:14, padding:"12px 22px", borderTop:`1px solid ${C.borderLt}` }}>
                <IconBadge>{t.icon}</IconBadge>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ fontSize:12, fontWeight:600, color:"#fff" }}>{t.l}</span>
                    <span style={{ fontFamily:hd, fontSize:18, color:"rgba(255,255,255,.4)", fontWeight:400 }}>{t.n}</span>
                  </div>
                  <div style={{ fontSize:10, color:C.textMut, marginTop:2 }}>{t.desc}</div>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(139,123,244,.25)" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
              </div>
            ))}
          </Card3>
        </Mag>


      </div></Rv>

      {/* ── Recent Activity (planet.ai timeline style) ── */}
      <Rv d={60}><Card3 s={{ padding:"20px 22px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
          <span style={{ fontSize:18, fontWeight:600, color:"#fff", fontFamily:hd, letterSpacing:"-.01em" }}>更新履歴</span>
          <div style={{ width:28, height:28, borderRadius:8, background:"rgba(139,123,244,.04)", border:"1px solid rgba(139,123,244,.06)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
            <span style={{ color:"rgba(255,255,255,.25)", fontSize:14, lineHeight:1 }}>⋯</span>
          </div>
        </div>
        {[].map((l,i,arr)=>{
          const dotColor = {ai:"rgba(255,255,255,.7)",auto:"rgba(255,255,255,.5)",deadline:"rgba(255,255,255,.7)",filing:"rgba(255,255,255,.35)",upload:"rgba(255,255,255,.2)"}[l.type]||C.textMut;
          return (
            <div key={i} style={{ display:"flex", gap:16, position:"relative" }}>
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", width:10 }}>
                <div style={{ width:8, height:8, borderRadius:"50%", background:dotColor, flexShrink:0, zIndex:1, border:"2px solid rgba(6,6,12,.9)", boxShadow:`0 0 8px ${dotColor}` }} />
                {i < arr.length-1 && <div style={{ width:1, flex:1, background:"rgba(139,123,244,.06)" }} />}
              </div>
              <div style={{ flex:1, paddingBottom:14, display:"flex", alignItems:"center", gap:12 }}>
                <span style={{ fontSize:10, color:C.textMut, width:36, flexShrink:0, fontFamily:mono }}>{l.time}</span>
                <span style={{ fontSize:12, color:"rgba(255,255,255,.75)" }}>{l.action}</span>
              </div>
            </div>
          );
        })}
        <div style={{ textAlign:"center", padding:"16px 0", color:C.textMut, fontSize:11 }}>履歴はまだありません</div>
      </Card3></Rv>

      {/* ── Missing Docs ── */}
      <Rv d={80}><MissingDocsPanel missing={[]} sevColor={s=>s===1?C.b1:s===2?C.b2:C.b4} sevLabel={s=>s===1?"急ぎ":s===2?"要対応":"通常"} /></Rv>
    </PageShell>
  );
}

function PageShell({ title, watermark, children }) {
  const [tilt, setTilt] = useState({x:0,y:0});
  const [hov, setHov] = useState(false);
  const ref = React.useRef(null);
  const onMove = (e) => {
    if(!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width - .5) * 2;
    const y = ((e.clientY - r.top) / r.height - .5) * 2;
    setTilt({x: y * -8, y: x * 12});
  };
  return (
    <div style={{ flex: 1, height: "100%", overflow: "auto", background: C.bg, fontFamily: bd, position: "relative", borderRadius: "inherit" }}>
      <div style={{ position: "fixed", right: -40, top: -10, fontFamily: hd, fontSize: "18vw", fontWeight: 300, color: "#fff", opacity: .02, lineHeight: .82, pointerEvents: "none", letterSpacing: "-.04em", whiteSpace: "pre-wrap" }}>{watermark}</div>
      <div style={{ padding: "36px 48px 0", position: "relative", zIndex: 1 }}>
        <Rv><div>
          <div style={{ fontSize: 10, color: C.textMut, fontWeight: 500, letterSpacing: ".2em", textTransform: "uppercase", marginBottom: 8, fontFamily: mono }}>February 2026 — クライアント名</div>
          <div
            ref={ref}
            onMouseEnter={()=>setHov(true)}
            onMouseMove={onMove}
            onMouseLeave={()=>{setHov(false);setTilt({x:0,y:0})}}
            style={{
              display:"inline-block", cursor:"default", perspective:600,
            }}
          ><div style={{
              fontFamily: hd, fontSize: 28, fontWeight: 700, letterSpacing: "-.02em",
              background: "linear-gradient(90deg, #8B7BF4 0%, #C4B8FF 15%, #fff 30%, #7BE0A0 45%, #6BA3FF 55%, #C4B8FF 70%, #8B7BF4 85%, #C4B8FF 100%)",
              backgroundSize: "200% auto",
              backgroundPosition: hov ? `${50 + tilt.y * 4}% center` : "0% center",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
              transition: hov ? "transform .1s ease-out, background-position .1s ease-out" : "transform .5s cubic-bezier(.16,1,.3,1), background-position .5s ease",
              filter: hov ? `drop-shadow(${tilt.y*-1}px ${tilt.x*1}px 16px rgba(139,123,244,.35))` : "drop-shadow(0 0 12px rgba(139,123,244,.15))",
              transformStyle: "preserve-3d",
            }}>{title}</div></div>
        </div></Rv>
      </div>
      <div style={{ padding: "28px 48px 56px", position: "relative", zIndex: 1 }}>{children}</div>
    </div>
  );
}

/* ═══ Daily Page ═══ */

/* ═══════════════════════ TASKS — Tinder-style ═══════════════════════ */
function TasksPage({ goTo }) {
  const Y = "\u00A5";
  const [tasks, setTasks] = useState([]);
  const [taskIdx, setTaskIdx] = useState(0);
  const [done, setDone] = useState(0);
  const total = tasks.length;
  const handleTask = () => { setDone(d=>d+1); setTasks(p=>p.filter((_,i)=>i!==taskIdx)); if(taskIdx>=tasks.length-1) setTaskIdx(Math.max(0,tasks.length-2)); };
  const skipTask = () => setTaskIdx(p=>(p+1)%tasks.length);
  const task = tasks[taskIdx];
  const typeLabel = { ai:"AI仕訳候補", deadline:"締切リマインド", doc:"不足書類", review:"未確認仕訳" };
  const typeIcon = {
    ai:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.blue} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>,
    deadline:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.b1} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>,
    doc:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.b2} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg>,
    review:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.b3} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  };

  return (
    <PageShell title="タスク" watermark={"タス\nク"}>
      <Rv><Card3 s={{ padding:"32px 36px" }}>
        {tasks.length===0?(
          <div style={{ textAlign:"center", padding:"50px 0" }}>
            <div style={{ fontSize:48, marginBottom:14, opacity:.15 }}>&#10003;</div>
            <div style={{ fontFamily:hd, fontSize:32, fontWeight:300, color:C.b4, marginBottom:8, letterSpacing:"-.02em" }}>ALL CLEAR</div>
            <div style={{ fontSize:14, color:C.textMut }}>今日のタスクはすべて完了しました</div>
            <div style={{ marginTop:20, fontSize:13, color:C.textSec }}>{done}/{total} 完了</div>
          </div>
        ):(
          <>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <span style={{ fontSize:9, fontWeight:500, color:C.textMut, letterSpacing:".14em", textTransform:"uppercase" }}>Today's Tasks</span>
                <span style={{ fontSize:13, color:C.dark, fontWeight:700 }}>{done+1}/{total}</span>
              </div>
              <div style={{ display:"flex", gap:3 }}>
                {Array.from({length:total},(_,i)=><div key={i} style={{ flex:1, height:4, borderRadius:2, background:i<done?"rgba(139,123,244,.45)":i===done?"rgba(139,123,244,.7)":"rgba(139,123,244,.04)", transition:"background .2s" }}/>)}
              </div>
            </div>
            <div style={{ height:4, background:C.borderLt, borderRadius:8, marginBottom:28, overflow:"hidden" }}><div style={{ height:"100%", width:`${(done/total)*100}%`, background:C.blue, borderRadius:8, transition:"width .3s", boxShadow:"0 0 8px rgba(139,123,244,.3), 0 0 20px rgba(139,123,244,.1)" }}/></div>

            {task && (
              <div style={{ border:`1.5px solid ${C.blue}15`, borderRadius:24, overflow:"hidden" }}>
                <div style={{ padding:"14px 24px", background:`${C.blue}04`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}><span style={{ filter:"drop-shadow(0 0 6px rgba(255,255,255,.3))" }}>{typeIcon[task.type]}</span><span style={{ fontSize:12, fontWeight:600, color:"#fff", letterSpacing:".02em" }}>{typeLabel[task.type]}</span></div>
                  {task.left!=null&&<span style={{ fontSize:10, fontWeight:600, color:"#fff", padding:"3px 8px", background:"rgba(139,123,244,.04)", borderRadius:6, border:"1px solid rgba(139,123,244,.08)" }}>あと{task.left}日</span>}
                </div>
                <div style={{ padding:"24px 24px 22px" }}>
                  {(task.type==="ai"||task.type==="review")&&(<>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
                      <div>{task.date&&<div style={{ fontSize:11, color:"#C8C8D8", marginBottom:3 }}>{task.date}</div>}<div style={{ fontSize:22, fontWeight:600, color:C.dark, letterSpacing:"-.02em" }}>{task.title}</div></div>
                      <div style={{ fontFamily:hd, fontSize:36, fontWeight:300, color:C.dark, letterSpacing:"-.02em" }}>{Y}{task.amount.toLocaleString()}</div>
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
                      <span style={{ fontFamily:hd, fontSize:14, color:C.blue }}>Z.</span>
                      <span style={{ fontSize:15, fontWeight:700, color:C.blue }}>{task.acct}</span>
                      <span style={{ fontSize:10, fontWeight:600, color:task.conf>=90?"#fff":task.conf>=75?C.textSec:C.text, padding:"3px 8px", border:"1.5px solid", borderRadius:100 }}>{task.conf}%</span>
                    </div>
                    <div style={{ fontSize:12, color:C.textSec, lineHeight:1.7, marginBottom:14 }}>{task.reason}</div>
                    {task.alts&&task.alts.length>0&&(<>
                      <div style={{ fontSize:10, color:"#C8C8D8", fontWeight:500, letterSpacing:".1em", textTransform:"uppercase", marginBottom:6 }}>他の科目候補</div>
                      <div style={{ display:"flex", flexDirection:"column", gap:6, marginBottom:18 }}>
                        {task.alts.map((a,j)=>{
                          const riskCol = a.risk==="safe"?C.b4:a.risk==="gray"?"rgba(255,255,255,.4)":C.b1;
                          const riskLabel = a.risk==="safe"?"安全":a.risk==="gray"?"グレー":"リスク高";
                          return (
                            <button key={j} type="button" onClick={()=>{}} style={{ display:"flex", alignItems:"flex-start", gap:10, padding:"10px 14px", borderRadius:18, border:`1px solid ${C.border}`, background:"transparent", cursor:"pointer", fontFamily:bd, textAlign:"left", transition:"all .15s", width:"100%" }}
                              onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(139,123,244,.2)"}
                              onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
                              <div style={{ display:"flex", alignItems:"center", gap:6, minWidth:110, flexShrink:0 }}>
                                <span style={{ width:6, height:6, borderRadius:"50%", background:riskCol, flexShrink:0 }}/>
                                <span style={{ fontSize:12, fontWeight:600, color:"#fff" }}>{a.name}</span>
                                <span style={{ fontSize:8, fontWeight:700, color:riskCol, padding:"1px 6px", border:`1px solid ${riskCol}40`, borderRadius:100, letterSpacing:".04em" }}>{riskLabel}</span>
                              </div>
                              <span style={{ fontSize:11, color:"#C8C8D8", lineHeight:1.5 }}>{a.note}</span>
                            </button>
                          );
                        })}
                      </div>
                    </>)}
                    <div style={{ display:"flex", gap:10 }}>
                      <BtnApprove onClick={handleTask} s={{ flex:2, padding:"14px 0", border:"none", borderRadius:20, background:"rgba(139,123,244,.12)", color:"#C4B8FF", border:"1px solid rgba(139,123,244,.3)", fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:bd, textAlign:"center", boxShadow:"0 0 14px rgba(139,123,244,.3), 0 0 36px rgba(139,123,244,.1)" }}>承認</BtnApprove>
                      <button type="button" style={{ flex:1, padding:"14px 0", borderRadius:20, border:`1.5px solid ${C.border}`, background:"transparent", color:C.textSec, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:bd }}>修正</button>
                      <button type="button" onClick={skipTask} style={{ flex:1, padding:"14px 0", borderRadius:20, border:`1.5px solid ${C.border}`, background:"transparent", color:C.textMut, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:bd }}>スキップ</button>
                    </div>
                  </>)}
                  {task.type==="deadline"&&(<>
                    <div style={{ fontSize:22, fontWeight:700, color:C.dark, marginBottom:8 }}>{task.title}</div>
                    <div style={{ fontSize:11, color:"#C8C8D8", marginBottom:6 }}>期限: {task.due}</div>
                    <div style={{ fontSize:13, color:C.textSec, lineHeight:1.7, marginBottom:20 }}>{task.desc}</div>
                    <div style={{ display:"flex", gap:10 }}>
                      <BtnApprove onClick={()=>goTo("plan")} s={{ flex:2, padding:"14px 0", border:"none", borderRadius:20, background:"rgba(139,123,244,.12)", color:"#C4B8FF", border:"1px solid rgba(139,123,244,.3)", fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:bd, textAlign:"center", boxShadow:"0 0 14px rgba(139,123,244,.3), 0 0 36px rgba(139,123,244,.1)" }}>対応する</BtnApprove>
                      <button type="button" onClick={handleTask} style={{ flex:1, padding:"14px 0", borderRadius:20, border:`1.5px solid ${C.border}`, background:"transparent", color:C.textSec, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:bd }}>確認済み</button>
                      <button type="button" onClick={skipTask} style={{ flex:1, padding:"14px 0", borderRadius:20, border:`1.5px solid ${C.border}`, background:"transparent", color:C.textMut, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:bd }}>後で</button>
                    </div>
                  </>)}
                  {task.type==="doc"&&(<>
                    <div style={{ fontSize:22, fontWeight:700, color:C.dark, marginBottom:8 }}>{task.title}</div>
                    <div style={{ fontSize:11, color:"#C8C8D8", marginBottom:6 }}>期限: {task.due}</div>
                    <div style={{ fontSize:13, color:C.textSec, lineHeight:1.7, marginBottom:20 }}>{task.desc}</div>
                    <div style={{ display:"flex", gap:10 }}>
                      <BtnApprove onClick={handleTask} s={{ flex:2, padding:"14px 0", border:"none", borderRadius:20, background:"rgba(139,123,244,.12)", color:"#C4B8FF", border:"1px solid rgba(139,123,244,.3)", fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:bd, textAlign:"center", boxShadow:"0 0 14px rgba(139,123,244,.3), 0 0 36px rgba(139,123,244,.1)" }}>リマインド送信</BtnApprove>
                      <button type="button" onClick={handleTask} style={{ flex:1, padding:"14px 0", borderRadius:20, border:`1.5px solid ${C.border}`, background:"transparent", color:C.textSec, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:bd }}>受領済み</button>
                      <button type="button" onClick={skipTask} style={{ flex:1, padding:"14px 0", borderRadius:20, border:`1.5px solid ${C.border}`, background:"transparent", color:C.textMut, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:bd }}>スキップ</button>
                    </div>
                  </>)}
                </div>
              </div>
            )}
            {tasks.length>1&&(
              <div style={{ marginTop:16, display:"flex", alignItems:"center", gap:8, padding:"12px 16px", background:`${C.blue}04`, borderRadius:18 }}>
                <span style={{ fontSize:10, color:C.textMut, fontWeight:600 }}>次:</span>
                <span style={{ filter:"drop-shadow(0 0 6px rgba(255,255,255,.2))" }}>{typeIcon[tasks[(taskIdx+1)%tasks.length]?.type]}</span>
                <span style={{ fontSize:12, color:C.textSec }}>{tasks[(taskIdx+1)%tasks.length]?.title}</span>
              </div>
            )}
          </>
        )}
      </Card3></Rv>
    </PageShell>
  );
}

/* ═══════════════════════ BOOKS — Input + Ledger + Monthly ═══════════════════════ */
function BooksPage() {
  const [acctFilter, setAcctFilter] = useState([]);
  const [expPeriod, setExpPeriod] = useState("month");
  const [qDate, setQDate] = useState("2026-02-20");
  const [qAmount, setQAmount] = useState("");
  const [qAccount, setQAccount] = useState("");
  const [qMemo, setQMemo] = useState("");
  const accts = ["会議費","交際費","旅費交通費","消耗品費","通信費","外注費","広告宣伝費","地代家賃","水道光熱費","給料手当","雑費"];
  const Y = "\u00A5";
  const addQ = () => { if (!qAmount) return; setQAmount(""); setQMemo(""); setQAccount(""); };

  return (
    <PageShell title="仕訳帳" watermark={"仕訳\n帳"}>
      {/* Input bar */}
      <Rv><Card3 s={{ padding:"14px 20px", marginBottom:14 }}>
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          <input type="date" value={qDate} onChange={e=>setQDate(e.target.value)} style={{ padding:"8px 10px", border:"1px solid rgba(139,123,244,.15)", borderRadius:18, fontFamily:bd, fontSize:12, color:"#E0DAFF", outline:"none", width:140, boxSizing:"border-box", background:"rgba(139,123,244,.04)", caretColor:"#A89BFF" }} />
          <input value={qAmount} onChange={e=>setQAmount(e.target.value)} placeholder={`${Y} 金額`} style={{ padding:"8px 10px", border:"1px solid rgba(139,123,244,.15)", borderRadius:18, fontFamily:mono, fontSize:18, color:"#E0DAFF", outline:"none", width:130, boxSizing:"border-box", background:"rgba(139,123,244,.04)", caretColor:"#A89BFF" }} />
          <select value={qAccount} onChange={e=>setQAccount(e.target.value)} style={{ padding:"8px 10px", border:"1px solid rgba(139,123,244,.15)", borderRadius:18, fontFamily:bd, fontSize:12, color:qAccount?"#E0DAFF":"rgba(168,155,255,.35)", outline:"none", width:110, boxSizing:"border-box", background:"rgba(139,123,244,.04)" }}>
            <option value="" style={{ background: "#1a1a2e", color: "rgba(168,155,255,.5)" }}>科目（AI推定）</option>{accts.map(a=><option key={a} value={a} style={{ background: "#1a1a2e", color: "#E0DAFF" }}>{a}</option>)}
          </select>
          <input value={qMemo} onChange={e=>setQMemo(e.target.value)} placeholder="摘要・メモ" onKeyDown={e=>{if(e.key==="Enter")addQ();}} style={{ flex:1, padding:"8px 10px", border:"1px solid rgba(139,123,244,.15)", borderRadius:18, fontFamily:bd, fontSize:12, color:"#E0DAFF", outline:"none", boxSizing:"border-box", background:"rgba(139,123,244,.04)", caretColor:"#A89BFF" }} />
          <button type="button" style={{ padding:"8px 12px", border:"1.5px dashed rgba(139,123,244,.2)", borderRadius:18, background:"transparent", color:"rgba(168,155,255,.4)", fontSize:10, fontWeight:600, cursor:"pointer", fontFamily:bd, whiteSpace:"nowrap" }}>+ 証憑</button>
          <Mag onClick={addQ} s={{ padding:"8px 18px", border:"none", borderRadius:18, background:qAmount?"rgba(139,123,244,.15)":C.border, color:qAmount?"#C4B8FF":C.textMut, fontSize:12, fontWeight:700, cursor:qAmount?"pointer":"default", fontFamily:bd, whiteSpace:"nowrap", boxShadow:qAmount?"0 0 14px rgba(139,123,244,.3)":"none", textShadow:qAmount?"0 0 8px rgba(168,155,255,.4)":"none" }}>追加</Mag>
        </div>
      </Card3></Rv>

      {/* Journal Ledger (full) */}
      <Rv d={20}><JournalLedger acctFilter={acctFilter} onAcctFilter={setAcctFilter} /></Rv>

      {/* Expense Breakdown — Morph Ring with Period Selector */}
      <Rv d={60}><Card3 s={{ padding:28, marginBottom:20 }}>{(() => {
        const periods = [
          { id:"day", l:"日", sub:"2/18" },
          { id:"week", l:"週", sub:"2/12〜18" },
          { id:"month", l:"月", sub:"2月" },
          { id:"year", l:"年", sub:"2025年度" },
        ];
        const periodData = {
          day: [
            { label:"会議費", value:0.012, color:"rgba(168,155,255,.8)" },
            { label:"通信費", value:2.48, color:"rgba(139,123,244,.55)" },
          ],
          week: [
            { label:"通信費", value:2.648, color:"rgba(168,155,255,.8)" },
            { label:"工具器具備品", value:1.28, color:"rgba(139,123,244,.55)" },
            { label:"旅費交通費", value:0.142, color:"rgba(120,108,220,.4)" },
            { label:"消耗品費", value:0.348, color:"rgba(100,90,200,.35)" },
            { label:"会議費", value:0.012, color:"rgba(80,70,180,.3)" },
            { label:"交際費", value:0.324, color:"rgba(60,55,160,.25)" },
          ],
          month: [
            { label:"人件費", value:6.7, color:"rgba(168,155,255,.8)" },
            { label:"地代家賃", value:3.8, color:"rgba(139,123,244,.55)" },
            { label:"通信費", value:5.728, color:"rgba(120,108,220,.4)" },
            { label:"工具器具備品", value:1.28, color:"rgba(100,90,200,.35)" },
            { label:"交際費", value:0.509, color:"rgba(80,70,180,.3)" },
            { label:"その他", value:1.383, color:"rgba(60,55,160,.25)" },
          ],
          year: EXPENSE_DATA,
        };
        const periodLabels = { day:"2/18の経費", week:"今週の経費", month:"2月の経費", year:"年間経費" };
        return (<>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
            <div style={{ fontSize:18, color:"#fff", fontWeight:600, fontFamily:hd, letterSpacing:"-.01em" }}>経費内訳</div>
            <div style={{ display:"flex", gap:3, background:"rgba(139,123,244,.04)", borderRadius:14, padding:3, border:"1px solid rgba(139,123,244,.06)" }}>
              {periods.map(p => (
                <Mag key={p.id} onClick={()=>setExpPeriod(p.id)} s={{
                  padding:"6px 14px", borderRadius:12, border:"none", cursor:"pointer", fontFamily:bd, fontSize:11, fontWeight:expPeriod===p.id?700:500,
                  background:expPeriod===p.id?"rgba(139,123,244,.15)":"transparent",
                  color:expPeriod===p.id?"#C4B8FF":"rgba(168,155,255,.35)",
                  boxShadow:expPeriod===p.id?"0 0 14px rgba(139,123,244,.2)":"none",
                  transition:"all .25s cubic-bezier(.16,1,.3,1)",
                }}>
                  {p.l}
                </Mag>
              ))}
            </div>
          </div>
          <div style={{ fontSize:10, color:C.textMut, marginBottom:14, fontFamily:mono }}>
            {periods.find(p=>p.id===expPeriod)?.sub}
          </div>
          <ChartMorphRing data={periodData[expPeriod]} periodLabel={periodLabels[expPeriod]} />
        </>);
      })()}</Card3></Rv>
    </PageShell>
  );
}

/* ═══════════════════════ PLAN — Timeline + Filing ═══════════════════════ */
function PlanPage() {
  const months = ["4月","5月","6月","7月","8月","9月","10月","11月","12月","1月","2月","3月"];
  const currentMonth = 10;
  const [events, setEvents] = useState([
    { month:5, label:"住民税 1期", type:"tax" },
    { month:6, label:"源泉所得税 上期", type:"tax" },
    { month:7, label:"消費税 中間", type:"tax" },
    { month:8, label:"住民税 2期", type:"tax" },
    { month:10, label:"源泉所得税 2月分", type:"tax" },
    { month:10, label:"確定申告 3/15", type:"filing" },
    { month:11, label:"消費税申告 3/31", type:"filing" },
    { month:11, label:"法人税申告 5/31", type:"filing" },
  ]);
  const [addMonth, setAddMonth] = useState(null);
  const [newLabel, setNewLabel] = useState("");
  const [newType, setNewType] = useState("tax");

  const addEvent = () => {
    if (!newLabel || addMonth === null) return;
    setEvents(prev => [...prev, { month: addMonth, label: newLabel, type: newType }].sort((a,b) => a.month - b.month));
    setNewLabel(""); setAddMonth(null);
  };

  return (
    <PageShell title="スケジュール" watermark={"Sche\ndule"}>
      {/* Annual Timeline */}
      <Rv><Card3 s={{ padding:28, marginBottom:20 }}>
        <div style={{ fontSize:18, color:"#fff", fontWeight:600, marginBottom:20, fontFamily:hd, letterSpacing:"-.01em" }}>2025年度 年間スケジュール</div>
        {/* Timeline bar — clickable months */}
        <div style={{ display:"flex", gap:2, marginBottom:8 }}>
          {months.map((m,i)=>{
            const hasEvents = events.some(e=>e.month===i);
            return (
              <Mag key={i} onClick={()=>setAddMonth(addMonth===i?null:i)} s={{ flex:1, textAlign:"center", cursor:"pointer", padding:"4px 0", borderRadius:14, background:addMonth===i?`${C.blue}08`:"transparent", border:"none", fontFamily:bd, transition:"background .15s" }}>
                <div style={{ height:8, borderRadius:12, background:i<currentMonth?"rgba(139,123,244,.3)":i===currentMonth?"rgba(139,123,244,.6)":"rgba(139,123,244,.04)", marginBottom:4, transition:"background .3s", position:"relative", boxShadow:i===currentMonth?"0 0 8px rgba(139,123,244,.4), 0 0 18px rgba(139,123,244,.15)":"none" }}>
                  {hasEvents && <div style={{ position:"absolute", top:-3, right:"50%", transform:"translateX(50%)", width:5, height:5, borderRadius:"50%", background:i<=currentMonth?"#A89BFF":"rgba(139,123,244,.25)", border:"1.5px solid rgba(6,6,12,.9)", boxShadow:i<=currentMonth?"0 0 6px rgba(139,123,244,.5)":"none" }}/>}
                </div>
                <span style={{ fontSize:9, fontWeight:i===currentMonth||addMonth===i?800:500, color:addMonth===i?"#fff":i===currentMonth?"#fff":C.textMut }}>{m}</span>
              </Mag>
            );
          })}
        </div>

        {/* Add event form (appears when month is clicked) */}
        {addMonth !== null && (
          <div style={{ padding:"14px 16px", margin:"8px 0 14px", background:`${C.blue}04`, borderRadius:20, border:`1.5px solid ${C.blue}15` }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
              <span style={{ fontSize:11, fontWeight:700, color:C.blue }}>{months[addMonth]}に予定を追加</span>
            </div>
            <div style={{ display:"flex", gap:8, alignItems:"center" }}>
              <input value={newLabel} onChange={e=>setNewLabel(e.target.value)} placeholder="内容（例: 決算準備）" onKeyDown={e=>{if(e.key==="Enter")addEvent();}} style={{ flex:1, padding:"8px 12px", border:"1px solid rgba(139,123,244,.15)", borderRadius:18, fontFamily:bd, fontSize:12, outline:"none", background:"rgba(139,123,244,.04)", color:"#E0DAFF", caretColor:"#A89BFF" }} />
              <div style={{ display:"flex", gap:3 }}>
                {[{id:"tax",l:"税金"},{id:"filing",l:"申告"},{id:"task",l:"タスク"}].map(t=>(
                  <button key={t.id} type="button" onClick={()=>setNewType(t.id)} style={{ padding:"6px 12px", borderRadius:14, border:newType===t.id?"1px solid rgba(139,123,244,.3)":`1px solid rgba(255,255,255,.06)`, background:newType===t.id?"rgba(139,123,244,.12)":"transparent", color:newType===t.id?"#C4B8FF":"rgba(168,155,255,.35)", fontSize:10, fontWeight:700, cursor:"pointer", fontFamily:bd, boxShadow:newType===t.id?"0 0 10px rgba(139,123,244,.2)":"none" }}>{t.l}</button>
                ))}
              </div>
              <Mag onClick={addEvent} s={{ padding:"8px 18px", border:"none", borderRadius:18, background:newLabel?"rgba(139,123,244,.15)":C.border, color:newLabel?"#C4B8FF":C.textMut, fontSize:12, fontWeight:700, cursor:newLabel?"pointer":"default", fontFamily:bd, boxShadow:newLabel?"0 0 14px rgba(139,123,244,.3)":"none" }}>追加</Mag>
              <button type="button" onClick={()=>setAddMonth(null)} style={{ padding:"8px", border:"none", background:"transparent", color:C.textMut, fontSize:14, cursor:"pointer" }}>×</button>
            </div>
          </div>
        )}
        <div style={{ fontSize:11, color:C.textSec, marginBottom:16 }}>進捗: <strong style={{ color:"#fff" }}>{Math.round((currentMonth+1)/12*100)}%</strong> ({currentMonth+1}/12ヶ月)</div>
        {/* Events */}
        <div style={{ borderTop:`1px solid ${C.borderLt}`, paddingTop:14 }}>
          {events.filter(e=>e.month>=currentMonth).map((e,i)=>(
            <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 0", borderTop:i?`1px solid ${C.borderLt}`:"none" }}>
              <span style={{ fontSize:9, fontWeight:600, color:e.type==="filing"?"#E87070":e.type==="task"?"#fff":"rgba(255,255,255,.5)", padding:"3px 10px", background:"rgba(139,123,244,.04)", border:"1px solid rgba(139,123,244,.08)", borderRadius:8, flexShrink:0 }}>{e.type==="filing"?"申告":e.type==="task"?"タスク":"税金"}</span>
              <span style={{ flex:1, fontSize:12, fontWeight:600, color:C.dark }}>{e.label}</span>
              <span style={{ fontSize:10, color:C.textMut }}>{months[e.month]}</span>
            </div>
          ))}
        </div>
      </Card3></Rv>

      {/* Filing deadlines */}
      <Rv d={40}><Card3 s={{ padding:28, marginBottom:20 }}>
        <div style={{ fontSize:18, color:"#fff", fontWeight:600, marginBottom:20, fontFamily:hd, letterSpacing:"-.01em" }}>申告期限</div>
        {[
          { t:"確定申告書の提出", due:"2026.03.15", left:24, st:"URGENT", c:C.b1, pct:35 },
          { t:"消費税申告書の提出", due:"2026.03.31", left:40, st:"WIP", c:C.b2, pct:60 },
          { t:"法人税申告書の提出", due:"2026.05.31", left:101, st:"PENDING", c:C.b4, pct:10 },
        ].map((d,i)=>(
          <div key={i} style={{ padding:"18px 0", borderTop:i?`1px solid ${C.borderLt}`:"none", display:"flex", alignItems:"center", gap:20 }}>
            <span style={{ fontSize:9, fontWeight:600, color:"#fff", padding:"4px 10px", background:"rgba(139,123,244,.06)", border:"1px solid rgba(139,123,244,.12)", borderRadius:8, letterSpacing:".08em", flexShrink:0 }}>{d.st}</span>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:13, fontWeight:600, color:C.dark, marginBottom:4 }}>{d.t}</div>
              <div style={{ display:"flex", alignItems:"center", gap:10, fontSize:11, color:C.textMut }}><span>期限: {d.due}</span><span>|</span><span>残り{d.left}日</span></div>
            </div>
            <div style={{ width:120, height:6, background:"rgba(139,123,244,.04)", borderRadius:4, overflow:"hidden" }}><div style={{ height:"100%", width:`${d.pct}%`, background:"linear-gradient(90deg, rgba(139,123,244,.1), rgba(139,123,244,.4))", borderRadius:4, boxShadow:"0 0 6px rgba(139,123,244,.15)" }}/></div>
            <span style={{ fontSize:12, fontWeight:700, color:"rgba(255,255,255,.4)" }}>{d.pct}%</span>
          </div>
        ))}
      </Card3></Rv>

      {/* Revenue & Profit — 12 Month Runway Bar */}
      <Rv d={60}><Card3 s={{ padding:0, marginBottom:20, overflow:"hidden" }}>
        <div style={{ padding:"20px 28px 8px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{ fontSize:18, color:"#fff", fontWeight:600, fontFamily:hd, letterSpacing:"-.01em" }}>年間売上推移</span>
          <span style={{ fontSize:10, color:"#B0B0C8", fontFamily:mono }}>← スクラブで月を選択 →</span>
        </div>
        <div style={{ padding:"0 20px 0" }}>
          <ChartRunwayBar />
        </div>
        <div style={{ height:12 }} />
      </Card3></Rv>
    </PageShell>
  );
}

/* ════════════════════════════════ 申告書 (DOCS) ════════════════════════════════ */
function DocsPage() {
  return (
    <PageShell title="申告書" watermark={"申告\n書"}>
      {/* Filing Forms — original full format */}
      <Rv><FilingForms /></Rv>

      {/* Monthly Ledger — original full format */}
      <Rv d={40}><MonthlyLedger /></Rv>
    </PageShell>
  );
}

/* ════════════════════════════════ 資料作成 (EXPORT) ════════════════════════════════ */
/* ═══ PDF Preview Editor Component ═══ */
/* ═══ PDF Preview Editor Component ═══ */
function PdfPreviewEditor({ docId, formDef, editData, updateEdit, formEdits, setFormEdits, itemName, itemDesc }) {
  const ed = editData || {};
  const getV = (sec) => { const k = `${docId}:${sec}`; if (formEdits[k] !== undefined) return formEdits[k]; const row = formDef?.sections.flatMap(s=>s.rows).find(r=>r.sec===sec); return row ? row.v : null; };
  const setV = (sec, val) => setFormEdits(prev => ({...prev, [`${docId}:${sec}`]: val}));
  const isEd = (sec) => { const k = `${docId}:${sec}`; const orig = formDef?.sections.flatMap(s=>s.rows).find(r=>r.sec===sec)?.v; return formEdits[k] !== undefined && formEdits[k] !== orig; };
  const fmtV = (v) => v !== null && v !== undefined && v !== 0 ? Number(v).toLocaleString() : "";

  const cellFocus = (e) => { e.target.style.borderColor = "rgba(26,70,144,.35)"; e.target.style.background = "rgba(26,70,144,.04)"; };
  const cellBlur = (e, highlight) => { e.target.style.borderColor = highlight ? "rgba(232,184,75,.25)" : "transparent"; e.target.style.background = highlight ? "rgba(232,184,75,.06)" : "transparent"; };

  /* ── Dynamic header fields ── */
  const ALL_FIELDS = [
    { key: "taxOffice", label: "税務署長", def: "渋谷", group: "basic" },
    { key: "entity", label: "氏名 / 法人名", def: "クライアント名", group: "basic" },
    { key: "address", label: "住所 / 事業所", def: "東京都渋谷区神宮前3-1-1", group: "basic" },
    { key: "createdDate", label: "作成日", def: "令和8年2月25日", group: "date" },
    { key: "submitDate", label: "提出日", def: "令和8年3月15日", group: "date" },
    { key: "periodFrom", label: "事業年度（自）", def: "令和7年4月1日", group: "date" },
    { key: "periodTo", label: "事業年度（至）", def: "令和8年3月31日", group: "date" },
    { key: "repName", label: "代表者氏名", def: "山田 太郎", group: "extra" },
    { key: "tel", label: "電話番号", def: "未設定", group: "extra" },
    { key: "capital", label: "資本金", def: "10,000,000円", group: "extra" },
    { key: "employees", label: "従業員数", def: "6名", group: "extra" },
    { key: "industry", label: "業種", def: "情報通信業", group: "extra" },
    { key: "accountant", label: "税理士", def: "", group: "extra" },
    { key: "accountMethod", label: "経理方式", def: "税抜経理方式", group: "extra" },
    { key: "filingType", label: "申告区分", def: "確定", group: "extra" },
    { key: "corpNum", label: "法人番号", def: "", group: "extra" },
    { key: "note", label: "備考", def: "", group: "extra" },
  ];

  const DEFAULT_ACTIVE = ["taxOffice", "entity", "address", "createdDate", "submitDate", "periodFrom", "periodTo"];

  const [activeFields, setActiveFields] = useState(() => {
    return ed._activeFields || DEFAULT_ACTIVE;
  });
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [customLabel, setCustomLabel] = useState("");
  const [showCustom, setShowCustom] = useState(false);
  const [customFields, setCustomFields] = useState(() => ed._customFields || []);

  // Persist active field list into editData
  const syncFields = (fields, customs) => {
    updateEdit("_activeFields", fields);
    if (customs !== undefined) updateEdit("_customFields", customs);
  };

  const removeField = (key) => {
    const next = activeFields.filter(k => k !== key);
    setActiveFields(next);
    syncFields(next);
  };

  const addField = (key) => {
    if (!activeFields.includes(key)) {
      const next = [...activeFields, key];
      setActiveFields(next);
      syncFields(next);
    }
    setShowAddMenu(false);
  };

  const addCustomField = () => {
    if (!customLabel.trim()) return;
    const key = "custom_" + Date.now();
    const newCustom = [...customFields, { key, label: customLabel.trim() }];
    setCustomFields(newCustom);
    const next = [...activeFields, key];
    setActiveFields(next);
    syncFields(next, newCustom);
    setCustomLabel("");
    setShowCustom(false);
    setShowAddMenu(false);
  };

  const removeCustomField = (key) => {
    setCustomFields(prev => prev.filter(f => f.key !== key));
    const next = activeFields.filter(k => k !== key);
    setActiveFields(next);
    syncFields(next, customFields.filter(f => f.key !== key));
  };

  const allFieldDefs = [...ALL_FIELDS, ...customFields.map(f => ({ key: f.key, label: f.label, def: "", group: "custom" }))];
  const inactiveFields = allFieldDefs.filter(f => !activeFields.includes(f.key));
  const groupLabels = { basic: "基本情報", date: "日付", extra: "法人情報", custom: "カスタム" };

  const fieldInputStyle = { width: "100%", fontSize: 11, color: "#2a2a4a", border: "1px solid transparent", borderRadius: 4, padding: "2px 6px", fontFamily: bd, outline: "none", background: "transparent", boxSizing: "border-box", transition: "all .15s" };

  return (
    <div style={{ background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 4px 40px rgba(0,0,0,.5), 0 0 0 1px rgba(139,123,244,.06)", maxHeight: "65vh", overflowY: "auto" }}>

      {/* PDF Page header */}
      <div style={{ padding: "28px 36px 16px", borderBottom: "2px solid #1a4690" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
          <input value={ed.period || "令和7年度"} onChange={e => updateEdit("period", e.target.value)}
            style={{ fontSize: 10, color: "#666", border: "1px solid transparent", borderRadius: 4, padding: "2px 6px", fontFamily: bd, outline: "none", background: "transparent" }}
            onFocus={cellFocus} onBlur={e => cellBlur(e, false)} />
          <span style={{ fontSize: 8, color: "#bbb", fontStyle: "italic" }}>クリックで編集可</span>
        </div>
        <div style={{ textAlign: "center", marginBottom: 10 }}>
          <input value={ed.name || itemName || ""} onChange={e => updateEdit("name", e.target.value)}
            style={{ fontSize: 20, fontWeight: 700, color: "#1a4690", border: "1px solid transparent", borderRadius: 6, padding: "4px 12px", textAlign: "center", fontFamily: bd, outline: "none", background: "transparent", width: "80%", transition: "all .15s" }}
            onFocus={cellFocus} onBlur={e => cellBlur(e, false)} />
        </div>
        <div style={{ textAlign: "center", fontSize: 10, color: "#888" }}>{formDef?.subtitle || itemDesc || ""}</div>

        {/* ── Dynamic fields grid ── */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 14, padding: "10px 0", borderTop: "1px solid #ddd" }}>
          {activeFields.map(key => {
            const def = allFieldDefs.find(f => f.key === key);
            if (!def) return null;
            const isCustom = key.startsWith("custom_");
            return (
              <div key={key} style={{ position: "relative", flex: "1 1 calc(33.33% - 6px)", minWidth: 140, padding: "4px 0" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 2, marginBottom: 1 }}>
                  <span style={{ fontSize: 8, color: "#888", flex: 1 }}>{def.label}</span>
                  <button type="button" onClick={() => isCustom ? removeCustomField(key) : removeField(key)}
                    style={{ width: 14, height: 14, borderRadius: 4, border: "none", background: "transparent", color: "#ccc", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0, fontSize: 10, lineHeight: 1, flexShrink: 0, transition: "color .15s" }}
                    onMouseEnter={e => e.target.style.color = "#e55"}
                    onMouseLeave={e => e.target.style.color = "#ccc"}>×</button>
                </div>
                <input value={ed[key] || def.def} onChange={e => updateEdit(key, e.target.value)}
                  style={fieldInputStyle} onFocus={cellFocus} onBlur={e => cellBlur(e, false)} />
              </div>
            );
          })}

          {/* Add field button */}
          <div style={{ position: "relative", flex: "1 1 calc(33.33% - 6px)", minWidth: 140, padding: "4px 0", display: "flex", alignItems: "flex-end" }}>
            <button type="button" onClick={() => setShowAddMenu(!showAddMenu)}
              style={{ width: "100%", padding: "4px 8px", borderRadius: 6, border: "1.5px dashed #ccc", background: "transparent", color: "#999", fontSize: 10, cursor: "pointer", fontFamily: bd, display: "flex", alignItems: "center", justifyContent: "center", gap: 4, transition: "all .15s" }}
              onMouseEnter={e => { e.target.style.borderColor = "#1a4690"; e.target.style.color = "#1a4690"; }}
              onMouseLeave={e => { e.target.style.borderColor = "#ccc"; e.target.style.color = "#999"; }}>
              <span style={{ fontSize: 14, lineHeight: 1 }}>+</span> 項目を追加
            </button>

            {/* Add menu dropdown */}
            {showAddMenu && (
              <div style={{ position: "absolute", bottom: "100%", left: 0, marginBottom: 4, background: "#fff", border: "1px solid #ddd", borderRadius: 10, boxShadow: "0 6px 24px rgba(0,0,0,.15)", zIndex: 30, padding: "6px 0", minWidth: 200, maxHeight: 280, overflowY: "auto" }}
                onClick={e => e.stopPropagation()}>
                {/* Grouped available fields */}
                {Object.entries(groupLabels).map(([grp, grpLabel]) => {
                  const items = inactiveFields.filter(f => f.group === grp);
                  if (items.length === 0) return null;
                  return (
                    <div key={grp}>
                      <div style={{ fontSize: 8, color: "#999", fontWeight: 700, padding: "6px 12px 2px", letterSpacing: ".05em" }}>{grpLabel}</div>
                      {items.map(f => (
                        <button key={f.key} type="button" onClick={() => addField(f.key)}
                          style={{ display: "flex", alignItems: "center", gap: 6, width: "100%", padding: "6px 12px", border: "none", background: "transparent", color: "#2a2a4a", fontSize: 11, cursor: "pointer", fontFamily: bd, textAlign: "left", transition: "background .1s" }}
                          onMouseEnter={e => e.target.style.background = "#f4f4fa"}
                          onMouseLeave={e => e.target.style.background = "transparent"}>
                          <span style={{ color: "#1a4690", fontSize: 13, width: 16, textAlign: "center" }}>+</span>
                          {f.label}
                          {f.def && <span style={{ fontSize: 9, color: "#aaa", marginLeft: "auto" }}>{f.def.substring(0, 12)}{f.def.length > 12 ? "…" : ""}</span>}
                        </button>
                      ))}
                    </div>
                  );
                })}

                {/* Custom field input */}
                <div style={{ borderTop: "1px solid #eee", padding: "6px 12px" }}>
                  {!showCustom ? (
                    <button type="button" onClick={() => setShowCustom(true)}
                      style={{ display: "flex", alignItems: "center", gap: 6, width: "100%", padding: "4px 0", border: "none", background: "transparent", color: "#1a4690", fontSize: 11, cursor: "pointer", fontFamily: bd }}>
                      <span style={{ fontSize: 13 }}>✎</span> カスタム項目を作成…
                    </button>
                  ) : (
                    <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                      <input value={customLabel} onChange={e => setCustomLabel(e.target.value)}
                        placeholder="項目名を入力" autoFocus
                        onKeyDown={e => { if (e.key === "Enter") addCustomField(); if (e.key === "Escape") { setShowCustom(false); setCustomLabel(""); } }}
                        style={{ flex: 1, padding: "4px 8px", border: "1px solid #1a4690", borderRadius: 6, fontSize: 11, fontFamily: bd, outline: "none", color: "#2a2a4a" }} />
                      <button type="button" onClick={addCustomField}
                        style={{ padding: "4px 10px", borderRadius: 6, border: "none", background: "#1a4690", color: "#fff", fontSize: 10, fontWeight: 700, cursor: "pointer", fontFamily: bd }}>追加</button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* PDF Body */}
      {formDef && (
        <div style={{ padding: "16px 36px 28px" }}>
          {formDef.sections.map((sec, si) => (
            <div key={si} style={{ marginBottom: 16 }}>
              <div style={{ background: "#f0f4fa", padding: "6px 10px", borderRadius: 4, marginBottom: 2, border: "1px solid #d0d8e8" }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#1a4690" }}>{sec.heading}</span>
              </div>
              <div style={{ display: "flex", padding: "4px 10px", borderBottom: "1px solid #ccc", fontSize: 8, color: "#888", fontWeight: 600 }}>
                <span style={{ width: 30 }}>番号</span>
                <span style={{ flex: 1 }}>項目</span>
                <span style={{ width: 110, textAlign: "right" }}>金額</span>
              </div>
              {sec.rows.map((row, ri) => {
                const isBold = row.bold;
                const isTotal = row.l.includes("合計") || row.l.includes("申告納税") || row.l.includes("課税される") || row.l.includes("差引");
                const v = getV(row.sec);
                const edited = isEd(row.sec);
                return (
                  <div key={ri} style={{ display: "flex", alignItems: "center", padding: "3px 10px", borderBottom: "1px solid #eee", background: isTotal ? "#fdf8ee" : "transparent" }}>
                    <span style={{ width: 30, fontSize: 9, color: "#1a4690", fontWeight: 600 }}>{row.sec}</span>
                    <span style={{ flex: 1, fontSize: 11, color: "#2a2a4a", fontWeight: isBold ? 700 : 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.l}</span>
                    {row.v !== null && row.v !== undefined ? (
                      <input value={fmtV(v)} onChange={e => { const raw = e.target.value.replace(/[^0-9-]/g,""); setV(row.sec, raw === "" ? 0 : parseInt(raw)); }}
                        style={{ width: 110, padding: "2px 6px", textAlign: "right", border: edited ? "1px solid rgba(232,184,75,.25)" : "1px solid transparent", borderRadius: 4, fontSize: 12, fontFamily: bd, fontWeight: isBold ? 700 : 400, color: edited ? "#c58c00" : isBold ? "#cc0000" : "#2a2a4a", outline: "none", boxSizing: "border-box", background: edited ? "rgba(232,184,75,.06)" : "transparent", transition: "all .15s" }}
                        onFocus={cellFocus} onBlur={e => cellBlur(e, edited)} />
                    ) : (
                      <span style={{ width: 110, textAlign: "right", fontSize: 10, color: row.note?.includes("✓") ? "#2a8f4e" : row.note?.includes("⚠") ? "#c58c00" : "#888" }}>
                        {row.note?.includes("✓") ? "✓ 完了" : row.note?.includes("⚠") ? "⚠ 要確認" : row.note?.includes("→") ? "→ 未実行" : "—"}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
          <div style={{ marginTop: 20, paddingTop: 12, borderTop: "1px solid #ddd", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 8, color: "#aaa" }}>※ 本書は{ed.entity || "クライアント名"}の税務データに基づきAIが自動生成したものです。</span>
            <span style={{ fontSize: 8, color: "#aaa" }}>Zeirishi — AI Tax Intelligence Platform</span>
          </div>
        </div>
      )}
      {!formDef && (
        <div style={{ padding: "48px 36px", textAlign: "center" }}>
          <div style={{ fontSize: 13, color: "#888" }}>この書類のプレビューは準備中です</div>
          <div style={{ fontSize: 11, color: "#aaa", marginTop: 6 }}>{itemDesc}</div>
        </div>
      )}
    </div>
  );
}

function ExportPage() {
  const [selected, setSelected] = useState([]);
  const [step, setStep] = useState("select"); // "select" | "confirm" | "generating" | "done"
  const [progress, setProgress] = useState(0);
  const [generatedFiles, setGeneratedFiles] = useState([]);
  const [editData, setEditData] = useState({});
  const [expandedDoc, setExpandedDoc] = useState(null);
  const [formEdits, setFormEdits] = useState({}); // { "shinkoku:ア": 192000000, ... }

  const docList = [
    { cat: "決算整理", items: [
      { id: "kotei", name: "固定資産台帳", desc: "減価償却資産の明細", pages: 2 },
      { id: "kubun", name: "消費税区分別表", desc: "課税区分別取引集計", pages: 1 },
    ]},
    { cat: "決算書", items: [
      { id: "bs", name: "貸借対照表", desc: "資産・負債・純資産の状況", pages: 2 },
      { id: "pl", name: "損益計算書", desc: "収益・費用・利益の計算", pages: 2 },
    ]},
    { cat: "申告書", items: [
      { id: "shinkoku", name: "確定申告書B（第一表）", desc: "所得税及び復興特別所得税", pages: 2 },
      { id: "hojin", name: "法人税 別表一", desc: "各事業年度の所得に係る申告書", pages: 2 },
      { id: "shohi", name: "消費税申告書", desc: "消費税及び地方消費税", pages: 2 },
    ]},
    { cat: "提出書類", items: [
      { id: "uchiwake", name: "内訳書・概況書", desc: "勘定科目内訳明細書", pages: 3 },
      { id: "shokyaku", name: "償却資産申告書", desc: "固定資産税（償却資産）", pages: 1 },
      { id: "shiharai", name: "支払調書", desc: "報酬・料金等の支払調書", pages: 2 },
    ]},
    { cat: "締め作業", items: [
      { id: "tsukijime", name: "月締めチェックリスト", desc: "月次決算チェック 2月度", pages: 1 },
      { id: "nendojime", name: "年度締めレポート", desc: "決算締め処理ステータス", pages: 1 },
    ]},
    { cat: "電帳法", items: [
      { id: "denchoho", name: "電帳法対応ステータスレポート", desc: "電子帳簿保存法 準拠状況", pages: 2 },
    ]},
  ];

  const allItems = docList.flatMap(c => c.items);
  const totalPages = selected.reduce((sum, id) => sum + (allItems.find(i => i.id === id)?.pages || 0), 0);

  const toggle = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const selectAll = () => {
    if (selected.length === allItems.length) setSelected([]);
    else setSelected(allItems.map(i => i.id));
  };

  const selectCat = (cat) => {
    const ids = docList.find(c => c.cat === cat).items.map(i => i.id);
    const allSel = ids.every(id => selected.includes(id));
    if (allSel) setSelected(prev => prev.filter(id => !ids.includes(id)));
    else setSelected(prev => [...new Set([...prev, ...ids])]);
  };

  const goConfirm = () => {
    if (selected.length === 0) return;
    const init = {};
    selected.forEach(id => {
      const item = allItems.find(i => i.id === id);
      init[id] = { name: item.name, period: "令和7年度", entity: "クライアント名", note: "" };
    });
    setEditData(init);
    setStep("confirm");
  };

  const updateEdit = (id, field, val) => {
    setEditData(prev => ({ ...prev, [id]: { ...prev[id], [field]: val } }));
  };

  const removeFromConfirm = (id) => {
    setSelected(prev => prev.filter(x => x !== id));
    setEditData(prev => { const next = { ...prev }; delete next[id]; return next; });
    if (selected.length <= 1) setStep("select");
  };

  const startGenerate = () => {
    setStep("generating");
    setProgress(0);
    let p = 0;
    const iv = setInterval(() => {
      p += Math.random() * 15 + 5;
      if (p >= 100) {
        p = 100;
        clearInterval(iv);
        setTimeout(() => {
          setStep("done");
          setGeneratedFiles(selected.map(id => {
            const item = allItems.find(i => i.id === id);
            const ed = editData[id] || {};
            return { id, name: ed.name || item.name, pages: item.pages, size: `${(item.pages * 120 + Math.floor(Math.random() * 80))}KB`, period: ed.period, entity: ed.entity };
          }));
        }, 600);
      }
      setProgress(Math.min(100, Math.floor(p)));
    }, 200);
  };

  const reset = () => { setStep("select"); setGeneratedFiles([]); setProgress(0); };

  const edInputStyle = { padding: "8px 12px", border: "1px solid rgba(139,123,244,.15)", borderRadius: 14, fontFamily: bd, fontSize: 12, color: "#E0DAFF", outline: "none", background: "rgba(139,123,244,.04)", width: "100%", boxSizing: "border-box" };

  return (
    <PageShell title="資料作成" watermark={"資料\n作成"}>

      {/* ═══ STEP 1: SELECT ═══ */}
      {step === "select" && (
        <>
          <Rv><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <div>
              <div style={{ fontSize: 13, color: "#E0DAFF", fontWeight: 600, textShadow: "0 0 8px rgba(168,155,255,.2)" }}>書類を選択してPDFを作成</div>
              <div style={{ fontSize: 11, color: C.textMut, marginTop: 4 }}>申告書のデータから正式な書類フォーマットで出力します</div>
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <button type="button" onClick={selectAll}
                style={{ padding: "8px 16px", borderRadius: 100, border: "1px solid rgba(139,123,244,.2)", background: selected.length === allItems.length ? "rgba(139,123,244,.1)" : "transparent", color: selected.length === allItems.length ? "#C4B8FF" : C.textMut, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: bd }}>
                {selected.length === allItems.length ? "すべて解除" : "すべて選択"}
              </button>
              {selected.length > 0 && (
                <span style={{ fontSize: 11, color: "#A89BFF", fontWeight: 700 }}>{selected.length}件 / {totalPages}ページ</span>
              )}
            </div>
          </div></Rv>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {docList.map((cat, ci) => (
              <Rv key={ci} d={ci * 60}>
                <Card3 s={{ padding: 0, overflow: "hidden" }}>
                  <div onClick={() => selectCat(cat.cat)}
                    style={{ padding: "12px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
                    <span style={{ fontSize: 10, color: "rgba(168,155,255,.5)", fontWeight: 700, letterSpacing: ".1em" }}>{cat.cat}</span>
                    <span style={{ fontSize: 9, color: C.textMut }}>
                      {cat.items.filter(i => selected.includes(i.id)).length}/{cat.items.length}
                    </span>
                  </div>
                  {cat.items.map((item, ii) => {
                    const sel = selected.includes(item.id);
                    return (
                      <div key={item.id} onClick={() => toggle(item.id)}
                        style={{ padding: "14px 20px", borderBottom: ii < cat.items.length - 1 ? `1px solid rgba(255,255,255,.03)` : "none", display: "flex", alignItems: "center", gap: 14, cursor: "pointer", background: sel ? "rgba(139,123,244,.06)" : "transparent", transition: "all .2s" }}>
                        <div style={{ width: 22, height: 22, borderRadius: 8, border: sel ? "1.5px solid rgba(139,123,244,.5)" : "1.5px solid rgba(255,255,255,.1)", background: sel ? "rgba(139,123,244,.15)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all .2s", boxShadow: sel ? "0 0 10px rgba(139,123,244,.25)" : "none" }}>
                          {sel && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#C4B8FF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: sel ? 700 : 500, color: sel ? "#E0DAFF" : C.textSec, transition: "all .2s", textShadow: sel ? "0 0 8px rgba(168,155,255,.2)" : "none" }}>{item.name}</div>
                          <div style={{ fontSize: 10, color: C.textMut, marginTop: 2 }}>{item.desc}</div>
                        </div>
                        <span style={{ fontSize: 10, color: C.textMut, flexShrink: 0 }}>{item.pages}p</span>
                      </div>
                    );
                  })}
                </Card3>
              </Rv>
            ))}
          </div>

          <Rv d={300}>
            <div style={{ marginTop: 28, display: "flex", justifyContent: "center" }}>
              <Mag onClick={goConfirm} s={{
                padding: "16px 48px", borderRadius: 100,
                border: selected.length > 0 ? "1.5px solid rgba(139,123,244,.4)" : "1.5px solid rgba(255,255,255,.06)",
                background: selected.length > 0 ? "rgba(139,123,244,.1)" : "transparent",
                color: selected.length > 0 ? "#C4B8FF" : C.textMut,
                fontSize: 14, fontWeight: 700, cursor: selected.length > 0 ? "pointer" : "default", fontFamily: bd,
                boxShadow: selected.length > 0 ? "0 0 20px rgba(139,123,244,.3), 0 0 50px rgba(139,123,244,.1)" : "none",
                textShadow: selected.length > 0 ? "0 0 10px rgba(168,155,255,.4)" : "none",
                display: "flex", alignItems: "center", gap: 10,
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
                {selected.length > 0 ? `${selected.length}件を確認して作成` : "書類を選択してください"}
              </Mag>
            </div>
          </Rv>
        </>
      )}

      {/* ═══ STEP 2: CONFIRM / EDIT (PDF PREVIEW) ═══ */}
      {step === "confirm" && (() => {
        const previewDoc = expandedDoc || selected[0];
        const formDef = FORM_DEFS[previewDoc];
        const item = allItems.find(it => it.id === previewDoc);
        const totalEdits = Object.keys(formEdits).length;
        return (
        <>
          {/* Top bar */}
          <Rv><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button type="button" onClick={() => setStep("select")}
                style={{ padding: "6px 14px", borderRadius: 100, border: "1px solid rgba(255,255,255,.08)", background: "transparent", color: C.textSec, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: bd }}>
                ← 戻る
              </button>
              <span style={{ fontSize: 13, color: "#E0DAFF", fontWeight: 600 }}>プレビュー・編集</span>
              {totalEdits > 0 && <span style={{ fontSize: 9, color: "#E8B84B", fontWeight: 700, padding: "2px 8px", border: "1px solid rgba(232,184,75,.2)", borderRadius: 8, background: "rgba(232,184,75,.06)" }}>{totalEdits}件変更</span>}
            </div>
            <Mag onClick={startGenerate} s={{
              padding: "10px 32px", borderRadius: 100,
              border: "1.5px solid rgba(139,123,244,.4)", background: "rgba(139,123,244,.1)", color: "#C4B8FF",
              fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: bd,
              boxShadow: "0 0 16px rgba(139,123,244,.25)", textShadow: "0 0 8px rgba(168,155,255,.3)",
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 2h9l5 5v13a2 2 0 01-2 2H6a2 2 0 01-2-2V4a2 2 0 012-2z"/><path d="M14 2v6h6"/></svg>
              {selected.length}件を作成
            </Mag>
          </div></Rv>

          {/* Document tabs */}
          <Rv d={30}><div style={{ display: "flex", gap: 4, marginBottom: 16, overflowX: "auto", paddingBottom: 4 }}>
            {selected.map(id => {
              const it = allItems.find(x => x.id === id);
              const edc = Object.keys(formEdits).filter(k => k.startsWith(id + ":")).length;
              const active = id === previewDoc;
              return (
                <button key={id} type="button" onClick={() => setExpandedDoc(id)}
                  style={{ padding: "8px 16px", borderRadius: 14, border: active ? "1.5px solid rgba(139,123,244,.35)" : "1px solid rgba(255,255,255,.06)", background: active ? "rgba(139,123,244,.08)" : "transparent", color: active ? "#C4B8FF" : C.textMut, fontSize: 11, fontWeight: active ? 700 : 500, cursor: "pointer", fontFamily: bd, whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 6, flexShrink: 0, transition: "all .2s", boxShadow: active ? "0 0 12px rgba(139,123,244,.15)" : "none" }}>
                  {editData[id]?.name || it.name}
                  {edc > 0 && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#E8B84B", flexShrink: 0 }} />}
                </button>
              );
            })}
          </div></Rv>

          {/* PDF Preview Editor */}
          <Rv d={60}>
            <PdfPreviewEditor
              key={previewDoc}
              docId={previewDoc}
              formDef={formDef}
              editData={editData[previewDoc] || {}}
              updateEdit={(field, val) => updateEdit(previewDoc, field, val)}
              formEdits={formEdits}
              setFormEdits={setFormEdits}
              itemName={item?.name}
              itemDesc={item?.desc}
            />
          </Rv>

          {/* Bottom nav */}
          <Rv d={120}><div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 20 }}>
            {selected.length > 1 && (() => {
              const idx = selected.indexOf(previewDoc);
              return (
                <>
                  <button type="button" disabled={idx <= 0} onClick={() => setExpandedDoc(selected[idx - 1])}
                    style={{ padding: "10px 20px", borderRadius: 100, border: "1px solid rgba(255,255,255,.08)", background: "transparent", color: idx > 0 ? C.textSec : "rgba(255,255,255,.15)", fontSize: 11, fontWeight: 600, cursor: idx > 0 ? "pointer" : "default", fontFamily: bd }}>
                    ← 前の書類
                  </button>
                  <span style={{ fontSize: 11, color: C.textMut, alignSelf: "center" }}>{idx + 1} / {selected.length}</span>
                  <button type="button" disabled={idx >= selected.length - 1} onClick={() => setExpandedDoc(selected[idx + 1])}
                    style={{ padding: "10px 20px", borderRadius: 100, border: "1px solid rgba(255,255,255,.08)", background: "transparent", color: idx < selected.length - 1 ? C.textSec : "rgba(255,255,255,.15)", fontSize: 11, fontWeight: 600, cursor: idx < selected.length - 1 ? "pointer" : "default", fontFamily: bd }}>
                    次の書類 →
                  </button>
                </>
              );
            })()}
          </div></Rv>
        </>
        );
      })()}
      {/* ═══ STEP 3: GENERATING ═══ */}
      {step === "generating" && (
        <Rv><div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 300 }}>
          <div style={{ width: 320, textAlign: "center" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(139,123,244,.06)", border: "1.5px solid rgba(139,123,244,.2)", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 24, boxShadow: "0 0 20px rgba(139,123,244,.2)" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#A89BFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 2s linear infinite" }}><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>
            </div>
            <div style={{ height: 4, background: "rgba(139,123,244,.1)", borderRadius: 4, overflow: "hidden", marginBottom: 16 }}>
              <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg, #8B7BF4, #C4B8FF)", borderRadius: 4, transition: "width .2s", boxShadow: "0 0 12px rgba(139,123,244,.4)" }} />
            </div>
            <div style={{ fontSize: 14, color: "#E0DAFF", fontWeight: 600 }}>
              {progress < 30 ? "データ収集中..." : progress < 70 ? "PDF生成中..." : progress < 100 ? "最終処理中..." : "完了！"}
            </div>
            <div style={{ fontSize: 11, color: C.textMut, marginTop: 6 }}>{selected.length}件 · {progress}%</div>
          </div>
        </div></Rv>
      )}

      {/* ═══ STEP 4: DONE ═══ */}
      {step === "done" && (
        <>
          <Rv><div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(123,224,160,.1)", border: "1.5px solid rgba(123,224,160,.3)", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 16, boxShadow: "0 0 20px rgba(123,224,160,.2)" }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#7BE0A0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#E0DAFF", textShadow: "0 0 12px rgba(168,155,255,.2)" }}>{generatedFiles.length}件の書類を作成しました</div>
            <div style={{ fontSize: 12, color: C.textMut, marginTop: 6 }}>
              合計 {generatedFiles.reduce((s, f) => s + f.pages, 0)} ページ · {generatedFiles[0]?.entity}
            </div>
          </div></Rv>

          <Rv d={80}><Card3 s={{ padding: 0, overflow: "hidden" }}>
            {generatedFiles.map((f, i) => (
              <div key={f.id} style={{ padding: "16px 24px", borderBottom: i < generatedFiles.length - 1 ? `1px solid rgba(255,255,255,.04)` : "none", display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(139,123,244,.08)", border: "1px solid rgba(139,123,244,.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#A89BFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/></svg>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#E0DAFF" }}>{f.name}</div>
                  <div style={{ fontSize: 10, color: C.textMut, marginTop: 2 }}>{f.period} · {f.pages}ページ · {f.size}</div>
                </div>
                <Mag s={{ padding: "8px 18px", borderRadius: 100, border: "1px solid rgba(139,123,244,.25)", background: "rgba(139,123,244,.06)", color: "#C4B8FF", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: bd, display: "flex", alignItems: "center", gap: 6 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                  ダウンロード
                </Mag>
              </div>
            ))}
          </Card3></Rv>

          <Rv d={160}><div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 24 }}>
            <button type="button" onClick={reset}
              style={{ padding: "12px 28px", borderRadius: 100, border: "1px solid rgba(255,255,255,.08)", background: "transparent", color: C.textSec, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: bd }}>
              ← 書類選択に戻る
            </button>
            <Mag s={{ padding: "12px 28px", borderRadius: 100, border: "1.5px solid rgba(139,123,244,.35)", background: "rgba(139,123,244,.08)", color: "#C4B8FF", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: bd, boxShadow: "0 0 14px rgba(139,123,244,.25)", display: "flex", alignItems: "center", gap: 8 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
              すべてダウンロード（ZIP）
            </Mag>
          </div></Rv>
        </>
      )}
    </PageShell>
  );
}

/* ════════════════════════════════ 監査 (AUDIT) ════════════════════════════════ */

const LINES = [
  "税務調査を、\nあなたの味方に。",
  "書類をアップロード。\nそれだけで審査が始まる。",
  "調査官の目線で\nリスクを洗い出す。",
  "修正すべき箇所を\nひとつずつ、案内する。",
];

function CyclingText({ started, hidden }) {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!started) return;
    setTimeout(() => setVisible(true), 100);
    const iv = setInterval(() => {
      setVisible(false);
      setTimeout(() => { setIdx(i => (i+1) % LINES.length); setVisible(true); }, 900);
    }, 4000);
    return () => clearInterval(iv);
  }, [started]);
  return (
    <div style={{
      fontFamily: "-apple-system,'SF Pro Display','Helvetica Neue',sans-serif",
      fontSize: "clamp(30px,4.2vw,54px)",
      fontWeight: 700, color: "#fff",
      letterSpacing: ".06em", textAlign: "center", lineHeight: 1.12,
      minHeight: "2.4em", whiteSpace: "pre-line",
      opacity: hidden ? 0 : visible ? 1 : 0,
      transform: visible && !hidden ? "translateY(0)" : "translateY(16px)",
      transition: "opacity 1.6s cubic-bezier(.16,1,.3,1), transform 1.6s cubic-bezier(.16,1,.3,1)",
      pointerEvents: "none",
    }}>{LINES[idx]}</div>
  );
}

// ── Shared 3D renderer util ──
function use3D(ref, buildScene, W, H) {
  useEffect(() => {
    if (!ref.current) return;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000, 0);
    ref.current.appendChild(renderer.domElement);

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(26, W/H, 0.1, 100);
    camera.position.set(0, 0, 8);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const eS = new THREE.Scene();
    // High-contrast chrome environment: blazing whites + deep blacks
    [[0xffffff,30,-2,6,4],   // main blazing key
     [0xffffff,20, 2,5,3],   // secondary bright
     [0xffffff,15,-6,3,2],   // left fill
     [0xffffff,12, 6,2,2],   // right fill
     [0xffffff,25, 0,4,-5],  // back rim = bright outline
     [0xffffff,20,-4,3,-4],
     [0xffffff,20, 4,3,-4],
     [0xffffff,15, 0,8, 0],  // top blaze
    ].forEach(([c,i,x,y,z])=>{
      const l=new THREE.DirectionalLight(c,i); l.position.set(x,y,z); eS.add(l);
    });
    // Pure black ambient = maximum chrome contrast
    eS.add(new THREE.AmbientLight(0x000000,1));
    scene.environment = pmrem.fromScene(eS).texture;
    pmrem.dispose();

    [[0xffffff,8,-2.5,5,7],[0xffffff,5,0,8,1],[0xffffff,4,-8,2,1],
     [0xffffff,3,8,1,1],[0xffffff,3,0,-7,1],[0xffffff,9,0,1,-9],
     [0xffffff,6,-4,3,-7],[0xffffff,6,4,3,-7]].forEach(([c,i,x,y,z])=>{
      const l=new THREE.DirectionalLight(c,i); l.position.set(x,y,z); scene.add(l);
    });
    scene.add(new THREE.AmbientLight(0x0a0a0a,1));
    const gl=new THREE.PointLight(0xffffff,10,14); gl.position.set(-2.8,3.2,5.5); scene.add(gl);
    const rimL=new THREE.PointLight(0xffffff,12,12); rimL.position.set(-5,0,-4); scene.add(rimL);
    const rimR=new THREE.PointLight(0xffffff,12,12); rimR.position.set(5,0,-4); scene.add(rimR);
    const rimT=new THREE.PointLight(0xffffff,10,12); rimT.position.set(0,6,-3); scene.add(rimT);

    const cleanup = buildScene(scene, renderer, camera, ref, W, H);

    return () => { cleanup?.(); renderer.dispose(); if(ref.current) ref.current.innerHTML=""; };
  }, []);
}

// ── FOLDER ──
function Folder3D({ hovered, pressed, dragOver, dropped, onDroppedDone }) {
  const ref = useRef(null);
  const st  = useRef({ hovered:false, pressed:false, dragOver:false, dropped:false, openAmt:0, absorb:0 });
  useEffect(()=>{ st.current.hovered  = hovered;  },[hovered]);
  useEffect(()=>{ st.current.pressed  = pressed;  },[pressed]);
  useEffect(()=>{ st.current.dragOver = dragOver; },[dragOver]);
  useEffect(()=>{
    if(dropped){ st.current.dropped=true; setTimeout(()=>{ st.current.dropped=false; onDroppedDone?.(); },2200); }
  },[dropped]);

  use3D(ref, (scene, renderer, camera, mountRef, W, H) => {
    const mat = (color) => new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(color), metalness:0.92, roughness:0.07,
      clearcoat:1, clearcoatRoughness:0.01, reflectivity:1, ior:1.9, envMapIntensity:3.2,
      emissive: new THREE.Color(0x000000), emissiveIntensity:0,
    });
    const mats = [];
    const M = (c) => { const m=mat(c); mats.push(m); return m; };

    const RS=(w,h,r)=>{ const s=new THREE.Shape(),x=-w/2,y=-h/2; s.moveTo(x+r,y); s.lineTo(x+w-r,y); s.absarc(x+w-r,y+r,r,-Math.PI/2,0,false); s.lineTo(x+w,y+h-r); s.absarc(x+w-r,y+h-r,r,0,Math.PI/2,false); s.lineTo(x+r,y+h); s.absarc(x+r,y+h-r,r,Math.PI/2,Math.PI,false); s.lineTo(x,y+r); s.absarc(x+r,y+r,r,Math.PI,3*Math.PI/2,false); return s; };
    const EX=s=>new THREE.ExtrudeGeometry(s,{depth:.32,bevelEnabled:true,bevelThickness:.11,bevelSize:.11,bevelSegments:16,curveSegments:48});

    const bk=new THREE.Mesh(EX(RS(3.9,2.15,.26)),M(0x1c1c1e)); bk.position.z=-.30; scene.add(bk);
    const ts=new THREE.Shape(); ts.moveTo(-1.95,1.075); ts.lineTo(-1.95+1.22-0.17*1.7,1.075); ts.absarc(-1.95+1.22-0.17*1.4,1.075+0.17*0.9,0.17*1.2,-Math.PI/2,0,false); ts.lineTo(-1.95+1.22,1.075+0.44-0.17); ts.absarc(-1.95+1.22-0.17,1.075+0.44-0.17,0.17,0,Math.PI/2,false); ts.lineTo(-1.95+0.17,1.075+0.44); ts.absarc(-1.95+0.17,1.075+0.44-0.17,0.17,Math.PI/2,Math.PI,false); ts.lineTo(-1.95,1.075);
    const tb=new THREE.Mesh(EX(ts),M(0x1c1c1e)); tb.position.z=-.30; scene.add(tb);
    const frGeo=EX(RS(3.7,1.90,.22)); frGeo.translate(0,0.95,0);
    const fr=new THREE.Mesh(frGeo,M(0x1c1c1e)); fr.position.set(0,-1.08,0.05); scene.add(fr);
    const all=[bk,tb,fr];

    let mx=0,my=0,smx=0,smy=0;
    const cv=renderer.domElement;
    const onMv=e=>{ const r=mountRef.current?.getBoundingClientRect(); if(!r) return; mx=((e.clientX-r.left)/W-.5)*2; my=((e.clientY-r.top)/H-.5)*2; };
    cv.addEventListener("mousemove",onMv); cv.addEventListener("mouseleave",()=>{mx=0;my=0;});

    let raf; const clock=new THREE.Clock();
    const loop=()=>{
      raf=requestAnimationFrame(loop); const t=clock.getElapsedTime(); const s=st.current;
      smx+=(mx-smx)*.055; smy+=(my-smy)*.055;
      const openT=s.dragOver||s.dropped?1:0; s.openAmt+=(openT-s.openAmt)*(s.dropped?.04:.08);
      fr.rotation.x=-s.openAmt*0.55;
      const glowT=s.dragOver?.1:s.hovered?.04:0;
      mats.forEach(m=>{ m.emissiveIntensity+=(glowT-m.emissiveIntensity)*.1; m.emissive.set(s.dragOver?0x2244ff:0x111111); });
      const floatY=Math.sin(t)*.10, sc=s.pressed?.88:s.hovered?1.04:1;
      [bk,tb].forEach(m=>{ m.rotation.x=smy*.24+Math.sin(t*.55)*.018; m.rotation.y=-smx*.30+Math.sin(t*.42)*.022; m.scale.x+=(sc-m.scale.x)*.12; m.scale.y=m.scale.z=m.scale.x; });
      fr.rotation.y=-smx*.30+Math.sin(t*.42)*.022; fr.scale.x+=(sc-fr.scale.x)*.12; fr.scale.y=fr.scale.z=fr.scale.x;
      bk.position.y=floatY; tb.position.y=floatY; fr.position.y=-1.08+floatY;
      renderer.render(scene,camera);
    };
    loop();
    return ()=>cancelAnimationFrame(raf);
  }, 340, 280);

  return <div ref={ref} style={{width:340,height:280}}/>;
}

// ── NUMERIC: 3D extruded glowing numbers ──
function Calc3D({ hovered, pressed }) {
  const ref = useRef(null);
  const st  = useRef({ hovered:false, pressed:false });
  useEffect(()=>{ st.current.hovered=hovered; },[hovered]);
  useEffect(()=>{ st.current.pressed=pressed; },[pressed]);

  useEffect(() => {
    if (!ref.current) return;
    const W = 340, H = 280;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000, 0);
    ref.current.appendChild(renderer.domElement);

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(28, W/H, 0.1, 100);
    camera.position.set(0, 0, 7);

    // Diamond studio env — blinding from every angle
    const pmrem = new THREE.PMREMGenerator(renderer);
    const eS = new THREE.Scene();
    // 16 directions for maximum reflection coverage
    const el=[
      [0xffffff,40,-2,6,4],[0xffffff,30,2,5,3],[0xffffff,28,-6,2,2],
      [0xffffff,24,6,1,2],[0xffffff,36,0,5,-5],[0xffffff,30,-4,2,-4],
      [0xffffff,30,4,2,-4],[0xffffff,20,0,-4,2],[0xffffff,28,0,8,0],
      [0xffffff,24,-8,4,0],[0xffffff,24,8,4,0],[0xffffff,20,3,3,6],
      [0xffffff,20,-3,3,6],[0xffffff,18,0,-6,-2],[0xffffff,18,5,-2,3],
      [0xffffff,18,-5,-2,3],
    ];
    el.forEach(([col,i,x,y,z])=>{
      const l=new THREE.DirectionalLight(col,i); l.position.set(x,y,z); eS.add(l);
    });
    eS.add(new THREE.AmbientLight(0x888888,2.5));
    scene.environment = pmrem.fromScene(eS).texture;
    pmrem.dispose();

    // Mirror-finish liquid black — maximum sparkle
    const mat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0x383840), metalness:1.0, roughness:0.0,
      clearcoat:1, clearcoatRoughness:0.0, reflectivity:1, ior:2.8,
      envMapIntensity:16.0,
      emissive: new THREE.Color(0x8899aa), emissiveIntensity:0.40,
    });

    // Segment dimensions — tall & narrow like a real digital display
    const SW  = 0.10;   // stroke thickness (slightly thicker)
    const SLV = 0.52;   // vertical segment length
    const SLH = 0.36;   // horizontal segment length (narrower than vertical → tall digits)
    const GAP = 0.025;
    const DPT = 0.20;   // extrude depth
    const BV  = 0.03;

    const rR = (x,y,w,h) => {
      const r = 0.035, s = new THREE.Shape();
      s.moveTo(x+r,y); s.lineTo(x+w-r,y); s.absarc(x+w-r,y+r,r,-Math.PI/2,0,false);
      s.lineTo(x+w,y+h-r); s.absarc(x+w-r,y+h-r,r,0,Math.PI/2,false);
      s.lineTo(x+r,y+h); s.absarc(x+r,y+h-r,r,Math.PI/2,Math.PI,false);
      s.lineTo(x,y+r); s.absarc(x+r,y+r,r,Math.PI,3*Math.PI/2,false);
      return s;
    };
    const EX = s => new THREE.ExtrudeGeometry(s,{
      depth:DPT, bevelEnabled:true, bevelThickness:BV, bevelSize:BV,
      bevelSegments:6, curveSegments:16,
    });

    // Segment positions — centered on origin, tall aspect ratio
    const totH = SLV*2 + SW*3 + GAP*4;  // total digit height
    const totW = SLH + SW*2 + GAP*2;    // total digit width
    const oY   = -totH/2;
    const oX   = -totW/2;

    // [name]: [x, y, w, h]
    const SEGS = {
      top: [oX+SW+GAP,  oY+SLV*2+SW*2+GAP*3, SLH, SW],
      mid: [oX+SW+GAP,  oY+SLV  +SW  +GAP*2, SLH, SW],
      bot: [oX+SW+GAP,  oY                  , SLH, SW],
      tl:  [oX,          oY+SLV+SW*2+GAP*2,   SW,  SLV],
      bl:  [oX,          oY+SW+GAP,            SW,  SLV],
      tr:  [oX+SLH+SW+GAP*2, oY+SLV+SW*2+GAP*2, SW, SLV],
      br:  [oX+SLH+SW+GAP*2, oY+SW+GAP,          SW, SLV],
    };

    const SEG_DIGITS = {
      '0':['top','tl','tr','bl','br','bot'],
      '1':['tr','br'],
      '2':['top','tr','mid','bl','bot'],
      '3':['top','tr','mid','br','bot'],
      '4':['tl','tr','mid','br'],
      '5':['top','tl','mid','br','bot'],
      '6':['top','tl','mid','bl','br','bot'],
      '7':['top','tr','br'],
      '8':['top','tl','tr','mid','bl','br','bot'],
      '9':['top','tl','tr','mid','br','bot'],
    };

    const makeDigit = (d, ox) => {
      const grp = new THREE.Group();
      (SEG_DIGITS[d]||[]).forEach(name=>{
        const [x,y,w,h] = SEGS[name];
        const geo = EX(rR(x,y,w,h));
        geo.translate(0,0,-DPT/2);
        grp.add(new THREE.Mesh(geo, mat));
      });
      grp.position.x = ox;
      grp.userData.baseY = 0;
      return grp;
    };

    const DIGITS  = ['1','2','3','4','5'];
    const SPACING = totW + 0.20;
    const TOTAL   = (DIGITS.length-1)*SPACING;
    const groups  = [];
    DIGITS.forEach((d,i) => {
      const g = makeDigit(d, i*SPACING - TOTAL/2);
      scene.add(g); groups.push(g);
    });



    // Folder-matching scene lights
    [[0xffffff,8,-2.5,5,7],[0xffffff,5,0,8,1],[0xffffff,4,-8,2,1],
     [0xffffff,3,8,1,1],[0xffffff,9,0,1,-9],[0xffffff,6,-4,3,-7],[0xffffff,6,4,3,-7],
    ].forEach(([col,i,x,y,z])=>{ const l=new THREE.DirectionalLight(col,i); l.position.set(x,y,z); scene.add(l); });
    scene.add(new THREE.AmbientLight(0x0a0a0a,1));
    const glint=new THREE.PointLight(0xffffff,40,14);  glint.position.set(-2.8,3.2,5.5); scene.add(glint);
    const glint2=new THREE.PointLight(0xffffff,28,10); glint2.position.set(2.5,2.5,5); scene.add(glint2);
    const glint3=new THREE.PointLight(0xffffff,20,8);  glint3.position.set(0,-2,5); scene.add(glint3);
    const glint4=new THREE.PointLight(0xffffff,24,10); glint4.position.set(0,3,6); scene.add(glint4);
    // Spotlight: upper-left diagonal same as folder
    const spot2=new THREE.SpotLight(0xffffff,100,18,Math.PI*0.14,0.18,1.2);
    spot2.position.set(-4,6,4); spot2.target.position.set(0,0,0);
    scene.add(spot2); scene.add(spot2.target);
    // Second spotlight from right
    const spot3=new THREE.SpotLight(0xffffff,70,16,Math.PI*0.14,0.22,1.2);
    spot3.position.set(4,5,3); spot3.target.position.set(0,0,0);
    scene.add(spot3); scene.add(spot3.target);
    const rimL=new THREE.PointLight(0xffffff,30,12); rimL.position.set(-5,0,-4); scene.add(rimL);
    const rimR=new THREE.PointLight(0xffffff,30,12); rimR.position.set(5,0,-4); scene.add(rimR);
    const rimT=new THREE.PointLight(0xffffff,26,12); rimT.position.set(0,7,-3); scene.add(rimT);
    const rimB=new THREE.PointLight(0xffffff,18,10); rimB.position.set(0,-5,-3); scene.add(rimB);
    // Animated sparkle lights
    const spark1=new THREE.PointLight(0xffffff,28,6); scene.add(spark1);
    const spark2=new THREE.PointLight(0xffffff,24,5); scene.add(spark2);
    const spark3=new THREE.PointLight(0xffffff,20,5); scene.add(spark3);
    const spark4=new THREE.PointLight(0xffffff,18,4); scene.add(spark4);

    let mx=0,my=0,smx=0,smy=0;
    const cv=renderer.domElement;
    const onMv=e=>{ const r=ref.current?.getBoundingClientRect(); if(!r) return; mx=((e.clientX-r.left)/W-.5)*2; my=((e.clientY-r.top)/H-.5)*2; };
    cv.addEventListener("mousemove",onMv); cv.addEventListener("mouseleave",()=>{mx=0;my=0;});

    let raf; const clock=new THREE.Clock();
    const loop=()=>{
      raf=requestAnimationFrame(loop); const t=clock.getElapsedTime(); const s=st.current;
      smx+=(mx-smx)*.055; smy+=(my-smy)*.055;
      const sc=s.pressed?.88:s.hovered?1.05:1;
      const gt=s.hovered?0.58:0.40;
      mat.emissiveIntensity+=(gt-mat.emissiveIntensity)*.1;
      mat.emissive.set(0x8899aa);

      // Animate sparkle lights orbiting the digits
      spark1.position.set(Math.cos(t*2.1)*3.5,  Math.sin(t*1.7)*2.5,  Math.cos(t*1.3)*2+4);
      spark2.position.set(Math.cos(t*1.8+2)*3,   Math.sin(t*2.3+1)*2,   Math.sin(t*1.9)*2+4);
      spark3.position.set(Math.cos(t*3.2+4)*2.5,  Math.sin(t*1.4+3)*3,  Math.cos(t*2.8+2)*1.5+3);
      spark4.position.set(Math.cos(t*2.6+1)*2,    Math.sin(t*3.1+5)*1.5, Math.sin(t*2.4+3)*2+3);
      groups.forEach((g,i)=>{
        const fy=Math.sin(t+i*0.45)*.09;
        g.rotation.x=smy*.24+Math.sin(t*.55)*.016;
        g.rotation.y=-smx*.30+Math.sin(t*.42+i*.18)*.020;
        g.scale.x+=(sc-g.scale.x)*.12; g.scale.y=g.scale.z=g.scale.x;
        g.position.y=fy;
      });

      renderer.render(scene,camera);
    };
    loop();
    return ()=>{ cancelAnimationFrame(raf); renderer.dispose(); if(ref.current) ref.current.innerHTML=""; };
  },[]);

  return <div ref={ref} style={{width:340,height:280,cursor:"pointer"}}/>;
}


// ── Offscreen marble helper ──
function useWavePill(cvRef, W, H, drawBg) {
  const stRef = useRef({ hov:false, wave:0, mx:0.5 });
  const rafRef = useRef(null);
  useEffect(()=>{
    const cv = cvRef.current; if(!cv) return;
    cv.width=W*2; cv.height=H*2; cv.style.width=W+"px"; cv.style.height=H+"px";
    const ctx = cv.getContext("2d"); ctx.scale(2,2);
    const off = document.createElement("canvas");
    off.width=W; off.height=H;
    const octx = off.getContext("2d");
    let t = 0;
    const pill = (amp, mx) => {
      ctx.beginPath(); const r=H/2-1;
      ctx.moveTo(r,1);
      for(let x=r;x<=W-r;x+=2){const p=(x-r)/(W-2*r),d=Math.abs(p-mx);const la=amp*Math.exp(-d*d*8);ctx.lineTo(x,1+Math.sin(p*Math.PI*3-t*4)*la+Math.sin(p*Math.PI*5-t*6)*la*0.4);}
      ctx.arc(W-r,H/2,r,-Math.PI/2,Math.PI/2);
      for(let x=W-r;x>=r;x-=2){const p=(x-r)/(W-2*r),d=Math.abs(p-mx);const la=amp*Math.exp(-d*d*8);ctx.lineTo(x,H-1-Math.sin(p*Math.PI*3-t*4)*la-Math.sin(p*Math.PI*5-t*6)*la*0.4);}
      ctx.arc(r,H/2,r,Math.PI/2,-Math.PI/2); ctx.closePath();
    };
    const draw = () => {
      rafRef.current = requestAnimationFrame(draw); t+=0.014;
      const s = stRef.current; s.wave+=((s.hov?5.5:0.4)-s.wave)*0.08;
      ctx.clearRect(0,0,W,H);
      drawBg(octx, W, H, t, s);
      pill(s.wave, s.mx); ctx.save(); ctx.clip();
      ctx.drawImage(off, 0, 0, W, H);
      const sh=ctx.createRadialGradient(W/2,2,0,W/2,2,W*0.6);
      sh.addColorStop(0,"rgba(255,255,255,.38)"); sh.addColorStop(1,"rgba(255,255,255,0)");
      ctx.fillStyle=sh; ctx.fillRect(0,0,W,H*0.5);
      const vig=ctx.createRadialGradient(W/2,H/2,H*0.05,W/2,H/2,W*0.68);
      vig.addColorStop(0,"rgba(0,0,0,0)"); vig.addColorStop(1,"rgba(0,0,0,.46)");
      ctx.fillStyle=vig; ctx.fillRect(0,0,W,H);
      ctx.restore();
      pill(s.wave, s.mx);
      ctx.strokeStyle=s.hov?"rgba(255,255,255,.62)":"rgba(255,255,255,.25)";
      ctx.lineWidth=1.2; ctx.stroke();
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return stRef;
}

const marbleBW = (ctx,W,H,t,s) => {
  const img = ctx.createImageData(W,H); const d=img.data;
  const spd = s.hov?0.35:0.14;
  for(let py=0;py<H;py++) for(let px=0;px<W;px++){
    const nx=px*0.013,ny=py*0.019,tw=t*spd;
    const v=(Math.sin((nx*2.1+ny*1.3+tw)+Math.sin((nx*3.4-ny*1.8+tw*0.7))*1.4)*0.5
            +Math.sin((nx*1.2-ny*2.6-tw*0.5)+Math.sin((ny*4.1+nx*0.9-tw*0.3))*1.1)*0.35
            +Math.sin((nx+ny)*3.0+tw*0.8)*0.15);
    const b=Math.floor((Math.sin(v*Math.PI)+1)*0.5*255);
    const i=(py*W+px)*4; d[i]=b;d[i+1]=b;d[i+2]=b;d[i+3]=s.hov?215:175;
  }
  ctx.putImageData(img,0,0);
};

// ── Marble pill button ──
function GlossyButton({ children, onClick, hovered, onMouseEnter, onMouseLeave, onPointerDown: onPD, onPointerUp: onPU }) {
  const W=280, H=66;
  const cvRef = useRef(null);
  const btnRef = useRef(null);
  const [pressed, setPressed] = React.useState(false);
  const stRef = useWavePill(cvRef, W, H, marbleBW);

  const onME = () => { stRef.current.hov=true; onMouseEnter?.(); };
  const onML = () => { stRef.current.hov=false; setPressed(false); onMouseLeave?.(); };
  const onMM = e => { const r=btnRef.current?.getBoundingClientRect(); if(r) stRef.current.mx=(e.clientX-r.left)/r.width; };
  const onDown = () => { setPressed(true); onPD?.(); };
  const onUp   = () => { setPressed(false); onPU?.(); };

  return (
    <div ref={btnRef}
      onClick={onClick}
      onMouseEnter={onME} onMouseLeave={onML} onMouseMove={onMM}
      onPointerDown={onDown} onPointerUp={onUp}
      style={{
        position:"relative", display:"inline-flex", alignItems:"center", justifyContent:"center",
        width:W, height:H, cursor:"pointer", userSelect:"none",
        transform: pressed?"scale(.94)": hovered?"scale(1.06)":"scale(1)",
        transition:"transform .2s cubic-bezier(.34,1.56,.64,1)",
        filter: hovered
          ? "drop-shadow(0 0 28px rgba(255,255,255,.45)) drop-shadow(0 10px 40px rgba(255,255,255,.22))"
          : "drop-shadow(0 0 12px rgba(255,255,255,.18))",
      }}>
      <canvas ref={cvRef} style={{position:"absolute",inset:0,pointerEvents:"none",borderRadius:999}}/>
      <span style={{
        position:"relative", zIndex:1, pointerEvents:"none",
        fontFamily:"-apple-system,'SF Pro Display',sans-serif",
        fontSize:20, fontWeight:800, letterSpacing:".18em",
        color:"#fff",
        textShadow:"0 0 18px rgba(255,255,255,.95), 0 0 45px rgba(255,255,255,.6), 0 2px 10px rgba(0,0,0,.9)",
      }}>{children}</span>
    </div>
  );
}


// ── Client selection button — same marble wave pill as GlossyButton ──
function ClientGlossyButton({ co, onClick }) {
  const W = 640, H = 66;
  const cvRef = useRef(null);
  const btnRef = useRef(null);
  const [hov, setHov] = React.useState(false);
  const [pressed, setPressed] = React.useState(false);
  const stRef = useWavePill(cvRef, W, H, marbleBW);

  return (
    <div ref={btnRef}
      onClick={onClick}
      onMouseEnter={() => { stRef.current.hov = true; setHov(true); }}
      onMouseLeave={() => { stRef.current.hov = false; setHov(false); setPressed(false); }}
      onMouseMove={e => { const r = btnRef.current?.getBoundingClientRect(); if (r) stRef.current.mx = (e.clientX - r.left) / r.width; }}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      style={{
        position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between",
        width: "100%", height: H, cursor: "pointer", userSelect: "none",
        borderRadius: 999, overflow: "hidden",
        transform: pressed ? "scale(.97)" : hov ? "scale(1.02)" : "scale(1)",
        transition: "transform .2s cubic-bezier(.34,1.56,.64,1)",
        filter: hov
          ? "drop-shadow(0 0 28px rgba(255,255,255,.45)) drop-shadow(0 10px 40px rgba(255,255,255,.22))"
          : "drop-shadow(0 0 12px rgba(255,255,255,.18))",
      }}>
      <canvas ref={cvRef} style={{ position: "absolute", inset: 0, pointerEvents: "none", borderRadius: 999 }} />
      {/* Left: status dot + name */}
      <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: 14, paddingLeft: 28, pointerEvents: "none" }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: co.statusCol, boxShadow: `0 0 8px ${co.statusCol}` }} />
        <span style={{
          fontFamily: "-apple-system,'SF Pro Display',sans-serif",
          fontSize: 17, fontWeight: 800, letterSpacing: ".04em",
          color: "#fff",
          textShadow: "0 0 18px rgba(255,255,255,.95), 0 0 45px rgba(255,255,255,.6), 0 2px 10px rgba(0,0,0,.9)",
        }}>{co.name}</span>
      </div>
      {/* Right: industry + revenue */}
      <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: 20, paddingRight: 28, pointerEvents: "none" }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,.65)", letterSpacing: ".04em", textShadow: "0 0 10px rgba(255,255,255,.4)" }}>{co.industry}</span>
        <span style={{ fontSize: 12, fontWeight: 800, color: "#fff", letterSpacing: ".04em", textShadow: "0 0 14px rgba(255,255,255,.8)" }}>{co.revenue}</span>
      </div>
    </div>
  );
}

// ── Pressable card with glow on press ──
function PressableCard({ children, onClick, fullWidth, accentColor }) {
  const [pressed, setPressed] = React.useState(false);
  const [hov, setHov] = React.useState(false);
  const glowColor = accentColor || "rgba(255,255,255,1)";
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => { setHov(false); setPressed(false); }}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      style={{
        cursor:"pointer", display:"block", textAlign:"left",
        gridColumn: fullWidth ? "1 / -1" : undefined,
        transform: pressed ? "scale(.96)" : hov ? "scale(1.02)" : "scale(1)",
        transition: "transform .18s cubic-bezier(.34,1.56,.64,1), box-shadow .18s ease, filter .18s ease",
        borderRadius: 16,
        filter: pressed
          ? `drop-shadow(0 0 18px ${glowColor}55) drop-shadow(0 0 40px ${glowColor}25)`
          : hov
          ? `drop-shadow(0 0 10px ${glowColor}25)`
          : "none",
      }}>
      <Card3 s={{
        padding:"20px 18px", position:"relative",
        border: accentColor ? `1px solid ${accentColor}${pressed ? "60" : hov ? "40" : "25"}` : pressed ? "1px solid rgba(255,255,255,.2)" : hov ? "1px solid rgba(255,255,255,.1)" : undefined,
        background: accentColor ? `${accentColor}${pressed ? "0f" : "06"}` : pressed ? "rgba(255,255,255,.04)" : undefined,
        boxShadow: pressed ? `inset 0 0 30px ${glowColor}08` : undefined,
        transition: "border-color .18s, background .18s",
      }}>
        {children}
      </Card3>
    </div>
  );
}


function SideNavGlossyButton({ children, icon, active, onClick }) {
  const W = 200, H = 44;
  const cvRef = useRef(null);
  const btnRef = useRef(null);
  const [hov, setHov] = React.useState(false);
  const [pressed, setPressed] = React.useState(false);
  const stRef = useWavePill(cvRef, W, H, marbleBW);

  return (
    <div ref={btnRef}
      onClick={onClick}
      onMouseEnter={() => { stRef.current.hov = true; setHov(true); }}
      onMouseLeave={() => { stRef.current.hov = false; setHov(false); setPressed(false); }}
      onMouseMove={e => { const r = btnRef.current?.getBoundingClientRect(); if (r) stRef.current.mx = (e.clientX - r.left) / r.width; }}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      style={{
        position: "relative", display: "flex", alignItems: "center", gap: 10,
        width: "calc(100% - 20px)", margin: "2px 10px",
        height: H, cursor: "pointer", userSelect: "none",
        borderRadius: 999, overflow: "hidden",
        opacity: active || hov ? 1 : 0.5,
        transform: pressed ? "scale(.96)" : hov || active ? "scale(1.02)" : "scale(1)",
        transition: "transform .2s cubic-bezier(.34,1.56,.64,1), opacity .2s",
        filter: active
          ? "drop-shadow(0 0 18px rgba(255,255,255,.35)) drop-shadow(0 6px 24px rgba(255,255,255,.15))"
          : hov ? "drop-shadow(0 0 12px rgba(255,255,255,.2))" : "none",
      }}>
      <canvas ref={cvRef} style={{ position: "absolute", inset: 0, pointerEvents: "none", borderRadius: 999, opacity: active ? 1 : hov ? 0.65 : 0.3 }} />
      <span style={{ position: "relative", zIndex: 1, paddingLeft: 12, color: "#fff", display: "flex", alignItems: "center", flexShrink: 0, filter: `drop-shadow(0 0 ${active ? 10 : 5}px rgba(255,255,255,${active ? .6 : .25}))` }}>{icon}</span>
      {children && (
        <span style={{
          position: "relative", zIndex: 1, pointerEvents: "none",
          fontFamily: "-apple-system,'SF Pro Display',sans-serif",
          fontSize: 12, fontWeight: active ? 800 : 600, letterSpacing: ".03em",
          color: "#fff",
          textShadow: active
            ? "0 0 14px rgba(255,255,255,.9), 0 0 30px rgba(255,255,255,.5), 0 2px 8px rgba(0,0,0,.8)"
            : "0 1px 4px rgba(0,0,0,.7)",
        }}>{children}</span>
      )}
    </div>
  );
}

function MarbleScreen({ mode, files }) {
  const label = mode==="upload"
    ? (files?.length ? `${files[0]} を審査します` : "書類審査を開始します")
    : "数値照合を開始します";

  const sub = mode==="upload"
    ? "AIがファイルを読み取り・解析しています"
    : "帳簿データの差異・不一致を自動で検出しています";

  return (
    <div style={{width:"100vw",height:"100vh",background:"#000",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:24}}>
      <style>{`
        @keyframes msIn{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:.6}50%{opacity:1}}
      `}</style>
      <MarblePill label={label}/>
      <div style={{
        fontFamily:"-apple-system,'SF Pro Text',sans-serif",
        fontSize:15,fontWeight:400,letterSpacing:".06em",
        color:"rgba(255,255,255,.55)",
        textShadow:"0 0 20px rgba(255,255,255,.5),0 0 50px rgba(255,255,255,.25)",
        animation:"msIn .9s cubic-bezier(.16,1,.3,1) .4s both, pulse 3s ease-in-out 1.5s infinite",
      }}>{sub}</div>
    </div>
  );
}

// Big marble pill display for screen center
function MarblePill({ label }) {
  const W=600, H=110;
  const cvRef = useRef(null);
  const stRef = useRef({ hov:false, wave:0.5, mx:0.5 });
  const rafRef = useRef(null);
  useEffect(()=>{
    const cv=cvRef.current; if(!cv) return;
    cv.width=W*2; cv.height=H*2; cv.style.width=W+"px"; cv.style.height=H+"px";
    const ctx=cv.getContext("2d"); ctx.scale(2,2);
    const off=document.createElement("canvas"); off.width=W; off.height=H;
    const octx=off.getContext("2d");
    let t=0;
    const pill=(amp,mx)=>{
      ctx.beginPath(); const r=H/2-2;
      ctx.moveTo(r,2);
      for(let x=r;x<=W-r;x+=2){const p=(x-r)/(W-2*r),d=Math.abs(p-mx);const la=amp*Math.exp(-d*d*6);ctx.lineTo(x,2+Math.sin(p*Math.PI*3-t*3)*la+Math.sin(p*Math.PI*5-t*5)*la*0.4);}
      ctx.arc(W-r,H/2,r,-Math.PI/2,Math.PI/2);
      for(let x=W-r;x>=r;x-=2){const p=(x-r)/(W-2*r),d=Math.abs(p-mx);const la=amp*Math.exp(-d*d*6);ctx.lineTo(x,H-2-Math.sin(p*Math.PI*3-t*3)*la-Math.sin(p*Math.PI*5-t*5)*la*0.4);}
      ctx.arc(r,H/2,r,Math.PI/2,-Math.PI/2); ctx.closePath();
    };
    const draw=()=>{
      rafRef.current=requestAnimationFrame(draw); t+=0.012;
      const s=stRef.current; s.wave+=((3.5)-s.wave)*0.04;
      ctx.clearRect(0,0,W,H);
      // marble to offscreen
      const img=octx.createImageData(W,H); const dd=img.data;
      for(let py=0;py<H;py++) for(let px=0;px<W;px++){
        const nx=px*0.013,ny=py*0.019,tw=t*0.2;
        const v=(Math.sin((nx*2.1+ny*1.3+tw)+Math.sin((nx*3.4-ny*1.8+tw*0.7))*1.4)*0.5
                +Math.sin((nx*1.2-ny*2.6-tw*0.5)+Math.sin((ny*4.1+nx*0.9-tw*0.3))*1.1)*0.35
                +Math.sin((nx+ny)*3.0+tw*0.8)*0.15);
        const b=Math.floor((Math.sin(v*Math.PI)+1)*0.5*255);
        const i=(py*W+px)*4; dd[i]=b;dd[i+1]=b;dd[i+2]=b;dd[i+3]=210;
      }
      octx.putImageData(img,0,0);
      pill(s.wave,s.mx); ctx.save(); ctx.clip();
      ctx.drawImage(off,0,0,W,H);
      const sh=ctx.createRadialGradient(W/2,2,0,W/2,2,W*0.5);
      sh.addColorStop(0,"rgba(255,255,255,.40)"); sh.addColorStop(1,"rgba(255,255,255,0)");
      ctx.fillStyle=sh; ctx.fillRect(0,0,W,H*0.5);
      const vig=ctx.createRadialGradient(W/2,H/2,H*0.05,W/2,H/2,W*0.55);
      vig.addColorStop(0,"rgba(0,0,0,0)"); vig.addColorStop(1,"rgba(0,0,0,.42)");
      ctx.fillStyle=vig; ctx.fillRect(0,0,W,H);
      ctx.restore();
      pill(s.wave,s.mx);
      ctx.strokeStyle="rgba(255,255,255,.55)"; ctx.lineWidth=1.5; ctx.stroke();
      // outer glow
      ctx.save();
      ctx.shadowColor="rgba(255,255,255,.30)"; ctx.shadowBlur=30;
      pill(s.wave,s.mx); ctx.strokeStyle="rgba(255,255,255,.01)"; ctx.lineWidth=1; ctx.stroke();
      ctx.restore();
    };
    draw();
    return()=>cancelAnimationFrame(rafRef.current);
  },[]);

  return (
    <div style={{
      position:"relative",display:"inline-flex",alignItems:"center",justifyContent:"center",
      width:W,height:H,
      animation:"msIn 1s cubic-bezier(.16,1,.3,1) both",
      filter:"drop-shadow(0 0 40px rgba(255,255,255,.35)) drop-shadow(0 16px 60px rgba(255,255,255,.20))",
    }}>
      <canvas ref={cvRef} style={{position:"absolute",inset:0,pointerEvents:"none",borderRadius:999}}/>
      <span style={{
        position:"relative",zIndex:1,
        fontFamily:"-apple-system,'SF Pro Display',sans-serif",
        fontSize:32,fontWeight:800,letterSpacing:".12em",
        color:"#fff",
        textShadow:"0 0 24px rgba(255,255,255,.99),0 0 60px rgba(255,255,255,.65),0 0 110px rgba(255,255,255,.35),0 3px 14px rgba(0,0,0,.9)",
      }}>{label}</span>
    </div>
  );
}


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
  const checks = {
    bs: [
      { id:"s1", label:"流動資産合計の検算", valA:24800000+18500000+0+2400000+360000, valB:46060000, match:true, detail:"現金預金＋売掛金＋前払費用＋未収入金 ＝ ¥46,060,000 ✓" },
      { id:"s2", label:"固定資産合計の検算", valA:0+3200000+8500000+2400000, valB:14100000, match:true, detail:"器具備品＋ソフトウェア＋敷金 ＝ ¥14,100,000 ✓" },
      { id:"s3", label:"資産合計の検算", valA:46060000+14100000, valB:60160000, match:true, detail:"流動資産＋固定資産 ＝ ¥60,160,000 ✓" },
      { id:"s4", label:"負債・純資産合計 ＝ 資産合計（バランス）", valA:25191510+34968490, valB:60160000, match:true, detail:"負債¥25,191,510＋純資産¥34,968,490＝¥60,160,000 ✓" },
      { id:"s5", label:"流動負債合計の検算", valA:4800000+2100000+3293328+2318182+680000, valB:13191510, match:true, detail:"買掛金＋未払金＋未払法人税等＋未払消費税等＋預り金 ＝ ¥13,191,510 ✓" },
    ],
    pl: [
      { id:"s6", label:"売上原価合計の検算", valA:48000000+14400000, valB:62400000, match:true, detail:"外注費＋インフラ費 ＝ ¥62,400,000 ✓" },
      { id:"s7", label:"売上総利益の検算", valA:192000000-62400000, valB:129600000, match:true, detail:"売上¥192,000,000－原価¥62,400,000 ＝ ¥129,600,000 ✓" },
      { id:"s8", label:"販管費合計の検算", valA:9600000+42000000+6300000+7200000+3600000+4800000+5400000+7264000+11436000, valB:97600000, match:true, detail:"各費目の合計 ＝ ¥97,600,000 ✓" },
      { id:"s9", label:"営業利益の検算", valA:129600000-97600000, valB:32000000, match:true, detail:"売上総利益¥129,600,000－販管費¥97,600,000 ＝ ¥32,000,000 ✓" },
      { id:"s10", label:"当期純利益の検算", valA:31664000-9568490, valB:22095510, match:true, detail:"税引前¥31,664,000－法人税等¥9,568,490 ＝ ¥22,095,510 ✓" },
      { id:"s11", label:"交際費 損金算入限度チェック", valA:7264000, valB:8000000, match:false, detail:"交際費¥7,264,000 は年限度額¥8,000,000 以内ですが残額¥736,000。超過時は損金不算入となるため注意が必要です。", hl:{ pl:["P13"] } },
    ],
    hojin: [
      { id:"s12", label:"法人税額（800万以下 15%）の検算", valA:8000000*0.15, valB:1200000, match:true, detail:"¥8,000,000×15% ＝ ¥1,200,000 ✓" },
      { id:"s13", label:"法人税額（超過分 23.2%）の検算", valA:(32000000-8000000)*0.232, valB:5568000, match:true, detail:"¥24,000,000×23.2% ＝ ¥5,568,000 ✓" },
      { id:"s14", label:"差引確定法人税額の検算", valA:6768000-192000-3600000, valB:2976000, match:true, detail:"法人税計¥6,768,000－控除税額¥192,000－中間申告¥3,600,000 ＝ ¥2,976,000 ✓" },
    ],
    shinkoku: [
      { id:"s15", label:"所得金額合計の検算", valA:32000000+0+0+24000+0+7460000+360000+0+0, valB:39844000, match:true, detail:"各所得の合計 ＝ ¥39,844,000 ✓" },
      { id:"s16", label:"所得控除合計の検算", valA:0+0+1680000+0+120000+50000+48000+0+0+380000+0+380000+480000, valB:3138000, match:true, detail:"各控除合計 ＝ ¥3,138,000 ✓" },
      { id:"s17", label:"課税所得の検算", valA:39844000-3138000, valB:36706000, match:true, detail:"所得合計¥39,844,000－控除¥3,138,000 ＝ ¥36,706,000 ✓" },
      { id:"s18", label:"復興特別所得税の検算", valA:Math.round(8371880*0.021), valB:175609, match:true, detail:"所得税¥8,371,880×2.1% ＝ ¥175,609 ✓" },
      { id:"s19", label:"申告納税額の検算", valA:8547489-1920000, valB:6627489, match:true, detail:"所得税等¥8,547,489－源泉¥1,920,000 ＝ ¥6,627,489 ✓" },
    ],
    kotei: [
      { id:"s20", label:"償却費合計の検算", valA:1120000+1200000+3000000, valB:5320000, match:true, detail:"サーバー¥1,120,000＋PC¥1,200,000＋ソフトウェア¥3,000,000 ＝ ¥5,320,000 ✓" },
      { id:"s21", label:"固定資産期末残高合計", valA:2240000+960000+8500000, valB:11700000, match:true, detail:"サーバー¥2,240,000＋PC¥960,000＋ソフトウェア¥8,500,000 ＝ ¥11,700,000 ✓", hl:{ kotei:["K6","K10","K14","K16"] } },
    ],
    kubun: [
      { id:"s22", label:"売上合計の検算", valA:189600000+0+2400000+0, valB:192000000, match:true, detail:"課税売上＋非課税売上 ＝ ¥192,000,000 ✓" },
      { id:"s23", label:"仕入税額控除の計算チェック", valA:Math.round(17454546-13200000), valB:4254546, match:true, detail:"課税標準額に対する消費税¥17,454,546－控除¥13,200,000 ＝ ¥4,254,546 ✓" },
    ],
    uchiwake: [
      { id:"s24", label:"預貯金合計の検算", valA:18200000+4100000+2500000, valB:24800000, match:true, detail:"三菱UFJ＋三井住友＋SBI ＝ ¥24,800,000 ✓" },
      { id:"s25", label:"売掛金合計の検算", valA:8500000+5200000+3200000+1600000, valB:18500000, match:true, detail:"NTTデータ他4社合計 ＝ ¥18,500,000 ✓" },
      { id:"s26", label:"買掛金・未払金合計の検算", valA:2800000+1200000+2900000, valB:6900000, match:true, detail:"外注費＋AWS＋その他 ＝ ¥6,900,000 ✓" },
    ],
  };
  return checks[docId] || [];
};

const AUDIT_DOCS = [
  { id:"bs",       label:"貸借対照表",     sub:"令和8年3月31日現在",       icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="12" y1="3" x2="12" y2="21"/></svg> },
  { id:"pl",       label:"損益計算書",     sub:"令和7年4月〜令和8年3月",   icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg> },
  { id:"hojin",    label:"法人税 別表一",  sub:"法人税申告書",             icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18M9 8h1M14 8h1M9 12h1M14 12h1M9 16h1M14 16h1"/><path d="M5 21V5a2 2 0 012-2h10a2 2 0 012 2v16"/></svg> },
  { id:"shinkoku", label:"確定申告書B",    sub:"第一表",                   icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg> },
  { id:"kotei",    label:"固定資産台帳",   sub:"減価償却資産明細",         icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/></svg> },
  { id:"kubun",    label:"消費税区分別表", sub:"課税区分別取引集計",       icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> },
  { id:"uchiwake", label:"内訳書",         sub:"勘定科目内訳明細書",       icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg> },
];

// Cross-document reconciliation checks
const buildReconciliationResults = (selectedIds) => {
  const sel = new Set(selectedIds);
  const all = [];

  // BS ↔ 内訳書
  if(sel.has("bs") && sel.has("uchiwake")) {
    all.push({ id:1, label:"現金及び預金 — BS vs 内訳書",
      docA:"貸借対照表 A1", docB:"内訳書 U4",
      valA:24800000, valB:24800000, match:true,
      detail:"三菱UFJ・三井住友・SBI合計¥24,800,000 と一致",
      hl:{ bs:["A1","A6"], uchiwake:["U1","U2","U3","U4"] } });
    all.push({ id:2, label:"売掛金 — BS vs 内訳書",
      docA:"貸借対照表 A2", docB:"内訳書 U9",
      valA:18500000, valB:18500000, match:true,
      detail:"NTTデータ他3社合計¥18,500,000 と一致",
      hl:{ bs:["A2"], uchiwake:["U5","U6","U7","U8","U9"] } });
  }
  if(sel.has("pl") && sel.has("shinkoku")) {
    all.push({ id:3, label:"売上高 — PL vs 確定申告書",
      docA:"損益計算書 P1", docB:"確定申告書 ア",
      valA:192000000, valB:192000000, match:true,
      detail:"SaaS＋受託開発売上 ¥192,000,000 と一致",
      hl:{ pl:["P1"], shinkoku:["ア"] } });
    all.push({ id:4, label:"役員報酬 — PL vs 確定申告書（給与所得）",
      docA:"損益計算書 P6", docB:"確定申告書 カ",
      valA:9600000, valB:9600000, match:true,
      detail:"月80万×12ヶ月 ¥9,600,000 と一致",
      hl:{ pl:["P6"], shinkoku:["カ"] } });
  }
  if(sel.has("pl") && sel.has("hojin")) {
    all.push({ id:5, label:"営業利益 — PL vs 法人税別表一（所得金額）",
      docA:"損益計算書 P16", docB:"法人税別表一 1",
      valA:32000000, valB:32000000, match:true,
      detail:"営業利益 ¥32,000,000 と課税所得が一致",
      hl:{ pl:["P16"], hojin:["1"] } });
    all.push({ id:6, label:"法人税額 — 法人税別表一 vs BS未払法人税",
      docA:"法人税別表一 確定法人税", docB:"貸借対照表 L3",
      valA:2976000, valB:3293328, match:false,
      detail:"法人税¥2,976,000 に対しBS未払法人税等¥3,293,328。差額¥317,328 は地方法人税（10.3%）分ですが科目表記の確認が必要です。",
      hl:{ hojin:["9"], bs:["L3"] } });
  }
  if(sel.has("pl") && sel.has("kotei")) {
    all.push({ id:7, label:"減価償却費 — PL vs 固定資産台帳",
      docA:"損益計算書 P12", docB:"固定資産台帳 K15",
      valA:5400000, valB:5320000, match:false,
      detail:"PLの減価償却費¥5,400,000 に対し台帳合計¥5,320,000。差額¥80,000 — 台帳未登録の少額資産が含まれている可能性があります。要確認。",
      hl:{ pl:["P12"], kotei:["K15"] } });
  }
  if(sel.has("bs") && sel.has("kotei")) {
    all.push({ id:8, label:"固定資産（期末残高） — BS vs 固定資産台帳",
      docA:"貸借対照表（器具備品＋ソフトウェア）", docB:"固定資産台帳 K16",
      valA:3200000+8500000, valB:11700000, match:false,
      detail:"BS器具備品¥3,200,000＋ソフトウェア¥8,500,000＝¥11,700,000 ✓ 一致。ただしPC期末残高¥960,000 の内訳を台帳で再確認推奨。",
      hl:{ bs:["A8","A9","A11"], kotei:["K7","K10","K16"] } });
  }
  if(sel.has("kubun") && sel.has("pl")) {
    all.push({ id:9, label:"売上高（消費税課税売上）— PL vs 消費税区分別表",
      docA:"損益計算書 P1", docB:"消費税区分別表 Z5",
      valA:192000000, valB:192000000, match:true,
      detail:"課税売上¥189,600,000＋非課税売上¥2,400,000＝¥192,000,000 と一致",
      hl:{ pl:["P1"], kubun:["Z1","Z3","Z5"] } });
  }
  if(sel.has("kubun") && sel.has("shinkoku")) {
    all.push({ id:10, label:"事業所得 — 確定申告書 vs 法人税（消費税基準）",
      docA:"確定申告書 ①", docB:"消費税区分別表 課税売上",
      valA:32000000, valB:189600000, match:false,
      detail:"確定申告書の事業所得¥32,000,000（税抜営業利益）と消費税課税売上¥189,600,000 は別概念。交差確認上は正常ですが申告書の分類が個人・法人混在になっていないか要確認。",
      hl:{ shinkoku:["①"], kubun:["Z1"] } });
  }

  return all;
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

  // Auto-check results (from FilingForms data)
  const autoResults = [
    { id:1, severity:"ok", label:"収入金額の整合性", detail:"売上帳の合計と確定申告書Bの収入金額等が一致しています。" },
    { id:2, severity:"warn", label:"消費税区分が未確認の仕訳 4件", detail:"02/16〜02/18の仕訳で消費税区分が仮設定のままです。課税・非課税・対象外の確定が必要です。" },
    { id:3, severity:"warn", label:"レシート未添付の経費 2件", detail:"タクシー ¥4,200（02/16）とビックカメラ ¥128,000（02/15）の証憑が未アップロードです。" },
    { id:4, severity:"ok", label:"減価償却計算", detail:"固定資産台帳の償却額と別表十六の金額が一致。耐用年数・償却方法ともに適正。" },
    { id:5, severity:"warn", label:"インボイス番号 未確認 1件", detail:"外注費 ¥450,000（A社）のインボイス番号が未登録。仕入税額控除に影響する可能性があります。" },
    { id:6, severity:"ok", label:"法人税率の適用", detail:"所得800万円以下: 15%、超過分: 23.2%の段階税率が正しく適用されています。" },
    { id:7, severity:"ok", label:"源泉徴収税額の照合", detail:"支払調書の源泉徴収税額と確定申告書の記載額が一致。" },
    { id:8, severity:"ok", label:"期末残高の整合性", detail:"試算表の期末残高と貸借対照表の金額が全科目一致しています。" },
    { id:9, severity:"err", label:"交際費の損金算入限度", detail:"交際費総額が年800万円の限度額に近づいています（現在 ¥7,264,000）。残り ¥736,000 を超えると損金不算入額が発生します。" },
    { id:10, severity:"ok", label:"消費税の計算", detail:"課税標準額 × 10% と仕入税額控除の計算が正しく行われています。" },
    { id:11, severity:"warn", label:"【電帳法】証憑未添付の電子取引 6件", detail:"電子帳簿保存法により電子取引データは電子保存が義務です。スターバックス（02/18）、Amazon（02/17）、タクシー（02/16）、ビックカメラ（02/15）、焼肉きんぐ（02/14）、セミナー（02/08）の証憑が未添付。" },
    { id:12, severity:"ok", label:"【電帳法】タイムスタンプ付与", detail:"保存済み証憑12件すべてにタイムスタンプが自動付与されています。真実性の確保要件を満たしています。" },
    { id:13, severity:"ok", label:"【電帳法】検索要件（日付・金額・取引先）", detail:"全仕訳に取引日・金額・取引先が記録されており、検索機能の要件を満たしています。" },
    { id:14, severity:"warn", label:"【電帳法】ファイル命名規則 不統一 3件", detail:"20260218_AWS_248000.pdf のような規則に沿っていないファイルが3件あります。検索性向上のため命名規則の統一を推奨します。" },
    { id:15, severity:"ok", label:"【電帳法】訂正削除履歴の保持", detail:"システムが全データの訂正・削除履歴を保持しています。改ざん防止要件を満たしています。" },
  ];

  // Upload-check results (simulated for uploaded docs)
  const uploadResults = [
    { id:101, severity:"ok", label:"書類の形式・可読性", detail:"アップロードされた書類はすべて読み取り可能です。OCR精度は95%以上。" },
    { id:102, severity:"warn", label:"日付の不一致 1件", detail:"請求書の日付（12/28）と仕訳の計上日（01/05）にズレがあります。発生主義に基づき12月計上が正しい可能性があります。" },
    { id:103, severity:"ok", label:"金額の照合", detail:"アップロードされた証憑の金額と帳簿の記載額が一致しています。" },
    { id:104, severity:"warn", label:"印影・署名の確認", detail:"1件の契約書で押印が不鮮明です。再取得を推奨します。" },
    { id:105, severity:"ok", label:"適格請求書の要件", detail:"インボイス番号、税率区分、消費税額の記載を確認済み。全件適格。" },
    { id:106, severity:"ok", label:"【電帳法】タイムスタンプ", detail:"アップロード時に全ファイルへタイムスタンプを自動付与済み。真実性の確保要件OK。" },
    { id:107, severity:"warn", label:"【電帳法】ファイル名の検索要件", detail:"1件のファイル名に取引先名が含まれていません。「日付_取引先_金額_書類名.pdf」形式への変更を推奨します。" },
  ];

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
      { n:"1", title:"決算書を融資目線で整える", detail:"売掛回収45日を30日に短縮。CF+¥150万/月で銀行への返済余力をアピール", c:"#60b8ff", card:"loanStrategy" },
      { n:"2", title:"役員報酬を融資有利に調整", detail:"月¥80万→¥70万に下げて法人利益を積み上げ。銀行の黒字評価に直結", c:"#60b8ff", card:"execComp" },
      { n:"3", title:"キャッシュフロー計画の整備", detail:"13週間CF予測を作成。融資面談で「資金計画がある経営者」を示す", c:"#60b8ff", card:"cashflow" },
    ],
    phoenix: [
      { n:"1", title:"固定費を今月中に削れる分だけ削る", detail:"SaaS解約・外注費交渉で月¥20万以上即時改善。損益分岐点を下げる", c:"#ff9060", card:"costStructure" },
      { n:"2", title:"売掛回収サイクルの短縮", detail:"回収45日→30日でCF+¥150万/月。資金ショートを防ぐ最優先施策", c:"#ff9060", card:"cashflow" },
      { n:"3", title:"借入条件のリスケ検討", detail:"返済負担が重い場合は早期に金融機関と条件変更交渉。手遅れ前に動く", c:"#ff9060", card:"loanStrategy" },
    ],
    dragon: [
      { n:"1", title:"成長を支えるCF計画を立てる", detail:"人員増・投資増に備えた四半期CF予測。黒字でも資金ショートするリスクを先読み", c:"#00e8d0", card:"cashflow" },
      { n:"2", title:"人件費の生産性を測る", detail:"急拡大期に採用が先行しがち。部門別1人あたり売上を四半期ごとに追う", c:"#00e8d0", card:"laborCost" },
      { n:"3", title:"法人税の繰り延べ策を設計", detail:"節税3段重ねで年¥120万。成長投資の原資を確保するための必須施策", c:"#00e8d0", card:"taxSim" },
    ],
    sphinx: [
      { n:"1", title:"節税3段重ねを今期中に実行", detail:"小規模共済+iDeCo+セーフティ共済で年¥120万節税。今月動けば今期適用", c:"#d080ff", card:"taxSim" },
      { n:"2", title:"役員報酬の最適額を再設計", detail:"法人税×所得税の交差点を計算。退職金積立と組み合わせた総合設計が必要", c:"#d080ff", card:"execComp" },
      { n:"3", title:"補助金・税制優遇のフル活用", detail:"少額償却残枠¥172万が期末に消滅。今期中に設備購入か経費化を判断", c:"#d080ff", card:"capexSubsidy" },
    ],
    chimera: [
      { n:"1", title:"法人分割・持株会社スキームの検討", detail:"事業部門ごとの損益を可視化。どこが利益源でどこがコストセンターかを明確に", c:"#ff80c0", card:"corpStrategy" },
      { n:"2", title:"部門別コスト構造の整理", detail:"固定費率62%の内訳を部門別に分解。グループ全体の最適化ポイントを特定", c:"#ff80c0", card:"costStructure" },
      { n:"3", title:"グループ税務の最適化", detail:"節税3段重ねに加えグループ通算制度の適用可否を検討。専門家と設計を", c:"#ff80c0", card:"taxSim" },
    ],
    kraken: [
      { n:"1", title:"13週間CFシミュレーションの作成", detail:"資金ショートを2ヶ月先まで予測する習慣。月次では手遅れになることがある", c:"#40d0ff", card:"cashflow" },
      { n:"2", title:"売掛回収を業界最速に", detail:"回収45日→30日でCF+¥150万/月。新規契約から条件変更を徹底する", c:"#40d0ff", card:"procurement" },
      { n:"3", title:"仕入・支払条件の見直し", detail:"支払サイトを30日→45日に延長交渉。回収短縮と合わせてCFギャップをゼロに", c:"#40d0ff", card:"costStructure" },
    ],
    griffin: [
      { n:"1", title:"役員退職金の積立設計を開始", detail:"月80万×在任年数×功績倍率3倍で¥4,800万損金。今から原資積立が必要", c:"#e8c040", card:"execComp" },
      { n:"2", title:"企業価値評価に有利なBSを作る", detail:"不良資産の整理と純資産の積み上げ。M&Aバリュエーションに直結する", c:"#e8c040", card:"corpStrategy" },
      { n:"3", title:"節税で手元資金を最大化", detail:"出口直前の大きな節税より、今から積み上げる節税の方が効果が大きい", c:"#e8c040", card:"taxSim" },
    ],
    unicorn: [
      { n:"1", title:"補助金・助成金の申請を今すぐ", detail:"IT導入補助金・ものづくり補助金など3件が申請可能。期限があるので先手を", c:"#a0c8ff", card:"capexSubsidy" },
      { n:"2", title:"創業融資の枠を早期に確保", detail:"設立後3年以内は政策金融公庫の融資が通りやすい。タイミングを逃さない", c:"#a0c8ff", card:"loanStrategy" },
      { n:"3", title:"青色申告と記帳体制の整備", detail:"創業初年度の税務ミスは後年に響く。今期の申告を正確に仕上げることが最優先", c:"#a0c8ff", card:"filingTax" },
    ],
    golem: [
      { n:"1", title:"節税3段重ねで内部留保を最大化", detail:"小規模共済+iDeCo+セーフティ共済で年¥120万節税。安定期こそ節税効果が高い", c:"#70e880", card:"taxSim" },
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
  const overviewGrades = [
    { cat:"売上・成長", summary:"売上¥1,540万/月は安定。ただし直近3ヶ月で前年比▲3.2%の鈍化傾向。広告費比率0.8%は業界平均の10分の1で、成長投資が極端に不足。新規獲得チャネルが紹介に偏重しておりリスク。", impact:"売上+15%で年間¥2,770万の利益増", color:"#6BA3FF" },
    { cat:"コスト・効率", summary:"固定費率62%は業界平均55%を7pt超過。賃料が相場比+12%、SaaS過剰契約あり。外注費が前月比+29%で急増し放置状態。変動費率は正常だが仕入先との単価交渉余地あり。", impact:"適正化で年間¥600万改善", color:"#F0C866" },
    { cat:"人件費・組織", summary:"1人あたり売上¥193万は業界平均を上回る。ただし残業代が月¥48万で改善余地。役員報酬の最適化が未実施で、法人税/所得税の交差点を外している可能性。", impact:"報酬設計見直しで年間¥80万改善", color:"#6BA3FF" },
    { cat:"税務・申告", summary:"推定税額¥801万に対し、未活用の控除が年間¥120万分。小規模企業共済・iDeCo・経営セーフティ共済が全て未加入。業種別の経費最適化も未着手。確定申告は進捗40%で期限まで19日。", impact:"重ね技で年間¥120万節税", color:"#F0C866" },
    { cat:"資金・融資", summary:"預金残高¥2,480万で運転資金3.5ヶ月分を確保。月間CF¥210万は健全。ただし売掛回収45日は業界平均30日より長く、CF圧迫要因。返済負担率14.3%は安全圏内。", impact:"回収短縮で月¥150万CF改善", color:"#6BA3FF" },
    { cat:"資産・制度活用", summary:"IT導入補助金・ものづくり補助金など申請可能な制度が未活用。保険の見直しも未実施。少額償却の残枠¥172万が期末で消滅予定。設備投資の税制優遇を活かしきれていない。", impact:"補助金+税制で¥500万超の効果", color:"#E87070" },
  ];

  /* ═══ KPIs per card ═══ */
  const allKPIs = {
    salesTrend:[{l:"月間売上",v:"¥1,540万"},{l:"前年同月比",v:"▲3.2%",c:"#E87070"},{l:"顧客数",v:"51社"},{l:"平均単価",v:"¥30.2万",c:C.textSec}],
    marketing:[{l:"広告費/月",v:"¥12万"},{l:"広告費比率",v:"0.8%",c:"#E87070"},{l:"新規獲得",v:"0.6件/月",c:"#F0C866"},{l:"紹介依存率",v:"87%",c:"#E87070"}],
    costStructure:[{l:"月間経費",v:"¥710万"},{l:"固定費率",v:"62%",c:"#F0C866"},{l:"削減可能",v:"¥82万/月",c:"#7BE0A0"},{l:"前年比",v:"+4.2%",c:"#E87070"}],
    procurement:[{l:"仕入原価",v:"¥280万/月"},{l:"支払サイト",v:"30日"},{l:"回収サイト",v:"45日",c:"#F0C866"},{l:"交渉余地",v:"5〜8%",c:"#7BE0A0"}],
    laborCost:[{l:"人件費/月",v:"¥320万"},{l:"人件費率",v:"45%"},{l:"1人あたり売上",v:"¥193万",c:"#7BE0A0"},{l:"残業代/月",v:"¥48万",c:"#F0C866"}],
    execComp:[{l:"役員報酬/月",v:"¥80万"},{l:"法人税率",v:"23.2%"},{l:"所得税率",v:"33%"},{l:"最適報酬",v:"未計算",c:"#F0C866"}],
    taxSim:[{l:"推定法人税",v:"¥677万"},{l:"推定消費税",v:"¥124万"},{l:"節税余地",v:"¥120万",c:"#7BE0A0"},{l:"実効税率",v:"33.4%"}],
    filingTax:[{l:"確定申告",v:"40%",c:"#F0C866"},{l:"消費税申告",v:"10%",c:"#E87070"},{l:"期限まで",v:"19日",c:"#E87070"},{l:"インボイス",v:"登録済",c:"#7BE0A0"}],
    cashflow:[{l:"預金残高",v:"¥2,480万"},{l:"月間CF",v:"¥210万",c:"#7BE0A0"},{l:"運転資金月数",v:"3.5ヶ月"},{l:"売掛回収",v:"45日",c:"#F0C866"}],
    loanStrategy:[{l:"借入残高",v:"¥2,300万"},{l:"月間返済",v:"¥35万"},{l:"返済比率",v:"14.3%",c:"#7BE0A0"},{l:"加重平均金利",v:"1.6%"}],
    capexSubsidy:[{l:"固定資産残高",v:"¥1,240万"},{l:"少額特例残枠",v:"¥172万",c:"#7BE0A0"},{l:"申請可能補助金",v:"3件",c:"#F0C866"},{l:"投資余力",v:"¥850万"}],
    corpStrategy:[{l:"個人税額(推定)",v:"¥855万",c:"#E87070"},{l:"法人税額(推定)",v:"¥677万",c:"#7BE0A0"},{l:"差額メリット",v:"¥178万/年",c:"#7BE0A0"},{l:"設立コスト",v:"¥25万"}],
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
function FileBoxPage() {
  const [viewMode, setViewMode] = useState("grid");
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const [selected, setSelected] = useState(null);
  const [sortKey, setSortKey] = useState("date");
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [previewFile, setPreviewFile] = useState(null); // { name, url, isImage }
  const dropRef = React.useRef(null);
  const inputRef = React.useRef(null);

  const isImageFile = (name) => /\.(jpg|jpeg|png|gif|webp|heic)$/i.test(name);
  const isPdfFile  = (name) => /\.pdf$/i.test(name);

  /* ── ファイルアップロード処理 ── */
  const handleFiles = (fileList) => {
    Array.from(fileList).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const today = new Date().toLocaleDateString("ja-JP", { year:"numeric", month:"2-digit", day:"2-digit" }).replace(/\//g, "/");
        setUploadedFiles(prev => [...prev, {
          id: Date.now() + Math.random(),
          name: file.name,
          cat: isImageFile(file.name) ? "レシート" : "請求書",
          partner: "—",
          amount: 0,
          date: today,
          ts: true,
          linked: false,
          journalId: null,
          nameOk: /^\d{8}_/.test(file.name),
          previewUrl: e.target.result,
          isImage: isImageFile(file.name),
          isPdf: isPdfFile(file.name),
          uploaded: true,
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  /* ── ドラッグ&ドロップ ── */
  const onDragOver = (e) => { e.preventDefault(); if (dropRef.current) dropRef.current.dataset.drag = "1"; };
  const onDragLeave = () => { if (dropRef.current) delete dropRef.current.dataset.drag; };
  const onDrop = (e) => { e.preventDefault(); if (dropRef.current) delete dropRef.current.dataset.drag; handleFiles(e.dataTransfer.files); };

  const files = [...uploadedFiles];

  const cats = ["all","請求書","レシート","明細","給与","契約書","納品書"];
  const catCounts = cats.map(c => c === "all" ? files.length : files.filter(f => f.cat === c).length);

  const filtered = files
    .filter(f => filterCat === "all" || f.cat === filterCat)
    .filter(f => !search || f.name.toLowerCase().includes(search.toLowerCase()) || f.partner.toLowerCase().includes(search.toLowerCase()))
    .sort((a,b) => sortKey === "date" ? b.date.localeCompare(a.date) : sortKey === "amount" ? b.amount - a.amount : a.name.localeCompare(b.name));

  const fmt = n => "\u00A5" + n.toLocaleString();

  return (
    <PageShell title="ファイルボックス" watermark={"File\nBox"}>

      {/* ── ドラッグ&ドロップ アップロードゾーン ── */}
      <Rv><div
        ref={dropRef}
        onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
        onClick={() => inputRef.current && inputRef.current.click()}
        style={{ marginBottom:14, padding:"18px 24px", borderRadius:16, border:"1.5px dashed rgba(139,123,244,.2)", background:"rgba(139,123,244,.02)", display:"flex", alignItems:"center", gap:16, cursor:"pointer", transition:"all .2s" }}
      >
        <input ref={inputRef} type="file" multiple accept="image/*,.pdf" style={{ display:"none" }} onChange={e => { handleFiles(e.target.files); e.target.value=""; }} />
        <div style={{ width:40, height:40, borderRadius:12, background:"rgba(139,123,244,.08)", border:"1px solid rgba(139,123,244,.12)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#A89BFF" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
        </div>
        <div>
          <div style={{ fontSize:12, color:"#C4B8FF", fontWeight:600, marginBottom:2 }}>写真・PDFをアップロード</div>
          <div style={{ fontSize:10, color:"rgba(168,155,255,.4)" }}>クリックまたはドラッグ&ドロップ — jpg / png / pdf 対応</div>
        </div>
        {uploadedFiles.length > 0 && <div style={{ marginLeft:"auto", fontSize:10, color:"#7BE0A0", fontWeight:600 }}>+{uploadedFiles.length}件 追加済み</div>}
      </div></Rv>


      {/* Search + Filter + View toggle */}
      <Rv d={15}><Card3 s={{ padding:"14px 18px", marginBottom:14 }}>
        <div style={{ display:"flex", gap:10, alignItems:"center", marginBottom:12 }}>
          <div style={{ flex:1, position:"relative" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.textMut} strokeWidth="2" style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)" }}><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="ファイル名・取引先で検索…" style={{ width:"100%", padding:"9px 12px 9px 34px", border:"1px solid rgba(139,123,244,.12)", borderRadius:14, background:"rgba(139,123,244,.03)", color:"#E0DAFF", fontSize:12, fontFamily:bd, outline:"none", boxSizing:"border-box" }} />
          </div>
          <select value={sortKey} onChange={e=>setSortKey(e.target.value)} style={{ padding:"9px 12px", border:"1px solid rgba(139,123,244,.12)", borderRadius:14, background:"rgba(139,123,244,.03)", color:"#E0DAFF", fontSize:11, fontFamily:bd, outline:"none" }}>
            <option value="date" style={{ background:"#1a1a2e", color:"#E0DAFF" }}>日付順</option>
            <option value="amount" style={{ background:"#1a1a2e", color:"#E0DAFF" }}>金額順</option>
            <option value="name" style={{ background:"#1a1a2e", color:"#E0DAFF" }}>名前順</option>
          </select>
          <div style={{ display:"flex", gap:2, background:"rgba(139,123,244,.04)", borderRadius:10, padding:2 }}>
            {["grid","list"].map(m => (
              <Mag key={m} onClick={()=>setViewMode(m)} s={{ padding:"6px 10px", borderRadius:8, border:"none", cursor:"pointer", background:viewMode===m?"rgba(139,123,244,.12)":"transparent", color:viewMode===m?"#C4B8FF":"rgba(168,155,255,.3)", fontSize:11, fontFamily:bd, fontWeight:viewMode===m?700:500 }}>
                {m==="grid"?"▦":"☰"}
              </Mag>
            ))}
          </div>
        </div>
        {/* Category pills */}
        <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
          {cats.map((c,i) => (
            <Mag key={c} onClick={()=>setFilterCat(c)} s={{ padding:"5px 14px", borderRadius:20, border:filterCat===c?"1px solid rgba(139,123,244,.3)":"1px solid rgba(255,255,255,.05)", background:filterCat===c?"rgba(139,123,244,.1)":"transparent", color:filterCat===c?"#C4B8FF":"rgba(168,155,255,.35)", fontSize:10, fontWeight:filterCat===c?700:500, cursor:"pointer", fontFamily:bd }}>
              {c==="all"?"すべて":c} <span style={{ fontSize:9, opacity:.6 }}>{catCounts[i]}</span>
            </Mag>
          ))}
        </div>
      </Card3></Rv>

      {/* File Grid/List */}
      <Rv d={30}>
        {viewMode === "grid" ? (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(200px, 1fr))", gap:10 }}>
            {filtered.map(f => (
              <Card3 key={f.id} s={{ padding:0, overflow:"hidden", cursor:"pointer", border:selected===f.id?"1.5px solid rgba(139,123,244,.4)":"1.5px solid transparent", transition:"all .2s" }} onClick={()=>setSelected(selected===f.id?null:f.id)}>
                {/* サムネイル — 画像は実際に表示、PDFはアイコン */}
                <div style={{ height:90, background:"linear-gradient(135deg,rgba(139,123,244,.06),rgba(139,123,244,.02))", display:"flex", alignItems:"center", justifyContent:"center", position:"relative", overflow:"hidden" }}>
                  {f.isImage && f.previewUrl ? (
                    <img src={f.previewUrl} alt={f.name} style={{ width:"100%", height:"100%", objectFit:"cover", opacity:.9 }} />
                  ) : f.isImage ? (
                    /* 既存の.jpg/.pngはダミーグラデで写真っぽく表示 */
                    <div style={{ width:"100%", height:"100%", background:`linear-gradient(135deg, rgba(168,155,255,.15) 0%, rgba(100,80,200,.08) 100%)`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(168,155,255,.35)" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                    </div>
                  ) : (
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(168,155,255,.25)" strokeWidth="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/></svg>
                  )}
                  <div style={{ position:"absolute", top:6, right:6, display:"flex", gap:3 }}>
                    {f.ts && <span style={{ fontSize:7, color:"#A89BFF", padding:"2px 5px", borderRadius:4, background:"rgba(10,8,20,.7)", fontWeight:700 }}>TS</span>}
                    {f.linked && <span style={{ fontSize:7, color:"#7BE0A0", padding:"2px 5px", borderRadius:4, background:"rgba(10,8,20,.7)", fontWeight:700 }}>紐づけ済</span>}
                    {!f.nameOk && <span style={{ fontSize:7, color:"#E8B84B", padding:"2px 5px", borderRadius:4, background:"rgba(10,8,20,.7)", fontWeight:700 }}>名前⚠</span>}
                  </div>
                  <span style={{ position:"absolute", bottom:6, left:8, fontSize:8, color:"rgba(255,255,255,.6)", padding:"2px 6px", borderRadius:6, background:"rgba(0,0,0,.5)" }}>{f.cat}</span>
                  {/* 画像クリックで拡大プレビュー */}
                  {f.isImage && f.previewUrl && (
                    <div onClick={e=>{ e.stopPropagation(); setPreviewFile({ name:f.name, url:f.previewUrl }); }} style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0)", display:"flex", alignItems:"center", justifyContent:"center", opacity:0, transition:"opacity .2s" }}
                      onMouseEnter={e=>e.currentTarget.style.opacity="1"} onMouseLeave={e=>e.currentTarget.style.opacity="0"}>
                      <div style={{ background:"rgba(0,0,0,.6)", borderRadius:8, padding:"4px 10px", fontSize:10, color:"#fff" }}>拡大</div>
                    </div>
                  )}
                </div>
                <div style={{ padding:"10px 12px" }}>
                  <div style={{ fontSize:10, color:"#fff", fontWeight:600, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", marginBottom:4 }}>{f.name}</div>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <span style={{ fontSize:10, color:C.textMut }}>{f.partner}</span>
                    <span style={{ fontSize:11, color:"#C4B8FF", fontFamily:mono, fontWeight:600 }}>{fmt(f.amount)}</span>
                  </div>
                  <div style={{ fontSize:9, color:C.textMut, marginTop:3 }}>{f.date}</div>
                </div>
              </Card3>
            ))}
          </div>
        ) : (
          <Card3 s={{ padding:0, overflow:"hidden" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12, fontFamily:bd }}>
              <thead>
                <tr style={{ borderBottom:`1px solid ${C.border}` }}>
                  {["ファイル名","種別","取引先","金額","日付","TS","紐づけ","命名"].map((h,i) => (
                    <th key={i} style={{ padding:"10px 8px", textAlign:i===3?"right":"left", fontSize:9, fontWeight:600, color:C.textMut, letterSpacing:".1em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(f => (
                  <tr key={f.id} onClick={()=>setSelected(selected===f.id?null:f.id)} style={{ borderBottom:`1px solid ${C.borderLt}`, cursor:"pointer", background:selected===f.id?`${C.blue}06`:"transparent" }}>
                    <td style={{ padding:"10px 8px", color:"#fff", fontWeight:500, maxWidth:220, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{f.name}</td>
                    <td style={{ padding:"10px 8px" }}><span style={{ fontSize:9, padding:"2px 8px", borderRadius:8, background:"rgba(139,123,244,.06)", color:C.textSec }}>{f.cat}</span></td>
                    <td style={{ padding:"10px 8px", color:C.textSec }}>{f.partner}</td>
                    <td style={{ padding:"10px 8px", textAlign:"right", color:"#C4B8FF", fontFamily:mono }}>{fmt(f.amount)}</td>
                    <td style={{ padding:"10px 8px", color:C.textMut, fontFamily:mono, fontSize:11 }}>{f.date}</td>
                    <td style={{ padding:"10px 8px", textAlign:"center" }}>{f.ts ? <span style={{ color:"#7BE0A0" }}>✓</span> : <span style={{ color:"#E8B84B" }}>—</span>}</td>
                    <td style={{ padding:"10px 8px", textAlign:"center" }}>{f.linked ? <span style={{ color:"#7BE0A0" }}>✓</span> : <span style={{ color:"#E8B84B" }}>未</span>}</td>
                    <td style={{ padding:"10px 8px", textAlign:"center" }}>{f.nameOk ? <span style={{ color:"#7BE0A0" }}>✓</span> : <span style={{ color:"#E8B84B" }}>⚠</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card3>
        )}
      </Rv>

      {/* Detail panel */}
      {selected && (() => {
        const f = files.find(x=>x.id===selected);
        if (!f) return null;
        return (
          <Rv d={45}><Card3 s={{ padding:22, marginTop:14 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16 }}>
              <div>
                <div style={{ fontSize:14, color:"#fff", fontWeight:600, marginBottom:4 }}>{f.name}</div>
                <div style={{ fontSize:11, color:C.textMut }}>{f.cat} — {f.partner}</div>
              </div>
              <Mag onClick={()=>setSelected(null)} s={{ padding:"4px 8px", border:"none", background:"transparent", color:C.textMut, fontSize:16, cursor:"pointer" }}>×</Mag>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
              {[
                { l:"金額", v:fmt(f.amount) },
                { l:"日付", v:f.date },
                { l:"タイムスタンプ", v:f.ts?"✓ 付与済":"未付与", c:f.ts?"#7BE0A0":"#E8B84B" },
                { l:"仕訳紐づけ", v:f.linked?"✓ 仕訳No."+f.journalId:"未紐づけ", c:f.linked?"#7BE0A0":"#E8B84B" },
                { l:"命名規則", v:f.nameOk?"✓ 準拠":"⚠ 要整形", c:f.nameOk?"#7BE0A0":"#E8B84B" },
                { l:"電帳法", v:f.ts&&f.nameOk?"✓ 準拠":"⚠ 一部未対応", c:f.ts&&f.nameOk?"#7BE0A0":"#E8B84B" },
              ].map((d,i) => (
                <div key={i} style={{ padding:"10px 12px", borderRadius:12, background:"rgba(139,123,244,.03)", border:"1px solid rgba(139,123,244,.06)" }}>
                  <div style={{ fontSize:9, color:C.textMut, marginBottom:3 }}>{d.l}</div>
                  <div style={{ fontSize:12, color:d.c||"#fff", fontWeight:600 }}>{d.v}</div>
                </div>
              ))}
            </div>
            <div style={{ display:"flex", gap:8, marginTop:16 }}>
              {f.isImage && f.previewUrl && (
                <Mag onClick={()=>setPreviewFile({ name:f.name, url:f.previewUrl })} s={{ flex:1, padding:"10px", borderRadius:14, border:"1.5px solid rgba(139,123,244,.2)", background:"rgba(139,123,244,.06)", color:"#C4B8FF", fontSize:11, fontWeight:600, cursor:"pointer", fontFamily:bd, textAlign:"center" }}>画像を拡大</Mag>
              )}
              <Mag s={{ flex:1, padding:"10px", borderRadius:14, border:`1.5px solid ${C.border}`, background:"transparent", color:C.textSec, fontSize:11, fontWeight:600, cursor:"pointer", fontFamily:bd, textAlign:"center" }}>ダウンロード</Mag>
              {!f.nameOk && <Mag s={{ flex:1, padding:"10px", borderRadius:14, border:"1.5px solid rgba(139,123,244,.2)", background:"rgba(139,123,244,.06)", color:"#C4B8FF", fontSize:11, fontWeight:600, cursor:"pointer", fontFamily:bd, textAlign:"center" }}>名前を自動整形</Mag>}
            </div>
          </Card3></Rv>
        );
      })()}

      {/* ── 画像フルスクリーンプレビュー ── */}
      {previewFile && (
        <div onClick={()=>setPreviewFile(null)} style={{ position:"fixed", inset:0, zIndex:1000, background:"rgba(0,0,0,.85)", backdropFilter:"blur(12px)", display:"flex", alignItems:"center", justifyContent:"center", padding:40 }}>
          <div onClick={e=>e.stopPropagation()} style={{ maxWidth:"90vw", maxHeight:"88vh", position:"relative" }}>
            <img src={previewFile.url} alt={previewFile.name} style={{ maxWidth:"100%", maxHeight:"82vh", borderRadius:12, boxShadow:"0 40px 80px rgba(0,0,0,.6)", display:"block" }} />
            <div style={{ position:"absolute", top:-36, left:0, right:0, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div style={{ fontSize:11, color:"rgba(255,255,255,.5)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:"80%" }}>{previewFile.name}</div>
              <Mag onClick={()=>setPreviewFile(null)} s={{ padding:"4px 12px", border:"1px solid rgba(255,255,255,.15)", borderRadius:8, background:"rgba(255,255,255,.06)", color:"rgba(255,255,255,.6)", fontSize:12, cursor:"pointer", fontFamily:bd }}>✕ 閉じる</Mag>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}

/* ════════════════════════════════ 書類発行 (DOC ISSUE) ════════════════════════════════ */
function DocIssuePage() {
  const [activeCat, setActiveCat] = useState("取引");
  const [activeDoc, setActiveDoc] = useState(null);
  const [editData, setEditData] = useState({});
  const [issued, setIssued] = useState([
    { id:"ISS-001", type:"請求書", partner:"AWS Japan", amount:248000, date:"2026/02/18", status:"送付済" },
    { id:"ISS-002", type:"見積書", partner:"山田商事", amount:1500000, date:"2026/02/15", status:"下書き" },
    { id:"ISS-003", type:"領収書", partner:"スターバックス", amount:1200, date:"2026/02/18", status:"発行済" },
  ]);
  const [tab, setTab] = useState("templates");
  const [aiOpen, setAiOpen] = useState(true);
  const [aiInput, setAiInput] = useState("");
  const [aiChat, setAiChat] = useState([]);

  /* Per-document AI recommendations */
  const aiRecommendations = {
    invoice: [
      { l:"支払期限を追加", d:"末締め翌月末払いの支払条件を記載" },
      { l:"振込手数料の負担先を明記", d:"「振込手数料はご負担ください」を追加" },
      { l:"遅延損害金の条項を追加", d:"年14.6%の遅延損害金条項を挿入" },
      { l:"インボイス番号を確認", d:"適格請求書の要件をチェック" },
    ],
    estimate: [
      { l:"有効期限を設定", d:"発行日から30日間の有効期限を追記" },
      { l:"別途費用の注記を追加", d:"交通費・宿泊費等の実費精算条件" },
      { l:"納期の目安を記載", d:"契約締結後の作業期間を明示" },
      { l:"前提条件を追記", d:"見積もりの前提となる条件を備考に記載" },
    ],
    delivery: [
      { l:"検収条件を明記", d:"納品後7営業日以内の検収期間を追記" },
      { l:"保証条件を追加", d:"納品物の保証期間と範囲を記載" },
    ],
    receipt: [
      { l:"但し書きを追加", d:"「品代として」等の但し書きを記載" },
      { l:"収入印紙の確認", d:"5万円以上の場合は印紙税が必要です" },
    ],
    order: [
      { l:"納期を指定", d:"希望納品日を明記" },
      { l:"検収基準を記載", d:"受入検査の基準と不合格時の対応" },
    ],
    serviceContract: [
      { l:"知的財産権の帰属条項を追加", d:"成果物の著作権・特許権の帰属先を明確化" },
      { l:"再委託の条件を追加", d:"乙の再委託を認めるか、条件を設定" },
      { l:"契約解除条項を追加", d:"中途解約の条件と清算方法を規定" },
      { l:"反社会的勢力排除条項を追加", d:"コンプライアンス上の必須条項" },
      { l:"準拠法・管轄裁判所を追加", d:"日本法準拠、東京地裁管轄を明記" },
    ],
    nda: [
      { l:"秘密情報の例外規定を追加", d:"公知情報・独自開発情報の除外を明記" },
      { l:"開示範囲の制限を追加", d:"need-to-know原則に基づく開示制限" },
      { l:"残存条項を追加", d:"契約終了後も存続する義務の範囲を明確化" },
      { l:"差止請求の条項を追加", d:"違反時の差止・仮処分の権利を規定" },
    ],
    salesContract: [
      { l:"所有権移転時期を明記", d:"代金完済時に所有権が移転する旨を追加" },
      { l:"危険負担の条項を追加", d:"引渡前後の滅失・毀損リスクの負担先" },
      { l:"返品条件を追加", d:"返品・交換の条件と期限を規定" },
    ],
    leaseContract: [
      { l:"更新条件を追加", d:"自動更新の条件と賃料改定の取り決め" },
      { l:"禁止事項を追加", d:"転貸、用途変更、改装等の禁止事項" },
      { l:"退去時の精算条項を追加", d:"敷金返還と原状回復費用の精算方法" },
    ],
    coverLetter: [
      { l:"送付書類一覧を確認", d:"同封書類の抜け漏れがないか確認" },
      { l:"返送期限を追記", d:"署名済み書類の返送期限を明記" },
    ],
    greeting: [
      { l:"移転案内の文例に変更", d:"本社移転のお知らせ文面に切替" },
      { l:"年始挨拶の文例に変更", d:"新年のご挨拶文面に切替" },
      { l:"設立記念の文例に変更", d:"創業○周年の挨拶文面に切替" },
    ],
    thankYou: [
      { l:"打合せお礼の文例に変更", d:"会議・面談後のお礼文面" },
      { l:"受注お礼に変更", d:"ご発注への感謝と今後の進め方" },
      { l:"紹介お礼に変更", d:"ご紹介いただいた方へのお礼" },
    ],
    reminder: [
      { l:"2回目の督促文に変更", d:"より強い表現の再督促文面" },
      { l:"法的措置の予告を追加", d:"期限内に支払いなき場合の対応を明記" },
    ],
    travelExp: [
      { l:"定期区間を控除", d:"通勤定期区間の重複を自動差し引き" },
    ],
    expense: [
      { l:"承認フローを確認", d:"必要な承認者を追記" },
    ],
  };

  /* ── SVG Icon components ── */
  const DI = ({ d, sz=20, c="currentColor" }) => <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={d}/></svg>;
  const icons = {
    invoice:     (c) => <DI d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M12 18v-6M9 15h6" c={c}/>,
    estimate:    (c) => <DI d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8" c={c}/>,
    delivery:    (c) => <DI d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16zM3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" c={c}/>,
    receipt:     (c) => <DI d="M4 2v20l3-2 3 2 3-2 3 2V2l-3 2-3-2-3 2zM8 10h8M8 14h4" c={c}/>,
    order:       (c) => <DI d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2M9 14l2 2 4-4" c={c}/>,
    orderAck:    (c) => <DI d="M22 11.08V12a10 10 0 11-5.93-9.14M22 4L12 14.01l-3-3" c={c}/>,
    payNotice:   (c) => <DI d="M21 12V7H5a2 2 0 010-4h14v4M3 5v14a2 2 0 002 2h16v-5M18 12a2 2 0 000 4h4v-4z" c={c}/>,
    depositConf: (c) => <DI d="M22 2l-7 20-4-9-9-4zM22 2L11 13" c={c}/>,
    reminder:    (c) => <DI d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01" c={c}/>,
    expense:     (c) => <DI d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" c={c}/>,
    serviceContract: (c) => <DI d="M20 7h-9M14 17H5M17 17l2 2 4-4M3 7l2 2 4-4" c={c}/>,
    nda:         (c) => <DI d="M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2zM7 11V7a5 5 0 0110 0v4M12 15v2" c={c}/>,
    salesContract: (c) => <DI d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" c={c}/>,
    leaseContract: (c) => <DI d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2zM9 22V12h6v10" c={c}/>,
    withdrawSlip:(c) => <DI d="M12 5v14M5 12l7 7 7-7" c={c}/>,
    depositSlip: (c) => <DI d="M12 19V5M5 12l7-7 7 7" c={c}/>,
    transferSlip:(c) => <DI d="M17 1l4 4-4 4M3 11V9a4 4 0 014-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 01-4 4H3" c={c}/>,
    travelExp:   (c) => <DI d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7" c={c}/>,
    advanceExp:  (c) => <DI d="M19 5h-7L8 1 4 5h-.5a2.5 2.5 0 000 5H6l-3 8h2l1-3h10l1 3h2l-3-8h2.5a2.5 2.5 0 000-5z" c={c}/>,
    coverLetter: (c) => <DI d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6" c={c}/>,
    greeting:    (c) => <DI d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" c={c}/>,
    thankYou:    (c) => <DI d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 3a5 5 0 11-.001 10.001A5 5 0 0112 3zM16 3.13a4 4 0 010 7.75" c={c}/>,
  };

  /* ── Per-document-type field config ── */
  const docFieldConfig = {
    invoice:     { hasPartnerAddr:true, hasDueDate:true, hasBank:true, hasItems:true, hasStamp:true },
    estimate:    { hasPartnerAddr:true, hasValidity:true, hasItems:true, hasNote:true },
    delivery:    { hasPartnerAddr:true, hasItems:true },
    receipt:     { hasPartnerAddr:false, hasItems:true, hasPayMethod:true, hasStamp:true },
    order:       { hasPartnerAddr:true, hasDueDate:true, hasItems:true, hasDeliveryAddr:true },
    orderAck:    { hasPartnerAddr:true, hasDueDate:true, hasItems:true },
    payNotice:   { hasPartnerAddr:true, hasDueDate:true, hasItems:true, hasBank:true },
    depositConf: { hasPartnerAddr:true, hasAmount:true, hasBank:true, hasBody:true },
    reminder:    { hasPartnerAddr:true, hasDueDate:true, hasItems:true, hasBank:true, hasNote:true },
    expense:     { hasItems:true, hasApprover:true },
    serviceContract: { hasPartnerAddr:true, hasContractPeriod:true, hasClauses:true, hasStamp:true },
    nda:         { hasPartnerAddr:true, hasContractPeriod:true, hasClauses:true, hasStamp:true },
    salesContract:   { hasPartnerAddr:true, hasDueDate:true, hasClauses:true, hasStamp:true },
    leaseContract:   { hasPartnerAddr:true, hasContractPeriod:true, hasClauses:true, hasStamp:true },
    withdrawSlip:    { hasSlipFields:true, hasApprover:true },
    depositSlip:     { hasSlipFields:true, hasApprover:true },
    transferSlip:    { hasSlipFields:true, hasApprover:true },
    travelExp:   { hasTravelRows:true, hasApprover:true },
    advanceExp:  { hasItems:true, hasApprover:true },
    coverLetter: { hasPartnerAddr:true, hasBody:true, hasEnclosures:true },
    greeting:    { hasPartnerAddr:true, hasBody:true },
    thankYou:    { hasPartnerAddr:true, hasBody:true },
  };

  const templates = [
    { cat:"取引", items:[
      { id:"invoice", name:"請求書", desc:"取引先への代金請求" },
      { id:"estimate", name:"見積書", desc:"取引条件の事前提示" },
      { id:"delivery", name:"納品書", desc:"商品・サービスの納品確認" },
      { id:"receipt", name:"領収書", desc:"代金受領の証明" },
      { id:"order", name:"注文書（発注書）", desc:"商品・サービスの発注" },
      { id:"orderAck", name:"注文請書", desc:"受注確認の書面" },
    ]},
    { cat:"入出金", items:[
      { id:"payNotice", name:"支払通知書", desc:"支払い予定の通知" },
      { id:"depositConf", name:"入金確認書", desc:"入金確認の通知" },
      { id:"reminder", name:"督促状", desc:"未払い代金の催促" },
      { id:"expense", name:"精算書", desc:"経費の精算申請" },
    ]},
    { cat:"契約", items:[
      { id:"serviceContract", name:"業務委託契約書", desc:"業務委託の契約条件" },
      { id:"nda", name:"秘密保持契約書", desc:"機密情報の取扱い" },
      { id:"salesContract", name:"売買契約書", desc:"売買取引の契約" },
      { id:"leaseContract", name:"賃貸借契約書", desc:"賃貸物件の契約" },
    ]},
    { cat:"社内・経理", items:[
      { id:"withdrawSlip", name:"出金伝票", desc:"現金支出の記録" },
      { id:"depositSlip", name:"入金伝票", desc:"現金収入の記録" },
      { id:"transferSlip", name:"振替伝票", desc:"振替取引の記録" },
      { id:"travelExp", name:"交通費精算書", desc:"交通費の精算" },
      { id:"advanceExp", name:"立替金精算書", desc:"立替払いの精算" },
    ]},
    { cat:"対外", items:[
      { id:"coverLetter", name:"送付状", desc:"書類送付の案内" },
      { id:"greeting", name:"挨拶状", desc:"取引先への挨拶" },
      { id:"thankYou", name:"お礼状", desc:"取引先へのお礼" },
    ]},
  ];

  const allItems = templates.flatMap(c => c.items);

  const openPreview = (docId) => {
    setActiveDoc(docId);
    const cfg = docFieldConfig[docId] || {};
    const tpl = allItems.find(x=>x.id===docId);
    const base = {
      title: tpl?.name || "書類", num: "DOC-2026-001", issueDate: "2026/02/25",
      partner: "", partnerAddr: "", partnerTel: "",
      issuerName: "クライアント名", issuerAddr: "住所未設定",
      issuerTel: "未設定", issuerEmail: "info@technova.co.jp", invoiceNum: "T1234567890123",
      rows: [], clauses: [], travelRows: [], slipEntries: [], enclosures: [],
      note: "", body: "", dueDate: "", validity: "", payMethod: "",
      bankName: "三菱UFJ銀行 渋谷支店", bankAccount: "普通 1234567", bankHolder: "カ）クライアント名",
      approver: "", contractStart: "", contractEnd: "", deliveryAddr: "", singleAmount: 0,
    };
    /* Per-type sample content */
    const samples = {
      invoice: { rows:[{ item:"Webサイト制作（トップ+下層5P）", qty:1, unit:"式", price:500000 },{ item:"レスポンシブ対応", qty:1, unit:"式", price:80000 },{ item:"ロゴデザイン・ブランディング", qty:1, unit:"式", price:150000 },{ item:"SEO初期設定・Google Analytics導入", qty:1, unit:"式", price:50000 },{ item:"月額保守・運用サポート（3月分）", qty:1, unit:"月", price:50000 }], dueDate:"2026/03/31", bank:"銀行口座未設定", note:"お支払期限：2026年3月31日\n振込手数料はお客様ご負担にてお願いいたします。\n適格請求書発行事業者登録番号：T1234567890123" },
      estimate: { rows:[{ item:"要件定義・基本設計", qty:10, unit:"人日", price:60000 },{ item:"フロントエンド開発（React）", qty:30, unit:"人日", price:55000 },{ item:"バックエンド開発（Node.js）", qty:25, unit:"人日", price:55000 },{ item:"データベース設計・構築", qty:5, unit:"人日", price:60000 },{ item:"テスト・品質管理", qty:15, unit:"人日", price:50000 },{ item:"サーバー構築・デプロイ", qty:5, unit:"人日", price:55000 },{ item:"プロジェクト管理費", qty:1, unit:"式", price:300000 }], validity:"発行日より30日間有効", note:"【前提条件】\n・ご契約後のキックオフから約3ヶ月での納品を想定\n・お客様側のレビュー・フィードバック期間を含む\n・サーバー費用（AWS等）は別途実費精算\n・追加要件が発生した場合は別途お見積り\n\n【お支払条件】\n・着手金：契約締結時に30%\n・中間金：中間納品時に30%\n・残金：最終納品・検収後に40%" },
      delivery: { rows:[{ item:"Webサイト制作一式（HTML/CSS/JS）", qty:1, unit:"式", price:500000 },{ item:"デザインデータ（Figma/PSD）", qty:1, unit:"式", price:150000 },{ item:"ロゴデータ（AI/SVG/PNG）", qty:1, unit:"式", price:0 },{ item:"操作マニュアル", qty:1, unit:"部", price:0 }], note:"【検収について】\n・検収期間：納品日から7営業日以内\n・上記期間内にご連絡がない場合、検収完了とさせていただきます。\n\n【納品物一覧】\n・Webサイト本体（本番環境へのデプロイ済み）\n・ソースコード一式（GitHub リポジトリ）\n・デザインデータ（Figma共有リンク）\n・操作マニュアル（PDF）" },
      receipt: { rows:[{ item:"コンサルティング費用（2月分）", qty:1, unit:"式", price:110000 }], payMethod:"銀行振込", note:"上記の金額を正に領収いたしました。\n\n収入印紙：非課税（5万円未満の場合）\n※ 本領収書は電子発行につき、印紙税法上の課税対象外です。" },
      order: { rows:[{ item:"ノートPC（ThinkPad X1 Carbon Gen11）", qty:5, unit:"台", price:198000 },{ item:"外付けモニター 27インチ 4K", qty:5, unit:"台", price:45000 },{ item:"USB-C ドッキングステーション", qty:5, unit:"個", price:12800 },{ item:"ワイヤレスキーボード・マウスセット", qty:5, unit:"セット", price:8900 }], deliveryAddr:"住所未設定 クライアント名本社 総務部宛", deliveryDate:"2026/03/15", note:"納品は平日9:00〜17:00にお願いいたします。\n搬入時は事前に担当（総務部 佐藤 TEL: 未設定）までご連絡ください。" },
      orderAck: { rows:[{ item:"ノートPC（ThinkPad X1 Carbon Gen11）", qty:5, unit:"台", price:198000 },{ item:"外付けモニター 27インチ 4K", qty:5, unit:"台", price:45000 },{ item:"USB-C ドッキングステーション", qty:5, unit:"個", price:12800 },{ item:"ワイヤレスキーボード・マウスセット", qty:5, unit:"セット", price:8900 }], deliveryDate:"2026/03/15", note:"ご注文いただき誠にありがとうございます。\n上記の通り承りましたので、ご確認くださいますようお願い申し上げます。\nお届け予定日：2026年3月15日（月）\nお支払条件：納品月末締め翌月末払い" },
      payNotice: { rows:[{ item:"システム開発費（2月分）", qty:1, unit:"式", price:800000 },{ item:"サーバー保守費（2月分）", qty:1, unit:"式", price:55000 }], dueDate:"2026/03/31", bank:"銀行口座未設定", note:"拝啓　時下ますますご清栄のこととお慶び申し上げます。\n\n下記の通りお支払いさせていただきますので、ご確認くださいますようお願い申し上げます。\n\nお支払方法：銀行振込\nお支払予定日：2026年3月31日\n\n※ 振込手数料は弊社にて負担いたします。\n\n敬具" },
      depositConf: { singleAmount:770000, body:"拝啓　時下ますますご清栄のこととお慶び申し上げます。\n平素は格別のご高配を賜り、厚く御礼申し上げます。\n\n下記のとおり入金を確認いたしましたので、ご通知申し上げます。\n\n【入金明細】\n入金日：2026年2月20日\n入金額：¥770,000\n摘　要：Webサイト制作費用\n請求書番号：INV-2026-012\nお振込元：山田商事株式会社 様\n\n引き続きお取引のほど、何卒よろしくお願い申し上げます。\n\n敬具" },
      reminder: { rows:[{ item:"Webサイト制作費用", qty:1, unit:"式", price:770000 }], dueDate:"2026/01/31", note:"拝啓　時下ますますご清栄のこととお慶び申し上げます。\n\nさて、下記の通りお支払い期日を過ぎた未入金がございますので、ご確認のうえ至急のお手続きをお願い申し上げます。\n\n請求書番号：INV-2026-012\nお支払期限：2026年1月31日\n\n既にお支払い済みの場合は、本状と行き違いとなりますことをご容赦ください。\nご不明な点がございましたら、下記連絡先までお問い合わせください。\n\n敬具" },
      expense: { rows:[{ item:"交通費（タクシー）渋谷→品川 客先訪問", qty:1, unit:"回", price:4200 },{ item:"会食費（接待）鈴木部長 和食○○", qty:1, unit:"回", price:32400 },{ item:"文具・備品（コピー用紙・トナー）", qty:1, unit:"式", price:5800 },{ item:"書籍代（税法改正対応ハンドブック）", qty:2, unit:"冊", price:3300 },{ item:"会議室利用料（○○コワーキング）", qty:1, unit:"回", price:5500 },{ item:"宅配便（契約書送付 山田商事宛）", qty:1, unit:"回", price:1200 }], approver:"田中部長", note:"※ 領収書はすべて原本を添付しております。\n※ 接待費は事前に田中部長の承認済みです（承認番号: AP-2026-045）。" },
      serviceContract: { clauses:[
        { title:"第1条（委託業務の内容）", text:"甲は乙に対し、以下の業務（以下「本業務」という）を委託し、乙はこれを受託する。\n\n① Webアプリケーション開発業務\n② システム設計・テスト業務\n③ 運用保守業務\n④ 上記に付随する一切の業務\n\n業務の詳細は、別紙仕様書に定める。" },
        { title:"第2条（委託料及び支払方法）", text:"1. 委託料は月額 金○○万円（消費税別）とする。\n2. 乙は毎月末日締めにて請求書を甲に発行するものとする。\n3. 甲は請求書受領後、翌月末日までに乙の指定する銀行口座へ振込にて支払うものとする。\n4. 振込手数料は甲の負担とする。" },
        { title:"第3条（契約期間）", text:"1. 本契約の有効期間は、令和○年○月○日から令和○年○月○日までとする。\n2. 期間満了の1ヶ月前までに甲乙いずれからも書面による解約の申し出がない場合は、同一条件にて1年間自動更新されるものとし、以後も同様とする。" },
        { title:"第4条（再委託の禁止）", text:"乙は、甲の書面による事前の承諾を得ることなく、本業務の全部又は一部を第三者に再委託してはならない。" },
        { title:"第5条（秘密保持）", text:"1. 甲及び乙は、本契約に関連して知り得た相手方の技術上・営業上その他の秘密情報を、相手方の書面による事前の承諾なく第三者に開示又は漏洩してはならない。\n2. 前項の義務は、本契約終了後3年間存続するものとする。" },
        { title:"第6条（知的財産権）", text:"1. 本業務に基づき乙が作成した成果物の著作権（著作権法第27条及び第28条の権利を含む）は、委託料の完済をもって甲に帰属するものとする。\n2. 乙は、甲に対し著作者人格権を行使しないものとする。" },
        { title:"第7条（損害賠償）", text:"甲又は乙が本契約に違反し、相手方に損害を与えた場合、違反当事者は相手方に対しその直接かつ現実に生じた損害を賠償する責任を負う。ただし、賠償額の上限は、当該損害の原因となった個別契約の委託料の総額とする。" },
        { title:"第8条（解除）", text:"甲又は乙は、相手方が以下の各号のいずれかに該当した場合、何らの催告なく直ちに本契約を解除することができる。\n① 本契約に重大な違反をし、催告後14日以内に是正しないとき\n② 支払停止又は支払不能に陥ったとき\n③ 破産、民事再生、会社更生又は特別清算の申立てがあったとき" },
        { title:"第9条（反社会的勢力の排除）", text:"甲及び乙は、自ら又はその役員等が反社会的勢力に該当しないことを表明・保証し、将来にわたっても該当しないことを確約する。" },
        { title:"第10条（協議事項）", text:"本契約に定めのない事項又は本契約の解釈に疑義が生じた場合は、甲乙誠意をもって協議し、円満に解決するものとする。" },
        { title:"第11条（準拠法及び管轄裁判所）", text:"本契約は日本法を準拠法とし、本契約に関する一切の紛争については、東京地方裁判所を第一審の専属的合意管轄裁判所とする。" },
      ], contractStart:"2026/04/01", contractEnd:"2027/03/31" },
      nda: { clauses:[
        { title:"第1条（秘密情報の定義）", text:"1. 本契約における「秘密情報」とは、開示当事者が受領当事者に対し、書面、口頭、電子的手段その他の方法により開示する技術上、営業上、その他事業に関する一切の情報をいう。\n2. ただし、以下の各号に該当する情報は秘密情報に含まないものとする。\n  ① 開示の時点で既に公知であったもの\n  ② 開示後、受領当事者の責によらず公知となったもの\n  ③ 開示の時点で受領当事者が既に保有していたもの\n  ④ 受領当事者が第三者から秘密保持義務を負うことなく適法に取得したもの\n  ⑤ 受領当事者が秘密情報を利用することなく独自に開発したもの" },
        { title:"第2条（秘密保持義務）", text:"1. 受領当事者は、秘密情報を善良な管理者の注意をもって管理し、開示当事者の書面による事前の承諾なく第三者に開示又は漏洩してはならない。\n2. 受領当事者は、秘密情報へのアクセスを、本契約の目的のために知る必要のある自己の役員及び従業員に限定するものとする。" },
        { title:"第3条（目的外使用の禁止）", text:"受領当事者は、秘密情報を本契約の目的（以下「本目的」という）以外に使用してはならない。" },
        { title:"第4条（複製の制限）", text:"受領当事者は、本目的のために合理的に必要な範囲を超えて秘密情報を複製してはならない。" },
        { title:"第5条（秘密情報の返還・廃棄）", text:"1. 本契約が終了した場合、又は開示当事者から要求があった場合、受領当事者は秘密情報及びその複製物を速やかに返還又は廃棄しなければならない。\n2. 廃棄した場合、受領当事者は廃棄した旨の証明書を開示当事者に提出するものとする。" },
        { title:"第6条（有効期間）", text:"1. 本契約の有効期間は、締結日から3年間とする。\n2. 秘密保持義務は、本契約終了後もなお5年間存続するものとする。" },
        { title:"第7条（損害賠償）", text:"本契約に違反して秘密情報を漏洩又は目的外使用した場合、違反当事者は相手方に生じた一切の損害（弁護士費用を含む）を賠償する責任を負う。" },
        { title:"第8条（差止請求）", text:"秘密情報の漏洩又は目的外使用のおそれがある場合、開示当事者は受領当事者に対し、当該行為の差止めを請求することができる。" },
        { title:"第9条（準拠法及び管轄裁判所）", text:"本契約は日本法を準拠法とし、本契約に関する一切の紛争については、東京地方裁判所を第一審の専属的合意管轄裁判所とする。" },
      ], contractStart:"2026/02/25", contractEnd:"2029/02/24" },
      salesContract: { clauses:[
        { title:"第1条（目的）", text:"甲は乙に対し、別紙に定める商品（以下「本商品」という）を売り渡し、乙はこれを買い受けるものとする。" },
        { title:"第2条（売買代金及び支払方法）", text:"1. 売買代金は金○○円（消費税別）とする。\n2. 乙は、本契約締結後○営業日以内に、甲の指定する銀行口座へ振込にて全額を支払うものとする。\n3. 振込手数料は乙の負担とする。" },
        { title:"第3条（引渡し）", text:"1. 甲は、代金全額の受領を確認した後、○営業日以内に本商品を乙の指定場所へ引き渡すものとする。\n2. 引渡しに要する運送費用は甲の負担とする。\n3. 本商品の滅失・毀損等の危険は、引渡しの完了をもって甲から乙に移転するものとする。" },
        { title:"第4条（所有権の移転）", text:"本商品の所有権は、売買代金の全額支払いが完了した時点で甲から乙に移転するものとする。" },
        { title:"第5条（検収）", text:"1. 乙は、本商品の受領後○営業日以内に検収を行い、その結果を甲に通知するものとする。\n2. 当該期間内に通知がない場合は、検収に合格したものとみなす。\n3. 検収不合格の場合、甲は速やかに代替品の納入又は修補を行うものとする。" },
        { title:"第6条（契約不適合責任）", text:"1. 引渡後○ヶ月以内に本商品に種類、品質又は数量に関して契約の内容に適合しない箇所（以下「契約不適合」という）が発見された場合、甲は無償にて修補、代替品の引渡し、又は代金の減額を行うものとする。\n2. 乙は、契約不適合を知った時から1年以内にその旨を甲に通知しなければならない。" },
        { title:"第7条（準拠法及び管轄裁判所）", text:"本契約は日本法を準拠法とし、本契約に関する一切の紛争については、東京地方裁判所を第一審の専属的合意管轄裁判所とする。" },
      ] },
      leaseContract: { clauses:[
        { title:"第1条（賃貸物件）", text:"甲は乙に対し、下記の物件（以下「本物件」という）を賃貸し、乙はこれを賃借する。\n\n所在地：東京都○○区○○丁目○番○号\n建物名：○○ビル ○階\n面　積：○○.○○㎡\n用　途：事務所" },
        { title:"第2条（賃貸借期間）", text:"1. 賃貸借期間は令和○年○月○日から令和○年○月○日までの○年間とする。\n2. 甲又は乙は、期間満了の6ヶ月前までに書面にて相手方に通知することにより、本契約の更新を拒絶することができる。\n3. 前項の通知がない場合、本契約は同一条件にて2年間更新されるものとする。" },
        { title:"第3条（賃料及び支払方法）", text:"1. 賃料は月額 金○○万円（消費税別）とする。\n2. 乙は毎月末日までに翌月分の賃料を甲の指定する銀行口座へ振込にて支払うものとする。\n3. 振込手数料は乙の負担とする。\n4. 賃料の改定は、経済情勢の変動等を考慮し、甲乙協議のうえ決定する。" },
        { title:"第4条（敷金）", text:"1. 乙は本契約締結時に、敷金として賃料の○ヶ月分に相当する金○○万円を甲に預託する。\n2. 甲は本契約終了後、乙の未払債務を控除した残額を、本物件の明渡し完了後30日以内に返還するものとする。" },
        { title:"第5条（禁止事項）", text:"乙は、甲の書面による事前の承諾なく、以下の行為をしてはならない。\n① 本物件の全部又は一部の転貸\n② 賃借権の譲渡\n③ 本物件の増改築、模様替え又は造作の設置\n④ 用途の変更" },
        { title:"第6条（修繕）", text:"1. 本物件の構造躯体及び主要設備の修繕は甲の負担とする。\n2. 乙の使用に起因する修繕は乙の負担とする。" },
        { title:"第7条（原状回復及び明渡し）", text:"1. 乙は本契約終了時に、通常の使用による損耗及び経年劣化を除き、本物件を原状に回復して甲に明け渡さなければならない。\n2. 原状回復の範囲及び費用については、国土交通省のガイドラインに準拠するものとする。" },
        { title:"第8条（準拠法及び管轄裁判所）", text:"本契約は日本法を準拠法とし、本契約に関する一切の紛争については、本物件所在地を管轄する地方裁判所を第一審の専属的合意管轄裁判所とする。" },
      ], contractStart:"2026/04/01", contractEnd:"2028/03/31" },
      withdrawSlip: { slipEntries:[{ date:"2026/02/25", account:"消耗品費", partner:"文具堂渋谷店", amount:3500, memo:"コピー用紙A4 5箱" },{ date:"2026/02/25", account:"通信費", partner:"NTT東日本", amount:8800, memo:"電話回線使用料2月分" },{ date:"2026/02/25", account:"新聞図書費", partner:"丸善ジュンク堂", amount:6600, memo:"税務専門書2冊" }] },
      depositSlip: { slipEntries:[{ date:"2026/02/25", account:"売上", partner:"山田商事株式会社", amount:550000, memo:"Web制作費入金（INV-2026-010）" },{ date:"2026/02/25", account:"売上", partner:"鈴木工業株式会社", amount:330000, memo:"コンサルティング費入金（INV-2026-011）" }] },
      transferSlip: { slipEntries:[{ date:"2026/02/25", debitAcc:"未払金", creditAcc:"普通預金", amount:380000, memo:"事務所家賃3月分" },{ date:"2026/02/25", debitAcc:"前払費用", creditAcc:"普通預金", amount:120000, memo:"保険料年払い按分" }] },
      travelExp: { travelRows:[
        { date:"2026/02/18", from:"渋谷", to:"新宿", transport:"JR山手線", amount:200, memo:"山田商事 定例打合せ" },
        { date:"2026/02/18", from:"新宿", to:"品川", transport:"JR山手線", amount:200, memo:"鈴木工業 現地調査" },
        { date:"2026/02/18", from:"品川", to:"渋谷", transport:"JR山手線", amount:200, memo:"帰社" },
        { date:"2026/02/19", from:"渋谷", to:"東京", transport:"JR山手線", amount:200, memo:"税理士会セミナー参加" },
        { date:"2026/02/19", from:"東京", to:"渋谷", transport:"JR山手線", amount:200, memo:"帰社" },
        { date:"2026/02/20", from:"渋谷", to:"六本木", transport:"東京メトロ日比谷線", amount:180, memo:"新規顧客 面談" },
        { date:"2026/02/20", from:"六本木", to:"渋谷", transport:"東京メトロ日比谷線", amount:180, memo:"帰社" },
        { date:"2026/02/21", from:"渋谷", to:"横浜", transport:"東急東横線", amount:280, memo:"佐藤製作所 決算打合せ" },
        { date:"2026/02/21", from:"横浜", to:"渋谷", transport:"東急東横線", amount:280, memo:"帰社" },
      ], approver:"田中部長", note:"※ 通勤定期区間（渋谷〜恵比寿）は控除済みです。\n※ 2/21 横浜出張は事前申請済み（出張申請番号: TR-2026-018）。" },
      advanceExp: { rows:[{ item:"打合せ用 飲料・軽食代", qty:1, unit:"式", price:2400 },{ item:"タクシー代（雨天・書類搬送）", qty:1, unit:"回", price:3200 },{ item:"駐車場代（客先訪問時）", qty:2, unit:"回", price:1600 },{ item:"コンビニ印刷（緊急資料）", qty:1, unit:"回", price:480 }], approver:"田中部長", note:"※ 仮払金は2026年2月28日までに精算いたします。" },
      coverLetter: { body:"拝啓　時下ますますご清栄のこととお慶び申し上げます。\n平素は格別のご高配を賜り、厚く御礼申し上げます。\n\nさて、下記の書類をお送りいたしますので、ご査収くださいますようお願い申し上げます。\n\nなお、ご確認の上、同封の控えに受領印を押印いただき、同封の返信用封筒にてご返送くださいますようお願い申し上げます。\n\nご不明な点がございましたら、担当（佐藤 TEL: 未設定）までお気軽にお問い合わせください。\n\n今後とも何卒よろしくお願い申し上げます。\n\n敬具", enclosures:["業務委託契約書（正本・副本）  各1通","請求書  1通","納品書  1通","返信用封筒  1通"] },
      greeting: { body:"拝啓　時下ますますご清栄のこととお慶び申し上げます。\n平素は格別のご高配を賜り、厚く御礼申し上げます。\n\nさて、この度弊社は業務拡大に伴い、下記の通り本社を移転する運びとなりましたので、ご案内申し上げます。\n\n【移転日】\n令和8年4月1日（水）\n\n【新住所】\n〒150-0001\n住所未設定 クライアント名ビル\nTEL: 未設定（代表）\nFAX: 03-1234-5679\nE-mail: info@technova.co.jp\n\n【アクセス】\nJR山手線「原宿駅」竹下口より徒歩5分\n東京メトロ千代田線「明治神宮前駅」5番出口より徒歩3分\n\n新しいオフィスでは、より一層お客様のご期待に添えるよう、社員一同精進して参ります。\n今後とも変わらぬご支援ご愛顧を賜りますよう、何卒よろしくお願い申し上げます。\n\nまずは略儀ながら、書面にてご挨拶申し上げます。\n\n敬具" },
      thankYou: { body:"拝啓　時下ますますご清栄のこととお慶び申し上げます。\n平素は格別のご高配を賜り、厚く御礼申し上げます。\n\nさて、先日はお忙しい中、貴重なお時間をいただきまして、誠にありがとうございました。\n\nご面談の中で頂戴いたしましたご意見・ご要望につきましては、社内にて慎重に検討させていただいております。近日中に具体的なご提案をまとめた上で、改めてご連絡させていただきたく存じます。\n\nまた、ご提示いただいた資料につきましても、大変参考になりました。重ねて御礼申し上げます。\n\n今後とも末永いお付き合いをいただけますよう、何卒よろしくお願い申し上げます。\n\nまずは略儀ながら、書中をもってお礼申し上げます。\n\n敬具" },
    };
    setEditData({ ...base, ...samples[docId] });
  };

  /* recalc helper */
  const recalc = (rows) => {
    const subtotal = rows.reduce((s,r) => s + (Number(r.qty)||0) * (Number(r.price)||0), 0);
    return { subtotal, tax: Math.round(subtotal * 0.1), total: Math.round(subtotal * 1.1) };
  };

  const updateField = (key, val) => setEditData(p => ({ ...p, [key]: val }));
  const updateRow = (idx, key, val) => {
    setEditData(prev => {
      const rows = [...prev.rows];
      rows[idx] = { ...rows[idx], [key]: key==="item"||key==="unit" ? val : val };
      const calc = recalc(rows);
      return { ...prev, rows, ...calc };
    });
  };
  const addRow = () => setEditData(p => ({ ...p, rows: [...p.rows, { item:"", qty:1, unit:"式", price:0 }] }));
  const removeRow = (idx) => {
    setEditData(prev => {
      const rows = prev.rows.filter((_,i) => i !== idx);
      return { ...prev, rows, ...recalc(rows) };
    });
  };

  const fmt = n => "\u00A5" + (Number(n)||0).toLocaleString();
  const stColor = s => s==="送付済"?"#6BA3FF":s==="発行済"?"#7BE0A0":s==="下書き"?"#E8B84B":"#fff";

  /* ── Reusable edit field ── */
  const EF = ({ value, onChange, style:s, type, placeholder, ...rest }) => (
    <input type={type||"text"} value={value===0&&type==="number"?"":value??""}
      onChange={e => onChange(type==="number" ? (e.target.value===""?0:Number(e.target.value)) : e.target.value)}
      placeholder={placeholder||""}
      style={{ background:"transparent", border:"1px solid #e0e0e8", borderRadius:4, outline:"none",
        color:"#1a1a2e", fontFamily:bd, padding:"4px 6px", fontSize:12, boxSizing:"border-box", ...s }}
      onFocus={e=>{e.target.style.borderColor="#4466EE";e.target.style.background="rgba(68,102,238,.04)";}}
      onBlur={e=>{e.target.style.borderColor="#e0e0e8";e.target.style.background="transparent";}}
      {...rest} />
  );

  /* ── PREVIEW / EDIT MODE ── */
  if (activeDoc) {
    const d = editData;
    const cfg = docFieldConfig[activeDoc] || {};
    const calc = recalc(d.rows || []);
    const hasItemTable = cfg.hasItems && !cfg.hasBody && !cfg.hasClauses && !cfg.hasSlipFields && !cfg.hasTravelRows;

    return (
      <PageShell title="書類発行" watermark={"書類\n発行"}>
        <Rv><div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <Mag onClick={()=>setActiveDoc(null)} s={{ padding:"6px 14px", borderRadius:12, border:`1.5px solid ${C.border}`, background:"transparent", color:C.textSec, fontSize:11, fontWeight:600, cursor:"pointer", fontFamily:bd }}>← 戻る</Mag>
            <span style={{ fontSize:14, color:"#fff", fontWeight:600 }}>{d.title} — プレビュー・編集</span>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <Mag s={{ padding:"8px 20px", borderRadius:14, border:`1.5px solid ${C.border}`, background:"transparent", color:C.textSec, fontSize:11, fontWeight:600, cursor:"pointer", fontFamily:bd }}>PDF出力</Mag>
            <Mag s={{ padding:"8px 20px", borderRadius:14, border:"none", background:"rgba(139,123,244,.15)", color:"#C4B8FF", fontSize:11, fontWeight:700, cursor:"pointer", fontFamily:bd, boxShadow:"0 0 18px rgba(139,123,244,.2)" }}>発行する</Mag>
          </div>
        </div></Rv>

        <div style={{ display:"flex", gap:16, alignItems:"flex-start" }}>
        {/* ── Document preview (left) ── */}
        <div style={{ flex:1, minWidth:0 }}>
        <Rv d={10}><div style={{ background:"#fff", borderRadius:12, padding:"48px 56px", maxWidth:760, boxShadow:"0 8px 40px rgba(0,0,0,.4)", color:"#1a1a2e", fontFamily:bd }}>

          {/* ── Title ── */}
          <div style={{ textAlign:"center", marginBottom:28 }}>
            <div style={{ fontSize:28, fontWeight:700, letterSpacing:".15em", color:"#1a1a2e", marginBottom:6 }}>{d.title}</div>
            <div style={{ fontSize:11, color:"#888", display:"flex", justifyContent:"center", alignItems:"center", gap:4 }}>No. <EF value={d.num} onChange={v=>updateField("num",v)} style={{ width:150, textAlign:"center", fontSize:11, border:"1px solid #ddd" }} /></div>
          </div>

          {/* ── Partner / Date row ── */}
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:24, gap:24 }}>
            <div style={{ flex:1 }}>
              <div style={{ borderBottom:"2px solid #1a1a2e", paddingBottom:6, marginBottom:6 }}>
                <EF value={d.partner} onChange={v=>updateField("partner",v)} placeholder="取引先名を入力" style={{ fontSize:16, fontWeight:700, width:"100%", border:"none", borderBottom:"1px dashed #ccc" }} />
                <span style={{ fontSize:14, marginLeft:4 }}>御中</span>
              </div>
              {cfg.hasPartnerAddr && <>
                <EF value={d.partnerAddr} onChange={v=>updateField("partnerAddr",v)} placeholder="取引先住所" style={{ fontSize:10, width:"100%", marginBottom:3, color:"#666" }} />
                <EF value={d.partnerTel} onChange={v=>updateField("partnerTel",v)} placeholder="取引先 TEL" style={{ fontSize:10, width:"100%", color:"#666" }} />
              </>}
              {cfg.hasDeliveryAddr && <div style={{ marginTop:8 }}>
                <div style={{ fontSize:9, color:"#999", marginBottom:2 }}>納品先住所</div>
                <EF value={d.deliveryAddr} onChange={v=>updateField("deliveryAddr",v)} placeholder="納品先住所を入力" style={{ fontSize:10, width:"100%", color:"#666" }} />
              </div>}
            </div>
            <div style={{ minWidth:180, textAlign:"right" }}>
              <div style={{ fontSize:9, color:"#999", marginBottom:2 }}>発行日</div>
              <EF value={d.issueDate} onChange={v=>updateField("issueDate",v)} style={{ fontSize:12, textAlign:"right", width:140, marginBottom:8 }} />
              {cfg.hasDueDate && <><div style={{ fontSize:9, color:"#999", marginBottom:2 }}>支払期限</div>
                <EF value={d.dueDate} onChange={v=>updateField("dueDate",v)} placeholder="例: 2026/03/31" style={{ fontSize:12, textAlign:"right", width:140, marginBottom:8 }} /></>}
              {cfg.hasValidity && <><div style={{ fontSize:9, color:"#999", marginBottom:2 }}>有効期限</div>
                <EF value={d.validity} onChange={v=>updateField("validity",v)} placeholder="発行日より30日間" style={{ fontSize:12, textAlign:"right", width:140, marginBottom:8 }} /></>}
              {cfg.hasContractPeriod && <><div style={{ fontSize:9, color:"#999", marginBottom:2 }}>契約期間</div>
                <EF value={d.contractStart} onChange={v=>updateField("contractStart",v)} placeholder="開始日" style={{ fontSize:11, textAlign:"right", width:140, marginBottom:2 }} />
                <span style={{ fontSize:10, color:"#999" }}> 〜 </span>
                <EF value={d.contractEnd} onChange={v=>updateField("contractEnd",v)} placeholder="終了日" style={{ fontSize:11, textAlign:"right", width:140 }} /></>}
              {cfg.hasPayMethod && <><div style={{ fontSize:9, color:"#999", marginBottom:2, marginTop:8 }}>支払方法</div>
                <EF value={d.payMethod} onChange={v=>updateField("payMethod",v)} placeholder="現金 / 振込 / カード" style={{ fontSize:11, textAlign:"right", width:140 }} /></>}
              {cfg.hasApprover && <><div style={{ fontSize:9, color:"#999", marginBottom:2, marginTop:8 }}>承認者</div>
                <EF value={d.approver} onChange={v=>updateField("approver",v)} placeholder="承認者名" style={{ fontSize:11, textAlign:"right", width:140 }} /></>}
            </div>
          </div>

          {/* ── Total banner (for item-based docs) ── */}
          {hasItemTable && <div style={{ background:"#f4f4f8", borderRadius:8, padding:"14px 20px", marginBottom:24, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontSize:13, fontWeight:600 }}>合計金額（税込）</span>
            <span style={{ fontSize:24, fontWeight:700 }}>{fmt(calc.total)}</span>
          </div>}

          {/* ── Single amount (for depositConf etc) ── */}
          {cfg.hasAmount && !hasItemTable && <div style={{ background:"#f4f4f8", borderRadius:8, padding:"14px 20px", marginBottom:24 }}>
            <div style={{ fontSize:11, color:"#666", marginBottom:4 }}>金額</div>
            <EF type="number" value={d.singleAmount} onChange={v=>updateField("singleAmount",v)} style={{ fontSize:24, fontWeight:700, width:240, border:"none", borderBottom:"2px solid #1a1a2e" }} />
          </div>}

          {/* ── Items table (invoices, estimates, etc.) ── */}
          {hasItemTable && <>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12, marginBottom:16 }}>
              <thead>
                <tr style={{ borderBottom:"2px solid #1a1a2e" }}>
                  <th style={{ textAlign:"left", padding:"8px 4px", fontWeight:600, width:"40%" }}>品目</th>
                  <th style={{ textAlign:"right", padding:"8px 4px", fontWeight:600, width:"10%" }}>数量</th>
                  <th style={{ textAlign:"center", padding:"8px 4px", fontWeight:600, width:"10%" }}>単位</th>
                  <th style={{ textAlign:"right", padding:"8px 4px", fontWeight:600, width:"18%" }}>単価</th>
                  <th style={{ textAlign:"right", padding:"8px 4px", fontWeight:600, width:"18%" }}>金額</th>
                  <th style={{ width:24 }}></th>
                </tr>
              </thead>
              <tbody>
                {(d.rows||[]).map((row, idx) => {
                  const lineTotal = (Number(row.qty)||0) * (Number(row.price)||0);
                  return (
                    <tr key={idx} style={{ borderBottom:"1px solid #eee" }}>
                      <td style={{ padding:"6px 4px" }}><EF value={row.item} onChange={v=>updateRow(idx,"item",v)} placeholder="品目名を入力" style={{ width:"100%" }} /></td>
                      <td style={{ padding:"6px 4px" }}><EF type="number" value={row.qty} onChange={v=>updateRow(idx,"qty",v)} style={{ width:56, textAlign:"right" }} /></td>
                      <td style={{ padding:"6px 4px" }}><EF value={row.unit} onChange={v=>updateRow(idx,"unit",v)} style={{ width:44, textAlign:"center" }} /></td>
                      <td style={{ padding:"6px 4px" }}><EF type="number" value={row.price} onChange={v=>updateRow(idx,"price",v)} style={{ width:100, textAlign:"right" }} /></td>
                      <td style={{ padding:"6px 4px", textAlign:"right", fontWeight:600, fontFamily:mono, fontSize:12 }}>{fmt(lineTotal)}</td>
                      <td style={{ padding:"6px 2px" }}>{(d.rows||[]).length>1 && <span onClick={()=>removeRow(idx)} style={{ cursor:"pointer", color:"#ccc", fontSize:14, userSelect:"none" }}>×</span>}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20 }}>
              <button onClick={addRow} type="button" style={{ padding:"6px 16px", borderRadius:8, border:"1.5px dashed #ccc", background:"transparent", color:"#888", fontSize:11, cursor:"pointer" }}>+ 行を追加</button>
              <div style={{ textAlign:"right", minWidth:200 }}>
                <div style={{ display:"flex", justifyContent:"space-between", padding:"4px 0", fontSize:12 }}><span>小計</span><span style={{ fontFamily:mono }}>{fmt(calc.subtotal)}</span></div>
                <div style={{ display:"flex", justifyContent:"space-between", padding:"4px 0", fontSize:12 }}><span>消費税（10%）</span><span style={{ fontFamily:mono }}>{fmt(calc.tax)}</span></div>
                <div style={{ display:"flex", justifyContent:"space-between", padding:"6px 0", fontSize:14, fontWeight:700, borderTop:"2px solid #1a1a2e", marginTop:4 }}><span>合計</span><span style={{ fontFamily:mono }}>{fmt(calc.total)}</span></div>
              </div>
            </div>
          </>}

          {/* ── Contract clauses ── */}
          {cfg.hasClauses && (d.clauses||[]).length > 0 && <div style={{ marginBottom:20 }}>
            {(d.clauses||[]).map((cl, idx) => (
              <div key={idx} style={{ marginBottom:16 }}>
                <EF value={cl.title} onChange={v => {
                  const c2 = [...(d.clauses||[])]; c2[idx] = { ...c2[idx], title:v };
                  updateField("clauses", c2);
                }} style={{ fontSize:13, fontWeight:700, width:"100%", marginBottom:4 }} />
                <textarea value={cl.text} onChange={e => {
                  const c2 = [...(d.clauses||[])]; c2[idx] = { ...c2[idx], text:e.target.value };
                  updateField("clauses", c2);
                }} rows={Math.max(3, (cl.text||"").split("\n").length + 1)}
                  style={{ width:"100%", border:"1px solid #e0e0e8", borderRadius:4, padding:"6px 8px", fontSize:11, fontFamily:bd, color:"#1a1a2e", outline:"none", resize:"vertical", boxSizing:"border-box", lineHeight:1.7 }}
                  onFocus={e=>{e.target.style.borderColor="#4466EE";}} onBlur={e=>{e.target.style.borderColor="#e0e0e8";}} />
              </div>
            ))}
            <button onClick={() => updateField("clauses", [...(d.clauses||[]), { title:"第"+(((d.clauses||[]).length)+1)+"条（）", text:"" }])} type="button"
              style={{ padding:"6px 16px", borderRadius:8, border:"1.5px dashed #ccc", background:"transparent", color:"#888", fontSize:11, cursor:"pointer" }}>+ 条項を追加</button>
          </div>}

          {/* ── Slip fields (伝票) ── */}
          {cfg.hasSlipFields && <div style={{ marginBottom:20 }}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12, marginBottom:10 }}>
              <thead>
                <tr style={{ borderBottom:"2px solid #1a1a2e" }}>
                  <th style={{ textAlign:"left", padding:"8px 4px", fontWeight:600 }}>日付</th>
                  {activeDoc==="transferSlip" ? <>
                    <th style={{ textAlign:"left", padding:"8px 4px", fontWeight:600 }}>借方科目</th>
                    <th style={{ textAlign:"left", padding:"8px 4px", fontWeight:600 }}>貸方科目</th>
                  </> : <th style={{ textAlign:"left", padding:"8px 4px", fontWeight:600 }}>勘定科目</th>}
                  <th style={{ textAlign:"left", padding:"8px 4px", fontWeight:600 }}>相手先</th>
                  <th style={{ textAlign:"right", padding:"8px 4px", fontWeight:600 }}>金額</th>
                  <th style={{ textAlign:"left", padding:"8px 4px", fontWeight:600 }}>摘要</th>
                  <th style={{ width:24 }}></th>
                </tr>
              </thead>
              <tbody>
                {(d.slipEntries||[]).map((e, idx) => (
                  <tr key={idx} style={{ borderBottom:"1px solid #eee" }}>
                    <td style={{ padding:"6px 4px" }}><EF value={e.date} onChange={v=>{ const s=[...(d.slipEntries||[])]; s[idx]={...s[idx],date:v}; updateField("slipEntries",s); }} style={{ width:90 }} /></td>
                    {activeDoc==="transferSlip" ? <>
                      <td style={{ padding:"6px 4px" }}><EF value={e.debitAcc} onChange={v=>{ const s=[...(d.slipEntries||[])]; s[idx]={...s[idx],debitAcc:v}; updateField("slipEntries",s); }} placeholder="借方" style={{ width:90 }} /></td>
                      <td style={{ padding:"6px 4px" }}><EF value={e.creditAcc} onChange={v=>{ const s=[...(d.slipEntries||[])]; s[idx]={...s[idx],creditAcc:v}; updateField("slipEntries",s); }} placeholder="貸方" style={{ width:90 }} /></td>
                    </> : <td style={{ padding:"6px 4px" }}><EF value={e.account} onChange={v=>{ const s=[...(d.slipEntries||[])]; s[idx]={...s[idx],account:v}; updateField("slipEntries",s); }} style={{ width:100 }} /></td>}
                    <td style={{ padding:"6px 4px" }}><EF value={e.partner||""} onChange={v=>{ const s=[...(d.slipEntries||[])]; s[idx]={...s[idx],partner:v}; updateField("slipEntries",s); }} style={{ width:100 }} /></td>
                    <td style={{ padding:"6px 4px" }}><EF type="number" value={e.amount} onChange={v=>{ const s=[...(d.slipEntries||[])]; s[idx]={...s[idx],amount:v}; updateField("slipEntries",s); }} style={{ width:90, textAlign:"right" }} /></td>
                    <td style={{ padding:"6px 4px" }}><EF value={e.memo} onChange={v=>{ const s=[...(d.slipEntries||[])]; s[idx]={...s[idx],memo:v}; updateField("slipEntries",s); }} style={{ width:120 }} /></td>
                    <td style={{ padding:"6px 2px" }}>{(d.slipEntries||[]).length>1 && <span onClick={()=>updateField("slipEntries",(d.slipEntries||[]).filter((_,i)=>i!==idx))} style={{ cursor:"pointer", color:"#ccc", fontSize:14 }}>×</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ display:"flex", justifyContent:"space-between" }}>
              <button onClick={()=>updateField("slipEntries",[...(d.slipEntries||[]),{ date:"2026/02/25", account:"", debitAcc:"", creditAcc:"", partner:"", amount:0, memo:"" }])} type="button"
                style={{ padding:"6px 16px", borderRadius:8, border:"1.5px dashed #ccc", background:"transparent", color:"#888", fontSize:11, cursor:"pointer" }}>+ 行を追加</button>
              <div style={{ fontSize:14, fontWeight:700 }}>合計: {fmt((d.slipEntries||[]).reduce((s,e)=>s+(Number(e.amount)||0),0))}</div>
            </div>
          </div>}

          {/* ── Travel expense rows ── */}
          {cfg.hasTravelRows && <div style={{ marginBottom:20 }}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:11, marginBottom:10 }}>
              <thead>
                <tr style={{ borderBottom:"2px solid #1a1a2e" }}>
                  {["日付","出発地","到着地","交通機関","金額","摘要",""].map((h,i) => (
                    <th key={i} style={{ textAlign:i===4?"right":"left", padding:"8px 4px", fontWeight:600, fontSize:11 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(d.travelRows||[]).map((r, idx) => (
                  <tr key={idx} style={{ borderBottom:"1px solid #eee" }}>
                    <td style={{ padding:"5px 4px" }}><EF value={r.date} onChange={v=>{ const t=[...(d.travelRows||[])]; t[idx]={...t[idx],date:v}; updateField("travelRows",t); }} style={{ width:80, fontSize:11 }} /></td>
                    <td style={{ padding:"5px 4px" }}><EF value={r.from} onChange={v=>{ const t=[...(d.travelRows||[])]; t[idx]={...t[idx],from:v}; updateField("travelRows",t); }} style={{ width:60, fontSize:11 }} /></td>
                    <td style={{ padding:"5px 4px" }}><EF value={r.to} onChange={v=>{ const t=[...(d.travelRows||[])]; t[idx]={...t[idx],to:v}; updateField("travelRows",t); }} style={{ width:60, fontSize:11 }} /></td>
                    <td style={{ padding:"5px 4px" }}><EF value={r.transport} onChange={v=>{ const t=[...(d.travelRows||[])]; t[idx]={...t[idx],transport:v}; updateField("travelRows",t); }} style={{ width:60, fontSize:11 }} /></td>
                    <td style={{ padding:"5px 4px" }}><EF type="number" value={r.amount} onChange={v=>{ const t=[...(d.travelRows||[])]; t[idx]={...t[idx],amount:v}; updateField("travelRows",t); }} style={{ width:70, textAlign:"right", fontSize:11 }} /></td>
                    <td style={{ padding:"5px 4px" }}><EF value={r.memo} onChange={v=>{ const t=[...(d.travelRows||[])]; t[idx]={...t[idx],memo:v}; updateField("travelRows",t); }} style={{ width:80, fontSize:11 }} /></td>
                    <td style={{ padding:"5px 2px" }}>{(d.travelRows||[]).length>1 && <span onClick={()=>updateField("travelRows",(d.travelRows||[]).filter((_,i)=>i!==idx))} style={{ cursor:"pointer", color:"#ccc", fontSize:14 }}>×</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ display:"flex", justifyContent:"space-between" }}>
              <button onClick={()=>updateField("travelRows",[...(d.travelRows||[]),{ date:"2026/02/25", from:"", to:"", transport:"", amount:0, memo:"" }])} type="button"
                style={{ padding:"6px 16px", borderRadius:8, border:"1.5px dashed #ccc", background:"transparent", color:"#888", fontSize:11, cursor:"pointer" }}>+ 行を追加</button>
              <div style={{ fontSize:14, fontWeight:700 }}>合計: {fmt((d.travelRows||[]).reduce((s,r)=>s+(Number(r.amount)||0),0))}</div>
            </div>
          </div>}

          {/* ── Body text (letters, depositConf) ── */}
          {cfg.hasBody && <div style={{ marginBottom:20 }}>
            <textarea value={d.body} onChange={e=>updateField("body",e.target.value)} placeholder="本文を入力してください…" rows={Math.max(6, (d.body||"").split("\n").length + 2)}
              style={{ width:"100%", border:"1px solid #e0e0e8", borderRadius:6, padding:"12px 14px", fontSize:12, fontFamily:bd, color:"#1a1a2e", outline:"none", resize:"vertical", boxSizing:"border-box", lineHeight:1.8 }}
              onFocus={e=>{e.target.style.borderColor="#4466EE";}} onBlur={e=>{e.target.style.borderColor="#e0e0e8";}} />
          </div>}

          {/* ── Enclosures (送付状) ── */}
          {cfg.hasEnclosures && <div style={{ marginBottom:20, padding:"12px 16px", background:"#f9f9fc", borderRadius:8 }}>
            <div style={{ fontSize:11, fontWeight:700, color:"#666", marginBottom:8 }}>同封書類</div>
            {(d.enclosures||[]).map((enc, idx) => (
              <div key={idx} style={{ display:"flex", alignItems:"center", gap:6, marginBottom:4 }}>
                <span style={{ fontSize:12 }}>・</span>
                <EF value={enc} onChange={v=>{ const e2=[...(d.enclosures||[])]; e2[idx]=v; updateField("enclosures",e2); }} style={{ flex:1, fontSize:11 }} />
                <span onClick={()=>updateField("enclosures",(d.enclosures||[]).filter((_,i)=>i!==idx))} style={{ cursor:"pointer", color:"#ccc", fontSize:13 }}>×</span>
              </div>
            ))}
            <button onClick={()=>updateField("enclosures",[...(d.enclosures||[]),""])} type="button"
              style={{ padding:"4px 12px", borderRadius:6, border:"1px dashed #ccc", background:"transparent", color:"#888", fontSize:10, cursor:"pointer", marginTop:4 }}>+ 書類を追加</button>
          </div>}

          {/* ── Note ── */}
          {cfg.hasNote && <div style={{ marginBottom:20 }}>
            <div style={{ fontSize:11, color:"#999", marginBottom:4 }}>備考</div>
            <textarea value={d.note} onChange={e=>updateField("note",e.target.value)} placeholder="備考・特記事項" rows={3}
              style={{ width:"100%", border:"1px solid #e0e0e8", borderRadius:6, padding:"8px 12px", fontSize:11, fontFamily:bd, color:"#1a1a2e", outline:"none", resize:"vertical", boxSizing:"border-box", lineHeight:1.7 }}
              onFocus={e=>{e.target.style.borderColor="#4466EE";}} onBlur={e=>{e.target.style.borderColor="#e0e0e8";}} />
          </div>}

          {/* ── Bank info ── */}
          {cfg.hasBank && <div style={{ background:"#f9f9fc", borderRadius:8, padding:"12px 16px", marginBottom:20 }}>
            <div style={{ fontSize:10, fontWeight:700, color:"#666", marginBottom:8 }}>振込先</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
              <div><div style={{ fontSize:9, color:"#999" }}>銀行・支店</div><EF value={d.bankName} onChange={v=>updateField("bankName",v)} style={{ width:"100%", fontSize:11 }} /></div>
              <div><div style={{ fontSize:9, color:"#999" }}>口座番号</div><EF value={d.bankAccount} onChange={v=>updateField("bankAccount",v)} style={{ width:"100%", fontSize:11 }} /></div>
              <div style={{ gridColumn:"span 2" }}><div style={{ fontSize:9, color:"#999" }}>口座名義</div><EF value={d.bankHolder} onChange={v=>updateField("bankHolder",v)} style={{ width:"100%", fontSize:11 }} /></div>
            </div>
          </div>}

          {/* ── Issuer / Signatures ── */}
          <div style={{ marginTop:24, paddingTop:16, borderTop:"1px solid #eee" }}>
            {cfg.hasClauses ? (
              /* Contract: dual signature */
              <div style={{ display:"flex", justifyContent:"space-between", gap:40 }}>
                <div style={{ flex:1, textAlign:"center" }}>
                  <div style={{ fontSize:11, color:"#999", marginBottom:8 }}>甲（委託者/発注者）</div>
                  <EF value={d.partner||""} onChange={v=>updateField("partner",v)} placeholder="甲の名称" style={{ fontSize:13, fontWeight:700, textAlign:"center", width:"100%", marginBottom:4 }} />
                  {cfg.hasStamp && <div style={{ width:56, height:56, borderRadius:"50%", border:"2px solid #cc3333", color:"#cc3333", fontSize:10, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", margin:"8px auto", opacity:.5 }}>印</div>}
                </div>
                <div style={{ flex:1, textAlign:"center" }}>
                  <div style={{ fontSize:11, color:"#999", marginBottom:8 }}>乙（受託者/受注者）</div>
                  <EF value={d.issuerName} onChange={v=>updateField("issuerName",v)} style={{ fontSize:13, fontWeight:700, textAlign:"center", width:"100%", marginBottom:4 }} />
                  {cfg.hasStamp && <div style={{ width:56, height:56, borderRadius:"50%", border:"2px solid #cc3333", color:"#cc3333", fontSize:10, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", margin:"8px auto", opacity:.5 }}>印</div>}
                </div>
              </div>
            ) : (
              /* Normal: single issuer */
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                <div style={{ flex:1 }} />
                <div style={{ textAlign:"right" }}>
                  <EF value={d.issuerName} onChange={v=>updateField("issuerName",v)} style={{ fontSize:13, fontWeight:700, textAlign:"right", width:220 }} />
                  <EF value={d.issuerAddr} onChange={v=>updateField("issuerAddr",v)} style={{ fontSize:10, color:"#888", textAlign:"right", width:220, marginTop:2 }} />
                  <div style={{ display:"flex", gap:4, justifyContent:"flex-end", marginTop:2 }}>
                    <span style={{ fontSize:10, color:"#888" }}>TEL:</span><EF value={d.issuerTel} onChange={v=>updateField("issuerTel",v)} style={{ fontSize:10, color:"#888", width:120, textAlign:"right" }} />
                  </div>
                  <div style={{ display:"flex", gap:4, justifyContent:"flex-end" }}>
                    <span style={{ fontSize:10, color:"#888" }}>Email:</span><EF value={d.issuerEmail} onChange={v=>updateField("issuerEmail",v)} style={{ fontSize:10, color:"#888", width:160, textAlign:"right" }} />
                  </div>
                  <div style={{ fontSize:10, color:"#888", marginTop:2 }}>登録番号: <EF value={d.invoiceNum} onChange={v=>updateField("invoiceNum",v)} style={{ fontSize:10, color:"#888", width:150 }} /></div>
                  {cfg.hasStamp && <div style={{ width:56, height:56, borderRadius:"50%", border:"2px solid #cc3333", color:"#cc3333", fontSize:10, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", marginLeft:"auto", marginTop:8, opacity:.5 }}>印</div>}
                </div>
              </div>
            )}
          </div>
        </div></Rv>
        </div>

        {/* ── AI Assistant Panel (right) ── */}
        <div style={{ width: aiOpen ? 300 : 44, flexShrink:0, transition:"width .3s cubic-bezier(.16,1,.3,1)" }}>
          {!aiOpen ? (
            <Mag onClick={()=>setAiOpen(true)} s={{ width:44, height:44, borderRadius:14, background:"rgba(139,123,244,.08)", border:"1.5px solid rgba(139,123,244,.15)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", position:"sticky", top:100, boxShadow:"0 0 20px rgba(139,123,244,.15)" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A89BFF" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
            </Mag>
          ) : (
            <div style={{ position:"sticky", top:80, background:"rgba(12,12,20,.6)", border:"1.5px solid rgba(139,123,244,.12)", borderRadius:16, overflow:"hidden", backdropFilter:"blur(20px)" }}>
              {/* Header */}
              <div style={{ padding:"14px 16px", borderBottom:"1px solid rgba(139,123,244,.08)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <div style={{ width:24, height:24, borderRadius:8, background:"rgba(139,123,244,.12)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#A89BFF" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2"/></svg>
                  </div>
                  <span style={{ fontSize:12, fontWeight:700, color:"#C4B8FF" }}>AIアシスタント</span>
                </div>
                <Mag onClick={()=>setAiOpen(false)} s={{ border:"none", background:"transparent", color:C.textMut, fontSize:14, cursor:"pointer", padding:4 }}>×</Mag>
              </div>

              {/* Recommendations */}
              <div style={{ padding:"12px 14px", maxHeight:360, overflowY:"auto" }}>
                <div style={{ fontSize:9, color:C.textMut, fontWeight:600, letterSpacing:".1em", marginBottom:8 }}>おすすめの改善</div>
                {(aiRecommendations[activeDoc] || []).map((rec, i) => (
                  <Mag key={i} onClick={() => setAiChat(prev => [...prev, { role:"user", text:rec.l }, { role:"ai", text:`「${rec.l}」を反映します。\n\n${rec.d}\n\n※ 左の書類に直接内容を追記・編集してください。` }])}
                    s={{ display:"block", width:"100%", textAlign:"left", padding:"10px 12px", marginBottom:6, borderRadius:10, border:"1px solid rgba(139,123,244,.08)", background:"rgba(139,123,244,.03)", cursor:"pointer", fontFamily:bd, transition:"all .15s" }}>
                    <div style={{ fontSize:11, color:"#E0DAFF", fontWeight:600, marginBottom:2 }}>{rec.l}</div>
                    <div style={{ fontSize:9, color:C.textMut, lineHeight:1.3 }}>{rec.d}</div>
                  </Mag>
                ))}
                {(aiRecommendations[activeDoc] || []).length === 0 && (
                  <div style={{ fontSize:10, color:C.textMut, padding:8 }}>この書類タイプのレコメンドはありません</div>
                )}
              </div>

              {/* Chat history */}
              {aiChat.length > 0 && <div style={{ borderTop:"1px solid rgba(139,123,244,.08)", padding:"10px 14px", maxHeight:200, overflowY:"auto" }}>
                {aiChat.map((msg, i) => (
                  <div key={i} style={{ marginBottom:8, display:"flex", flexDirection:"column", alignItems:msg.role==="user"?"flex-end":"flex-start" }}>
                    <div style={{ maxWidth:"90%", padding:"8px 12px", borderRadius:msg.role==="user"?"12px 12px 2px 12px":"12px 12px 12px 2px", background:msg.role==="user"?"rgba(139,123,244,.12)":"rgba(255,255,255,.04)", border:`1px solid ${msg.role==="user"?"rgba(139,123,244,.2)":"rgba(255,255,255,.06)"}` }}>
                      <div style={{ fontSize:10, color:msg.role==="user"?"#C4B8FF":"#E0DAFF", lineHeight:1.5, whiteSpace:"pre-wrap" }}>{msg.text}</div>
                    </div>
                  </div>
                ))}
              </div>}

              {/* Input */}
              <div style={{ padding:"10px 14px", borderTop:"1px solid rgba(139,123,244,.08)" }}>
                <div style={{ display:"flex", gap:6 }}>
                  <input value={aiInput} onChange={e=>setAiInput(e.target.value)}
                    placeholder="質問や依頼を入力…"
                    onKeyDown={e=>{
                      if(e.key==="Enter"&&aiInput.trim()){
                        const q=aiInput.trim(); setAiInput("");
                        setAiChat(prev=>[...prev,{role:"user",text:q},{role:"ai",text:`「${q}」について確認しました。\n\n書類の内容を左のプレビューで直接編集できます。条項の追加・変更が必要な場合は、おすすめの改善から選択するか、具体的にご指示ください。`}]);
                      }
                    }}
                    style={{ flex:1, padding:"8px 12px", borderRadius:10, border:"1px solid rgba(139,123,244,.12)", background:"rgba(139,123,244,.03)", color:"#E0DAFF", fontSize:11, fontFamily:bd, outline:"none", boxSizing:"border-box" }} />
                  <Mag onClick={()=>{
                    if(!aiInput.trim())return; const q=aiInput.trim(); setAiInput("");
                    setAiChat(prev=>[...prev,{role:"user",text:q},{role:"ai",text:`「${q}」について確認しました。\n\n書類の内容を左のプレビューで直接編集できます。`}]);
                  }} s={{ width:34, height:34, borderRadius:10, border:"none", background:"rgba(139,123,244,.12)", color:"#A89BFF", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", flexShrink:0 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4z"/></svg>
                  </Mag>
                </div>
              </div>
            </div>
          )}
        </div>
        </div>
      </PageShell>
    );
  }

  /* ── TEMPLATE LIST / ISSUED LIST ── */
  const catItems = activeCat === "all" ? allItems : templates.find(c=>c.cat===activeCat)?.items || [];

  return (
    <PageShell title="書類発行" watermark={"書類\n発行"}>
      <Rv><div style={{ display:"flex", gap:3, marginBottom:16, background:"rgba(139,123,244,.04)", borderRadius:14, padding:3, border:"1px solid rgba(139,123,244,.06)", width:"fit-content" }}>
        {[{ id:"templates", l:"テンプレート（22種）" },{ id:"issued", l:"発行済み（"+issued.length+"件）" }].map(t => (
          <Mag key={t.id} onClick={()=>setTab(t.id)} s={{ padding:"8px 20px", borderRadius:12, border:"none", cursor:"pointer", fontFamily:bd, fontSize:12, fontWeight:tab===t.id?700:500, background:tab===t.id?"rgba(139,123,244,.15)":"transparent", color:tab===t.id?"#C4B8FF":"rgba(168,155,255,.35)", boxShadow:tab===t.id?"0 0 14px rgba(139,123,244,.2)":"none", transition:"all .25s" }}>{t.l}</Mag>
        ))}
      </div></Rv>

      {tab === "templates" ? (<>
        <Rv d={10}><div style={{ display:"flex", gap:4, marginBottom:16, flexWrap:"wrap" }}>
          {["all",...templates.map(c=>c.cat)].map(c => (
            <Mag key={c} onClick={()=>setActiveCat(c)} s={{ padding:"6px 16px", borderRadius:20, border:activeCat===c?"1px solid rgba(139,123,244,.3)":"1px solid rgba(255,255,255,.05)", background:activeCat===c?"rgba(139,123,244,.1)":"transparent", color:activeCat===c?"#C4B8FF":"rgba(168,155,255,.35)", fontSize:11, fontWeight:activeCat===c?700:500, cursor:"pointer", fontFamily:bd }}>
              {c==="all"?"すべて (22)":c}
            </Mag>
          ))}
        </div></Rv>

        {(activeCat === "all" ? templates : templates.filter(c=>c.cat===activeCat)).map((cat, ci) => (
          <Rv key={ci} d={15+ci*10}>
            {activeCat === "all" && <div style={{ fontSize:13, color:C.textSec, fontWeight:600, marginBottom:10, marginTop:ci?18:0, display:"flex", alignItems:"center", gap:8 }}>
              <span>{cat.cat}</span>
              <div style={{ flex:1, height:1, background:C.borderLt }} />
              <span style={{ fontSize:10, color:C.textMut }}>{cat.items.length}種</span>
            </div>}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(180px, 1fr))", gap:10, marginBottom:8 }}>
              {cat.items.map(item => (
                <Mag key={item.id} onClick={()=>openPreview(item.id)} s={{ cursor:"pointer", display:"block" }}>
                  <Card3 s={{ padding:"20px 16px", transition:"border-color .2s" }}>
                    <div style={{ width:40, height:40, borderRadius:12, background:"rgba(139,123,244,.08)", border:"1px solid rgba(139,123,244,.12)", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:12, color:"#A89BFF" }}>
                      {(icons[item.id] || icons.invoice)("#A89BFF")}
                    </div>
                    <div style={{ fontSize:13, color:"#fff", fontWeight:600, marginBottom:4 }}>{item.name}</div>
                    <div style={{ fontSize:10, color:C.textMut, lineHeight:1.4 }}>{item.desc}</div>
                  </Card3>
                </Mag>
              ))}
            </div>
          </Rv>
        ))}
      </>) : (
        <Rv d={10}><Card3 s={{ padding:0, overflow:"hidden" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12, fontFamily:bd }}>
            <thead>
              <tr style={{ borderBottom:`1px solid ${C.border}` }}>
                {["No.","種別","取引先","金額","発行日","ステータス",""].map((h,i) => (
                  <th key={i} style={{ padding:"12px 10px", textAlign:i===3?"right":"left", fontSize:9, fontWeight:600, color:C.textMut, letterSpacing:".1em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {issued.map((doc,i) => (
                <tr key={i} style={{ borderBottom:`1px solid ${C.borderLt}`, cursor:"pointer" }}
                  onMouseEnter={e=>e.currentTarget.style.background=`${C.blue}04`} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <td style={{ padding:"12px 10px", color:C.textMut, fontFamily:mono, fontSize:11 }}>{doc.id}</td>
                  <td style={{ padding:"12px 10px" }}><span style={{ fontSize:10, padding:"3px 10px", borderRadius:8, background:"rgba(139,123,244,.06)", color:C.textSec }}>{doc.type}</span></td>
                  <td style={{ padding:"12px 10px", color:"#fff", fontWeight:500 }}>{doc.partner}</td>
                  <td style={{ padding:"12px 10px", textAlign:"right", color:"#C4B8FF", fontFamily:mono, fontWeight:600 }}>{fmt(doc.amount)}</td>
                  <td style={{ padding:"12px 10px", color:C.textMut, fontFamily:mono }}>{doc.date}</td>
                  <td style={{ padding:"12px 10px" }}><span style={{ fontSize:9, fontWeight:700, color:stColor(doc.status), padding:"3px 10px", borderRadius:20, background:`${stColor(doc.status)}10`, border:`1px solid ${stColor(doc.status)}20` }}>{doc.status}</span></td>
                  <td style={{ padding:"12px 10px" }}>
                    <div style={{ display:"flex", gap:6 }}>
                      <Mag s={{ padding:"4px 10px", borderRadius:8, border:`1px solid ${C.border}`, background:"transparent", color:C.textMut, fontSize:9, cursor:"pointer", fontFamily:bd }}>編集</Mag>
                      <Mag s={{ padding:"4px 10px", borderRadius:8, border:`1px solid ${C.border}`, background:"transparent", color:C.textMut, fontSize:9, cursor:"pointer", fontFamily:bd }}>PDF</Mag>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {issued.length === 0 && <div style={{ padding:40, textAlign:"center", color:C.textMut, fontSize:12 }}>発行済み書類はありません</div>}
        </Card3></Rv>
      )}
    </PageShell>
  );
}

/* ════════════════════════════════ 入力 (INPUT) — B案 丸ボタン ════════════════════════════════ */
function InputPage() {
  const [active, setActive] = useState(null);
  const [hovered, setHovered] = useState(null);
  const [pressing, setPressing] = useState(null);
  const [uploadDragOver, setUploadDragOver] = useState(false);
  const [csvDragOver, setCsvDragOver] = useState(false);
  const [cameraFlash, setCameraFlash] = useState(false);

  const tabs = [
    { id:"camera", label:"カメラ", icon: InputIconCamera },
    { id:"upload", label:"ファイル", icon: InputIconFolder },
    { id:"csv", label:"CSV", icon: InputIconTable },
  ];

  const handleSelect = (id) => {
    if (active === id) { setActive(null); return; }
    setActive(id);
    if (id === "camera") { setCameraFlash(true); setTimeout(() => setCameraFlash(false), 300); }
  };

  return (
    <PageShell title="アップロード" watermark={"Up\nload"}>
      {/* Tab circles */}
      <Rv><div style={{ display:"flex", justifyContent:"center", gap:36, marginBottom:20 }}>
        {tabs.map(t => {
          const isActive = active === t.id;
          const isHover = hovered === t.id;
          const isPress = pressing === t.id;
          const Icon = t.icon;
          return (
            <div key={t.id}
              onClick={() => handleSelect(t.id)}
              onMouseEnter={() => setHovered(t.id)}
              onMouseLeave={() => { setHovered(null); setPressing(null); }}
              onMouseDown={() => setPressing(t.id)}
              onMouseUp={() => setPressing(null)}
              style={{ textAlign:"center", cursor:"pointer" }}>
              <div style={{
                width:88, height:88, borderRadius:"50%", margin:"0 auto 12px",
                display:"flex", alignItems:"center", justifyContent:"center",
                background: isActive ? "radial-gradient(circle at 40% 35%, rgba(168,155,255,.18) 0%, rgba(139,123,244,.08) 100%)" : isHover ? "radial-gradient(circle at 50% 50%, rgba(255,255,255,.06) 0%, rgba(255,255,255,.02) 100%)" : "rgba(255,255,255,.03)",
                border: isActive ? "2px solid rgba(139,123,244,.45)" : isHover ? "2px solid rgba(255,255,255,.1)" : "2px solid rgba(255,255,255,.05)",
                color: isActive ? "#A89BFF" : isHover ? "#D0D0E0" : "#B0B0C8",
                boxShadow: isActive ? "0 0 36px rgba(139,123,244,.25), 0 0 72px rgba(139,123,244,.08), inset 0 0 24px rgba(139,123,244,.06)" : isHover ? "0 0 20px rgba(255,255,255,.06)" : "none",
                transition: isPress ? "transform .08s" : "all .4s cubic-bezier(.16,1,.3,1)",
                transform: isPress ? "scale(.9)" : isActive ? "scale(1.08)" : isHover ? "scale(1.04)" : "scale(1)",
              }}><Icon size={38} /></div>
              <div style={{ fontSize:13, fontWeight: isActive ? 700 : 500, color: isActive ? "#fff" : isHover ? "#E0E0F0" : "#B0B0C8", transition:"all .3s", textShadow: isActive ? "0 0 16px rgba(255,255,255,.2)" : "none" }}>{t.label}</div>
              <div style={{ width:5, height:5, borderRadius:"50%", margin:"8px auto 0", background: isActive ? "#A89BFF" : "transparent", boxShadow: isActive ? "0 0 10px rgba(168,155,255,.5)" : "none", transition:"all .3s" }} />
            </div>
          );
        })}
      </div></Rv>

      {/* Expanded content */}
      <div style={{ overflow:"hidden", maxHeight:active?500:0, opacity:active?1:0, transition:"all .45s cubic-bezier(.16,1,.3,1)" }}>

        {/* Camera */}
        {active === "camera" && (
          <Rv d={10}><Card3 s={{ padding:0, overflow:"hidden", marginBottom:20 }}>
            {cameraFlash && <div style={{ position:"absolute", inset:0, background:"rgba(255,255,255,.08)", zIndex:10, animation:"inputFlash .3s ease-out forwards", pointerEvents:"none" }} />}
            <div style={{ padding:"32px 32px 28px", textAlign:"center" }}>
              <div style={{ width:56, height:56, borderRadius:16, margin:"0 auto 16px", display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(139,123,244,.08)", border:"1px solid rgba(139,123,244,.15)", color:"#A89BFF" }}>
                <InputIconScan size={28} />
              </div>
              <div style={{ fontSize:18, color:"#fff", fontWeight:600, fontFamily:hd, marginBottom:6 }}>領収書をスキャン</div>
              <div style={{ fontSize:12, color:C.textMut, marginBottom:24, lineHeight:1.6 }}>カメラで撮影 → AIが自動で文字認識 → 仕訳候補を生成</div>
              <div style={{ position:"relative", borderRadius:18, overflow:"hidden", background:"linear-gradient(135deg, rgba(14,14,24,.9), rgba(20,18,40,.8))", border:"1px solid rgba(139,123,244,.1)", padding:"40px 24px", marginBottom:20 }}>
                <svg style={{ position:"absolute", top:12, left:12 }} width="24" height="24"><path d="M0 8V2a2 2 0 012-2h6" fill="none" stroke="rgba(168,155,255,.4)" strokeWidth="2"/></svg>
                <svg style={{ position:"absolute", top:12, right:12 }} width="24" height="24"><path d="M24 8V2a2 2 0 00-2-2h-6" fill="none" stroke="rgba(168,155,255,.4)" strokeWidth="2"/></svg>
                <svg style={{ position:"absolute", bottom:12, left:12 }} width="24" height="24"><path d="M0 16v6a2 2 0 002 2h6" fill="none" stroke="rgba(168,155,255,.4)" strokeWidth="2"/></svg>
                <svg style={{ position:"absolute", bottom:12, right:12 }} width="24" height="24"><path d="M24 16v6a2 2 0 01-2 2h-6" fill="none" stroke="rgba(168,155,255,.4)" strokeWidth="2"/></svg>
                <div style={{ position:"absolute", left:16, right:16, height:2, top:"50%", background:"linear-gradient(90deg, transparent, rgba(168,155,255,.5), transparent)", boxShadow:"0 0 12px rgba(168,155,255,.3)", animation:"inputScanLine 2.5s ease-in-out infinite" }} />
                <div style={{ color:C.textMut, fontSize:12 }}>レシートをこのエリアに合わせてください</div>
              </div>
              <BtnApprove s={{ padding:"14px 40px", borderRadius:16, border:"none", background:"rgba(139,123,244,.12)", color:"#C4B8FF", border:"1px solid rgba(139,123,244,.3)", fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:bd, boxShadow:"0 0 14px rgba(139,123,244,.3), 0 0 36px rgba(139,123,244,.1)" }}>撮影する</BtnApprove>
              <div style={{ display:"flex", justifyContent:"center", gap:16, marginTop:16 }}>
                {["レシート","請求書","領収書","名刺"].map((t,i) => (
                  <span key={i} style={{ fontSize:10, color:C.textMut, padding:"4px 10px", borderRadius:100, background:"rgba(139,123,244,.04)", border:"1px solid rgba(139,123,244,.06)" }}>{t}</span>
                ))}
              </div>
            </div>
          </Card3></Rv>
        )}

        {/* File Upload */}
        {active === "upload" && (
          <Rv d={10}><Card3 s={{ padding:"32px 32px 28px", marginBottom:20 }}>
            <div style={{ textAlign:"center" }}>
              <div style={{ width:56, height:56, borderRadius:16, margin:"0 auto 16px", display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(139,123,244,.08)", border:"1px solid rgba(139,123,244,.15)", color:"#A89BFF" }}>
                <InputIconUpArrow size={28} />
              </div>
              <div style={{ fontSize:18, color:"#fff", fontWeight:600, fontFamily:hd, marginBottom:6 }}>ファイルをアップロード</div>
              <div style={{ fontSize:12, color:C.textMut, marginBottom:24 }}>PDF・PNG・JPG — 複数同時もOK</div>
              <div onDragOver={(e) => { e.preventDefault(); setUploadDragOver(true); }} onDragLeave={() => setUploadDragOver(false)} onDrop={(e) => { e.preventDefault(); setUploadDragOver(false); }}
                style={{ border: uploadDragOver ? "2px solid rgba(139,123,244,.5)" : "2px dashed rgba(139,123,244,.15)", borderRadius:18, padding:"40px 24px", marginBottom:20, background: uploadDragOver ? "rgba(139,123,244,.06)" : "transparent", boxShadow: uploadDragOver ? "inset 0 0 32px rgba(139,123,244,.06)" : "none", transition:"all .25s cubic-bezier(.16,1,.3,1)", transform: uploadDragOver ? "scale(1.02)" : "scale(1)", cursor:"pointer" }}>
                <InputIconFolder size={32} color={uploadDragOver ? "#A89BFF" : "#6A6A84"} />
                <div style={{ fontSize:12, color: uploadDragOver ? C.textSec : C.textMut, marginTop:12, transition:"color .2s" }}>ここにファイルをドラッグ&ドロップ</div>
                <div style={{ fontSize:10, color:C.textMut, marginTop:6 }}>または</div>
                <Mag s={{ marginTop:12, padding:"10px 28px", borderRadius:14, border:`1.5px solid ${C.border}`, background:"transparent", color:C.textSec, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:bd }}>ファイルを選択</Mag>
                <div style={{ marginTop:14, padding:"8px 14px", borderRadius:10, background:"rgba(139,123,244,.04)", border:"1px solid rgba(139,123,244,.08)", display:"flex", alignItems:"center", gap:8 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#A89BFF" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  <div>
                    <div style={{ fontSize:9, color:"#A89BFF", fontWeight:700 }}>電帳法対応 — 自動処理</div>
                    <div style={{ fontSize:8, color:C.textMut }}>タイムスタンプ自動付与 / ファイル名を「日付_取引先_金額_書類名」に自動整形 / 訂正削除履歴を保持</div>
                  </div>
                </div>
              </div>
              <div style={{ textAlign:"left" }}>
                <div style={{ fontSize:10, color:C.textMut, fontWeight:500, letterSpacing:".1em", textTransform:"uppercase", marginBottom:8, fontFamily:mono }}>最近のアップロード</div>
                {[{ name:"20260218_AWS_248000_請求書.pdf", date:"2/18", ok:true, ts:true },{ name:"invoice_yamada.png", date:"2/17", ok:true, ts:true, nameWarn:true }].map((f,i) => (
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 12px", borderRadius:12, background:"rgba(255,255,255,.02)", marginBottom:4 }}>
                    <InputIconFileText size={16} color={C.textMut} />
                    <span style={{ fontSize:11, color:C.text, flex:1 }}>{f.name}</span>
                    {f.ts && <span style={{ fontSize:7, color:"#A89BFF", padding:"1px 5px", borderRadius:6, background:"rgba(139,123,244,.06)", border:"1px solid rgba(139,123,244,.1)", fontWeight:700 }}>TS</span>}
                    {f.nameWarn && <span title="ファイル名要整形" style={{ fontSize:7, color:"#E8B84B", padding:"1px 5px", borderRadius:6, background:"rgba(232,184,75,.06)", border:"1px solid rgba(232,184,75,.1)", fontWeight:700 }}>名前</span>}
                    <span style={{ fontSize:9, color:C.textMut, fontFamily:mono }}>{f.date}</span>
                    <InputIconCheck size={14} color="#7BE0A0" />
                  </div>
                ))}
              </div>
            </div>
          </Card3></Rv>
        )}

        {/* CSV Import */}
        {active === "csv" && (
          <Rv d={10}><Card3 s={{ padding:"32px 32px 28px", marginBottom:20 }}>
            <div style={{ textAlign:"center" }}>
              <div style={{ width:56, height:56, borderRadius:16, margin:"0 auto 16px", display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(139,123,244,.08)", border:"1px solid rgba(139,123,244,.15)", color:"#A89BFF" }}>
                <InputIconBolt size={28} />
              </div>
              <div style={{ fontSize:18, color:"#fff", fontWeight:600, fontFamily:hd, marginBottom:6 }}>CSVインポート</div>
              <div style={{ fontSize:12, color:C.textMut, marginBottom:24 }}>会計ソフトから一括取込 — 弥生・freee・MF対応</div>
              <div onDragOver={(e) => { e.preventDefault(); setCsvDragOver(true); }} onDragLeave={() => setCsvDragOver(false)} onDrop={(e) => { e.preventDefault(); setCsvDragOver(false); }}
                style={{ border: csvDragOver ? "2px solid rgba(139,123,244,.5)" : "2px dashed rgba(139,123,244,.15)", borderRadius:18, padding:"36px 24px", marginBottom:20, background: csvDragOver ? "rgba(139,123,244,.06)" : "transparent", boxShadow: csvDragOver ? "inset 0 0 32px rgba(139,123,244,.06)" : "none", transition:"all .25s cubic-bezier(.16,1,.3,1)", transform: csvDragOver ? "scale(1.02)" : "scale(1)", cursor:"pointer" }}>
                <InputIconTable size={32} color={csvDragOver ? "#A89BFF" : "#6A6A84"} />
                <div style={{ fontSize:12, color: csvDragOver ? C.textSec : C.textMut, marginTop:12, transition:"color .2s" }}>CSVファイルをドラッグ&ドロップ</div>
                <div style={{ fontSize:10, color:C.textMut, marginTop:6 }}>または</div>
                <Mag s={{ marginTop:12, padding:"10px 28px", borderRadius:14, border:`1.5px solid ${C.border}`, background:"transparent", color:C.textSec, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:bd }}>ファイルを選択</Mag>
              </div>
              <div style={{ display:"flex", justifyContent:"center", gap:10, marginBottom:16 }}>
                {["弥生会計","freee","MFクラウド","カスタム"].map((t,i) => (
                  <span key={i} style={{ fontSize:11, color:i===0?"#A89BFF":C.textMut, fontWeight:i===0?600:400, padding:"6px 14px", borderRadius:100, background:i===0?"rgba(139,123,244,.08)":"rgba(255,255,255,.02)", border:i===0?"1px solid rgba(139,123,244,.2)":"1px solid rgba(255,255,255,.04)", cursor:"pointer" }}>{t}</span>
                ))}
              </div>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, fontSize:10, color:C.textMut }}>
                <InputIconCheck size={14} color="#7BE0A0" />
                <span>前回インポート: 2/15 — 142件取込済</span>
              </div>
            </div>
          </Card3></Rv>
        )}
      </div>

      <style>{`
        @keyframes inputScanLine { 0%,100%{top:20%;opacity:0} 10%{opacity:1} 50%{top:75%;opacity:1} 60%{opacity:0} }
        @keyframes inputFlash { 0%{opacity:1} 100%{opacity:0} }
      `}</style>
    </PageShell>
  );
}

/* ════════════════════════════════ SETTINGS PAGE ════════════════════════════════ */
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
