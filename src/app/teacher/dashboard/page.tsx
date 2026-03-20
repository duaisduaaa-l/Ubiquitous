'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { AlertTriangle, Medal, Star, MoreVertical, BookOpen, Clock, Download, ChevronDown } from 'lucide-react';

interface DashboardStats {
    totalStudents: number;
    presentToday: number;
    absentToday: number;
    chartData: { date: string; present: number; absent: number }[];
    leaderboard: { id: string; name: string; roll: string; percentage: number; total: number }[];
    riskyStudents: { id: string; name: string; roll: string; percentage: number; total: number; present: number }[];
}

export default function TeacherDashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchDashboardStats = async () => {
        try {
            const resContext = await fetch('/api/teacher/me');
            const dataContext = await resContext.json();
            if (dataContext.success && dataContext.user) {
                const res = await fetch(`/api/teacher/dashboard?teacher_id=${dataContext.user.id}`);
                const data = await res.json();
                if (data.success) {
                    setStats(data.stats);
                }
            }
        } catch { }
        setLoading(false);
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchDashboardStats();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (loading || !stats) {
        return <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}><p>Loading Dashboard...</p></div>;
    }

    // Helper mini-calendar
    const currentDate = new Date();
    const currentMonth = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    const currentDay = currentDate.getDate();

    const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    const blanks = Array.from({ length: firstDayOfMonth }, () => null);
    const dates = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const calendarGrid = [...blanks, ...dates];

    return (
        <div style={{ paddingBottom: '3rem' }}>

            <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '2rem' }}>

                {/* LEFT COLUMN */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                    {/* Section 1: Course Overview (Live Stats) */}
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Class Overview</h2>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <span style={{ fontSize: '0.85rem', color: 'var(--sidebar-text)', cursor: 'pointer', border: '1px solid var(--border-color)', padding: '0.3rem 0.8rem', borderRadius: '4px' }}>In progress <ChevronDown size={14} style={{ display: 'inline' }} /></span>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                            {/* Card 1 */}
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ padding: '1rem', borderTop: '4px solid var(--primary-color)' }}>
                                <div style={{ height: '100px', backgroundColor: '#f1f5f9', borderRadius: '8px', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <BookOpen size={32} color="#94a3b8" />
                                </div>
                                <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Total Enrolled</h3>
                                <p style={{ color: 'var(--sidebar-text)', fontSize: '0.85rem' }}>Active Semester • {stats.totalStudents} Students</p>
                            </motion.div>
                            {/* Card 2 */}
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card" style={{ padding: '1rem', borderTop: '4px solid var(--success-color)' }}>
                                <div style={{ height: '100px', backgroundColor: '#ecfdf5', borderRadius: '8px', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Clock size={32} color="var(--success-color)" />
                                </div>
                                <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Present Today</h3>
                                <p style={{ color: 'var(--sidebar-text)', fontSize: '0.85rem' }}>Campus log • {stats.presentToday} checked in</p>
                            </motion.div>
                            {/* Card 3 */}
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card" style={{ padding: '1rem', borderTop: '4px solid var(--danger-color)' }}>
                                <div style={{ height: '100px', backgroundColor: '#fef2f2', borderRadius: '8px', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <AlertTriangle size={32} color="var(--danger-color)" />
                                </div>
                                <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Absent Today</h3>
                                <p style={{ color: 'var(--sidebar-text)', fontSize: '0.85rem' }}>Campus log • {stats.absentToday} marked off</p>
                            </motion.div>
                        </div>
                    </div>

                    {/* Section 2: Attendance Chart representing Upcoming Events aesthetics */}
                    <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Weekly Attendance Trends</h2>
                            <MoreVertical size={18} color="var(--sidebar-text)" cursor="pointer" />
                        </div>
                        <div style={{ height: '220px', width: '100%' }}>
                            {stats.chartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={stats.chartData}>
                                        <XAxis dataKey="date" stroke="var(--sidebar-text)" fontSize={12} tickLine={false} axisLine={false} />
                                        <Tooltip cursor={{ fill: 'rgba(67, 24, 255, 0.05)' }} contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                                        <Bar dataKey="present" fill="var(--success-color)" radius={[4, 4, 4, 4]} name="Present" barSize={12} />
                                        <Bar dataKey="absent" fill="var(--danger-color)" radius={[4, 4, 4, 4]} name="Absent" barSize={12} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <p style={{ color: 'var(--sidebar-text)' }}>No attendance data plotted yet.</p>
                            )}
                        </div>
                    </div>

                    {/* Section 3: Private Files / Recent Forums -> Gamified Leaderboard */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Perfect Attendance Board</h2>
                        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead style={{ backgroundColor: 'var(--primary-color)' }}>
                                    <tr>
                                        <th style={{ color: '#fff', padding: '1rem', textAlign: 'left', fontSize: '0.85rem' }}>Ranking Name</th>
                                        <th style={{ color: '#fff', padding: '1rem', textAlign: 'left', fontSize: '0.85rem' }}>Status</th>
                                        <th style={{ color: '#fff', padding: '1rem', textAlign: 'left', fontSize: '0.85rem' }}>Percentage</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats.leaderboard.length > 0 ? stats.leaderboard.map((ls, idx) => {
                                        let badgeColor = '#94a3b8'; let icon = <Star size={16} />;
                                        if (idx === 0) { badgeColor = '#f59e0b'; icon = <Medal size={16} />; }
                                        else if (idx === 1) { badgeColor = '#cbd5e1'; icon = <Medal size={16} />; }
                                        else if (idx === 2) { badgeColor = '#b45309'; icon = <Medal size={16} />; }

                                        return (
                                            <tr key={ls.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                                <td style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', fontWeight: 600 }}>
                                                    <div style={{ background: 'rgba(0,0,0,0.05)', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: badgeColor }}>
                                                        {icon}
                                                    </div>
                                                    {ls.name}
                                                </td>
                                                <td style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--sidebar-text)' }}>ACTIVE</td>
                                                <td style={{ padding: '1rem' }}>
                                                    <span style={{ backgroundColor: '#ecfdf5', color: 'var(--success-color)', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 600 }}>{ls.percentage}%</span>
                                                </td>
                                            </tr>
                                        )
                                    }) : (
                                        <tr><td colSpan={3} style={{ padding: '1rem', textAlign: 'center' }}>Not enough data</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>

                {/* RIGHT COLUMN */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                    {/* AI Alerts (To-Do List visual) */}
                    <div className="card" style={{ padding: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>AI Low Alerts</h2>
                            <MoreVertical size={18} color="var(--sidebar-text)" cursor="pointer" />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {stats.riskyStudents.length > 0 ? stats.riskyStudents.map(rs => (
                                <div key={rs.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--warning-color)' }}></div>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>{rs.name} ({rs.roll})</p>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--sidebar-text)' }}>Drops to {Math.round((rs.present / (rs.total + 3)) * 100)}% if absent soon.</p>
                                    </div>
                                </div>
                            )) : (
                                <p style={{ fontSize: '0.9rem', color: 'var(--sidebar-text)' }}>No low attendance alerts active.</p>
                            )}
                        </div>
                        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                            <button style={{ background: 'transparent', border: 'none', color: 'var(--sidebar-text)', fontSize: '0.85rem' }}>See all alerts <ChevronDown size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /></button>
                        </div>
                    </div>

                    {/* Calendar Widget */}
                    <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 auto' }}>Calendar</h2>
                        </div>
                        <div style={{ width: '100%', textAlign: 'center', marginBottom: '1rem', fontSize: '0.9rem', fontWeight: 600 }}>{currentMonth} <ChevronDown size={14} style={{ display: 'inline' }} /></div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem', width: '100%', textAlign: 'center', marginBottom: '0.5rem' }}>
                            {days.map(d => <div key={d} style={{ fontSize: '0.75rem', color: 'var(--sidebar-text)', fontWeight: 600 }}>{d}</div>)}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem', width: '100%', textAlign: 'center' }}>
                            {calendarGrid.map((d, i) => (
                                <div key={i} style={{
                                    padding: '0.4rem', fontSize: '0.85rem', fontWeight: 500, borderRadius: '50%',
                                    backgroundColor: d === currentDay ? 'var(--primary-color)' : 'transparent',
                                    color: d === currentDay ? '#fff' : 'var(--text-color)',
                                    cursor: d ? 'pointer' : 'default'
                                }}>
                                    {d || ''}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Course Files */}
                    <div className="card" style={{ padding: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Quick Export</h2>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.8rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--primary-color)' }}></div>
                            <div style={{ flex: 1 }}>
                                <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{currentMonth} Report.pdf</p>
                            </div>
                            <Download size={16} color="var(--primary-color)" style={{ cursor: 'pointer' }} />
                        </div>
                        <div style={{ marginTop: '1rem', textAlign: 'left' }}>
                            <button style={{ background: 'transparent', border: 'none', color: 'var(--sidebar-text)', fontSize: '0.85rem', padding: 0 }}>See all files <ChevronDown size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /></button>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}
