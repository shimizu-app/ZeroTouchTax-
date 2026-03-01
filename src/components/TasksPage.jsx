import React, { useState } from "react";
import { C, hd, bd, mono } from "../lib/theme";
import { Rv, Mag, Card3, PageShell } from "./ui";

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

export default TasksPage;
