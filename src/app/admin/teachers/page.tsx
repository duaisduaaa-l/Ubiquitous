'use client';

import { useEffect, useState } from 'react';
import { Trash2, Edit } from 'lucide-react';

interface Teacher {
    teacher_id: string;
    name: string;
    email: string;
    department: string;
}

export default function TeachersPage() {
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchTeachers = async () => {
        try {
            const res = await fetch('/api/admin/teachers');
            const data = await res.json();
            setTeachers(Array.isArray(data) ? data : []);
        } catch {
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTeachers();
    }, []);

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete ${name}?`)) return;

        try {
            const res = await fetch(`/api/admin/teachers/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setTeachers(teachers.filter((t) => t.teacher_id !== id));
            } else {
                alert('Failed to delete teacher');
            }
        } catch {
            alert('Error occurred while deleting teacher');
        }
    };

    return (
        <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '1.5rem' }}>Managed Teachers</h1>

            <div className="card table-container">
                {loading ? (
                    <p>Loading teachers...</p>
                ) : teachers.length === 0 ? (
                    <p>No teachers registered yet.</p>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Department</th>
                                <th>Email ID</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {teachers.map((t) => (
                                <tr key={t.teacher_id}>
                                    <td style={{ fontWeight: 500 }}>{t.name}</td>
                                    <td>
                                        <span style={{
                                            backgroundColor: 'rgba(37, 99, 235, 0.1)',
                                            color: 'var(--primary-color)',
                                            padding: '0.2rem 0.5rem',
                                            borderRadius: '4px',
                                            fontSize: '0.85rem',
                                            fontWeight: 600
                                        }}>
                                            {t.department}
                                        </span>
                                    </td>
                                    <td>{t.email}</td>
                                    <td style={{ textAlign: 'right' }}>
                                        <button
                                            onClick={() => alert('Edit feature to be implemented!')}
                                            style={{ background: 'transparent', color: 'var(--primary-color)', padding: '0.5rem' }}
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(t.teacher_id, t.name)}
                                            style={{ background: 'transparent', color: 'var(--danger-color)', padding: '0.5rem' }}
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
