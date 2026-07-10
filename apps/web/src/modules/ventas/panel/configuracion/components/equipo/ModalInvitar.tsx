// Modal para invitar un nuevo miembro: datos, rol, contraseña temporal y envío.

import { useState } from 'react'
import { Modal } from '@/design-system/components/Modal'
import { Button } from '@/design-system/components/Button'
import { Lbl, Err, Inp, RolRadios, PasswordField, ToggleRow } from './FormBits'
import { PERMISOS, genPassword } from '../../mock/equipo.mock'
import type { Rol, Miembro } from '../../types/equipo.types'

interface ModalInvitarProps {
    roles:    Rol[]
    existing: Miembro[]
    onClose:  () => void
    onInvite: (m: Miembro) => void
}

export function ModalInvitar({ roles, existing, onClose, onInvite }: ModalInvitarProps) {
    const [nombre, setNombre] = useState('')
    const [email, setEmail] = useState('')
    const [rol, setRol] = useState('vendedor')
    const [pwd, setPwd] = useState(genPassword())
    const [sendEmail, setSendEmail] = useState(true)
    const [err, setErr] = useState<{ nombre?: string; email?: string }>({})

    const rolObj = roles.find(r => r.id === rol) ?? roles[0]
    const permObjs = PERMISOS.filter(p => rolObj.permisos.includes(p.id))

    const submit = () => {
        const e: { nombre?: string; email?: string } = {}
        if (!nombre.trim()) e.nombre = 'Ingresá el nombre'
        if (!email.trim()) e.email = 'Ingresá el email'
        else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) e.email = 'Email inválido'
        else if (existing.some(m => m.email.toLowerCase() === email.toLowerCase())) e.email = 'Este email ya tiene acceso al panel'
        setErr(e)
        if (Object.keys(e).length) return
        onInvite({ id: 'm' + Date.now(), nombre, email, rol, estado: 'pendiente', passwordTemp: true, ultimoAcceso: null })
    }

    return (
        <Modal
            isOpen
            onClose={onClose}
            title="Invitar nuevo miembro"
            maxWidth={560}
            footer={<><Button variant="ghost" onClick={onClose}>Cancelar</Button><Button variant="primary" onClick={submit}>Enviar invitación</Button></>}
        >
            <Lbl>Nombre completo</Lbl>
            <Inp value={nombre} onChange={setNombre} placeholder="Rosa Manzano" error={!!err.nombre} autoFocus />
            {err.nombre && <Err>{err.nombre}</Err>}
            <div style={{ height: 14 }} />

            <Lbl>Email</Lbl>
            <Inp value={email} onChange={setEmail} placeholder="rosa@tutienda.com" type="email" error={!!err.email} />
            {err.email && <Err>{err.email}</Err>}
            <div style={{ height: 18 }} />

            <Lbl>Rol asignado</Lbl>
            <RolRadios roles={roles} value={rol} onChange={setRol} />
            <div style={{ marginTop: 10, padding: 12, background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>{permObjs.length} permisos incluidos</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {permObjs.slice(0, 6).map(p => <span key={p.id} style={{ fontSize: 11, padding: '3px 8px', borderRadius: 9999, background: rolObj.color + '14', color: rolObj.color }}>{p.label}</span>)}
                    {permObjs.length > 6 && <span style={{ fontSize: 11, color: 'var(--color-muted)', padding: '3px 4px' }}>+{permObjs.length - 6} más</span>}
                </div>
            </div>
            <div style={{ height: 18 }} />

            <Lbl help="El miembro deberá cambiarla en su primer acceso">Contraseña temporal</Lbl>
            <PasswordField value={pwd} onRegen={() => setPwd(genPassword())} />
            <div style={{ marginTop: 10 }}>
                <ToggleRow label="Enviar por email al miembro" help="Email con instrucciones de acceso" on={sendEmail} onChange={setSendEmail} />
            </div>
            <div style={{ marginTop: 8, padding: 12, background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 12, color: 'var(--color-muted)' }}>
                El miembro recibirá acceso con rol <strong style={{ color: 'var(--color-text)' }}>{rolObj.nombre}</strong> y deberá cambiar su contraseña en el primer acceso.
            </div>
        </Modal>
    )
}
