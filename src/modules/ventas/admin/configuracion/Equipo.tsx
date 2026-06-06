// src/modules/ventas/admin/configuracion/Equipo.tsx — Vista 17
// Miembros del equipo + modal de invitación.

import { useState } from 'react'
import { Plus, Mail } from 'lucide-react'
import { Card } from '@/design-system/components/Card'
import { Button } from '@/design-system/components/Button'
import { Avatar } from '@/design-system/components/Avatar'
import { Modal } from '@/design-system/components/Modal'
import { ConfigTabs, type VistaConfig } from './components/ConfigTabs'

interface Miembro { nombre: string; email: string; rol: string; estado: 'activo' | 'pendiente'; color: string }

const MIEMBROS: Miembro[] = [
    { nombre: 'Alexander Ibarra', email: 'alex@rama.com',   rol: 'Dueño',     estado: 'activo',     color: '#3B82F6' },
    { nombre: 'Rosa Manzano',     email: 'rosa@rama.com',   rol: 'Vendedor',  estado: 'activo',     color: '#10B981' },
    { nombre: 'Carlos Vega',      email: 'carlos@rama.com', rol: 'Vendedor',  estado: 'pendiente',  color: '#10B981' },
]

export default function Equipo({ ir, onToast }: { ir: (v: VistaConfig) => void; onToast: (m: string) => void }) {
    const [invitar, setInvitar] = useState(false)

    const inputBase: React.CSSProperties = {
        width: '100%', boxSizing: 'border-box', height: 40, padding: '0 12px',
        background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 8,
        fontSize: 14, color: 'var(--color-text)', fontFamily: 'inherit', outline: 'none',
    }

    return (
        <div style={pageWrap}>
            <ConfigTabs activo="equipo" ir={ir} />

            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--color-text)', margin: 0 }}>Equipo</h1>
                    <span style={{ display: 'inline-flex', alignItems: 'center', height: 24, padding: '0 10px', borderRadius: 9999, background: 'var(--color-surface-alt)', color: 'var(--color-muted)', fontSize: 12, fontWeight: 600 }}>3 miembros</span>
                </div>
                <Button variant="primary" icon={<Plus size={16} />} onClick={() => setInvitar(true)}>Invitar miembro</Button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {MIEMBROS.map(m => (
                    <Card key={m.email}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                            {m.estado === 'pendiente'
                                ? <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--color-surface-alt)', color: 'var(--color-muted)', display: 'grid', placeItems: 'center' }}><Mail size={18} /></div>
                                : <Avatar name={m.nombre} size={40} />}
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 14, fontWeight: 600, color: m.estado === 'pendiente' ? 'var(--color-muted)' : 'var(--color-text)' }}>{m.nombre}</div>
                                <div style={{ fontSize: 12, color: 'var(--color-muted)', fontFamily: '"Geist Mono", monospace' }}>{m.email}</div>
                            </div>
                            <span style={{ display: 'inline-flex', alignItems: 'center', height: 24, padding: '0 10px', borderRadius: 9999, background: `${m.color}1F`, color: m.color, fontSize: 12, fontWeight: 600, border: `1px solid ${m.color}33` }}>{m.rol}</span>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 24, padding: '0 10px', borderRadius: 9999, background: m.estado === 'activo' ? 'var(--color-success-bg)' : 'var(--color-warning-bg)', color: m.estado === 'activo' ? 'var(--color-success)' : 'var(--color-warning)', fontSize: 12, fontWeight: 600 }}>
                                <span style={{ width: 6, height: 6, borderRadius: '50%', background: m.estado === 'activo' ? '#10B981' : '#F59E0B' }} />
                                {m.estado === 'activo' ? 'Activo' : 'Pendiente'}
                            </span>
                        </div>
                    </Card>
                ))}
            </div>

            <Modal
                isOpen={invitar}
                onClose={() => setInvitar(false)}
                title="Invitar miembro"
                maxWidth={460}
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setInvitar(false)}>Cancelar</Button>
                        <Button variant="primary" onClick={() => { setInvitar(false); onToast('Invitación enviada') }}>Enviar invitación</Button>
                    </>
                }
            >
                <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-body)', display: 'block', marginBottom: 6 }}>Email</label>
                <input placeholder="nombre@empresa.com" style={{ ...inputBase, marginBottom: 14 }} />
                <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-body)', display: 'block', marginBottom: 6 }}>Rol</label>
                <select style={{ ...inputBase, cursor: 'pointer' }}>
                    <option>Vendedor</option>
                    <option>Administrador</option>
                    <option>Solo lectura</option>
                </select>
            </Modal>
        </div>
    )
}

const pageWrap: React.CSSProperties = { padding: '24px 32px 64px', maxWidth: 1280, width: '100%', margin: '0 auto', boxSizing: 'border-box' }
