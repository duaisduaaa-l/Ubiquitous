'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut, Settings, LayoutDashboard, CalendarDays, BookOpen, Users } from 'lucide-react';

export default function Sidebar({ role }: { role: 'admin' | 'teacher' }) {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/login');
    };

    const adminLinks = [
        { name: 'Dashboard', href: '/admin/dashboard', icon: <LayoutDashboard size={22} /> },
        { name: 'Teachers', href: '/admin/teachers', icon: <Users size={22} /> },
        { name: 'Add Teacher', href: '/admin/add-teacher', icon: <BookOpen size={22} /> },
    ];

    const teacherLinks = [
        { name: 'Dashboard', href: '/teacher/dashboard', icon: <LayoutDashboard size={22} /> },
        { name: 'Schedule', href: '/teacher/schedule', icon: <CalendarDays size={22} /> },
        { name: 'Students', href: '/teacher/students', icon: <Users size={22} /> },
        { name: 'Attendance', href: '/teacher/attendance', icon: <BookOpen size={22} /> },
    ];

    const links = role === 'admin' ? adminLinks : teacherLinks;

    return (
        <aside className="sidebar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '3rem', padding: '0 0.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2px' }}>
                    <div style={{ width: 10, height: 10, backgroundColor: '#fff', borderRadius: 2 }}></div>
                    <div style={{ width: 10, height: 10, backgroundColor: '#fff', borderRadius: 2 }}></div>
                    <div style={{ width: 10, height: 10, backgroundColor: '#fff', borderRadius: 2 }}></div>
                    <div style={{ width: 10, height: 10, backgroundColor: 'rgba(255,255,255,0.4)', borderRadius: 2 }}></div>
                </div>
                <h1 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>Dashboard</h1>
            </div>

            <nav style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1rem' }}>
                {links.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`nav-link-dribbble ${isActive ? 'active' : ''}`}
                            title={link.name}
                        >
                            {link.icon}
                        </Link>
                    )
                })}
            </nav>

            <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2rem' }}>
                <Link href={`/${role}/report`} className={`nav-link-dribbble ${pathname === `/${role}/report` ? 'active' : ''}`} title="Settings / Reports">
                    <Settings size={22} />
                </Link>
                <button onClick={handleLogout} className="nav-link-dribbble" title="Logout" style={{ display: 'flex' }}>
                    <LogOut size={22} />
                </button>
            </div>
        </aside>
    );
}
