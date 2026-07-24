// Modal de email masivo a segmentos de clientes, con plantillas y variables.
// Construido sobre el Modal genérico del design system.

import { useEffect, useRef, useState } from 'react'
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
    // (Fase 2 — Alex) Si me pasan los destinatarios reales y la función de
    // envío, el modal manda emails DE VERDAD (a la lista filtrada, con las
    // variables completadas por persona en el backend). Sin estos datos sigue
    // funcionando como muestra, para no romper nada.
    negocio?:       string
    destinatarios?: { id: string; nombre: string; email: string }[]
    onEnviar?:      (ids: string[], asunto: string, cuerpo: string) => Promise<number>
}

export function EmailMasivoModal({ isOpen, onClose, negocio, destinatarios, onEnviar }: EmailMasivoModalProps) {
    const marca = negocio ?? 'Rama Indumentaria'
    const conMarca = (t: string) => t.replace(/Rama Indumentaria/g, marca)
    const esReal = !!(destinatarios && onEnviar)

    const [dest, setDest] = useState('todos')
    const [pl, setPl] = useState<PlantillaKey>('nueva')
    const [asunto, setAsunto] = useState(() => conMarca(PLANTILLAS.nueva.a))
    const [cuerpo, setCuerpo] = useState(() => conMarca(PLANTILLAS.nueva.c))
    const [enviando, setEnviando] = useState(false)
    const [enviado, setEnviado] = useState(false)
    const [enviadosReal, setEnviadosReal] = useState<number | null>(null)
    const [errorEnvio, setErrorEnvio] = useState<string | null>(null)
    const taRef = useRef<HTMLTextAreaElement>(null)

    const count = destinatarios ? destinatarios.length : DEST.find(d => d[0] === dest)![2]
    const pick = (k: PlantillaKey) => { setPl(k); setAsunto(conMarca(PLANTILLAS[k].a)); setCuerpo(conMarca(PLANTILLAS[k].c)) }
    const nombreEjemplo = destinatarios?.[0]?.nombre?.split(' ')[0] ?? 'María'
    const render = (txt: string) => txt.replace(/\{nombre\}/g, nombreEjemplo)

    // Cada vez que se abre, arranca una redacción fresca con el nombre del
    // negocio ya cargado (y limpia el resultado del envío anterior).
    useEffect(() => {
        if (!isOpen) return
        setEnviado(false)
        setEnviadosReal(null)
        setErrorEnvio(null)
        setAsunto(conMarca(PLANTILLAS[pl].a))
        setCuerpo(conMarca(PLANTILLAS[pl].c))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen])

    const insertVar = (v: string) => {
        const ta = taRef.current
        if (!ta) { setCuerpo(c => c + v); return }
        const s = ta.selectionStart, e = ta.selectionEnd
        setCuerpo(c => c.slice(0, s) + v + c.slice(e))
        setTimeout(() => { ta.focus(); ta.selectionStart = ta.selectionEnd = s + v.length }, 0)
    }

    // Con datos reales manda por el backend y cuenta cuántos salieron;
    // en modo muestra solo simula.
    const enviar = () => {
        if (destinatarios && onEnviar) {
            setEnviando(true)
            setErrorEnvio(null)
            onEnviar(destinatarios.map(d => d.id), asunto, cuerpo)
                .then(n => { setEnviadosReal(n); setEnviado(true) })
                .catch(() => setErrorEnvio('No se pudieron enviar los emails. Probá de nuevo.'))
                .finally(() => setEnviando(false))
            return
        }
        setEnviando(true); setTimeout(() => { setEnviando(false); setEnviado(true) }, 2000)
    }

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
                        <Check size={16} strokeWidth={2.4} /> Email enviado a {enviadosReal ?? count} clientes
                    </div>
                    <Button variant="outline" onClick={onClose}>Cerrar</Button>
                </>
                : <>
                    <Button variant="ghost" onClick={onClose}>Cancelar</Button>
                    <Button variant="primary" loading={enviando} disabled={count === 0} onClick={enviar}>{enviando ? 'Enviando…' : count === 0 ? 'Sin destinatarios' : `Enviar a ${count} cliente${count === 1 ? '' : 's'}`}</Button>
                </>}
        >
            {/* Mismo arreglo que en el modal de roles: el contenido es más alto que
                la pantalla en ventanas chicas, así que se desliza acá adentro y el
                título y los botones quedan siempre a la vista. */}
            <div style={{ maxHeight: '58vh', overflowY: 'auto', paddingRight: 6 }}>
            {/* Destinatarios */}
            <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-body)', display: 'block', marginBottom: 8 }}>¿A quiénes enviás?</label>
            {esReal ? (
                <div style={{ padding: '10px 14px', border: '1px solid var(--color-primary)', background: 'var(--color-primary-bg)', borderRadius: 8, marginBottom: 16, fontSize: 13, color: 'var(--color-text)' }}>
                    A los <strong>{count}</strong> clientes de la lista filtrada que tienen email.
                </div>
            ) : (
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
            )}

            {errorEnvio && (
                <div style={{ marginBottom: 12, padding: '10px 12px', borderRadius: 8, background: 'var(--color-error-bg)', fontSize: 13, color: 'var(--color-error)' }}>{errorEnvio}</div>
            )}

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
                <div style={{ fontSize: 12, color: 'var(--color-muted)', fontFamily: '"Geist Mono", monospace' }}>De: {marca}</div>
                <div style={{ fontSize: 12, color: 'var(--color-muted)', fontFamily: '"Geist Mono", monospace', marginBottom: 8, paddingBottom: 8, borderBottom: '1px solid var(--color-border)' }}>Para: {destinatarios?.[0]?.nombre ?? 'María Fernández'}{count > 1 ? ` (+${count - 1} más)` : ''}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)', marginBottom: 8 }}>{render(asunto) || '(sin asunto)'}</div>
                <div style={{ fontSize: 13, color: 'var(--color-body)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{render(cuerpo) || '(sin contenido)'}</div>
            </div>
            </div>
        </Modal>
    )
}
