// Modal de email masivo a segmentos de clientes, con plantillas y variables.
// Construido sobre el Modal genérico del design system.

import { useRef, useState } from 'react'
import { Check } from 'lucide-react'
import { Modal } from '@/design-system/components/Modal'
import { Button } from '@/design-system/components/Button'

type PlantillaKey = 'nueva' | 'oferta' | 'extrañamos' | 'gracias' | 'custom'

const PLANTILLAS: Record<PlantillaKey, { l: string; a: string; c: string }> = {
    nueva:      { l: '¡Nueva colección!',     a: '🆕 Nueva colección ya disponible en Rama Indumentaria', c: 'Hola {nombre},\n\nTenemos novedades esperándote. Entrá a nuestra tienda y descubrí las últimas piezas de la nueva colección.\n\nTe esperamos!\nEl equipo de Rama Indumentaria' },
    oferta:     { l: 'Oferta especial',       a: '🎉 Oferta exclusiva para vos, {nombre}',                c: 'Hola {nombre},\n\nQueremos premiarte por tu fidelidad. Usá el cupón VIP20 y llevate un 20% de descuento en tu próxima compra.\n\nVálido hasta el 30 de junio.\nRama Indumentaria' },
    extrañamos: { l: 'Te extrañamos',         a: 'Te extrañamos, {nombre} 💙',                            c: 'Hola {nombre},\n\nHace un tiempo que no te vemos por la tienda. Nos encantaría tenerte de vuelta.\n\nTenemos novedades y ofertas esperándote.\nRama Indumentaria' },
    gracias:    { l: 'Gracias por tu compra', a: 'Gracias por tu compra, {nombre} 🙏',                    c: 'Hola {nombre},\n\nQueremos agradecerte por elegir Rama Indumentaria. Tu apoyo hace posible lo que hacemos cada día.\n\n¡Hasta la próxima!\nEl equipo' },
    custom:     { l: 'Personalizado',         a: '',                                                       c: '' },
}

const DEST: [string, string, number][] = [
    ['todos', 'Todos los clientes', 10],
    ['vip', 'Clientes VIP', 3],
    ['recurrente', 'Recurrentes', 3],
    ['nuevo', 'Clientes nuevos', 3],
    ['inactivo', 'Inactivos', 1],
]

const VARIABLES = ['{nombre}', '{email}', '{ultima_compra}', '{total_gastado}']

interface EmailMasivoModalProps {
    isOpen:  boolean
    onClose: () => void
}

export function EmailMasivoModal({ isOpen, onClose }: EmailMasivoModalProps) {
    const [dest, setDest] = useState('todos')
    const [pl, setPl] = useState<PlantillaKey>('nueva')
    const [asunto, setAsunto] = useState(PLANTILLAS.nueva.a)
    const [cuerpo, setCuerpo] = useState(PLANTILLAS.nueva.c)
    const [enviando, setEnviando] = useState(false)
    const [enviado, setEnviado] = useState(false)
    const taRef = useRef<HTMLTextAreaElement>(null)

    const count = DEST.find(d => d[0] === dest)![2]
    const pick = (k: PlantillaKey) => { setPl(k); setAsunto(PLANTILLAS[k].a); setCuerpo(PLANTILLAS[k].c) }
    const render = (txt: string) => txt.replace(/\{nombre\}/g, 'María')

    const insertVar = (v: string) => {
        const ta = taRef.current
        if (!ta) { setCuerpo(c => c + v); return }
        const s = ta.selectionStart, e = ta.selectionEnd
        setCuerpo(c => c.slice(0, s) + v + c.slice(e))
        setTimeout(() => { ta.focus(); ta.selectionStart = ta.selectionEnd = s + v.length }, 0)
    }

    const enviar = () => { setEnviando(true); setTimeout(() => { setEnviando(false); setEnviado(true) }, 2000) }

    const inputBase: React.CSSProperties = {
        width: '100%', boxSizing: 'border-box', background: 'var(--color-bg)',
        border: '1px solid var(--color-border)', borderRadius: 8, color: 'var(--color-text)',
        fontFamily: 'inherit', outline: 'none',
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Enviar email a clientes"
            maxWidth={620}
            footer={enviado
                ? <>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--color-success)', fontWeight: 600 }}>
                        <Check size={16} strokeWidth={2.4} /> Email enviado a {count} clientes
                    </div>
                    <Button variant="outline" onClick={onClose}>Cerrar</Button>
                </>
                : <>
                    <Button variant="ghost" onClick={onClose}>Cancelar</Button>
                    <Button variant="primary" loading={enviando} onClick={enviar}>{enviando ? 'Enviando…' : `Enviar a ${count} clientes`}</Button>
                </>}
        >
            {/* Destinatarios */}
            <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-body)', display: 'block', marginBottom: 8 }}>¿A quiénes enviás?</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 16 }}>
                {DEST.map(([id, l, n]) => {
                    const a = dest === id
                    return (
                        <button key={id} onClick={() => setDest(id)} style={{ padding: 12, border: `${a ? 2 : 1}px solid ${a ? 'var(--color-primary)' : 'var(--color-border)'}`, borderRadius: 8, background: a ? 'var(--color-primary-bg)' : 'var(--color-surface)', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                {id === 'vip' && <span style={{ color: '#F59E0B' }}>★</span>}
                                <span style={{ fontSize: 12, fontWeight: a ? 600 : 500, color: a ? 'var(--color-primary)' : 'var(--color-text)' }}>{l}</span>
                            </div>
                            <span style={{ fontSize: 11, color: 'var(--color-muted)', fontFamily: '"Geist Mono", monospace' }}>{n} clientes</span>
                        </button>
                    )
                })}
            </div>

            {/* Plantillas */}
            <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-body)', display: 'block', marginBottom: 8 }}>Plantillas rápidas</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                {(Object.entries(PLANTILLAS) as [PlantillaKey, { l: string }][]).map(([k, v]) => {
                    const a = pl === k
                    return (
                        <button key={k} onClick={() => pick(k)} style={{ height: 30, padding: '0 12px', borderRadius: 9999, border: `1px solid ${a ? 'var(--color-primary)' : 'var(--color-border)'}`, background: a ? 'var(--color-primary-bg)' : 'var(--color-surface)', color: a ? 'var(--color-primary)' : 'var(--color-body)', fontSize: 12, fontWeight: a ? 600 : 500, cursor: 'pointer', fontFamily: 'inherit' }}>{v.l}</button>
                    )
                })}
            </div>

            {/* Asunto */}
            <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-body)', display: 'block', marginBottom: 6 }}>Asunto</label>
            <input value={asunto} onChange={e => setAsunto(e.target.value.slice(0, 100))} style={{ ...inputBase, height: 40, padding: '0 12px', fontSize: 13, marginBottom: 4 }} />
            <div style={{ textAlign: 'right', fontSize: 11, color: 'var(--color-subtle)', fontFamily: '"Geist Mono", monospace', marginBottom: 14 }}>{asunto.length}/100</div>

            {/* Mensaje */}
            <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-body)', display: 'block', marginBottom: 6 }}>Mensaje</label>
            <textarea ref={taRef} value={cuerpo} onChange={e => setCuerpo(e.target.value)} rows={6} style={{ ...inputBase, resize: 'vertical', minHeight: 120, padding: '10px 12px', fontSize: 13, lineHeight: 1.6 }} />
            <div style={{ fontSize: 11, color: 'var(--color-muted)', margin: '8px 0 6px' }}>Variables disponibles — hacé click para insertar</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
                {VARIABLES.map(v => (
                    <button key={v} onClick={() => insertVar(v)} style={{ height: 24, padding: '0 8px', borderRadius: 6, background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)', color: 'var(--color-body)', fontSize: 11, fontFamily: '"Geist Mono", monospace', cursor: 'pointer' }}>{v}</button>
                ))}
            </div>

            {/* Vista previa */}
            <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderTop: '3px solid var(--color-primary)', borderRadius: 10, padding: 16 }}>
                <div style={{ fontSize: 11, color: 'var(--color-muted)', marginBottom: 8 }}>Vista previa</div>
                <div style={{ fontSize: 12, color: 'var(--color-muted)', fontFamily: '"Geist Mono", monospace' }}>De: Rama Indumentaria</div>
                <div style={{ fontSize: 12, color: 'var(--color-muted)', fontFamily: '"Geist Mono", monospace', marginBottom: 8, paddingBottom: 8, borderBottom: '1px solid var(--color-border)' }}>Para: María Fernández</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)', marginBottom: 8 }}>{render(asunto) || '(sin asunto)'}</div>
                <div style={{ fontSize: 13, color: 'var(--color-body)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{render(cuerpo) || '(sin contenido)'}</div>
            </div>
        </Modal>
    )
}
