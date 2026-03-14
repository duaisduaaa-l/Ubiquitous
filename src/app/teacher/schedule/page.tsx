'use client';

import { useEffect, useState } from 'react';
import { CalendarDays, Clock, Trash2 } from 'lucide-react';

interface Schedule {
    schedule_id: string;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    subject: string;
    section: string;
}

export default function SchedulePage() {
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [loading, setLoading] = useState(true);
    const [teacherId, setTeacherId] = useState<string>('');

    const [form, setForm] = useState({
        dayOfWeek: 'Monday',
        startTime: '',
        endTime: '',
        subject: '',
        section: ''
    });
    const [submitting, setSubmitting] = useState(false);

    // Initialize
    const fetchContext = async () => {
        try {
            const res = await fetch('/api/teacher/me');
            const data = await res.json();
            if (data.success && data.user) {
                setTeacherId(data.user.id);
            }
        } catch { }
    };

    const fetchSchedules = async (tid: string) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/teacher/schedule?teacher_id=${tid}`);
            const data = await res.json();
            if (data.success) {
                setSchedules(data.schedules);
            }
        } catch { }
        setLoading(false);
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchContext();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (teacherId) fetchSchedules(teacherId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [teacherId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleAddSchedule = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!teacherId) return;
        setSubmitting(true);
        try {
            const res = await fetch('/api/teacher/schedule', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...form, teacher_id: teacherId })
            });
            const data = await res.json();
            if (data.success) {
                setSchedules([...schedules, data.schedule]);
                setForm({ ...form, startTime: '', endTime: '', subject: '', section: '' });
            } else {
                alert(data.error);
            }
        } catch {
            alert('Failed to add schedule');
        }
        setSubmitting(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Remove this schedule slot?')) return;
        try {
            const res = await fetch(`/api/teacher/schedule/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setSchedules(schedules.filter(s => s.schedule_id !== id));
            }
        } catch {
            alert('Failed to delete');
        }
    };

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    return (
        <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '2rem' }}>
                <CalendarDays size={28} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.5rem', color: 'var(--primary-color)' }} />
                Time Schedule Set System
            </h1>

            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>

                {/* ADD NEW SCHEDULE FORM */}
                <div className="card" style={{ flex: '1 1 350px', position: 'sticky', top: '2rem' }}>
                    <h2 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', fontWeight: 700 }}>Add New Slot</h2>
                    <form onSubmit={handleAddSchedule} style={{ display: 'flex', flexDirection: 'column' }}>
                        <label style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--sidebar-text)' }}>Day of Week</label>
                        <select name="dayOfWeek" value={form.dayOfWeek} onChange={handleChange} className="input-field" required>
                            {days.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--sidebar-text)' }}>Start Time</label>
                                <input type="time" name="startTime" value={form.startTime} onChange={handleChange} className="input-field" required />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--sidebar-text)' }}>End Time</label>
                                <input type="time" name="endTime" value={form.endTime} onChange={handleChange} className="input-field" required />
                            </div>
                        </div>

                        <label style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--sidebar-text)' }}>Subject / Course</label>
                        <input type="text" name="subject" value={form.subject} onChange={handleChange} placeholder="e.g. Data Structures" className="input-field" required />

                        <label style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--sidebar-text)' }}>Section</label>
                        <input type="text" name="section" value={form.section} onChange={handleChange} placeholder="e.g. CS-A" className="input-field" required />

                        <button type="submit" className="btn-primary" disabled={submitting} style={{ marginTop: '1rem', width: '100%' }}>
                            {submitting ? 'Adding...' : 'Save Schedule Slot'}
                        </button>
                    </form>
                </div>

                {/* SCHEDULE LIST VIEW */}
                <div className="card" style={{ flex: '2 1 600px' }}>
                    <h2 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', fontWeight: 700 }}>My Weekly Classes</h2>

                    {loading ? (
                        <p>Loading schedule slots...</p>
                    ) : schedules.length === 0 ? (
                        <p style={{ color: 'var(--sidebar-text)' }}>No classes scheduled yet. Add your slots from the left panel.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            {days.map(day => {
                                const daySchedules = schedules.filter(s => s.dayOfWeek === day);
                                if (daySchedules.length === 0) return null;
                                return (
                                    <div key={day}>
                                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-color)', borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                                            {day}
                                        </h3>
                                        <div className="table-container" style={{ padding: 0 }}>
                                            <table>
                                                <thead>
                                                    <tr>
                                                        <th style={{ paddingLeft: 0 }}>Timing</th>
                                                        <th>Subject</th>
                                                        <th>Section</th>
                                                        <th style={{ textAlign: 'right', paddingRight: 0 }}>Remove</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {daySchedules.map(slot => (
                                                        <tr key={slot.schedule_id}>
                                                            <td style={{ paddingLeft: 0 }}>
                                                                <div className="schedule-badge" style={{ backgroundColor: 'rgba(67, 24, 255, 0.1)', color: 'var(--primary-color)' }}>
                                                                    <Clock size={16} /> {slot.startTime} - {slot.endTime}
                                                                </div>
                                                            </td>
                                                            <td><span style={{ fontWeight: 600 }}>{slot.subject}</span></td>
                                                            <td>{slot.section}</td>
                                                            <td style={{ textAlign: 'right', paddingRight: 0 }}>
                                                                <button onClick={() => handleDelete(slot.schedule_id)} style={{ background: 'transparent', color: 'var(--danger-color)', padding: 0 }}>
                                                                    <Trash2 size={18} />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
