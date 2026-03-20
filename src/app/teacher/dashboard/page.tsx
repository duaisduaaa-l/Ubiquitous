'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface DashboardStats {
  totalStudents: number;
  presentToday: number;
  absentToday: number;
  chartData: { date: string; present: number; absent: number }[];
  leaderboard: { id: string; name: string; roll: string; percentage: number; total: number }[];
  riskyStudents: { id: string; name: string; roll: string; percentage: number; total: number; present: number }[];
}

// ─── Static Data ──────────────────────────────────────────────────────────────
const ANNOUNCEMENTS = [
  { id: 1, icon: '📋', title: 'Assignment 3 Submission', detail: 'Last date: 25 March 2026', color: '#f97316', bg: 'rgba(249,115,22,0.08)' },
  { id: 2, icon: '📝', title: 'End Semester Examinations', detail: 'Scheduled: May 2026', color: '#8b5cf6', bg: 'rgba(139,92,246,0.08)' },
  { id: 3, icon: '💡', title: 'Hackathon 2026', detail: 'Registration open · April 10–12', color: '#10b981', bg: 'rgba(16,185,129,0.08)' },
  { id: 4, icon: '🎉', title: 'College Foundation Day', detail: 'Holiday: April 3, 2026', color: '#ec4899', bg: 'rgba(236,72,153,0.08)' },
  { id: 5, icon: '📢', title: 'Lab Practical Schedule', detail: 'Released on notice board', color: '#3b82f6', bg: 'rgba(59,130,246,0.08)' },
];

const THOUGHTS = [
  { quote: 'The best teachers show you where to look, but don\'t tell you what to see.', author: 'Alexandra K. Trenfor' },
  { quote: 'Education is not the filling of a pail, but the lighting of a fire.', author: 'W.B. Yeats' },
  { quote: 'Teaching is the one profession that creates all other professions.', author: 'Unknown' },
  { quote: 'In learning you will teach, and in teaching you will learn.', author: 'Phil Collins' },
  { quote: 'The art of teaching is the art of assisting discovery.', author: 'Mark Van Doren' },
];

const MEETINGS = [
  { day: 'Mon', time: '10:00', title: 'Staff General Meeting', sub: 'Seminar Hall B · All faculty', chip: 'Mandatory', chipColor: '#70a1ff', chipBg: 'rgba(112,161,255,0.12)' },
  { day: 'Wed', time: '14:00', title: 'Curriculum Review', sub: 'Room 204 · CS Dept', chip: 'Dept-only', chipColor: '#2ed573', chipBg: 'rgba(46,213,115,0.12)' },
  { day: 'Fri', time: '11:30', title: 'Parent-Teacher Interaction', sub: 'Main Auditorium', chip: 'Important', chipColor: '#d4af37', chipBg: 'rgba(212,175,55,0.12)' },
];

const EXAM_DUTY = [
  { time: 'Mon 09:00', subject: 'Mathematics – I', room: 'R-101' },
  { time: 'Tue 11:00', subject: 'Data Structures', room: 'R-205' },
  { time: 'Wed 09:00', subject: 'DBMS', room: 'R-301' },
  { time: 'Thu 14:00', subject: 'Operating Systems', room: 'R-102' },
  { time: 'Sat 10:00', subject: 'Computer Networks', room: 'R-204' },
];

// ─── Star canvas hook ─────────────────────────────────────────────────────────
function useStarfield(ref: React.RefObject<HTMLCanvasElement>) {
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext('2d')!;
    type S = { x:number;y:number;r:number;a:number;speed:number;flicker:number };
    let stars: S[] = [], W=0, H=0, raf=0;
    const resize = () => {
      W = c.width = window.innerWidth; H = c.height = window.innerHeight;
      stars = Array.from({length:200},()=>({x:Math.random()*W,y:Math.random()*H,r:Math.random()*1.1+0.2,a:Math.random(),speed:Math.random()*0.003+0.001,flicker:Math.random()*Math.PI*2}));
    };
    const draw = () => {
      ctx.clearRect(0,0,W,H);
      for(const s of stars){s.flicker+=s.speed;const al=s.a*(0.5+0.5*Math.sin(s.flicker));ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);ctx.fillStyle=`rgba(220,220,255,${al})`;ctx.fill();}
      raf=requestAnimationFrame(draw);
    };
    resize(); draw();
    window.addEventListener('resize',resize);
    return ()=>{cancelAnimationFrame(raf);window.removeEventListener('resize',resize);};
  },[ref]);
}

// ─── Bar chart canvas ─────────────────────────────────────────────────────────
function useBarChart(ref: React.RefObject<HTMLCanvasElement>, data: {date:string;present:number;absent:number}[], theme: string) {
  useEffect(() => {
    const c = ref.current; if (!c || !data.length) return;
    const ctx = c.getContext('2d')!;
    const dpr = window.devicePixelRatio||1;
    const W = c.offsetWidth, H = c.offsetHeight;
    c.width=W*dpr; c.height=H*dpr; ctx.scale(dpr,dpr);
    ctx.clearRect(0,0,W,H);
    const max = Math.max(...data.map(d=>d.present+d.absent),1);
    const pad={l:32,r:16,t:16,b:32};
    const bw = Math.floor((W-pad.l-pad.r)/data.length*0.35);
    const gap = (W-pad.l-pad.r)/data.length;
    const textColor = theme==='dark'?'rgba(232,232,232,0.45)':'rgba(26,26,46,0.45)';
    // y grid
    ctx.strokeStyle = theme==='dark'?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.06)';
    ctx.lineWidth=1;
    for(let i=0;i<=4;i++){const y=pad.t+(H-pad.t-pad.b)*(1-i/4);ctx.beginPath();ctx.moveTo(pad.l,y);ctx.lineTo(W-pad.r,y);ctx.stroke();}
    // bars
    data.forEach((d,i)=>{
      const x=pad.l+i*gap+gap/2;
      const chartH=H-pad.t-pad.b;
      const ph=(d.present/max)*chartH;
      const ah=(d.absent/max)*chartH;
      // present
      ctx.beginPath();ctx.roundRect(x-bw-2,pad.t+chartH-ph,bw,ph,3);ctx.fillStyle='rgba(46,213,115,0.75)';ctx.fill();
      // absent
      ctx.beginPath();ctx.roundRect(x+2,pad.t+chartH-ah,bw,ah,3);ctx.fillStyle='rgba(255,71,87,0.65)';ctx.fill();
      // label
      ctx.fillStyle=textColor;ctx.font=`500 10px DM Sans,sans-serif`;ctx.textAlign='center';
      const lbl=d.date.slice(5);ctx.fillText(lbl,x,H-8);
    });
    // y labels
    ctx.textAlign='right';ctx.fillStyle=textColor;
    for(let i=0;i<=4;i++){const y=pad.t+(H-pad.t-pad.b)*(1-i/4);const v=Math.round(max*i/4);ctx.fillText(String(v),pad.l-4,y+4);}
  },[ref,data,theme]);
}

// ─── CSS ──────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{--font-d:'Cinzel',serif;--font-b:'DM Sans',sans-serif;--accent:#c0c0c0;--gold:#d4af37;--danger:#ff4757;--success:#2ed573;--warning:#ffa502;--info:#70a1ff;--tr:0.32s cubic-bezier(.4,0,.2,1)}
[data-theme="dark"]{--bg:#050508;--cbg:rgba(255,255,255,0.035);--cborder:rgba(192,192,192,0.18);--chover:rgba(255,255,255,0.065);--text:#e8e8e8;--muted:rgba(232,232,232,0.5);--dim:rgba(232,232,232,0.3);--glow:rgba(192,192,192,0.08);--sbg:rgba(5,5,8,0.95);--shadow:0 8px 32px rgba(0,0,0,0.6);--hbg:rgba(5,5,8,0.9)}
[data-theme="light"]{--bg:#f0f0f5;--cbg:rgba(255,255,255,0.88);--cborder:rgba(100,100,120,0.18);--chover:rgba(255,255,255,0.98);--text:#1a1a2e;--muted:rgba(26,26,46,0.5);--dim:rgba(26,26,46,0.3);--glow:rgba(100,100,180,0.06);--sbg:rgba(240,240,245,0.97);--shadow:0 8px 32px rgba(0,0,0,0.1);--hbg:rgba(240,240,245,0.92)}

.t-root{font-family:var(--font-b);background:var(--bg);color:var(--text);min-height:100vh;transition:background var(--tr),color var(--tr);overflow-x:hidden;font-size:15px}
#t-stars{position:fixed;inset:0;z-index:0;pointer-events:none;opacity:1;transition:opacity var(--tr)}
[data-theme="light"] #t-stars{opacity:0.12}
.t-layout{display:flex;min-height:100vh;position:relative;z-index:1}

/* sidebar */
.t-side{width:72px;background:var(--sbg);border-right:1px solid var(--cborder);display:flex;flex-direction:column;align-items:center;padding:1.5rem 0;gap:0.5rem;position:fixed;top:0;left:0;height:100vh;z-index:100;backdrop-filter:blur(20px)}
.t-logo{font-family:var(--font-d);font-size:1rem;color:var(--accent);letter-spacing:0.1em;margin-bottom:1.5rem;writing-mode:vertical-lr;transform:rotate(180deg);opacity:0.7}
.t-nav{width:44px;height:44px;border-radius:12px;border:1px solid transparent;background:transparent;cursor:pointer;display:flex;align-items:center;justify-content:center;color:var(--muted);transition:all var(--tr);position:relative}
.t-nav:hover,.t-nav.act{background:var(--cbg);border-color:var(--cborder);color:var(--accent);box-shadow:0 0 20px var(--glow)}
.t-nav svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
.t-tip{position:absolute;left:calc(100% + 12px);background:var(--cbg);border:1px solid var(--cborder);color:var(--text);font-size:0.72rem;padding:0.3rem 0.7rem;border-radius:6px;white-space:nowrap;opacity:0;pointer-events:none;transition:opacity 0.2s;backdrop-filter:blur(10px)}
.t-nav:hover .t-tip{opacity:1}

/* main */
.t-main{margin-left:72px;flex:1;display:flex;flex-direction:column;min-height:100vh}
.t-hdr{position:sticky;top:0;z-index:50;background:var(--hbg);backdrop-filter:blur(20px);border-bottom:1px solid var(--cborder);padding:0 2rem;height:64px;display:flex;align-items:center;justify-content:space-between;transition:background var(--tr)}
.t-hdr-title{font-family:var(--font-d);font-size:1rem;letter-spacing:0.2em;color:var(--accent);text-transform:uppercase}
.t-hright{display:flex;align-items:center;gap:1rem}
.t-toggle{width:52px;height:28px;background:var(--cbg);border:1px solid var(--cborder);border-radius:14px;cursor:pointer;position:relative;transition:all var(--tr)}
.t-toggle::after{content:'';position:absolute;top:3px;left:3px;width:20px;height:20px;border-radius:50%;background:var(--accent);transition:transform var(--tr)}
[data-theme="light"] .t-toggle::after{transform:translateX(24px)}
.t-avatar{width:38px;height:38px;border-radius:50%;background:linear-gradient(135deg,var(--accent),var(--gold));display:flex;align-items:center;justify-content:center;font-size:0.8rem;font-weight:700;color:#050508;font-family:var(--font-d);cursor:pointer}
.t-notif{width:36px;height:36px;border-radius:50%;background:var(--cbg);border:1px solid var(--cborder);cursor:pointer;display:flex;align-items:center;justify-content:center;color:var(--muted);transition:all var(--tr);position:relative}
.t-notif:hover{border-color:var(--accent);color:var(--accent)}
.t-ndot{position:absolute;top:7px;right:8px;width:6px;height:6px;background:var(--danger);border-radius:50%}

/* content */
.t-content{padding:2rem;flex:1}

/* thought */
.t-thought{margin-bottom:2rem;padding:1.4rem 2rem;border-radius:16px;background:var(--cbg);border:1px solid var(--cborder);backdrop-filter:blur(12px);display:flex;align-items:center;gap:1.5rem;position:relative;overflow:hidden}
.t-thought::before{content:'';position:absolute;right:-30px;top:-30px;width:140px;height:140px;border-radius:50%;background:rgba(192,192,192,0.04);pointer-events:none}
.t-thought-icon{font-size:1.5rem;flex-shrink:0;opacity:0.8}
.t-thought-q{font-size:1rem;color:var(--text);font-style:italic;line-height:1.65;font-weight:400}
.t-thought-a{font-size:0.78rem;color:var(--muted);margin-top:0.35rem}
.t-thought-label{font-family:var(--font-d);font-size:0.7rem;letter-spacing:0.18em;color:var(--accent);text-transform:uppercase;margin-bottom:0.4rem}

/* section title */
.t-sec{font-family:var(--font-d);font-size:0.82rem;letter-spacing:0.2em;color:var(--muted);text-transform:uppercase;margin-bottom:1.25rem;display:flex;align-items:center;gap:0.75rem}
.t-sec::after{content:'';flex:1;height:1px;background:var(--cborder)}

/* card */
.t-card{background:var(--cbg);border:1px solid var(--cborder);border-radius:18px;backdrop-filter:blur(12px);transition:all var(--tr);position:relative;overflow:hidden}
.t-card::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,0.025),transparent);pointer-events:none;border-radius:18px}
.t-card:hover{border-color:rgba(192,192,192,0.28);box-shadow:var(--shadow)}
.t-ch{padding:1.25rem 1.75rem;border-bottom:1px solid var(--cborder);display:flex;align-items:center;justify-content:space-between}
.t-ct{font-family:var(--font-d);font-size:0.82rem;letter-spacing:0.15em;color:var(--accent);text-transform:uppercase}
.t-cb{padding:1.25rem 1.75rem}

/* stat cards */
.t-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:1.25rem;margin-bottom:2rem}
.t-stat{background:var(--cbg);border:1px solid var(--cborder);border-radius:18px;padding:1.75rem;backdrop-filter:blur(12px);transition:all var(--tr);position:relative;overflow:hidden}
.t-stat::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,0.025),transparent);pointer-events:none;border-radius:18px}
.t-stat:hover{background:var(--chover);transform:translateY(-4px);box-shadow:var(--shadow)}
.t-stat-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:1.4rem}
.t-stat-icon{width:48px;height:48px;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:1.4rem}
.t-stat-badge{font-size:0.68rem;font-weight:600;padding:0.28rem 0.65rem;border-radius:20px;letter-spacing:0.05em;text-transform:uppercase}
.t-stat-val{font-family:var(--font-d);font-size:2.6rem;font-weight:700;line-height:1;margin-bottom:0.5rem}
.t-stat-lbl{font-size:0.88rem;color:var(--text);font-weight:600;margin-bottom:0.2rem}
.t-stat-sub{font-size:0.78rem;color:var(--muted)}
.t-stat-bar{margin-top:1.1rem;height:4px;background:var(--cborder);border-radius:2px;overflow:hidden}
.t-stat-fill{height:100%;border-radius:2px;transition:width 1.5s cubic-bezier(.4,0,.2,1)}

/* two col */
.t-cols{display:grid;grid-template-columns:1.7fr 1fr;gap:1.5rem}
.t-left{display:flex;flex-direction:column;gap:1.5rem;min-width:0}
.t-right{display:flex;flex-direction:column;gap:1.5rem;min-width:0}

/* leaderboard */
.t-lb{display:flex;align-items:center;gap:1rem;padding:1rem 0;border-bottom:1px solid var(--cborder);transition:all var(--tr)}
.t-lb:last-child{border-bottom:none}
.t-lb:hover{padding-left:0.35rem}
.t-lb-av{width:38px;height:38px;border-radius:50%;background:linear-gradient(135deg,rgba(192,192,192,0.2),rgba(212,175,55,0.2));display:flex;align-items:center;justify-content:center;font-size:0.82rem;font-weight:700;color:var(--accent);flex-shrink:0;font-family:var(--font-d)}
.t-lb-name{font-size:0.92rem;font-weight:600;margin-bottom:0.1rem}
.t-lb-roll{font-size:0.75rem;color:var(--muted)}
.t-lb-track{flex-shrink:0;width:80px;height:5px;background:var(--cborder);border-radius:3px;overflow:hidden}
.t-lb-fill{height:100%;border-radius:3px}
.t-lb-pct{font-size:0.88rem;font-weight:700;min-width:44px;text-align:right}

/* announcements */
.t-ann{display:flex;align-items:center;gap:0.85rem;padding:0.85rem 1rem;border-radius:12px;cursor:pointer;transition:all var(--tr);margin-bottom:0.5rem}
.t-ann:last-child{margin-bottom:0}
.t-ann:hover{filter:brightness(1.08);transform:translateX(3px)}
.t-ann-icon{font-size:1.1rem;flex-shrink:0}
.t-ann-title{font-size:0.88rem;font-weight:600;margin-bottom:0.15rem}
.t-ann-detail{font-size:0.75rem;font-weight:500}

/* risk */
.t-risk{display:flex;align-items:center;gap:0.85rem;padding:0.85rem 0;border-bottom:1px solid var(--cborder)}
.t-risk:last-child{border-bottom:none;padding-bottom:0}
.t-risk-circle{width:46px;height:46px;border-radius:50%;border:2px solid var(--warning);background:rgba(255,165,2,0.08);display:flex;align-items:center;justify-content:center;flex-shrink:0}
.t-risk-pct{font-size:0.8rem;font-weight:700;color:var(--warning);font-family:var(--font-d)}
.t-risk-name{font-size:0.9rem;font-weight:600;margin-bottom:0.15rem}
.t-risk-sub{font-size:0.74rem;color:var(--muted)}

/* duty */
.t-duty{display:flex;align-items:center;gap:0.85rem;padding:0.75rem 0;border-bottom:1px solid var(--cborder)}
.t-duty:last-child{border-bottom:none}
.t-duty-t{font-size:0.74rem;color:var(--muted);min-width:72px;font-family:var(--font-d);letter-spacing:0.04em}
.t-duty-s{font-size:0.88rem;font-weight:600;flex:1}
.t-duty-r{font-size:0.74rem;background:rgba(112,161,255,0.12);color:var(--info);padding:0.2rem 0.55rem;border-radius:7px;font-weight:600}

/* meeting */
.t-mtg{display:flex;gap:0.85rem;padding:0.85rem 0;border-bottom:1px solid var(--cborder)}
.t-mtg:last-child{border-bottom:none}
.t-mtg-t{font-size:0.72rem;color:var(--muted);min-width:52px;text-align:center;font-family:var(--font-d);line-height:1.5}
.t-mtg-title{font-size:0.88rem;font-weight:600;margin-bottom:0.15rem}
.t-mtg-sub{font-size:0.74rem;color:var(--muted)}
.t-chip{font-size:0.65rem;padding:0.18rem 0.55rem;border-radius:8px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;display:inline-block;margin-top:0.3rem}

/* calendar */
.t-cal-day{border-radius:50%;width:34px;height:34px;display:flex;align-items:center;justify-content:center;margin:0 auto;font-size:0.84rem;font-weight:500;cursor:pointer;transition:background 0.15s}
.t-cal-day:hover{background:rgba(192,192,192,0.1)}

/* chart */
.t-chart-wrap{position:relative;height:200px;margin-top:0.5rem}
.t-chart-wrap canvas{width:100%;height:100%}

/* export */
.t-export{display:flex;align-items:center;gap:0.85rem;padding:0.8rem 1rem;background:rgba(255,255,255,0.02);border:1px solid var(--cborder);border-radius:10px;margin-bottom:0.6rem;transition:all var(--tr);cursor:pointer}
.t-export:hover{background:var(--chover);border-color:rgba(192,192,192,0.28)}
.t-export:last-child{margin-bottom:0}
.t-export-name{flex:1;font-size:0.86rem;font-weight:500}

/* misc */
.t-live{width:7px;height:7px;border-radius:50%;background:var(--success);display:inline-block;animation:t-pulse 2s infinite}
@keyframes t-pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.5;transform:scale(0.85)}}
@keyframes t-up{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
.t-anim{animation:t-up 0.5s ease both}
.t-anim-1{animation-delay:0.05s}.t-anim-2{animation-delay:0.10s}.t-anim-3{animation-delay:0.15s}.t-anim-4{animation-delay:0.20s}

@media(max-width:1200px){.t-cols{grid-template-columns:1fr}.t-stats{grid-template-columns:1fr 1fr}}
@media(max-width:700px){.t-stats{grid-template-columns:1fr}}
`;

// ─── Component ────────────────────────────────────────────────────────────────
export default function TeacherDashboard() {
  const [theme, setTheme] = useState<'dark'|'light'>('dark');
  const [stats, setStats] = useState<DashboardStats|null>(null);
  const [loading, setLoading] = useState(true);
  const [thought] = useState(() => THOUGHTS[Math.floor(Math.random()*THOUGHTS.length)]);
  const [calMonth, setCalMonth] = useState(new Date());

  const starsRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<HTMLCanvasElement>(null);

  useStarfield(starsRef as React.RefObject<HTMLCanvasElement>);
  useBarChart(chartRef as React.RefObject<HTMLCanvasElement>, stats?.chartData ?? [], theme);

  useEffect(() => {
    (async () => {
      try {
        const r1 = await fetch('/api/teacher/me');
        const d1 = await r1.json();
        if (d1.success && d1.user) {
          const r2 = await fetch(`/api/teacher/dashboard?teacher_id=${d1.user.id}`);
          const d2 = await r2.json();
          if (d2.success) setStats(d2.stats);
        }
      } catch { /* ignore */ }
      setLoading(false);
    })();
  }, []);

  // Calendar helpers
  const now = new Date();
  const monthName = calMonth.toLocaleString('default', { month:'long', year:'numeric' });
  const daysInMonth = new Date(calMonth.getFullYear(), calMonth.getMonth()+1, 0).getDate();
  const firstDay = new Date(calMonth.getFullYear(), calMonth.getMonth(), 1).getDay();
  const calGrid = [...Array(firstDay).fill(null), ...Array.from({length:daysInMonth},(_,i)=>i+1)];
  const isToday = (d:number|null) => d!==null && calMonth.getFullYear()===now.getFullYear() && calMonth.getMonth()===now.getMonth() && d===now.getDate();

  if (loading || !stats) {
    return (
      <div data-theme={theme} className="t-root" style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',flexDirection:'column',gap:'1rem'}}>
        <style>{CSS}</style>
        <canvas id="t-stars" ref={starsRef}/>
        <div style={{width:40,height:40,border:'2px solid rgba(192,192,192,0.2)',borderTop:'2px solid #c0c0c0',borderRadius:'50%',animation:'t-spin 0.8s linear infinite'}}/>
        <p style={{fontFamily:'var(--font-d)',color:'var(--muted)',letterSpacing:'0.18em',fontSize:'0.82rem'}}>LOADING DASHBOARD…</p>
        <style>{`@keyframes t-spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  const attendancePct = stats.totalStudents > 0 ? Math.round((stats.presentToday/stats.totalStudents)*100) : 0;

  return (
    <div data-theme={theme} className="t-root">
      <style>{CSS}</style>
      <canvas id="t-stars" ref={starsRef}/>

      <div className="t-layout">
        {/* SIDEBAR */}
        <aside className="t-side">
          <div className="t-logo">TCH</div>
          <button className="t-nav act">
            <svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
            <span className="t-tip">Dashboard</span>
          </button>
          <button className="t-nav">
            <svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
            <span className="t-tip">Students</span>
          </button>
          <button className="t-nav">
            <svg viewBox="0 0 24 24"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
            <span className="t-tip">Attendance</span>
          </button>
          <button className="t-nav">
            <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
            <span className="t-tip">Schedule</span>
          </button>
          <button className="t-nav">
            <svg viewBox="0 0 24 24"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>
            <span className="t-tip">Reports</span>
          </button>
          <button className="t-nav" style={{marginTop:'auto'}}>
            <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>
            <span className="t-tip">Settings</span>
          </button>
        </aside>

        {/* MAIN */}
        <div className="t-main">
          {/* HEADER */}
          <header className="t-hdr">
            <div className="t-hdr-title">Teacher · Dashboard</div>
            <div className="t-hright">
              <span style={{fontSize:'0.78rem',color:'var(--muted)'}}>
                {now.toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short',year:'numeric'})}
              </span>
              <button className="t-toggle" onClick={()=>setTheme(t=>t==='dark'?'light':'dark')} aria-label="Toggle theme"/>
              <button className="t-notif">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
                <div className="t-ndot"/>
              </button>
              <div className="t-avatar">V</div>
            </div>
          </header>

          {/* CONTENT */}
          <div className="t-content">

            {/* THOUGHT */}
            <div className="t-thought t-anim">
              <span className="t-thought-icon">✦</span>
              <div style={{flex:1}}>
                <div className="t-thought-label">Thought of the Day</div>
                <p className="t-thought-q">"{thought.quote}"</p>
                <p className="t-thought-a">— {thought.author}</p>
              </div>
            </div>

            {/* STAT CARDS */}
            <div className="t-sec">Class Overview</div>
            <div className="t-stats">
              {[
                {label:'Total Enrolled', value:stats.totalStudents, icon:'🎓', badge:'Active', color:'var(--info)', bg:'rgba(112,161,255,0.1)', bar:70, sub:'Current semester'},
                {label:'Present Today', value:stats.presentToday, icon:'✅', badge:'Live', color:'var(--success)', bg:'rgba(46,213,115,0.1)', bar:attendancePct, sub:`${attendancePct}% attendance`},
                {label:'Absent Today', value:stats.absentToday, icon:'⚠️', badge:'Alert', color:'var(--danger)', bg:'rgba(255,71,87,0.1)', bar:Math.round((stats.absentToday/Math.max(stats.totalStudents,1))*100), sub:`${stats.totalStudents-stats.absentToday} on campus`},
              ].map(({label,value,icon,badge,color,bg,bar,sub},i)=>(
                <div key={label} className={`t-stat t-anim t-anim-${i+1}`} style={{borderTop:`3px solid ${color}`}}>
                  <div className="t-stat-top">
                    <div className="t-stat-icon" style={{background:bg}}>{icon}</div>
                    <span className="t-stat-badge" style={{background:bg,color}}>{badge}</span>
                  </div>
                  <div className="t-stat-val" style={{color}}>{value}</div>
                  <div className="t-stat-lbl">{label}</div>
                  <div className="t-stat-sub">{sub}</div>
                  <div className="t-stat-bar"><div className="t-stat-fill" style={{width:`${bar}%`,background:color}}/></div>
                </div>
              ))}
            </div>

            {/* TWO COLUMN */}
            <div className="t-cols">
              {/* LEFT */}
              <div className="t-left">

                {/* Chart */}
                <div className="t-card t-anim t-anim-2">
                  <div className="t-ch">
                    <span className="t-ct">Weekly Attendance Trends</span>
                    <div style={{display:'flex',gap:'1rem',fontSize:'0.78rem',color:'var(--muted)'}}>
                      <span style={{display:'flex',alignItems:'center',gap:'0.35rem'}}>
                        <span style={{width:10,height:10,borderRadius:2,background:'var(--success)',display:'inline-block'}}/> Present
                      </span>
                      <span style={{display:'flex',alignItems:'center',gap:'0.35rem'}}>
                        <span style={{width:10,height:10,borderRadius:2,background:'var(--danger)',display:'inline-block'}}/> Absent
                      </span>
                    </div>
                  </div>
                  <div className="t-cb">
                    {stats.chartData.length > 0 ? (
                      <div className="t-chart-wrap"><canvas ref={chartRef}/></div>
                    ) : (
                      <div style={{height:200,display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:'0.5rem'}}>
                        <span style={{fontSize:'2rem',opacity:0.3}}>📊</span>
                        <p style={{color:'var(--muted)',fontSize:'0.86rem'}}>No attendance data yet</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Leaderboard */}
                <div className="t-card t-anim t-anim-3">
                  <div className="t-ch">
                    <span className="t-ct">🏆 Perfect Attendance Board</span>
                    <span style={{fontSize:'0.74rem',color:'var(--muted)'}}>Top performers</span>
                  </div>
                  <div className="t-cb" style={{paddingTop:'0.75rem'}}>
                    {stats.leaderboard.length === 0 ? (
                      <p style={{color:'var(--muted)',fontSize:'0.86rem',textAlign:'center',padding:'1rem 0'}}>Mark attendance to see rankings</p>
                    ) : stats.leaderboard.map((s,i)=>{
                      const pc = s.percentage >= 90 ? 'var(--success)' : s.percentage >= 75 ? 'var(--warning)' : 'var(--danger)';
                      return (
                        <div key={s.id} className="t-lb">
                          <span style={{width:26,textAlign:'center',fontSize:i<3?'1.1rem':'0.8rem',color:'var(--muted)'}}>{i===0?'🥇':i===1?'🥈':i===2?'🥉':i+1}</span>
                          <div className="t-lb-av">{s.name.charAt(0)}</div>
                          <div style={{flex:1}}>
                            <div className="t-lb-name">{s.name}</div>
                            <div className="t-lb-roll">Roll: {s.roll}</div>
                          </div>
                          <div className="t-lb-track"><div className="t-lb-fill" style={{width:`${s.percentage}%`,background:pc}}/></div>
                          <span className="t-lb-pct" style={{color:pc}}>{s.percentage}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Exam Duty */}
                <div className="t-card t-anim t-anim-4">
                  <div className="t-ch">
                    <span className="t-ct">📝 Exam Duty Chart</span>
                    <span style={{fontSize:'0.72rem',color:'var(--warning)',background:'rgba(255,165,2,0.1)',padding:'0.22rem 0.55rem',borderRadius:'8px',fontWeight:600}}>Mar 22–28</span>
                  </div>
                  <div className="t-cb" style={{paddingTop:'0.75rem'}}>
                    {EXAM_DUTY.map(d=>(
                      <div key={d.subject} className="t-duty">
                        <span className="t-duty-t">{d.time}</span>
                        <span className="t-duty-s">{d.subject}</span>
                        <span className="t-duty-r">{d.room}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* RIGHT */}
              <div className="t-right">

                {/* Announcements */}
                <div className="t-card t-anim t-anim-1">
                  <div className="t-ch">
                    <span className="t-ct">📢 Announcements</span>
                    <span className="t-live"/>
                  </div>
                  <div className="t-cb" style={{paddingTop:'0.75rem'}}>
                    {ANNOUNCEMENTS.map(a=>(
                      <div key={a.id} className="t-ann" style={{background:a.bg}}>
                        <span className="t-ann-icon">{a.icon}</span>
                        <div style={{flex:1,minWidth:0}}>
                          <div className="t-ann-title" style={{color:'var(--text)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{a.title}</div>
                          <div className="t-ann-detail" style={{color:a.color}}>{a.detail}</div>
                        </div>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round" style={{flexShrink:0}}><polyline points="9 18 15 12 9 6"/></svg>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Risk Alerts */}
                <div className="t-card t-anim t-anim-2" style={{borderLeft:'3px solid var(--warning)'}}>
                  <div className="t-ch">
                    <span className="t-ct" style={{color:'var(--warning)'}}>⚠ AI Risk Alerts</span>
                    <span style={{fontSize:'0.7rem',background:'rgba(255,165,2,0.1)',color:'var(--warning)',padding:'0.22rem 0.55rem',borderRadius:'20px',fontWeight:700}}>
                      {stats.riskyStudents.length} at risk
                    </span>
                  </div>
                  <div className="t-cb" style={{paddingTop:'0.75rem'}}>
                    {stats.riskyStudents.length === 0 ? (
                      <div style={{textAlign:'center',padding:'1.5rem 0'}}>
                        <div style={{fontSize:'2rem',marginBottom:'0.5rem'}}>✅</div>
                        <p style={{color:'var(--muted)',fontSize:'0.86rem'}}>No low attendance alerts active.</p>
                      </div>
                    ) : stats.riskyStudents.slice(0,4).map(rs=>(
                      <div key={rs.id} className="t-risk">
                        <div className="t-risk-circle">
                          <span className="t-risk-pct">{rs.percentage}%</span>
                        </div>
                        <div style={{flex:1,minWidth:0}}>
                          <div className="t-risk-name" style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{rs.name}</div>
                          <div className="t-risk-sub">Will drop to {Math.round(((rs.present)/(rs.total+3))*100)}% if absent 3×</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Meetings */}
                <div className="t-card t-anim t-anim-3">
                  <div className="t-ch">
                    <span className="t-ct">📅 Upcoming Meetings</span>
                    <span style={{fontSize:'0.72rem',color:'var(--success)',background:'rgba(46,213,115,0.1)',padding:'0.22rem 0.55rem',borderRadius:'8px',fontWeight:600}}>This Week</span>
                  </div>
                  <div className="t-cb" style={{paddingTop:'0.75rem'}}>
                    {MEETINGS.map(m=>(
                      <div key={m.title} className="t-mtg">
                        <div className="t-mtg-t">{m.day}<br/>{m.time}</div>
                        <div style={{flex:1}}>
                          <div className="t-mtg-title">{m.title}</div>
                          <div className="t-mtg-sub">{m.sub}</div>
                          <span className="t-chip" style={{background:m.chipBg,color:m.chipColor}}>{m.chip}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Calendar */}
                <div className="t-card t-anim t-anim-4">
                  <div className="t-ch">
                    <span className="t-ct">📆 Calendar</span>
                    <div style={{display:'flex',gap:'0.3rem'}}>
                      <button onClick={()=>setCalMonth(m=>new Date(m.getFullYear(),m.getMonth()-1,1))} style={{background:'var(--cbg)',border:'1px solid var(--cborder)',borderRadius:'6px',padding:'0.25rem 0.5rem',cursor:'pointer',fontSize:'0.8rem',color:'var(--text)'}}>‹</button>
                      <button onClick={()=>setCalMonth(m=>new Date(m.getFullYear(),m.getMonth()+1,1))} style={{background:'var(--cbg)',border:'1px solid var(--cborder)',borderRadius:'6px',padding:'0.25rem 0.5rem',cursor:'pointer',fontSize:'0.8rem',color:'var(--text)'}}>›</button>
                    </div>
                  </div>
                  <div className="t-cb">
                    <p style={{textAlign:'center',fontSize:'0.86rem',fontWeight:600,fontFamily:'var(--font-d)',color:'var(--accent)',marginBottom:'0.85rem',letterSpacing:'0.1em'}}>{monthName}</p>
                    <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',textAlign:'center',gap:'0.15rem',marginBottom:'0.4rem'}}>
                      {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d=>(
                        <div key={d} style={{fontSize:'0.7rem',color:'var(--muted)',fontWeight:600,padding:'0.2rem 0'}}>{d}</div>
                      ))}
                    </div>
                    <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',textAlign:'center',gap:'0.15rem'}}>
                      {calGrid.map((d,i)=>(
                        <div key={i} className="t-cal-day" style={{
                          background: isToday(d) ? 'var(--accent)' : 'transparent',
                          color: isToday(d) ? '#050508' : d ? 'var(--text)' : 'transparent',
                          fontWeight: isToday(d) ? 700 : 400,
                        }}>{d||''}</div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Quick Export */}
                <div className="t-card t-anim t-anim-4">
                  <div className="t-ch">
                    <span className="t-ct">Quick Export</span>
                    <span style={{fontSize:'0.72rem',color:'var(--muted)'}}>PDF / CSV</span>
                  </div>
                  <div className="t-cb">
                    {[
                      {label:`${now.toLocaleString('default',{month:'long',year:'numeric'})} Report`,ext:'PDF'},
                      {label:'Full Attendance Log',ext:'CSV'},
                    ].map(f=>(
                      <div key={f.label} className="t-export">
                        <div style={{width:8,height:8,borderRadius:'50%',background:'var(--accent)',flexShrink:0}}/>
                        <span className="t-export-name">{f.label}.{f.ext.toLowerCase()}</span>
                        <span style={{fontSize:'0.68rem',background:'rgba(192,192,192,0.1)',color:'var(--accent)',padding:'0.15rem 0.45rem',borderRadius:'5px',fontWeight:700}}>{f.ext}</span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" style={{cursor:'pointer',flexShrink:0}}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}