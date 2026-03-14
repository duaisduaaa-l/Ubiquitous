'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AddTeacher() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        department: '',
        password: '',
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
            const res = await fetch('/api/admin/teachers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to add teacher');
            }

            setMessage({ type: 'success', text: 'Teacher created successfully!' });
            setFormData({ name: '', email: '', department: '', password: '' });
            setTimeout(() => router.push('/admin/teachers'), 1500);
        } catch (err) {
            setMessage({ type: 'error', text: (err as Error).message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '1.5rem' }}>Add New Teacher</h1>

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
                            placeholder="e.g. John Doe"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ fontSize: '0.9rem', fontWeight: 600 }}>Email Address</label>
                        <input
                            type="email"
                            name="email"
                            className="input-field"
                            placeholder="teacher@college.edu"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ fontSize: '0.9rem', fontWeight: 600 }}>Department</label>
                        <select
                            name="department"
                            className="input-field"
                            value={formData.department}
                            onChange={handleChange}
                            required
                        >
                            <option value="" disabled>Select Department</option>
                            <option value="Computer Science">Computer Science</option>
                            <option value="Mechanical Engineering">Mechanical Engineering</option>
                            <option value="Civil Engineering">Civil Engineering</option>
                            <option value="Electronics & Communication">Electronics & Communication</option>
                            <option value="Information Technology">Information Technology</option>
                            <option value="Mathematics">Mathematics</option>
                            <option value="Physics">Physics</option>
                        </select>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ fontSize: '0.9rem', fontWeight: 600 }}>Password</label>
                        <input
                            type="password"
                            name="password"
                            className="input-field"
                            placeholder="Enter a secure password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button type="submit" className="btn-primary" disabled={loading} style={{ alignSelf: 'flex-start' }}>
                        {loading ? 'Adding...' : 'Create Teacher Account'}
                    </button>
                </form>
            </div>
        </div>
    );
}
