import React, { useState, useEffect, useRef } from "react";
import { C, hd, bd, mono } from "../lib/theme";

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
    style={{ background:"transparent", border:"none", ...s, transform: `translate(${o.x}px,${o.y}px) scale(${charging ? .97 : released ? 1.02 : 1})`,
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
      background: phase===2 ? "#7BE0A0" : (s.background || "rgba(139,123,244,.15)"),
      border: phase===2 ? "none" : (s.border || "1px solid rgba(139,123,244,.25)"),
      color: phase===2 ? "#0A0A0A" : (s.color || "#fff"),
      boxShadow: phase===2 ? "0 0 32px rgba(123,224,160,.4), 0 0 64px rgba(123,224,160,.15)" : (s.boxShadow || "0 2px 8px rgba(0,0,0,.2), 0 0 20px rgba(139,123,244,.15)"),
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



export { WireCanvas, Rv, Mag, BtnApprove, Card3, Cnt, KL, PageShell, PressableCard };
