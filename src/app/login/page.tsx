'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { School, User, Lock, ArrowRight, BookOpen, Quote } from 'lucide-react';
import { motion } from 'framer-motion';

function LoginContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const defaultRole = searchParams.get('role') === 'admin' ? 'admin' : 'teacher';

    const [role, setRole] = useState<'admin' | 'teacher'>(defaultRole);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, role }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Login failed');
            }

            router.push(`/${role}/dashboard`);
        } catch (err: any) {
            setError(err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page" style={{ position: 'relative', overflow: 'hidden' }}>
            {/* Background Image & Overlay */}
            <div style={{
                position: 'absolute', inset: 0,
                backgroundImage: 'url(/bg.png)',
                backgroundSize: 'cover', backgroundPosition: 'center', filter: 'brightness(0.6)'
            }} />

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.5 }}
                style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(135deg, rgba(67, 24, 255, 0.4), rgba(16, 185, 129, 0.2))',
                    backdropFilter: 'blur(3px)'
                }}
            />

            {/* Smart Login Form Box - Glassmorphism */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 10 }}>
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 100 }}
                    style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: 'var(--radius-lg)',
                        padding: '3rem', width: '100%', maxWidth: '450px',
                        color: '#ffffff',
                        boxShadow: '0 30px 60px rgba(0,0,0,0.3)',
                        margin: '2rem'
                    }}
                >
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <div style={{
                            backgroundColor: 'rgba(255,255,255,0.1)',
                            width: '60px', height: '60px',
                            borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem',
                            border: '1px solid rgba(255,255,255,0.2)'
                        }}>
                            <School size={32} color="#fff" />
                        </div>
                        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff' }}>Ubiquitous System</h1>
                        <p style={{ color: 'rgba(255,255,255,0.7)', marginTop: '0.5rem' }}>Smart Campus Operations</p>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(0,0,0,0.2)', padding: '0.3rem', borderRadius: '10px', marginBottom: '2rem' }}>
                        <button
                            type="button"
                            onClick={() => setRole('teacher')}
                            style={{
                                flex: 1, padding: '0.8rem', backgroundColor: role === 'teacher' ? 'rgba(255,255,255,0.2)' : 'transparent',
                                color: '#fff', borderRadius: '8px', border: role === 'teacher' ? '1px solid rgba(255,255,255,0.3)' : 'none',
                                fontWeight: role === 'teacher' ? 700 : 500, transition: 'all 0.3s ease'
                            }}
                        >
                            Teacher
                        </button>
                        <button
                            type="button"
                            onClick={() => setRole('admin')}
                            style={{
                                flex: 1, padding: '0.8rem', backgroundColor: role === 'admin' ? 'rgba(255,255,255,0.2)' : 'transparent',
                                color: '#fff', borderRadius: '8px', border: role === 'admin' ? '1px solid rgba(255,255,255,0.3)' : 'none',
                                fontWeight: role === 'admin' ? 700 : 500, transition: 'all 0.3s ease'
                            }}
                        >
                            Admin
                        </button>
                    </div>

                    {error && (
                        <motion.div initial={{ x: -10 }} animate={{ x: 0 }} style={{
                            padding: '1rem', marginBottom: '1.5rem', borderRadius: '8px',
                            backgroundColor: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239,68,68,0.5)',
                            color: '#ffb3b3', fontSize: '0.9rem', textAlign: 'center'
                        }}>
                            {error}
                        </motion.div>
                    )}

                    <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                            <User size={18} style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.6)' }} />
                            <input
                                type="email"
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                style={{
                                    width: '100%', padding: '1rem 1rem 1rem 3rem',
                                    backgroundColor: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px',
                                    color: '#fff', outline: 'none', transition: 'all 0.3s', fontSize: '1rem'
                                }}
                                onFocus={(e) => { e.target.style.borderColor = '#fff'; e.target.style.backgroundColor = 'rgba(0,0,0,0.4)' }}
                                onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.backgroundColor = 'rgba(0,0,0,0.2)' }}
                                required
                            />
                        </div>

                        <div style={{ position: 'relative', marginBottom: '2rem' }}>
                            <Lock size={18} style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.6)' }} />
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={{
                                    width: '100%', padding: '1rem 1rem 1rem 3rem',
                                    backgroundColor: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px',
                                    color: '#fff', outline: 'none', transition: 'all 0.3s', fontSize: '1rem'
                                }}
                                onFocus={(e) => { e.target.style.borderColor = '#fff'; e.target.style.backgroundColor = 'rgba(0,0,0,0.4)' }}
                                onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.backgroundColor = 'rgba(0,0,0,0.2)' }}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            style={{
                                width: '100%', padding: '1.2rem', fontSize: '1.1rem', background: 'linear-gradient(135deg, #7551ff, #4318ff)',
                                color: '#fff', borderRadius: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem',
                                border: 'none', cursor: 'pointer', transition: 'all 0.3s', fontWeight: 700,
                                boxShadow: '0 10px 20px rgba(67, 24, 255, 0.5)'
                            }}
                            disabled={loading}
                        >
                            {loading ? 'Authenticating...' : 'Secure Access'} <ArrowRight size={20} />
                        </button>
                    </form>
                </motion.div>
            </div>

            {/* Smart Quote Panel */}
            <div className="auth-sidebar" style={{ display: 'flex', position: 'relative', zIndex: 10, background: 'transparent' }}>
                <div style={{
                    position: 'absolute', bottom: '10%', left: '10%', right: '10%',
                    background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)',
                    padding: '2rem', borderRadius: '16px', color: '#fff',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
                }}>
                    <Quote size={40} color="rgba(255,255,255,0.4)" style={{ marginBottom: '1rem' }} />
                    <h2 style={{ fontSize: '2rem', fontWeight: 300, lineHeight: 1.4, marginBottom: '1rem' }}>
                        &quot;Attendance reflects <strong style={{ fontWeight: 800 }}>discipline.</strong> Architecture shapes behavior.&quot;
                    </h2>
                    <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <BookOpen size={16} /> Ubiquitous Smart Terminal
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div>Loading Secure Portal...</div>}>
            <LoginContent />
        </Suspense>
    )
}
