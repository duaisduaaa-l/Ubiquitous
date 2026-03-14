import Sidebar from '@/components/Sidebar';
import TopNav from '@/components/TopNav';

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="layout-container" style={{ display: 'flex' }}>
            <Sidebar role="teacher" />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <TopNav />
                <main className="main-content" style={{ flex: 1, overflowY: 'auto' }}>
                    {children}
                </main>
            </div>
        </div>
    );
}
