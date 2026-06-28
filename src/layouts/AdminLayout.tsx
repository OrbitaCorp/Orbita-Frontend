import { useState } from 'react'
import { ReactNode } from 'react'
import Sidebar from './components/Sidebar'
import Header from './components/Header'

export default function AdminLayout({ children }: { children: ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false)

    return (
        <div className="flex h-screen overflow-hidden">
            <style>{`
                @media (min-width: 769px) {
                    .admin-backdrop { display: none !important; }
                }
            `}</style>

            {/* Overlay mobile */}
            <div
                className="admin-backdrop"
                onClick={() => setSidebarOpen(false)}
                style={{
                    display: sidebarOpen ? 'block' : 'none',
                    position: 'fixed', inset: 0, zIndex: 40,
                    background: 'rgba(0,0,0,0.55)',
                    backdropFilter: 'blur(2px)',
                    WebkitBackdropFilter: 'blur(2px)',
                }}
            />

            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="flex flex-col flex-1 overflow-hidden">
                <Header onMenuClick={() => setSidebarOpen(o => !o)} />
                <main className="flex-1 overflow-auto" style={{ background: 'var(--color-surface)' }}>
                    {children}
                </main>
            </div>
        </div>
    )
}
