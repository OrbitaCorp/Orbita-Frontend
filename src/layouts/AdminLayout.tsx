import { ReactNode } from 'react'
import Sidebar from './components/Sidebar'
import Header from './components/Header'

export default function AdminLayout({ children }: { children: ReactNode }) {
    return (
        /* flex h-screen: ocupa toda la pantalla sin scroll en el body */
        <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <div className="flex flex-col flex-1 overflow-hidden">
                <Header />
                <main className="flex-1 overflow-auto" style={{ background: 'var(--color-surface)' }}>
                    {children}
                </main>
            </div>
        </div>
    )
}