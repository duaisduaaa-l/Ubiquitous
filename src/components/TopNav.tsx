'use client';

import { Search, MessageSquare, Bell, ChevronDown } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function TopNav() {
    const [userName, setUserName] = useState('Teacher Profile');

    useEffect(() => {
        fetch('/api/teacher/me').then(res => res.json()).then(data => {
            if (data.success && data.user) {
                setUserName(data.user.name);
            }
        }).catch(() => { });
    }, []);

    return (
        <header style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '1rem 2.5rem',
            backgroundColor: 'var(--card-bg)',
            borderBottom: '1px solid var(--border-color)',
            position: 'sticky', top: 0, zIndex: 9,
            height: '80px'
        }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                <div style={{
                    display: 'flex', alignItems: 'center',
                    backgroundColor: 'var(--input-bg)',
                    padding: '0.6rem 1rem',
                    borderRadius: '8px',
                    width: '100%',
                    maxWidth: '500px',
                    color: 'var(--sidebar-text)',
                    border: '1px solid var(--border-color)'
                }}>
                    <input
                        type="text"
                        placeholder="Search here..."
                        style={{ border: 'none', background: 'transparent', width: '100%', outline: 'none', color: 'var(--text-color)', fontSize: '0.95rem' }}
                    />
                    <Search size={18} />
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '1rem', color: 'var(--sidebar-text)', cursor: 'pointer' }}>
                    <MessageSquare size={20} />
                    <div style={{ position: 'relative' }}>
                        <Bell size={20} />
                        <span style={{ position: 'absolute', top: -4, right: -4, width: 8, height: 8, backgroundColor: 'var(--danger-color)', borderRadius: '50%' }}></span>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer', borderLeft: '1px solid var(--border-color)', paddingLeft: '1.5rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold' }}>
                        {userName.charAt(0)}
                    </div>
                    <span style={{ fontWeight: 600, color: 'var(--text-color)', fontSize: '0.95rem' }}>{userName}</span>
                    <ChevronDown size={16} color="var(--sidebar-text)" />
                </div>
            </div>
        </header>
    );
}
