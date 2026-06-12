// src/modules/ventas/admin/mensajes/Bandeja.tsx — Vista 28 + hub del módulo
//
// Punto de entrada del módulo `mensajes` (registrado en el componentMap admin).
// Hub con tabs: bandeja (V28), chat full (V29), plantillas (V30).
//
//   /admin/[negocioId]/ventas/mensajes              → bandeja (V28)
//   …/mensajes?vista=chat                           → Chat full (V29)
//   …/mensajes?vista=plantillas                     → Plantillas (V30)

import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { Toast } from '@/design-system/components/Toast'
import { Avatar } from '@/design-system/components/Avatar'

import { MsgTabs, type VistaMensaje } from './components/MsgTabs'
import { ChatPanel } from './components/ChatPanel'
import Chat from './Chat'
import Plantillas from './Plantillas'
import { CONVERSACIONES } from './mock/mensajes.mock'

// ─── Bandeja (V28) ────────────────────────────────────────────────────────────

function BandejaView({ ir, onToast, onPerfil }: { ir: (v: VistaMensaje) => void; onToast: (m: string) => void; onPerfil: () => void }) {
    const [active, setActive] = useState('cv1')

    return (
        <div style={pageWrap}>
            <MsgTabs activo="bandeja" ir={ir} />

            <div style={{ display: 'grid', gridTemplateColumns: '320px minmax(0,1fr)', gap: 16, alignItems: 'start' }}>
                {/* Lista de conversaciones */}
                <div style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 12, overflow: 'hidden' }}>
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)' }}>Mensajes</span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', height: 20, padding: '0 8px', borderRadius: 9999, background: 'var(--color-primary-bg)', color: 'var(--color-primary)', fontSize: 11, fontWeight: 600 }}>3 sin leer</span>
                    </div>
                    {CONVERSACIONES.map(cv => {
                        const a = active === cv.id
                        return (
                            <button key={cv.id} onClick={() => { setActive(cv.id); ir('chat') }} style={{ width: '100%', display: 'flex', gap: 10, padding: '12px 16px', border: 'none', borderBottom: '1px solid var(--color-border)', borderLeft: `3px solid ${a ? 'var(--color-primary)' : 'transparent'}`, background: a ? 'var(--color-primary-bg)' : 'transparent', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}>
                                <Avatar name={cv.cliente} size={38} />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cv.cliente}</span>
                                        <span style={{ fontSize: 10, color: 'var(--color-muted)', fontFamily: '"Geist Mono", monospace' }}>{cv.tiempo}</span>
                                    </div>
                                    <div style={{ fontSize: 12, color: 'var(--color-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: 2 }}>{cv.preview}</div>
                                    {cv.pedido && <span style={{ display: 'inline-flex', alignItems: 'center', height: 16, padding: '0 6px', borderRadius: 9999, background: 'var(--color-surface-alt)', color: 'var(--color-muted)', fontSize: 10, marginTop: 4, fontFamily: '"Geist Mono", monospace' }}>#{cv.pedido}</span>}
                                </div>
                                {cv.unread && <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-primary)', flexShrink: 0, marginTop: 6 }} />}
                            </button>
                        )
                    })}
                </div>

                <ChatPanel onToast={onToast} onPerfil={onPerfil} />
            </div>
        </div>
    )
}

// ─── Hub ──────────────────────────────────────────────────────────────────────

export default function Bandeja() {
    const router = useRouter()
    const { vista } = router.query
    const [toast, setToast] = useState<string | null>(null)

    useEffect(() => {
        if (!toast) return
        const t = setTimeout(() => setToast(null), 3000)
        return () => clearTimeout(t)
    }, [toast])

    const ir = (v: VistaMensaje) => {
        const { vista: _v, ...rest } = router.query
        const q: Record<string, string | string[] | undefined> = { ...rest }
        if (v !== 'bandeja') q.vista = v
        router.push({ query: q })
    }
    const irPerfil = () => {
        const { negocioId, moduloPadre } = router.query
        router.push({ query: { negocioId: negocioId as string, moduloPadre: moduloPadre as string, seccion: 'clientes', vista: 'detalle', id: 'c1' } })
    }

    const sub = vista as VistaMensaje | undefined
    let content
    if (sub === 'chat')            content = <Chat ir={ir} onToast={setToast} onPerfil={irPerfil} />
    else if (sub === 'plantillas') content = <Plantillas ir={ir} onToast={setToast} />
    else                           content = <BandejaView ir={ir} onToast={setToast} onPerfil={irPerfil} />

    return (
        <>
            {content}
            {toast && (
                <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 9000 }}>
                    <Toast variant="success" title={toast} onClose={() => setToast(null)} />
                </div>
            )}
        </>
    )
}

const pageWrap: React.CSSProperties = { padding: '24px 32px 64px', maxWidth: 1280, width: '100%', margin: '0 auto', boxSizing: 'border-box' }
