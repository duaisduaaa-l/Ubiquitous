'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AddStudent() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        roll_number: '',
        course: '',
        year: '',
        section: '',
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const res = await fetch('/api/teacher/students', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to add student');
            }

            setMessage({ type: 'success', text: 'Student added successfully!' });
            setFormData({ name: '', roll_number: '', course: '', year: '', section: '' });
            setTimeout(() => router.push('/teacher/students'), 1500);
        } catch (err) {
            setMessage({ type: 'error', text: (err as Error).message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '1.5rem' }}>Add New Student</h1>

            <div className="card" style={{ maxWidth: '600px' }}>
                {message.text && (
                    <div style={{
                        padding: '1rem',
                        marginBottom: '1rem',
                        borderRadius: '6px',
                        backgroundColor: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        color: message.type === 'success' ? 'var(--success-color)' : 'var(--danger-color)',
                    }}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ fontSize: '0.9rem', fontWeight: 600 }}>Full Name</label>
                        <input
                            type="text"
                            name="name"
                            className="input-field"
                            placeholder="e.g. Alice Smith"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ fontSize: '0.9rem', fontWeight: 600 }}>Roll Number</label>
                        <input
                            type="text"
                            name="roll_number"
                            className="input-field"
                            placeholder="e.g. CS2026-001"
                            value={formData.roll_number}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ fontSize: '0.9rem', fontWeight: 600 }}>Course</label>
                        <select
                            name="course"
                            className="input-field"
                            value={formData.course}
                            onChange={handleChange}
                            required
                        >
                            <option value="" disabled>Select Course</option>
                            <option value="B.Tech CS">B.Tech CS</option>
                            <option value="B.Tech ME">B.Tech ME</option>
                            <option value="B.Tech CE">B.Tech CE</option>
                            <option value="BCA">BCA</option>
                            <option value="MCA">MCA</option>
                        </select>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ fontSize: '0.9rem', fontWeight: 600 }}>Year</label>
                            <select
                                name="year"
                                className="input-field"
                                value={formData.year}
                                onChange={handleChange}
                                required
                            >
                                <option value="" disabled>Select Year</option>
                                <option value="1st Year">1st Year</option>
                                <option value="2nd Year">2nd Year</option>
                                <option value="3rd Year">3rd Year</option>
                                <option value="4th Year">4th Year</option>
                            </select>
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ fontSize: '0.9rem', fontWeight: 600 }}>Section</label>
                            <select
                                name="section"
                                className="input-field"
                                value={formData.section}
                                onChange={handleChange}
                                required
                            >
                                <option value="" disabled>Select Section</option>
                                <option value="A">A</option>
                                <option value="B">B</option>
                                <option value="C">C</option>
                            </select>
                        </div>
                    </div>

                    <button type="submit" className="btn-primary" disabled={loading} style={{ alignSelf: 'flex-start' }}>
                        {loading ? 'Adding...' : 'Add Student'}
                    </button>
                </form>
            </div>
        </div>
    );
}
