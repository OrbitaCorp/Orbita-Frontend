// Modal para enviar email a un miembro del equipo, con plantillas y variables.

import { useRef, useState } from 'react'
import { Send } from 'lucide-react'
import { Modal } from '@/design-system/components/Modal'
import { Button } from '@/design-system/components/Button'
import { Lbl, Inp } from './FormBits'
import type { Miembro } from '../../types/equipo.types'

type PlantillaKey = 'bienvenida' | 'recordatorio' | 'password' | 'libre'

const PLANTILLAS: Record<PlantillaKey, { l: string; a: string; c: string }> = {
    bienvenida:   { l: 'Bienvenida al equipo',    a: '¡Bienvenido/a a Rama Indumentaria!', c: 'Hola {nombre},\n\nTe damos la bienvenida al equipo de {tienda}. Tu rol es {rol}.\n\n¡Que tengas excelentes ventas!' },
    recordatorio: { l: 'Recordatorio de acceso',  a: 'Recordatorio: acceso al panel',      c: 'Hola {nombre},\n\nTe recordamos que tenés acceso al panel de {tienda} con el email {email}.' },
    password:     { l: 'Cambio de contraseña',    a: 'Tu contraseña temporal',             c: 'Hola {nombre},\n\nTu contraseña temporal es: {password_temp}\n\nDeberás cambiarla en tu primer acceso.' },
    libre:        { l: 'Mensaje libre',           a: '',                                    c: '' },
}

const VARIABLES = ['{nombre}', '{email}', '{tienda}', '{rol}', '{password_temp}']

interface ModalEmailMiembroProps {
    miembro: Miembro
    onClose: () => void
    onSend:  (email: string) => void
}

export function ModalEmailMiembro({ miembro, onClose, onSend }: ModalEmailMiembroProps) {
    const [pl, setPl] = useState<PlantillaKey>('bienvenida')
    const [asunto, setAsunto] = useState(PLANTILLAS.bienvenida.a)
    const [cuerpo, setCuerpo] = useState(PLANTILLAS.bienvenida.c)
    const taRef = useRef<HTMLTextAreaElement>(null)

    const pick = (k: PlantillaKey) => { setPl(k); setAsunto(PLANTILLAS[k].a); setCuerpo(PLANTILLAS[k].c) }

    const insertVar = (v: string) => {
        const ta = taRef.current
        if (!ta) { setCuerpo(c => c + v); return }
        const s = ta.selectionStart, e = ta.selectionEnd
        setCuerpo(c => c.slice(0, s) + v + c.slice(e))
        setTimeout(() => { ta.focus(); ta.selectionStart = ta.selectionEnd = s + v.length }, 0)
    }

    return (
        <Modal
            isOpen
            onClose={onClose}
            title={`Enviar email a ${miembro.nombre}`}
            maxWidth={520}
            footer={<><Button variant="ghost" onClick={onClose}>Cancelar</Button><Button variant="primary" icon={<Send size={15} />} onClick={() => onSend(miembro.email)}>Enviar email</Button></>}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <span style={{ fontSize: 12, color: 'var(--color-muted)' }}>Para:</span>
                <span style={{ height: 26, padding: '0 10px', borderRadius: 9999, background: 'var(--color-surface-alt)', color: 'var(--color-body)', fontSize: 12, fontFamily: '"Geist Mono", monospace', display: 'inline-flex', alignItems: 'center' }}>{miembro.email}</span>
            </div>

            <Lbl>Plantilla</Lbl>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
                {(Object.entries(PLANTILLAS) as [PlantillaKey, { l: string }][]).map(([k, v]) => {
                    const a = pl === k
                    return <button key={k} onClick={() => pick(k)} style={{ padding: '10px 12px', borderRadius: 8, border: `1px solid ${a ? 'var(--color-primary)' : 'var(--color-border)'}`, background: a ? 'var(--color-primary-bg)' : 'var(--color-bg)', color: a ? 'var(--color-primary)' : 'var(--color-body)', fontSize: 13, fontWeight: a ? 600 : 500, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>{v.l}</button>
                })}
            </div>

            <Lbl>Asunto</Lbl>
            <Inp value={asunto} onChange={setAsunto} />
            <div style={{ height: 14 }} />

            <Lbl>Mensaje</Lbl>
            <textarea ref={taRef} value={cuerpo} onChange={e => setCuerpo(e.target.value)} rows={6} style={{ width: '100%', boxSizing: 'border-box', resize: 'vertical', minHeight: 120, background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 8, padding: '10px 12px', fontSize: 13, color: 'var(--color-text)', fontFamily: 'inherit', outline: 'none', lineHeight: 1.6 }} />
            <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: 11, color: 'var(--color-subtle)', marginTop: 4, fontFamily: '"Geist Mono", monospace' }}>{cuerpo.length} caracteres</div>

            <div style={{ marginTop: 8 }}>
                <div style={{ fontSize: 11, color: 'var(--color-muted)', marginBottom: 6 }}>Hacé click para insertar:</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {VARIABLES.map(v => <button key={v} onClick={() => insertVar(v)} style={{ height: 24, padding: '0 8px', borderRadius: 6, background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)', color: 'var(--color-body)', fontSize: 11, fontFamily: '"Geist Mono", monospace', cursor: 'pointer' }}>{v}</button>)}
                </div>
            </div>
        </Modal>
    )
}
