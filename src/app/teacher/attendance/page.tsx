'use client';

import { useEffect, useState } from 'react';
import { Users } from 'lucide-react';

interface Student {
    student_id: string;
    name: string;
    roll_number: string;
    section: string;
}

interface Schedule {
    schedule_id: string;
    subject: string;
    section: string;
}

export default function MarkAttendance() {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // By default, assuming teacher_id from session/context. Since Next app is using JWT cookie,
    // we'll fetch teacher profile or decode it on server. Here we'll pass an extra endpoint to get me context.
    const [teacherId, setTeacherId] = useState<string>('');
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [selectedSection, setSelectedSection] = useState<string>('All');

    const [dateStr, setDateStr] = useState<string>(new Date().toISOString().slice(0, 10));
    const [attendanceState, setAttendanceState] = useState<{ [key: string]: 'Present' | 'Absent' }>({});
    const [message, setMessage] = useState({ type: '', text: '' });

    // Add functionality to fetch teacher profile context dynamically
    const fetchContext = async () => {
        try {
            const res = await fetch('/api/teacher/me');
            const data = await res.json();
            if (data.success && data.user) {
                setTeacherId(data.user.id);
            }
        } catch {
        }
    };

    const fetchSchedules = async (tid: string) => {
        try {
            const res = await fetch(`/api/teacher/schedule?teacher_id=${tid}`);
            const data = await res.json();
            if (data.success && data.schedules) {
                setSchedules(data.schedules);
            }
        } catch {
        }
    };

    const fetchStudentsAndAttendance = async (teacherId: string, date: string, sectionFilter: string) => {
        setLoading(true);
        try {
            // 1. Get all students
            const studRes = await fetch('/api/teacher/students');
            let studData: Student[] = await studRes.json();

            // Filter dynamically by section if not "All"
            if (sectionFilter && sectionFilter !== 'All') {
                studData = studData.filter(s => s.section === sectionFilter);
            }

            setStudents(studData);

            // 2. Get existing attendance for this date
            if (teacherId) {
                const attRes = await fetch(`/api/teacher/attendance?date=${date}&teacher_id=${teacherId}`);
                const attData = await attRes.json();

                const newState: { [key: string]: 'Present' | 'Absent' } = {};
                if (Array.isArray(attData)) {
                    attData.forEach((a: { student_id: string; status: 'Present' | 'Absent' }) => {
                        newState[a.student_id] = a.status;
                    });
                }
                setAttendanceState(newState);
            }
        } catch {
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContext();
    }, []);

    useEffect(() => {
        if (teacherId) {
            fetchSchedules(teacherId);
            fetchStudentsAndAttendance(teacherId, dateStr, selectedSection);
        }
    }, [teacherId, dateStr, selectedSection]);

    const handleSave = async () => {
        if (!teacherId) return;
        setSaving(true);
        setMessage({ type: '', text: '' });

        try {
            const records = students.map(s => ({
                student_id: s.student_id,
                status: attendanceState[s.student_id] || 'Absent' // default missing interactions to absent
            }));

            const res = await fetch('/api/teacher/attendance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    teacher_id: teacherId,
                    baseDateStr: dateStr,
                    records
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to save');

            setMessage({ type: 'success', text: 'Attendance Saved Successfully' });
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (err) {
            setMessage({ type: 'error', text: (err as Error).message });
        } finally {
            setSaving(false);
        }
    };

    const toggleAttendance = (studentId: string, status: 'Present' | 'Absent') => {
        setAttendanceState(prev => ({ ...prev, [studentId]: status }));
    };

    const uniqueSections = Array.from(new Set(schedules.map(s => s.section)));

    return (
        <div>
            <div className="header-top" style={{ flexWrap: 'wrap', gap: '1rem' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 700 }}>Mark Attendance</h1>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Users size={18} color="var(--primary-color)" />
                        <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Select Class:</label>
                        <select
                            className="input-field"
                            style={{ margin: 0, padding: '0.5rem', minWidth: '150px' }}
                            value={selectedSection}
                            onChange={(e) => setSelectedSection(e.target.value)}
                        >
                            <option value="All">All Enrolled</option>
                            {uniqueSections.map(sec => (
                                <option key={sec} value={sec}>Section {sec}</option>
                            ))}
                        </select>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Date:</label>
                        <input
                            type="date"
                            className="input-field"
                            style={{ margin: 0, padding: '0.5rem' }}
                            value={dateStr}
                            onChange={(e) => setDateStr(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="card table-container">
                {message.text && (
                    <div style={{
                        padding: '1rem',
                        marginBottom: '1rem',
                        borderRadius: '6px',
                        backgroundColor: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        color: message.type === 'success' ? 'var(--success-color)' : 'var(--danger-color)',
                        textAlign: 'center',
                        fontWeight: 600
                    }}>
                        {message.text}
                    </div>
                )}

                {loading ? (
                    <p>Loading records...</p>
                ) : students.length === 0 ? (
                    <p>No students enrolled yet to mark attendance.</p>
                ) : (
                    <>
                        <table style={{ marginBottom: '1.5rem' }}>
                            <thead>
                                <tr>
                                    <th>Roll No</th>
                                    <th>Student Name</th>
                                    <th style={{ textAlign: 'center' }}>Mark Attendance</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map((s) => {
                                    const status = attendanceState[s.student_id];

                                    return (
                                        <tr key={s.student_id}>
                                            <td style={{ fontWeight: 600, color: 'var(--primary-color)' }}>{s.roll_number}</td>
                                            <td style={{ fontWeight: 500 }}>{s.name}</td>
                                            <td style={{ textAlign: 'center' }}>
                                                <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                                                    <button
                                                        onClick={() => toggleAttendance(s.student_id, 'Present')}
                                                        style={{
                                                            padding: '0.4rem 1rem',
                                                            backgroundColor: status === 'Present' ? 'var(--success-color)' : 'transparent',
                                                            color: status === 'Present' ? '#fff' : 'var(--success-color)',
                                                            border: `1px solid var(--success-color)`,
                                                        }}
                                                    >
                                                        Present
                                                    </button>
                                                    <button
                                                        onClick={() => toggleAttendance(s.student_id, 'Absent')}
                                                        style={{
                                                            padding: '0.4rem 1rem',
                                                            backgroundColor: status === 'Absent' ? 'var(--danger-color)' : 'transparent',
                                                            color: status === 'Absent' ? '#fff' : 'var(--danger-color)',
                                                            border: `1px solid var(--danger-color)`,
                                                        }}
                                                    >
                                                        Absent
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                            <button onClick={() => fetchStudentsAndAttendance(teacherId, dateStr, selectedSection)} className="btn-danger" style={{ backgroundColor: 'transparent', color: 'var(--text-color)', border: '1px solid var(--border-color)' }}>
                                Reset
                            </button>
                            <button onClick={handleSave} className="btn-primary" disabled={saving}>
                                {saving ? 'Saving...' : 'Save Attendance'}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
