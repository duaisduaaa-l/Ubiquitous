'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Monitor, Smartphone, LogIn, RefreshCw, Download, ChevronRight, Users, Clock, Shield } from 'lucide-react';

interface LoginLog {
    log_id: string; user_name: string; user_email: string; role: string;
    loggedInAt: string; ipAddress: string; userAgent: string; user_id: string;
}
interface TeacherGroup {
    teacher_id: string; name: string; email: string;
    logs: LoginLog[]; lastLogin: string;
}

function timeAgo(d: string) {
    const diff = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}
function isMobile(ua: string) { return /Android|iPhone|iPad|iPod|Mobile/i.test(ua); }
function getBrowser(ua: string) {
    if (ua.includes('Chrome') && !ua.includes('Edg')) return 'Chrome';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
    if (ua.includes('Edg')) return 'Edge';
    return 'Browser';
}
function formatDate(d: string) {
    return new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
}

export default function LoginLogsPage() {
    const [logs, setLogs] = useState<LoginLog[]>([]);
    const [teachers, setTeachers] = useState<TeacherGroup[]>([]);
    const [selectedTeacher, setSelectedTeacher] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [logPage, setLogPage] = useState(1);
    const LOGS_PER_PAGE = 10;

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/login-logs');
            const data = await res.json();
            if (data.success) {
                setLogs(data.logs);
                // Group by teacher
                const teacherMap: Record<string, TeacherGroup> = {};
                data.logs.filter((l: LoginLog) => l.role === 'teacher').forEach((l: LoginLog) => {
                    if (!teacherMap[l.user_id]) {
                        teacherMap[l.user_id] = { teacher_id: l.user_id, name: l.user_name, email: l.user_email, logs: [], lastLogin: l.loggedInAt };
                    }
                    teacherMap[l.user_id].logs.push(l);
                });
                setTeachers(Object.values(teacherMap));
            }
        } catch { }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchLogs(); }, []);

    const exportToExcel = () => {
        const filtered = selectedTeacher
            ? logs.filter(l => l.user_id === selectedTeacher)
            : logs;
        const rows = [
            ['Name', 'Email', 'Role', 'Login Time', 'IP Address', 'Device', 'Browser'],
            ...filtered.map(l => [l.user_name, l.user_email, l.role, formatDate(l.loggedInAt), l.ipAddress, isMobile(l.userAgent) ? 'Mobile' : 'Desktop', getBrowser(l.userAgent)]),
        ];
        const csv = rows.map(r => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `login-logs-${selectedTeacher ? teachers.find(t => t.teacher_id === selectedTeacher)?.name : 'all'}-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const selectedTeacherData = selectedTeacher ? teachers.find(t => t.teacher_id === selectedTeacher) : null;
    const displayedLogs = selectedTeacher
        ? (selectedTeacherData?.logs || [])
        : logs.filter(l => l.role === 'teacher');
    const totalPages = Math.ceil(displayedLogs.length / LOGS_PER_PAGE);
    const pagedLogs = displayedLogs.slice((logPage - 1) * LOGS_PER_PAGE, logPage * LOGS_PER_PAGE);

    return (
        <div style={{ paddingBottom: '3rem' }}>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}} .tcard{transition:all .2s;cursor:pointer;border:1.5px solid var(--border-color);border-radius:12px;padding:1rem 1.25rem;} .tcard:hover{border-color:var(--primary-color);transform:translateY(-2px);} .tcard.selected{border-color:var(--primary-color);background:rgba(79,70,229,0.04);}`}</style>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Login Logs</h1>
                    <p style={{ color: 'var(--sidebar-text)', fontSize: '0.82rem', marginTop: '0.2rem' }}>Track all teacher and admin login activity</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button onClick={fetchLogs} style={{ background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.5rem 1rem', fontSize: '0.82rem', cursor: 'pointer', color: 'var(--text-color)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <RefreshCw size={14} /> Refresh
                    </button>
                    <button onClick={exportToExcel} className="btn-primary" style={{ fontSize: '0.82rem', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Download size={14} /> Export CSV
                    </button>
                </div>
            </div>

            {/* Summary cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                {[
                    { label: 'Total Logins', value: logs.length, icon: <LogIn size={20}/>, color: 'var(--primary-color)', bg: 'rgba(79,70,229,0.1)' },
                    { label: 'Today', value: logs.filter(l => { const d = new Date(l.loggedInAt), n = new Date(); return d.toDateString() === n.toDateString(); }).length, icon: <Clock size={20}/>, color: 'var(--success-color)', bg: 'rgba(16,185,129,0.1)' },
                    { label: 'Teachers', value: teachers.length, icon: <Users size={20}/>, color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
                    { label: 'Unique IPs', value: new Set(logs.map(l => l.ipAddress)).size, icon: <Shield size={20}/>, color: 'var(--warning-color)', bg: 'rgba(249,115,22,0.1)' },
                ].map(({ label, value, icon, color, bg }) => (
                    <div key={label} style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                        <div style={{ background: bg, borderRadius: '10px', padding: '0.6rem', color }}>{icon}</div>
                        <div><p style={{ fontSize: '1.6rem', fontWeight: 800, color, lineHeight: 1 }}>{value}</p><p style={{ fontSize: '0.75rem', color: 'var(--sidebar-text)', marginTop: '0.2rem' }}>{label}</p></div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '1.5rem' }}>
                {/* Teacher list */}
                <div>
                    <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--sidebar-text)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Teachers</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <div className={`tcard ${!selectedTeacher ? 'selected' : ''}`} onClick={() => { setSelectedTeacher(null); setLogPage(1); }}>
                            <p style={{ fontWeight: 600, fontSize: '0.88rem' }}>All Teachers</p>
                            <p style={{ fontSize: '0.75rem', color: 'var(--sidebar-text)', marginTop: '0.1rem' }}>{logs.filter(l=>l.role==='teacher').length} total logins</p>
                        </div>
                        {loading ? (
                            <div style={{ textAlign: 'center', padding: '1rem' }}>
                                <div style={{ width: 20, height: 20, border: '2px solid var(--border-color)', borderTop: '2px solid var(--primary-color)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
                            </div>
                        ) : teachers.map(t => (
                            <div key={t.teacher_id} className={`tcard ${selectedTeacher === t.teacher_id ? 'selected' : ''}`}
                                onClick={() => { setSelectedTeacher(t.teacher_id); setLogPage(1); }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(79,70,229,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary-color)', flexShrink: 0 }}>
                                        {t.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div style={{ minWidth: 0 }}>
                                        <p style={{ fontWeight: 600, fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.name}</p>
                                        <p style={{ fontSize: '0.72rem', color: 'var(--sidebar-text)' }}>{t.logs.length} logins · {timeAgo(t.lastLogin)}</p>
                                    </div>
                                    <ChevronRight size={14} color="var(--sidebar-text)" style={{ marginLeft: 'auto', flexShrink: 0 }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Logs table */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                        <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--sidebar-text)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                            {selectedTeacherData ? `${selectedTeacherData.name}'s Logins` : 'All Teacher Logins'}
                            <span style={{ marginLeft: '0.5rem', fontWeight: 400, textTransform: 'none' }}>({displayedLogs.length} records)</span>
                        </p>
                        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', fontSize: '0.78rem', color: 'var(--sidebar-text)' }}>
                            <button onClick={() => setLogPage(p => Math.max(1, p-1))} disabled={logPage === 1}
                                style={{ background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.25rem 0.6rem', cursor: logPage === 1 ? 'not-allowed' : 'pointer', opacity: logPage === 1 ? 0.5 : 1, color: 'var(--text-color)' }}>‹</button>
                            <span>Page {logPage} of {Math.max(1, totalPages)}</span>
                            <button onClick={() => setLogPage(p => Math.min(totalPages, p+1))} disabled={logPage >= totalPages}
                                style={{ background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.25rem 0.6rem', cursor: logPage >= totalPages ? 'not-allowed' : 'pointer', opacity: logPage >= totalPages ? 0.5 : 1, color: 'var(--text-color)' }}>›</button>
                        </div>
                    </div>

                    <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden' }}>
                        {loading ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '2rem', color: 'var(--sidebar-text)', fontSize: '0.85rem' }}>
                                <div style={{ width: 18, height: 18, border: '2px solid var(--border-color)', borderTop: '2px solid var(--primary-color)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                                Loading logs…
                            </div>
                        ) : pagedLogs.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--sidebar-text)' }}>
                                <LogIn size={32} color="var(--border-color)" style={{ margin: '0 auto 0.5rem', display: 'block' }} />
                                No login records found.
                            </div>
                        ) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                                        {['Teacher', 'Login Time', 'Device', 'Browser', 'IP Address'].map(h => (
                                            <th key={h} style={{ padding: '0.85rem 1rem', textAlign: 'left', fontSize: '0.72rem', color: 'var(--sidebar-text)', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase' }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {pagedLogs.map((log, i) => (
                                        <motion.tr key={log.log_id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                                            style={{ borderBottom: '1px solid var(--border-color)' }}
                                            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(79,70,229,0.02)')}
                                            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                                            <td style={{ padding: '0.85rem 1rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                                    <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(79,70,229,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary-color)', flexShrink: 0 }}>
                                                        {log.user_name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p style={{ fontWeight: 600, fontSize: '0.85rem' }}>{log.user_name}</p>
                                                        <p style={{ fontSize: '0.72rem', color: 'var(--sidebar-text)' }}>{log.user_email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '0.85rem 1rem' }}>
                                                <p style={{ fontSize: '0.82rem', fontWeight: 500 }}>{formatDate(log.loggedInAt)}</p>
                                                <p style={{ fontSize: '0.72rem', color: 'var(--sidebar-text)' }}>{timeAgo(log.loggedInAt)}</p>
                                            </td>
                                            <td style={{ padding: '0.85rem 1rem' }}>
                                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', background: isMobile(log.userAgent) ? 'rgba(59,130,246,0.08)' : 'rgba(79,70,229,0.08)', color: isMobile(log.userAgent) ? '#3b82f6' : 'var(--primary-color)', padding: '0.2rem 0.6rem', borderRadius: '20px', fontWeight: 500 }}>
                                                    {isMobile(log.userAgent) ? <Smartphone size={11}/> : <Monitor size={11}/>}
                                                    {isMobile(log.userAgent) ? 'Mobile' : 'Desktop'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '0.85rem 1rem', fontSize: '0.82rem', color: 'var(--text-color)' }}>{getBrowser(log.userAgent)}</td>
                                            <td style={{ padding: '0.85rem 1rem', fontSize: '0.78rem', color: 'var(--sidebar-text)', fontFamily: 'monospace' }}>{log.ipAddress}</td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}