'use client';

import { useEffect, useState } from 'react';
import { Search, UserPlus } from 'lucide-react';

interface Student {
    student_id: string;
    name: string;
    roll_number: string;
    course: string;
    year: string;
    section: string;
}

export default function StudentsPage() {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({ name: '', roll_number: '', course: '', year: '', section: '' });

    const [, setTeacherId] = useState<string>('');
    const [schedules, setSchedules] = useState<{ section: string }[]>([]);
    const [filterSection, setFilterSection] = useState<string>('All');

    const fetchStudents = async (query = '') => {
        setLoading(true);
        try {
            const res = await fetch(`/api/teacher/students${query ? `?q=${query}` : ''}`);
            const data = await res.json();
            setStudents(Array.isArray(data) ? data : []);
        } catch {
        } finally {
            setLoading(false);
        }
    };

    const fetchContextAndSchedules = async () => {
        try {
            const resMe = await fetch('/api/teacher/me');
            const dataMe = await resMe.json();
            if (dataMe.success && dataMe.user) {
                setTeacherId(dataMe.user.id);
                const resSch = await fetch(`/api/teacher/schedule?teacher_id=${dataMe.user.id}`);
                const dataSch = await resSch.json();
                if (dataSch.success && dataSch.schedules) {
                    setSchedules(dataSch.schedules);
                    // auto-select first section for form if exists
                    const unq = Array.from(new Set(dataSch.schedules.map((s: { section: string }) => s.section)));
                    if (unq.length > 0 && !form.section) {
                        setForm(prev => ({ ...prev, section: unq[0] as string }));
                    }
                }
            }
        } catch { }
    };

    useEffect(() => {
        fetchContextAndSchedules();
        fetchStudents();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchStudents(search);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleAddStudent = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await fetch('/api/teacher/students', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });
            const data = await res.json();
            if (data.success) {
                setForm({ name: '', roll_number: '', course: '', year: '', section: '' });
                setShowForm(false);
                fetchStudents(search);
            } else {
                alert(data.error);
            }
        } catch {
            alert('Failed to add student');
        }
        setSubmitting(false);
    };

    const displayedStudents = students.filter(s => filterSection === 'All' || s.section === filterSection);

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 700 }}>Student Roster</h1>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="btn-primary"
                    style={{ padding: '0.6rem 1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    <UserPlus size={18} /> {showForm ? 'Cancel Form' : 'Add New Student'}
                </button>
            </div>

            {showForm && (
                <div className="card" style={{ marginBottom: '1.5rem', backgroundColor: 'rgba(79, 70, 229, 0.03)', border: '1px solid rgba(79, 70, 229, 0.2)' }}>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--primary-color)' }}>Register New Student</h2>
                    <form onSubmit={handleAddStudent} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                        <div>
                            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--sidebar-text)', textTransform: 'uppercase' }}>Full Name</label>
                            <input type="text" name="name" value={form.name} onChange={handleChange} className="input-field" placeholder="John Doe" required />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--sidebar-text)', textTransform: 'uppercase' }}>Roll Number</label>
                            <input type="text" name="roll_number" value={form.roll_number} onChange={handleChange} className="input-field" placeholder="CS25001" required />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--sidebar-text)', textTransform: 'uppercase' }}>Course</label>
                            <input type="text" name="course" value={form.course} onChange={handleChange} className="input-field" placeholder="B.Tech CS" required />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--sidebar-text)', textTransform: 'uppercase' }}>Year</label>
                            <input type="text" name="year" value={form.year} onChange={handleChange} className="input-field" placeholder="2nd Year" required />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--sidebar-text)', textTransform: 'uppercase' }}>Section / Class</label>
                            <select name="section" value={form.section} onChange={handleChange} className="input-field" required>
                                <option value="" disabled>Select Class</option>
                                {Array.from(new Set(schedules.map(s => s.section))).map(sec => (
                                    <option key={sec} value={sec}>Section {sec}</option>
                                ))}
                            </select>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                            <button type="submit" className="btn-primary" disabled={submitting} style={{ width: '100%', padding: '0.85rem' }}>
                                {submitting ? 'Registering...' : 'Save Student'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="card" style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem', alignItems: 'center', flex: 1 }}>
                    <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
                        <Search size={18} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '1rem', color: 'var(--border-color)', filter: 'brightness(0.5)' }} />
                        <input
                            type="text"
                            className="input-field"
                            style={{ paddingLeft: '2.5rem', margin: 0 }}
                            placeholder="Search by Name or Roll No..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="btn-primary" style={{ padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center' }}>
                        Search
                    </button>
                    {search && (
                        <button
                            type="button"
                            onClick={() => { setSearch(''); fetchStudents(''); }}
                            style={{ background: 'transparent', color: 'var(--text-color)', border: '1px solid var(--border-color)', padding: '0.75rem 1rem' }}
                        >
                            Clear
                        </button>
                    )}
                </form>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderLeft: '1px solid var(--border-color)', paddingLeft: '1rem' }}>
                    <label style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--sidebar-text)' }}>Filter Class:</label>
                    <select
                        className="input-field"
                        style={{ margin: 0, padding: '0.5rem 1rem', minWidth: '150px' }}
                        value={filterSection}
                        onChange={(e) => setFilterSection(e.target.value)}
                    >
                        <option value="All">All Enrolled</option>
                        {Array.from(new Set(schedules.map(s => s.section))).map(sec => (
                            <option key={sec} value={sec}>Section {sec}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="card table-container">
                {loading ? (
                    <p>Loading students...</p>
                ) : displayedStudents.length === 0 ? (
                    <p>No students found for this class.</p>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Roll No</th>
                                <th>Name</th>
                                <th>Course</th>
                                <th>Year</th>
                                <th>Section</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayedStudents.map((s) => (
                                <tr key={s.student_id}>
                                    <td style={{ fontWeight: 600, color: 'var(--primary-color)' }}>{s.roll_number}</td>
                                    <td style={{ fontWeight: 500 }}>{s.name}</td>
                                    <td>{s.course}</td>
                                    <td>{s.year}</td>
                                    <td>{s.section}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
