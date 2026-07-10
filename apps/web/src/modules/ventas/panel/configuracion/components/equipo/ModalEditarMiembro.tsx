// Modal de edición de un miembro con pestañas: información, permisos y actividad.

import { useEffect, useState } from 'react'
import { Shield, ChevronDown } from 'lucide-react'
import { Modal } from '@/design-system/components/Modal'
import { Button } from '@/design-system/components/Button'
import { Avatar } from '@/design-system/components/Avatar'
import { Lbl, Inp, RolRadios, PasswordField, ToggleRow, Toggle } from './FormBits'
import { PERMISOS, GRUPOS, genPassword } from '../../mock/equipo.mock'
import type { Rol, Miembro, GrupoPermiso } from '../../types/equipo.types'

type TabKey = 'info' | 'permisos' | 'actividad'

const ACTIVIDAD: [string, string, string][] = [
    ['Inicio de sesión desde Buenos Aires · Chrome', 'Hoy 14:32', 'var(--color-success)'],
    ['Creó el pedido #1282', 'Hoy 11:45', 'var(--color-primary)'],
    ['Confirmó el pedido #1281', 'Ayer 17:20', 'var(--color-primary)'],
    ['Inicio de sesión desde Buenos Aires', 'Ayer 09:02', 'var(--color-success)'],
    ['Se unió al equipo', '12 abr 2026', 'var(--color-muted)'],
]

interface ModalEditarMiembroProps {
    miembro: Miembro
    roles:   Rol[]
    onClose: () => void
    onSave:  (m: Miembro) => void
    onToast: (msg: string) => void
}

export function ModalEditarMiembro({ miembro, roles, onClose, onSave, onToast }: ModalEditarMiembroProps) {
    const [tab, setTab] = useState<TabKey>('info')
    const [nombre, setNombre] = useState(miembro.nombre)
    const [email, setEmail] = useState(miembro.email)
    const [rol, setRol] = useState(miembro.rol)
    const [pwd, setPwd] = useState(genPassword())
    const [sendEmail, setSendEmail] = useState(true)
    const [perms, setPerms] = useState<string[]>(roles.find(r => r.id === miembro.rol)?.permisos ?? [])
    const [openGroups, setOpenGroups] = useState<Partial<Record<GrupoPermiso, boolean>>>({ Pedidos: true })
    const isDueno = miembro.rol === 'dueno'

    useEffect(() => { setPerms(roles.find(r => r.id === rol)?.permisos ?? []) }, [rol, roles])

    const togglePerm = (id: string) => setPerms(ps => ps.includes(id) ? ps.filter(x => x !== id) : [...ps, id])

    return (
        <Modal
            isOpen
            onClose={onClose}
            title={`Editar: ${miembro.nombre}`}
            maxWidth={520}
            footer={<><Button variant="ghost" onClick={onClose}>Cancelar</Button><Button variant="primary" onClick={() => onSave({ ...miembro, nombre, email, rol })}>Guardar cambios</Button></>}
        >
            {/* Encabezado con avatar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <Avatar name={miembro.nombre} size={44} />
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text)' }}>{miembro.nombre}</div>
                    <div style={{ fontSize: 12, color: 'var(--color-muted)', fontFamily: '"Geist Mono", monospace' }}>{miembro.email}</div>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--color-border)', marginBottom: 18 }}>
                {([['info', 'Información'], ['permisos', 'Permisos'], ['actividad', 'Actividad']] as [TabKey, string][]).map(([id, l]) => {
                    const a = tab === id
                    return <button key={id} onClick={() => setTab(id)} style={{ padding: '10px 4px', marginRight: 16, border: 'none', background: 'transparent', color: a ? 'var(--color-primary)' : 'var(--color-muted)', fontSize: 14, fontWeight: a ? 600 : 500, cursor: 'pointer', fontFamily: 'inherit', borderBottom: `2px solid ${a ? 'var(--color-primary)' : 'transparent'}`, marginBottom: -1 }}>{l}</button>
                })}
            </div>

            {tab === 'info' && (
                <div>
                    <Lbl>Nombre</Lbl><Inp value={nombre} onChange={setNombre} />
                    <div style={{ height: 14 }} />
                    <Lbl>Email</Lbl><Inp value={email} onChange={isDueno ? undefined : setEmail} />
                    <div style={{ height: 18 }} />
                    <Lbl>Rol</Lbl><RolRadios roles={roles} value={rol} onChange={isDueno ? () => undefined : setRol} />
                    <div style={{ marginTop: 18, background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 10, padding: 16 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)' }}>Resetear contraseña</div>
                        <div style={{ fontSize: 12, color: 'var(--color-muted)', margin: '2px 0 12px' }}>Se generará una contraseña temporal que el miembro deberá cambiar.</div>
                        <PasswordField value={pwd} onRegen={() => setPwd(genPassword())} />
                        <div style={{ marginTop: 8 }}><ToggleRow label="Enviar por email" on={sendEmail} onChange={setSendEmail} /></div>
                        <button onClick={() => onToast(sendEmail ? `Contraseña reseteada · Email enviado a ${email}` : `Contraseña reseteada · ${pwd}`)} style={{ marginTop: 6, height: 36, padding: '0 14px', borderRadius: 8, background: 'transparent', border: '1px solid var(--color-border)', color: 'var(--color-warning)', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>Resetear contraseña</button>
                    </div>
                </div>
            )}

            {tab === 'permisos' && (isDueno ? (
                <div style={{ padding: 16, background: 'var(--color-primary-bg)', border: '1px solid var(--color-primary)', borderRadius: 10, fontSize: 13, color: 'var(--color-primary)', display: 'flex', gap: 10, alignItems: 'center' }}>
                    <Shield size={18} strokeWidth={1.6} /> Los permisos del Dueño no se pueden modificar.
                </div>
            ) : (
                <div>
                    <Lbl>Rol base</Lbl><RolRadios roles={roles} value={rol} onChange={setRol} />
                    <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {GRUPOS.map(g => {
                            const gp = PERMISOS.filter(p => p.grupo === g)
                            const act = gp.filter(p => perms.includes(p.id)).length
                            const open = openGroups[g]
                            return (
                                <div key={g} style={{ border: '1px solid var(--color-border)', borderRadius: 8, overflow: 'hidden' }}>
                                    <button onClick={() => setOpenGroups(o => ({ ...o, [g]: !o[g] }))} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', border: 'none', background: 'var(--color-surface)', cursor: 'pointer', fontFamily: 'inherit' }}>
                                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)', flex: 1, textAlign: 'left' }}>{g}</span>
                                        <span style={{ fontSize: 11, fontFamily: '"Geist Mono", monospace', color: 'var(--color-muted)' }}>{act}/{gp.length}</span>
                                        <ChevronDown size={14} strokeWidth={1.6} style={{ color: 'var(--color-muted)', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 200ms' }} />
                                    </button>
                                    {open && (
                                        <div style={{ padding: 8 }}>
                                            {gp.map(p => (
                                                <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 6px', cursor: 'pointer' }}>
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <div style={{ fontSize: 13, color: 'var(--color-text)' }}>{p.label}</div>
                                                        <div style={{ fontSize: 11, color: 'var(--color-muted)' }}>{p.desc}</div>
                                                    </div>
                                                    <Toggle on={perms.includes(p.id)} onChange={() => togglePerm(p.id)} />
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                    <div style={{ marginTop: 12, padding: 12, background: 'var(--color-warning-bg)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 12, color: 'var(--color-warning)' }}>Los cambios de permisos se aplican inmediatamente.</div>
                </div>
            ))}

            {tab === 'actividad' && (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {ACTIVIDAD.map(([txt, fc, col], i, arr) => (
                        <div key={i} style={{ display: 'flex', gap: 12, paddingBottom: i < arr.length - 1 ? 16 : 0 }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <span style={{ width: 10, height: 10, borderRadius: '50%', background: col, flexShrink: 0, marginTop: 3 }} />
                                {i < arr.length - 1 && <span style={{ width: 2, flex: 1, background: 'var(--color-border)', marginTop: 4 }} />}
                            </div>
                            <div style={{ flex: 1, paddingBottom: 4 }}>
                                <div style={{ fontSize: 13, color: 'var(--color-text)' }}>{txt}</div>
                                <div style={{ fontSize: 11, color: 'var(--color-muted)', fontFamily: '"Geist Mono", monospace', marginTop: 2 }}>{fc}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </Modal>
    )
}
