// src/modules/ventas/panel/mensajes/Chat.tsx — Vista 29
// Chat a pantalla completa con un cliente.

import { ChevronRight } from 'lucide-react'
import { MsgTabs, type VistaMensaje } from './components/MsgTabs'
import { ChatPanel } from './components/ChatPanel'

interface ChatProps {
    ir:       (v: VistaMensaje) => void
    onToast:  (m: string) => void
    onPerfil: () => void
}

export default function Chat({ ir, onToast, onPerfil }: ChatProps) {
    return (
        <div style={pageWrap}>
            <MsgTabs activo="chat" ir={ir} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--color-muted)', marginBottom: 14 }}>
                <button onClick={() => ir('bandeja')} style={{ background: 'none', border: 'none', color: 'var(--color-muted)', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, padding: 0 }}>Bandeja</button>
                <ChevronRight size={12} />
                <span style={{ color: 'var(--color-text)', fontWeight: 500 }}>María Fernández</span>
            </div>
            <ChatPanel full onToast={onToast} onPerfil={onPerfil} />
        </div>
    )
}

const pageWrap: React.CSSProperties = { padding: '24px 32px 64px', maxWidth: 1280, width: '100%', margin: '0 auto', boxSizing: 'border-box' }
