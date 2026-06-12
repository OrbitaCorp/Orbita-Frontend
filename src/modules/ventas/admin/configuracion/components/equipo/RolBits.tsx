// Piezas visuales del sistema de roles: chip de color y card de rol.

import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/design-system/components/Button'
import { PERMISOS } from '../../mock/equipo.mock'
import type { Rol } from '../../types/equipo.types'

export function RolChip({ rol, small }: { rol: Rol; small?: boolean }) {
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', height: small ? 20 : 24,
            padding: small ? '0 8px' : '0 10px', borderRadius: 9999,
            background: rol.color + '1F', color: rol.color, border: `1px solid ${rol.color}33`,
            fontSize: small ? 11 : 12, fontWeight: 600, whiteSpace: 'nowrap',
        }}>
            {rol.nombre}
        </span>
    )
}

interface RolCardProps {
    r:        Rol
    onEdit:   () => void
    onDelete: () => void
}

export function RolCard({ r, onEdit, onDelete }: RolCardProps) {
    const permObjs = PERMISOS.filter(p => r.permisos.includes(p.id))
    return (
        <div style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 14, overflow: 'hidden' }}>
            <div style={{ height: 4, background: r.color }} />
            <div style={{ padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <RolChip rol={r} />
                    {r.esDefault && <span style={{ height: 22, padding: '0 8px', borderRadius: 9999, background: 'var(--color-surface-alt)', color: 'var(--color-muted)', fontSize: 10, fontWeight: 600, display: 'inline-flex', alignItems: 'center' }}>Predeterminado</span>}
                </div>
                <div style={{ fontSize: 13, color: 'var(--color-muted)', lineHeight: 1.5, marginTop: 8 }}>{r.descripcion}</div>
                <div style={{ fontSize: 12, color: 'var(--color-muted)', fontFamily: '"Geist Mono", monospace', marginTop: 10 }}>{r.miembros} {r.miembros === 1 ? 'miembro' : 'miembros'}</div>

                <div style={{ marginTop: 14 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Permisos incluidos</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {permObjs.slice(0, 4).map(p => (
                            <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <CheckCircle2 size={13} strokeWidth={1.8} style={{ color: r.color, flexShrink: 0 }} />
                                <span style={{ fontSize: 12, color: 'var(--color-body)' }}>{p.label}</span>
                            </div>
                        ))}
                        {permObjs.length > 4 && <span style={{ fontSize: 11, color: 'var(--color-primary)', fontWeight: 500 }}>+ {permObjs.length - 4} más</span>}
                    </div>
                </div>

                <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                    {r.esDefault
                        ? <Button variant="outline" size="sm" onClick={onEdit}>Ver permisos</Button>
                        : <>
                            <Button variant="outline" size="sm" onClick={onEdit}>Editar rol</Button>
                            <Button variant="outline" size="sm" onClick={onDelete} style={{ color: 'var(--color-error)', borderColor: 'var(--color-error)' }}>Eliminar</Button>
                        </>}
                </div>
            </div>
        </div>
    )
}
