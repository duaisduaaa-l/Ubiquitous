'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Stats {
  totalTeachers: number;
  totalStudents: number;
  todayAttendancePercentage: number;
  monthlyTrend: { date: string; percentage: number }[];
  leaderboard: { id: string; name: string; roll: string; percentage: number }[];
  lowAttendance: { id: string; name: string; roll: string; percentage: number; total: number }[];
  departmentWise: { name: string; present: number; absent: number }[];
}

interface LoginLog {
  log_id: string;
  user_name: string;
  user_email: string;
  role: string;
  loggedInAt: string;
  ipAddress: string;
  userAgent: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}
function isMobileUA(ua: string) { return /Android|iPhone|iPad|iPod|Mobile/i.test(ua); }
function getBrowserName(ua: string) {
  if (ua.includes('Chrome') && !ua.includes('Edg')) return 'Chrome';
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
  if (ua.includes('Edg')) return 'Edge';
  return 'Browser';
}

// ─── Star canvas hook ─────────────────────────────────────────────────────────
function useStarfield(canvasRef: React.RefObject<HTMLCanvasElement>) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    type Star = { x: number; y: number; r: number; a: number; speed: number; flicker: number };
    let stars: Star[] = [];
    let W = 0, H = 0, rafId = 0;

    function resize() {
      W = canvas!.width = window.innerWidth;
      H = canvas!.height = window.innerHeight;
      stars = Array.from({ length: 220 }, () => ({
        x: Math.random() * W, y: Math.random() * H,
        r: Math.random() * 1.2 + 0.2,
        a: Math.random(),
        speed: Math.random() * 0.003 + 0.001,
        flicker: Math.random() * Math.PI * 2,
      }));
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      for (const s of stars) {
        s.flicker += s.speed;
        const alpha = s.a * (0.5 + 0.5 * Math.sin(s.flicker));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(220,220,255,${alpha})`;
        ctx.fill();
      }
      rafId = requestAnimationFrame(draw);
    }

    resize();
    draw();
    window.addEventListener('resize', resize);
    return () => { cancelAnimationFrame(rafId); window.removeEventListener('resize', resize); };
  }, [canvasRef]);
}

// ─── Sparkline hook ───────────────────────────────────────────────────────────
function useSparkline(canvasRef: React.RefObject<HTMLCanvasElement>, data: number[]) {
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const cx = c.getContext('2d')!;
    const dpr = window.devicePixelRatio || 1;
    const W = c.offsetWidth, H = c.offsetHeight;
    c.width = W * dpr; c.height = H * dpr;
    cx.scale(dpr, dpr);
    const min = 60, range = 40;
    const pts = data.map((v, i) => ({
      x: (i / (data.length - 1)) * W,
      y: H - ((v - min) / range) * H * 0.85 - H * 0.05,
    }));
    const grad = cx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, 'rgba(46,213,115,0.35)');
    grad.addColorStop(1, 'rgba(46,213,115,0)');
    const drawPath = () => {
      cx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length - 1; i++) {
        const mx = (pts[i].x + pts[i + 1].x) / 2;
        const my = (pts[i].y + pts[i + 1].y) / 2;
        cx.quadraticCurveTo(pts[i].x, pts[i].y, mx, my);
      }
      cx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
    };
    cx.beginPath(); drawPath();
    cx.lineTo(W, H); cx.lineTo(0, H); cx.closePath();
    cx.fillStyle = grad; cx.fill();
    cx.beginPath(); drawPath();
    cx.strokeStyle = '#2ed573'; cx.lineWidth = 2; cx.stroke();
  }, [canvasRef, data]);
}

// ─── CSS (injected once via a style tag) ──────────────────────────────────────
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --font-display: 'Cinzel', serif;
  --font-body: 'DM Sans', sans-serif;
  --accent: #c0c0c0;
  --gold: #d4af37;
  --danger: #ff4757;
  --success: #2ed573;
  --warning: #ffa502;
  --info: #70a1ff;
  --tr: 0.35s cubic-bezier(.4,0,.2,1);
}
[data-theme="dark"] {
  --bg: #050508; --card-bg: rgba(255,255,255,0.035);
  --card-border: rgba(192,192,192,0.18); --card-hover: rgba(255,255,255,0.065);
  --text: #e8e8e8; --text-muted: rgba(232,232,232,0.5); --text-dim: rgba(232,232,232,0.3);
  --glow: rgba(192,192,192,0.08); --sidebar-bg: rgba(5,5,8,0.95);
  --shadow: 0 8px 32px rgba(0,0,0,0.6); --header-bg: rgba(5,5,8,0.9);
}
[data-theme="light"] {
  --bg: #f0f0f5; --card-bg: rgba(255,255,255,0.85);
  --card-border: rgba(100,100,120,0.2); --card-hover: rgba(255,255,255,0.98);
  --text: #1a1a2e; --text-muted: rgba(26,26,46,0.55); --text-dim: rgba(26,26,46,0.35);
  --glow: rgba(100,100,180,0.06); --sidebar-bg: rgba(240,240,245,0.97);
  --shadow: 0 8px 32px rgba(0,0,0,0.12); --header-bg: rgba(240,240,245,0.92);
}
.adm-root { font-family: var(--font-body); background: var(--bg); color: var(--text);
  min-height: 100vh; transition: background var(--tr), color var(--tr); overflow-x: hidden; }
#adm-stars { position: fixed; inset: 0; z-index: 0; pointer-events: none;
  opacity: 1; transition: opacity var(--tr); }
[data-theme="light"] #adm-stars { opacity: 0.15; }
.adm-layout { display: flex; min-height: 100vh; position: relative; z-index: 1; }

/* sidebar */
.adm-sidebar { width: 72px; background: var(--sidebar-bg); border-right: 1px solid var(--card-border);
  display: flex; flex-direction: column; align-items: center; padding: 1.5rem 0; gap: 0.5rem;
  position: fixed; top: 0; left: 0; height: 100vh; z-index: 100; backdrop-filter: blur(20px); }
.adm-logo { font-family: var(--font-display); font-size: 1.1rem; color: var(--accent);
  letter-spacing: 0.1em; margin-bottom: 1.5rem; writing-mode: vertical-lr;
  transform: rotate(180deg); opacity: 0.7; }
.adm-nav { width: 44px; height: 44px; border-radius: 12px; border: 1px solid transparent;
  background: transparent; cursor: pointer; display: flex; align-items: center;
  justify-content: center; color: var(--text-muted); transition: all var(--tr); position: relative; }
.adm-nav:hover, .adm-nav.active { background: var(--card-bg); border-color: var(--card-border);
  color: var(--accent); box-shadow: 0 0 20px var(--glow); }
.adm-nav svg { width: 18px; height: 18px; fill: none; stroke: currentColor;
  stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
.adm-tip { position: absolute; left: calc(100% + 12px); background: var(--card-bg);
  border: 1px solid var(--card-border); color: var(--text); font-size: 0.72rem;
  padding: 0.3rem 0.7rem; border-radius: 6px; white-space: nowrap; opacity: 0;
  pointer-events: none; transition: opacity 0.2s; backdrop-filter: blur(10px); }
.adm-nav:hover .adm-tip { opacity: 1; }

/* main */
.adm-main { margin-left: 72px; flex: 1; display: flex; flex-direction: column; min-height: 100vh; }
.adm-header { position: sticky; top: 0; z-index: 50; background: var(--header-bg);
  backdrop-filter: blur(20px); border-bottom: 1px solid var(--card-border);
  padding: 0 2rem; height: 60px; display: flex; align-items: center;
  justify-content: space-between; transition: background var(--tr), border-color var(--tr); }
.adm-header-title { font-family: var(--font-display); font-size: 0.95rem;
  letter-spacing: 0.2em; color: var(--accent); text-transform: uppercase; }
.adm-hright { display: flex; align-items: center; gap: 1rem; }
.adm-toggle { width: 52px; height: 28px; background: var(--card-bg);
  border: 1px solid var(--card-border); border-radius: 14px; cursor: pointer;
  position: relative; transition: all var(--tr); }
.adm-toggle::after { content: ''; position: absolute; top: 3px; left: 3px;
  width: 20px; height: 20px; border-radius: 50%; background: var(--accent);
  transition: transform var(--tr); }
[data-theme="light"] .adm-toggle::after { transform: translateX(24px); }
.adm-avatar { width: 34px; height: 34px; border-radius: 50%;
  background: linear-gradient(135deg, var(--accent), var(--gold));
  display: flex; align-items: center; justify-content: center;
  font-size: 0.75rem; font-weight: 600; color: #050508;
  font-family: var(--font-display); cursor: pointer; }
.adm-notif { width: 34px; height: 34px; border-radius: 50%; background: var(--card-bg);
  border: 1px solid var(--card-border); cursor: pointer; display: flex;
  align-items: center; justify-content: center; color: var(--text-muted);
  transition: all var(--tr); position: relative; }
.adm-notif:hover { border-color: var(--accent); color: var(--accent); }
.adm-ndot { position: absolute; top: 6px; right: 7px; width: 6px; height: 6px;
  background: var(--danger); border-radius: 50%; }

/* content */
.adm-content { padding: 2rem; flex: 1; }

/* thought */
.adm-thought { margin-bottom: 2rem; padding: 1rem 1.5rem; border-radius: 14px;
  background: var(--card-bg); border: 1px solid var(--card-border);
  backdrop-filter: blur(12px); display: flex; align-items: center; gap: 1rem; }
.adm-thought-text { font-size: 0.78rem; color: var(--text-muted); font-style: italic; line-height: 1.6; }
.adm-thought-text strong { color: var(--accent); font-style: normal; font-size: 0.82rem;
  font-family: var(--font-display); letter-spacing: 0.05em; }

/* stat cards */
.adm-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.25rem; margin-bottom: 2rem; }
.adm-stat { background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 18px;
  padding: 1.5rem; backdrop-filter: blur(12px); transition: all var(--tr); position: relative;
  overflow: hidden; }
.adm-stat::before { content: ''; position: absolute; inset: 0; border-radius: 18px;
  background: linear-gradient(135deg, rgba(255,255,255,0.04), transparent); pointer-events: none; }
.adm-stat:hover { background: var(--card-hover); border-color: rgba(192,192,192,0.3);
  transform: translateY(-3px); box-shadow: var(--shadow); }
.adm-stat-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.2rem; }
.adm-stat-icon { width: 44px; height: 44px; border-radius: 12px; display: flex;
  align-items: center; justify-content: center; font-size: 1.2rem; }
.adm-stat-badge { font-size: 0.65rem; font-weight: 600; padding: 0.25rem 0.6rem;
  border-radius: 20px; letter-spacing: 0.05em; text-transform: uppercase; }
.adm-stat-val { font-family: var(--font-display); font-size: 2.2rem; font-weight: 700;
  line-height: 1; margin-bottom: 0.4rem; }
.adm-stat-lbl { font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.1em; }
.adm-stat-bar { margin-top: 1rem; height: 3px; background: var(--card-border); border-radius: 2px; overflow: hidden; }
.adm-stat-fill { height: 100%; border-radius: 2px; }

/* section title */
.adm-sec { font-family: var(--font-display); font-size: 0.85rem; letter-spacing: 0.2em;
  color: var(--text-muted); text-transform: uppercase; margin-bottom: 1.25rem;
  display: flex; align-items: center; gap: 0.75rem; }
.adm-sec::after { content: ''; flex: 1; height: 1px; background: var(--card-border); }

/* grids */
.adm-g3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.25rem; margin-bottom: 2rem; }
.adm-g2 { display: grid; grid-template-columns: 1.6fr 1fr; gap: 1.25rem; margin-bottom: 2rem; }
.adm-g2b { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; margin-bottom: 2rem; }

/* card */
.adm-card { background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 18px;
  backdrop-filter: blur(12px); transition: all var(--tr); position: relative; overflow: hidden; }
.adm-card::before { content: ''; position: absolute; inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.025), transparent);
  pointer-events: none; border-radius: 18px; }
.adm-card:hover { border-color: rgba(192,192,192,0.28); box-shadow: var(--shadow); }
.adm-ch { padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--card-border);
  display: flex; align-items: center; justify-content: space-between; }
.adm-ct { font-family: var(--font-display); font-size: 0.8rem; letter-spacing: 0.15em;
  color: var(--accent); text-transform: uppercase; }
.adm-cb { padding: 1.25rem 1.5rem; }

/* login items */
.adm-login { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem;
  border-radius: 12px; border: 1px solid var(--card-border); background: rgba(255,255,255,0.015);
  transition: all var(--tr); }
.adm-login:hover { background: var(--card-hover); border-color: rgba(192,192,192,0.25); }
.adm-la { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center;
  justify-content: center; font-size: 0.8rem; font-weight: 700;
  font-family: var(--font-display); flex-shrink: 0; }
.adm-lname { font-size: 0.84rem; font-weight: 600; }
.adm-lmeta { font-size: 0.7rem; color: var(--text-muted); margin-top: 0.1rem; }
.adm-role { font-size: 0.62rem; font-weight: 700; padding: 0.15rem 0.5rem;
  border-radius: 10px; text-transform: uppercase; letter-spacing: 0.05em; }
.adm-ltime { font-size: 0.7rem; color: var(--text-dim); text-align: right; flex-shrink: 0; }

/* teacher info */
.adm-info { display: flex; align-items: flex-start; gap: 0.75rem; padding: 0.85rem 0;
  border-bottom: 1px solid var(--card-border); }
.adm-info:last-child { border-bottom: none; padding-bottom: 0; }
.adm-info-lbl { font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase;
  letter-spacing: 0.08em; margin-bottom: 0.2rem; }
.adm-info-val { font-size: 0.84rem; font-weight: 600; line-height: 1.4; }
.adm-info-sub { font-size: 0.71rem; color: var(--text-muted); margin-top: 0.15rem; }
.adm-edot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; margin-top: 0.35rem; }

/* meetings */
.adm-mtg { display: flex; gap: 0.75rem; padding: 0.75rem 0; border-bottom: 1px solid var(--card-border); }
.adm-mtg:last-child { border-bottom: none; }
.adm-mtg-t { font-size: 0.7rem; color: var(--text-muted); min-width: 55px; text-align: center;
  font-family: var(--font-display); line-height: 1.4; }
.adm-mtg-body { flex: 1; }
.adm-mtg-title { font-size: 0.84rem; font-weight: 600; margin-bottom: 0.15rem; }
.adm-mtg-sub { font-size: 0.71rem; color: var(--text-muted); }
.adm-chip { font-size: 0.62rem; padding: 0.15rem 0.5rem; border-radius: 8px;
  font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;
  display: inline-block; margin-top: 0.3rem; }

/* duty */
.adm-duty { display: flex; align-items: center; gap: 0.75rem; padding: 0.65rem 0;
  border-bottom: 1px solid var(--card-border); }
.adm-duty:last-child { border-bottom: none; }
.adm-duty-t { font-size: 0.72rem; color: var(--text-muted); min-width: 70px;
  font-family: var(--font-display); letter-spacing: 0.05em; }
.adm-duty-s { font-size: 0.83rem; font-weight: 600; flex: 1; }
.adm-duty-r { font-size: 0.72rem; background: rgba(112,161,255,0.12); color: var(--info);
  padding: 0.15rem 0.5rem; border-radius: 6px; }

/* dept bars */
.adm-dept-lbl { font-size: 0.72rem; color: var(--text-muted); margin-bottom: 0.3rem;
  display: flex; justify-content: space-between; }
.adm-dept-track { height: 24px; background: rgba(255,255,255,0.04); border-radius: 6px;
  overflow: hidden; display: flex; margin-bottom: 0.75rem; }

/* leaderboard */
.adm-lb { display: flex; align-items: center; gap: 0.75rem; padding: 0.8rem 0;
  border-bottom: 1px solid var(--card-border); transition: all var(--tr); }
.adm-lb:last-child { border-bottom: none; }
.adm-lb:hover { padding-left: 0.25rem; }
.adm-lb-av { width: 32px; height: 32px; border-radius: 50%;
  background: linear-gradient(135deg, rgba(192,192,192,0.2), rgba(212,175,55,0.2));
  display: flex; align-items: center; justify-content: center;
  font-size: 0.75rem; font-weight: 700; color: var(--accent); flex-shrink: 0;
  font-family: var(--font-display); }
.adm-lb-track { flex-shrink: 0; width: 60px; height: 4px; background: var(--card-border);
  border-radius: 2px; overflow: hidden; }

/* performer */
.adm-perf { text-align: center; padding: 2rem 1.5rem; }
.adm-perf-ring { width: 90px; height: 90px; border-radius: 50%; border: 2px solid var(--gold);
  background: rgba(212,175,55,0.08); display: flex; align-items: center; justify-content: center;
  margin: 0 auto 1rem; font-size: 2.5rem; position: relative;
  box-shadow: 0 0 30px rgba(212,175,55,0.2); }
.adm-perf-ring::after { content: 'TOP PERFORMER'; position: absolute; bottom: -12px;
  left: 50%; transform: translateX(-50%); background: var(--gold); color: #050508;
  font-size: 0.55rem; font-family: var(--font-display); letter-spacing: 0.1em;
  padding: 0.2rem 0.6rem; border-radius: 10px; white-space: nowrap; font-weight: 700; }

/* low attendance */
.adm-low { display: flex; align-items: center; justify-content: space-between;
  padding: 0.65rem 0; border-bottom: 1px solid var(--card-border); }
.adm-low:last-child { border-bottom: none; }
.adm-low-pct { background: rgba(255,71,87,0.12); color: var(--danger);
  padding: 0.2rem 0.6rem; border-radius: 8px; font-size: 0.78rem; font-weight: 700; }

/* misc */
.adm-live { width: 7px; height: 7px; border-radius: 50%; background: var(--success);
  display: inline-block; animation: adm-pulse 2s infinite; }
.adm-refresh { background: var(--card-bg); border: 1px solid var(--card-border);
  border-radius: 8px; padding: 0.35rem 0.75rem; font-size: 0.72rem; cursor: pointer;
  color: var(--text-muted); display: flex; align-items: center; gap: 0.4rem;
  transition: all var(--tr); font-family: var(--font-body); }
.adm-refresh:hover { border-color: var(--accent); color: var(--accent); }
.adm-refresh svg { width: 12px; height: 12px; stroke: currentColor; fill: none;
  stroke-width: 2; stroke-linecap: round; }
.adm-sparkwrap { position: relative; height: 80px; margin-top: 0.5rem; }
.adm-sparkwrap canvas { width: 100%; height: 100%; }

@keyframes adm-pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.85)} }
@keyframes adm-up { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
.adm-anim { animation: adm-up 0.5s ease both; }

@media(max-width:1200px){.adm-stats{grid-template-columns:repeat(2,1fr)}.adm-g3{grid-template-columns:1fr 1fr}}
@media(max-width:800px){.adm-stats{grid-template-columns:1fr 1fr}.adm-g2,.adm-g3{grid-template-columns:1fr}}
`;

// ─── Component ────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [stats, setStats] = useState<Stats | null>(null);
  const [logs, setLogs] = useState<LoginLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [newLoginCount, setNewLoginCount] = useState(0);
  const [lastCount, setLastCount] = useState(0);

  const starsRef = useRef<HTMLCanvasElement>(null);
  const sparkRef = useRef<HTMLCanvasElement>(null);
  const sparkData = [72,75,68,80,85,78,90,88,85,92,87,91,83,86,89,93,88,85,87,91,89,94,90,92,88,85,89,93,91,95];

  useStarfield(starsRef as React.RefObject<HTMLCanvasElement>);
  useSparkline(sparkRef as React.RefObject<HTMLCanvasElement>, sparkData);

  // Fetch stats
  useEffect(() => {
    fetch('/api/admin/dashboard')
      .then(r => r.json())
      .then(d => { if (d.success) setStats(d.stats); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // Fetch login logs
  const fetchLogs = useCallback(async (isPolling = false) => {
    try {
      const res = await fetch('/api/admin/login-logs');
      const data = await res.json();
      if (data.success) {
        if (isPolling && data.logs.length > lastCount && lastCount > 0)
          setNewLoginCount(prev => prev + (data.logs.length - lastCount));
        setLastCount(data.logs.length);
        setLogs(data.logs);
      }
    } catch { /* ignore */ } finally { setLogsLoading(false); }
  }, [lastCount]);

  useEffect(() => {
    fetchLogs();
    const iv = setInterval(() => fetchLogs(true), 15000);
    return () => clearInterval(iv);
  }, []);

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  const todayLogs = logs.filter(l => {
    const d = new Date(l.loggedInAt), n = new Date();
    return d.getDate() === n.getDate() && d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear();
  });

  if (loading || !stats) {
    return (
      <div data-theme={theme} className="adm-root" style={{ display:'flex', alignItems:'center', justifyContent:'center' }}>
        <style>{STYLES}</style>
        <p style={{ fontFamily:'var(--font-display)', color:'var(--text-muted)', letterSpacing:'0.2em', fontSize:'0.85rem' }}>
          LOADING PORTAL…
        </p>
      </div>
    );
  }

  const podium = [...stats.leaderboard.slice(0, 3)];
  while (podium.length < 3) podium.push({ id: 'empty-' + podium.length, name: '-', roll: '-', percentage: 0 });

  return (
    <div data-theme={theme} className="adm-root">
      <style>{STYLES}</style>
      <canvas id="adm-stars" ref={starsRef} />

      <div className="adm-layout">
        {/* ── SIDEBAR ── */}
        <aside className="adm-sidebar">
          <div className="adm-logo">ATT</div>
          <button className="adm-nav active">
            <svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
            <span className="adm-tip">Dashboard</span>
          </button>
          <button className="adm-nav">
            <svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            <span className="adm-tip">Students</span>
          </button>
          <button className="adm-nav">
            <svg viewBox="0 0 24 24"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
            <span className="adm-tip">Attendance</span>
          </button>
          <button className="adm-nav">
            <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
            <span className="adm-tip">Schedule</span>
          </button>
          <button className="adm-nav">
            <svg viewBox="0 0 24 24"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>
            <span className="adm-tip">Reports</span>
          </button>
          <button className="adm-nav" style={{ marginTop:'auto' }}>
            <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>
            <span className="adm-tip">Settings</span>
          </button>
        </aside>

        {/* ── MAIN ── */}
        <div className="adm-main">
          {/* HEADER */}
          <header className="adm-header">
            <div className="adm-header-title">Portal · Dashboard</div>
            <div className="adm-hright">
              <span style={{ fontSize:'0.72rem', color:'var(--text-muted)' }}>
                {new Date().toLocaleDateString('en-IN', { weekday:'short', day:'numeric', month:'short', year:'numeric' })}
              </span>
              <button className="adm-toggle" onClick={toggleTheme} aria-label="Toggle theme" />
              <button className="adm-notif">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
                <div className="adm-ndot" />
              </button>
              <div className="adm-avatar">SA</div>
            </div>
          </header>

          {/* CONTENT */}
          <div className="adm-content">

            {/* THOUGHT */}
            <div className="adm-thought">
              <span style={{ fontSize:'1.2rem', opacity:0.8, flexShrink:0 }}>✦</span>
              <div className="adm-thought-text">
                <strong>Thought of the Day · </strong>
                "The function of education is to teach one to think intensively and to think critically.
                Intelligence plus character — that is the goal of true education." — Martin Luther King Jr.
              </div>
            </div>

            {/* STAT CARDS */}
            <div className="adm-stats">
              {[
                { label:'Total Enrolled', value: stats.totalStudents, icon:'🎓', badge:'Students', color:'var(--info)', bg:'rgba(112,161,255,0.1)', bar:65 },
                { label:'Total Teachers', value: stats.totalTeachers, icon:'👨‍🏫', badge:'Faculty', color:'var(--accent)', bg:'rgba(192,192,192,0.1)', bar:40 },
                { label:'Attendance Rate', value:`${stats.todayAttendancePercentage}%`, icon:'📊', badge:'Today', color:'var(--success)', bg:'rgba(46,213,115,0.1)', bar:stats.todayAttendancePercentage },
                { label:'Low Attendance', value: stats.lowAttendance.length, icon:'🚨', badge:'Alert', color:'var(--danger)', bg:'rgba(255,71,87,0.1)', bar: Math.round((stats.lowAttendance.length / Math.max(stats.totalStudents, 1)) * 100) },
              ].map(({ label, value, icon, badge, color, bg, bar }, i) => (
                <div key={label} className="adm-stat adm-anim" style={{ borderTop:`3px solid ${color}`, animationDelay:`${i * 0.08}s` }}>
                  <div className="adm-stat-top">
                    <div className="adm-stat-icon" style={{ background: bg }}>{icon}</div>
                    <span className="adm-stat-badge" style={{ background: bg, color }}>{badge}</span>
                  </div>
                  <div className="adm-stat-val" style={{ color }}>{value}</div>
                  <div className="adm-stat-lbl">{label}</div>
                  <div className="adm-stat-bar">
                    <div className="adm-stat-fill" style={{ width:`${bar}%`, background: color }} />
                  </div>
                </div>
              ))}
            </div>

            {/* LOGIN ACTIVITY */}
            <div className="adm-sec">Login Activity</div>
            <div className="adm-card adm-anim" style={{ marginBottom:'2rem' }}>
              <div className="adm-ch">
                <div style={{ display:'flex', alignItems:'center', gap:'0.6rem' }}>
                  <span className="adm-live" />
                  <span className="adm-ct">Real-time Monitoring</span>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
                  <span style={{ fontSize:'0.72rem', color:'var(--text-muted)' }}>
                    {todayLogs.length} logins today · {todayLogs.filter(l=>l.role==='teacher').length} teachers · {todayLogs.filter(l=>l.role==='admin').length} admins
                  </span>
                  {newLoginCount > 0 && (
                    <span style={{ background:'var(--danger)', color:'#fff', fontSize:'0.7rem', fontWeight:700, padding:'0.15rem 0.5rem', borderRadius:'20px' }}>
                      {newLoginCount} new
                    </span>
                  )}
                  <button className="adm-refresh" onClick={() => { setNewLoginCount(0); setLogsLoading(true); fetchLogs(); }}>
                    <svg viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
                    Refresh
                  </button>
                </div>
              </div>
              <div className="adm-cb" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'0.6rem' }}>
                {logsLoading ? (
                  <p style={{ color:'var(--text-muted)', fontSize:'0.85rem' }}>Loading activity…</p>
                ) : logs.length === 0 ? (
                  <p style={{ color:'var(--text-muted)', fontSize:'0.85rem' }}>No login activity yet.</p>
                ) : logs.slice(0, 6).map((log, idx) => {
                  const isTeacher = log.role === 'teacher';
                  const mobile = isMobileUA(log.userAgent);
                  return (
                    <div key={log.log_id} className="adm-login">
                      <div className="adm-la" style={{ background: isTeacher ? 'rgba(112,161,255,0.12)' : 'rgba(46,213,115,0.12)', color: isTeacher ? 'var(--info)' : 'var(--success)' }}>
                        {log.user_name.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ flex:1 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:'0.4rem', flexWrap:'wrap' }}>
                          <span className="adm-lname">{log.user_name}</span>
                          <span className="adm-role" style={{ background: isTeacher ? 'rgba(112,161,255,0.12)' : 'rgba(46,213,115,0.12)', color: isTeacher ? 'var(--info)' : 'var(--success)' }}>
                            {log.role.toUpperCase()}
                          </span>
                          {idx === 0 && <span style={{ fontSize:'0.6rem', background:'rgba(255,165,2,0.12)', color:'var(--warning)', padding:'0.1rem 0.4rem', borderRadius:'8px', fontWeight:600 }}>latest</span>}
                        </div>
                        <div className="adm-lmeta">{mobile ? '📱' : '🖥'} {mobile ? 'Mobile' : 'Desktop'} · {getBrowserName(log.userAgent)} · {log.ipAddress}</div>
                      </div>
                      <div className="adm-ltime">
                        <div style={{ fontWeight:600 }}>{timeAgo(log.loggedInAt)}</div>
                        <div>{new Date(log.loggedInAt).toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit', hour12:true })}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* TEACHER INFO */}
            <div className="adm-sec">Teacher Information</div>
            <div className="adm-g3">
              {/* Meetings */}
              <div className="adm-card adm-anim">
                <div className="adm-ch">
                  <span className="adm-ct">📅 Upcoming Meetings</span>
                  <span style={{ fontSize:'0.68rem', color:'var(--success)', background:'rgba(46,213,115,0.1)', padding:'0.2rem 0.5rem', borderRadius:'8px' }}>This Week</span>
                </div>
                <div className="adm-cb" style={{ paddingTop:'0.75rem' }}>
                  {[
                    { day:'Mon', time:'10:00', title:'Staff General Meeting', sub:'Seminar Hall B · All faculty', chip:'Mandatory', chipColor:'var(--info)', chipBg:'rgba(112,161,255,0.1)' },
                    { day:'Wed', time:'14:00', title:'Curriculum Review', sub:'Room 204 · CS Department', chip:'Dept-only', chipColor:'var(--success)', chipBg:'rgba(46,213,115,0.1)' },
                    { day:'Fri', time:'11:30', title:'Parent-Teacher Interaction', sub:'Main Auditorium · All parents', chip:'Important', chipColor:'var(--gold)', chipBg:'rgba(212,175,55,0.1)' },
                  ].map(m => (
                    <div key={m.title} className="adm-mtg">
                      <div className="adm-mtg-t">{m.day}<br/>{m.time}</div>
                      <div className="adm-mtg-body">
                        <div className="adm-mtg-title">{m.title}</div>
                        <div className="adm-mtg-sub">{m.sub}</div>
                        <span className="adm-chip" style={{ background: m.chipBg, color: m.chipColor }}>{m.chip}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Exam Duty */}
              <div className="adm-card adm-anim" style={{ animationDelay:'0.1s' }}>
                <div className="adm-ch">
                  <span className="adm-ct">📝 Exam Duty Chart</span>
                  <span style={{ fontSize:'0.68rem', color:'var(--warning)', background:'rgba(255,165,2,0.1)', padding:'0.2rem 0.5rem', borderRadius:'8px' }}>Mar 22–28</span>
                </div>
                <div className="adm-cb" style={{ paddingTop:'0.75rem' }}>
                  {[
                    { time:'Mon 09:00', subject:'Mathematics – I', room:'R-101' },
                    { time:'Tue 11:00', subject:'Data Structures', room:'R-205' },
                    { time:'Wed 09:00', subject:'DBMS', room:'R-301' },
                    { time:'Thu 14:00', subject:'Operating Systems', room:'R-102' },
                    { time:'Sat 10:00', subject:'Computer Networks', room:'R-204' },
                  ].map(d => (
                    <div key={d.subject} className="adm-duty">
                      <span className="adm-duty-t">{d.time}</span>
                      <span className="adm-duty-s">{d.subject}</span>
                      <span className="adm-duty-r">{d.room}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Events */}
              <div className="adm-card adm-anim" style={{ animationDelay:'0.2s' }}>
                <div className="adm-ch">
                  <span className="adm-ct">🏛 Events @ Block</span>
                  <span style={{ fontSize:'0.68rem', color:'var(--accent)', background:'rgba(192,192,192,0.1)', padding:'0.2rem 0.5rem', borderRadius:'8px' }}>March</span>
                </div>
                <div className="adm-cb" style={{ paddingTop:'0.75rem' }}>
                  {[
                    { dot:'var(--success)', label:'Mar 22 · Block A', title:'Annual Science Exhibition', sub:'Open to all departments · 10 AM – 4 PM' },
                    { dot:'var(--info)', label:'Mar 24 · Block B, Hall 2', title:'Inter-dept Quiz Competition', sub:'Registration by Mar 21 · Teams of 3' },
                    { dot:'var(--gold)', label:'Mar 26 · Block C Auditorium', title:'Cultural Fest – Crescendo \'26', sub:'Evening event · Faculty participation welcome' },
                    { dot:'var(--danger)', label:'Mar 28 · Admin Block', title:'Board Inspection Visit', sub:'All records to be updated by Mar 27' },
                  ].map(e => (
                    <div key={e.title} className="adm-info">
                      <div className="adm-edot" style={{ background: e.dot }} />
                      <div>
                        <div className="adm-info-lbl">{e.label}</div>
                        <div className="adm-info-val">{e.title}</div>
                        <div className="adm-info-sub">{e.sub}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ANALYTICS */}
            <div className="adm-sec">Analytics</div>
            <div className="adm-g2">
              {/* Dept bars */}
              <div className="adm-card adm-anim">
                <div className="adm-ch"><span className="adm-ct">Department-wise Attendance</span></div>
                <div className="adm-cb">
                  {(stats.departmentWise.length > 0 ? stats.departmentWise : [
                    { name:'Computer Science', present:78, absent:22 },
                    { name:'Mathematics', present:91, absent:9 },
                    { name:'Physics', present:65, absent:35 },
                    { name:'Chemistry', present:88, absent:12 },
                  ]).map(d => (
                    <div key={d.name}>
                      <div className="adm-dept-lbl"><span>{d.name}</span><span style={{ color:'var(--text)' }}>{d.present}% present</span></div>
                      <div className="adm-dept-track">
                        <div style={{ width:`${d.present}%`, background:'linear-gradient(90deg,var(--info),rgba(112,161,255,0.7))', height:'100%' }} />
                        <div style={{ width:`${d.absent}%`, background:'linear-gradient(90deg,rgba(255,71,87,0.7),rgba(255,71,87,0.4))', height:'100%' }} />
                      </div>
                    </div>
                  ))}
                  <div style={{ display:'flex', gap:'1rem', marginTop:'0.5rem' }}>
                    <span style={{ fontSize:'0.7rem', color:'var(--text-muted)', display:'flex', alignItems:'center', gap:'0.35rem' }}>
                      <span style={{ width:10, height:10, borderRadius:2, background:'var(--info)', display:'inline-block' }} /> Present
                    </span>
                    <span style={{ fontSize:'0.7rem', color:'var(--text-muted)', display:'flex', alignItems:'center', gap:'0.35rem' }}>
                      <span style={{ width:10, height:10, borderRadius:2, background:'var(--danger)', display:'inline-block' }} /> Absent
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
                {/* Top Performer */}
                <div className="adm-card adm-perf adm-anim" style={{ animationDelay:'0.1s' }}>
                  <div className="adm-perf-ring">🏆</div>
                  <div style={{ fontFamily:'var(--font-display)', fontSize:'1.3rem', fontWeight:700, marginTop:'0.75rem', marginBottom:'0.2rem' }}>
                    {podium[0].name !== '-' ? podium[0].name : 'N/A'}
                  </div>
                  <div style={{ fontSize:'0.78rem', color:'var(--text-muted)' }}>{podium[0].percentage}% Perfect Attendance</div>
                  <div style={{ display:'flex', justifyContent:'center', gap:'0.25rem', marginTop:'0.75rem', fontSize:'1.1rem' }}>⭐⭐⭐</div>
                </div>

                {/* Sparkline */}
                <div className="adm-card adm-anim" style={{ animationDelay:'0.15s' }}>
                  <div className="adm-ch"><span className="adm-ct">30-Day Trend</span></div>
                  <div className="adm-cb">
                    <div className="adm-sparkwrap"><canvas ref={sparkRef} /></div>
                  </div>
                </div>
              </div>
            </div>

            {/* LEADERBOARD + ACTION */}
            <div className="adm-g2b">
              <div className="adm-card adm-anim">
                <div className="adm-ch"><span className="adm-ct">Student Leaderboard</span></div>
                <div className="adm-cb">
                  {stats.leaderboard.map((s, idx) => {
                    const pctColor = s.percentage >= 90 ? 'var(--success)' : s.percentage >= 75 ? 'var(--warning)' : 'var(--danger)';
                    return (
                      <div key={s.id} className="adm-lb">
                        <span style={{ width:24, textAlign:'center', fontSize: idx < 3 ? '1rem' : '0.78rem', color:'var(--text-muted)' }}>
                          {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
                        </span>
                        <div className="adm-lb-av">{s.name.charAt(0)}</div>
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:'0.84rem', fontWeight:600 }}>{s.name}</div>
                          <div style={{ fontSize:'0.7rem', color:'var(--text-muted)' }}>Roll: {s.roll}</div>
                        </div>
                        <div className="adm-lb-track">
                          <div style={{ width:`${s.percentage}%`, height:'100%', background: pctColor, borderRadius:2 }} />
                        </div>
                        <span style={{ fontSize:'0.85rem', fontWeight:700, color: pctColor, minWidth:40, textAlign:'right' }}>{s.percentage}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="adm-card adm-anim" style={{ borderLeft:'3px solid var(--danger)', animationDelay:'0.1s' }}>
                <div className="adm-ch">
                  <span className="adm-ct" style={{ color:'var(--danger)' }}>⚠ Action Required</span>
                  <span style={{ fontSize:'0.68rem', color:'var(--danger)', background:'rgba(255,71,87,0.1)', padding:'0.2rem 0.5rem', borderRadius:'8px' }}>
                    {stats.lowAttendance.length} students
                  </span>
                </div>
                <div className="adm-cb">
                  {stats.lowAttendance.length === 0 ? (
                    <p style={{ color:'var(--text-muted)', fontSize:'0.85rem' }}>All students look good!</p>
                  ) : stats.lowAttendance.slice(0, 4).map(s => (
                    <div key={s.id} className="adm-low">
                      <div>
                        <div style={{ fontWeight:600, fontSize:'0.84rem' }}>{s.name}</div>
                        <div style={{ fontSize:'0.7rem', color:'var(--text-muted)' }}>{s.roll}</div>
                      </div>
                      <span className="adm-low-pct">{s.percentage}%</span>
                    </div>
                  ))}
                  <div style={{ marginTop:'1.25rem', padding:'1rem', background:'rgba(255,71,87,0.05)', borderRadius:10, border:'1px solid rgba(255,71,87,0.15)' }}>
                    <div style={{ fontSize:'0.72rem', color:'var(--danger)', fontWeight:600, marginBottom:'0.3rem' }}>⚡ Recommended Action</div>
                    <div style={{ fontSize:'0.75rem', color:'var(--text-muted)', lineHeight:1.6 }}>
                      Send attendance warnings to guardians. Students below 75% may be barred from exams as per institute policy.
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>{/* end content */}
        </div>{/* end main */}
      </div>{/* end layout */}
    </div>
  );
}