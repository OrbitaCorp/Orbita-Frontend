// src/modules/ventas/panel/pedidos/ColaPreparacion.tsx — Vista 08
// Tablero kanban del flujo de preparación: a preparar → listo → despachado.

import { useState } from 'react'
import { Eye } from 'lucide-react'
import { Button } from '@/design-system/components/Button'
import { Avatar } from '@/design-system/components/Avatar'
import { fmtMoney } from '@/lib/utils'
import { PedidoTabs, type VistaPedido } from './components/PedidoTabs'
import { MOCK_PEDIDOS, MOCK_COLA_INICIAL } from './mock/pedidos.mock'
import type { EtapaCola, Pedido } from './types/pedidos.types'

const byId = (id: string) => MOCK_PEDIDOS.find(p => p.id === id)!

const COLUMNAS: { id: EtapaCola; label: string; color: string; next: EtapaCola | null; btn: string | null }[] = [
    { id: 'preparar',   label: 'A preparar',            color: '#F59E0B', next: 'listo',      btn: 'Marcar como listo'     },
    { id: 'listo',      label: 'Listo para despachar',  color: '#3B82F6', next: 'despachado', btn: 'Marcar como despachado' },
    { id: 'despachado', label: 'Despachado / Entregado', color: '#10B981', next: null,         btn: null                     },
]

function horaCorta(iso: string) {
    const d = new Date(iso)
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

interface ColaPreparacionProps {
    ir:      (vista: VistaPedido, id?: string) => void
    onToast: (msg: string) => void
}

export default function ColaPreparacion({ ir, onToast }: ColaPreparacionProps) {
    const [cols, setCols] = useState<Record<EtapaCola, Pedido[]>>({
        preparar:   MOCK_COLA_INICIAL.preparar.map(byId),
        listo:      MOCK_COLA_INICIAL.listo.map(byId),
        despachado: MOCK_COLA_INICIAL.despachado.map(byId),
    })

    const mover = (from: EtapaCola, to: EtapaCola, p: Pedido) => {
        setCols(c => ({ ...c, [from]: c[from].filter(x => x.id !== p.id), [to]: [...c[to], p] }))
        onToast(`Pedido #${p.id} ${to === 'listo' ? 'listo para despachar' : 'despachado'}`)
    }

    return (
        <div style={pageWrap}>
            <PedidoTabs activo="cola" ir={ir} />
            <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--color-text)', margin: '0 0 20px' }}>Cola de preparación</h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, alignItems: 'start' }}>
                {COLUMNAS.map(col => {
                    const list = cols[col.id]
                    const subtotal = list.reduce((s, p) => s + p.monto, 0)
                    return (
                        <section key={col.id} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderTop: `3px solid ${col.color}`, borderRadius: 12, padding: 12, minHeight: 400 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, padding: '2px 4px' }}>
                                <span style={{ width: 8, height: 8, borderRadius: '50%', background: col.color }} />
                                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)' }}>{col.label}</span>
                                <span style={{ fontSize: 11, fontWeight: 600, padding: '1px 7px', borderRadius: 9999, background: 'var(--color-bg)', color: 'var(--color-muted)', border: '1px solid var(--color-border)', fontFamily: '"Geist Mono", monospace' }}>{list.length}</span>
                            </div>
                            <div style={{ padding: '0 4px 10px', fontSize: 11, color: 'var(--color-muted)', fontFamily: '"Geist Mono", monospace' }}>Total: {fmtMoney(subtotal)}</div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {list.length === 0 ? (
                                    <div style={{ border: '1px dashed var(--color-border)', borderRadius: 8, padding: '24px 12px', textAlign: 'center', fontSize: 12, color: 'var(--color-muted)' }}>Sin pedidos en esta etapa</div>
                                ) : list.map(p => (
                                    <div key={p.id} style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 10, padding: 12 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text)', fontFamily: '"Geist Mono", monospace' }}>#{p.id}</span>
                                            <div style={{ flex: 1 }} />
                                            <span style={{ fontSize: 11, color: 'var(--color-muted)', fontFamily: '"Geist Mono", monospace' }}>{horaCorta(p.fecha)}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                            <Avatar name={p.cliente} size={24} />
                                            <span style={{ fontSize: 13, color: 'var(--color-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.cliente}</span>
                                        </div>
                                        <div style={{ fontSize: 12, color: 'var(--color-body)', marginBottom: 10 }}>
                                            {p.productos.map((x, j) => (
                                                <div key={j}><span style={{ fontFamily: '"Geist Mono", monospace', color: 'var(--color-muted)' }}>{x.cantidad}×</span> {x.nombre}</div>
                                            ))}
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTop: '1px solid var(--color-border)', marginBottom: col.next ? 10 : 0 }}>
                                            <span style={{ display: 'inline-flex', alignItems: 'center', height: 20, padding: '0 8px', borderRadius: 9999, background: 'var(--color-surface-alt)', color: 'var(--color-muted)', fontSize: 10, fontWeight: 600 }}>{p.canal}</span>
                                            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)', fontFamily: '"Geist Mono", monospace' }}>{fmtMoney(p.monto)}</span>
                                        </div>
                                        {col.next && col.btn && (
                                            <div style={{ display: 'flex', gap: 6 }}>
                                                <Button variant="primary" size="sm" style={{ flex: 1, justifyContent: 'center' }} onClick={() => mover(col.id, col.next!, p)}>{col.btn}</Button>
                                                <button onClick={() => ir('detalle', p.id)} style={{ width: 32, height: 32, borderRadius: 6, border: '1px solid var(--color-border)', background: 'transparent', color: 'var(--color-muted)', cursor: 'pointer', display: 'grid', placeItems: 'center' }}><Eye size={15} /></button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>
                    )
                })}
            </div>
        </div>
    )
}

const pageWrap: React.CSSProperties = { padding: '24px 32px 64px', maxWidth: 1280, width: '100%', margin: '0 auto', boxSizing: 'border-box' }
