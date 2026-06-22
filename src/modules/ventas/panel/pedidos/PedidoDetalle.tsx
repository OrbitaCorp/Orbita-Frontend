// src/modules/ventas/admin/pedidos/PedidoDetalle.tsx — Vista 03
// Detalle de un pedido: productos, línea de tiempo de estado, notas y cliente.

import { useState } from 'react'
import { ChevronRight, Printer, Mail, Check } from 'lucide-react'
import { Card } from '@/design-system/components/Card'
import { Badge } from '@/design-system/components/Badge'
import { Button } from '@/design-system/components/Button'
import { Avatar } from '@/design-system/components/Avatar'
import { fmtMoney } from '@/lib/utils'
import { PedidoTabs, type VistaPedido } from './components/PedidoTabs'
import { ProductoThumb } from './components/ProductoThumb'
import { ModalComprobante } from './components/ModalComprobante'
import { ModalEmail } from './components/ModalEmail'
import { MOCK_PEDIDOS } from './mock/pedidos.mock'
import type { EstadoPedido } from './types/pedidos.types'

const ORDEN: EstadoPedido[] = ['pendiente', 'confirmado', 'preparacion', 'enviado', 'entregado']

interface PedidoDetalleProps {
    id: string
    ir: (vista: VistaPedido, id?: string) => void
}

export default function PedidoDetalle({ id, ir }: PedidoDetalleProps) {
    const pedido = MOCK_PEDIDOS.find(p => p.id === id) ?? MOCK_PEDIDOS[0]
    const [modal, setModal] = useState<null | 'comprobante' | 'email'>(null)

    const idxActual = pedido.estado === 'cancelado' ? -1 : ORDEN.indexOf(pedido.estado)
    const pasos: { label: string; done: boolean }[] = [
        { label: 'Pedido recibido', done: true },
        { label: 'Confirmado',      done: idxActual >= 1 },
        { label: 'En preparación',  done: idxActual >= 2 },
        { label: 'Enviado',         done: idxActual >= 3 },
        { label: 'Entregado',       done: idxActual >= 4 },
    ]

    return (
        <div style={pageWrap}>
            <PedidoTabs activo="detalle" ir={ir} />

            {/* Breadcrumb */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--color-muted)', marginBottom: 14 }}>
                <button onClick={() => ir('lista')} style={{ background: 'none', border: 'none', color: 'var(--color-muted)', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, padding: 0 }}>Lista</button>
                <ChevronRight size={12} />
                <span style={{ color: 'var(--color-text)', fontWeight: 500, fontFamily: '"Geist Mono", monospace' }}>#{pedido.id}</span>
            </div>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <h1 style={{ fontSize: 26, fontWeight: 700, fontFamily: '"Geist Mono", monospace', color: 'var(--color-text)', margin: 0 }}>#{pedido.id}</h1>
                    <Badge status={pedido.estado} />
                    <span style={{ fontSize: 14, color: 'var(--color-muted)' }}>{pedido.cliente}</span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <Button variant="outline" icon={<Printer size={15} />} onClick={() => setModal('comprobante')}>Imprimir</Button>
                    <Button variant="outline" icon={<Mail size={15} />} onClick={() => setModal('email')}>Email</Button>
                    <Button variant="primary">Confirmar pedido</Button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 340px', gap: 16, alignItems: 'start' }}>

                {/* Columna principal */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <Card>
                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)', marginBottom: 14 }}>Productos del pedido</div>
                        {pedido.productos.map((it, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < pedido.productos.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                                <ProductoThumb hue={it.hue} size={44} />
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text)' }}>{it.nombre}</div>
                                    <div style={{ fontSize: 12, color: 'var(--color-muted)', fontFamily: '"Geist Mono", monospace' }}>{it.cantidad} × {fmtMoney(it.precio)}</div>
                                </div>
                                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)', fontFamily: '"Geist Mono", monospace' }}>{fmtMoney(it.cantidad * it.precio)}</span>
                            </div>
                        ))}
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--color-border)' }}>
                            <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text)' }}>Total</span>
                            <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-text)', fontFamily: '"Geist Mono", monospace' }}>{fmtMoney(pedido.monto)}</span>
                        </div>
                    </Card>

                    <Card>
                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)', marginBottom: 16 }}>Estado del pedido</div>
                        {pasos.map((paso, i) => (
                            <div key={i} style={{ display: 'flex', gap: 12 }}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <div style={{ width: 26, height: 26, borderRadius: '50%', flexShrink: 0, background: paso.done ? 'var(--color-primary)' : 'var(--color-surface-alt)', color: paso.done ? '#fff' : 'var(--color-muted)', display: 'grid', placeItems: 'center' }}>
                                        {paso.done ? <Check size={13} strokeWidth={2.6} /> : <span style={{ fontSize: 11, fontWeight: 700 }}>{i + 1}</span>}
                                    </div>
                                    {i < pasos.length - 1 && <div style={{ width: 2, flex: 1, minHeight: 24, background: paso.done ? 'var(--color-primary)' : 'var(--color-border)', marginTop: 2 }} />}
                                </div>
                                <div style={{ paddingBottom: i < pasos.length - 1 ? 16 : 0 }}>
                                    <div style={{ fontSize: 13, fontWeight: paso.done ? 600 : 500, color: paso.done ? 'var(--color-text)' : 'var(--color-muted)' }}>{paso.label}</div>
                                    {paso.done && <div style={{ fontSize: 11, color: 'var(--color-muted)', fontFamily: '"Geist Mono", monospace', marginTop: 2 }}>17 may · 1{4 + i}:0{i}</div>}
                                </div>
                            </div>
                        ))}
                    </Card>

                    <Card>
                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)', marginBottom: 10 }}>Notas internas</div>
                        <textarea placeholder="Agregar nota interna…" rows={2} style={{ width: '100%', boxSizing: 'border-box', resize: 'vertical', minHeight: 52, background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8, padding: '10px 12px', fontSize: 13, color: 'var(--color-text)', fontFamily: 'inherit', outline: 'none' }} />
                        <div style={{ marginTop: 8 }}><Button variant="primary" size="sm">Guardar nota</Button></div>
                    </Card>
                </div>

                {/* Sidebar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <Card>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                            <Avatar name={pedido.cliente} size={44} />
                            <div style={{ minWidth: 0 }}>
                                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)' }}>{pedido.cliente}</div>
                                <div style={{ fontSize: 12, color: 'var(--color-muted)', fontFamily: '"Geist Mono", monospace' }}>{pedido.email}</div>
                            </div>
                        </div>
                        <Button variant="outline" size="sm" style={{ width: '100%', justifyContent: 'center' }}>Ver perfil completo →</Button>
                    </Card>
                    <Card>
                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)', marginBottom: 12 }}>Datos del pedido</div>
                        {([['Canal', pedido.canal], ['Fecha', '17 may · 14:32'], ['# Pedido', '#' + pedido.id], ['Método de pago', 'Tarjeta Visa · 4521']] as [string, string][]).map(([k, v]) => (
                            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '5px 0' }}>
                                <span style={{ color: 'var(--color-muted)' }}>{k}</span>
                                <span style={{ color: 'var(--color-text)', fontFamily: /Fecha|Pedido|Visa/.test(k) ? '"Geist Mono", monospace' : 'inherit' }}>{v}</span>
                            </div>
                        ))}
                    </Card>
                    <Card>
                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)', marginBottom: 8 }}>Entrega</div>
                        <div style={{ fontSize: 13, color: 'var(--color-muted)', marginBottom: 12 }}>Coordinar por WhatsApp</div>
                        <button style={{ width: '100%', height: 40, borderRadius: 8, border: 'none', background: 'var(--color-success-bg)', color: 'var(--color-success)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>💬 WhatsApp</button>
                    </Card>
                </div>
            </div>

            <ModalComprobante isOpen={modal === 'comprobante'} onClose={() => setModal(null)} id={pedido.id} />
            <ModalEmail isOpen={modal === 'email'} onClose={() => setModal(null)} cliente={{ nombre: pedido.cliente, email: pedido.email }} />
        </div>
    )
}

const pageWrap: React.CSSProperties = { padding: '24px 32px 64px', maxWidth: 1280, width: '100%', margin: '0 auto', boxSizing: 'border-box' }
