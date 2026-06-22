// Panel de chat con un cliente — reutilizado por la Bandeja (V28) y el Chat full (V29).

import { useEffect, useRef, useState } from 'react'
import { FileText, Package, Paperclip, Send } from 'lucide-react'
import { Avatar } from '@/design-system/components/Avatar'
import { Button } from '@/design-system/components/Button'
import { CHAT_MSGS, type ChatMsg } from '../mock/mensajes.mock'

interface ChatPanelProps {
    onToast:   (m: string) => void
    onPerfil:  () => void
    full?:     boolean
}

export function ChatPanel({ onToast, onPerfil, full }: ChatPanelProps) {
    const [msgs, setMsgs] = useState<ChatMsg[]>(CHAT_MSGS)
    const [draft, setDraft] = useState('')
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight }, [msgs])

    const send = (txt?: string) => {
        const m = (txt ?? draft).trim()
        if (!m) return
        setMsgs(x => [...x, { from: 'me', txt: m, hora: '14:32' }])
        setDraft('')
        onToast('Mensaje enviado')
    }

    const iconBtn: React.CSSProperties = { width: 32, height: 32, borderRadius: 6, border: 'none', background: 'transparent', color: 'var(--color-muted)', cursor: 'pointer', display: 'grid', placeItems: 'center' }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: full ? 'calc(100vh - 240px)' : 560, background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 12, overflow: 'hidden' }}>
            {/* Header */}
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <Avatar name="María Fernández" size={36} />
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)' }}>María Fernández</div>
                    <div style={{ fontSize: 11, color: 'var(--color-muted)', fontFamily: '"Geist Mono", monospace' }}>maria.f@gmail.com</div>
                </div>
                <Button variant="outline" size="sm" onClick={onPerfil}>Ver perfil</Button>
            </div>

            {/* Mensajes */}
            <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: 18, display: 'flex', flexDirection: 'column', gap: 10, background: 'var(--color-surface)' }}>
                {msgs.map((m, i) => {
                    const me = m.from === 'me'
                    return (
                        <div key={i} style={{ alignSelf: me ? 'flex-end' : 'flex-start', maxWidth: '72%' }}>
                            <div style={{ padding: '10px 13px', borderRadius: 12, background: me ? 'var(--color-primary-bg)' : 'var(--color-bg)', border: `1px solid ${me ? 'var(--color-primary)' : 'var(--color-border)'}`, color: 'var(--color-text)', fontSize: 13.5, lineHeight: 1.5, borderBottomRightRadius: me ? 4 : 12, borderBottomLeftRadius: me ? 12 : 4 }}>{m.txt}</div>
                            <div style={{ fontSize: 10, color: 'var(--color-muted)', fontFamily: '"Geist Mono", monospace', marginTop: 3, textAlign: me ? 'right' : 'left' }}>{m.hora}</div>
                        </div>
                    )
                })}
            </div>

            {/* Composer */}
            <div style={{ padding: '8px 12px', borderTop: '1px solid var(--color-border)', display: 'flex', gap: 6, alignItems: 'center' }}>
                <button title="Plantilla" onClick={() => send('Hola María! Tu pedido #1284 fue confirmado 😊')} style={iconBtn}><FileText size={16} /></button>
                <button title="Tracking" onClick={() => setDraft('Tu código de seguimiento es: AR3489573')} style={iconBtn}><Package size={16} /></button>
                <button title="Adjuntar" onClick={() => onToast('Comprobante adjuntado')} style={iconBtn}><Paperclip size={16} /></button>
                <input value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') send() }} placeholder="Escribí un mensaje…" style={{ flex: 1, height: 40, padding: '0 12px', background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)', borderRadius: 10, fontSize: 13, color: 'var(--color-text)', fontFamily: 'inherit', outline: 'none' }} />
                <button onClick={() => send()} style={{ width: 40, height: 40, borderRadius: 10, border: 'none', background: draft.trim() ? 'var(--color-primary)' : 'var(--color-surface-alt)', color: draft.trim() ? '#fff' : 'var(--color-subtle)', cursor: draft.trim() ? 'pointer' : 'default', display: 'grid', placeItems: 'center' }}><Send size={16} strokeWidth={1.8} /></button>
            </div>
        </div>
    )
}
