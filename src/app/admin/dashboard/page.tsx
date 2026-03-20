'use client';

import { useEffect, useState } from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { Users, GraduationCap, AlertCircle, Percent, Trophy, TrendingUp, ChevronDown, Award, Star } from 'lucide-react';

interface Stats {
    totalTeachers: number;
    totalStudents: number;
    todayAttendancePercentage: number;
    monthlyTrend: { date: string, percentage: number }[];
    leaderboard: { id: string, name: string, roll: string, percentage: number }[];
    lowAttendance: { id: string, name: string, roll: string, percentage: number, total: number }[];
    departmentWise: { name: string, present: number, absent: number }[];
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/admin/dashboard').then(res => res.json()).then(data => {
            if (data.success) {
                setStats(data.stats);
            }
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    if (loading || !stats) return <p style={{ padding: '2rem' }}>Loading Portal Metrics...</p>;

    // Ensure leaderboard has at least 3 items to render podium, pad with blanks if needed
    const podium = stats.leaderboard.slice(0, 3);
    while (podium.length < 3) podium.push({ id: 'empty-' + podium.length, name: '-', roll: '-', percentage: 0 });

    return (
        <div style={{ paddingBottom: '3rem' }}>

            {/* Top 4 Quick Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                <motion.div className="card" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', borderTop: '4px solid var(--primary-color)' }}>
                    <div style={{ backgroundColor: 'rgba(79, 70, 229, 0.1)', padding: '1rem', borderRadius: '50%', color: 'var(--primary-color)' }}>
                        <GraduationCap size={28} />
                    </div>
                    <div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--sidebar-text)', fontWeight: 600, textTransform: 'uppercase' }}>Total Students 🎓</p>
                        <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>{stats.totalStudents}</h2>
                    </div>
                </motion.div>

                <motion.div className="card" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', borderTop: '4px solid #3b82f6' }}>
                    <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: '1rem', borderRadius: '50%', color: '#3b82f6' }}>
                        <Users size={28} />
                    </div>
                    <div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--sidebar-text)', fontWeight: 600, textTransform: 'uppercase' }}>Total Teachers 👨‍🏫</p>
                        <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>{stats.totalTeachers}</h2>
                    </div>
                </motion.div>

                <motion.div className="card" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', borderTop: '4px solid var(--success-color)' }}>
                    <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '1rem', borderRadius: '50%', color: 'var(--success-color)' }}>
                        <Percent size={28} />
                    </div>
                    <div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--sidebar-text)', fontWeight: 600, textTransform: 'uppercase' }}>Today Auth % 📊</p>
                        <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>{stats.todayAttendancePercentage}%</h2>
                    </div>
                </motion.div>

                <motion.div className="card" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', borderTop: '4px solid var(--danger-color)' }}>
                    <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '1rem', borderRadius: '50%', color: 'var(--danger-color)' }}>
                        <AlertCircle size={28} />
                    </div>
                    <div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--sidebar-text)', fontWeight: 600, textTransform: 'uppercase' }}>Low Attend 🚨</p>
                        <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>{stats.lowAttendance.length}</h2>
                    </div>
                </motion.div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: '2rem' }}>

                {/* Left Side Container */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                    {/* The Podium Leaderboard (Dribbble Replica) */}
                    <div className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)' }}>
                            <div>
                                <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Global Leaderboard</h2>
                                <p style={{ fontSize: '0.85rem', color: 'var(--sidebar-text)' }}>Top performing students globally</p>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button style={{ backgroundColor: 'var(--primary-color)', color: '#fff', borderRadius: '6px', fontSize: '0.85rem', padding: '0.5rem 1rem' }}>This Month</button>
                                <button style={{ backgroundColor: 'transparent', border: '1px solid var(--border-color)', color: 'var(--sidebar-text)', borderRadius: '6px', fontSize: '0.85rem', padding: '0.5rem 1rem' }}>All Time</button>
                            </div>
                        </div>

                        {/* Podium Box Container */}
                        <div style={{ padding: '3rem 2rem 0', background: 'linear-gradient(180deg, var(--primary-color) 0%, var(--primary-hover) 100%)', display: 'flex', justifyContent: 'center', alignItems: 'flex-end', height: '300px' }}>

                            {/* Rank 2 */}
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '30%' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1rem' }}>
                                    <div style={{ width: 60, height: 60, borderRadius: '50%', backgroundColor: '#fff', border: '3px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                                        <span style={{ fontSize: '1.5rem' }}>🧑</span>
                                        <div style={{ position: 'absolute', bottom: -5, background: '#cbd5e1', color: '#000', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '10px', fontWeight: 700 }}>#2</div>
                                    </div>
                                    <p style={{ color: '#fff', fontWeight: 600, marginTop: '0.5rem', fontSize: '0.9rem' }}>{podium[1].name !== '-' ? podium[1].name : 'N/A'}</p>
                                    <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem' }}>{podium[1].percentage}%</p>
                                </div>
                                <motion.div initial={{ height: 0 }} animate={{ height: 100 }} style={{ width: '80%', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', borderTopLeftRadius: '10px', borderTopRightRadius: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', border: '1px solid rgba(255,255,255,0.2)', borderBottom: 'none' }}>
                                    <span style={{ color: '#fff', fontSize: '2rem', fontWeight: 800 }}>2</span>
                                </motion.div>
                            </div>

                            {/* Rank 1 */}
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '35%' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1rem' }}>
                                    <div style={{ width: 80, height: 80, borderRadius: '50%', backgroundColor: '#fff', border: '4px solid #f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', boxShadow: '0 10px 25px rgba(245, 158, 11, 0.4)' }}>
                                        <span style={{ fontSize: '2.5rem' }}>👨‍🎓</span>
                                        <div style={{ position: 'absolute', bottom: -5, background: '#f59e0b', color: '#fff', fontSize: '0.75rem', padding: '2px 8px', borderRadius: '10px', fontWeight: 800 }}>#1</div>
                                    </div>
                                    <p style={{ color: '#fff', fontWeight: 800, marginTop: '0.5rem', fontSize: '1.1rem' }}>{podium[0].name !== '-' ? podium[0].name : 'N/A'}</p>
                                    <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', fontWeight: 600 }}>{podium[0].percentage}% perfect</p>
                                </div>
                                <motion.div initial={{ height: 0 }} animate={{ height: 140 }} style={{ width: '90%', background: 'rgba(255,255,255,0.25)', backdropFilter: 'blur(15px)', borderTopLeftRadius: '10px', borderTopRightRadius: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', border: '1px solid rgba(255,255,255,0.3)', borderBottom: 'none', boxShadow: '0 -10px 30px rgba(0,0,0,0.1)' }}>
                                    <span style={{ color: '#fff', fontSize: '3rem', fontWeight: 800 }}>1</span>
                                </motion.div>
                            </div>

                            {/* Rank 3 */}
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '30%' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1rem' }}>
                                    <div style={{ width: 60, height: 60, borderRadius: '50%', backgroundColor: '#fff', border: '3px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                                        <span style={{ fontSize: '1.5rem' }}>👩</span>
                                        <div style={{ position: 'absolute', bottom: -5, background: '#b45309', color: '#fff', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '10px', fontWeight: 700 }}>#3</div>
                                    </div>
                                    <p style={{ color: '#fff', fontWeight: 600, marginTop: '0.5rem', fontSize: '0.9rem' }}>{podium[2].name !== '-' ? podium[2].name : 'N/A'}</p>
                                    <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem' }}>{podium[2].percentage}%</p>
                                </div>
                                <motion.div initial={{ height: 0 }} animate={{ height: 80 }} style={{ width: '80%', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(5px)', borderTopLeftRadius: '10px', borderTopRightRadius: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', border: '1px solid rgba(255,255,255,0.15)', borderBottom: 'none' }}>
                                    <span style={{ color: '#fff', fontSize: '2rem', fontWeight: 800 }}>3</span>
                                </motion.div>
                            </div>
                        </div>

                        {/* Rest of Leaderboard List */}
                        <div style={{ padding: '0 1.5rem' }}>
                            {stats.leaderboard.length > 3 ? stats.leaderboard.slice(3).map((student, idx) => (
                                <div key={student.id} style={{ display: 'flex', alignItems: 'center', padding: '1.2rem 0', borderBottom: '1px solid var(--border-color)' }}>
                                    <div style={{ width: '30px', fontWeight: 600, color: 'var(--sidebar-text)' }}>{idx + 4}</div>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '1rem' }}>
                                        {student.name.charAt(0)}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ fontWeight: 600 }}>{student.name}</p>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--sidebar-text)' }}>Roll: {student.roll} • Global Standing</p>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success-color)' }}>
                                        <TrendingUp size={16} /> <span style={{ fontWeight: 600 }}>{student.percentage}%</span>
                                    </div>
                                </div>
                            )) : (
                                <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--sidebar-text)' }}>No further rankings.</p>
                            )}
                        </div>
                        <div style={{ padding: '1rem', textAlign: 'center', borderTop: '1px solid var(--border-color)' }}>
                            <span style={{ fontSize: '0.9rem', color: 'var(--primary-color)', fontWeight: 600, cursor: 'pointer' }}>View All Students <ChevronDown size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /></span>
                        </div>
                    </div>

                    {/* Department Wise Attendance */}
                    <div className="card" style={{ padding: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem' }}>Department-wise Attendance</h2>
                        <div style={{ height: '300px', width: '100%' }}>
                            {stats.departmentWise.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={stats.departmentWise}>
                                        <XAxis dataKey="name" stroke="var(--sidebar-text)" />
                                        <YAxis stroke="var(--sidebar-text)" />
                                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }} />
                                        <Bar dataKey="present" stackId="a" fill="var(--primary-color)" name="Present" />
                                        <Bar dataKey="absent" stackId="a" fill="var(--danger-color)" radius={[4, 4, 0, 0]} name="Absent" />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : <p style={{ color: 'var(--sidebar-text)' }}>No department data collected.</p>}
                        </div>
                    </div>

                </div>

                {/* Right Side Container */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                    {/* Achiever Stats Showcase */}
                    <div className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                        <div style={{ width: 100, height: 100, borderRadius: '50%', backgroundColor: 'rgba(79, 70, 229, 0.1)', border: '4px solid var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', position: 'relative' }}>
                            <Award size={48} color="var(--primary-color)" />
                            <div style={{ position: 'absolute', bottom: -10, backgroundColor: 'var(--primary-color)', color: '#fff', fontSize: '0.7rem', padding: '4px 12px', borderRadius: '12px', fontWeight: 700 }}>TOP PERFORMER</div>
                        </div>
                        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '0.5rem' }}>{podium[0].name !== '-' ? podium[0].name : 'N/A'}</h2>
                        <p style={{ color: 'var(--sidebar-text)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Level 3 Scholar • {podium[0].percentage}% Perfect</p>

                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
                            <Star size={20} color="#f59e0b" fill="#f59e0b" />
                            <Star size={20} color="#f59e0b" fill="#f59e0b" />
                            <Star size={20} color="#f59e0b" fill="#f59e0b" />
                        </div>

                        <div style={{ width: '100%', textAlign: 'left' }}>
                            <p style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '0.95rem' }}>Achiever in categories:</p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                <span style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--success-color)', padding: '0.4rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>Best Attendance</span>
                                <span style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', padding: '0.4rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>Consistent</span>
                                <span style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger-color)', padding: '0.4rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>Star Rated</span>
                            </div>
                        </div>
                    </div>

                    {/* Monthly Trend Graph */}
                    <div className="card" style={{ padding: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem' }}>30-Day Trend (Campus)</h2>
                        <div style={{ height: '220px', width: '100%' }}>
                            {stats.monthlyTrend.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={stats.monthlyTrend}>
                                        <defs>
                                            <linearGradient id="colorPerc" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="var(--success-color)" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="var(--success-color)" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="date" hide />
                                        <YAxis hide domain={[0, 100]} />
                                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }} />
                                        <Area type="monotone" dataKey="percentage" stroke="var(--success-color)" strokeWidth={3} fillOpacity={1} fill="url(#colorPerc)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : <p style={{ color: 'var(--sidebar-text)' }}>Not enough data for trend.</p>}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                            <span style={{ fontWeight: 600, color: 'var(--sidebar-text)' }}>Average: </span>
                            <span style={{ fontWeight: 800, color: 'var(--success-color)', fontSize: '1.2rem' }}>
                                {stats.monthlyTrend.length > 0 ? Math.round(stats.monthlyTrend.reduce((a, b) => a + b.percentage, 0) / stats.monthlyTrend.length) : 0}%
                            </span>
                        </div>
                    </div>

                    {/* Low Attendance Quick View */}
                    <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--danger-color)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--danger-color)' }}>
                                <AlertCircle size={20} /> Action Required
                            </h2>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {stats.lowAttendance.length > 0 ? stats.lowAttendance.slice(0, 3).map(student => (
                                <div key={student.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{student.name}</p>
                                        <p style={{ color: 'var(--sidebar-text)', fontSize: '0.8rem' }}>Roll: {student.roll} • {student.total} Classes total</p>
                                    </div>
                                    <span style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger-color)', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700 }}>
                                        {student.percentage}%
                                    </span>
                                </div>
                            )) : (
                                <p style={{ fontSize: '0.9rem', color: 'var(--sidebar-text)' }}>All students look good!</p>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
