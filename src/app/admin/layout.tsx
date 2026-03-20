import Sidebar from '@/components/Sidebar';
import TopNav from '@/components/TopNav';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="layout-container" style={{ display: 'flex' }}>
            <Sidebar role="admin" />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <TopNav />
                <main className="main-content" style={{ flex: 1, overflowY: 'auto' }}>
                    {children}
                </main>
            </div>
        </div>
    );
}
