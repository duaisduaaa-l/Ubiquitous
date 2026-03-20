'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Monitor, Smartphone, Download, Mail, BookOpen, Users, CalendarDays, Clock, LogIn, Award, CheckCircle, XCircle } from 'lucide-react';

interface Teacher { teacher_id: string; name: string; email: string; department: string; }
interface Schedule { schedule_id: string; dayOfWeek: string; startTime: string; endTime: string; subject: string; section: string; }
interface Student { student_id: string; name: string; roll_number: string; course: string; year: string; section: string; }
interface Attendance { attendance_id: string; student_id: string; status: string; date: string; }
interface LoginLog { log_id: string; loggedInAt: string; ipAddress: string; userAgent: string; }

function isMobile(ua: string) { return /Android|iPhone|iPad|iPod|Mobile/i.test(ua); }
function getBrowser(ua: string) {
    if (ua.includes('Chrome') && !ua.includes('Edg')) return 'Chrome';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
    return 'Browser';
}
function timeAgo(d: string) {
    const diff = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}
function fmtDate(d: string) {
    return new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
}

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

export default function TeacherProfilePage() {
    const params = useParams();
    const router = useRouter();
    const [teacher, setTeacher] = useState<Teacher | null>(null);
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [attendance, setAttendance] = useState<Attendance[]>([]);
    const [loginLogs, setLoginLogs] = useState<LoginLog[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeCard, setActiveCard] = useState<string | null>(null);
    const [logPage, setLogPage] = useState(1);
    const LOGS_PER_PAGE = 10;

    useEffect(() => {
        if (!params.id) return;
        fetch(`/api/admin/teacher-profile?teacher_id=${params.id}`)
            .then(r => r.json())
            .then(data => {
                if (data.success) {
                    setTeacher(data.teacher);
                    setSchedules(data.schedules);
                    setStudents(data.students);
                    setAttendance(data.attendance);
                    setLoginLogs(data.loginLogs);
                    setStats(data.stats);
                }
                setLoading(false);
            }).catch(() => setLoading(false));
    }, [params.id]);

    const exportLogs = () => {
        const rows = [['Login Time','Device','Browser','IP'],
            ...loginLogs.map(l => [fmtDate(l.loggedInAt), isMobile(l.userAgent)?'Mobile':'Desktop', getBrowser(l.userAgent), l.ipAddress])];
        const csv = rows.map(r => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
        a.download = `${teacher?.name}-logins.csv`; a.click();
    };

    const exportStudents = () => {
        const rows = [['Roll No','Name','Course','Year','Section'],
            ...students.map(s => [s.roll_number, s.name, s.course, s.year, s.section])];
        const csv = rows.map(r => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
        a.download = `${teacher?.name}-students.csv`; a.click();
    };

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ width: 36, height: 36, border: '3px solid var(--border-color)', borderTop: '3px solid var(--primary-color)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            <p style={{ color: 'var(--sidebar-text)' }}>Loading teacher profile…</p>
        </div>
    );

    if (!teacher) return <p style={{ padding: '2rem', color: 'var(--danger-color)' }}>Teacher not found.</p>;

    const pagedLogs = loginLogs.slice((logPage-1)*LOGS_PER_PAGE, logPage*LOGS_PER_PAGE);
    const totalLogPages = Math.ceil(loginLogs.length / LOGS_PER_PAGE);

    // Student attendance summary
    const studentAttendance = students.map(s => {
        const records = attendance.filter(a => a.student_id === s.student_id);
        const present = records.filter(a => a.status === 'Present').length;
        const pct = records.length > 0 ? Math.round((present/records.length)*100) : 0;
        return { ...s, total: records.length, present, pct };
    });

    const CARDS = [
        { id: 'profile', label: 'Profile', icon: <Award size={18}/>, color: 'var(--primary-color)', bg: 'rgba(79,70,229,0.08)' },
        { id: 'schedule', label: 'Schedule', icon: <CalendarDays size={18}/>, color: '#3b82f6', bg: 'rgba(59,130,246,0.08)' },
        { id: 'students', label: `Students (${students.length})`, icon: <Users size={18}/>, color: 'var(--success-color)', bg: 'rgba(16,185,129,0.08)' },
        { id: 'attendance', label: 'Attendance', icon: <CheckCircle size={18}/>, color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
        { id: 'logins', label: `Login Logs (${loginLogs.length})`, icon: <LogIn size={18}/>, color: 'var(--warning-color)', bg: 'rgba(249,115,22,0.08)' },
    ];

    return (
        <div style={{ paddingBottom: '3rem' }}>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}} .pcard{transition:all .2s ease;cursor:pointer;} .pcard:hover{transform:translateY(-3px);}`}</style>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <button onClick={() => router.back()} style={{ background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '0.5rem 0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.82rem', color: 'var(--text-color)' }}>
                    <ArrowLeft size={15}/> Back
                </button>
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em' }}>{teacher.name}</h1>
                    <p style={{ color: 'var(--sidebar-text)', fontSize: '0.8rem' }}>{teacher.department} Department · {teacher.email}</p>
                </div>
            </div>

            {/* Quick stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                {[
                    { label: 'Students', value: stats.totalStudents, color: 'var(--primary-color)', bg: 'rgba(79,70,229,0.08)' },
                    { label: 'Classes taken', value: stats.totalClasses, color: '#3b82f6', bg: 'rgba(59,130,246,0.08)' },
                    { label: 'Attendance records', value: stats.totalRecords, color: 'var(--success-color)', bg: 'rgba(16,185,129,0.08)' },
                    { label: 'Total logins', value: loginLogs.length, color: 'var(--warning-color)', bg: 'rgba(249,115,22,0.08)' },
                ].map(({ label, value, color, bg }) => (
                    <div key={label} style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.25rem', borderTop: `3px solid ${color}` }}>
                        <p style={{ fontSize: '1.8rem', fontWeight: 800, color, lineHeight: 1 }}>{value}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--sidebar-text)', marginTop: '0.25rem' }}>{label}</p>
                    </div>
                ))}
            </div>

            {/* Card navigation */}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                {CARDS.map(card => (
                    <button key={card.id} className="pcard"
                        onClick={() => setActiveCard(activeCard === card.id ? null : card.id)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem', borderRadius: '10px', border: `1.5px solid ${activeCard === card.id ? card.color : 'var(--border-color)'}`, background: activeCard === card.id ? card.bg : 'var(--card-bg)', color: activeCard === card.id ? card.color : 'var(--text-color)', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}>
                        {card.icon}{card.label}
                    </button>
                ))}
            </div>

            {/* Profile card */}
            {(activeCard === 'profile' || activeCard === null) && (
                <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} className="card" style={{ padding: '1.5rem', marginBottom: '1.25rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Award size={16} color="var(--primary-color)"/> Teacher Profile</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                        {[['Full Name', teacher.name], ['Email', teacher.email], ['Department', teacher.department], ['Total Subjects', [...new Set(schedules.map(s=>s.subject))].length], ['Sections', [...new Set(schedules.map(s=>s.section))].join(', ') || '—'], ['Working Days', [...new Set(schedules.map(s=>s.dayOfWeek))].length]].map(([label, value]) => (
                            <div key={label} style={{ background: 'var(--input-bg)', borderRadius: '8px', padding: '0.85rem 1rem' }}>
                                <p style={{ fontSize: '0.72rem', color: 'var(--sidebar-text)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.3rem' }}>{label}</p>
                                <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{value || '—'}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Schedule card */}
            {(activeCard === 'schedule' || activeCard === null) && (
                <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} className="card" style={{ padding: '1.5rem', marginBottom: '1.25rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CalendarDays size={16} color="#3b82f6"/> Weekly Schedule</h3>
                    {schedules.length === 0 ? <p style={{ color: 'var(--sidebar-text)', fontSize: '0.85rem' }}>No schedule assigned.</p> : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
                            {schedules.map(s => (
                                <div key={s.schedule_id} style={{ background: 'var(--input-bg)', borderRadius: '10px', padding: '0.9rem 1rem', borderLeft: '3px solid #3b82f6' }}>
                                    <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.dayOfWeek}</p>
                                    <p style={{ fontWeight: 700, fontSize: '0.92rem', marginTop: '0.25rem' }}>{s.subject}</p>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--sidebar-text)', marginTop: '0.15rem' }}>Section {s.section} · {s.startTime}–{s.endTime}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>
            )}

            {/* Students card */}
            {(activeCard === 'students' || activeCard === null) && (
                <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} className="card" style={{ padding: '1.5rem', marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Users size={16} color="var(--success-color)"/> Students ({students.length})</h3>
                        <button onClick={exportStudents} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', color: 'var(--success-color)', borderRadius: '8px', padding: '0.35rem 0.75rem', cursor: 'pointer', fontWeight: 600 }}>
                            <Download size={12}/> Export CSV
                        </button>
                    </div>
                    {students.length === 0 ? <p style={{ color: 'var(--sidebar-text)', fontSize: '0.85rem' }}>No students enrolled.</p> : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead><tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                                    {['Roll No','Name','Course','Year','Section','Attendance'].map(h => <th key={h} style={{ padding: '0.7rem 0.85rem', textAlign: 'left', fontSize: '0.72rem', color: 'var(--sidebar-text)', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase' }}>{h}</th>)}
                                </tr></thead>
                                <tbody>
                                    {studentAttendance.map(s => (
                                        <tr key={s.student_id} style={{ borderBottom: '1px solid var(--border-color)' }}
                                            onMouseEnter={e=>(e.currentTarget.style.background='rgba(79,70,229,0.02)')}
                                            onMouseLeave={e=>(e.currentTarget.style.background='transparent')}>
                                            <td style={{ padding: '0.75rem 0.85rem', fontWeight: 700, color: 'var(--primary-color)', fontSize: '0.82rem' }}>{s.roll_number}</td>
                                            <td style={{ padding: '0.75rem 0.85rem', fontWeight: 500, fontSize: '0.85rem' }}>{s.name}</td>
                                            <td style={{ padding: '0.75rem 0.85rem', fontSize: '0.82rem', color: 'var(--sidebar-text)' }}>{s.course}</td>
                                            <td style={{ padding: '0.75rem 0.85rem', fontSize: '0.82rem', color: 'var(--sidebar-text)' }}>{s.year}</td>
                                            <td style={{ padding: '0.75rem 0.85rem', fontSize: '0.82rem', color: 'var(--sidebar-text)' }}>{s.section}</td>
                                            <td style={{ padding: '0.75rem 0.85rem' }}>
                                                {s.total > 0 ? (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                                        <div style={{ flex: 1, height: 5, background: 'var(--border-color)', borderRadius: 3, minWidth: 60 }}>
                                                            <div style={{ width: `${s.pct}%`, height: '100%', background: s.pct >= 75 ? 'var(--success-color)' : 'var(--danger-color)', borderRadius: 3 }}/>
                                                        </div>
                                                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: s.pct >= 75 ? 'var(--success-color)' : 'var(--danger-color)', minWidth: 34 }}>{s.pct}%</span>
                                                    </div>
                                                ) : <span style={{ fontSize: '0.75rem', color: 'var(--sidebar-text)' }}>No data</span>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </motion.div>
            )}

            {/* Attendance records card */}
            {(activeCard === 'attendance' || activeCard === null) && (
                <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} className="card" style={{ padding: '1.5rem', marginBottom: '1.25rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle size={16} color="#f59e0b"/> Recent Attendance Records</h3>
                    {attendance.length === 0 ? <p style={{ color: 'var(--sidebar-text)', fontSize: '0.85rem' }}>No attendance records yet.</p> : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.6rem', maxHeight: 280, overflowY: 'auto' }}>
                            {[...new Set(attendance.map(a => a.date.toString().slice(0,10)))].slice(0,20).map(date => {
                                const dayRecs = attendance.filter(a => a.date.toString().slice(0,10) === date);
                                const present = dayRecs.filter(a => a.status === 'Present').length;
                                const pct = Math.round((present/dayRecs.length)*100);
                                return (
                                    <div key={date} style={{ background: 'var(--input-bg)', borderRadius: '8px', padding: '0.75rem 0.9rem', borderLeft: `3px solid ${pct >= 75 ? 'var(--success-color)' : 'var(--danger-color)'}` }}>
                                        <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--sidebar-text)' }}>{new Date(date+'T12:00:00').toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})}</p>
                                        <p style={{ fontSize: '1rem', fontWeight: 800, marginTop: '0.2rem', color: pct >= 75 ? 'var(--success-color)' : 'var(--danger-color)' }}>{pct}%</p>
                                        <p style={{ fontSize: '0.7rem', color: 'var(--sidebar-text)' }}>{present}/{dayRecs.length} present</p>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </motion.div>
            )}

            {/* Login logs card */}
            {(activeCard === 'logins' || activeCard === null) && (
                <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} className="card" style={{ padding: '1.5rem', marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}><LogIn size={16} color="var(--warning-color)"/> Login History ({loginLogs.length})</h3>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <button onClick={() => setLogPage(p => Math.max(1,p-1))} disabled={logPage===1}
                                style={{ background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.25rem 0.6rem', cursor: logPage===1?'not-allowed':'pointer', opacity: logPage===1?.5:1, color: 'var(--text-color)', fontSize: '0.82rem' }}>‹</button>
                            <span style={{ fontSize: '0.78rem', color: 'var(--sidebar-text)' }}>Page {logPage}/{Math.max(1,totalLogPages)}</span>
                            <button onClick={() => setLogPage(p => Math.min(totalLogPages,p+1))} disabled={logPage>=totalLogPages}
                                style={{ background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.25rem 0.6rem', cursor: logPage>=totalLogPages?'not-allowed':'pointer', opacity: logPage>=totalLogPages?.5:1, color: 'var(--text-color)', fontSize: '0.82rem' }}>›</button>
                            <button onClick={exportLogs} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)', color: 'var(--warning-color)', borderRadius: '8px', padding: '0.35rem 0.75rem', cursor: 'pointer', fontWeight: 600 }}>
                                <Download size={12}/> Export
                            </button>
                        </div>
                    </div>
                    {loginLogs.length === 0 ? <p style={{ color: 'var(--sidebar-text)', fontSize: '0.85rem' }}>No login records yet.</p> : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {pagedLogs.map((log, i) => (
                                <div key={log.log_id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 0.9rem', background: 'var(--input-bg)', borderRadius: '8px' }}>
                                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(249,115,22,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--warning-color)', flexShrink: 0 }}>
                                        {isMobile(log.userAgent) ? <Smartphone size={14}/> : <Monitor size={14}/>}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>{fmtDate(log.loggedInAt)}</p>
                                        <p style={{ fontSize: '0.72rem', color: 'var(--sidebar-text)' }}>{isMobile(log.userAgent)?'Mobile':'Desktop'} · {getBrowser(log.userAgent)} · {log.ipAddress}</p>
                                    </div>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--sidebar-text)', flexShrink: 0 }}>{timeAgo(log.loggedInAt)}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>
            )}
        </div>
    );
}