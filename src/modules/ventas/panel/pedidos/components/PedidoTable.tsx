// Tabla de pedidos con selección múltiple y barra de acciones masivas.
// La usan PedidoLista (V02) y PedidoHistorial (V05).

import { useState } from 'react'
import { FileText, Mail, X } from 'lucide-react'
import { Avatar } from '@/design-system/components/Avatar'
import { Badge } from '@/design-system/components/Badge'
import { Button } from '@/design-system/components/Button'
import { fmtMoney } from '@/lib/utils'
import type { Pedido } from '../types/pedidos.types'

const COLS = '36px 90px 1.3fr 1.6fr 112px 120px 148px 140px 96px'

function fechaCorta(iso: string): string {
    const d = new Date(iso)
    const m = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
    return `${d.getDate()} ${m[d.getMonth()]} · ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

interface PedidoTableProps {
    rows:           Pedido[]
    onRowClick:     (p: Pedido) => void
    onComprobante:  (p: Pedido) => void
    onEmail:        (p: Pedido) => void
}

export function PedidoTable({ rows, onRowClick, onComprobante, onEmail }: PedidoTableProps) {
    const [sel,     setSel]     = useState<Set<string>>(new Set())
    const [hovered, setHovered] = useState<string | null>(null)

    const toggle = (id: string) => setSel(s => {
        const n = new Set(s)
        n.has(id) ? n.delete(id) : n.add(id)
        return n
    })

    const canalChip = (canal: Pedido['canal']) => (
        <span style={{
            display: 'inline-flex', alignItems: 'center', height: 22, padding: '0 10px',
            borderRadius: 9999, fontSize: 11, fontWeight: 600,
            background: canal === 'Online' ? 'var(--color-primary-bg)' : 'var(--color-warning-bg)',
            color:      canal === 'Online' ? 'var(--color-primary)'    : 'var(--color-warning)',
        }}>
            {canal}
        </span>
    )

    return (
        <div style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 12, overflow: 'hidden' }}>

            {/* Barra de selección masiva */}
            {sel.size > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', background: 'var(--color-primary-bg)', borderBottom: '1px solid var(--color-border)' }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-primary)', fontFamily: '"Geist Mono", monospace' }}>{sel.size} seleccionados</span>
                    <div style={{ flex: 1 }} />
                    <Button variant="outline" size="sm">Confirmar</Button>
                    <Button variant="outline" size="sm">Imprimir etiquetas</Button>
                    <Button variant="outline" size="sm">Email masivo</Button>
                    <button onClick={() => setSel(new Set())} style={{ width: 28, height: 28, borderRadius: 6, border: 'none', background: 'transparent', color: 'var(--color-muted)', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
                        <X size={14} strokeWidth={1.8} />
                    </button>
                </div>
            )}

            {/* Encabezado */}
            <div style={{ display: 'grid', gridTemplateColumns: COLS, columnGap: 16, alignItems: 'center', padding: '0 16px', height: 44, background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', fontSize: 11, fontWeight: 600, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                <input
                    type="checkbox"
                    checked={sel.size === rows.length && rows.length > 0}
                    onChange={() => setSel(sel.size === rows.length ? new Set() : new Set(rows.map(r => r.id)))}
                    style={{ width: 15, height: 15, accentColor: 'var(--color-primary)' }}
                />
                <span># Pedido</span><span>Cliente</span><span>Productos</span><span>Canal</span><span>Monto</span><span>Estado</span><span>Fecha</span>
                <span style={{ textAlign: 'right' }}>Acciones</span>
            </div>

            {/* Filas */}
            {rows.map((p, i) => {
                const s = sel.has(p.id)
                return (
                    <div
                        key={p.id}
                        onClick={() => onRowClick(p)}
                        onMouseEnter={() => setHovered(p.id)}
                        onMouseLeave={() => setHovered(null)}
                        style={{
                            display: 'grid', gridTemplateColumns: COLS, columnGap: 16, alignItems: 'center',
                            padding: '0 16px', height: 52,
                            borderBottom: i < rows.length - 1 ? '1px solid var(--color-border)' : 'none',
                            background: s ? 'var(--color-primary-bg)' : hovered === p.id ? 'var(--color-surface)' : 'transparent',
                            cursor: 'pointer', transition: 'background 150ms',
                        }}
                    >
                        <input
                            type="checkbox"
                            checked={s}
                            onClick={e => e.stopPropagation()}
                            onChange={() => toggle(p.id)}
                            style={{ width: 15, height: 15, accentColor: 'var(--color-primary)' }}
                        />
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)', fontFamily: '"Geist Mono", monospace' }}>#{p.id}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                            <Avatar name={p.cliente} size={26} />
                            <div style={{ minWidth: 0 }}>
                                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.cliente}</div>
                                <div style={{ fontSize: 11, color: 'var(--color-subtle)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.email}</div>
                            </div>
                        </div>
                        <span style={{ fontSize: 12, color: 'var(--color-body)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {p.productos.map(x => `${x.cantidad}× ${x.nombre}`).join(' · ')}
                        </span>
                        {canalChip(p.canal)}
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)', fontFamily: '"Geist Mono", monospace' }}>{fmtMoney(p.monto)}</span>
                        <Badge status={p.estado} size="sm" />
                        <span style={{ fontSize: 11, color: 'var(--color-muted)', fontFamily: '"Geist Mono", monospace' }}>{fechaCorta(p.fecha)}</span>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }} onClick={e => e.stopPropagation()}>
                            <button title="Comprobante" onClick={() => onComprobante(p)} style={iconBtn}><FileText size={15} /></button>
                            <button title="Email" onClick={() => onEmail(p)} style={iconBtn}><Mail size={15} /></button>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

const iconBtn: React.CSSProperties = {
    width: 28, height: 28, borderRadius: 6, border: 'none', background: 'transparent',
    color: 'var(--color-muted)', cursor: 'pointer', display: 'grid', placeItems: 'center',
}
